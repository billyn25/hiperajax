import { Readable } from "node:stream";
import { parse } from "csv-parse";
import { methodNotAllowed } from "./http.mjs";

const CSV_URL = process.env.VISIOTECH_CSV_URL ||
  "https://www.visiotechsecurity.com/?option=com_csvgeneration&task=generate.generateCSV&token=f0c2ca3f651701e268d6c841f0dd7e3c&username=VT8502AAK";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Expose-Headers": "Age, Cache-Status, X-NF-Cache, X-HiperAjax-Products, X-HiperAjax-Source, X-HiperAjax-Time-Ms, X-HiperAjax-Generated-At, X-HiperAjax-Products-With-Cost, X-HiperAjax-Cost-Field",
};

function decodeHtmlEntities(value) {
  const named = {
    amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ",
    euro: "€", aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
    Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
    ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü"
  };
  return String(value || "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const hex = entity[1]?.toLowerCase() === "x";
      const number = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : match;
    }
    return Object.prototype.hasOwnProperty.call(named, entity) ? named[entity] : match;
  });
}

function limpiarDescripcion(html) {
  let text = String(html || "")
    .replace(/<\s*br\s*\/?>/gi, " · ")
    .replace(/<\s*\/\s*(li|p|div|tr|h[1-6])\s*>/gi, " · ")
    .replace(/<\s*li\b[^>]*>/gi, "")
    .replace(/<[^>]*>/g, " ");

  text = decodeHtmlEntities(text)
    .replace(/\s*·\s*/g, " · ")
    .replace(/(?:\s*·\s*){2,}/g, " · ")
    .replace(/\s+/g, " ")
    .replace(/^\s*(?:Ajax\s*·\s*)+/i, "")
    .replace(/^\s*·\s*|\s*·\s*$/g, "")
    .trim();

  return text;
}


function normalizarClave(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function filaNormalizada(row) {
  const out = {};
  for (const [key, value] of Object.entries(row || {})) {
    out[normalizarClave(key)] = value;
  }
  return out;
}

function primerValor(row, aliases) {
  for (const alias of aliases) {
    const value = row[normalizarClave(alias)];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return "";
}

function escaparCSV(value) {
  const text = String(value ?? "").replace(/[\r\n]+/g, " ").trim();
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function crearCatalogoAjax(response) {
  if (!response.body) throw new Error("El proveedor no devolvió contenido");

  const products = new Map();
  let totalRows = 0;
  let productsWithCost = 0;
  let detectedCostField = "";

  const parser = Readable.fromWeb(response.body).pipe(parse({
    delimiter: ";",
    columns: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: false,
  }));

  for await (const originalRow of parser) {
    totalRows += 1;
    const row = filaNormalizada(originalRow);
    const name = String(primerValor(row, ["name", "reference", "referencia", "codigo", "sku"])).trim();
    const brand = String(primerValor(row, ["brand", "marca", "manufacturer", "fabricante"])).trim();
    if (!name || brand.toUpperCase() !== "AJAX") continue;

    const key = name.toUpperCase();
    if (products.has(key)) continue;

    // Único campo válido para el coste real de compra.
    const costField = "precionetocompra";
    const cost = row[costField] !== undefined && row[costField] !== null
      ? String(row[costField]).trim()
      : "";
    if (cost && !detectedCostField) detectedCostField = "precio_neto_compra";
    if (cost) productsWithCost += 1;

    products.set(key, {
      name,
      brand: "Ajax",
      pvp: String(primerValor(row, ["PVP", "recommended_retail_price", "retail_price", "precio_venta", "tarifa"])).trim(),
      description: limpiarDescripcion(primerValor(row, ["description", "descripcion"])),
      short_description: limpiarDescripcion(primerValor(row, ["short_description", "shortDescription", "short_desc", "description_short", "descripcion_corta"])),
      image: String(primerValor(row, ["image_path", "image", "imagen", "photo_url"])).trim(),
      stock: String(primerValor(row, ["stock_label", "stock", "quantity", "available_stock", "stock_available", "existencias"])).trim(),
      cost,
    });
  }

  if (!products.size) throw new Error("No se encontraron productos AJAX en el CSV remoto");

  const lines = ["name;brand;pvp;description;short_description;image;stock;cost"];
  const sorted = [...products.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  for (const product of sorted) {
    lines.push([
      product.name,
      product.brand,
      product.pvp,
      product.description,
      product.short_description,
      product.image,
      product.stock,
      product.cost,
    ].map(escaparCSV).join(";"));
  }

  return { csv: lines.join("\n"), products: sorted.length, totalRows, productsWithCost, detectedCostField };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    const response = methodNotAllowed(["GET", "OPTIONS"]);
    return { ...response, headers: { ...response.headers, ...CORS_HEADERS } };
  }

  const startedAt = Date.now();
  try {
    const response = await fetch(CSV_URL, {
      headers: {
        "User-Agent": "HiperAjax-CatalogUpdater/2.0",
        Accept: "text/csv,text/plain,*/*",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) throw new Error(`Proveedor HTTP ${response.status}`);
    const result = await crearCatalogoAjax(response);
    const elapsedMs = Date.now() - startedAt;

    console.log(`[catalogo-remoto] ${result.products} AJAX de ${result.totalRows} filas en ${elapsedMs} ms`);

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=28800, stale-while-revalidate=900",
        "X-HiperAjax-Products": String(result.products),
        "X-HiperAjax-Source": "visiotech-csv-parse-stream",
        "X-HiperAjax-Time-Ms": String(elapsedMs),
        "X-HiperAjax-Generated-At": new Date().toISOString(),
        "X-HiperAjax-Products-With-Cost": String(result.productsWithCost),
        "X-HiperAjax-Cost-Field": result.detectedCostField || "none",
      },
      body: result.csv,
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
