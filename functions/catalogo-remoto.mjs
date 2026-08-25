import { Readable } from "node:stream";
import { parse } from "csv-parse";
import { methodNotAllowed } from "./http.mjs";

const CSV_URL = process.env.VISIOTECH_CSV_URL ||
  "https://www.visiotechsecurity.com/?option=com_csvgeneration&task=generate.generateCSV&token=f0c2ca3f651701e268d6c841f0dd7e3c&username=VT8502AAK";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Expose-Headers": "Age, Cache-Status, X-NF-Cache, X-HiperAjax-Products, X-HiperAjax-Source, X-HiperAjax-Time-Ms, X-HiperAjax-Generated-At, X-HiperAjax-Products-With-Cost, X-HiperAjax-Cost-Field, X-HiperAjax-CSV-Headers, X-HiperAjax-Category-Fields, X-HiperAjax-Ajax-Classified, X-HiperAjax-Filter-Fields",
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


const FILTER_FIELDS = [
  { key: "product_type", aliases: ["product_type", "producttype", "tipo_producto", "tipoproducto", "type", "tipo", "product_group", "grupoproducto"] },
  { key: "series", aliases: ["series", "serie", "product_series", "productseries", "gama", "range"] },
  { key: "technology", aliases: ["technology", "tecnologia", "tecnología", "radio_technology", "radiotechnology", "tecnologia_deteccion", "tecnologiadeteccion", "detection_technology", "detectiontechnology"] },
  { key: "protocol", aliases: ["protocol", "protocolo", "communication_protocol", "communicationprotocol", "protocolo_comunicacion"] },
  { key: "color", aliases: ["color", "colour", "finish", "acabado", "color_producto"] },
  { key: "connectivity", aliases: ["connectivity", "conectividad", "connection", "conexion", "conexión", "communications", "comunicaciones"] },
  { key: "resolution", aliases: ["resolution", "resolucion", "resolución", "resolucion_maxima", "resolucionmaxima", "max_resolution", "maximum_resolution", "megapixels", "megapixeles", "mp"] },
  { key: "environment", aliases: ["environment", "entorno", "installation", "instalacion", "instalación", "indoor_outdoor", "indooroutdoor", "interior_exterior", "interiorexterior", "use_environment", "uso", "use", "aplicacion", "aplicación"] },
  { key: "photo", aliases: ["photo", "foto", "image_capture", "imagecapture", "captura_imagen", "capturaimagen", "photosensor", "fotosensor"] },
  { key: "poe", aliases: ["poe", "power_over_ethernet", "poweroverethernet"] },
  { key: "wifi", aliases: ["wifi", "wi_fi", "wireless_lan", "wirelesslan", "wlan"] },
  { key: "lte_4g", aliases: ["lte_4g", "lte4g", "4g_lte", "4glte", "lte", "4g", "gsm"] },
  { key: "compatibility", aliases: ["compatibility", "compatibilidad", "compatible_with", "compatiblewith", "compatible_con"] },
  { key: "channels", aliases: ["channels", "canales", "ports", "puertos", "number_of_channels", "numberofchannels"] },
  { key: "lens", aliases: ["lens", "lente", "tipo_lente", "tipolente", "focal_length", "focallength", "distancia_focal", "optics", "optica", "óptica"] },
  { key: "mounting", aliases: ["mounting", "montaje", "mount", "soporte", "installation_type", "installationtype", "tipo_instalacion"] },
  { key: "power", aliases: ["power", "alimentacion", "alimentación", "voltage", "voltaje", "power_supply", "powersupply", "fuente_alimentacion"] },
  { key: "order", aliases: ["order", "orden", "sort_order", "sortorder", "priority", "prioridad"] },
];

const OUTPUT_FIELDS = [
  "name", "brand", "pvp", "description", "short_description", "image", "stock", "precio_neto_compra",
  "category", "family", "subcategory", "related_products",
  ...FILTER_FIELDS.map((field) => field.key), "attributes_json"
];

