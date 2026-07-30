import { respuestaJson, manejarOptions } from './http.mjs';

const CSV_URL = process.env.VISIOTECH_CSV_URL || 'https://www.visiotechsecurity.com/?option=com_csvgeneration&task=generate.generateCSV&token=f0c2ca3f651701e268d6c841f0dd7e3c&username=VT8502AAK';

export default async (request) => {
  const options = manejarOptions(request);
  if (options) return options;

  try {
    const response = await fetch(CSV_URL, {
      headers: { 'user-agent': 'HiperAjax-CatalogUpdater/1.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error(`Proveedor HTTP ${response.status}`);
    const csv = await response.text();
    if (!csv || csv.length < 20) throw new Error('CSV remoto vacío');

    return new Response(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'access-control-allow-origin': '*'
      }
    });
  } catch (error) {
    return respuestaJson(502, {
      ok: false,
      error: 'No se pudo descargar el catálogo remoto',
      detalle: String(error?.message || error)
    });
  }
};
