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
  function words(v=''){ return normalize(v).split(/\s+/).filter(Boolean); }

  function productFields(p){
    p=p||{};
    return [
      p.name,
      p.brand,p.marca,
      p.short_description,
      p.description,p.desc,
      p.category,p.categoria,
      p.family,p.familia,
      p.subcategory,p.subcategoria,
      p.product_type,p.tipo,
      p.series,p.serie,
      p.technology,p.tecnologia,
      p.color,p.colour,
      p.tags,p.keywords,
      p.attributes,p.atributos
    ];
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
    const normalized={},sets={};
    for(const [key,value] of Object.entries(fields)){
      normalized[key]=normalize(value);
      sets[key]=new Set(words(value));
    }
    return {product:p,index,fields,normalized,sets,refCompact:compact(fields.ref)};
  }

  function signature(list){
    let h=2166136261;
    for(const p of list){
      const text=productFields(p).map(str).join('\u001f');
      for(let i=0;i<text.length;i++){ h^=text.charCodeAt(i); h=Math.imul(h,16777619); }
    }
    return `${list.length}:${h>>>0}`;
  }

  function recordsFor(list){
    const sig=signature(list);
    if(cachedList!==list || cachedSignature!==sig){
      cachedList=list;
      cachedSignature=sig;
      cachedRecords=list.map(buildRecord);
      CACHE.clear();
    }
    return {records:cachedRecords,sig};
  }

  function tokenForms(token){
    const t=normalize(token);
    const out=new Set([t]);
    if(t.length>=5 && t.endsWith('es')) out.add(t.slice(0,-2));
    if(t.length>=4 && t.endsWith('s')) out.add(t.slice(0,-1));
    return out;
  }

  function equivalentWord(word,token){
    const forms=tokenForms(token);
    if(forms.has(word)) return true;
    const wordForms=tokenForms(word);
    for(const form of forms){ if(wordForms.has(form)) return true; }
    return false;
  }

  function recordHasEquivalent(record,token){
    for(const set of Object.values(record.sets)){
      for(const word of set){ if(equivalentWord(word,token)) return true; }
    }
    return false;
  }

  function fieldMatch(record,key,token,allowPrefix){
    const set=record.sets[key];
    const text=record.normalized[key];
    if(!text) return 0;

    for(const word of set){
      if(equivalentWord(word,token)) return 3;
    }

    if(allowPrefix && token.length>=2){
      for(const word of set){
        if(word.startsWith(token)) return 2;
      }
    }

    if(allowPrefix && token.length>=5 && text.includes(token)) return 1;
    return 0;
  }

  function scoreRecord(record,query,allowPrefixByToken){
    const weights={
      ref:120,short:95,type:85,subcategory:80,family:72,category:66,
      brand:55,series:48,technology:46,tags:42,color:32,attrs:28,full:26
    };
    let score=0;

    for(const token of query.tokens){
      let best=0;
      const allowPrefix=allowPrefixByToken.get(token)===true;

      for(const [key,weight] of Object.entries(weights)){
        const level=fieldMatch(record,key,token,allowPrefix);
        if(level===3) best=Math.max(best,weight*3);
        else if(level===2) best=Math.max(best,weight*2);
        else if(level===1) best=Math.max(best,weight);
      }

      const tc=compact(token);
      if(record.refCompact===tc) best=Math.max(best,480);
      else if(allowPrefix && token.length>=2 && record.refCompact.startsWith(tc)) best=Math.max(best,250);
      else if(allowPrefix && token.length>=4 && record.refCompact.includes(tc)) best=Math.max(best,145);

      if(best===0) return 0;
      score+=best;
    }

    const phrase=query.norm;
    if(record.normalized.ref===phrase) score+=500;
    else if(record.normalized.ref.startsWith(phrase)) score+=250;

    for(const key of ['short','type','subcategory','family','category']){
      const text=record.normalized[key];
      if(!text) continue;
      if(text===phrase) score+=170;
      else if(phrase.length>=3 && text.startsWith(phrase)) score+=85;
      else if(phrase.length>=5 && text.includes(phrase)) score+=35;
    }

    return score;
  }

  function queryInfo(raw){
    const norm=normalize(raw);
    return {norm,tokens:words(norm)};
  }

  function rank(products,rawQuery,limit=300){
    const list=Array.isArray(products)?products:[];
    const query=queryInfo(rawQuery);
    if(!query.norm) return [];

    const {records,sig}=recordsFor(list);
    const cacheKey=`${query.norm}|${sig}|${limit}`;
    if(CACHE.has(cacheKey)) return CACHE.get(cacheKey);

    const allowPrefixByToken=new Map();
    for(const token of query.tokens){
      const hasExact=records.some(record=>recordHasEquivalent(record,token));
      allowPrefixByToken.set(token,!hasExact);
    }

    const ranked=records
      .map(record=>{
        const score=scoreRecord(record,query,allowPrefixByToken);
        return score?{...record.product,_hxaIndex:record.index,_score:score}:null;
      })
      .filter(Boolean)
      .sort((a,b)=>
        b._score-a._score ||
        String(a.name||'').localeCompare(String(b.name||''),'es',{numeric:true,sensitivity:'base'})
      )
      .slice(0,Math.max(1,Number(limit)||300));

    if(CACHE.size>120) CACHE.clear();
    CACHE.set(cacheKey,ranked);
    return ranked;
  }

  function adapt(products,query,limit=300){
    return rank(products,query,limit)
      .map(x=>({p:products[x._hxaIndex],i:x._hxaIndex,score:x._score}))
      .filter(x=>x.p);
  }

  function getProducts(){
    try{ return typeof productos!=='undefined' && Array.isArray(productos) ? productos : []; }
    catch(_e){ return []; }
  }

  function alphabeticalRows(source){
    return source.map((p,i)=>({p,i,score:1}))
      .sort((a,b)=>String(a.p?.name||'').localeCompare(String(b.p?.name||''),'es',{numeric:true,sensitivity:'base'}));
  }

  function searchRows(source,term,limit=300){
    const q=str(term);
    return q ? adapt(source,q,limit) : alphabeticalRows(source);
  }

  const engine={
    normalize,compact,rank,
    clearCache:()=>{CACHE.clear();cachedList=null;cachedSignature='';cachedRecords=[];},
    version:'8.0-simple-csv'
  };

  global.HXA_SEARCH_ENGINE=engine;
  global.HXA_KNOWLEDGE_ENGINE=engine;
  global.buscar=function(term){ return searchRows(getProducts(),term,300); };
  global.buscarCatalogo=function(term=''){ return searchRows(getProducts(),term,300); };

})(typeof window!=='undefined'?window:globalThis);