const NON_FILTER_HEADER = /(name|nombre|reference|referencia|codigo|code|sku|brand|marca|manufacturer|fabricante|description|descripcion|shortdesc|image|imagen|photo(url|path)?|url|link|document|manual|datasheet|ficha|price|precio|pvp|tarifa|cost|coste|neto|stock|quantity|cantidad|existencia|ean|upc|isbn|weight|peso|height|alto|width|ancho|depth|profundidad|dimension|package|embalaje|minimo|minimum|tax|iva)/;
const FILTER_HEADER_HINT = /(color|colour|finish|acabado|technology|tecnologia|protocol|protocolo|connect|conect|wifi|wlan|wireless|lte|4g|gsm|poe|resolution|resolucion|megapixel|lens|lente|focal|indoor|outdoor|interior|exterior|environment|entorno|uso|use|aplicacion|compat|channel|canal|port|puerto|mount|montaje|power|aliment|voltage|voltaje|battery|bateria|autonomia|audio|video|sensor|detector|deteccion|detection|pir|format|formato|type|tipo|series|serie|range|gama|frequency|frecuencia|alcance|distancia|angle|angulo|tamper|mascota|pet|sensitivity|sensibilidad|protection|proteccion|iprating|grado|certification|certificacion|temperature|temperatura|humidity|humedad|wdr|onvif|ir|night|noche|radio|jeweller|wings|fibra|ethernet|sim|memory|memoria|storage|almacenamiento)/;

function limpiarValorFiltro(value) {
  const text = limpiarDescripcion(value).replace(/\s+/g, " ").trim();
  if (!text || /^(?:-|--|n\/?a|none|null|undefined|no disponible|sin especificar)$/i.test(text)) return "";
  return text.length <= 240 ? text : "";
}

function leerCamposFiltro(row) {
  const result = {};
  for (const field of FILTER_FIELDS) {
    result[field.key] = limpiarValorFiltro(primerValor(row, field.aliases));
  }
  return result;
}

function cabecerasReservadas(classificationFields = {}) {
  const keys = new Set([
    ...OUTPUT_FIELDS.map(normalizarClave),
    ...FILTER_FIELDS.flatMap((field) => field.aliases.map(normalizarClave)),
    "name", "reference", "referencia", "codigo", "sku", "brand", "marca", "manufacturer", "fabricante",
    "pvp", "recommendedretailprice", "retailprice", "precioventa", "tarifa", "description", "descripcion",
    "shortdescription", "shortdesc", "descriptionshort", "descripcioncorta", "imagepath", "image", "imagen", "photourl",
    "stocklabel", "stock", "quantity", "availablestock", "stockavailable", "existencias", "precionetocompra",
    "relatedproducts", "related", "productosrelacionados",
  ]);
  Object.values(classificationFields || {}).forEach((value) => {
    if (typeof value === "string" && value) keys.add(normalizarClave(value));
    if (Array.isArray(value)) value.forEach((item) => keys.add(normalizarClave(item)));
  });
  return keys;
}

function leerAtributosDinamicos(row, headers, reserved) {
  const attributes = {};
  for (const originalHeader of headers || []) {
    const key = normalizarClave(originalHeader);
    if (!key || reserved.has(key) || NON_FILTER_HEADER.test(key) || !FILTER_HEADER_HINT.test(key)) continue;
    const value = limpiarValorFiltro(row[key]);
    if (value) attributes[String(originalHeader).trim() || key] = value;
  }
  return attributes;
}



