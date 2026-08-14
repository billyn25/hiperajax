(function(global){
  'use strict';

  const CACHE=new Map();
  let cachedList=null,cachedSignature='',cachedRecords=[];

  function str(v){
    if(v===undefined||v===null) return '';
    if(Array.isArray(v)) return v.map(str).filter(Boolean).join(' ');
    if(typeof v==='object') return Object.values(v).map(str).filter(Boolean).join(' ');
    return String(v).trim();
  }

  function normalize(v=''){
    return str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }
  function compact(v=''){ return normalize(v).replace(/\s+/g,''); }
  function tokens(v=''){ return normalize(v).split(/\s+/).filter(Boolean); }
  function unique(a){ return [...new Set(a.filter(Boolean))]; }

  // Solo campos reales del catálogo/CSV.
  function productFields(p){
    p=p||{};
    return unique([
      p.name,p.brand,p.marca,p.short_description,p.description,p.desc,
      p.category,p.categoria,p.family,p.familia,p.subcategory,p.subcategoria,
      p.product_type,p.tipo,p.series,p.serie,p.technology,p.tecnologia,
      p.color,p.colour,p.tags,p.keywords,p.attributes,p.atributos
    ].map(str));
  }

  function buildRecord(product,index){
    const p=product||{};
    const fields={
      ref:str(p.name),
      brand:str(p.brand||p.marca),
      short:str(p.short_description),
      full:str(p.description||p.desc),
      category:str(p.category||p.categoria),
      family:str(p.family||p.familia),
      subcategory:str(p.subcategory||p.subcategoria),
      type:str(p.product_type||p.tipo),
      series:str(p.series||p.serie),
      technology:str(p.technology||p.tecnologia),
      color:str(p.color||p.colour),
      tags:str(p.tags||p.keywords),
      attrs:str(p.attributes||p.atributos)
    };
    const norm={},sets={};
    for(const [k,v] of Object.entries(fields)){
      norm[k]=normalize(v);
      sets[k]=new Set(tokens(v));
    }
    return {product:p,index,fields,norm,sets,refCompact:compact(fields.ref)};
  }

  function signature(list){
    let h=2166136261;
    for(const p of list){
      const t=productFields(p).join('\u001f');
      for(let i=0;i<t.length;i++){ h^=t.charCodeAt(i); h=Math.imul(h,16777619); }
    }
    return `${list.length}:${h>>>0}`;
  }

  function getRecords(list){
    const sig=signature(list);
    if(cachedList!==list||cachedSignature!==sig){
      cachedList=list;cachedSignature=sig;
      cachedRecords=list.map(buildRecord);
      CACHE.clear();
    }
    return {records:cachedRecords,sig};
  }

  function queryInfo(raw){
    const norm=normalize(raw);
    return {norm,tokens:tokens(norm),compact:compact(norm)};
  }

  function recordHasExactToken(record,term){
    for(const set of Object.values(record.sets)){
      if(set.has(term)) return true;
    }
    return false;
  }

  function fieldScore(record,key,term,weight,exactRequired){
    const n=record.norm[key],set=record.sets[key];
    if(!n||!term) return 0;

    if(n===term) return weight*4;
    if(set.has(term)) return weight*3;

    // Si el término existe como palabra exacta en el catálogo, NO aceptar
    // coincidencias de prefijo como SIM -> SIMPLE.
    if(!exactRequired && term.length>=2){
      for(const word of set){
        if(word.startsWith(term)) return weight*2;
      }
    }

    // Coincidencia interior solo en términos largos y solo cuando no existe
    // una palabra exacta global. Evita ruido con consultas cortas.
    if(!exactRequired && term.length>=4 && n.includes(term)) return weight;

    return 0;
  }

  function scoreRecord(record,query,exactTerms){
    if(!query.tokens.length) return 0;

    const weights={
      ref:120,short:90,type:82,subcategory:76,family:64,category:58,
      brand:52,series:48,technology:46,tags:42,color:34,attrs:26,full:24
    };

    let score=0,covered=0;

    for(const term of query.tokens){
      const exactRequired=exactTerms.has(term);
      let best=0;

      for(const [key,w] of Object.entries(weights)){
        best=Math.max(best,fieldScore(record,key,term,w,exactRequired));
      }

      const tc=compact(term);
      if(record.refCompact===tc) best=Math.max(best,weights.ref*4);
      else if(record.refCompact.startsWith(tc)) best=Math.max(best,weights.ref*2.2);
      else if(term.length>=3 && record.refCompact.includes(tc)) best=Math.max(best,weights.ref*1.25);

      if(best>0){ covered++; score+=best; }
    }

    // Todas las palabras escritas deben estar presentes de verdad.
    if(covered!==query.tokens.length) return 0;

    const phrase=query.norm;
    if(record.norm.ref===phrase) score+=500;
    else if(record.norm.ref.startsWith(phrase)) score+=280;

    for(const key of ['short','type','subcategory','family','category']){
      const n=record.norm[key];
      if(!n) continue;
      if(n===phrase) score+=180;
      else if(phrase.length>=3 && n.startsWith(phrase)) score+=95;
      else if(phrase.length>=4 && n.includes(phrase)) score+=45;
    }

    return score;
  }

  function rank(products,rawQuery,limit=300){
    const list=Array.isArray(products)?products:[];
    const query=queryInfo(rawQuery);
    if(!query.norm) return [];

    const {records,sig}=getRecords(list);
    const key=`${query.norm}|${sig}|${limit}`;
    if(CACHE.has(key)) return CACHE.get(key);

    // Para cada término, comprobar si existe como palabra exacta en el catálogo.
    // Si existe, ese término deja de funcionar como prefijo global.
    const exactTerms=new Set(
      query.tokens.filter(term=>records.some(record=>recordHasExactToken(record,term)))
    );

    const ranked=records.map(record=>{
      const score=scoreRecord(record,query,exactTerms);
      return score?{...record.product,_hxaIndex:record.index,_score:score}:null;
    }).filter(Boolean).sort((a,b)=>
      b._score-a._score ||
      String(a.name||'').localeCompare(String(b.name||''),'es',{numeric:true,sensitivity:'base'})
    ).slice(0,Math.max(1,Number(limit)||300));

    if(CACHE.size>120) CACHE.clear();
    CACHE.set(key,ranked);
    return ranked;
  }

  function adapt(products,q,limit=300){
    return rank(products,q,limit)
      .map(x=>({p:products[x._hxaIndex],i:x._hxaIndex,score:x._score}))
      .filter(x=>x.p);
  }

  function getProducts(){
    try{ return typeof productos!=='undefined'&&Array.isArray(productos)?productos:[]; }
    catch(_e){ return []; }
  }

  function alphabeticalRows(source){
    return source.map((p,i)=>({p,i,score:1}))
      .sort((a,b)=>String(a.p?.name||'').localeCompare(String(b.p?.name||''),'es',{numeric:true,sensitivity:'base'}));
  }

  function searchRows(source,term,limit=300){
    const q=str(term);
    return q?adapt(source,q,limit):alphabeticalRows(source);
  }

  const engine={
    normalize,compact,rank,
    scoreProduct:(p,q)=>{
      const list=[p],qi=queryInfo(q),record=buildRecord(p,0);
      const exact=new Set(qi.tokens.filter(t=>recordHasExactToken(record,t)));
      return {score:scoreRecord(record,qi,exact)};
    },
    clearCache:()=>{CACHE.clear();cachedList=null;cachedSignature='';cachedRecords=[];},
    version:'7.1-csv-only-exact-token'
  };

  global.HXA_SEARCH_ENGINE=engine;
  global.HXA_KNOWLEDGE_ENGINE=engine;

  // MISMA entrada textual para Inicio.
  global.buscar=function(term){
    return searchRows(getProducts(),term,300);
  };

  // Catálogo usa exactamente el mismo ranking textual.
  global.buscarCatalogo=function(term=''){
    return searchRows(getProducts(),term,300);
  };

})(typeof window!=='undefined'?window:globalThis);
