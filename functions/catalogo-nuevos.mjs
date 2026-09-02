import { getDatabase } from './mongo.mjs';
import { methodNotAllowed } from './http.mjs';

const COLLECTION = 'catalogo_estado';
const DOC_ID = 'productos_nuevos_v1';
const NEW_DAYS = 15;
const MAX_AGE = NEW_DAYS * 24 * 60 * 60 * 1000;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function normalizarRefs(value){
  return [...new Set((Array.isArray(value) ? value : [])
    .map(ref => String(ref || '').trim().toUpperCase())
    .filter(Boolean))].sort();
}

function candidatosValidos(value, refsSet, ahora){
  const out = {};
  if(!value || typeof value !== 'object' || Array.isArray(value)) return out;
  for(const [rawRef, rawTs] of Object.entries(value)){
    const ref = String(rawRef || '').trim().toUpperCase();
    const ts = Number(rawTs || 0);
    if(!ref || !refsSet.has(ref) || !Number.isFinite(ts)) continue;
    if(ts > 0 && ts <= ahora && (ahora - ts) <= MAX_AGE) out[ref] = ts;
  }
  return out;
}

export async function handler(event){
  if(event.httpMethod === 'OPTIONS') return {statusCode:204, headers:CORS_HEADERS, body:''};
  if(event.httpMethod !== 'POST'){
    const response = methodNotAllowed(['POST','OPTIONS']);
    return {...response, headers:{...response.headers, ...CORS_HEADERS}};
  }

  try{
    const body = JSON.parse(event.body || '{}');
    const refs = normalizarRefs(body.refs);
    if(!refs.length) throw new Error('Lista de referencias vacía');
    const refsSet = new Set(refs);
    const ahora = Date.now();
    const candidatos = candidatosValidos(body.localNuevos, refsSet, ahora);

    const db = await getDatabase();
    const col = db.collection(COLLECTION);
    const previo = await col.findOne({_id:DOC_ID});

    let conocidos = normalizarRefs(previo?.refs);
    let nuevos = previo?.nuevos && typeof previo.nuevos === 'object' ? {...previo.nuevos} : {};

    // Primera sincronización: el catálogo actual se convierte en base global.
    // Para no perder los NUEVO ya detectados en el PC principal, importamos
    // únicamente marcas locales válidas de los últimos 15 días.
    if(!previo){
      conocidos = refs;
      nuevos = {...candidatos};
    }else{
      const conocidosSet = new Set(conocidos);
      for(const ref of refs){
        if(!conocidosSet.has(ref) && !nuevos[ref]) nuevos[ref] = ahora;
      }
      // Migración/consenso: conserva una fecha ya conocida por otro navegador.
      for(const [ref, ts] of Object.entries(candidatos)){
        if(!nuevos[ref] || ts < Number(nuevos[ref])) nuevos[ref] = ts;
      }
      conocidos = refs;
    }

    for(const ref of Object.keys(nuevos)){
      const ts = Number(nuevos[ref] || 0);
      if(!refsSet.has(ref) || !ts || (ahora - ts) > MAX_AGE) delete nuevos[ref];
    }

    await col.updateOne(
      {_id:DOC_ID},
      {$set:{refs:conocidos, nuevos, updatedAt:new Date()}},
      {upsert:true}
    );

    return {
      statusCode:200,
      headers:{...CORS_HEADERS, 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'},
      body:JSON.stringify({ok:true, nuevos, days:NEW_DAYS, updatedAt:new Date(ahora).toISOString()})
    };
  }catch(error){
    console.error('[catalogo-nuevos]', error);
    return {
      statusCode:500,
      headers:{...CORS_HEADERS, 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'},
      body:JSON.stringify({ok:false, error:'No se pudo sincronizar el estado de productos nuevos'})
    };
  }
}
