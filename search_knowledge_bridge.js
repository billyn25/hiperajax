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

  function compactRef(v){
    return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,'');
  }
  function isSpecificReferenceSearch(raw){
    const q=compactRef(raw);
    if(!q || q.length<6 || !Array.isArray(productos)) return false;
    const direct=productos.some(p=>{
      const ref=compactRef(p&&p.name);
      return ref===q || ref.startsWith(q) || q.startsWith(ref);
    });
    return direct && (/^aj[-_ ]/i.test(raw) || /[-_0-9]/.test(raw) || q.length>=9);
  }

  buscar = function(term){
    const raw=String(term||'').trim();
    if(!raw) return [];
    try{
      const key=raw.toLowerCase()+'|'+(productos?.length||0);
      if(CACHE.has(key)) return CACHE.get(key);

      /* Las referencias y nombres de modelo específicos deben respetar el
         buscador estable de app.js. El Knowledge Engine es útil para términos
         semánticos (wifi, fotosensor, exterior...), pero no debe reinterpretar
         KEYPADCOMBI como la intención genérica COMBI/COMBIPROTECT. */
      if(isSpecificReferenceSearch(raw)){
        const exactOut=buscarBase(raw);
        if(CACHE.size>140) CACHE.clear();
        CACHE.set(key,exactOut);
        return exactOut;
      }

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
