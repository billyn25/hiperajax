/*
 * HXA Common Search Engine 2.1
 * Genérico, reutilizable y sin reglas de negocio.
 */
(function(global){
'use strict';

const FIELDS={
  reference:['name','reference','ref','sku','code'],
  identity:[
    'product_type','tipo','subcategory','subcategoria','family','familia',
    'category','categoria','brand','marca','series','serie',
    'technology','tecnologia','tags','keywords','color','colour'
  ],
  short:['short_description','shortDescription','descripcion_corta'],
  long:['description','desc','descripcion'],
  extra:['attributes','atributos']
};

let cachedList=null,cachedSig='',cachedRecords=[];

function raw(v){
  if(v==null)return '';
  if(Array.isArray(v))return v.map(raw).filter(Boolean).join(' ');
  if(typeof v==='object')return Object.values(v).map(raw).filter(Boolean).join(' ');
  return String(v).trim();
}
function normalize(v=''){
  return raw(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function compact(v=''){return normalize(v).replace(/\s+/g,'');}
function tokens(v=''){return normalize(v).split(/\s+/).filter(Boolean);}

function forms(token){
  const t=normalize(token),out=new Set([t]);
  if(t.length>=5&&t.endsWith('es'))out.add(t.slice(0,-2));
  if(t.length>=4&&t.endsWith('s'))out.add(t.slice(0,-1));
  return out;
}
function equivalent(a,b){
  const A=forms(a),B=forms(b);
  for(const x of A)if(B.has(x))return true;
  return false;
}
function readFirst(p,names){
  for(const n of names){const v=p?.[n];if(v!=null&&raw(v)!=='')return raw(v);}
  return '';
}
function readAll(p,names){
  return names.map(n=>raw(p?.[n])).filter(Boolean).join(' ');
}
function info(v){const text=normalize(v);return {text,words:new Set(tokens(text))};}
function build(p,index){
  const ref=readFirst(p,FIELDS.reference);
  return {
    p,index,
    reference:info(ref),
    identity:info(readAll(p,FIELDS.identity)),
    short:info(readAll(p,FIELDS.short)),
    long:info(readAll(p,FIELDS.long)),
    extra:info(readAll(p,FIELDS.extra)),
    refCompact:compact(ref)
  };
}
function signature(list){
  let h=2166136261;
  for(const p of list){
    const text=[
      readFirst(p,FIELDS.reference),readAll(p,FIELDS.identity),
      readAll(p,FIELDS.short),readAll(p,FIELDS.long),readAll(p,FIELDS.extra)
    ].join('\u001f');
    for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
  }
  return `${list.length}:${h>>>0}`;
}
function recordsFor(list){
  const sig=signature(list);
  if(cachedList!==list||cachedSig!==sig){
    cachedList=list;cachedSig=sig;cachedRecords=list.map(build);
  }
  return cachedRecords;
}
function exact(field,term){
  for(const w of field.words)if(equivalent(w,term))return true;
  return false;
}
function startsWithEquivalent(field,term){
  const first=[...field.words][0] || '';
  return !!first && equivalent(first,term);
}
function prefix(field,term){
  if(term.length<2)return false;
  for(const w of field.words)if(w.startsWith(term))return true;
  return false;
}
function contains(field,term){return term.length>=5&&field.text.includes(term);}
function exactExists(records,term){
  return records.some(r=>exact(r.reference,term)||exact(r.identity,term)||exact(r.short,term)||exact(r.long,term)||exact(r.extra,term));
}

/* Menor clase = mejor resultado. No hay puntos. */
function matchClass(r,term,allowPrefix){
  const tc=compact(term);

  // Referencia / código.
  if(r.refCompact===tc)return 0;
  if(exact(r.reference,term))return 1;
  if(allowPrefix&&prefix(r.reference,term))return 2;

  // Identidad estructurada.
  if(startsWithEquivalent(r.identity,term))return 3;
  if(exact(r.identity,term))return 4;

  // Descripción corta: "Sirena interior..." debe ir antes que
  // "Pack de tapas ... para sirena", sin reglas por producto.
  if(startsWithEquivalent(r.short,term))return 5;
  if(exact(r.short,term))return 6;

  // Prefijos solo cuando no existe una palabra exacta en el catálogo.
  if(allowPrefix&&prefix(r.identity,term))return 7;
  if(allowPrefix&&prefix(r.short,term))return 8;

  // Descripción larga / atributos: relacionados, no identidad.
  if(startsWithEquivalent(r.long,term)||startsWithEquivalent(r.extra,term))return 9;
  if(exact(r.long,term)||exact(r.extra,term))return 10;

  if(allowPrefix&&(contains(r.identity,term)||contains(r.short,term)||contains(r.long,term)||contains(r.extra,term)))return 11;
  return null;
}
function search(products,query,options={}){
  const list=Array.isArray(products)?products:[];
  const q=tokens(query);
  if(!q.length)return [];
  const records=recordsFor(list);
  const policy=new Map(q.map(term=>[term,!exactExists(records,term)]));
  const result=[];

  for(const r of records){
    const classes=[];
    let valid=true;
    for(const term of q){
      const cls=matchClass(r,term,policy.get(term));
      if(cls==null){valid=false;break;}
      classes.push(cls);
    }
    if(!valid)continue;
    result.push({
      product:r.p,index:r.index,
      worst:Math.max(...classes),
      total:classes.reduce((a,b)=>a+b,0)
    });
  }

  result.sort((a,b)=>
    a.worst-b.worst||
    a.total-b.total||
    String(a.product?.name||'').localeCompare(String(b.product?.name||''),'es',{numeric:true,sensitivity:'base'})
  );
  return result.slice(0,Math.max(1,Number(options.limit)||300));
}
function rank(products,q,limit=300){
  return search(products,q,{limit}).map(m=>({...m.product,_hxaIndex:m.index,_matchClass:m.worst}));
}
function rows(products,q,limit=300){
  return search(products,q,{limit}).map(m=>({p:m.product,i:m.index,matchClass:m.worst}));
}

const engine={
  version:'2.2-common-positional',
  normalize,compact,search,rank,rows,
  defaultFields:FIELDS,
  clearCache:()=>{cachedList=null;cachedSig='';cachedRecords=[];}
};
global.HXA_COMMON_SEARCH=engine;
global.HXA_SEARCH_ENGINE=engine;
global.HXA_KNOWLEDGE_ENGINE=engine;
})(typeof window!=='undefined'?window:globalThis);
