(function(global){
'use strict';

const CACHE=new Map();
let cachedList=null,cachedSignature='',cachedRecords=[];

function str(v){
  if(v==null)return '';
  if(Array.isArray(v))return v.map(str).filter(Boolean).join(' ');
  if(typeof v==='object')return Object.values(v).map(str).filter(Boolean).join(' ');
  return String(v).trim();
}
function norm(v=''){
  return str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function compact(v=''){return norm(v).replace(/\s+/g,'');}
function words(v=''){return norm(v).split(/\s+/).filter(Boolean);}

function forms(t){
  t=norm(t); const s=new Set([t]);
  if(t.length>=5&&t.endsWith('es'))s.add(t.slice(0,-2));
  if(t.length>=4&&t.endsWith('s'))s.add(t.slice(0,-1));
  return s;
}
function equivalent(a,b){
  const A=forms(a),B=forms(b);
  for(const x of A)if(B.has(x))return true;
  return false;
}

function fieldData(v){
  const text=norm(v);
  return {text,set:new Set(words(text))};
}

function buildRecord(p,index){
  p=p||{};
  const f={
    ref:fieldData(p.name),
    type:fieldData(p.product_type||p.tipo),
    sub:fieldData(p.subcategory||p.subcategoria),
    family:fieldData(p.family||p.familia),
    category:fieldData(p.category||p.categoria),
    short:fieldData(p.short_description),
    brand:fieldData(p.brand||p.marca),
    series:fieldData(p.series||p.serie),
    technology:fieldData(p.technology||p.tecnologia),
    tags:fieldData(p.tags||p.keywords),
    color:fieldData(p.color||p.colour),
    attrs:fieldData(p.attributes||p.atributos),
    full:fieldData(p.description||p.desc)
  };
  return {p,index,f,refCompact:compact(p.name)};
}

function searchableValues(p){
  return [
    p.name,p.product_type,p.tipo,p.subcategory,p.subcategoria,p.family,p.familia,
    p.category,p.categoria,p.short_description,p.brand,p.marca,p.series,p.serie,
    p.technology,p.tecnologia,p.tags,p.keywords,p.color,p.colour,
    p.attributes,p.atributos,p.description,p.desc
  ].map(str);
}
function signature(list){
  let h=2166136261;
  for(const p of list){
    const t=searchableValues(p).join('\u001f');
    for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}
  }
  return `${list.length}:${h>>>0}`;
}
function recordsFor(list){
  const sig=signature(list);
  if(cachedList!==list||cachedSignature!==sig){
    cachedList=list;cachedSignature=sig;cachedRecords=list.map(buildRecord);CACHE.clear();
  }
  return {records:cachedRecords,sig};
}

function exactInField(field,token){
  for(const w of field.set)if(equivalent(w,token))return true;
  return false;
}
function prefixInField(field,token){
  if(token.length<2)return false;
  for(const w of field.set)if(w.startsWith(token))return true;
  return false;
}
function containsInField(field,token){
  return token.length>=5&&field.text.includes(token);
}

/*
  Jerarquía deliberada:
  IDENTIDAD (ref/tipo/subfamilia/familia/categoría) >>
  descripción corta >>
  metadatos >>
  descripción larga.
  La descripción larga encuentra relacionados, pero no puede adelantar al producto que ES lo buscado.
*/
const TIERS={
  ref:       {tier:5,w:130},
  type:      {tier:5,w:120},
  sub:       {tier:5,w:112},
  family:    {tier:5,w:104},
  category:  {tier:5,w:96},
  short:     {tier:4,w:82},
  brand:     {tier:3,w:58},
  series:    {tier:3,w:54},
  technology:{tier:3,w:52},
  tags:      {tier:3,w:48},
  color:     {tier:2,w:34},
  attrs:     {tier:2,w:30},
  full:      {tier:1,w:18}
};

function matchField(field,token,allowPrefix){
  if(exactInField(field,token))return 3;
  if(allowPrefix&&prefixInField(field,token))return 2;
  if(allowPrefix&&containsInField(field,token))return 1;
  return 0;
}

function recordHasExact(record,token){
  for(const key of Object.keys(TIERS)){
    if(exactInField(record.f[key],token))return true;
  }
  return false;
}

function scoreRecord(record,query,prefixPolicy){
  let score=0;
  let identityHits=0;
  let bestTierOverall=0;

  for(const token of query.tokens){
    const allowPrefix=prefixPolicy.get(token)===true;
    let best=null;

    for(const [key,cfg] of Object.entries(TIERS)){
      const level=matchField(record.f[key],token,allowPrefix);
      if(!level)continue;
      const candidate={tier:cfg.tier,points:cfg.w*level,key,level};
      if(!best||candidate.tier>best.tier||
         (candidate.tier===best.tier&&candidate.points>best.points))best=candidate;
    }

    // Referencia compacta mantiene búsquedas naturales AJHUB, NVR108, etc.
    const tc=compact(token);
    if(record.refCompact===tc){
      const c={tier:6,points:520,key:'ref',level:4};
      if(!best||c.tier>best.tier||c.points>best.points)best=c;
    }else if(allowPrefix&&token.length>=2&&record.refCompact.startsWith(tc)){
      const c={tier:5,points:275,key:'ref',level:2};
      if(!best||c.tier>best.tier||(c.tier===best.tier&&c.points>best.points))best=c;
    }

    if(!best)return 0; // todas las palabras deben coincidir
    if(best.tier>=5)identityHits++;
    bestTierOverall=Math.max(bestTierOverall,best.tier);

    // El tier domina completamente al peso.
    score += best.tier*10000 + best.points;
  }

  // Si todas las palabras definen identidad, fuerte prioridad.
  if(identityHits===query.tokens.length)score+=25000;

  // Frase exacta/prefijo en identidad.
  const phrase=query.norm;
  for(const key of ['ref','type','sub','family','category']){
    const text=record.f[key].text;
    if(!text)continue;
    if(text===phrase)score+=18000;
    else if(phrase.length>=3&&text.startsWith(phrase))score+=9000;
  }

  // Una coincidencia que solo vive en descripción larga queda deliberadamente detrás.
  if(bestTierOverall===1)score-=5000;

  return score;
}

function queryInfo(raw){const n=norm(raw);return {norm:n,tokens:words(n)};}

function rank(products,rawQuery,limit=300){
  const list=Array.isArray(products)?products:[];
  const query=queryInfo(rawQuery);
  if(!query.norm)return [];
  const {records,sig}=recordsFor(list);
  const key=`${query.norm}|${sig}|${limit}`;
  if(CACHE.has(key))return CACHE.get(key);

  // Si la palabra existe realmente en el catálogo, no usamos prefijo para esa palabra.
  // SIM no coincide con SIMPLE; si escribes HU, sí permite HUB.
  const prefixPolicy=new Map();
  for(const token of query.tokens){
    prefixPolicy.set(token,!records.some(r=>recordHasExact(r,token)));
  }

  const result=records.map(r=>{
    const score=scoreRecord(r,query,prefixPolicy);
    return score?{...r.p,_hxaIndex:r.index,_score:score}:null;
  }).filter(Boolean).sort((a,b)=>
    b._score-a._score||
    String(a.name||'').localeCompare(String(b.name||''),'es',{numeric:true,sensitivity:'base'})
  ).slice(0,Math.max(1,Number(limit)||300));

  if(CACHE.size>120)CACHE.clear();
  CACHE.set(key,result);
  return result;
}

function getProducts(){
  try{return typeof productos!=='undefined'&&Array.isArray(productos)?productos:[];}
  catch(_){return [];}
}
function adapt(source,q,limit=300){
  return rank(source,q,limit).map(x=>({p:source[x._hxaIndex],i:x._hxaIndex,score:x._score})).filter(x=>x.p);
}
function searchRows(source,q,limit=300){
  q=str(q);
  if(q)return adapt(source,q,limit);
  return source.map((p,i)=>({p,i,score:1})).sort((a,b)=>
    String(a.p?.name||'').localeCompare(String(b.p?.name||''),'es',{numeric:true,sensitivity:'base'}));
}

const engine={normalize:norm,compact,rank,clearCache:()=>{CACHE.clear();cachedList=null;cachedSignature='';cachedRecords=[];},version:'9.0-identity-first'};
global.HXA_SEARCH_ENGINE=engine;
global.HXA_KNOWLEDGE_ENGINE=engine;
global.buscar=function(term){return searchRows(getProducts(),term,300);};
global.buscarCatalogo=function(term=''){return searchRows(getProducts(),term,300);};

})(typeof window!=='undefined'?window:globalThis);
