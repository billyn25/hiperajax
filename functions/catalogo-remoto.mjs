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

function detectarSeparador(cabecera) {
  const candidatos = [";", "\t", ","];
  return candidatos
    .map((sep) => ({ sep, n: String(cabecera || "").split(sep).length }))
    .sort((a, b) => b.n - a.n)[0].sep;
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

async function reducirCatalogoAjaxStream(response) {
  if (!response.body) throw new Error("El proveedor no devolvió contenido");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let textoInicial = "";
  let separador = null;
  let campo = "";
  let fila = [];
  let entreComillas = false;
  let cabecera = null;
  let columnas = null;
  let totalLeido = 0;
  const vistas = new Set();
  const salida = ["name;brand;pvp;description;image"];

  function prepararColumnas(header) {
    return {
      idxRef: buscarColumna(header, [
        "name", "nombre", "referencia", "ref", "codigo", "codigoarticulo", "sku", "productcode"
      ], 0),
      idxMarca: buscarColumna(header, ["brand", "marca", "fabricante", "manufacturer"]),
      idxPvp: buscarColumna(header, ["pvp", "precio", "price", "importe", "tarifa", "precioiva", "rrp"]),
      idxDesc: buscarColumna(header, [
        "description", "descripcion", "detalle", "texto", "productdescription", "nombreproducto"
      ]),
      idxImage: buscarColumna(header, [
        "image", "imagen", "foto", "photourl", "imageurl", "urlimagen", "mainimage"
      ]),
    };
  }

  function procesarFila(actual) {
    if (!cabecera) {
      cabecera = actual;
      columnas = prepararColumnas(cabecera);
      if (columnas.idxRef < 0) throw new Error("No se encontró la columna de referencia");
      return;
    }

    const ref = String(actual[columnas.idxRef] ?? "").trim();
    if (!ref) return;

    const marca = columnas.idxMarca >= 0 ? String(actual[columnas.idxMarca] ?? "").trim() : "";
    const refMayus = ref.toUpperCase();
    const esAjax = normalizar(marca) === "ajax" || refMayus.startsWith("AJ-") || refMayus.startsWith("10XAJ-");
    if (!esAjax || vistas.has(refMayus)) return;
    vistas.add(refMayus);

    salida.push([
      ref,
      marca || "Ajax",
      columnas.idxPvp >= 0 ? actual[columnas.idxPvp] ?? "" : "",
      columnas.idxDesc >= 0 ? actual[columnas.idxDesc] ?? "" : "",
      columnas.idxImage >= 0 ? actual[columnas.idxImage] ?? "" : "",
    ].map(escaparCSV).join(";"));
  }

  function consumir(texto) {
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];

      if (entreComillas) {
        if (c === '"') {
          if (texto[i + 1] === '"') {
            campo += '"';
            i++;
          } else {
            entreComillas = false;
          }
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
        campo = "";
        if (fila.some((v) => String(v).trim() !== "")) procesarFila(fila);
        fila = [];
      } else {
        campo += c;
      }
    }
  }

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    totalLeido += value.byteLength;
    const trozo = decoder.decode(value, { stream: true });

    if (!separador) {
      textoInicial += trozo;
      const salto = textoInicial.indexOf("\n");
      if (salto < 0) {
        if (textoInicial.length > 65536) throw new Error("Cabecera CSV no reconocible");
        continue;
      }
      separador = detectarSeparador(textoInicial.slice(0, salto).replace(/^\uFEFF/, ""));
      consumir(textoInicial.replace(/^\uFEFF/, ""));
      textoInicial = "";
    } else {
      consumir(trozo);
    }
  }

  const resto = decoder.decode();
  if (resto) consumir(resto);
  if (!separador && textoInicial) {
    separador = detectarSeparador(textoInicial.replace(/^\uFEFF/, ""));
    consumir(textoInicial.replace(/^\uFEFF/, ""));
  }

  if (campo.length || fila.length) {
    fila.push(campo.replace(/\r$/, ""));
    if (fila.some((v) => String(v).trim() !== "")) procesarFila(fila);
  }

  if (!cabecera) throw new Error("CSV remoto sin cabecera");
  if (salida.length === 1) throw new Error("No se encontraron productos Ajax en el CSV remoto");

  return {
    csv: salida.join("\n"),
    productos: salida.length - 1,
    bytesLeidos: totalLeido,
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
        "User-Agent": "HiperAjax-CatalogUpdater/1.2",
        Accept: "text/csv,text/plain,*/*",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) throw new Error(`Proveedor HTTP ${response.status}`);
    const reducido = await reducirCatalogoAjaxStream(response);

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=900, s-maxage=900",
        "X-HiperAjax-Products": String(reducido.productos),
        "X-HiperAjax-Source": "visiotech-stream-filtered",
        "X-HiperAjax-Downloaded-Bytes": String(reducido.bytesLeidos),
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