function dividirRutaClasificacion(value) {
  return limpiarDescripcion(value)
    .split(/\s*(?:>|›|»|\/|\||::)\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function detectarCamposClasificacion(headers = []) {
  const normalized = headers.map((original) => ({ original, key: normalizarClave(original) }));
  const exact = (aliases) => normalized.find((item) => aliases.includes(item.key))?.key || "";

  const parent = exact([
    "categoryparent", "parentcategory", "categoriapadre", "parentcategoria",
    "categoryparentname", "parentcategoryname"
  ]);
  const category = exact([
    "category", "categoria", "categoryname", "categorianame"
  ]);
  const family = exact([
    "family", "familia", "productfamily", "familiaproducto"
  ]);
  const subcategory = exact([
    "subcategory", "subcategoria", "subfamily", "subfamilia",
    "subcategoryname", "subcategorianame"
  ]);
  const path = exact([
    "categorypath", "categories", "categorias", "breadcrumb", "breadcrumbs",
    "categorytree", "categoryroute", "ruta", "rutacategoria"
  ]);

  const candidates = normalized
    .filter((item) => /(category|categoria|family|familia|breadcrumb|ruta)/.test(item.key))
    .map((item) => item.original);

  return { parent, category, family, subcategory, path, candidates };
}

function valoresClasificacion(row, fields = {}) {
  const value = (field, aliases = []) => {
    if (field && row[field] !== undefined && String(row[field]).trim() !== "") return row[field];
    return primerValor(row, aliases);
  };

  const parent = limpiarDescripcion(value(fields.parent, [
    "category_parent", "categoryparent", "parent_category", "categoria_padre", "categoriapadre"
  ]));
  const category = limpiarDescripcion(value(fields.category, [
    "category", "categoria", "category_name", "categoria_nombre"
  ]));
  const family = limpiarDescripcion(value(fields.family, ["family", "familia"]));
  const subcategory = limpiarDescripcion(value(fields.subcategory, ["subcategory", "subcategoria", "subfamily", "subfamilia"]));
  const path = dividirRutaClasificacion(value(fields.path, [
    "category_path", "categories", "categorias", "breadcrumb", "breadcrumbs", "category_tree"
  ]));

  if (path.length >= 3) return { category: path[0], family: path[1], subcategory: path.slice(2).join(" › ") };
  if (path.length === 2) return { category: path[0], family: path[1], subcategory: subcategory || "" };
  if (path.length === 1 && !category && !parent) return { category: path[0], family: family || "General", subcategory };

  if (parent && category && parent.toLowerCase() !== category.toLowerCase()) {
    return { category: parent, family: category, subcategory: subcategory || family || "" };
  }
  if (category) return { category, family: family || "General", subcategory };
  if (parent) return { category: parent, family: family || "General", subcategory };
  if (family) return { category: family, family: subcategory || "General", subcategory: "" };
  return { category: "", family: "", subcategory: "" };
}

function numeroMonedaProveedor(value) {
  let text = decodeHtmlEntities(String(value ?? ""))
    .replace(/<[^>]*>/g, " ")
    .replace(/ /g, " ")
    .replace(/[^0-9,.-]/g, "")
    .trim();
  if (!text) return 0;

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  if (lastComma > lastDot) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma && lastComma >= 0) {
    text = text.replace(/,/g, "");
  } else if (lastComma >= 0) {
    text = text.replace(",", ".");
  }

  const number = Number.parseFloat(text);
  return Number.isFinite(number) ? number : 0;
}

function escaparCSV(value) {
  const text = String(value ?? "").replace(/[\r\n]+/g, " ").trim();
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function textoClasificacionProveedor(classification = {}) {
  return normalizarClave([
    classification.category,
    classification.family,
    classification.subcategory,
  ].filter(Boolean).join(" "));
}

function esDiscoSurveillance(classification = {}) {
  const text = textoClasificacionProveedor(classification);
  return /almacenamiento|storage/.test(text)
    && /discoduro|discosduros|surveillance|harddrive|hdd/.test(text);
}

function esTarjetaSD(classification = {}) {
  const text = textoClasificacionProveedor(classification);
  return /almacenamiento|storage/.test(text)
    && /tarjetassd|tarjetasd|microsd|sdcard|memorycard/.test(text);
}

function esPilaAlimentacion(classification = {}, row = {}, name = "") {
  const branch = textoClasificacionProveedor(classification);
  if (!/bateriasypilas/.test(branch)) return false;

  const productText = normalizarClave([
    name,
    primerValor(row, ["short_description", "shortDescription", "short_desc", "descripcion_corta"]),
    primerValor(row, ["description", "descripcion"]),
    primerValor(row, ["product_type", "producttype", "tipo_producto", "tipo"]),
  ].filter(Boolean).join(" "));

  // Solo pilas/celdas: no packs, kits, cajas ni módulos de batería.
  const excluded = /batterybox|batterykit|batterypack|batteryholder|batterycase|powerbank|acumulador|accumulator|modulobateria|batterymodule/.test(productText);
  const cell = /pila|pilas|batterycell|coincell|buttoncell|battcr|cr\d{3,4}[a-z]?|lr\d+[a-z]?|er\d+[a-z]?|batt(?:aa|aaa|aaaa|9v)/.test(productText);
  return cell && !excluded;
}

function esFuenteAlimentador(classification = {}) {
  const text = textoClasificacionProveedor(classification);
  return /fuentesyalimentadores|fuentealimentador|powersupplies|powersupply/.test(text);
}

function esSAI(classification = {}) {
  const levels = [
    classification.category,
    classification.family,
    classification.subcategory,
  ].map(normalizarClave).filter(Boolean);

  return levels.some(value =>
    value === "sai" || value === "sais" || value === "ups"
    || value.endsWith("sais") || value.endsWith("ups")
    || /sistemasdealimentacionininterrumpida/.test(value)
  );
}

function esSwitchNoGestionable(classification = {}) {
  const text = textoClasificacionProveedor(classification);
  return /switching|switches/.test(text)
    && /nogestionable|unmanaged/.test(text);
}

function esRackPared(classification = {}, name = "") {
  const text = textoClasificacionProveedor(classification);
  if (!/racks?|armariosrack/.test(text)) return false;

  const ref = normalizarClave(name);
  return /rackwall/.test(ref) || /lockbox\d+usl/.test(ref);
}

function esBarreraInfrarroja(classification = {}) {
  const text = textoClasificacionProveedor(classification);
  return /intrusion/.test(text)
    && /barrerainfrarroja|barrerasinfrarrojas|infraredbarrier|photobeam/.test(text);
}


function esInyectorPoE(classification = {}, row = {}, name = "") {
  const branch = textoClasificacionProveedor(classification);
  if (!/networking|accesorios/.test(branch) || !/poe/.test(branch)) return false;
  const productText = normalizarClave([
    name,
    primerValor(row, ["short_description", "shortDescription", "short_desc", "descripcion_corta"]),
    primerValor(row, ["description", "descripcion"]),
    primerValor(row, ["product_type", "producttype", "tipo_producto", "tipo"]),
  ].filter(Boolean).join(" "));
  return /inyectorpoe|poeinjector|injectorpoe/.test(productText);
}

function esRouterMovil(classification = {}) {
  const branch = textoClasificacionProveedor(classification);
  return /networking|routing/.test(branch)
    && /routers?3g4g5g|routers?3g|routers?4g|routers?5g|3g4g5g/.test(branch);
}

function esSoporteCCTVSeleccionado(name = "") {
  const ref = String(name || "").trim().toUpperCase();
  return ref === "DS-1280ZJ-XS"
    || ref === "DS-1280ZJ-XS-B"
    || ref === "DS-1280ZJ-XS-W"
    || ref === "JBOX-118-WHITE"
    || ref === "JBOX-118-BLACK";
}

async function crearCatalogoAjax(response) {
  if (!response.body) throw new Error("El proveedor no devolvió contenido");

  const products = new Map();
  let totalRows = 0;
  let productsWithCost = 0;
  let detectedCostField = "";
  let csvHeaders = [];
  let classificationFields = null;
  let ajaxClassified = 0;
  let reservedFilterHeaders = new Set();
  const filterFieldsFound = new Set();
  const classificationSamples = [];

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
    if (!csvHeaders.length) {
      csvHeaders = Object.keys(originalRow || {});
      classificationFields = detectarCamposClasificacion(csvHeaders);
      reservedFilterHeaders = cabecerasReservadas(classificationFields);
      console.log("[catalogo-remoto] encabezados CSV:", csvHeaders);
      console.log("[catalogo-remoto] campos de clasificación detectados:", classificationFields);
    }
    const row = filaNormalizada(originalRow);
    const name = String(primerValor(row, ["name", "reference", "referencia", "codigo", "sku"])).trim();
    const brand = String(primerValor(row, ["brand", "marca", "manufacturer", "fabricante"])).trim();
    if (!name) continue;

    // La clasificación se evalúa ANTES del filtro Ajax.
    // Las familias extra se conservan por jerarquía para admitir productos futuros.
    const classification = valoresClasificacion(row, classificationFields || {});
    const isAjax = brand.toUpperCase() === "AJAX";
    const isSurveillanceDrive = esDiscoSurveillance(classification);
    const isSdCard = esTarjetaSD(classification);
    const isBatteryCell = esPilaAlimentacion(classification, row, name);
    const isPowerSupply = esFuenteAlimentador(classification);
    const isUps = esSAI(classification);
    const isUnmanagedSwitch = esSwitchNoGestionable(classification);
    const isWallRack = esRackPared(classification, name);
    const isInfraredBarrier = esBarreraInfrarroja(classification);
    const isPoeInjector = esInyectorPoE(classification, row, name);
    const isMobileRouter = esRouterMovil(classification);
    const isSelectedCctvSupport = esSoporteCCTVSeleccionado(name);

    const isExtraSupplierProduct = isSurveillanceDrive || isSdCard
      || isBatteryCell || isPowerSupply || isUps
      || isUnmanagedSwitch || isWallRack || isInfraredBarrier
      || isPoeInjector || isMobileRouter || isSelectedCctvSupport;

    if (!isAjax && !isExtraSupplierProduct) continue;

    const key = name.toUpperCase();
    if (products.has(key)) continue;

    // Único campo válido para el coste real de compra.
    const costField = "precionetocompra";
    const cost = numeroMonedaProveedor(row[costField]);
    if (cost > 0 && !detectedCostField) detectedCostField = "precio_neto_compra";
    if (cost > 0) productsWithCost += 1;
    if (isAjax && classification.category) ajaxClassified += 1;
    if (classificationSamples.length < 5) {
      classificationSamples.push({
        name,
        parent: classificationFields?.parent ? row[classificationFields.parent] : "",
        category: classificationFields?.category ? row[classificationFields.category] : "",
        family: classificationFields?.family ? row[classificationFields.family] : "",
        subcategory: classificationFields?.subcategory ? row[classificationFields.subcategory] : "",
        path: classificationFields?.path ? row[classificationFields.path] : "",
        result: classification,
      });
    }

    const filterValues = leerCamposFiltro(row);
    const dynamicAttributes = leerAtributosDinamicos(row, csvHeaders, reservedFilterHeaders);
    Object.entries(filterValues).forEach(([field, value]) => { if (value) filterFieldsFound.add(field); });
    Object.keys(dynamicAttributes).forEach((field) => filterFieldsFound.add(field));

    products.set(key, {
      name,
      brand: isAjax ? "Ajax" : (brand || "Proveedor"),
      pvp: String(primerValor(row, ["PVP", "recommended_retail_price", "retail_price", "precio_venta", "tarifa"])).trim(),
      description: limpiarDescripcion(primerValor(row, ["description", "descripcion"])),
      short_description: limpiarDescripcion(primerValor(row, ["short_description", "shortDescription", "short_desc", "description_short", "descripcion_corta"])),
      image: String(primerValor(row, ["image_path", "image", "imagen", "photo_url"])).trim(),
      stock: String(primerValor(row, ["stock_label", "stock", "quantity", "available_stock", "stock_available", "existencias"])).trim(),
      precio_neto_compra: cost,
      category: classification.category,
      family: classification.family,
      subcategory: classification.subcategory,
      related_products: String(primerValor(row, [
        "related_products", "relatedproducts", "related",
        "productos_relacionados", "productosrelacionados"
      ])).trim(),
      ...filterValues,
      attributes_json: Object.keys(dynamicAttributes).length ? JSON.stringify(dynamicAttributes) : "",
    });
  }

  if (!products.size) throw new Error("No se encontraron productos compatibles en el CSV remoto");

  const lines = [OUTPUT_FIELDS.join(";")];
  const sorted = [...products.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  for (const product of sorted) {
    lines.push(OUTPUT_FIELDS.map((field) => product[field] ?? "").map(escaparCSV).join(";"));
  }

  console.log("[catalogo-remoto] muestras AJAX de clasificación:", classificationSamples);
  console.log(`[catalogo-remoto] AJAX clasificados: ${ajaxClassified}/${sorted.length}`);

  return {
    csv: lines.join("\n"),
    products: sorted.length,
    totalRows,
    productsWithCost,
    detectedCostField,
    ajaxClassified,
    csvHeaders,
    classificationFields: classificationFields || {},
    filterFields: [...filterFieldsFound].sort((a, b) => a.localeCompare(b, "es")),
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
    console.log(`[catalogo-remoto] clasificación conservada antes/después del filtro: ${result.ajaxClassified}/${result.products}`);

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=900",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=172800, stale-while-revalidate=7200",
        "X-HiperAjax-Products": String(result.products),
        "X-HiperAjax-Source": "visiotech-csv-parse-stream",
        "X-HiperAjax-Time-Ms": String(elapsedMs),
        "X-HiperAjax-Generated-At": new Date().toISOString(),
        "X-HiperAjax-Products-With-Cost": String(result.productsWithCost),
        "X-HiperAjax-Cost-Field": result.detectedCostField || "none",
        "X-HiperAjax-CSV-Headers": result.csvHeaders.join(",").slice(0, 1800),
        "X-HiperAjax-Category-Fields": [
          result.classificationFields.parent,
          result.classificationFields.category,
          result.classificationFields.family,
          result.classificationFields.subcategory,
          result.classificationFields.path,
        ].filter(Boolean).join(",") || "none",
        "X-HiperAjax-Ajax-Classified": `${result.ajaxClassified}/${result.products}`,
        "X-HiperAjax-Filter-Fields": result.filterFields.join(",").slice(0, 1800) || "none",
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
