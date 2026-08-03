/* =============================================================
   HIPER AJAX · MOTOR ÚNICO DE BÚSQUEDA

   Usado por:
   - buscador inicial
   - Catálogo
   - Explorer

   Criterio, de mayor a menor peso:
   1. Referencia
   2. Nombre/familia comercial breve
   3. Descripción corta
   4. Descripción completa (peso bajo)
   5. Diccionario pequeño de alias técnicos

   No usa subsecuencias, distancia de edición, reglas comerciales ni
   familias cerradas. Una coincidencia débil nunca puede superar a una
   referencia real.
   ============================================================= */
(function(global){
  'use strict';

  const ALIASES = Object.freeze({
    motcam: ['motioncam'],
    mcam: ['motioncam'],
    mocam: ['motioncam'],
    lte: ['4g'],
    'wi fi': ['wifi'],
    domo: ['domecam', 'turretcam'],
    torreta: ['turretcam'],
    pir: ['motionprotect', 'movimiento'],
    volumetrico: ['motionprotect', 'movimiento'],
    fotosensor: ['motioncam', 'fotodetector'],
    fotodetector: ['motioncam'],
    grabador: ['nvr'],
    videograbador: ['nvr'],
    disco: ['hdd', 'disco duro'],
    microsd: ['micro sd'],
    teclado: ['keypad'],
    central: ['hub'],
    repetidor: ['rex'],
    inundacion: ['leaksprotect', 'agua'],
    humo: ['fireprotect', 'incendio'],
    enchufe: ['socket', 'outlet'],
    rele: ['relay', 'wallswitch']
  });

  // Reglas de los botones rápidos del Catálogo. Se mantienen aquí,
  // junto al motor de búsqueda, para evitar filtros repartidos por app.js.
  const CATALOG_FILTERS = Object.freeze({
    cam:n=>/bulletcam|domecam|turretcam|indoorcam|doorbell/.test(n),
    hub:n=>/^aj-hub/.test(n) && !/bracket|batt|battery|dummy|repair|kit/.test(n),
    det:n=>/motionprotect|motioncam|doorprotect|glassprotect|combiprotect|curtain|outdoorprotect|fireprotect|leaksprotect|lifequality|seismoprotect/.test(n) && !/dummy|lens|bracket/.test(n),
    sir:n=>/homesiren|streetsiren|speakerss/.test(n) && !/dummy|bracket/.test(n),
    key:n=>/keypad/.test(n) && !/dummy|bracket/.test(n),
    dom:n=>/lightcore|lightswitch|centerbutton|sidebutton|solobutton|centercove?r|sidecove?r|solocove?r|coverplate|outletcore|outletbasic|outletlan|socket|wallswitch|relay|multirelay|bypass|frame|surfacebox/.test(n),
    nvr:n=>/nvr/.test(n),
    sup:n=>/junctionbox/.test(n),
    out:n=>/outdoor|street|doorbell|waterstop|curtainoutdoor/.test(n),
    fire:n=>/fireprotect|manualcallpoint|en54/.test(n)
  });

  const CACHE = new Map();
  let cachedLength = -1;

  function normalize(value=''){
    return String(value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
  function compact(value=''){ return normalize(value).replace(/\s+/g, ''); }
  function tokens(value=''){ return normalize(value).split(/\s+/).filter(Boolean); }
  function unique(values){ return [...new Set(values.filter(Boolean))]; }

  function refParts(ref){
    const spaced = String(ref||'')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Za-z])([0-9])/g, '$1 $2')
      .replace(/([0-9])([A-Za-z])/g, '$1 $2');
    return unique([...tokens(ref), ...tokens(spaced), compact(ref)]);
  }

  function shortDescription(product){
    return String(product && product.short_description || '').trim();
  }

  function commercialName(product){
    const ref = String(product && product.name || '');
    const short = shortDescription(product);
    // El nombre comercial se obtiene de la primera parte útil de la descripción
    // corta. No se inventan familias fuera de la información ya mantenida.
    return [ref.replace(/^AJ-/i,'').replace(/-(W|B)$/i,'').replace(/-/g,' '), short].join(' ');
  }

  function productSearchFields(product){
    const p = product || {};
    return unique([
      p.name,
      p.brand,
      p.short_description,
      p.description,
      p.desc,
      p.family,
      p.familia,
      p.category,
      p.categoria,
      p.tags,
      p.keywords,
      p._desc,
      p._family,
      p._official,
      p._search175
    ].map(value=>String(value || '').trim()));
  }

  function buildRecord(product, index){
    const ref = String(product && product.name || '');
    const short = shortDescription(product);
    const full = String(product && (product.description || product.desc) || '');
    const name = commercialName(product);
    const searchFields = productSearchFields(product);
    const unified = searchFields.join(' ');
    return {
      product, index, ref, short, full, name, unified,
      refNorm: normalize(ref), refCompact: compact(ref), refTokens: new Set(refParts(ref)),
      nameNorm: normalize(name), nameCompact: compact(name), nameTokens: new Set(tokens(name)),
      shortNorm: normalize(short), shortCompact: compact(short), shortTokens: new Set(tokens(short)),
      fullNorm: normalize(full), fullCompact: compact(full), fullTokens: new Set(tokens(full)),
      unifiedNorm: normalize(unified), unifiedCompact: compact(unified), unifiedTokens: new Set(tokens(unified)),
      isAccessory: /DUMMY|BRACKET|HOOD|LENS|COVER|HOLDER|MAGNET|REED|REPAIR|BRANDPLATE|JUNCTIONBOX|SURFACEBOX/i.test(ref),
      isBundle: /KIT/i.test(ref)
    };
  }

  function expandedQuery(raw){
    const norm = normalize(raw);
    const base = tokens(norm);
    const additions = [];
    const directAlias = ALIASES[norm];
    if(directAlias) additions.push(...directAlias);
    for(const token of base){
      if(ALIASES[token]) additions.push(...ALIASES[token]);
    }
    return {norm, compact:compact(norm), base, expanded:unique([...base, ...additions.flatMap(tokens)])};
  }

  function fieldTokenHits(queryTokens, fieldTokens){
    let hits=0;
    for(const token of queryTokens){ if(fieldTokens.has(token)) hits++; }
    return hits;
  }

  function scoreRecord(record, query){
    if(!query.norm) return 0;
    let score = 0;
    let meaningful = false;

    // Referencia: siempre manda.
    if(record.refCompact === query.compact){ score += 320; meaningful=true; }
    else if(record.refCompact.startsWith(query.compact)){ score += 220; meaningful=true; }
    else if(query.compact.length >= 2 && record.refCompact.includes(query.compact)){ score += 180; meaningful=true; }

    const refHits = fieldTokenHits(query.base, record.refTokens);
    if(refHits){ score += refHits * 95; meaningful=true; }
    if(query.base.length > 1 && refHits === query.base.length) score += 70;

    // Nombre/familia comercial.
    if(record.nameNorm.includes(query.norm)){ score += 90; meaningful=true; }
    const nameHits = fieldTokenHits(query.expanded, record.nameTokens);
    if(nameHits){ score += nameHits * 45; meaningful=true; }

    // Descripción corta oficial recibida desde el CSV.
    if(record.shortNorm && (record.shortNorm.includes(query.norm) || record.shortCompact.includes(query.compact))){ score += 70; meaningful=true; }
    const shortHits = fieldTokenHits(query.expanded, record.shortTokens);
    if(shortHits){ score += shortHits * 32; meaningful=true; }

    // Índice común para todos los orígenes. Incluye descripción completa,
    // familia, categoría y etiquetas, sin distinguir entre Visio y manual.
    if(record.unifiedNorm.includes(query.norm) || record.unifiedCompact.includes(query.compact)){
      score += 58;
      meaningful=true;
    }
    const unifiedHits = fieldTokenHits(query.base, record.unifiedTokens);
    if(unifiedHits){ score += unifiedHits * 18; meaningful=true; }

    // La descripción completa ayuda a ordenar, pero no sustituye a la referencia.
    if(record.fullNorm && record.fullNorm.includes(query.norm)){ score += 24; meaningful=true; }
    const fullHits = fieldTokenHits(query.base, record.fullTokens);
    if(fullHits){ score += fullHits * 10; meaningful=true; }

    // Alias técnicos: ayudan solo cuando encuentran palabras reales.
    const aliasOnly = query.expanded.filter(t=>!query.base.includes(t));
    let aliasScore=0;
    for(const t of aliasOnly){
      const compactAlias = compact(t);
      const inReference = record.refTokens.has(t) || (compactAlias.length >= 3 && record.refCompact.includes(compactAlias));
      const inName = record.nameTokens.has(t) || (compactAlias.length >= 3 && record.nameCompact.includes(compactAlias));
      const inShort = record.shortTokens.has(t) || (compactAlias.length >= 3 && record.shortCompact.includes(compactAlias));
      const inUnified = record.unifiedTokens.has(t) || (compactAlias.length >= 3 && record.unifiedCompact.includes(compactAlias));
      if(inReference || inName) aliasScore += 48;
      else if(inShort) aliasScore += 36;
      else if(inUnified) aliasScore += 20;
    }
    if(aliasScore){ score += aliasScore; meaningful=true; }

    const asksAccessory = /\b(soporte|caja|carcasa|dummy|repuesto|lente|tapa|bracket|holder|hood|junction|magnet|iman)\b/.test(query.norm);
    if(record.isAccessory && !asksAccessory) score -= 240;
    const asksBundle = /\b(kit|pack|starter)\b/.test(query.norm);
    if(record.isBundle && !asksBundle) score -= 110;

    // En consultas de varias palabras, exige que todos los términos originales
    // aparezcan en algún campo. Evita listas enormes por una sola palabra común.
    if(query.base.length > 1){
      const allFields = new Set([
        ...record.refTokens, ...record.nameTokens,
        ...record.shortTokens, ...record.fullTokens, ...record.unifiedTokens
      ]);
      const covered = query.base.filter(t=>allFields.has(t)).length;
      if(covered === query.base.length) score += 45;
      else score -= (query.base.length-covered) * 45;
    }

    return meaningful && score >= 8 ? score : 0;
  }

  function rank(products, rawQuery, limit=300){
    const list = Array.isArray(products) ? products : [];
    const query = expandedQuery(rawQuery);
    if(!query.norm) return [];
    const key = `${query.norm}|${list.length}|${limit}`;
    if(cachedLength !== list.length){ CACHE.clear(); cachedLength=list.length; }
    if(CACHE.has(key)) return CACHE.get(key);

    const ranked = list.map((product,index)=>{
      const record = buildRecord(product,index);
      const score = scoreRecord(record,query);
      return score ? {
        ...product,
        _hxaIndex: Number.isInteger(product && product._hxaIndex) ? product._hxaIndex : index,
        _score: score,
        _reasons: [],
        _variantBase: normalize(record.ref).replace(/\b(?:w|b)\b/g,'').trim(),
        _color: /-B(?:-|$)/i.test(record.ref) ? 'black' : /-W(?:-|$)/i.test(record.ref) ? 'white' : ''
      } : null;
    }).filter(Boolean).sort((a,b)=>
      b._score-a._score ||
      String(a.name||'').localeCompare(String(b.name||''),'es',{numeric:true,sensitivity:'base'})
    ).slice(0,limit);

    if(CACHE.size>160) CACHE.clear();
    CACHE.set(key,ranked);
    return ranked;
  }

  function adapt(products, query, limit=300){
    return rank(products,query,limit)
      .map(x=>({p:products[x._hxaIndex],i:x._hxaIndex,score:x._score,reasons:x._reasons||[]}))
      .filter(x=>x.p);
  }

  const engine = {
    normalize,
    compact,
    rank,
    scoreProduct:(p,q)=>({score:scoreRecord(buildRecord(p,0),expandedQuery(q))}),
    version:'5.0-unificado',
    catalogFilters:CATALOG_FILTERS
  };
  global.HXA_KNOWLEDGE_ENGINE = engine;
  global.HXA_SEARCH_ENGINE = engine;

  function getProducts(){
    try{ return (typeof productos !== 'undefined' && Array.isArray(productos)) ? productos : []; }
    catch(e){ return []; }
  }

  function alphabeticalRows(source){
    return source.map((p,i)=>({p,i,score:1})).sort((a,b)=>
      String(a.p.name||'').localeCompare(String(b.p.name||''),'es',{numeric:true,sensitivity:'base'})
    );
  }

  function searchRows(source, term, limit=300){
    const q=String(term||'').trim();
    return q ? adapt(source,q,limit) : alphabeticalRows(source);
  }

  function applyCatalogQuick(rows, term){
    let quick='';
    try{ quick = typeof catalogQuick204 !== 'undefined' ? String(catalogQuick204||'') : ''; }
    catch(e){}
    if(!quick) return rows;

    // “Más usados” conserva su aprendizaje real, pero usa el motor común
    // cuando además hay texto escrito.
    if(quick==='used'){
      try{
        if(typeof listaMasUsados206 === 'function') return listaMasUsados206(term);
      }catch(e){}
      return [];
    }

    const test=CATALOG_FILTERS[quick];
    if(typeof test !== 'function') return rows;
    return rows.filter(x=>{
      const name=(x.p&&x.p.name)||'';
      // Los filtros trabajan con la referencia compacta y estable.
      const catalogName=String(name).toLowerCase();
      return test(catalogName);
    });
  }

  function applyCatalogLetter(rows){
    let letter='';
    try{ letter = typeof catalogLetter193 !== 'undefined' ? String(catalogLetter193||'') : ''; }
    catch(e){}
    if(!letter) return rows;
    try{
      if(typeof catalogLetterOf193 === 'function'){
        return rows.filter(x=>catalogLetterOf193(x.p)===letter);
      }
    }catch(e){}
    return rows;
  }

  // Punto único de entrada para Inicio y Catálogo.
  // El Catálogo añade únicamente sus filtros de navegación sobre el mismo ranking.
  buscar = function(term){
    return searchRows(getProducts(),term,300);
  };

  buscarCatalogo = function(term=''){
    const source=getProducts();
    let rows=searchRows(source,term,300);
    rows=applyCatalogQuick(rows,term);
    rows=applyCatalogLetter(rows);
    return rows;
  };

  global.HX_APP_VERSION='';

  const SEARCH_PLACEHOLDER='Buscar por referencia o descripción…';
  function applySharedUiPolicy(){
    ['buscador','catalogFilter','exploreFilter210'].forEach(id=>{
      const input=document.getElementById(id);
      if(input) input.placeholder=SEARCH_PLACEHOLDER;
    });
    document.querySelectorAll('.creator').forEach(el=>{
      el.textContent='· Creado por David Corregidor';
    });
  }
  if(typeof document!=='undefined'){
    document.addEventListener('DOMContentLoaded',applySharedUiPolicy);
    document.addEventListener('input',e=>{
      if(e.target && e.target.id==='exploreFilter210') e.target.placeholder=SEARCH_PLACEHOLDER;
    },true);
    setTimeout(applySharedUiPolicy,0);
  }
})(typeof window!=='undefined' ? window : globalThis);
