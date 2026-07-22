/* Hiper Ajax - puente seguro del Knowledge Engine
   Potencia el buscador inicial sin modificar Catálogo ni presupuesto. */
(function(global){
  'use strict';
  if(!global.HXA_KNOWLEDGE_ENGINE) return;
  if(typeof buscar !== 'function') return;

  const buscarBase = buscar;
  const CACHE = new Map();
  let INDEX=[]; let INDEX_LEN=-1;
  function getIndex(){
    if(INDEX_LEN===(productos?.length||0) && INDEX.length) return INDEX;
    INDEX_LEN=productos?.length||0;
    INDEX=(productos||[]).map(enrichProduct);
    return INDEX;
  }

  function enrichProduct(p,i){
    let d={};
    try{ d = (typeof descripcionProducto==='function' ? descripcionProducto(p) : {}) || {}; }catch(e){}
    return {
      ...p,
      name:p && p.name,
      description:[
        d.desc,d.family,d.official,
        p && p.description,p && p.desc,
        p && p._search175,p && p._search183,p && p._search186
      ].filter(Boolean).join(' '),
      _hxaIndex:i
    };
  }

  buscar = function(term){
    const raw=String(term||'').trim();
    if(!raw) return [];
    try{
      const key=raw.toLowerCase()+'|'+(productos?.length||0);
      if(CACHE.has(key)) return CACHE.get(key);
      const ranked=global.HXA_KNOWLEDGE_ENGINE.rank(getIndex(),raw,260)
        .map(x=>({p:productos[x._hxaIndex],i:x._hxaIndex,score:x._score,reasons:x._reasons||[]}))
        .filter(x=>x.p);
      /* Nunca perdemos productos: si el motor no obtiene resultados,
         se usa exactamente el buscador estable anterior. */
      const out=ranked.length ? ranked : buscarBase(raw);
      if(CACHE.size>140) CACHE.clear();
      CACHE.set(key,out);
      return out;
    }catch(e){
      console.warn('Knowledge Engine buscador inicial fallback',e);
      return buscarBase(raw);
    }
  };

  const cargarBase = typeof cargarCatalogo==='function' ? cargarCatalogo : null;
  if(cargarBase){
    cargarCatalogo = async function(){ CACHE.clear(); INDEX=[]; INDEX_LEN=-1; return cargarBase.apply(this,arguments); };
  }
})(window);
