/*
 * HXA Common Search Engine 4.0
 * Motor único, genérico y determinista.
 * Sin reglas Ajax, sin atajos, sin aliases.
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

function forms(t){
  t=normalize(t);
  const out=new Set([t]);
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
  for(const n of names){
    const v=p?.[n];
    if(v!=null&&raw(v)!=='')return raw(v);
  }
  return '';
}
function readAll(p,names){
  return names.map(n=>raw(p?.[n])).filter(Boolean).join(' ');
}
function fieldInfo(v){
  const text=normalize(v);
  return {text,words:tokens(text)};
}

function buildRecord(product,index){
  const ref=readFirst(product,FIELDS.reference);
  return {
    product,index,
    reference:fieldInfo(ref),
    identity:fieldInfo(readAll(product,FIELDS.identity)),
    short:fieldInfo(readAll(product,FIELDS.short)),
    long:fieldInfo(readAll(product,FIELDS.long)),
    extra:fieldInfo(readAll(product,FIELDS.extra)),
    refCompact:compact(ref)
  };
}

function wordPosition(field,term){
  for(let i=0;i<field.words.length;i++){
    if(equivalent(field.words[i],term))return i;
  }
  return 9999;
}

function identityDirectness(record, queryTokens){
  // Evalúa si la consulta está respaldada por los campos que describen QUÉ ES el producto.
  // No conoce valores concretos: solo presencia, posición y cobertura.
  const identityFields=[
    record.identity,
    record.short
  ];

  let matched=0;
  let position=0;
  let starts=0;

  for(const term of queryTokens){
    let bestPos=9999;
    let found=false;

    for(const field of identityFields){
      const pos=wordPosition(field,term);
      if(pos!==9999){
        found=true;
        bestPos=Math.min(bestPos,pos);
        if(pos===0) starts++;
      }
    }

    if(found){
      matched++;
      position+=bestPos;
    }else{
      position+=999;
    }
  }

  return {
    matched,
    starts,
    position
  };
}

function supportInfo(record, queryTokens){
  // Señal secundaria genérica: si varios resultados empatan por referencia,
  // mirar dónde aparece la consulta en los campos reales del producto.
  // No interpreta tipos concretos ni sufijos de referencia.
  const fields=[
    {field:record.identity,priority:0},
    {field:record.short,priority:1},
    {field:record.long,priority:2},
    {field:record.extra,priority:3}
  ];

  let matched=0;
  let priority=99;
  let position=99999;

  for(const term of queryTokens){
    let best=null;

    for(const entry of fields){
      const pos=wordPosition(entry.field,term);
      if(pos===9999) continue;

      const candidate={priority:entry.priority,position:pos};
      if(!best
        || candidate.priority<best.priority
        || (candidate.priority===best.priority && candidate.position<best.position)){
        best=candidate;
      }
    }

    if(best){
      matched++;
      priority=Math.min(priority,best.priority);
      position=Math.min(position,best.position);
    }
  }

  return {matched,priority,position};
}
function exactWord(field,term){
  return wordPosition(field,term)!==9999;
}
function prefixWord(field,term){
  if(term.length<2)return false;
  return field.words.some(w=>w.startsWith(term));
}

function exactExists(records,term){
  return records.some(r =>
    exactWord(r.reference,term) ||
    exactWord(r.identity,term) ||
    exactWord(r.short,term) ||
    exactWord(r.long,term) ||
    exactWord(r.extra,term)
  );
}

function matchInfo(r,term,allowPrefix){
  const tc=compact(term);

  // 1. REFERENCIA / NOMBRE: prioridad absoluta.
  if(r.refCompact===tc) return {cls:0,pos:0};
  if(exactWord(r.reference,term)) return {cls:1,pos:wordPosition(r.reference,term)};

  // término contenido dentro de referencia compuesta:
  // button -> doublebutton, motion -> motioncam, etc.
  if(term.length>=3 && r.refCompact.includes(tc))
    return {cls:2,pos:r.refCompact.indexOf(tc)};

  if(allowPrefix&&prefixWord(r.reference,term))
    return {cls:3,pos:0};

  // 2. IDENTIDAD ESTRUCTURADA.
  if(exactWord(r.identity,term))
    return {cls:10,pos:wordPosition(r.identity,term)};

  if(allowPrefix&&prefixWord(r.identity,term))
    return {cls:11,pos:0};

  // 3. DESCRIPCIÓN CORTA.
  if(exactWord(r.short,term))
    return {cls:20,pos:wordPosition(r.short,term)};

  if(allowPrefix&&prefixWord(r.short,term))
    return {cls:21,pos:0};

  // 4. DESCRIPCIÓN LARGA / EXTRA.
  if(exactWord(r.long,term))
    return {cls:30,pos:wordPosition(r.long,term)};

  if(exactWord(r.extra,term))
    return {cls:31,pos:wordPosition(r.extra,term)};

  return null;
}


function structuredText(product){
  return normalize([
    product?.product_type, product?.tipo,
    product?.subcategory, product?.subcategoria, product?.subfamily, product?.subfamilia,
    product?.family, product?.familia,
    product?.category, product?.categoria
  ].filter(Boolean).join(' '));
}

function secondaryRolePenalty(product){
  const structured=structuredText(product);
  const name=normalize(product?.name||'');

  // Solo desempate global; nunca excluye.
  if(/\bdummy\b|\bmaqueta\b|\bdemo\b/.test(`${structured} ${name}`)) return 30;
  if(/\b(repuesto|repuestos|recambio|recambios|accesorio|accesorios|soporte|soportes|carcasa|housing|cover|bracket|mount)\b/.test(structured)) return 20;
  if(/\b(kit|kits|bundle|pack)\b/.test(structured)) return 10;
  return 0;
}

function explorerAffinity(product,query){
  const meta=global.HXA_EXPLORER_SEARCH_META;
  if(!meta) return 0;

  const q=normalize(query);
  if(!q) return 0;

  const qWords=tokens(q);
  const structured=structuredText(product);
  const ref=normalize(product?.name||'');
  const short=normalize(product?.short_description||'');

  let score=0;

  // Familia/categoría trabajada en Explorer.
  for(const group of (meta.familyGroups||[])){
    const queryInGroup=group.some(label =>
      qWords.some(word => equivalent(word,label)) || q.includes(label)
    );
    if(!queryInGroup) continue;

    const productInGroup=group.some(label => structured.includes(label));
    if(productInGroup) score+=40;
  }

  // Atajos/aliases: afinidad binaria por campo.
  // No se acumula por cada palabra para no favorecer variantes largas.
  for(const rule of (meta.aliases||[])){
    let rx;
    try{ rx=new RegExp(rule.source,rule.flags||''); }catch(_e){ continue; }
    if(!rx.test(q)) continue;

    const terms=tokens(rule.add||'').filter(term=>term.length>=3);
    const refHit=terms.some(term =>
      ref.split(/\s+/).some(word => equivalent(word,term)) ||
      compact(ref).includes(compact(term))
    );
    const structuredHit=terms.some(term =>
      structured.split(/\s+/).some(word => equivalent(word,term))
    );
    const shortHit=terms.some(term =>
      short.split(/\s+/).some(word => equivalent(word,term))
    );

    if(refHit) score+=8;
    if(structuredHit) score+=5;
    if(shortHit) score+=2;
  }

  return score;
}


function thematicAffinity(product,query){
  const getClassification=global.HXA_EXPLORER_CLASSIFICATION;
  const q=normalize(query);
  const qWords=tokens(q);
  if(!qWords.length) return 0;

  let classification=null;
  if(typeof getClassification==='function'){
    try{ classification=getClassification(product); }catch(_e){}
  }

  // Fallback a campos estructurados si Explorer todavía no ha cargado.
  const familyText=normalize(classification ? [
    classification.category,
    classification.family,
    classification.subcategory,
    classification.familyTitle,
    classification.displayTitle,
    classification.profile
  ].filter(Boolean).join(' ') : structuredText(product));

  const quickText=normalize(
    classification?.quicks?.length
      ? classification.quicks.join(' ')
      : ''
  );

  const familyWords=tokens(familyText);
  const quickWords=tokens(quickText);

  let score=0;

  // Consulta directa contra familia/perfil/atajo.
  for(const term of qWords){
    if(familyWords.some(word=>equivalent(word,term))) score+=120;
    if(quickWords.some(word=>equivalent(word,term))) score+=160;

    if(term.length>=3){
      if(familyWords.some(word=>word.startsWith(term))) score+=70;
      if(quickWords.some(word=>word.startsWith(term))) score+=100;
    }
  }

  // Los aliases ya trabajados en Explorer sirven para traducir intención
  // (sirenas, teclados, botón, PHOD, etc.) a sus familias/atajos.
  const meta=global.HXA_EXPLORER_SEARCH_META;
  if(meta?.aliases){
    for(const rule of meta.aliases){
      let rx;
      try{ rx=new RegExp(rule.source,rule.flags||''); }catch(_e){ continue; }
      if(!rx.test(q)) continue;

      const aliasTerms=tokens(rule.add||'')
        .filter(term=>term.length>=3);

      for(const term of aliasTerms){
        if(familyWords.some(word=>equivalent(word,term))) score+=25;
        if(quickWords.some(word=>equivalent(word,term))) score+=45;
      }
    }
  }

  return score;
}


function explorerNaturalOrder(product){
  const getOrder=global.HXA_EXPLORER_NATURAL_ORDER;
  if(typeof getOrder!=='function') return Number.MAX_SAFE_INTEGER;
  try{
    const value=Number(getOrder(product));
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
  }catch(_e){
    return Number.MAX_SAFE_INTEGER;
  }
}

function search(products,query,options={}){
  const list=Array.isArray(products)?products:[];
  const q=tokens(query);
  if(!q.length)return [];

  const records=list.map(buildRecord);
  const prefixPolicy=new Map();
  for(const term of q) prefixPolicy.set(term,!exactExists(records,term));

  const result=[];
  for(const r of records){
    const infos=[];
    let valid=true;
    for(const term of q){
      const info=matchInfo(r,term,prefixPolicy.get(term));
      if(!info){valid=false;break;}
      infos.push(info);
    }
    if(!valid)continue;

    const referenceHits=infos.filter(x=>x.cls<=3).length;
    const support=supportInfo(r,q);
    const identity=identityDirectness(r,q);

    result.push({
      product:r.product,index:r.index,

      // Dimensión temática independiente de la coincidencia textual.
      thematic:thematicAffinity(r.product,query),

      // Orden natural de Explorer dentro de la familia ya correcta.
      explorerOrder:explorerNaturalOrder(r.product),

      worst:Math.max(...infos.map(x=>x.cls)),
      referenceHits,
      explorerAffinity:explorerAffinity(r.product,query),
      secondaryPenalty:secondaryRolePenalty(r.product),
      identityHits:infos.filter(x=>x.cls>=10&&x.cls<=11).length,
      identityMatched:identity.matched,
      identityStarts:identity.starts,
      identityPosition:identity.position,
      supportMatched:support.matched,
      supportPriority:support.priority,
      supportPosition:support.position,
      total:infos.reduce((sum,x)=>sum+x.cls,0),
      position:infos.reduce((sum,x)=>sum+(Number.isFinite(x.pos)?x.pos:999),0),
      refLength:r.refCompact.length
    });
  }

  result.sort((a,b)=>
    // 1) Afinidad temática REAL: familia/perfil/atajo de Explorer.
    b.thematic-a.thematic ||

    // 2) Calidad textual de la coincidencia.
    a.worst-b.worst ||
    b.referenceHits-a.referenceHits ||

    // 3) Producto funcional antes que kit/accesorio/dummy,
    //    solo como desempate.
    a.secondaryPenalty-b.secondaryPenalty ||

    // 4) Dentro del mismo grupo correcto, heredar el orden natural de Explorer.
    a.explorerOrder-b.explorerOrder ||

    // 5) Resto de desempates estables.
    b.explorerAffinity-a.explorerAffinity ||
    b.identityMatched-a.identityMatched ||
    b.identityStarts-a.identityStarts ||
    a.identityPosition-b.identityPosition ||
    b.supportMatched-a.supportMatched ||
    a.supportPriority-b.supportPriority ||
    a.supportPosition-b.supportPosition ||
    b.identityHits-a.identityHits ||
    a.total-b.total ||
    a.position-b.position ||
    a.refLength-b.refLength ||
    String(a.product?.name||'').localeCompare(String(b.product?.name||''),'es',{numeric:true,sensitivity:'base'})
  );
  return result.slice(0,Math.max(1,Number(options.limit)||300));
}

function rank(products,q,limit=300){
  return search(products,q,{limit}).map(m=>({
    ...m.product,
    _hxaIndex:m.index,
    _matchClass:m.worst
  }));
}

function rows(products,q,limit=300){
  return search(products,q,{limit}).map(m=>({
    p:m.product,
    i:m.index,
    matchClass:m.worst
  }));
}

const engine={
  version:'5.2-thematic-explorer-order',
  normalize,compact,search,rank,rows,
  defaultFields:FIELDS
};

global.HXA_COMMON_SEARCH=engine;
global.HXA_SEARCH_ENGINE=engine;
global.HXA_KNOWLEDGE_ENGINE=engine;

})(typeof window!=='undefined'?window:globalThis);
