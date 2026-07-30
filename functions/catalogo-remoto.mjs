import { methodNotAllowed } from "./http.mjs";

const CSV_URL = process.env.VISIOTECH_CSV_URL ||
  "https://www.visiotechsecurity.com/?option=com_csvgeneration&task=generate.generateCSV&token=f0c2ca3f651701e268d6c841f0dd7e3c&username=VT8502AAK";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  if (event.httpMethod !== "GET") {
    const response = methodNotAllowed(["GET", "OPTIONS"]);
    return {
      ...response,
      headers: { ...response.headers, ...CORS_HEADERS },
    };
  }

  try {
    const response = await fetch(CSV_URL, {
      headers: {
        "User-Agent": "HiperAjax-CatalogUpdater/1.0",
        Accept: "text/csv,text/plain,*/*",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error(`Proveedor HTTP ${response.status}`);
    }

    const csv = await response.text();
    if (!csv || csv.trim().length < 20) {
      throw new Error("CSV remoto vacío");
    }

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
      body: csv,
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
        error: "No se pudo descargar el catálogo remoto",
        detalle: String(error?.message || error),
      }),
    };
  }
}
