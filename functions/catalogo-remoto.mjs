import { methodNotAllowed } from "./http.mjs";

const CSV_URL = process.env.VISIOTECH_CSV_URL ||
  "https://www.visiotechsecurity.com/?option=com_csvgeneration&task=generate.generateCSV&token=f0c2ca3f651701e268d6c841f0dd7e3c&username=VT8502AAK";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function normalizar(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function detectarSeparador(texto) {
  const primera = String(texto || "").replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] || "";
  const candidatos = [";", "\t", ","];
  return candidatos
    .map(sep => ({ sep, n: primera.split(sep).length }))
    .sort((a, b) => b.n - a.n)[0].sep;
}

// Parser CSV pequeño pero completo: respeta comillas, separadores y saltos dentro de campos.
function parseCSV(texto, separador) {
  const filas = [];
  let fila = [];
  let campo = "";
  let entreComillas = false;
  const s = String(texto || "").replace(/^\uFEFF/, "");

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (entreComillas) {
      if (c === '"' && s[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (c === '"') {
        entreComillas = false;
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      entreComillas = true;
    } else if (c === separador) {
      fila.push(campo);
      campo = "";
    } else if (c === "\n") {
      fila.push(campo.replace(/\r$/, ""));
      if (fila.some(v => String(v).trim() !== "")) filas.push(fila);
      fila = [];
      campo = "";
    } else {
      campo += c;
    }
  }

  fila.push(campo.replace(/\r$/, ""));
  if (fila.some(v => String(v).trim() !== "")) filas.push(fila);
  return filas;
}

function buscarColumna(cabecera, alias, fallback = -1) {
  const normalizada = cabecera.map(normalizar);
  for (const nombre of alias) {
    const idx = normalizada.indexOf(normalizar(nombre));
    if (idx >= 0) return idx;
  }
  return fallback;
}

function escaparCSV(value) {
  const s = String(value ?? "").replace(/\r?\n/g, " ").trim();
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function reducirCatalogoAjax(csvCompleto) {
  const separador = detectarSeparador(csvCompleto);
  const filas = parseCSV(csvCompleto, separador);
  if (filas.length < 2) throw new Error("CSV remoto sin filas suficientes");

  const cabecera = filas[0];
  const idxRef = buscarColumna(cabecera, [
    "name", "nombre", "referencia", "ref", "codigo", "codigoarticulo", "sku", "productcode"
  ], 0);
  const idxMarca = buscarColumna(cabecera, [
    "brand", "marca", "fabricante", "manufacturer"
  ]);
  const idxPvp = buscarColumna(cabecera, [
    "pvp", "precio", "price", "importe", "tarifa", "precioiva", "rrp"
  ]);
  const idxDesc = buscarColumna(cabecera, [
    "description", "descripcion", "detalle", "texto", "productdescription", "nombreproducto"
  ]);
  const idxImage = buscarColumna(cabecera, [
    "image", "imagen", "foto", "photourl", "imageurl", "urlimagen", "mainimage"
  ]);

  if (idxRef < 0) throw new Error("No se encontró la columna de referencia");

  const salida = [["name", "brand", "pvp", "description", "image"]];
  const vistas = new Set();

  for (const fila of filas.slice(1)) {
    const ref = String(fila[idxRef] ?? "").trim();
    if (!ref) continue;
    const marca = idxMarca >= 0 ? String(fila[idxMarca] ?? "").trim() : "";
    const refMayus = ref.toUpperCase();
    const esAjax = normalizar(marca) === "ajax" || refMayus.startsWith("AJ-") || refMayus.startsWith("10XAJ-");
    if (!esAjax) continue;

    const clave = refMayus;
    if (vistas.has(clave)) continue;
    vistas.add(clave);

    salida.push([
      ref,
      marca || "Ajax",
      idxPvp >= 0 ? fila[idxPvp] ?? "" : "",
      idxDesc >= 0 ? fila[idxDesc] ?? "" : "",
      idxImage >= 0 ? fila[idxImage] ?? "" : "",
    ]);
  }

  if (salida.length === 1) {
    throw new Error("El CSV se descargó, pero no se encontraron productos Ajax");
  }

  return {
    csv: salida.map(f => f.map(escaparCSV).join(";")).join("\n"),
    productos: salida.length - 1,
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    const response = methodNotAllowed(["GET", "OPTIONS"]);
    return { ...response, headers: { ...response.headers, ...CORS_HEADERS } };
  }

  try {
    const response = await fetch(CSV_URL, {
      headers: {
        "User-Agent": "HiperAjax-CatalogUpdater/1.1",
        Accept: "text/csv,text/plain,*/*",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) throw new Error(`Proveedor HTTP ${response.status}`);
    const csvCompleto = await response.text();
    if (!csvCompleto || csvCompleto.trim().length < 20) throw new Error("CSV remoto vacío");

    const reducido = reducirCatalogoAjax(csvCompleto);
    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=900",
        "X-HiperAjax-Products": String(reducido.productos),
        "X-HiperAjax-Source": "visiotech-filtered",
      },
      body: reducido.csv,
    };
  } catch (error) {
    console.error("[catalogo-remoto]", error);
    return {
      statusCode: 502,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        ok: false,
        error: "No se pudo preparar el catálogo remoto Ajax",
        detalle: String(error?.message || error),
      }),
    };
  }
}
