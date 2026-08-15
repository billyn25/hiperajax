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

function fallbackProjectContext(product,query){
  const structured = structuredText(product);
  const name = normalize(product?.name || '');
  const q = normalize(query);

  let role = 'product';
  if(/\b(dummy|dummies|maqueta|maquetas|demo)\b/.test(`${structured} ${name}`)) role = 'dummy';
  else if(/\b(kit|kits|bundle|pack)\b/.test(`${structured} ${name}`)) role = 'kit';
  else if(/\b(repuesto|repuestos|recambio|recambios|soporte|soportes|carcasa|housing|cover|bracket|mount|accesorio|accesorios|pila|pilas|bateria|batería|baterias|baterías)\b/.test(structured)) role = 'accessory';

  let intent = 'product';
  if(/\b(dummy|dummies|maqueta|maquetas|demo)\b/.test(q)) intent = 'dummy';
  else if(/\b(kit|kits|bundle|pack)\b/.test(q)) intent = 'kit';
  else if(/\b(soporte|soportes|bracket|brackets|mount|holder|carcasa|carcasas|cover|covers|tapa|tapas|repuesto|repuestos|recambio|recambios|accesorio|accesorios|pila|pilas|bateria|batería|baterias|baterías)\b/.test(q)) intent = 'accessory';

  let groupRank = 1;
  if(intent === 'product'){
    groupRank = ({product:1, kit:2, accessory:3, dummy:4})[role] ?? 4;
  }else if(intent === 'kit'){
    groupRank = ({kit:0, product:1, accessory:2, dummy:3})[role] ?? 4;
  }else if(intent === 'accessory'){
    groupRank = ({accessory:0, dummy:1, product:2, kit:3})[role] ?? 4;
  }else{
    groupRank = ({dummy:0, accessory:1, kit:2, product:3})[role] ?? 4;
  }

  return {groupRank, affinity:0, role};
}

function projectContext(product,query){
  const provider = global.HXA_EXPLORER_PRODUCT_CONTEXT;
  if(typeof provider === 'function'){
    try{
      const context = provider(product,query);
      if(context && Number.isFinite(Number(context.groupRank))){
        return {
          groupRank:Number(context.groupRank),
          affinity:Number(context.affinity)||0,
          role:String(context.role||'product')
        };
      }
    }catch(error){
      console.warn('[HXA Search] No se pudo obtener contexto de Explorer', error);
    }
  }

  return fallbackProjectContext(product,query);
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
    const project=projectContext(r.product,query);

    result.push({
      product:r.product,index:r.index,
      worst:Math.max(...infos.map(x=>x.cls)),
      referenceHits,

      // Agrupación global del proyecto:
      // producto principal -> otro funcional -> kit -> accesorio -> dummy.
      projectGroup:project.groupRank,
      projectAffinity:project.affinity,

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
    a.worst-b.worst ||
    b.referenceHits-a.referenceHits ||

    // Solo cambia el desempate, nunca el conjunto de resultados.
    a.projectGroup-b.projectGroup ||
    b.projectAffinity-a.projectAffinity ||

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
  version:'4.9-project-groups-trial',
  normalize,compact,search,rank,rows,
  defaultFields:FIELDS
};

global.HXA_COMMON_SEARCH=engine;
global.HXA_SEARCH_ENGINE=engine;
global.HXA_KNOWLEDGE_ENGINE=engine;

})(typeof window!=='undefined'?window:globalThis);
