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
    '4g': ['lte'],
    'wi fi': ['wifi'],
    wifi: ['wi fi'],
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
  let cachedSignature = '';
  let indexedSignature = '';
  let indexedRecords = [];
  let indexedProducts = null;

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

  function searchValue(value){
    if(value === undefined || value === null) return '';
    if(Array.isArray(value)) return value.map(searchValue).filter(Boolean).join(' ');
    if(typeof value === 'object') return Object.values(value).map(searchValue).filter(Boolean).join(' ');
    return String(value).trim();
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
    ].map(searchValue));
  }

  function buildRecord(product, index){
    const ref = String(product && product.name || '');
    const short = shortDescription(product);
    const full = String(product && (product.description || product.desc) || '');
    const name = commercialName(product);
    const brand = searchValue(product && (product.brand || product.marca));
    const family = searchValue(product && (product.family || product.familia || product._family));
    const category = searchValue(product && (product.category || product.categoria));
    const tags = searchValue(product && (product.tags || product.keywords));
    const searchFields = productSearchFields(product);
    const unified = searchFields.join(' ');
    return {
      product, index, ref, short, full, name, brand, family, category, tags, unified,
      refNorm: normalize(ref), refCompact: compact(ref), refTokens: new Set(refParts(ref)),
      nameNorm: normalize(name), nameCompact: compact(name), nameTokens: new Set(tokens(name)),
      shortNorm: normalize(short), shortCompact: compact(short), shortTokens: new Set(tokens(short)),
      fullNorm: normalize(full), fullCompact: compact(full), fullTokens: new Set(tokens(full)),
      brandNorm: normalize(brand), brandTokens: new Set(tokens(brand)),
      familyNorm: normalize(family), familyTokens: new Set(tokens(family)),
      categoryNorm: normalize(category), categoryTokens: new Set(tokens(category)),
      tagsNorm: normalize(tags), tagsTokens: new Set(tokens(tags)),
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

  function fieldContains(fieldNorm,fieldTokens,queryNorm){
    if(!fieldNorm || !queryNorm) return false;
    if(fieldNorm===queryNorm || fieldTokens.has(queryNorm)) return true;

    // Desde 2 caracteres admitimos prefijo de palabra de forma genérica.
    // Ej.: hu -> hub, mo -> motion, ke -> keypad.
    // No usamos reglas ni alias específicos, y evitamos coincidencias
    // interiores como "4g" dentro de "64g".
    if(queryNorm.length >= 2){
      for(const token of fieldTokens){
        if(String(token).startsWith(queryNorm)) return true;
      }
    }

    // Para cadenas largas mantenemos también la coincidencia parcial clásica.
    return queryNorm.length>=5 && fieldNorm.includes(queryNorm);
  }

  function scoreRecord(record, query){
    if(!query.norm) return 0;
    let score = 0;
    let meaningful = false;

    // SIM: si el propio producto/descripcion se identifica como SIM,
    // priorizarlo cuando el usuario busca "sim". No cambia familia ni atajos.
    if(query.norm === 'sim' && /\bsim\b|\bm2m\b/.test(record.unifiedNorm)){
      score += 210;
      meaningful=true;
    }

    // Referencia: siempre manda.
    if(record.refCompact === query.compact){ score += 320; meaningful=true; }
    else if(record.refCompact.startsWith(query.compact)){ score += 220; meaningful=true; }
    else if(query.compact.length >= 3 && record.refCompact.includes(query.compact)){ score += 180; meaningful=true; }

    const refHits = fieldTokenHits(query.base, record.refTokens);
    if(refHits){ score += refHits * 95; meaningful=true; }
    if(query.base.length > 1 && refHits === query.base.length) score += 70;

    // Nombre/familia comercial.
    if(fieldContains(record.nameNorm,record.nameTokens,query.norm)){ score += 90; meaningful=true; }
    const nameHits = fieldTokenHits(query.expanded, record.nameTokens);
    if(nameHits){ score += nameHits * 45; meaningful=true; }

    // Descripción corta oficial recibida desde el CSV.
    if(record.shortNorm && (fieldContains(record.shortNorm,record.shortTokens,query.norm) || (query.compact.length>=6 && record.shortCompact.includes(query.compact)))){ score += 70; meaningful=true; }
    const shortHits = fieldTokenHits(query.expanded, record.shortTokens);
    if(shortHits){ score += shortHits * 32; meaningful=true; }

    // Familia y categoría son campos propios. Permiten buscar términos como
    // “domótica”, “sirenas” o “videovigilancia” aunque no aparezcan literalmente
    // en la descripción comercial. Pesan menos que referencia/descripciones.
    if(fieldContains(record.familyNorm,record.familyTokens,query.norm)){ score += 52; meaningful=true; }
    const familyHits = fieldTokenHits(query.expanded, record.familyTokens);
    if(familyHits){ score += familyHits * 24; meaningful=true; }

    if(fieldContains(record.categoryNorm,record.categoryTokens,query.norm)){ score += 44; meaningful=true; }
    const categoryHits = fieldTokenHits(query.expanded, record.categoryTokens);
    if(categoryHits){ score += categoryHits * 20; meaningful=true; }

    if(fieldContains(record.tagsNorm,record.tagsTokens,query.norm)){ score += 30; meaningful=true; }
    const tagHits = fieldTokenHits(query.expanded, record.tagsTokens);
    if(tagHits){ score += tagHits * 14; meaningful=true; }

    if(fieldContains(record.brandNorm,record.brandTokens,query.norm)){ score += 16; meaningful=true; }

    // Índice común para todos los orígenes. Incluye descripción completa,
    // familia, categoría y etiquetas, sin distinguir entre Visio y manual.
    if(fieldContains(record.unifiedNorm,record.unifiedTokens,query.norm) || (query.compact.length>=6 && record.unifiedCompact.includes(query.compact))){
      score += 58;
      meaningful=true;
    }
    const unifiedHits = fieldTokenHits(query.base, record.unifiedTokens);
    if(unifiedHits){ score += unifiedHits * 18; meaningful=true; }

    // La descripción completa ayuda a ordenar, pero no sustituye a la referencia.
    if(fieldContains(record.fullNorm,record.fullTokens,query.norm)){ score += 24; meaningful=true; }
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
        ...record.refTokens, ...record.nameTokens, ...record.shortTokens, ...record.fullTokens,
        ...record.familyTokens, ...record.categoryTokens, ...record.tagsTokens, ...record.brandTokens,
        ...record.unifiedTokens
      ]);
      const covered = query.base.filter(t=>allFields.has(t)).length;
      if(covered === query.base.length) score += 45;
      else score -= (query.base.length-covered) * 45;
    }

    return meaningful && score >= 8 ? score : 0;
  }

  function catalogSignature(list){
    // Huella de todo el contenido indexable. Así una actualización del CSV
    // invalida el índice aunque conserve exactamente el mismo número de filas.
    let hash=2166136261;
    for(const product of list){
      const value=productSearchFields(product).join('\u001f');
      for(let i=0;i<value.length;i++){
        hash^=value.charCodeAt(i);
        hash=Math.imul(hash,16777619);
      }
    }
    return `${list.length}:${hash>>>0}`;
  }

  function recordsFor(list,signature){
    if(indexedProducts!==list || indexedSignature!==signature){
      indexedProducts=list;
      indexedSignature=signature;
      indexedRecords=list.map(buildRecord);
      CACHE.clear();
      cachedSignature=signature;
    }
    return indexedRecords;
  }

  function familyKey(record){
    return String(record&&record.ref||'').toUpperCase()
      .replace(/-(?:W|B)(?=-|$)/g,'')
      .replace(/--+/g,'-').replace(/-$/,'').trim();
  }

  function colorOrder(record,query){
    const ref=String(record&&record.ref||'').toUpperCase();
    const asksBlack=/\b(?:negro|black)\b/.test(query.norm);
    if(asksBlack) return /-B(?:-|$)/.test(ref)?0:/-W(?:-|$)/.test(ref)?1:2;
    return /-W(?:-|$)/.test(ref)?0:/-B(?:-|$)/.test(ref)?1:2;
  }

  function expandFamilyVariants(ranked,records,query,limit){
    if(!ranked.length) return ranked;
    const byFamily=new Map();
    for(const record of records){
      const key=familyKey(record);
      if(!key) continue;
      if(!byFamily.has(key)) byFamily.set(key,[]);
      byFamily.get(key).push(record);
    }
    const rankedByFamily=new Map();
    for(const item of ranked){
      const key=familyKey(records[item._hxaIndex]);
      if(!rankedByFamily.has(key)) rankedByFamily.set(key,[]);
      rankedByFamily.get(key).push(item);
    }
    const out=[];
    const seen=new Set();
    for(const item of ranked){
      const record=records[item._hxaIndex];
      const key=familyKey(record);
      if(seen.has(key)) continue;
      seen.add(key);
      const present=rankedByFamily.get(key)||[];
      const best=Math.max(...present.map(x=>x._score),item._score);
      const presentIndexes=new Set(present.map(x=>x._hxaIndex));
      const variants=(byFamily.get(key)||[])
        .filter(r=>!presentIndexes.has(r.index))
        .sort((a,b)=>colorOrder(a,query)-colorOrder(b,query)||a.ref.localeCompare(b.ref,'es',{numeric:true,sensitivity:'base'}))
        .map((r,n)=>({
          ...r.product,_hxaIndex:r.index,_score:Math.max(1,best-(n+1)/1000),
          _reasons:['variante de familia'],_variantBase:key,
          _color:/-B(?:-|$)/i.test(r.ref)?'black':/-W(?:-|$)/i.test(r.ref)?'white':''
        }));
      out.push(...present.sort((a,b)=>
        colorOrder(records[a._hxaIndex],query)-colorOrder(records[b._hxaIndex],query)||
        b._score-a._score||String(a.name||'').localeCompare(String(b.name||''),'es',{numeric:true,sensitivity:'base'})
      ),...variants);
      if(out.length>=limit) break;
    }
    return out.slice(0,limit);
  }

  function rank(products, rawQuery, limit=300){
    const list = Array.isArray(products) ? products : [];
    const query = expandedQuery(rawQuery);
    if(!query.norm) return [];
    const signature=catalogSignature(list);
    const key = `${query.norm}|${signature}|${limit}`;
    const records=recordsFor(list,signature);
    if(CACHE.has(key)) return CACHE.get(key);

    let ranked = records.map(record=>{
      const product=record.product;
      const score = scoreRecord(record,query);
      return score ? {
        ...product,
        _hxaIndex: Number.isInteger(product && product._hxaIndex) ? product._hxaIndex : record.index,
        _score: score,
        _reasons: [],
        _variantBase: familyKey(record),
        _color: /-B(?:-|$)/i.test(record.ref) ? 'black' : /-W(?:-|$)/i.test(record.ref) ? 'white' : ''
      } : null;
    }).filter(Boolean).sort((a,b)=>
      b._score-a._score ||
      String(a.name||'').localeCompare(String(b.name||''),'es',{numeric:true,sensitivity:'base'})
    );

    ranked=expandFamilyVariants(ranked,records,query,limit);
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
    clearCache:()=>{ CACHE.clear(); cachedSignature=''; indexedSignature=''; indexedRecords=[]; indexedProducts=null; },
    version:'6.0-indice-unico',
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

})(typeof window!=='undefined' ? window : globalThis);
