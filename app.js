
/* v4.2.8 · feedback único y recuperación inmediata desde caché */
const CSV_URL = './catalogo_ajax.csv';
const STORAGE_LISTA = 'presupuestos_ajax_hiperantena_lista';
const STORAGE_CONTADOR = 'presupuestos_ajax_hiperantena_contador';
const STORAGE_TEMA = 'presupuestador_ajax_tema';
const STORAGE_LISTA_BACKUP = 'presupuestos_ajax_hiperantena_lista_backup_v1';
const STORAGE_LISTA_META = 'presupuestos_ajax_hiperantena_lista_meta_v2';
const STORAGE_LISTA_SLOT_A = 'presupuestos_ajax_hiperantena_snapshot_a_v2';
const STORAGE_LISTA_SLOT_B = 'presupuestos_ajax_hiperantena_snapshot_b_v2';
const STORAGE_LISTA_LEGACY = [
  'presupuestos_ajax_hiperantena',
  'presupuestos_ajax_lista',
  'presupuestos_hiperajax_lista',
  'hiperajax_presupuestos',
  STORAGE_LISTA_BACKUP
];
let productos = [];
let lineas = [];
let seleccionado = null;
let seleccionadoRef = '';
let seleccionadoPvp = null;
let activeIndex = -1;
let catalogTerm = "";
const $ = (q) => document.querySelector(q);
const fmt = new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'});

function leerJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }catch(e){ return fallback; } }
function escribirJSON(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function siguienteNumero(soloVer=false){
  const year = new Date().getFullYear();
  let data = leerJSON(STORAGE_CONTADOR, {year, n:1});
  if(data.year !== year) data = {year, n:1};
  const numero = `HA-${year}-${String(data.n).padStart(4,'0')}`;
  if(!soloVer){ data.n += 1; escribirJSON(STORAGE_CONTADOR, data); }
  return numero;
}
function asegurarNumero(){ if(!($('#numero').value||'').trim()) $('#numero').value = siguienteNumero(false); return $('#numero').value; }
function findProductoByQuery(q){
  const t = normaliza(q);
  return productos.find(p => normaliza(p.name) === t) || productos.find(p => normaliza(p.name).includes(t)) || buscar(q)[0]?.p || null;
}
function descuentoActual(){ return Math.max(0, Math.min(100, Number($('#dtoGeneral')?.value)||0)); }
function aplicarDescuentoGeneralALineas(){
  const d = descuentoActual();
  lineas.forEach(l => l.dto = d);
  render();
}
let hxScrollPendiente = 0;
function hxBajarUltimaLineaPresupuesto(){
  clearTimeout(hxScrollPendiente);
  hxScrollPendiente = setTimeout(()=>{
    const scroller = document.querySelector('.budget-card .table-scroll') || document.querySelector('.table-scroll');
    if(!scroller) return;
    const ejecutar = ()=>{
      const ultima = scroller.querySelector('tbody tr:last-child');
      if(!ultima) return;
      try{ scroller.scrollTo({top:scroller.scrollHeight, behavior:'smooth'}); }
      catch(e){ scroller.scrollTop = scroller.scrollHeight; }
      ultima.classList.remove('hx-linea-recien-anadida');
      void ultima.offsetWidth;
      ultima.classList.add('hx-linea-recien-anadida');
      try{ ultima.scrollIntoView({behavior:'smooth', block:'nearest', inline:'nearest'}); }catch(e){}
      setTimeout(()=>ultima.classList.remove('hx-linea-recien-anadida'), 1100);
    };
    requestAnimationFrame(()=>requestAnimationFrame(ejecutar));
  }, 30);
}

function hxDescripcionCortaProducto(p, fallback=''){
  const corta = String((p && p.short_description) || '').trim();
  if(corta) return corta;
  const alternativa = String(fallback || '').trim();
  if(alternativa) return alternativa;
  return String((p && p.description) || '').trim();
}

function hxEstadoStock(stockRaw){
  const raw = String(stockRaw ?? '').trim();
  const key = normaliza(raw).replace(/[^a-z0-9]+/g,'');
  if(!raw) return {visible:false, clase:'', texto:''};
  if(['high','alto','mucho','disponible','available','instock','enstock'].includes(key)) return {visible:true, clase:'is-ok', texto:raw};
  if(['medium','medio','low','bajo','poco','limited','limitado'].includes(key)) return {visible:true, clase:'is-low', texto:raw};
  if(['none','sinstock','agotado','outofstock','unavailable','nodisponible','zero'].includes(key)) return {visible:true, clase:'is-none', texto:raw};
  const n = numero(raw);
  if(Number.isFinite(n)) return {visible:true, clase:n >= 10 ? 'is-ok' : n > 0 ? 'is-low' : 'is-none', texto:raw};
  return {visible:true, clase:'is-low', texto:raw};
}

function addProductoObj(p, qty=1, dto=null){
  if(!p) return false;
  const descReal = hxDescripcionCortaProducto(p);
  let descFinal = descReal;
  if(!descFinal){
    try{ descFinal = String((descripcionProducto(p) || {}).desc || '').trim(); }catch(e){}
  }
  lineas.push({name:p.name, brand:p.brand||'', pvp:p.pvp, desc:descFinal, short_description:String(p.short_description||'').trim(), origen_catalogo:String(p.origen_catalogo||''), stock:p.stock??'', precio_neto_compra:numero(p.precio_neto_compra)||0, qty:Math.max(1,Number(qty)||1), dto:dto===null ? descuentoActual() : (Number(dto)||0)});
  registrarReciente(p.name);
  hxBajarUltimaLineaPresupuesto();
  return true;
}

/* =====================================================
   NÚCLEO CRÍTICO · INTEGRIDAD DE PRODUCTO
   La interfaz puede ordenar o filtrar por índices, pero el alta final
   siempre se resuelve por la referencia exacta mostrada y valida su PVP.
   ===================================================== */
function hxRefProducto(value){
  return String(value||'').trim().toUpperCase();
}
function hxPrecioIgual(a,b){
  const x=Number(a), y=Number(b);
  return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x-y) < 0.000001;
}
function hxResolverProductoExacto(ref, expectedPvp=null){
  const key=hxRefProducto(ref);
  if(!key) return {ok:false,error:'Referencia de producto vacía.'};
  const matches=productos.filter(p=>p && hxRefProducto(p.name)===key);
  if(matches.length!==1){
    return {ok:false,error:matches.length ? `La referencia ${key} está duplicada en el catálogo.` : `La referencia ${key} no existe en el catálogo.`};
  }
  const product=matches[0];
  if(expectedPvp!==null && expectedPvp!==undefined && expectedPvp!=='' && !hxPrecioIgual(product.pvp, expectedPvp)){
    return {ok:false,error:`El precio de ${key} ha cambiado. Operación cancelada para evitar añadir un importe incorrecto.`};
  }
  return {ok:true,product};
}
function hxAddProductoSeguro(ref, qty=1, dto=null, expectedPvp=null){
  const resolved=hxResolverProductoExacto(ref, expectedPvp);
  if(!resolved.ok){
    hxToastGlobal(resolved.error,'error');
    console.error('[Hiper Ajax] Alta cancelada por integridad:', {ref,expectedPvp,error:resolved.error});
    return false;
  }
  return addProductoObj(resolved.product, qty, dto);
}

let hxQuickSessionLines=new Map();
function hxQuickAddSessionReset(){hxQuickSessionLines=new Map()}
window.HXQ_RESET_SESSION=hxQuickAddSessionReset;

function hxQuickAddSumar(ref,qty=1,expectedPvp=null){
  const resolved=hxResolverProductoExacto(ref,expectedPvp);
  if(!resolved.ok){hxToastGlobal(resolved.error,'error');return {ok:false,totalQty:0}}
  const product=resolved.product;
  const cantidad=Math.max(1,Number(qty)||1);
  const key=hxRefProducto(product.name);
  let sessionLine=hxQuickSessionLines.get(key);

  if(sessionLine && lineas.includes(sessionLine)){
    sessionLine.qty=Math.max(1,Number(sessionLine.qty)||1)+cantidad;
    registrarReciente(product.name);
    hxBajarUltimaLineaPresupuesto();
  }else{
    if(!addProductoObj(product,cantidad,null)) return {ok:false,totalQty:0};
    sessionLine=lineas[lineas.length-1];
    hxQuickSessionLines.set(key,sessionLine);
  }

  try{render()}catch(_error){}
  const totalQty=Math.max(1,Number(sessionLine?.qty)||cantidad);
  hxToastGlobal(`${product.name} añadido · ${totalQty} ud${totalQty===1?'':'s'}`,'ok');
  return {ok:true,totalQty};
}
window.HXQ_ADD_PRODUCT=hxQuickAddSumar;

function normaliza(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }

/* =====================================================
   BUSCADOR COMÚN
   Única entrada de búsqueda de producto para Inicio y Catálogo.
   Explorer usa el mismo HXA_COMMON_SEARCH.rank() sobre su subconjunto.
   ===================================================== */
function hxBuscarComun(term){
  const engine=window.HXA_COMMON_SEARCH || window.HXA_SEARCH_ENGINE;
  if(!engine || typeof engine.rows!=='function') return [];
  return engine.rows(productos,String(term||''),300);
}


/* =====================================================
   COMPATIBLES OFICIALES (related_products)
   Prueba: no añade nada automáticamente.
   ===================================================== */
function hxRelatedRefs(product){
  const raw = String(product?.related_products || '').trim();
  if(!raw) return [];
  return [...new Set(raw.split(/[,;|]+/).map(v=>v.trim()).filter(Boolean))];
}

function hxProductByRef(reference){
  const wanted = String(reference||'').trim().toLowerCase();
  if(!wanted) return null;
  return productos.find(p => String(p?.name||'').trim().toLowerCase() === wanted) || null;
}

function hxResolvedRelated(product){
  return hxRelatedRefs(product)
    .map(ref => hxProductByRef(ref))
    .filter(Boolean)
    .filter((p,idx,arr) => arr.findIndex(x => String(x.name).toLowerCase() === String(p.name).toLowerCase()) === idx);
}

function hxRelatedCategory(product){
  const ref = normaliza(String(product?.name||''));
  const taxonomy = normaliza([
    product?.category, product?.category_parent, product?.family,
    product?.subcategory, product?.product_type
  ].filter(Boolean).join(' '));
  const short = normaliza(String(product?.short_description||''));

  const own = `${ref} ${taxonomy} ${short}`;

  // 0 Soportes / montaje: el producto ES físicamente un soporte, holder,
  // bracket, junction box o elemento de montaje.
  if(
    /(?:^|[-_])(bracket|mount|holder|junctionbox|junction|dinholder)(?:[-_]|$)/.test(ref)
    || /\b(bracket|mount|holder|junction ?box|caja de conexiones|caja conexiones|soporte para|soporte de montaje|soporte pared|soporte techo|soporte poste)\b/.test(own)
  ) return 0;

  // 1 Alimentación: el producto ES una pila/batería/fuente/adaptador/inyector.
  // No clasificar equipos que simplemente "se alimentan con" una pila.
  if(
    /^(?:\d+x)?batt[-_]/.test(ref)
    || /(?:^|[-_])(battery|bateria|pila|psu|power|adapter|adaptador|injector|inyector)(?:[-_]|$)/.test(ref)
    || /\b(pila|bateria|batería|fuente de alimentacion|fuente de alimentación|alimentador|adaptador de corriente|inyector poe|power supply)\b/.test(taxonomy)
    || /^\s*(pila|bateria|batería|fuente|alimentador|adaptador|inyector)\b/.test(short)
  ) return 1;

  // 2 Almacenamiento: el producto ES almacenamiento.
  if(
    /(?:^|[-_])(hdd|ssd|sd|microsd)(?:[-_]|$)/.test(ref)
    || /\b(discos? duros?|hdd|ssd|almacenamiento|tarjetas? sd|micro ?sd|storage)\b/.test(taxonomy)
    || /^\s*(disco|hdd|ssd|tarjeta sd|micro ?sd)\b/.test(short)
  ) return 2;

  // 4 Repuestos: el producto ES un repuesto/carcasa/dummy/PCB/lente/cubierta.
  if(
    /(?:^|[-_])(dummy|pcb|cover|lens|carcasa|repuesto)(?:[-_]|$)/.test(ref)
    || /\b(repuestos?|recambio|dummy|carcasa|cover|tapa|pcb|lente)\b/.test(taxonomy)
    || /^\s*(repuesto|recambio|carcasa|tapa|pcb|lente)\b/.test(short)
  ) return 4;

  // Todo lo demás es un compatible funcional, aunque su ficha mencione
  // alimentación, montaje o baterías.
  return 3;
}

function hxSortedRelated(product){
  return hxResolvedRelated(product).sort((a,b)=>
    hxRelatedCategory(a)-hxRelatedCategory(b)
    || (Number(a?.pvp)||Number(a?.PVP)||0) - (Number(b?.pvp)||Number(b?.PVP)||0)
    || String(a?.name||'').localeCompare(String(b?.name||''),'es',{numeric:true,sensitivity:'base'})
  );
}

function hxCompatImage(product){
  try{ if(typeof hxImagenProducto==='function') return hxImagenProducto(product)||''; }catch(_e){}
  return String(product?.image||product?.image_path||'').trim();
}

function hxCompatStock(product){
  const raw = product?.stock;
  try{
    const state = hxEstadoStock(raw);
    const text = String(state?.texto || '').trim();
    if(text && !/^(high|none|low|medium)$/i.test(text)){
      return {text, cls:String(state?.clase||'')};
    }
  }catch(_e){}

  const n = normaliza(String(raw ?? ''));
  if(!n || n==='none' || n==='0' || n==='sin stock' || n==='out of stock'){
    return {text:'Sin stock', cls:'is-out'};
  }
  if(n==='high' || n==='alto' || n==='available' || n==='disponible'){
    return {text:'Disponible', cls:'is-ok'};
  }
  if(n==='medium' || n==='medio'){
    return {text:'Stock medio', cls:'is-mid'};
  }
  if(n==='low' || n==='bajo'){
    return {text:'Stock limitado', cls:'is-low'};
  }
  const num = Number(String(raw).replace(',','.'));
  if(Number.isFinite(num)){
    if(num <= 0) return {text:'Sin stock', cls:'is-out'};
    if(num <= 3) return {text:'Stock limitado', cls:'is-low'};
    return {text:'Disponible', cls:'is-ok'};
  }
  return {text:'', cls:''};
}


function hxCompatFunctionalType(product){
  const ref=normaliza(String(product?.name||''));
  const taxonomy=normaliza([product?.category,product?.category_parent,product?.family,product?.subcategory,product?.product_type].filter(Boolean).join(' '));
  const short=normaliza(String(product?.short_description||''));
  const own=`${ref} ${taxonomy} ${short}`;

  if(/^(?:\d+x)?batt[-_]/.test(ref) || /\b(pila|pilas|bateria|baterias|batería|baterías|battery|batteries)\b/.test(taxonomy) || /^\s*(pila|bateria|batería|pack de .*pilas|pack de .*baterias)\b/.test(short))
    return {key:'baterias',label:'Pilas / Baterías',icon:'▯',tone:'amber'};
  if(/waterstop|valve|valvula|válvula|electrovalvula|electroválvula/.test(own))
    return {key:'valvulas',label:'Válvulas',icon:'◉',tone:'blue'};
  if(/keypad|teclado|touchscreen/.test(own))
    return {key:'teclados',label:'Teclados',icon:'⌨',tone:'violet'};

  if(/motionprotect|doorprotect|leaksprotect|fireprotect|glassprotect|combiprotect|motioncam|curtain|outdoorprotect|detector|fotodetector|contacto magnetico|contacto magnético|inundacion|inundación/.test(own))
    return {key:'detectores',label:'Detectores',icon:'◎',tone:'red'};
  if(/spacecontrol|doublebutton|button|boton|botón|mando/.test(own))
    return {key:'mandos',label:'Mandos / Botones',icon:'●',tone:'orange'};
  if(/(?:^|[-_])(bracket|mount|holder|junctionbox|junction|dinholder)(?:[-_]|$)/.test(ref) || /\b(bracket|mount|holder|junction ?box|caja de conexiones|soporte para|soporte de montaje|soporte pared|soporte techo|soporte poste)\b/.test(own))
    return {key:'soportes',label:'Soportes',icon:'⌘',tone:'slate'};
  if(/(?:^|[-_])(dummy|pcb|cover|lens|carcasa|repuesto)(?:[-_]|$)/.test(ref) || /\b(repuestos?|recambio|dummy|carcasa|cover|tapa|pcb|lente)\b/.test(taxonomy) || /^\s*(repuesto|recambio|carcasa|tapa|pcb|lente)\b/.test(short))
    return {key:'repuestos',label:'Repuestos',icon:'↻',tone:'rose'};
  if(/(?:^|[-_])(hdd|ssd|sd|microsd)(?:[-_]|$)/.test(ref) || /\b(discos? duros?|hdd|ssd|almacenamiento|tarjetas? sd|micro ?sd|storage)\b/.test(taxonomy) || /^\s*(disco|hdd|ssd|tarjeta sd|micro ?sd)\b/.test(short))
    return {key:'almacenamiento',label:'Almacenamiento',icon:'◇',tone:'cyan'};
  if(/\b(fuente de alimentacion|fuente de alimentación|alimentador|adaptador de corriente|inyector poe|power supply)\b/.test(taxonomy) || /(?:^|[-_])(psu|power|adapter|adaptador|injector|inyector)(?:[-_]|$)/.test(ref))
    return {key:'alimentacion',label:'Alimentación',icon:'ϟ',tone:'yellow'};
  return {key:'otros',label:'Otros',icon:'•••',tone:'neutral'};
}

function hxCompatCategoryLabel(product){ return hxCompatFunctionalType(product).label; }
function hxEnsureCompatModal(){
  let modal=document.getElementById('hxCompatModal');
  if(modal)return modal;
  modal=document.createElement('div');modal.id='hxCompatModal';modal.className='hx-compat-modal hidden';
  modal.innerHTML=`<div class="hx-compat-backdrop" data-hx-compat-close></div><section class="hx-compat-dialog" role="dialog" aria-modal="true">
  <header class="hx-compat-header"><div class="hx-compat-heading"><span class="hx-compat-heading-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8.5 8.5 5.8 11.2a3.4 3.4 0 0 0 4.8 4.8l2.7-2.7"/><path d="m15.5 15.5 2.7-2.7a3.4 3.4 0 0 0-4.8-4.8l-2.7 2.7"/><path d="m9.5 14.5 5-5"/></svg></span><div class="hx-compat-heading-copy"><strong id="hxCompatTitle">Compatibles</strong><span id="hxCompatOfficial" class="hx-compat-official"></span></div></div><span class="hx-compat-close hx-compat-control" role="button" tabindex="0" data-hx-compat-close aria-label="Cerrar" title="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></span></header>
  <div id="hxCompatOrigin" class="hx-compat-origin"></div>
  <nav id="hxCompatTabs" class="hx-compat-tabs"></nav>
  <div class="hx-compat-results-head"><strong id="hxCompatCount"></strong></div>
  <div id="hxCompatAddedNotice" class="hx-compat-added-notice" aria-live="polite"></div>
  <div id="hxCompatList" class="hx-compat-list"></div>
  <div class="hx-compat-note"><strong>Relaciones oficiales del catálogo de Visiotech Connect.</strong><span>Mostramos solo compatibles que existen en nuestro catálogo.</span></div></section>`;
  document.body.appendChild(modal);
  modal.addEventListener('click',ev=>{if(ev.target.closest('[data-hx-compat-close]'))modal.classList.add('hidden')});
  modal.addEventListener('keydown',ev=>{
    if(ev.key!=='Enter' && ev.key!==' ') return;
    const control=ev.target.closest('.hx-compat-control');
    if(!control) return;
    ev.preventDefault();
    control.click();
  });
  return modal;
}
function hxOpenCompatibles(product){
  const all=hxSortedRelated(product);if(!all.length)return;
  const modal=hxEnsureCompatModal(), title=modal.querySelector('#hxCompatTitle'), official=modal.querySelector('#hxCompatOfficial'), origin=modal.querySelector('#hxCompatOrigin'), tabs=modal.querySelector('#hxCompatTabs'), count=modal.querySelector('#hxCompatCount'), list=modal.querySelector('#hxCompatList');
  title.textContent=`Compatibles con ${product?.name||''}`;official.textContent=`${all.length} compatible${all.length===1?'':'s'} oficial${all.length===1?'':'es'}`;
  const oi=hxCompatImage(product),od=(product?.short_description||product?.description||'').trim();
  origin.innerHTML=`${oi?`<img src="${escapeHtml(oi)}" alt="">`:''}<div class="hx-compat-origin-copy"><div class="hx-compat-origin-title"><strong>${escapeHtml(product?.name||'')}</strong><em>✓ Producto actual</em></div><span>${escapeHtml(od)}</span></div>`;
const functionalOrder=['detectores','baterias','valvulas','teclados','mandos','soportes','alimentacion','almacenamiento','repuestos','otros'];
  const discovered=new Map();
  all.forEach(p=>{ const t=hxCompatFunctionalType(p); if(!discovered.has(t.key)) discovered.set(t.key,t); });
  const groups=[
    {key:'todos',label:'Todos',icon:'⊞',tone:'green',count:all.length},
    ...functionalOrder.filter(key=>discovered.has(key)).map(key=>{
      const t=discovered.get(key);
      return {...t,count:all.filter(p=>hxCompatFunctionalType(p).key===key).length};
    })
  ];
  let active='todos';
  function paint(){
    const shown=active==='todos'?all:all.filter(p=>hxCompatFunctionalType(p).key===active);
    tabs.innerHTML=groups.map(group=>`<span class="hx-compat-tab hx-compat-control ${active===group.key?'is-active':''} tone-${group.tone||'neutral'}" role="button" tabindex="0" data-hx-tab="${group.key}"><span class="hx-tab-icon">${group.icon}</span><span>${group.label} <em>(${group.count})</em></span></span>`).join('');
    count.textContent=`${shown.length} producto${shown.length===1?'':'s'} compatible${shown.length===1?'':'s'}`;
    list.innerHTML=shown.map((p,i)=>{const image=hxCompatImage(p),desc=(p?.short_description||p?.description||'').trim(),stock=hxCompatStock(p),price=Number(p?.pvp??p?.PVP??p?.precio_venta_cliente_final??0);return `<article class="hx-compat-item" data-hx-compat-row="${i}">
  <div class="hx-compat-photo">${image?`<img src="${escapeHtml(image)}" alt="">`:''}</div>
  <div class="hx-compat-main">
    <div class="hx-compat-refline">
      <strong>${escapeHtml(p.name||'')}</strong>
      <span>${escapeHtml(hxCompatCategoryLabel(p))}</span>
    </div>
    <p>${escapeHtml(desc)}</p>
    <div class="hx-compat-meta">
      <small class="${escapeHtml(stock?.cls||'')}">${escapeHtml(stock?.text||'')}</small>
      
    </div>
  </div>
  <div class="hx-compat-commerce">
    <strong>${price?fmt.format(price):''}</strong>
    <div class="hx-compat-qty" aria-label="Cantidad">
      <span class="hx-compat-step hx-compat-control" role="button" tabindex="0" data-hx-compat-minus="${i}">−</span>
      <span data-hx-compat-qty="${i}">1</span>
      <span class="hx-compat-step hx-compat-control" role="button" tabindex="0" data-hx-compat-plus="${i}">+</span>
    </div>
    <span class="hx-compat-add hx-compat-control" role="button" tabindex="0" data-hx-compat-add="${i}">Añadir</span>
  </div>
</article>`}).join('');
    tabs.querySelectorAll('[data-hx-tab]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.hxTab;paint()}));
    list.querySelectorAll('[data-hx-compat-minus]').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.hxCompatMinus);
      const qtyEl=list.querySelector(`[data-hx-compat-qty="${i}"]`);
      if(!qtyEl)return;
      const qty=Math.max(1,Number(qtyEl.textContent||1)-1); qtyEl.textContent=String(qty); const add=list.querySelector(`[data-hx-compat-add="${i}"]`); if(add&&!add.classList.contains('is-added')) add.textContent=qty>1?`Añadir ${qty}`:'Añadir';
    }));
    list.querySelectorAll('[data-hx-compat-plus]').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.hxCompatPlus);
      const qtyEl=list.querySelector(`[data-hx-compat-qty="${i}"]`);
      if(!qtyEl)return;
      const qty=Math.min(99,Number(qtyEl.textContent||1)+1); qtyEl.textContent=String(qty); const add=list.querySelector(`[data-hx-compat-add="${i}"]`); if(add&&!add.classList.contains('is-added')) add.textContent=qty>1?`Añadir ${qty}`:'Añadir';
    }));
    list.querySelectorAll('[data-hx-compat-add]').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.hxCompatAdd);
      const p=shown[i];
      if(!p)return;
      const qtyEl=list.querySelector(`[data-hx-compat-qty="${i}"]`);
      const qty=Math.max(1,Number(qtyEl?.textContent||1));
      const ix=productos.indexOf(p);
      if(ix>=0){
        hxAddProductoModal('compatibles', ix, qty, p?.name, p?.pvp);
      }
      try{
        window.dispatchEvent(new CustomEvent('hxa:budget-updated',{
          detail:{source:'compatibles',product:p,quantity:qty}
        }));
      }catch(_error){}
      try{
        const notice=modal.querySelector('#hxCompatAddedNotice');
        if(notice){
          const merged=[...lineas].reverse().find(row=>row && String(row.name||'').trim()===String(p?.name||'').trim());
          const totalQty=Math.max(qty,Number(merged?.qty)||qty);
          notice.textContent=`✓ ${String(p?.name||'Producto')} · cantidad ${totalQty}`;
          notice.classList.add('is-visible');
          clearTimeout(modal.__hxCompatNoticeTimer);
          modal.__hxCompatNoticeTimer=setTimeout(()=>notice.classList.remove('is-visible'),1800);
        }
      }catch(_error){}
      const originalText=btn.dataset.hxOriginalText || btn.textContent || 'Añadir';
      btn.dataset.hxOriginalText=originalText;
      btn.textContent=qty>1?`✓ ${qty} uds`:'✓ Añadido';
      btn.classList.add('is-added');
      clearTimeout(btn.__hxCompatAddedTimer);
      btn.__hxCompatAddedTimer=setTimeout(()=>{
        const currentQty=Math.max(1,Number(list.querySelector(`[data-hx-compat-qty=\"${i}\"]`)?.textContent||1));
        btn.textContent=currentQty>1?`Añadir ${currentQty}`:'Añadir';
        btn.classList.remove('is-added');
      },900);
    }));
  }
  paint();
  list.scrollTop=0;
  try{ list.scrollTo({top:0,left:0,behavior:'auto'}); }catch(_error){}
  modal.classList.remove('hidden');
  requestAnimationFrame(()=>{
    list.scrollTop=0;
    try{ list.scrollTo({top:0,left:0,behavior:'auto'}); }catch(_error){}
  });
}

let hxSearchInputTimer = null;

function hxProgramarBusquedaInicio(term){
  clearTimeout(hxSearchInputTimer);
  hxSearchInputTimer = setTimeout(() => {
    pintarResultados(term);
  }, 140);
}

function resolverDesdeInput(inputOrValue){
  const term = typeof inputOrValue === 'string'
    ? inputOrValue
    : String(inputOrValue?.target?.value ?? inputOrValue?.value ?? '');

  clearTimeout(hxSearchInputTimer);

  // Solo UX mientras se escribe. El motor no cambia.
  if(String(term||'').trim().length < 3){
    pintarResultados('');
    return;
  }

  hxProgramarBusquedaInicio(term);
}
function numero(v){
  if(typeof v === 'number') return v;
  const s = String(v||'').replace(/€/g,'').replace(/\s/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',', '.');
  const n = parseFloat(s); return Number.isFinite(n) ? n : 0;
}
function splitCSVLine(line, sep){
  const out=[]; let cur='', q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i], n=line[i+1];
    if(c==='"' && q && n==='"'){ cur+='"'; i++; continue; }
    if(c==='"'){ q=!q; continue; }
    if(c===sep && !q){ out.push(cur.trim()); cur=''; continue; }
    cur+=c;
  }
  out.push(cur.trim()); return out;
}
function parseCSV(txt){
  txt = txt.replace(/^\uFEFF/,'').trim();
  const lines = txt.split(/\r?\n/).filter(l=>l.trim());
  if(!lines.length) return [];
  const sep = (lines[0].match(/;/g)||[]).length >= (lines[0].match(/,/g)||[]).length ? ';' : ',';
  let header = splitCSVLine(lines[0], sep).map(h=>normaliza(h).replace(/[^a-z0-9]/g,''));
  let start = 1;
  const hasHeader = header.some(h => ['name','nombre','producto','descripcion','brand','marca','pvp','precio'].includes(h));
  if(!hasHeader){ header = ['name','brand','pvp']; start = 0; }
  const idxName = header.findIndex(h=>['name','nombre','producto','descripcion','referencia','codigo'].includes(h));
  const idxBrand = header.findIndex(h=>['brand','marca','fabricante'].includes(h));
  const idxPvp = header.findIndex(h=>['pvp','precio','price','importe'].includes(h));
  return lines.slice(start).map(line=>{
    const c = splitCSVLine(line, sep);
    const name = c[idxName>=0?idxName:0] || '';
    const brand = c[idxBrand>=0?idxBrand:1] || '';
    const pvp = numero(c[idxPvp>=0?idxPvp:2]);
    return {name:name.trim(), brand:brand.trim(), pvp};
  }).filter(p=>p.name && p.pvp>=0).sort((a,b)=>a.name.localeCompare(b.name,'es'));
}

function cargarSelect(){
  const sel = $('#producto');
  sel.innerHTML = '<option value="">Elegir desde desplegable...</option>' + productos.map((p,i)=>`<option value="${i}">${escapeHtml(p.name)}</option>`).join('');
  pintarCatalogPanel('');
}


const AJAX_KNOWLEDGE = [{"n":"StarterKit","f":"Kits básicos","d":"Kit con Hub, MotionProtect, DoorProtect y SpaceControl"},{"n":"StarterKit (4G)","f":"Kits básicos","d":"Kit con Hub 2 (4G), MotionProtect, DoorProtect y SpaceControl"},{"n":"StarterKit 2","f":"Kits básicos","d":"Kit con Hub 2 (2G), MotionProtect, DoorProtect y SpaceControl"},{"n":"StarterKit Cam","f":"Kits básicos","d":"Kit con Hub 2 (2G), MotionCam, DoorProtect y SpaceControl"},{"n":"StarterKit Cam Plus","f":"Kits básicos","d":"Kit con Hub 2 Plus, MotionCam, DoorProtect y SpaceControl"},{"n":"StarterKit Plus","f":"Kits básicos","d":"Kit con Hub Plus, MotionProtect, DoorProtect y SpaceControl"},{"n":"EN54 Fire Hub Jeweller","f":"Hubs","d":"ECI inalámbrico para un sistema de alarma contra incendios, que admite dispositivos de protección contra intrusiones"},{"n":"Hub (2G) Jeweller","f":"Hubs","d":"Panel de control inalámbrico. Admite Ethernet y una tarjeta SIM (2G)"},{"n":"Hub (4G) Jeweller","f":"Hubs","d":"Panel de control inalámbrico. Admite Ethernet y una tarjeta SIM (LTE)"},{"n":"Hub 2 (2G) Jeweller","f":"Hubs","d":"Panel de control inalámbrico con soporte para la fotoverificación. Admite Ethernet y dos tarjetas SIM (2G)"},{"n":"Hub 2 (4G) Jeweller","f":"Hubs","d":"Panel de control inalámbrico con soporte para la fotoverificación. Admite Ethernet y dos tarjetas SIM (2G/3G/LTE)"},{"n":"Hub 2 Plus Jeweller","f":"Hubs","d":"Panel de control inalámbrico con soporte para la fotoverificación. Admite Wi-Fi, Ethernet y dos tarjetas SIM (2G/3G/LTE)"},{"n":"Hub BP Jeweller","f":"Hubs","d":"Panel de control inalámbrico alimentado por batería. Admite la verificación fotográfica. Se conecta mediante dos tarjetas SIM (2G/3G/LTE)."},{"n":"Hub BP Jeweller (without casing)","f":"Hubs","d":"Panel de control inalámbrico alimentado por batería diseñado para su instalación en una carcasa Ajax. Admite verificación fotográfica. Se conecta mediante dos tarjetas SIM (2G/3G/LTE)."},{"n":"Superior Hub G3 Jeweller","f":"Hubs","d":"Panel de control inalámbrico con soporte para fotoverificación. Puede conectarse a través de Ethernet, Wi-Fi y dos tarjetas SIM (2G/LTE)."},{"n":"Superior Hub Hybrid (2G)","f":"Hubs","d":"Panel de control híbrido con soporte para la fotoverificación. Funciona con dispositivos Fibra y Jeweller. Admite Ethernet y dos tarjetas SIM (2G)"},{"n":"Superior Hub Hybrid (4G)","f":"Hubs","d":"Panel de control híbrido con soporte para la fotoverificación. Funciona con dispositivos Fibra y Jeweller. Admite Ethernet y dos tarjetas SIM (2G/3G/LTE)"},{"n":"Superior Hub Hybrid (4G) (without casing)","f":"Hubs","d":"Panel de control híbrido diseñado para su instalación en la Case D. Funciona con dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet y dos tarjetas SIM (2G/3G/LTE)."},{"n":"Superior Hub Hybrid 2","f":"Hubs","d":"Panel de control híbrido para instalaciones medianas y grandes. Funciona con hasta 250 dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet y dos tarjetas SIM (2G/3G/LTE)."},{"n":"Superior Hub Hybrid 2 (without casing)","f":"Hubs","d":"Panel de control híbrido para instalaciones medianas y grandes. Diseñado para su instalación en una carcasa Ajax compatible. Funciona con hasta 250 dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet y dos tarjetas SIM (2G/3G/LTE)."},{"n":"Superior MegaHub","f":"Hubs","d":"Panel de control híbrido para los proyectos más grandes. Funciona con hasta 999 dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet, Wi-Fi y dos tarjetas SIM (2G/LTE)."},{"n":"Superior MegaHub (without casing)","f":"Hubs","d":"Panel de control híbrido para los proyectos más grandes. Diseñado para su instalación en una carcasa Ajax compatible. Funciona con hasta 999 dispositivos Fibra y Jeweller. Puede conectarse a través de Ethernet, Wi-Fi y dos tarjetas SIM (2G/LTE)."},{"n":"EN54 Fire ReX Jeweller","f":"Repetidores de señal","d":"Repetidor de señal de radio inalámbrico direccionable para un sistema de alarma contra incendios. Admite dispositivos de protección contra intrusiones"},{"n":"ReX 2 Jeweller","f":"Repetidores de señal","d":"Repetidor de señal de radio inalámbrico que admite los protocolos Jeweller y Wings"},{"n":"ReX Jeweller","f":"Repetidores de señal","d":"Repetidor de señal de radio inalámbrico"},{"n":"Superior ReX G3 Jeweller","f":"Repetidores de señal","d":"Repetidor de señal de radio inalámbrico con soporte para la fotoverificación y conexión Ethernet"},{"n":"DoorProtect Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico de apertura con relé reed"},{"n":"DoorProtect Plus Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico y combinado de apertura, impacto e inclinación con relé reed y acelerómetro"},{"n":"Superior DoorProtect Fibra","f":"Detectores de apertura","d":"Detector cableado de apertura para interiores"},{"n":"Superior DoorProtect Plus Fibra","f":"Detectores de apertura","d":"Detector cableado de apertura con sensores de impacto e inclinación"},{"n":"Superior DoorProtect G3 Fibra","f":"Detectores de apertura","d":"Detector de apertura con sensores de impacto, inclinación y enmascaramiento magnético"},{"n":"Superior DoorProtect G3 Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico de apertura con relé reed y sensores de impacto, inclinación y enmascaramiento"},{"n":"Superior DoorProtect Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico de apertura con dos relés reed. Versión Superior"},{"n":"Superior DoorProtect Plus Jeweller","f":"Detectores de apertura","d":"Detector inalámbrico y combinado de apertura, impacto e inclinación con dos relés reed y acelerómetro. Versión Superior"},{"n":"GlassProtect Jeweller","f":"Detectores de rotura de cristal","d":"Detector inalámbrico de rotura de cristal con micrófono"},{"n":"Superior GlassProtect Fibra","f":"Detectores de rotura de cristal","d":"Detector cableado de rotura de cristal con micrófono"},{"n":"Superior GlassProtect Jeweller","f":"Detectores de rotura de cristal","d":"Detector inalámbrico de rotura de cristal con micrófono. Versión Superior"},{"n":"CombiProtect Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento y de rotura de cristal con micrófono"},{"n":"Curtain Outdoor Jeweller","f":"Detectores de movimiento","d":"Detector inalámbrico de movimiento tipo cortina de doble tecnología para exteriores e interiores"},{"n":"DualCurtain Outdoor Jeweller","f":"Detectores de movimiento","d":"Detector IR inalámbrico y bidireccional de movimiento tipo cortina"},{"n":"MotionCam (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica"},{"n":"MotionCam Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento que admite la función de foto por alarma"},{"n":"MotionCam Outdoor HighMount (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica. Para instalación en exteriores a una altura de 2–4 m."},{"n":"MotionCam Outdoor Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento que toma fotos por alarma. Para exteriores e interiores"},{"n":"MotionProtect Curtain Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento tipo cortina"},{"n":"MotionProtect Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento"},{"n":"MotionProtect Plus Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento con sensor de microondas de banda K adicional"},{"n":"Superior CombiProtect Fibra","f":"Detectores de movimiento","d":"Detector IR cableado y combinado de movimiento y de rotura de cristal con micrófono"},{"n":"Superior CombiProtect Jeweller","f":"Detectores de movimiento","d":"Detector IR inalámbrico y combinado de movimiento y de rotura de cristal con micrófono. Versión Superior"},{"n":"Superior MotionCam (PhOD) Fibra","f":"Detectores de movimiento","d":"Detector PIR y cableado de movimiento con posibilidades ampliadas de verificación fotográfica"},{"n":"Superior MotionCam (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica"},{"n":"Superior MotionCam AM (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con un sistema antienmascaramiento y posibilidades ampliadas de verificación fotográfica. Admite resolución HD."},{"n":"Superior MotionCam Fibra","f":"Detectores de movimiento","d":"Detector IR y cableado de movimiento que admite la función de foto por alarma"},{"n":"Superior MotionCam HD (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica. Admite resolución HD."},{"n":"Superior MotionProtect Fibra","f":"Detectores de movimiento","d":"Detector IR y cableado de movimiento"},{"n":"Superior MotionProtect G3 Fibra","f":"Detectores de movimiento","d":"Detector PIR y cableado de movimiento con un sistema antienmascaramiento"},{"n":"Superior MotionProtect Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento. Versión Superior"},{"n":"Superior MotionProtect Plus Fibra","f":"Detectores de movimiento","d":"Detector IR y cableado de movimiento con sensor de microondas de banda K adicional"},{"n":"Superior MotionProtect Plus G3 Fibra","f":"Detectores de movimiento","d":"Detector IR y cableado de movimiento con un sensor de microondas de banda K adicional y sistema antienmascaramiento"},{"n":"Superior MotionProtect Plus Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento con sensor de microondas de banda K adicional. Versión Superior"},{"n":"Curtain Outdoor Mini Jeweller","f":"Detectores de movimiento","d":"Detector inalámbrico de movimiento tipo cortina de doble tecnología para exteriores e interiores"},{"n":"CurtainCam Outdoor HighMount (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector inalámbrico de movimiento tipo cortina de doble tecnología con posibilidades ampliadas de verificación fotográfica. Para instalación en exteriores a una altura de 2–4 m."},{"n":"MotionCam Outdoor (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica. Para exteriores e interiores"},{"n":"MotionProtect Outdoor Jeweller","f":"Detectores de movimiento","d":"Detector IR e inalámbrico de movimiento para exteriores e interiores"},{"n":"Superior MotionCam G3 (PhOD) Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con posibilidades ampliadas de verificación fotográfica. Admite resolución HD."},{"n":"Superior MotionProtect G3 Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con sistema antienmascaramiento"},{"n":"Superior MotionProtect Plus G3 Jeweller","f":"Detectores de movimiento","d":"Detector PIR e inalámbrico de movimiento con un sensor de microondas de banda K adicional y sistema antienmascaramiento"},{"n":"Superior SeismoProtect G3 Fibra","f":"Detectores sísmicos","d":"Detector sísmico cableado con un sensor de impacto adicional"},{"n":"HomeSiren Jeweller","f":"Sirenas","d":"Sirena inalámbrica"},{"n":"StreetSiren DoubleDeck Jeweller","f":"Sirenas","d":"Sirena inalámbrica con un soporte para un panel frontal personalizable"},{"n":"StreetSiren Jeweller","f":"Sirenas","d":"Sirena inalámbrica para interiores y exteriores"},{"n":"Superior HomeSiren Fibra","f":"Sirenas","d":"Sirena cableada con conector LED"},{"n":"Superior HomeSiren G3 Jeweller","f":"Sirenas","d":"Sirena inalámbrica con protección antisabotaje avanzada y conector LED"},{"n":"Superior HomeSiren Jeweller","f":"Sirenas","d":"Sirena inalámbrica. Versión Superior"},{"n":"Superior StreetSiren DoubleDeck Fibra","f":"Sirenas","d":"Sirena cableada con un soporte para un panel frontal personalizable"},{"n":"Superior StreetSiren DoubleDeck Jeweller","f":"Sirenas","d":"Sirena inalámbrica con un soporte para un panel frontal personalizable. Versión Superior"},{"n":"Superior StreetSiren Fibra","f":"Sirenas","d":"Sirena cableada para interiores y exteriores"},{"n":"Superior StreetSiren Plus Fibra","f":"Sirenas","d":"Sirena cableada con protección antisabotaje avanzada y una lista ampliada de certificados de cumplimiento. Para exteriores e interiores."},{"n":"Superior StreetSiren Plus G3 Jeweller","f":"Sirenas","d":"Sirena inalámbrica con protección antisabotaje avanzada y una lista ampliada de certificados de cumplimiento. Para exteriores e interiores."},{"n":"Superior StreetSiren Plus Jeweller","f":"Sirenas","d":"Sirena inalámbrica con protección antisabotaje avanzada y una lista ampliada de certificados de cumplimiento. Para exteriores e interiores."},{"n":"Ajax SpaceControl Jeweller","f":"Botones y mandos","d":"Mando inalámbrico con botón de pánico y control de los modos de seguridad"},{"n":"Ajax Superior SpaceControl Jeweller","f":"Botones y mandos","d":"Mando inalámbrico con botón de pánico y control de los modos de seguridad. Versión Superior"},{"n":"Button Jeweller","f":"Botones y mandos","d":"Botón de pánico inalámbrico / botón inteligente"},{"n":"DoubleButton Jeweller","f":"Botones y mandos","d":"Botón de emergencia inalámbrico"},{"n":"Superior Button Jeweller","f":"Botones y mandos","d":"Botón de pánico/botón inteligente e inalámbrico. Versión Superior"},{"n":"Superior DoubleButton G3 Jeweller","f":"Botones y mandos","d":"Botón inalámbrico de emergencia para instalaciones de alto riesgo"},{"n":"SpeakerPhone Jeweller","f":"Módulos de voz","d":"Módulo de voz inalámbrico para la verificación de alarmas"},{"n":"KeyPad Jeweller","f":"Teclados","d":"Teclado inalámbrico y táctil"},{"n":"KeyPad Plus Jeweller","f":"Teclados","d":"Teclado inalámbrico y táctil compatible con tarjetas y mandos cifrados sin contacto"},{"n":"Superior KeyPad Fibra","f":"Teclados","d":"Teclado cableado y táctil"},{"n":"KeyPad Outdoor Jeweller","f":"Teclados","d":"Teclado inalámbrico que admite la autenticación mediante Pass, Tag, smartphones y códigos. Para exteriores e interiores."},{"n":"KeyPad TouchScreen Jeweller","f":"Teclados","d":"Teclado inalámbrico con pantalla táctil que admite la autenticación con smartphones, Pass, Tag y códigos"},{"n":"Superior KeyPad Outdoor Fibra","f":"Teclados","d":"Teclado cableado para exteriores e interiores que admite la autenticación mediante Pass, Tag, smartphones y códigos"},{"n":"Superior KeyPad Plus G3 Jeweller","f":"Teclados","d":"Teclado inalámbrico con botones táctiles que admite la autenticación mediante Pass, Tag y códigos"},{"n":"Superior KeyPad Plus Jeweller","f":"Teclados","d":"Teclado inalámbrico y táctil compatible con tarjetas y mandos cifrados sin contacto. Versión Superior"},{"n":"Superior KeyPad TouchScreen Fibra","f":"Teclados","d":"Teclado cableado con pantalla táctil y autorización sin contacto"},{"n":"Superior KeyPad TouchScreen G3 Jeweller","f":"Teclados","d":"Teclado inalámbrico con pantalla táctil que admite la autenticación mediante Pass, Tag, smartphones y códigos"},{"n":"Ajax Superior BulletCam HLVF (4 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior TurretCam HLVF (4 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior TurretCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HL (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HL (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HL (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HL (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini HL (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini HL (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini HL (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam Mini HL (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HL (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HL (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HL (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HL (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación híbrida, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior BulletCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior DomeCam HLVF (4 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"Ajax Superior DomeCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal P-Iris motorizado de 2.8–12 mm, iluminación híbrida, True WDR, micrófono y altavoz integrados, entradas/salidas de audio y alarma y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam (5 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam (5 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam (8 Mp/2.8 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 110°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam (8 Mp/4 mm)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un ángulo de visión de 85°, iluminación IR, True WDR, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HLVF (5 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"BulletCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam HLVF (5 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"DomeCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HLVF (5 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"TurretCam HLVF (8 Mp)","f":"Cámaras cableadas","d":"Cámara IP de seguridad cableada con tecnología IA, un objetivo varifocal motorizado de 2.8–12 mm, iluminación híbrida, True WDR, entradas/salidas de audio y alarma, micrófono y PoE/12 V. Para exteriores e interiores."},{"n":"IndoorCam","f":"Cámaras Wi-Fi","d":"Cámara de seguridad Wi-Fi para interiores con sensor de movimiento PIR e IA integrada"},{"n":"DoorBell","f":"Timbres","d":"Vídeo timbre con IA integrada, sensor PIR y control a través de apps"},{"n":"Ajax Superior NVR H2DAI16PAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con IA, salida HDMI 4K, interfaz Gigabit Ethernet, 16 puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI16PAC (32-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 32 canales con IA, salida HDMI 4K, interfaz Gigabit Ethernet, 16 puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI8PAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con IA, salida HDMI 4K, interfaz Gigabit Ethernet, ocho puertos PoE y soporte para dos discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI8PAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con IA, salida HDMI 4K, interfaz Gigabit Ethernet, ocho puertos PoE y soporte para dos discos duros sustituibles en caliente"},{"n":"NVR (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales"},{"n":"NVR (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales"},{"n":"NVR DC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red para 16 canales alimentado por una fuente de energía de baja tensión"},{"n":"NVR DC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red para 8 canales alimentado por una fuente de energía de baja tensión"},{"n":"NVR H2D16PAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI 4K, 16 puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR H2D8PAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI 4K, ocho puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR H2D8PAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con salida HDMI 4K, ocho puertos PoE y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR H2DAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI 4K y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR H2DAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con salida HDMI 4K y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR HAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI"},{"n":"NVR HAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con salida HDMI"},{"n":"Ajax Superior NVR H2DAI2GAC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con IA, salida HDMI 4K, 2 puertos Gigabit Ethernet y soporte para 2 discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI2GAC (32-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 32 canales con IA, salida HDMI 4K, 2 puertos Gigabit Ethernet y soporte para 2 discos duros sustituibles en caliente"},{"n":"Ajax Superior NVR H2DAI2GAC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con IA, salida HDMI 4K, 2 puertos Gigabit Ethernet y soporte para 2 discos duros sustituibles en caliente"},{"n":"NVR HDC (16-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 16 canales con salida HDMI, alimentado por una fuente de energía de baja tensión"},{"n":"NVR HDC (8-ch)","f":"Grabadores de vídeo en red","d":"Grabador de vídeo en red de 8 canales con salida HDMI, alimentado por una fuente de energía de baja tensión"},{"n":"EN54 FireProtect (Heat) Jeweller","f":"Detectores de incendio","d":"Detector de calor puntual inalámbrico direccionable"},{"n":"EN54 FireProtect (Heat/Smoke) Jeweller","f":"Detectores de incendio","d":"Detector de calor y de humo puntual inalámbrico direccionable"},{"n":"EN54 FireProtect (Heat/Sounder) Jeweller","f":"Detectores de incendio","d":"Detector de calor puntual inalámbrico direccionable combinado con una sirena de alarma de incendio"},{"n":"EN54 FireProtect (Smoke) Jeweller","f":"Detectores de incendio","d":"Detector de humo puntual inalámbrico direccionable"},{"n":"FireProtect 2 AC (CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio monóxido de carbono alimentado por la red eléctrica"},{"n":"FireProtect 2 AC (Heat) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio de calor alimentado por la red eléctrica"},{"n":"FireProtect 2 AC (Heat/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio de calor y monóxido de carbono alimentado por la red eléctrica"},{"n":"FireProtect 2 AC (Heat/Smoke) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio de humo y calor alimentado por la red eléctrica"},{"n":"FireProtect 2 AC (Heat/Smoke/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio de humo, calor y monóxido de carbono alimentado por la red eléctrica"},{"n":"FireProtect 2 RB (CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de CO con baterías reemplazables"},{"n":"FireProtect 2 RB (CO) UL Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio con sensor de CO. Versión con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de calor con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat) UL Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio con sensor de calor. Versión con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y CO con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/Smoke) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y humo con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/Smoke) UL Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y humo con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/Smoke/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor, humo y CO con baterías reemplazables"},{"n":"FireProtect 2 RB (Heat/Smoke/CO) UL Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y humo con baterías reemplazables"},{"n":"FireProtect 2 SB (CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de CO con baterías integradas"},{"n":"FireProtect 2 SB (Heat) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de calor con baterías integradas"},{"n":"FireProtect 2 SB (Heat/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y CO con baterías integradas"},{"n":"FireProtect 2 SB (Heat/Smoke) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor y humo con baterías integradas"},{"n":"FireProtect 2 SB (Heat/Smoke/CO) Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor, humo y CO con baterías integradas"},{"n":"FireProtect Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico de incendio con sensores de calor y humo. Versión con baterías reemplazables"},{"n":"FireProtect Plus Jeweller","f":"Detectores de incendio","d":"Detector inalámbrico y combinado de calor, humo y CO con baterías reemplazables"},{"n":"EN54 FireProtect (Smoke/Sounder) Jeweller","f":"Detectores de incendio","d":"Detector de humo puntual inalámbrico direccionable combinado con una sirena de alarma de incendio"},{"n":"EN54 FireProtect (Sounder) Jeweller","f":"Dispositivos de alarma de incendio","d":"Sirena de alarma de incendio inalámbrica direccionable"},{"n":"EN54 FireProtect (Sounder/VAD) Jeweller","f":"Dispositivos de alarma de incendio","d":"Sirena de alarma de incendio inalámbrica direccionable combinada con un Flash-dispositivo de alarma visual (DAV)"},{"n":"EN54 FireProtect (VAD) Jeweller","f":"Dispositivos de alarma de incendio","d":"Flash-dispositivo de alarma de incendio visual (DAV) inalámbrico y direccionable"},{"n":"ManualCallPoint (Blue) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable y programable de color azul"},{"n":"ManualCallPoint (Green) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable con escenarios programables. Versión de color verde."},{"n":"ManualCallPoint (Red) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable para la activación manual de la alarma de incendio con escenarios programables. Versión de color rojo"},{"n":"ManualCallPoint (White) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable con escenarios programables. Versión de color blanco."},{"n":"ManualCallPoint (Yellow) Jeweller","f":"Pulsadores manuales de alarma","d":"Botón inalámbrico reajustable con escenarios programables. Versión de color amarillo."},{"n":"LightSwitch (1-gang) [120] Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 1 banda"},{"n":"LightSwitch (1-gang) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 1 banda"},{"n":"LightSwitch (2-gang) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 2 bandas"},{"n":"LightSwitch (2-gang/2-way) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 2 bandas y de 2 vías"},{"n":"LightSwitch (2-way) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 2 vías"},{"n":"LightSwitch (3-way) [120] Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 3 vías"},{"n":"LightSwitch (4-way) [120] Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de 4 vías"},{"n":"LightSwitch (Crossover) Jeweller","f":"Interruptores de luz","d":"Interruptor de luz inteligente y táctil de cruce"},{"n":"LightSwitch (Dimmer) Jeweller","f":"Interruptores de luz","d":"Dimmer inteligente y táctil"},{"n":"CoverPlate","f":"Bases de enchufe","d":"Tapa de la caja de montaje"},{"n":"Outlet (basic) [type E]","f":"Bases de enchufe","d":"Base de enchufe con conexión a tierra"},{"n":"Outlet (basic) [type F]","f":"Bases de enchufe","d":"Base de enchufe con conexión a tierra"},{"n":"Outlet (LAN)","f":"Bases de enchufe","d":"Base de enchufe Ethernet con dos puertos"},{"n":"Outlet [type E] Jeweller","f":"Bases de enchufe","d":"Base de enchufe inteligente con monitor de consumo eléctrico"},{"n":"Outlet [type F] Jeweller","f":"Bases de enchufe","d":"Base de enchufe inteligente con monitor de consumo eléctrico"},{"n":"Socket (type B) Jeweller","f":"Enchufes inteligentes","d":"Enchufe inteligente con monitor de consumo eléctrico"},{"n":"Socket (type F) Jeweller","f":"Enchufes inteligentes","d":"Enchufe inteligente con monitor de consumo eléctrico"},{"n":"Socket (type G) Jeweller","f":"Enchufes inteligentes","d":"Enchufe inteligente con monitor de consumo eléctrico"},{"n":"Relay Jeweller","f":"Relés","d":"Relé inalámbrico de contacto seco"},{"n":"Superior MultiRelay Fibra","f":"Relés","d":"Relé de cuatro canales de control remoto"},{"n":"WallSwitch Jeweller","f":"Relés","d":"Relé de potencia para controlar la alimentación de 110/230 V~ en remoto"},{"n":"LifeQuality Jeweller","f":"Detectores de calidad del aire","d":"Monitor inalámbrico de temperatura, humedad y CO₂"},{"n":"LifeQuality Lite Jeweller","f":"Detectores de calidad del aire","d":"Monitor inalámbrico de temperatura y de humedad"},{"n":"LeaksProtect Jeweller","f":"Detectores de inundación","d":"Detector inalámbrico de inundación"},{"n":"Ajax WaterStop 1\" (DN 25) Jeweller","f":"Válvulas de cierre","d":"Válvula de cierre de agua inalámbrica de control remoto"},{"n":"Ajax WaterStop ½\" (DN 15) Jeweller","f":"Válvulas de cierre","d":"Válvula de cierre de agua inalámbrica de control remoto"},{"n":"Ajax WaterStop ¾\" (DN 20) Jeweller","f":"Válvulas de cierre","d":"Válvula de cierre de agua inalámbrica de control remoto"},{"n":"EN54 I/O Module (2X2) Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico direccionable con dos entradas y dos salidas para un sistema de alarma contra incendios"},{"n":"MultiTransmitter Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico para integrar hasta 18 dispositivos de terceros en el sistema Ajax"},{"n":"Superior MultiTransmitter Fibra","f":"Módulos de integración","d":"Módulo cableado para integrar hasta 18 dispositivos de terceros en un sistema Ajax"},{"n":"Superior MultiTransmitter Fibra (without casing)","f":"Módulos de integración","d":"Módulo cableado para integrar hasta 18 dispositivos de terceros en un sistema Ajax"},{"n":"Superior MultiTransmitter G3 Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico para integrar hasta 18 dispositivos de terceros en un sistema Ajax"},{"n":"Superior MultiTransmitter G3 Jeweller (without casing)","f":"Módulos de integración","d":"Módulo inalámbrico para integrar hasta 18 dispositivos de terceros en un sistema Ajax. Diseñado para su instalación en una carcasa Ajax."},{"n":"Superior MultiTransmitter IO (4X4) Fibra","f":"Módulos de integración","d":"Módulo cableado con 4 entradas y 4 salidas. Diseñado para integrar dispositivos de terceros en un sistema Ajax"},{"n":"Superior Transmitter Fibra","f":"Módulos de integración","d":"Módulo cableado para integrar un dispositivo de terceros en el sistema Ajax"},{"n":"Transmitter Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico para integrar un dispositivo de terceros en el sistema Ajax"},{"n":"vhfBridge Jeweller","f":"Módulos de integración","d":"Módulo inalámbrico para conectar un sistema Ajax a transmisores VHF de terceros"},{"n":"vhfBridge Jeweller (without casing)","f":"Módulos de integración","d":"Módulo inalámbrico para conectar un sistema Ajax a transmisores VHF de terceros"},{"n":"Superior LineProtect Fibra","f":"Accesorios Fibra","d":"Módulo de protección de los dispositivos en la línea Fibra contra el cortocircuito y el sabotaje"},{"n":"Superior LineSplit Fibra","f":"Accesorios Fibra","d":"Módulo para dividir una línea Fibra en cuatro líneas"},{"n":"Superior LineSupply (45 W) Fibra","f":"Accesorios Fibra","d":"Módulo para la alimentación adicional con una potencia de 45 W y una línea de salida Fibra"},{"n":"Superior LineSupply (75 W) Fibra","f":"Accesorios Fibra","d":"Módulo para la alimentación adicional con una potencia de 75 W y dos líneas de salida Fibra"},{"n":"Case A (106)","f":"Carcasas","d":"Carcasa para un módulo Ajax"},{"n":"Case B (175)","f":"Carcasas","d":"Carcasa para uno o dos módulos Fibra"},{"n":"Case C (260)","f":"Carcasas","d":"Carcasa para un módulo Ajax y una batería de 7 Ah"},{"n":"Case D (430)","f":"Carcasas","d":"Carcasa para hasta ocho módulos Ajax y dos baterías de 18 Ah"},{"n":"Case E (395)","f":"Carcasas","d":"Carcasa impermeable para un hub Ajax con batería interna. Para exteriores e interiores."},{"n":"12-24V PSU (type A)","f":"Fuentes de alimentación","d":"Fuente de alimentación para el funcionamiento del dispositivo con una alimentación de baja tensión"},{"n":"12V PSU for Hub/Hub Plus/ReX","f":"Fuentes de alimentación","d":"Fuente de alimentación para el funcionamiento del dispositivo con una alimentación de baja tensión"},{"n":"12V PSU for NVR","f":"Fuentes de alimentación","d":"Fuente de alimentación para el funcionamiento del NVR con una alimentación de baja tensión"},{"n":"6V PSU (type A)","f":"Fuentes de alimentación","d":"Fuente de alimentación para el funcionamiento del dispositivo con una batería portátil"}];
const KNOWLEDGE_STOPWORDS = new Set(['ajax','jeweller','fibra','superior','nuevo','proximamente','próximamente','type','dn','mp','ch','w','b','black','white','color','sin','casing','without','case','plus']);
const knowledgeCache = new Map();
function compactKnowledgeText(s){
  return normaliza(String(s||''))
    .replace(/ajax|jeweller|fibra|superior|new|nuevo|proximamente|próximamente/g,' ')
    .replace(/[^a-z0-9]+/g,'');
}
function knowledgeTokens(s){
  return normaliza(String(s||''))
    .replace(/ajax|jeweller|fibra|superior/g,' ')
    .split(/[^a-z0-9]+/)
    .filter(t => t && t.length>1 && !KNOWLEDGE_STOPWORDS.has(t));
}
function productoKnowledgeKey(p){ return (p && p.name) || ''; }
function conocimientoProducto(p){
  const key = productoKnowledgeKey(p);
  if(knowledgeCache.has(key)) return knowledgeCache.get(key);
  const raw = String(key||'');
  const n = normaliza(raw);
  const compact = compactKnowledgeText(raw);
  const tokens = knowledgeTokens(raw);
  let best = null;
  let bestScore = 0;
  for(const item of AJAX_KNOWLEDGE){
    const kn = normaliza(item.n);
    const kc = compactKnowledgeText(item.n);
    const kt = knowledgeTokens(item.n);
    let score = 0;
    if(kc && compact.includes(kc)) score += 900 + kc.length;
    if(kc && kc.includes(compact) && compact.length>4) score += 350;
    for(const t of kt){
      if(tokens.includes(t)) score += 160;
      else if(compact.includes(t)) score += 95;
      else if(tokens.some(pt => pt.startsWith(t) || t.startsWith(pt))) score += 45;
    }
    // Reglas para referencias del CSV abreviadas.
    if(kn.includes('home') && kn.includes('siren') && compact.includes('homesiren')) score += 700;
    if(kn.includes('street') && kn.includes('siren') && compact.includes('streetsiren')) score += 700;
    if(kn.includes('doorprotect plus') && compact.includes('doorprotectplus')) score += 800;
    if(kn.includes('doorprotect') && compact.includes('doorprotect')) score += 520;
    if(kn.includes('motionprotect plus') && compact.includes('motionprotectplus')) score += 800;
    if(kn.includes('motionprotect') && compact.includes('motionprotect')) score += 520;
    if(kn.includes('motioncam') && compact.includes('motioncam')) score += 720;
    if(kn.includes('glassprotect') && compact.includes('glassprotect')) score += 720;
    if(kn.includes('fireprotect 2') && compact.includes('fireprotect2')) score += 760;
    if(kn.includes('fireprotect plus') && compact.includes('fireprotectplus')) score += 740;
    if(kn.includes('fireprotect') && compact.includes('fireprotect')) score += 540;
    if(kn.includes('leaksprotect') && compact.includes('leaksprotect')) score += 900;
    if(kn.includes('waterstop') && compact.includes('waterstop')) score += 900;
    if(kn.includes('lifequality lite') && compact.includes('lifequalitylite')) score += 850;
    if(kn.includes('lifequality') && compact.includes('lifequality')) score += 650;
    if(kn.includes('hub 2 plus') && compact.includes('hub2plus')) score += 900;
    if(kn.includes('hub 2') && compact.includes('hub2')) score += 760;
    if(kn.includes('hub bp') && compact.includes('hubbp')) score += 850;
    if(kn === 'hub' && /^ajhub[\-\w]*$/.test(n.replace(/\s+/g,''))) score += 500;
    if(kn.includes('rex 2') && compact.includes('rex2')) score += 850;
    if(kn === 'rex jeweller' && compact.includes('rex')) score += 520;
    if(kn.includes('keypad touchscreen') && compact.includes('keypadtouchscreen')) score += 900;
    if(kn.includes('keypad outdoor') && compact.includes('keypadoutdoor')) score += 850;
    if(kn.includes('keypad plus') && compact.includes('keypadplus')) score += 820;
    if(kn.includes('keypad') && compact.includes('keypad')) score += 500;
    if(kn.includes('spacecontrol') && compact.includes('spacecontrol')) score += 850;
    if(kn.includes('doublebutton') && compact.includes('doublebutton')) score += 850;
    if(kn.includes('button') && compact.includes('button')) score += 480;
    if(kn.includes('relay') && compact.includes('relay')) score += 600;
    if(kn.includes('wallswitch') && compact.includes('wallswitch')) score += 850;
    if(kn.includes('socket') && compact.includes('socket')) score += 850;
    if(kn.includes('outlet') && compact.includes('outlet')) score += 850;
    if(kn.includes('lightswitch') && (compact.includes('lightcore') || compact.includes('lightswitch'))) score += 700;
    if(kn.includes('dimmer') && compact.includes('dimmer')) score += 400;
    if(kn.includes('nvr') && compact.includes('nvr')) score += 650;
    if(kn.includes('bulletcam') && compact.includes('bulletcam')) score += 850;
    if(kn.includes('domecam') && compact.includes('domecam')) score += 850;
    if(kn.includes('turretcam') && compact.includes('turretcam')) score += 850;
    if(kn.includes('indoorcam') && compact.includes('indoorcam')) score += 850;
    if(kn.includes('doorbell') && compact.includes('doorbell')) score += 850;
    if(kn.includes('junctionbox') && compact.includes('junctionbox')) score += 850;
    if(kn.includes('mountcam a1') && compact.includes('mountcama1')) score += 900;
    if(kn.includes('mountcam a2') && compact.includes('mountcama2')) score += 900;
    if(kn.includes('mountcam b1') && compact.includes('mountcamb1')) score += 900;
    if(kn.includes('mountcam b2') && compact.includes('mountcamb2')) score += 900;
    if(kn.includes('surfacebox') && compact.includes('surfacebox')) score += 850;
    if(kn.includes('psu') && (compact.includes('psu') || compact.includes('pcb'))) score += 500;
    if(kn.includes('12v psu for nvr') && compact.includes('psunvr')) score += 950;
    if(kn.includes('12v psu') && compact.includes('dc12')) score += 600;
    if(kn.includes('12-24v psu') && compact.includes('dc1224')) score += 650;
    if(score > bestScore){ best = item; bestScore = score; }
  }
  const result = bestScore >= 260 ? best : null;
  knowledgeCache.set(key, result);
  return result;
}
function iconoPorFamilia(info, p){
  const f = normaliza((info && info.f) || '');
  const n = normaliza(((info && info.n) || '') + ' ' + ((p && p.name) || ''));
  if(f.includes('camara') || f.includes('videovigilancia') || f.includes('timbres') || n.includes('cam') || n.includes('nvr')) return n.includes('nvr') ? '🎥' : '📷';
  if(f.includes('incendio') || n.includes('fire')) return '🔥';
  if(f.includes('inundacion') || f.includes('valvulas') || n.includes('water') || n.includes('leak')) return '💧';
  if(f.includes('hubs') || n.includes('hub')) return '🏠';
  if(f.includes('repetidores') || n.includes('rex')) return '📡';
  if(f.includes('sirenas') || n.includes('siren')) return '🔔';
  if(f.includes('teclados') || n.includes('keypad')) return '⌨️';
  if(f.includes('enchufes') || f.includes('reles') || f.includes('bases')) return '🔌';
  if(f.includes('interruptores') || n.includes('light') || n.includes('dimmer')) return '💡';
  if(f.includes('botones') || n.includes('button')) return '🟢';
  if(f.includes('apertura') || n.includes('door')) return '🚪';
  if(f.includes('movimiento') || n.includes('motion')) return '🚶';
  if(f.includes('cristal') || n.includes('glass')) return '🪟';
  if(f.includes('alimentacion') || n.includes('psu')) return '⚡';
  if(f.includes('carcasas') || f.includes('accesorios') || n.includes('mount') || n.includes('box')) return '🧩';
  if(f.includes('kits')) return '📦';
  return '📦';
}
function descripcionProductoBase(p){
  const n = normaliza((p && p.name) || '');

  // Agua / inundación
  if(n.includes('waterstop')) return {icon:'💧', desc:'Válvula de corte de agua AJAX'};
  if(n.includes('leaks')) return {icon:'💧', desc:'Detector de inundación y fugas de agua AJAX'};

  // Vídeo y grabación
  if(n.includes('nvr')){
    if(n.includes('poe') || n.includes('pac') || n.includes('8p') || n.includes('16p')) return {icon:'🎥', desc:'Grabador de vídeo en red con PoE para cámaras'};
    if(n.includes('dc') || n.includes('hdc')) return {icon:'🎥', desc:'Grabador de vídeo en red de baja tensión'};
    return {icon:'🎥', desc:'Grabador de vídeo en red para cámaras'};
  }
  if(n.includes('bullet')) return {icon:'📷', desc:'Cámara IP tipo bullet con IA, PoE/12V y WDR'};
  if(n.includes('dome')) return {icon:'📷', desc:'Cámara IP tipo domo con IA, PoE/12V y WDR'};
  if(n.includes('turret')) return {icon:'📷', desc:'Cámara IP tipo turret/torreta con IA y PoE/12V'};
  if(n.includes('indoorcam')) return {icon:'📷', desc:'Cámara Wi‑Fi interior con PIR e IA'};
  if(n.includes('doorbell')) return {icon:'📹', desc:'Vídeo timbre con IA, PIR y control desde app'};
  if(n.includes('cam') || n.includes('camera')) return {icon:'📷', desc:'Dispositivo de vídeo o cámara AJAX'};
  if(n.includes('hdd') || n.includes('storage')) return {icon:'💾', desc:'Almacenamiento para vídeo y grabadores'};

  // Hubs y kits
  if(n.includes('starter') || n.includes('kit')) return {icon:'📦', desc:'Kit básico AJAX con central y dispositivos de alarma'};
  if(n.includes('hubbp')) return {icon:'🏠', desc:'Panel de control inalámbrico alimentado por batería'};
  if(n.includes('hub2plus')) return {icon:'🏠', desc:'Panel de control con fotoverificación, Wi‑Fi, Ethernet y doble SIM'};
  if(n.includes('hub2')) return {icon:'🏠', desc:'Panel de control con fotoverificación, Ethernet y doble SIM'};
  if(n.includes('hub')) return {icon:'🏠', desc:'Panel de control inalámbrico para sistema AJAX'};
  if(n.includes('rex')) return {icon:'📡', desc:'Repetidor de señal de radio AJAX'};

  // Intrusión
  if(n.includes('doorprotectplus')) return {icon:'🚪', desc:'Detector de apertura, impacto e inclinación'};
  if(n.includes('doorprotect') || n.includes('door')) return {icon:'🚪', desc:'Detector de apertura para puerta o ventana'};
  if(n.includes('glass')) return {icon:'🪟', desc:'Detector de rotura de cristal con micrófono'};
  if(n.includes('combiprotect')) return {icon:'🚶', desc:'Detector de movimiento y rotura de cristal'};
  if(n.includes('motioncam')) return {icon:'📷', desc:'Detector de movimiento con verificación fotográfica'};
  if(n.includes('motionprotectplus')) return {icon:'🚶', desc:'Detector de movimiento con sensor microondas adicional'};
  if(n.includes('motion')) return {icon:'🚶', desc:'Detector inalámbrico de movimiento PIR'};
  if(n.includes('curtain')) return {icon:'🛡️', desc:'Detector de movimiento tipo cortina/perimetral'};

  // Incendio y vida
  if(n.includes('manualcallpoint')) return {icon:'🚨', desc:'Pulsador manual de alarma de incendio'};
  if(n.includes('fireprotect2')){
    if(n.includes('hsc')) return {icon:'🔥', desc:'Detector de incendio combinado: calor, humo y CO'};
    if(n.includes('hs')) return {icon:'🔥', desc:'Detector de incendio combinado: calor y humo'};
    if(n.includes('hc')) return {icon:'🔥', desc:'Detector de incendio combinado: calor y CO'};
    if(n.includes('-c-') || n.includes('(co')) return {icon:'🔥', desc:'Detector de monóxido de carbono CO'};
    if(n.includes('-h-')) return {icon:'🔥', desc:'Detector de calor para alarma de incendio'};
    return {icon:'🔥', desc:'Detector de incendio AJAX'};
  }
  if(n.includes('fire')) return {icon:'🔥', desc:'Detector de incendio, humo, calor o CO'};
  if(n.includes('lifequality')) return {icon:'🌿', desc:'Monitor de calidad del aire, temperatura y humedad'};

  // Control, sirenas e integración
  if(n.includes('siren')) return {icon:'🔔', desc:'Sirena inalámbrica para alarma AJAX'};
  if(n.includes('speakerphone')) return {icon:'☎️', desc:'Módulo de voz para verificación de alarmas'};
  if(n.includes('keypadtouchscreen')) return {icon:'⌨️', desc:'Teclado con pantalla táctil y autenticación avanzada'};
  if(n.includes('keypadoutdoor')) return {icon:'⌨️', desc:'Teclado inalámbrico para exterior e interior'};
  if(n.includes('keypad')) return {icon:'⌨️', desc:'Teclado inalámbrico de control AJAX'};
  if(n.includes('spacecontrol')) return {icon:'🔑', desc:'Mando inalámbrico con botón de pánico'};
  if(n.includes('doublebutton')) return {icon:'🟢', desc:'Botón de emergencia inalámbrico'};
  if(n.includes('button')) return {icon:'🟢', desc:'Botón de pánico o botón inteligente'};
  if(n.includes('tag') || n.includes('pass')) return {icon:'🔑', desc:'Dispositivo de acceso sin contacto'};
  if(n.includes('multitransmitter')) return {icon:'🔗', desc:'Módulo para integrar dispositivos cableados de terceros'};
  if(n.includes('transmitter')) return {icon:'🔗', desc:'Módulo para integrar un dispositivo de terceros'};
  if(n.includes('vhfbridge')) return {icon:'📡', desc:'Módulo para conectar AJAX a transmisores VHF'};

  // Automatización, alimentación y accesorios
  if(n.includes('wallswitch')) return {icon:'🔌', desc:'Relé de potencia para control remoto 110/230V'};
  if(n.includes('relay')) return {icon:'🔌', desc:'Relé inalámbrico de contacto seco'};
  if(n.includes('socket') || n.includes('outlet')) return {icon:'🔌', desc:'Enchufe o toma inteligente AJAX'};
  if(n.includes('lightcore') || n.includes('dimmer') || n.includes('centerbutton') || n.includes('sidebutton') || n.includes('solobutton')) return {icon:'💡', desc:'Mecanismo de iluminación o interruptor inteligente'};
  if(n.includes('psu') || n.includes('dc12') || n.includes('dc1224') || n.includes('ac220')) return {icon:'⚡', desc:'Fuente de alimentación o alimentador AJAX'};
  if(n.includes('battery') || n.includes('batt')) return {icon:'🔋', desc:'Batería o alimentación de respaldo'};
  if(n.includes('bracket') || n.includes('holder') || n.includes('frame') || n.includes('cover') || n.includes('mount') || n.includes('junctionbox') || n.includes('hood')) return {icon:'🧩', desc:'Accesorio de montaje, soporte o caja'};
  return {icon:'📦', desc:'Accesorio o dispositivo AJAX'};
}

function descripcionProducto(p){
  const info = conocimientoProducto(p);
  if(info && info.d){
    return {icon:iconoPorFamilia(info,p), desc:info.d, family:info.f, official:info.n};
  }
  return descripcionProductoBase(p);
}
function hxInicioArriba(){
  try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; }catch(_error){}
  const subir=()=>{ try{ window.scrollTo(0,0); document.documentElement.scrollTop=0; document.body.scrollTop=0; }catch(_error){} };
  subir();
  requestAnimationFrame(()=>{ subir(); requestAnimationFrame(subir); });
}
function aplicarTemaGuardado(){
  const tema = localStorage.getItem(STORAGE_TEMA) || 'light';
  document.body.classList.toggle('light-mode', tema === 'light');
  const btn = $('#themeToggle');
  if(btn){
    btn.classList.toggle('is-light-theme', tema === 'light');
    const destino = tema === 'light' ? 'oscuro' : 'claro';
    btn.setAttribute('aria-label', `Cambiar a modo ${destino}`);
    btn.title = `Cambiar a modo ${destino}`;
  }
}
function alternarTema(){
  const esClaro = !document.body.classList.contains('light-mode');
  localStorage.setItem(STORAGE_TEMA, esClaro ? 'light' : 'dark');
  aplicarTemaGuardado();
}

function escapeHtml(s){ return String(s).replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function buscar(term){ return hxBuscarComun(term); }
function buscarCatalogo(term=''){ return hxBuscarComun(term); }

function pintarResultados(term){
  const panel = $('#resultados');
  const results = hxBuscarComun(term);
  activeIndex = -1;
  if(!term.trim() || !results.length){
    panel.classList.add('hidden');
    panel.innerHTML='';
    panel.dataset.firstIndex='';
    return;
  }

  // Guardamos explícitamente el primer resultado de ESTA búsqueda actual.
  panel.dataset.firstIndex = String(results[0].i);

  panel.innerHTML = results.map((x,k)=>{
    const d = descripcionProducto(x.p);
    return `<div class="result-item" data-index="${x.i}" data-ref="${escapeHtml(x.p.name)}" data-pvp="${Number(x.p.pvp)}" data-k="${k}"><div><div class="result-name">${escapeHtml(x.p.name)}</div><div class="result-meta">${escapeHtml(d.desc)}</div></div><div class="result-price">${fmt.format(x.p.pvp)}</div></div>`;
  }).join('');

  panel.querySelectorAll('.result-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ activeIndex = Number(el.dataset.k); marcarActivo(); });
    el.addEventListener('click',()=> seleccionarProductoSeguro(el.dataset.ref, el.dataset.pvp, true));
    el.addEventListener('dblclick',()=>{ seleccionarProductoSeguro(el.dataset.ref, el.dataset.pvp, true); addLinea(); });
  });

  panel.classList.remove('hidden');
}
function seleccionarProducto(i, cerrar=false){
  seleccionado = productos[i] ? i : null;
  if(seleccionado===null) return;
  $('#producto').value = String(i);
  $('#buscador').value = productos[i].name;
  { const d = descripcionProducto(productos[i]); $('#previewProducto').innerHTML = `<b>${escapeHtml(productos[i].name)}</b> · ${escapeHtml(d.desc)} · ${fmt.format(productos[i].pvp)}`; }
  if(cerrar) $('#resultados').classList.add('hidden');
}
function seleccionarProductoSeguro(ref, expectedPvp=null, cerrar=false){
  const resolved=hxResolverProductoExacto(ref, expectedPvp);
  if(!resolved.ok){ hxToastGlobal(resolved.error,'error'); return false; }
  const i=productos.indexOf(resolved.product);
  if(i<0){ hxToastGlobal('No se pudo seleccionar el producto.','error'); return false; }
  seleccionarProducto(i, cerrar);
  seleccionadoRef=resolved.product.name;
  seleccionadoPvp=Number(resolved.product.pvp);
  return true;
}
function moverActivo(dir){
  const items = [...document.querySelectorAll('.result-item')]; if(!items.length) return;
  activeIndex = (activeIndex + dir + items.length) % items.length;
  items.forEach(x=>x.classList.remove('active'));
  items[activeIndex].classList.add('active'); items[activeIndex].scrollIntoView({block:'nearest'});
}



const HX_MODAL_QTY = { catalog:new Map(), explorer:new Map() };
const HX_MODAL_LINE = { catalog:new Map(), explorer:new Map() };
let HX_MODAL_LINE_SEQ = 0;
function hxModalQtyGet(scope, idx){
  const map = HX_MODAL_QTY[scope];
  return Math.max(1, Number(map?.get(Number(idx))) || 1);
}
function hxModalQtySet(scope, idx, value){
  const map = HX_MODAL_QTY[scope];
  const qty = Math.max(1, Math.min(999, Number(value)||1));
  map?.set(Number(idx), qty);
  return qty;
}
function hxResetModalQty(scope){ HX_MODAL_QTY[scope]?.clear(); }
function hxResetModalSession(scope){ HX_MODAL_LINE[scope]?.clear(); }
function hxAddProductoModal(scope, idx, qty, ref=null, expectedPvp=null){
  const indexed = productos[Number(idx)];
  const resolved = hxResolverProductoExacto(ref || indexed?.name, expectedPvp ?? indexed?.pvp);
  const cantidad = Math.max(1, Number(qty)||1);
  if(!resolved.ok){ hxToastGlobal(resolved.error,'error'); return false; }
  const p = resolved.product;

  const map = HX_MODAL_LINE[scope] || (HX_MODAL_LINE[scope]=new Map());
  const key = hxRefProducto(p.name);
  const lineId = map?.get(key);
  const existing = lineId ? lineas.find(l=>l && l._hxModalLineId===lineId) : null;

  if(existing){
    const anterior = Math.max(1, Number(existing.qty)||1);
    existing.qty = anterior + cantidad;
    render();
    if(scope!=='compatibles') hxToastGlobal(`${p.name} · cantidad ${anterior} → ${existing.qty}`, 'ok');
    return true;
  }

  if(!hxAddProductoSeguro(p.name, cantidad, null, p.pvp)) return false;
  const created = lineas[lineas.length-1];
  if(created){
    created._hxModalLineId = `hxm-${scope}-${++HX_MODAL_LINE_SEQ}`;
    map?.set(key, created._hxModalLineId);
  }
  render();
  if(scope!=='compatibles') hxToastGlobal(cantidad > 1 ? `${p.name} · ${cantidad} unidades añadidas` : `${p.name} añadido`, 'ok');
  return true;
}
function hxQtyControlHtml(scope, idx){
  const qty = hxModalQtyGet(scope, idx);
  return `<div class="hx-modal-qty" data-scope="${scope}" data-index="${idx}">
    <button type="button" class="hx-modal-qty-btn hx-modal-qty-minus" aria-label="Restar cantidad">−</button>
    <span class="hx-modal-qty-value" aria-label="Cantidad">${qty}</span>
    <button type="button" class="hx-modal-qty-btn hx-modal-qty-plus" aria-label="Sumar cantidad">+</button>
  </div>`;
}
function hxBindQtyControls(root, scope){
  const syncAddLabel=(ctrl,qty)=>{
    const card=ctrl.closest('.hxp-product');
    const add=card?.querySelector('.hxp-add');
    if(add && !add.classList.contains('is-added')) add.textContent=qty>1?`Añadir ${qty}`:'Añadir';
  };
  root.querySelectorAll('.hx-modal-qty').forEach(ctrl=>{
    ctrl.addEventListener('dblclick',e=>e.stopPropagation());
    const idx=Number(ctrl.dataset.index);
    const value=ctrl.querySelector('.hx-modal-qty-value');
    syncAddLabel(ctrl,hxModalQtyGet(scope,idx));
    ctrl.querySelector('.hx-modal-qty-minus')?.addEventListener('click',e=>{
      e.stopPropagation();
      const qty=hxModalQtySet(scope,idx,hxModalQtyGet(scope,idx)-1);
      value.textContent=String(qty); syncAddLabel(ctrl,qty);
    });
    ctrl.querySelector('.hx-modal-qty-plus')?.addEventListener('click',e=>{
      e.stopPropagation();
      const qty=hxModalQtySet(scope,idx,hxModalQtyGet(scope,idx)+1);
      value.textContent=String(qty); syncAddLabel(ctrl,qty);
    });
  });
}

function hxProductVisualHtml(p, d, context){
  const image = String((p && p.image) || '').trim();
  const description = hxDescripcionCortaProducto(p, (d && d.desc) || '');
  const img = image
    ? `<button type="button" class="hx-product-thumb" data-image="${escapeHtml(image)}" aria-label="Ampliar imagen de ${escapeHtml(p.name)}"><img src="${escapeHtml(image)}" alt="" loading="lazy" onerror="this.closest('.hx-product-thumb').classList.add('hx-image-error')"></button>`
    : '';
  const title = context === 'search'
    ? escapeHtml(p.name)
    : `${escapeHtml(d.icon)} ${escapeHtml(p.name)}`;
  return `<div class="hx-product-info ${image ? 'has-image' : 'no-image'}">${img}<div class="hx-product-copy"><strong>${title}</strong><span>${escapeHtml(description)}</span></div></div>`;
}
function hxBindProductImages(root){
  root.querySelectorAll('.hx-product-thumb').forEach(btn=>btn.addEventListener('click',e=>{
    e.stopPropagation();
    const url=btn.dataset.image;
    if(!url) return;
    let modal=document.getElementById('hxImagePreview');
    if(!modal){
      modal=document.createElement('div');
      modal.id='hxImagePreview';
      modal.className='hx-image-preview hidden';
      modal.innerHTML='<button type="button" class="hx-image-preview-close" aria-label="Cerrar">×</button><img alt="Vista ampliada del producto">';
      document.body.appendChild(modal);
      modal.addEventListener('click',ev=>{ if(ev.target===modal || ev.target.closest('.hx-image-preview-close')) modal.classList.add('hidden'); });
    }
    modal.querySelector('img').src=url;
    modal.classList.remove('hidden');
  }));
}

function pintarCatalogPanel(term=catalogTerm){
  catalogTerm = term || '';
  const itemsWrap = $('#catalogItems');
  const countWrap = $('#catalogCount');
  if(!itemsWrap || !countWrap) return;
  const totalList = buscarCatalogo(catalogTerm);
  const lista = totalList;
  countWrap.textContent = `${totalList.length} producto${totalList.length===1?'':'s'}`;
  itemsWrap.innerHTML = lista.map(x=>{
    const d = descripcionProducto(x.p);
    return `<div class="catalog-row" data-index="${x.i}" data-ref="${escapeHtml(x.p.name)}" data-pvp="${Number(x.p.pvp)}">
      ${hxProductVisualHtml(x.p, d, 'catalog')}
      <b>${fmt.format(x.p.pvp)}</b>
      ${hxQtyControlHtml('catalog', x.i)}
      <button type="button" class="catalog-add" data-index="${x.i}" data-ref="${escapeHtml(x.p.name)}" data-pvp="${Number(x.p.pvp)}">Añadir</button>
    </div>`;
  }).join('') || '<div class="catalog-empty">No hay productos con esa búsqueda.</div>';
  function addCatalogProductPersistent(idx, trigger){
    const qty = hxModalQtyGet('catalog', idx);
    const row = trigger?.closest('.catalog-row') || itemsWrap.querySelector(`.catalog-row[data-index="${Number(idx)}"]`);
    hxAddProductoModal('catalog', Number(idx), qty, row?.dataset.ref, row?.dataset.pvp);
    if(trigger){
      const original = trigger.textContent;
      trigger.textContent = '✓ Añadido';
      trigger.classList.add('added-ok');
      setTimeout(()=>{ trigger.textContent = original || 'Añadir'; trigger.classList.remove('added-ok'); }, 750);
    }
    const filter = $('#catalogFilter');
    if(filter){
      /* Conserva resultados y posición. Seleccionar el texto permite
         escribir la siguiente búsqueda encima sin reconstruir la lista. */
      setTimeout(()=>{ filter.focus(); filter.select(); }, 0);
    }
  }
  hxBindQtyControls(itemsWrap, 'catalog');
  hxBindProductImages(itemsWrap);
  itemsWrap.querySelectorAll('.catalog-row').forEach(el=>el.addEventListener('dblclick',()=>{ addCatalogProductPersistent(Number(el.dataset.index), null); }));
  itemsWrap.querySelectorAll('.catalog-add').forEach(btn=>btn.addEventListener('click',e=>{ e.stopPropagation(); addCatalogProductPersistent(Number(btn.dataset.index), btn); }));
  itemsWrap.querySelectorAll('.catalog-row').forEach(el=>el.addEventListener('click',()=>{ seleccionarProductoSeguro(el.dataset.ref, el.dataset.pvp, true); }));
}
function abrirCatalogo(){
  const modal = $('#catalogModal');
  const filter = $('#catalogFilter');
  if(!modal) return;
  catalogTerm = '';
  if(filter) filter.value = '';
  pintarCatalogPanel('');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  setTimeout(()=>filter?.focus(), 30);
}
function cerrarCatalogo(){
  hxResetModalQty('catalog');
  hxResetModalSession('catalog');
  const modal = $('#catalogModal');
  if(!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}
function hxToastGlobal(text, type='ok'){
  try{
    document.querySelector('.hx-global-toast')?.remove();
    const t=document.createElement('div');
    t.className=`hx-global-toast ${type==='error'?'is-error':'is-ok'}`;
    t.textContent=String(text||'');
    document.body.appendChild(t);
    requestAnimationFrame(()=>t.classList.add('show'));
    setTimeout(()=>{
      t.classList.remove('show');
      setTimeout(()=>t.remove(),180);
    },1400);
  }catch(_){ }
}
function addLinea(){
  const term = ($('#buscador').value || '').trim();
  let idx = null;

  if(term){
    const act = $('.result-item.active');
    if(act) idx = Number(act.dataset.index);
    else {
      const r = buscar(term);
      if(r.length) idx = r[0].i;
    }
  }else if($('#producto').value !== ''){
    idx = Number($('#producto').value);
  }else{
    idx = seleccionado;
  }

  if(idx===null || idx===undefined || Number.isNaN(idx) || !productos[idx]){
    hxToastGlobal('Selecciona un producto.','error');
    return;
  }

  const p = productos[idx];
  const refAlta = seleccionadoRef || p.name;
  const pvpAlta = seleccionadoRef ? seleccionadoPvp : p.pvp;
  const qty = Math.max(1, Number($('#cantidad').value)||1);
  if(!hxAddProductoSeguro(refAlta, qty, null, pvpAlta)) return;
  hxToastGlobal(`${refAlta} añadido`,'ok');

  $('#buscador').value='';
  $('#producto').value='';
  $('#cantidad').value=1;
  seleccionado=null;
  seleccionadoRef='';
  seleccionadoPvp=null;
  activeIndex=-1;
  $('#previewProducto').textContent='Selecciona un producto para ver su precio.';
  const panel=$('#resultados'); if(panel){panel.classList.add('hidden'); panel.innerHTML='';}
  /* No reconstruir el catálogo completo después de cada alta.
     Era la principal causa de lentitud al elegir el siguiente producto. */
  render();
}
function addLineaManual(){
  lineas.push({name:'', brand:'', desc:'', pvp:0, qty:1, dto:descuentoActual(), manual:true, separador:false, tipo:'linea-vacia', texto:''});
  render();
  hxBajarUltimaLineaPresupuesto();
}
function addSeparador(){
  const texto = prompt('Texto del separador de sección:', 'SISTEMA DE ALARMA');
  if(texto === null) return;
  const name = String(texto || '').trim();
  if(!name) return;
  lineas.push({name:name.toUpperCase(), brand:'', desc:'', pvp:0, qty:1, dto:0, manual:true, separador:true, tipo:'separador', texto:name.toUpperCase()});
  render();
  hxBajarUltimaLineaPresupuesto();
}
function setLinea(i,k,v){
  if(!lineas[i]) return;
  if(k==='name') lineas[i].name = lineas[i].separador ? String(v || '').toUpperCase() : String(v || '');
  if(k==='brand') lineas[i].brand = String(v || '');
  if(k==='desc') lineas[i].desc = String(v || '');
  if(k==='pvp') lineas[i].pvp = Math.max(0, Number(String(v).replace(',','.'))||0);
  if(k==='qty') lineas[i].qty = Math.max(1, Number(v)||1);
  if(k==='dto') lineas[i].dto = Math.max(0, Math.min(100, Number(v)||0));
  render();
}
function cambiarQtyLinea(i, delta){
  if(!lineas[i] || lineas[i].separador) return;
  const actual = Math.max(1, Number(lineas[i].qty) || 1);
  lineas[i].qty = Math.max(1, actual + Number(delta || 0));
  render();
  try{
    const row = document.querySelector(`#tbody tr[data-linea-index="${i}"]`);
    if(row){
      row.classList.remove('row-flash-add');
      void row.offsetWidth;
      row.classList.add('row-flash-add');
      setTimeout(()=>row.classList.remove('row-flash-add'), 700);
    }
  }catch(e){}
}
function delLinea(i){
  const l = Array.isArray(lineas) ? lineas[i] : null;
  if(!l) return;
  const ref = String(l.name || l.producto || l.descripcion || '').trim();
  const esSeparador = !!(l.separador || l.tipo === 'separador');
  const texto = esSeparador
    ? '¿Eliminar este separador del presupuesto?'
    : ref
      ? `¿Eliminar “${ref}” del presupuesto?`
      : '¿Eliminar esta línea del presupuesto?';
  if(!confirm(texto)) return;
  lineas.splice(i,1);
  render();
}
try{ window.cambiarQtyLinea = cambiarQtyLinea; }catch(e){}
function calc(){
  const subtotalBruto = lineas.reduce((s,l)=> l.separador ? s : s + (Number(l.pvp)||0)*(Number(l.qty)||0),0);
  const base = lineas.reduce((s,l)=> l.separador ? s : s + ((Number(l.pvp)||0)*(Number(l.qty)||0)*(1-(Number(l.dto)||0)/100)),0);
  const dtoLineas = subtotalBruto - base;
  const ivaPct = Math.max(0, Number($('#iva').value)||0);
  const iva = base*ivaPct/100;
  return {subtotalBruto,dtoLineas,base,ivaPct,iva,total:base+iva};
}
function moverLinea(i, dir){
  const j = i + dir;
  if(j < 0 || j >= lineas.length) return;
  const tmp = lineas[i];
  lineas[i] = lineas[j];
  lineas[j] = tmp;
  render();
}

function activarArrastreLineas(){
  const tbody = document.querySelector('#tbody');
  if(!tbody || tbody.dataset.dragActivo === '1') return;
  tbody.dataset.dragActivo = '1';

  let filaOrigen = null;
  let clon = null;
  let hueco = null;
  let pointerId = null;
  let offsetY = 0;
  let ordenInicial = [];

  const filasReales = () => Array.from(tbody.querySelectorAll('tr[data-linea-index]'));

  function limpiar(){
    try{ clon?.remove(); }catch(_){ }
    try{ hueco?.replaceWith(filaOrigen); }catch(_){ }
    if(filaOrigen){
      filaOrigen.style.display='';
      filaOrigen.classList.remove('row-dragging284');
    }
    tbody.querySelectorAll('.row-drag-target284').forEach(x=>x.classList.remove('row-drag-target284'));
    document.body.classList.remove('hx-arrastrando-linea');
    filaOrigen = clon = hueco = null;
    pointerId = null;
    ordenInicial = [];
  }

  function crearClon(row, clientY){
    const rect = row.getBoundingClientRect();
    const srcCells = Array.from(row.children);

    const mobileGhost = esMovilArrastre();
    const ghostTable = document.createElement('table');
    ghostTable.className = 'hx-drag-ghost';
    ghostTable.style.position = 'fixed';
    const ghostWidth = mobileGhost ? Math.min(rect.width, window.innerWidth - 20) : rect.width;
    const ghostLeft = mobileGhost ? Math.max(10, Math.min(rect.left, window.innerWidth - ghostWidth - 10)) : rect.left;
    ghostTable.style.left = ghostLeft + 'px';
    ghostTable.style.top = rect.top + 'px';
    ghostTable.style.width = ghostWidth + 'px';
    ghostTable.style.minWidth = ghostWidth + 'px';
    ghostTable.style.maxWidth = ghostWidth + 'px';
    ghostTable.style.height = rect.height + 'px';
    ghostTable.style.zIndex = '100000';
    ghostTable.style.pointerEvents = 'none';
    ghostTable.style.margin = '0';
    ghostTable.style.overflow = 'hidden';
    ghostTable.style.boxSizing = 'border-box';
    ghostTable.style.tableLayout = 'fixed';
    ghostTable.style.borderCollapse = 'collapse';
    ghostTable.style.borderSpacing = '0';

    if(!mobileGhost){
      const colgroup = document.createElement('colgroup');
      srcCells.forEach(cell => {
        const col = document.createElement('col');
        col.style.width = cell.getBoundingClientRect().width + 'px';
        colgroup.appendChild(col);
      });
      ghostTable.appendChild(colgroup);
    }

    const ghostBody = document.createElement('tbody');
    const ghostRow = row.cloneNode(true);

    // Las filas separadoras usan colspan=6 en la tabla real. En la tabla
    // flotante solo hay dos celdas visibles (título + acciones); mantener ese
    // colspan ensancha la fila y oculta los botones.
    if(row.classList.contains('section-row')){
      const firstGhostCell = ghostRow.children[0];
      if(firstGhostCell){
        firstGhostCell.removeAttribute('colspan');
        firstGhostCell.colSpan = 1;
      }
    }

    // Copia 1:1 del estilo calculado de cada elemento. No añadimos wrappers
    // ni reinterpretamos botones: mover, X, + y - conservan su geometría real.
    function copiarEstiloCalculado(src, dst){
      const cs = getComputedStyle(src);
      for(let i=0; i<cs.length; i++){
        const prop = cs[i];
        dst.style.setProperty(prop, cs.getPropertyValue(prop), 'important');
      }
      dst.style.setProperty('transition','none','important');
      dst.style.setProperty('animation','none','important');
      dst.style.setProperty('pointer-events','none','important');
      const srcChildren = Array.from(src.children);
      const dstChildren = Array.from(dst.children);
      srcChildren.forEach((child, i)=>{
        if(dstChildren[i]) copiarEstiloCalculado(child, dstChildren[i]);
      });
    }
    copiarEstiloCalculado(row, ghostRow);

    ghostRow.style.setProperty('height',rect.height+'px','important');
    ghostRow.style.setProperty('width','100%','important');
    ghostRow.style.setProperty('min-width','0','important');
    ghostRow.style.setProperty('max-width','100%','important');
    ghostRow.style.setProperty('box-sizing','border-box','important');

    if(mobileGhost){
      ghostTable.style.setProperty('display','block','important');
      ghostBody.style.setProperty('display','block','important');
      ghostBody.style.setProperty('width','100%','important');
      ghostRow.style.setProperty('display','grid','important');
      ghostRow.style.setProperty('grid-template-columns',getComputedStyle(row).gridTemplateColumns,'important');
      ghostRow.style.setProperty('grid-template-rows',getComputedStyle(row).gridTemplateRows,'important');
      ghostRow.style.setProperty('position','relative','important');
      ghostRow.style.setProperty('overflow','hidden','important');
      ghostRow.style.setProperty('margin','0','important');
      Array.from(ghostRow.children).forEach(cell => {
        cell.style.setProperty('display','block','important');
        cell.style.setProperty('width','auto','important');
        cell.style.setProperty('min-width','0','important');
        cell.style.setProperty('max-width','100%','important');
        cell.style.setProperty('box-sizing','border-box','important');
      });
    }else{
      ghostRow.style.setProperty('display','table-row','important');
      Array.from(ghostRow.children).forEach((cell, i) => {
        const src = srcCells[i];
        if(!src) return;
        const width = src.getBoundingClientRect().width;
        cell.style.setProperty('display','table-cell','important');
        cell.style.setProperty('width',width+'px','important');
        cell.style.setProperty('min-width',width+'px','important');
        cell.style.setProperty('max-width',width+'px','important');
        cell.style.setProperty('box-sizing','border-box','important');
      });
    }

    // cloneNode no refleja el valor actual escrito en inputs/selects.
    const srcFields = row.querySelectorAll('input,select,textarea');
    const dstFields = ghostRow.querySelectorAll('input,select,textarea');
    dstFields.forEach((field, i) => {
      const src = srcFields[i];
      if(!src) return;
      if('value' in field) field.value = src.value;
      field.setAttribute('tabindex', '-1');
      const fieldRect = src.getBoundingClientRect();
      if(mobileGhost){
        field.style.setProperty('width','100%','important');
        field.style.setProperty('min-width','0','important');
        field.style.setProperty('max-width','100%','important');
      }else{
        field.style.setProperty('width',fieldRect.width+'px','important');
        field.style.setProperty('min-width',fieldRect.width+'px','important');
        field.style.setProperty('max-width',fieldRect.width+'px','important');
      }
      field.style.setProperty('height',fieldRect.height+'px','important');
      field.style.setProperty('box-sizing','border-box','important');
    });

    ghostBody.appendChild(ghostRow);
    ghostTable.appendChild(ghostBody);
    document.body.appendChild(ghostTable);
    offsetY = clientY - rect.top;
    return ghostTable;
  }

  function esMovilArrastre(){
    return window.matchMedia('(max-width:760px)').matches;
  }

  function crearHueco(row){
    const ph = document.createElement('tr');
    ph.className='hx-drag-placeholder';
    if(esMovilArrastre()) ph.classList.add('hx-drag-placeholder-mobile');
    const td=document.createElement('td');
    td.colSpan=7;
    // En móvil usamos una zona de destino compacta y claramente identificable.
    // No replica la tarjeta completa, por lo que las filas vecinas apenas saltan.
    if(esMovilArrastre()){
      td.style.height='34px';
      td.innerHTML='<span class="hx-drop-label">Suelta aquí para colocar</span>';
      ph.setAttribute('aria-label','Suelta aquí para colocar');
    }else{
      td.style.height=row.getBoundingClientRect().height+'px';
    }
    ph.appendChild(td);
    row.parentNode.insertBefore(ph,row);
    row.style.display='none';
    return ph;
  }

  function marcarDestino(row){
    tbody.querySelectorAll('.row-drag-target284').forEach(x=>x.classList.remove('row-drag-target284'));
    if(row) row.classList.add('row-drag-target284');
  }

  function moverHueco(clientY){
    const rows = filasReales().filter(r=>r!==filaOrigen && r.style.display!=='none');
    let colocado=false;
    for(const row of rows){
      const rect=row.getBoundingClientRect();
      // El destino cambia únicamente al cruzar el centro de la tarjeta.
      // Así no oscila al mover el dedo unos pocos píxeles.
      if(clientY < rect.top + rect.height/2){
        if(hueco.nextSibling!==row) tbody.insertBefore(hueco,row);
        marcarDestino(row);
        colocado=true;
        break;
      }
    }
    if(!colocado){
      tbody.appendChild(hueco);
      marcarDestino(null);
    }
  }

  function autoscroll(clientY){
    const margen=86;
    if(esMovilArrastre()){
      const alto=window.innerHeight || document.documentElement.clientHeight;
      let delta=0;
      if(clientY < margen) delta=-Math.ceil((margen-clientY)/7);
      else if(clientY > alto-margen) delta=Math.ceil((clientY-(alto-margen))/7);
      if(delta) window.scrollBy(0,Math.max(-18,Math.min(18,delta)));
      return;
    }
    const box=document.querySelector('.budget-card .table-scroll') || document.querySelector('.table-scroll');
    if(!box) return;
    const r=box.getBoundingClientRect();
    if(clientY < r.top + 55) box.scrollTop -= 14;
    else if(clientY > r.bottom - 55) box.scrollTop += 14;
  }

  function finalizar(){
    if(!filaOrigen || !hueco) return limpiar();
    const oldIndex=Number(filaOrigen.dataset.lineaIndex);
    const pos=Array.from(tbody.children).indexOf(hueco);
    const copia=lineas.slice();
    const [movida]=copia.splice(oldIndex,1);
    let newIndex=pos;
    if(pos>oldIndex) newIndex=pos-1;
    newIndex=Math.max(0,Math.min(copia.length,newIndex));
    copia.splice(newIndex,0,movida);
    const cambio=newIndex!==oldIndex;
    lineas=copia;
    limpiar();
    render();
    if(cambio){
      requestAnimationFrame(()=>{
        const fila=document.querySelector(`#tbody tr[data-linea-index="${newIndex}"]`);
        if(!fila) return;
        fila.classList.add('row-drop-saved284');
        setTimeout(()=>fila.classList.remove('row-drop-saved284'),420);
      });
    }
  }

  tbody.addEventListener('pointerdown', e=>{
    const handle=e.target.closest('.drag-btn');
    if(!handle) return;
    const row=handle.closest('tr[data-linea-index]');
    if(!row) return;
    e.preventDefault();
    pointerId=e.pointerId;
    filaOrigen=row;
    ordenInicial=filasReales().map(r=>Number(r.dataset.lineaIndex));
    // Crear primero la copia flotante mientras la fila aún conserva sus medidas.
    clon=crearClon(row,e.clientY);
    hueco=crearHueco(row);
    row.classList.add('row-dragging284');
    document.body.classList.add('hx-arrastrando-linea');
    try{ handle.setPointerCapture(pointerId); }catch(_){ }
  });

  tbody.addEventListener('pointermove', e=>{
    if(!filaOrigen || e.pointerId!==pointerId) return;
    e.preventDefault();
    if(clon) clon.style.top=(e.clientY-offsetY)+'px';
    moverHueco(e.clientY);
    autoscroll(e.clientY);
  });

  tbody.addEventListener('pointerup', e=>{
    if(!filaOrigen || e.pointerId!==pointerId) return;
    e.preventDefault();
    finalizar();
  });
  tbody.addEventListener('pointercancel', e=>{
    if(!filaOrigen || e.pointerId!==pointerId) return;
    limpiar();
  });
}


window.HX_COMPATIBLES = Object.freeze({
  count(product){ return hxResolvedRelated(product).length; },
  open(product){ return hxOpenCompatibles(product); },
  list(product){ return hxSortedRelated(product).slice(); }
});

function hxDecorateCompatButtons(){
  document.querySelectorAll('[data-linea-index]').forEach(row=>{
    if(row.querySelector('.hx-compat-btn')) return;

    const indexRaw = row.getAttribute('data-linea-index');
    const index = Number(indexRaw);
    const line = Number.isFinite(index) ? lineas?.[index] : null;
    const ref = line?.ref || line?.name || line?.referencia || '';
    const product = hxProductByRef(ref);
    if(!product) return;

    const count = hxResolvedRelated(product).length;
    if(!count) return;

    const target = row.querySelector('.desc-cell')
      || row.querySelector('td:nth-child(2)')
      || row;

    const button = document.createElement('button');
    button.type='button';
    button.className='hx-compat-btn';
    button.textContent=`Compatibles (${count})`;
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      hxOpenCompatibles(product);
    });
    target.appendChild(button);
  });

  requestAnimationFrame(hxDecorateCompatButtons);
}

function render(){
  const body=$('#tbody');
  if(!lineas.length){ body.innerHTML='<tr><td colspan="7" class="empty">Añade productos para crear el presupuesto.</td></tr>'; }
  else body.innerHTML=lineas.map((l,i)=>{
    if(l.separador){
      const titulo = escapeHtml(String(l.name || 'SECCIÓN').toUpperCase());
      return `<tr class="section-row" data-linea-index="${i}"><td colspan="7" class="section-full-cell"><div class="section-bar"><div class="section-divider"><span class="section-divider-line" aria-hidden="true"></span><input class="manual-input section-input" value="${titulo}" placeholder="Título de sección" onchange="setLinea(${i},'name',this.value)"><span class="section-divider-line" aria-hidden="true"></span></div><div class="row-actions section-actions"><button type="button" class="drag-btn" title="Mantén y arrastra para mover" aria-label="Mover línea"><span></span><span></span><span></span></button><button class="trash" onclick="delLinea(${i})" title="Eliminar línea" aria-label="Eliminar línea"><span class="ui-row-icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg></span></button></div></div></td></tr>`;
    }
    const bruto=(Number(l.pvp)||0)*(Number(l.qty)||0), total=bruto*(1-(Number(l.dto)||0)/100);
    const producto = l.manual
      ? `<input class="manual-input" value="${escapeHtml(l.name||'')}" placeholder="Producto / concepto" onchange="setLinea(${i},'name',this.value)">`
      : escapeHtml(l.name);
    const productoCatalogo = productos.find(p=>hxRefProducto(p && p.name)===hxRefProducto(l.name));
    let descAuto = '';
    try{
      descAuto = hxDescripcionCortaProducto(productoCatalogo, (descripcionProducto(productoCatalogo || {name:l.name, brand:l.brand||'AJAX'}) || {}).desc || '');
    }catch(e){}
    const descripcion = l.manual
      ? `<input class="manual-input desc-input" value="${escapeHtml(l.desc||'')}" placeholder="Descripción" onchange="setLinea(${i},'desc',this.value)">`
      : `<span class="desc-cell">${escapeHtml((productoCatalogo && productoCatalogo.short_description) || l.short_description || descAuto || l.desc || '')}</span>`;
    const pvp = `<input class="price-input editable-pvp" type="number" min="0" step="0.01" value="${Number(l.pvp)||0}" title="Editar PVP solo para este presupuesto. No modifica el CSV." onchange="setLinea(${i},'pvp',this.value)">`;
    const stockRaw = String((productoCatalogo && productoCatalogo.stock) ?? l.stock ?? '').trim();
    const estadoStock = hxEstadoStock(stockRaw);
    const stockHtml = estadoStock.visible ? `<span class="hx-stock-dot ${estadoStock.clase}" title="Stock: ${escapeHtml(estadoStock.texto)}" aria-label="Stock: ${escapeHtml(estadoStock.texto)}"></span>` : '';
    const costeLinea = numero(l.precio_neto_compra);
    const costeCatalogo = numero(productoCatalogo?.precio_neto_compra);
    // Única referencia: precio_neto_compra del CSV, conservada con el mismo nombre en todo el flujo.
    const costeUnitario = costeLinea > 0 ? costeLinea : costeCatalogo;
    const cantidad = Math.max(1, numero(l.qty) || 1);
    const descuentoLinea = Math.max(0, Math.min(100, numero(l.dto) || 0));
    const precioFinalUnitario = numero(l.pvp) * (1 - descuentoLinea / 100);
    const costeTotalLinea = costeUnitario * cantidad;
    // Se compara exactamente lo que muestra el total de la línea contra el coste total de esas unidades.
    const bajoCoste = costeUnitario > 0 && total < costeTotalLinea;
    const avisoCoste = bajoCoste
      ? `<span class="hx-cost-warning" title="Precio final unitario ${fmt.format(precioFinalUnitario)} inferior al coste ${fmt.format(costeUnitario)}">⚠ Venta bajo coste</span>`
      : '';
    return `<tr class="${[l.manual?'manual-row':'',bajoCoste?'hx-bajo-coste':''].filter(Boolean).join(' ')}" data-linea-index="${i}" data-coste-unitario="${costeUnitario}" data-precio-final-unitario="${precioFinalUnitario}"${bajoCoste?` title="Aviso: total de línea ${fmt.format(total)} inferior al coste total ${fmt.format(costeTotalLinea)}"`:''}><td class="product-cell"><span class="hx-product-ref">${producto}</span>${stockHtml}${avisoCoste}</td><td>${descripcion}</td><td class="num">${pvp}</td><td class="num qty-cell"><div class="line-qty-stepper"><button type="button" class="line-qty-btn" onclick="cambiarQtyLinea(${i},-1)" title="Bajar cantidad">−</button><input class="qty-input line-qty-input" type="number" min="1" value="${l.qty}" onchange="setLinea(${i},'qty',this.value)"><button type="button" class="line-qty-btn" onclick="cambiarQtyLinea(${i},1)" title="Subir cantidad">+</button></div></td><td class="num"><input class="dto-input" type="number" min="0" max="100" step="0.01" value="${l.dto||0}" onchange="setLinea(${i},'dto',this.value)"></td><td class="num"><b>${fmt.format(total)}</b></td><td class="num row-actions"><button type="button" class="drag-btn" title="Mantén y arrastra para mover" aria-label="Mover línea"><span></span><span></span><span></span></button><button class="trash" onclick="delLinea(${i})" title="Eliminar línea" aria-label="Eliminar línea"><span class="ui-row-icon" aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg></span></button></td></tr>`;
  }).join('');
  const c=calc();
  $('#subtotalBruto').textContent=fmt.format(c.subtotalBruto);
  $('#baseDto').textContent=fmt.format(c.base);
  $('#ivaTxt').textContent=`IVA ${c.ivaPct}%`;
  $('#ivaVal').textContent=fmt.format(c.iva);
  $('#total').textContent=fmt.format(c.total);
  activarArrastreLineas();
}
let hxIdentificadorActual = '';
function datosPresupuesto(){
  return {
    id: Date.now().toString(),
    guardado: new Date().toISOString(),
    tienda: $('#tienda') ? $('#tienda').value : '',
    comercial: $('#comercial') ? $('#comercial').value : '',
    identificador: String(hxIdentificadorActual || ''),
    cliente: $('#cliente').value,
    telefono: $('#telefono').value,
    email: $('#email').value,
    numero: $('#numero').value,
    fecha: $('#fecha').value,
    estado: $('#estado').value,
    validez: $('#validez').value,
    observaciones: $('#observaciones').value,
    dtoGeneral: $('#dtoGeneral').value,
    iva: $('#iva').value,
    lineas
  };
}
function aplicarPresupuesto(d){
  hxIdentificadorActual = String(d?.identificador || '').trim();
  ['tienda','comercial','cliente','telefono','email','numero','fecha','estado','validez','observaciones','dtoGeneral','iva'].forEach(k=>{ if(d[k]!==undefined && $('#'+k)) $('#'+k).value=d[k]; });
  setTimeout(()=>window.dispatchEvent(new CustomEvent('hiperajax:identificador-cambiado')),0);
  lineas = Array.isArray(d.lineas) ? d.lineas.map(l=>{
    const x = (l && typeof l==='object') ? {...l} : {};
    const tipo = String(x.tipo || '').toLowerCase();
    const esSeparador = x.separador===true || tipo==='separador';
    const esManual = x.manual===true || esSeparador || tipo==='linea-vacia' || tipo==='linea_vacia' || tipo==='manual';
    x.separador = esSeparador;
    x.manual = esManual;
    if(esSeparador){
      x.tipo='separador';
      x.name=String(x.name || x.texto || 'SECCIÓN').toUpperCase();
      x.texto=String(x.texto || x.name || '');
      x.pvp=0; x.qty=1; x.dto=0;
    }else if(tipo==='linea-vacia' || tipo==='linea_vacia'){
      x.tipo='linea-vacia';
    }
    return x;
  }) : [];
  render();
}
function storageHashPresupuestos(lista){
  const text = JSON.stringify(Array.isArray(lista) ? lista : []);
  let hash = 2166136261;
  for(let i=0;i<text.length;i++){
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8,'0');
}
function parseListaPresupuestos(raw){
  try{
    const data = JSON.parse(raw || '[]');
    if(Array.isArray(data)) return data.filter(Boolean);
    if(data && Array.isArray(data.lista)){
      const lista = data.lista.filter(Boolean);
      if(!data.hash || data.hash === storageHashPresupuestos(lista)) return lista;
    }
    return [];
  }catch(e){ return []; }
}
function parseSnapshotPresupuestos(raw, origen){
  try{
    const data = JSON.parse(raw || 'null');
    if(Array.isArray(data)) return {lista:data.filter(Boolean), revision:0, fecha:'', origen, valida:true};
    if(!data || !Array.isArray(data.lista)) return null;
    const lista = data.lista.filter(Boolean);
    const valida = !data.hash || data.hash === storageHashPresupuestos(lista);
    return valida ? {lista, revision:Number(data.revision)||0, fecha:String(data.fecha||''), origen, valida:true} : null;
  }catch(e){ return null; }
}
function leerMetaPresupuestos(){
  try{
    const meta = JSON.parse(localStorage.getItem(STORAGE_LISTA_META) || '{}');
    return meta && typeof meta === 'object' ? meta : {};
  }catch(e){ return {}; }
}
function leerListaPresupuestos(){
  const meta = leerMetaPresupuestos();
  const candidatos = [];
  const principal = parseSnapshotPresupuestos(localStorage.getItem(STORAGE_LISTA), 'principal');
  if(principal){
    const hash = storageHashPresupuestos(principal.lista);
    if(!meta.hash || meta.hash === hash){
      principal.revision = Number(meta.revision)||principal.revision||0;
      principal.fecha = String(meta.fecha||principal.fecha||'');
      candidatos.push(principal);
    }
  }
  [
    [STORAGE_LISTA_SLOT_A,'snapshot-a'],
    [STORAGE_LISTA_SLOT_B,'snapshot-b'],
    [STORAGE_LISTA_BACKUP,'backup']
  ].forEach(([key,origen])=>{
    const snap = parseSnapshotPresupuestos(localStorage.getItem(key), origen);
    if(snap) candidatos.push(snap);
  });

  // Siempre gana la escritura válida más reciente. Nunca la que tenga más elementos,
  // porque eso podría resucitar presupuestos borrados o ignorar una lista nueva.
  candidatos.sort((a,b)=>(b.revision-a.revision) || String(b.fecha).localeCompare(String(a.fecha)));
  let elegida = candidatos[0] || null;

  // Migración de versiones antiguas solo cuando no existe ningún snapshot v2 válido.
  if(!elegida){
    for(const key of STORAGE_LISTA_LEGACY){
      const lista = parseListaPresupuestos(localStorage.getItem(key));
      if(lista.length){ elegida={lista,revision:1,fecha:new Date().toISOString(),origen:'legacy'}; break; }
    }
  }
  if(!elegida) return [];

  const hash = storageHashPresupuestos(elegida.lista);
  if(elegida.origen !== 'principal' || meta.hash !== hash){
    try{
      localStorage.setItem(STORAGE_LISTA, JSON.stringify(elegida.lista));
      localStorage.setItem(STORAGE_LISTA_META, JSON.stringify({
        version:2, revision:elegida.revision||1, fecha:elegida.fecha||new Date().toISOString(),
        cantidad:elegida.lista.length, hash, recuperadoDe:elegida.origen
      }));
    }catch(e){}
  }
  return elegida.lista;
}
function escribirListaPresupuestos(lista){
  const segura = Array.isArray(lista) ? lista.filter(Boolean).slice(0,100) : [];
  try{
    const metaAnterior = leerMetaPresupuestos();
    const revision = Math.max(0, Number(metaAnterior.revision)||0) + 1;
    const fecha = new Date().toISOString();
    const hash = storageHashPresupuestos(segura);
    const snapshot = {version:2, revision, fecha, cantidad:segura.length, hash, lista:segura};
    const slot = revision % 2 ? STORAGE_LISTA_SLOT_A : STORAGE_LISTA_SLOT_B;

    // Escritura transaccional sencilla: snapshot verificable -> principal -> metadatos.
    localStorage.setItem(slot, JSON.stringify(snapshot));
    localStorage.setItem(STORAGE_LISTA, JSON.stringify(segura));
    localStorage.setItem(STORAGE_LISTA_META, JSON.stringify({version:2,revision,fecha,cantidad:segura.length,hash}));
    localStorage.setItem(STORAGE_LISTA_BACKUP, JSON.stringify(snapshot));

    // Verificación inmediata para detectar cuota, bloqueo o escritura incompleta.
    const comprobacion = parseSnapshotPresupuestos(localStorage.getItem(slot), 'verificacion');
    if(!comprobacion || comprobacion.revision !== revision || storageHashPresupuestos(comprobacion.lista) !== hash){
      throw new Error('La verificación del almacenamiento no coincide');
    }
    return true;
  }catch(e){
    console.error('[Hiper Ajax] Error de almacenamiento:', e);
    alert('No se pudo guardar de forma segura en Chrome. Exporta una copia desde Presupuestos antes de cerrar.');
    return false;
  }
}
function exportarPresupuestos(){
  const lista = leerListaPresupuestos();
  const payload = {
    tipo:'hiperajax-presupuestos', version:1,
    exportado:new Date().toISOString(), presupuestos:lista
  };
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`hiperajax-presupuestos-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function exportarPresupuestoIndividual(p){
  if(!p) return;
  const payload={tipo:'hiperajax-presupuesto',version:1,exportado:new Date().toISOString(),presupuesto:p};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  const base=String(p.identificador||p.cliente||p.numero||'presupuesto').replace(/[^a-z0-9_-]+/gi,'_');
  a.download=`hiperajax-${base}.json`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function importarPresupuestosArchivo(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const raw=JSON.parse(String(reader.result||'{}'));
      const incoming=Array.isArray(raw) ? raw : (Array.isArray(raw.presupuestos) ? raw.presupuestos : (raw.presupuesto ? [raw.presupuesto] : null));
      if(!Array.isArray(incoming)) throw new Error('Formato no válido');
      const actuales=leerListaPresupuestos();
      const map=new Map();
      [...actuales,...incoming].forEach(p=>{
        if(!p||typeof p!=='object') return;
        const key=String(p.id || p.numero || `${p.cliente||''}-${p.fecha||''}-${Math.random()}`);
        const prev=map.get(key);
        if(!prev || String(p.guardado||p.fecha||'') >= String(prev.guardado||prev.fecha||'')) map.set(key,p);
      });
      escribirListaPresupuestos([...map.values()].sort((a,b)=>String(b.guardado||b.fecha||'').localeCompare(String(a.guardado||a.fecha||''))));
      refrescarPresupuestosGuardados();
      window.dispatchEvent(new CustomEvent('hiperajax:presupuestos-importados'));
      alert(`${incoming.length} presupuestos importados o revisados.`);
    }catch(e){ alert('No se pudo importar la copia. Selecciona un JSON exportado por Hiper Ajax.'); }
  };
  reader.readAsText(file);
}
function refrescarPresupuestosGuardados(){
  const sel = $('#presupuestosGuardados');
  if(!sel) return;
  const lista = leerListaPresupuestos().sort((a,b)=>String(b.guardado||'').localeCompare(String(a.guardado||'')));
  sel.innerHTML = '<option value="">Presupuestos guardados</option>' + lista.map(p=>{
    const nombre = [p.numero || 'Sin número', p.cliente || 'Sin cliente', p.fecha || ''].filter(Boolean).join(' · ');
    return `<option value="${escapeHtml(p.id)}">${escapeHtml(nombre)}</option>`;
  }).join('');
}
function guardar(){
  asegurarNumero();
  const data = datosPresupuesto();
  let lista = leerListaPresupuestos();
  const clave = (data.numero || '').trim();
  const idx = clave ? lista.findIndex(p => (p.numero || '').trim() === clave) : -1;
  if(idx >= 0){ data.id = lista[idx].id; lista[idx] = data; }
  else lista.unshift(data);
  escribirListaPresupuestos(lista.slice(0,100));
  refrescarPresupuestosGuardados();
  $('#presupuestosGuardados').value = data.id;
  alert('Presupuesto guardado. Podrás recuperarlo desde “Presupuestos guardados”.');
}
function cargarPresupuestoGuardado(){
  const id = $('#presupuestosGuardados').value;
  if(!id){ alert('Selecciona un presupuesto guardado.'); return; }
  const p = leerListaPresupuestos().find(x => String(x.id) === String(id));
  if(!p){ alert('No se encontró el presupuesto guardado.'); return; }
  aplicarPresupuesto(p);
}
function borrarPresupuestoGuardado(){
  const id = $('#presupuestosGuardados').value;
  if(!id){ alert('Selecciona un presupuesto guardado.'); return; }
  if(!confirm('¿Borrar este presupuesto guardado?')) return;
  escribirListaPresupuestos(leerListaPresupuestos().filter(x => String(x.id) !== String(id)));
  refrescarPresupuestosGuardados();
}
function nuevoPresupuesto(){
  hxIdentificadorActual = '';
  const selectorGuardados = $('#presupuestosGuardados');
  if(selectorGuardados) selectorGuardados.value = '';
  window.dispatchEvent(new CustomEvent('hiperajax:identificador-cambiado'));
  if($('#tienda')) $('#tienda').value = '';
  if($('#comercial')) $('#comercial').value = '';
  ['cliente','telefono','email'].forEach(id=>{ const el=$('#'+id); if(el) el.value=''; });
  $('#numero').value = siguienteNumero(true);
  $('#fecha').value = new Date().toISOString().slice(0,10);
  $('#estado').value = 'Borrador';
  $('#validez').value = '30';
  $('#observaciones').value = '';
  $('#dtoGeneral').value = '0';
  $('#iva').value = '21';
  $('#buscador').value = '';
  $('#producto').value = '';
  $('#cantidad').value = '1';
  $('#resultados').classList.add('hidden');
  seleccionado = null;
  seleccionadoRef = '';
  seleccionadoPvp = null;
  lineas = [];
  render();
  refrescarPresupuestosGuardados();
}
function cargarLocal(){
  // La página siempre arranca con un presupuesto en blanco.
  // Los presupuestos guardados solo se cargan al pulsar “Recuperar”.
  nuevoPresupuesto();
}

function duplicarPresupuesto(){
  const actual = datosPresupuesto();
  actual.id = Date.now().toString();
  actual.numero = siguienteNumero(false);
  actual.estado = 'Borrador';
  actual.fecha = new Date().toISOString().slice(0,10);
  actual.guardado = new Date().toISOString();
  aplicarPresupuesto(actual);
  guardar();
}

function limpiar(){
  if(confirm('¿Vaciar todo el presupuesto?\n\nSe eliminarán todas las líneas actuales.')){
    const contador = $('#previewProducto').textContent;
    nuevoPresupuesto();
    if(contador.includes('productos cargados')) $('#previewProducto').textContent = contador;
  }
}
async function imagenComoDataURL(url){
  try{
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('No image');
    const blob = await res.blob();
    return await new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }catch(e){ return null; }
}
function formatFechaES(valor){
  if(!valor) return '-';
  const partes = String(valor).split('-');
  if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return valor;
}

function exportarExcel(){
  const tieneProductos=Array.isArray(lineas)&&lineas.some(l=>l&&!l.separador&&l.tipo!=='separador');
  if(!tieneProductos) return;
  if(!window.XLSX){ alert('No se pudo cargar el generador Excel. Comprueba la conexión a internet.'); return; }
  const wb=XLSX.utils.book_new();
  const aoa=[];
  aoa.push(['PRESUPUESTO AJAX']);
  aoa.push([]);
  aoa.push(['Tienda',$('#tienda')?.value||'']);
  aoa.push(['Cliente',$('#cliente')?.value||'']);
  aoa.push(['Teléfono',$('#telefono')?.value||'']);
  aoa.push(['Email',$('#email')?.value||'']);
  aoa.push(['Nº presupuesto',$('#numero')?.value||'']);
  aoa.push(['Fecha',$('#fecha')?.value||'']);
  aoa.push(['Estado',$('#estado')?.value||'']);
  aoa.push(['Validez (días)',Number($('#validez')?.value||0)]);
  aoa.push([]);
  aoa.push(['Producto','Descripción','PVP','Cantidad','Descuento %','Total']);
  const firstDataRow=aoa.length+1;
  lineas.forEach(l=>{
    if(l.separador) aoa.push([String(l.name||'SECCIÓN').toUpperCase(),'','','','','']);
    else aoa.push([l.name||'',l.desc||'',Number(l.pvp)||0,Number(l.qty)||1,Number(l.dto)||0,null]);
  });
  const lastDataRow=aoa.length;
  aoa.push([]);
  const subtotalRow=aoa.length+1; aoa.push(['','','','','Subtotal bruto',null]);
  const discountRow=aoa.length+1; aoa.push(['','','','','Descuento aplicado',null]);
  const baseRow=aoa.length+1; aoa.push(['','','','','Base imponible',null]);
  const ivaPct=Number($('#iva')?.value||0);
  const ivaRow=aoa.length+1; aoa.push(['','','','',`IVA ${ivaPct}%`,null]);
  const totalRow=aoa.length+1; aoa.push(['','','','','TOTAL',null]);
  aoa.push([]);
  aoa.push(['Observaciones',$('#observaciones')?.value||'']);
  const ws=XLSX.utils.aoa_to_sheet(aoa);
  for(let r=firstDataRow;r<=lastDataRow;r++){
    const prod=ws[`A${r}`]?.v||'';
    if(prod && ws[`C${r}`] && ws[`D${r}`] && ws[`E${r}`]) ws[`F${r}`]={t:'n',f:`C${r}*D${r}*(1-E${r}/100)`};
  }
  ws[`F${subtotalRow}`]={t:'n',f:`SUMPRODUCT(C${firstDataRow}:C${lastDataRow},D${firstDataRow}:D${lastDataRow})`};
  ws[`F${baseRow}`]={t:'n',f:`SUM(F${firstDataRow}:F${lastDataRow})`};
  ws[`F${discountRow}`]={t:'n',f:`F${subtotalRow}-F${baseRow}`};
  ws[`F${ivaRow}`]={t:'n',f:`F${baseRow}*${ivaPct}/100`};
  ws[`F${totalRow}`]={t:'n',f:`F${baseRow}+F${ivaRow}`};
  ['C','F'].forEach(col=>{ for(let r=firstDataRow;r<=totalRow;r++) if(ws[`${col}${r}`]) ws[`${col}${r}`].z='#,##0.00 [$€-es-ES]'; });
  for(let r=firstDataRow;r<=lastDataRow;r++) if(ws[`E${r}`]) ws[`E${r}`].z='0.00';
  ws['!cols']=[{wch:25},{wch:55},{wch:13},{wch:11},{wch:14},{wch:16}];
  ws['!freeze']={xSplit:0,ySplit:12};
  XLSX.utils.book_append_sheet(wb,ws,'Presupuesto');
  const safe=String($('#numero')?.value||'hiper_antena').replace(/[^a-z0-9_-]/gi,'_');
  XLSX.writeFile(wb,`presupuesto_${safe}.xlsx`);
}

function descripcionPdfCorta(linea){
  try{
    const l = linea || {};
    const refOriginal = String(l.name || '').trim();

    // PDF estable: usar siempre short_description cuando exista.
    // Los presupuestos antiguos pueden no llevarla guardada, por eso se recupera
    // del catálogo actual por referencia. AutoTable la muestra en una sola línea
    // mediante overflow:'ellipsize' en la columna Descripción.
    const productoPdf = (Array.isArray(productos) ? productos : []).find(
      p => String(p?.name || '').trim().toUpperCase() === refOriginal.toUpperCase()
    );
    const shortPdf = String(l.short_description || productoPdf?.short_description || '')
      .replace(/\s+/g,' ')
      .trim();
    if(shortPdf) return shortPdf;
    const brandOriginal = String(l.brand || '').trim();
    const brandEsAjax = normaliza(brandOriginal) === 'ajax';
    // En el CSV, la columna brand contiene la descripción de los artículos no AJAX.
    // El PDF debe conservarla en lugar de fabricar una descripción desde la referencia.
    const descOriginal = String(l.desc || (!brandEsAjax ? brandOriginal : '') || '').trim();
    if(!refOriginal && descOriginal) return descOriginal.slice(0, 58);
    if(l.manual){ return (descOriginal || refOriginal || 'Línea manual').slice(0, 58); }
    if(descOriginal && !brandEsAjax){
      return descOriginal.length > 58 ? descOriginal.slice(0,55).trim() + '…' : descOriginal;
    }

    const ref = refOriginal.toUpperCase();

    function colorRef(r){
      if(/(^|[-_])W($|[-_])/.test(r)) return 'Blanco';
      if(/(^|[-_])B($|[-_])/.test(r)) return 'Negro';
      if(/(^|[-_])GRA($|[-_])/.test(r)) return 'Grafito';
      if(/(^|[-_])GRE($|[-_])/.test(r)) return 'Verde';
      if(/(^|[-_])IVO($|[-_])/.test(r)) return 'Marfil';
      if(/(^|[-_])OLI($|[-_])/.test(r)) return 'Oliva';
      if(/(^|[-_])FOG($|[-_])/.test(r)) return 'Niebla';
      if(/(^|[-_])OYS($|[-_])/.test(r)) return 'Ostra';
      return '';
    }

    const color = colorRef(ref);
    let base = ref.replace(/^AJ-/, '');

    const exactos = [
      [/^HUB2PLUS/, 'Hub 2 Plus'], [/^HUB2-4G/, 'Hub 2 4G'], [/^HUB2/, 'Hub 2'], [/^HUBBP/, 'Hub BP'], [/^HUB($|-)/, 'Hub'],
      [/^REX2/, 'ReX 2'], [/^REX($|-)/, 'ReX'],
      [/^MOTIONCAM-HDR-PHOD/, 'MotionCam HDR PhOD'], [/^MOTIONCAM-HDR/, 'MotionCam HDR'], [/^MOTIONCAMOUTDOOR.*PHOD/, 'MotionCam Outdoor PhOD'], [/^MOTIONCAMOUTDOOR/, 'MotionCam Outdoor'], [/^MOTIONCAM/, 'MotionCam'],
      [/^MOTIONPROTECTPLUS/, 'MotionProtect Plus'], [/^MOTIONPROTECT/, 'MotionProtect'], [/^OUTDOORPROTECT/, 'OutdoorProtect'],
      [/^DOORPROTECTPLUS/, 'DoorProtect Plus'], [/^DOORPROTECT/, 'DoorProtect'], [/^GLASSPROTECT/, 'GlassProtect'],
      [/^CURTAINCAM/, 'CurtainCam'], [/^DUALCURTAIN/, 'DualCurtain Outdoor'], [/^CURTAINOUTDOOR/, 'Curtain Outdoor'], [/^CURTAINPROTECT/, 'CurtainProtect'],
      [/^KEYPADTOUCHSCREEN/, 'KeyPad TouchScreen'], [/^KEYPADPLUS/, 'KeyPad Plus'], [/^KEYPADOUTDOOR/, 'KeyPad Outdoor'], [/^KEYPAD/, 'KeyPad'],
      [/^HOMESIREN/, 'HomeSiren'], [/^STREETSIRENCUSTOM/, 'StreetSiren Custom'], [/^STREETSIREN/, 'StreetSiren'],
      [/^FIREPROTECT2-HSC/, 'FireProtect 2 HSC'], [/^FIREPROTECT2-HS/, 'FireProtect 2 HS'], [/^FIREPROTECT2-HC/, 'FireProtect 2 HC'], [/^FIREPROTECT2-H/, 'FireProtect 2 H'], [/^FIREPROTECT2-C/, 'FireProtect 2 C'], [/^FIREPROTECTPLUS/, 'FireProtect Plus'], [/^FIREPROTECT/, 'FireProtect'],
      [/^LEAKSPROTECT/, 'LeaksProtect'], [/^WATERSTOP/, 'WaterStop'], [/^LIFEQUALITY-LITE/, 'LifeQuality Lite'], [/^LIFEQUALITY/, 'LifeQuality'],
      [/^BULLETCAM-(\d+)/, 'BulletCam $1 MP'], [/^DOMECAM-MINI-(\d+)/, 'DomeCam Mini $1 MP'], [/^DOMECAM-(\d+)/, 'DomeCam $1 MP'], [/^TURRETCAM-(\d+)/, 'TurretCam $1 MP'], [/^INDOORCAM-(\d+)/, 'IndoorCam $1 MP'], [/^DOORBELL-(\d+)/, 'DoorBell $1 MP'],
      [/^NVRKIT/, 'Kit NVR'], [/^NVR(\d+)/, 'NVR $1'],
      [/^LIGHTCORE-1G/, 'LightSwitch 1 tecla'], [/^LIGHTCORE-2G2W/, 'LightSwitch 2 teclas/2 vías'], [/^LIGHTCORE-2G/, 'LightSwitch 2 teclas'], [/^LIGHTCORE-2W/, 'LightSwitch 2 vías'], [/^LIGHTCORE-CROSS/, 'LightSwitch cruzamiento'], [/^LIGHTCORE-DIMMER/, 'Dimmer LightSwitch'],
      [/^SOCKET/, 'Socket'], [/^OUTLETCORE-SMART/, 'Outlet Core Smart'], [/^OUTLETCORE-LAN/, 'Outlet Core LAN'], [/^OUTLETCORE-BASIC/, 'Outlet Core Basic'], [/^RELAY/, 'Relay'], [/^WALLSWITCH/, 'WallSwitch'],
      [/^TRANSMITTER/, 'Transmitter'], [/^MULTITRANSMITTER/, 'MultiTransmitter'], [/^UARTBRIDGE/, 'uartBridge'], [/^OCBRIDGE/, 'ocBridge'], [/^VHFBRIDGE/, 'vhfBridge'],
      [/^SPACECONTROL/, 'SpaceControl'], [/^DOUBLEBUTTON/, 'DoubleButton'], [/^BUTTON/, 'Button'], [/^TAG/, 'Tag'], [/^PASS/, 'Pass'],
      [/^HD(\d+)TB/, 'Disco HDD $1 TB'], [/^HS[-_ ]?TF.*(128G)/, 'MicroSD 128 GB'], [/^HS[-_ ]?TF.*(64G)/, 'MicroSD 64 GB'], [/^HS[-_ ]?TF.*(32G)/, 'MicroSD 32 GB']
    ];

    let nombre = '';
    for(const [rx, val] of exactos){
      const m = ref.match(rx);
      if(m){ nombre = val.replace('$1', m[1] || ''); break; }
    }

    if(!nombre){
      nombre = base
        .replace(/-(B|W|GRA|GRE|IVO|OLI|FOG|OYS)(-|$)/g, '-')
        .replace(/-(DUMMY|BRACKET|LENS)$/g, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    const extras = [];
    if(/PHOD/.test(ref) && !/PHOD/i.test(nombre)) extras.push('PhOD');
    if(/HDR/.test(ref) && !/HDR/i.test(nombre)) extras.push('HDR');
    if(/HLVF/.test(ref)) extras.push('HLVF');
    if(/HL($|-)/.test(ref)) extras.push('HL');
    if(/4G/.test(ref) && !/4G/.test(nombre)) extras.push('4G');
    if(/POE/.test(ref)) extras.push('PoE');
    if(/AC($|-)/.test(ref)) extras.push('AC');

    let out = [nombre, ...extras, color].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
    if(!out) out = descOriginal || refOriginal;

    // Mantiene PDF compacto sin cortar referencias comerciales importantes.
    if(out.length > 52){
      out = out.replace(/\b(Jeweller|inalámbrico|inteligente|compatible|para sistemas Ajax)\b/gi,'').replace(/\s+/g,' ').trim();
    }
    if(out.length > 58) out = out.slice(0,55).trim() + '…';
    return out;
  }catch(e){
    return String((linea && (linea.desc || linea.name)) || 'Producto').slice(0,58);
  }
}

async function pdf(){
  // Si no hay productos reales, no abre ni genera ningún PDF.
  const tieneProductos = Array.isArray(lineas) && lineas.some(l => l && !l.separador && l.tipo !== 'separador');
  if(!tieneProductos){
    alert('Añade al menos un producto antes de generar el PDF.');
    return;
  }

  // Safari/iOS puede bloquear una descarga iniciada después de await().
  // Se reserva una pestaña en el mismo gesto del usuario y se usa al final.
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const pdfWindow = esIOS ? window.open('', '_blank') : null;
  if(pdfWindow){
    try{
      pdfWindow.document.write('<!doctype html><title>Generando PDF…</title><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;padding:24px">Generando presupuesto…</body>');
      pdfWindow.document.close();
    }catch(_error){}
  }

  const { jsPDF } = window.jspdf || {};
  if(!jsPDF || typeof jsPDF !== 'function' || typeof jsPDF.API?.autoTable !== 'function'){
    try{ pdfWindow?.close(); }catch(_error){}
    alert('No se pudo cargar el generador PDF. Comprueba la conexión a internet para las librerías jsPDF.');
    return;
  }
  const doc = new jsPDF({unit:'mm',format:'a4'});
  const c = calc();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const green = [13,77,49];
  const green2 = [31,143,95];
  const dark = [18,24,30];
  const light = [245,248,246];

  // Cabecera PDF compacta: logos y título centrados verticalmente.
  doc.setFillColor(255,255,255);
  doc.rect(0,0,pageW,27,'F');

  const logo = await imagenComoDataURL('logo_ajax.jpg');
  const logoHiper = await imagenComoDataURL('logo_hiper_antena.png');
  if(logo){ try{ doc.addImage(logo, 'JPEG', 14, 6.2, 26, 12.4); }catch(e){} }
  if(logoHiper){ try{ doc.addImage(logoHiper, 'PNG', pageW-48, 5.4, 34, 15.6); }catch(e){} }
  doc.setTextColor(13,77,49);
  doc.setFont('helvetica','normal'); doc.setFontSize(15.2);
  doc.text('Presupuesto Ajax', pageW/2, 14.4, {align:'center'});
  doc.setDrawColor(13,77,49);
  doc.setLineWidth(0.22);
  doc.line(14,24,pageW-14,24);

  const fechaPdf = formatFechaES($('#fecha').value || '') || '-';
  const comercialPdf = $('#comercial') ? ($('#comercial').value || 'Sin asignar') : 'Sin asignar';
  const validezPdf = `${($('#validez').value || '30')} días`;
  const tiendaPdf = $('#tienda') ? ($('#tienda').value || '-') : '-';
  const numeroPdf = $('#numero').value || '-';
  const clientePdf = $('#cliente').value || '-';
  const telefonoPdf = $('#telefono').value || '-';
  const emailPdf = $('#email').value || '-';
  const identificadorPdf = String(window.HX_GET_IDENTIFICADOR_ACTUAL?.() || '').trim();

  const fitPdf = (txt, max) => {
    txt = String(txt || '-');
    while(doc.getTextWidth(txt) > max && txt.length > 4){ txt = txt.slice(0,-2) + '…'; }
    return txt;
  };

  let y = 28;
  // Datos compactos en dos líneas, mismo ancho visual que la tabla
  doc.setFillColor(255,255,255);
  doc.setDrawColor(224,232,228);
  doc.roundedRect(14,y,pageW-28,identificadorPdf?21.6:16.2,2.2,2.2,'S');

  doc.setFont('helvetica','bold'); doc.setFontSize(7.2); doc.setTextColor(13,77,49);
  doc.text('Tienda:',18,y+5.5); doc.text('Cliente:',63,y+5.5); doc.text('Tel.:',122,y+5.5); doc.text('Email:',150,y+5.5);
  doc.text('Nº:',18,y+12.8); doc.text('Fecha:',62,y+12.8); doc.text('Comercial:',103,y+12.8); doc.text('Validez:',158,y+12.8);

  doc.setFont('helvetica','normal'); doc.setFontSize(7.8); doc.setTextColor(25,31,36);
  doc.text(fitPdf(tiendaPdf,34),32,y+5.5);
  doc.text(fitPdf(clientePdf,42),80,y+5.5);
  doc.text(fitPdf(telefonoPdf,22),132,y+5.5);
  doc.text(fitPdf(emailPdf,36),161,y+5.5);
  doc.text(fitPdf(numeroPdf,35),25,y+12.8);
  doc.text(fitPdf(fechaPdf,28),75,y+12.8);
  doc.text(fitPdf(comercialPdf,34),122,y+12.8);
  doc.text(fitPdf(validezPdf,25),176,y+12.8);
  if(identificadorPdf){
    doc.setFont('helvetica','bold'); doc.setFontSize(7.2); doc.setTextColor(13,77,49);
    doc.text('Identificador:',18,y+18.1);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.8); doc.setTextColor(25,31,36);
    doc.text(fitPdf(identificadorPdf,pageW-62),43,y+18.1);
  }

  y += identificadorPdf ? 24.9 : 19.5;

  const rows = lineas.map(l=>{
    if(l.separador){
      return [{content:String(l.name || 'SECCIÓN').toUpperCase(), colSpan:6, styles:{fillColor:[229,244,236], textColor:green, fontStyle:'bold', halign:'center', fontSize:8.6, cellPadding:2.1}}];
    }
    const bruto = (Number(l.pvp)||0)*(Number(l.qty)||0);
    const dto = Number(l.dto)||0;
    const total = bruto*(1-dto/100);
    const desc = descripcionPdfCorta(l);
    return [l.name, desc, fmt.format(Number(l.pvp)||0), String(l.qty||1), `${dto}%`, fmt.format(total)];
  });

  doc.autoTable({
    startY:y,
    head:[['Producto','Descripción','PVP','Cant.','Dto.','Total']],
    body: rows.length ? rows : [['Sin productos añadidos','','','','','']],
    margin:{left:14,right:14},
    tableWidth:'wrap',
    styles:{font:'helvetica',fontSize:7.6,cellPadding:1.75,lineColor:[225,231,228],lineWidth:0.1,textColor:[33,38,43],overflow:'linebreak'},
    headStyles:{fillColor:green,textColor:[255,255,255],fontStyle:'bold',halign:'center'},
    alternateRowStyles:{fillColor:[248,250,249]},
    columnStyles:{0:{cellWidth:48},1:{cellWidth:58,overflow:'ellipsize'},2:{halign:'right',cellWidth:22},3:{halign:'center',cellWidth:12},4:{halign:'right',cellWidth:16},5:{halign:'right',cellWidth:26}},
    didParseCell:function(data){
      if(data.section==='body' && data.cell.raw && data.cell.raw.colSpan===6){
        data.cell.styles.fillColor=[229,244,236];
        data.cell.styles.textColor=green;
        data.cell.styles.fontStyle='bold';
        data.cell.styles.halign='center';
      }
    }
  });

  y = doc.lastAutoTable.finalY + 6;
  if(($('#observaciones').value||'').trim()){
    if(y > 220){ doc.addPage(); y = 24; }
    doc.setTextColor(45,55,60); doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text('Observaciones',14,y);
    doc.setFont('helvetica','normal');
    const obsLines = doc.splitTextToSize($('#observaciones').value, 88);
    doc.text(obsLines,14,y+5);
    y += 10 + obsLines.length * 4;
  }
  if(y > 230){ doc.addPage(); y = 24; }

  // Resumen de importes: compacto, con aire arriba y sin margen excesivo abajo
  const totalBoxX = 112, totalBoxW = 84;
  doc.setFillColor(246,248,247);
  doc.setDrawColor(220,228,224);
  doc.roundedRect(totalBoxX,y-3,totalBoxW,31,3,3,'FD');
  const hayDescuentoReal = Number(c.dtoLineas||0) > 0.005;
  const resumen = hayDescuentoReal ? [
    ['Descuento aplicado', `-${fmt.format(c.dtoLineas)}`],
    ['Base imponible', fmt.format(c.base)],
    [`IVA (${c.ivaPct}%)`, fmt.format(c.iva)]
  ] : [
    ['Subtotal', fmt.format(c.subtotalBruto)],
    ['Base imponible', fmt.format(c.base)],
    [`IVA (${c.ivaPct}%)`, fmt.format(c.iva)]
  ];
  doc.setFontSize(8.7); doc.setTextColor(45,55,60); doc.setFont('helvetica','normal');
  resumen.forEach((r,i)=>{
    const yy = y + 2 + i*5.8;
    doc.text(r[0], totalBoxX+5, yy);
    doc.text(r[1], totalBoxX+totalBoxW-5, yy, {align:'right'});
  });
  doc.setFillColor(...green2);
  doc.roundedRect(totalBoxX, y+18, totalBoxW, 10.5, 2.5, 2.5, 'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10.8);
  doc.text('TOTAL', totalBoxX+5, y+25.1);
  doc.text(fmt.format(c.total), totalBoxX+totalBoxW-5, y+25.1, {align:'right'});

  // Pie en todas las páginas
  const pages = doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setDrawColor(13,77,49);
    doc.line(14,pageH-15,pageW-14,pageH-15);
    doc.setTextColor(90,100,96); doc.setFont('helvetica','normal'); doc.setFontSize(8.5);
    doc.text('Hiper Antena - Tienda para los profesionales',14,pageH-9);
    doc.text(`Página ${i} de ${pages}`,pageW-14,pageH-9,{align:'right'});
  }

  const nombrePdf = `presupuesto_${($('#numero').value||'hiper_antena').replace(/[^a-z0-9_-]/gi,'_')}.pdf`;

  if(pdfWindow && !pdfWindow.closed){
    try{
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      pdfWindow.location.replace(blobUrl);
      setTimeout(()=>URL.revokeObjectURL(blobUrl), 120000);
      return;
    }catch(error){
      try{ pdfWindow.close(); }catch(_error){}
      console.warn('Vista PDF móvil no disponible; se usa descarga estándar.', error);
    }
  }
  doc.save(nombrePdf);
}


/* Explorer Pro vive en explorer.js.
   Se retiró el selector rápido histórico para no mantener dos navegaciones. */

window.setLinea=setLinea; window.delLinea=delLinea; window.addLineaManual=addLineaManual; window.addSeparador=addSeparador; window.moverLinea=moverLinea;
document.addEventListener('DOMContentLoaded',()=>{
  aplicarTemaGuardado(); hxInicioArriba();
  $('#themeToggle')?.addEventListener('click',alternarTema);
  cargarLocal(); render(); cargarCatalogo();
  $('#buscador').addEventListener('input',resolverDesdeInput);
  $('#buscador').addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault(); moverActivo(1);} 
    if(e.key==='ArrowUp'){e.preventDefault(); moverActivo(-1);} 
    if(e.key==='Enter'){e.preventDefault(); addLinea();}
    if(e.key==='Escape') $('#resultados').classList.add('hidden');
  });
  document.addEventListener('click',e=>{ if(!e.target.closest('.search-wrap')) $('#resultados').classList.add('hidden'); });
  $('#producto').addEventListener('change',e=>{ if(e.target.value!=='') seleccionarProducto(Number(e.target.value), true); });
  $('#btnCatalogo')?.addEventListener('click',abrirCatalogo);
  $('#catalogClose')?.addEventListener('click',cerrarCatalogo);
  $('#catalogCancel')?.addEventListener('click',cerrarCatalogo);
  $('#catalogBackdrop')?.addEventListener('click',cerrarCatalogo);
  $('#catalogFilter')?.addEventListener('input',e=>{ pintarCatalogPanel(e.target.value); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') cerrarCatalogo(); });
  $('#add').addEventListener('click',addLinea); $('#btnManual').addEventListener('click',addLineaManual); $('#btnSeparador')?.addEventListener('click',addSeparador);
  $('#btnPDF')?.addEventListener('click',()=>{
    const btn=$('#btnPDF');
    const label=btn?.querySelector('.header-format-label');
    if(btn?.dataset.generating==='1') return;
    if(btn) btn.dataset.generating='1';
    if(label) label.textContent='…';
    Promise.resolve(pdf()).catch(error=>{
      console.error('[PDF] Error al generar el presupuesto', error);
      alert(`No se pudo generar el PDF. ${error?.message || 'Revisa la consola para más detalles.'}`);
    }).finally(()=>{
      if(btn) delete btn.dataset.generating;
      if(label) label.textContent='PDF';
    });
  }); $('#btnExcel')?.addEventListener('click',exportarExcel); $('#btnSave').addEventListener('click',guardar); $('#btnDuplicate').addEventListener('click',duplicarPresupuesto); $('#btnLoadSaved').addEventListener('click',cargarPresupuestoGuardado); $('#btnDeleteSaved').addEventListener('click',borrarPresupuestoGuardado); $('#btnClear').addEventListener('click',limpiar);
  $('#dtoGeneral').addEventListener('input',aplicarDescuentoGeneralALineas); $('#iva').addEventListener('input',render);
});


/* =====================================================
   BUSCADOR ESTABLE v1.6.3.1
   Regla principal: TODO lo que esté en el CSV debe salir.
   El conocimiento mejora familia/descripción, pero nunca oculta.
   ===================================================== */
function metaProducto164(p){
  const raw = String((p && p.name) || '');
  const n = normaliza(raw);
  const tags = [];
  const add = (...xs)=>xs.forEach(x=>{ if(x) tags.push(x); });

  if(n.includes('abe-150') || n.includes('barrera')){
    add('barrera','perimetral','proteccion perimetral','exterior','intrusion','sensor barrera');
    return {icon:'🛡️', family:'Protección perimetral', sub:'Barreras', desc:'Barrera de protección perimetral', tags};
  }
  if(n.includes('vdms105gp')){
    add('switch poe','poe','switch','red','ethernet','5 puertos','5p','camara ip','cctv','alimentacion poe');
    return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', desc:'Switch PoE de 5 puertos para red y cámaras IP', tags};
  }
  if(n.includes('vdms108gp')){
    add('switch poe','poe','switch','red','ethernet','8 puertos','8p','camara ip','cctv','alimentacion poe');
    return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', desc:'Switch PoE de 8 puertos para red y cámaras IP', tags};
  }
  if(n.includes('inj-poe') || n.includes('injector-poe') || n.includes('inyector-poe')){
    add('inyector poe','injector poe','poe','red','ethernet','alimentacion poe','camara ip','cctv');
    return {icon:'⚡', family:'Red / PoE', sub:'Inyectores PoE', desc:'Inyector PoE para alimentar dispositivos de red por cable Ethernet', tags};
  }
  if(/^hd\d+tb/.test(n) || n.includes('hdd') || n.includes('disco-duro') || n.includes('disco duro')){
    const cap = (raw.match(/HD(\d+)TB/i)||[])[1];
    add('disco','disco duro','hdd','almacenamiento','grabacion','grabación','nvr','videovigilancia','cctv', cap ? `${cap}tb` : '');
    return {icon:'💾', family:'Almacenamiento', sub:'Discos duros', desc:`Disco duro ${cap ? cap + ' TB ' : ''}para grabación en NVR`, tags};
  }
  if(n.includes('hs-tf') || n.includes('microsd') || n.includes('micro-sd') || n.includes('tarjeta-sd') || n.includes('tarjeta sd')){
    const cap = (raw.match(/(32|64|128|256|512)G/i)||[])[1];
    add('tarjeta sd','micro sd','microsd','memoria','tarjeta memoria','almacenamiento','grabacion','grabación','camara','cctv', cap ? `${cap}gb` : '');
    return {icon:'💾', family:'Almacenamiento', sub:'Tarjetas microSD', desc:`Tarjeta microSD ${cap ? cap + ' GB ' : ''}para almacenamiento y grabación`, tags};
  }

  if(n.includes('solobutton')){
    add('solobutton','mecanismo','automatizacion','automatización','lightswitch','lightcore','interruptor','tecla','boton interruptor','panel','tapa','pulsador luz');
    return {icon:'💡', family:'Confort y automatización', sub:'Mecanismos LightSwitch', desc:'Panel táctil SoloButton para mecanismos LightSwitch', tags};
  }
  if(n.includes('centerbutton')){
    add('centerbutton','mecanismo','automatizacion','automatización','lightswitch','lightcore','interruptor','tecla central','boton central','panel','tapa','pulsador luz');
    return {icon:'💡', family:'Confort y automatización', sub:'Mecanismos LightSwitch', desc:'Botón central táctil para mecanismos LightSwitch', tags};
  }
  if(n.includes('sidebutton')){
    add('sidebutton','mecanismo','automatizacion','automatización','lightswitch','lightcore','interruptor','tecla lateral','boton lateral','panel','tapa','pulsador luz');
    return {icon:'💡', family:'Confort y automatización', sub:'Mecanismos LightSwitch', desc:'Botón lateral táctil para mecanismos LightSwitch', tags};
  }
  if(n.includes('lightcore')){
    let desc = 'Módulo LightCore para interruptor inteligente AJAX';
    if(n.includes('dimmer')) desc = 'Módulo LightCore Dimmer para regulación de iluminación';
    else if(n.includes('2g2w')) desc = 'Módulo LightCore de 2 bandas y 2 vías para interruptor inteligente';
    else if(n.includes('2g')) desc = 'Módulo LightCore de 2 bandas para interruptor inteligente';
    else if(n.includes('2w')) desc = 'Módulo LightCore de 2 vías para interruptor inteligente';
    else if(n.includes('cross')) desc = 'Módulo LightCore Crossover para interruptor de cruce';
    add('lightcore','lightswitch','interruptor','luz','iluminacion','iluminación','domotica','domótica','automatizacion','mecanismo','modulo interruptor');
    return {icon:'💡', family:'Confort y automatización', sub:'LightSwitch', desc, tags};
  }

  if(n.includes('solocover')){
    add('solocover','outletcore','outlet','enchufe','tapa','tapa enchufe','mecanismo','cover','embellecedor','base enchufe','automatizacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Tapas OutletCore', desc:'Tapa SoloCover para OutletCore / base de enchufe AJAX', tags};
  }
  if(n.includes('centercover')){
    add('centercover','outletcore','outlet','enchufe','tapa central','tapa enchufe','mecanismo','cover','embellecedor','base enchufe','automatizacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Tapas OutletCore', desc:'Tapa central CenterCover para OutletCore / base de enchufe AJAX', tags};
  }
  if(n.includes('sidecover')){
    add('sidecover','outletcore','outlet','enchufe','tapa lateral','tapa enchufe','mecanismo','cover','embellecedor','base enchufe','automatizacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Tapas OutletCore', desc:'Tapa lateral SideCover para OutletCore / base de enchufe AJAX', tags};
  }
  if(n.includes('outletcore-basic')){
    add('outletcore','outlet','enchufe','base enchufe','toma corriente','mecanismo','automatizacion','con tierra');
    return {icon:'🔌', family:'Confort y automatización', sub:'Bases de enchufe', desc:'Módulo OutletCore Basic para base de enchufe con conexión a tierra', tags};
  }
  if(n.includes('outletcore-lan')){
    add('outletcore','outlet lan','ethernet','red','lan','rj45','mecanismo','toma datos','base ethernet');
    return {icon:'🌐', family:'Confort y automatización', sub:'Bases de enchufe', desc:'Módulo OutletCore LAN para base Ethernet de dos puertos', tags};
  }
  if(n.includes('outletcore-smart')){
    add('outletcore','outlet smart','enchufe inteligente','monitor consumo','consumo electrico','toma corriente','automatizacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Bases de enchufe', desc:'Módulo OutletCore inteligente con monitor de consumo eléctrico', tags};
  }
  if(n.includes('coverplate')){
    add('coverplate','tapa','caja montaje','surfacebox','mecanismo','embellecedor','outlet','lightswitch');
    return {icon:'🧩', family:'Confort y automatización', sub:'Mecanismos y tapas', desc:'Tapa de la caja de montaje para mecanismos AJAX', tags};
  }
  if(n.includes('frame-')){
    add('frame','marco','mecanismo','lightswitch','outlet','enchufe','interruptor','automatizacion','embellecedor');
    return {icon:'🧩', family:'Confort y automatización', sub:'Marcos', desc:'Marco para mecanismos LightSwitch y Outlet AJAX', tags};
  }
  if(n.includes('surfacebox')){
    add('surfacebox','caja superficie','caja montaje','mecanismo','lightswitch','outlet','enchufe','interruptor','automatizacion');
    return {icon:'🧩', family:'Confort y automatización', sub:'Cajas de superficie', desc:'Caja de montaje en superficie para LightSwitch u Outlet', tags};
  }
  if(n.includes('bypass-dimmer')){
    add('bypass','dimmer','lightswitch','regulador','luz','iluminacion','automatizacion');
    return {icon:'💡', family:'Confort y automatización', sub:'Accesorios LightSwitch', desc:'Bypass para LightSwitch Dimmer', tags};
  }
  if(n.includes('socket')){
    add('socket','enchufe inteligente','enchufe','monitor consumo','consumo electrico','automatizacion','domotica');
    return {icon:'🔌', family:'Confort y automatización', sub:'Enchufes inteligentes', desc:'Enchufe inteligente con monitor de consumo eléctrico', tags};
  }
  if(n.includes('wallswitch')){
    add('wallswitch','rele potencia','relé potencia','relay','automatizacion','domotica','control remoto','110v','230v','alimentacion');
    return {icon:'🔌', family:'Confort y automatización', sub:'Relés', desc:'Relé de potencia para controlar alimentación 110/230 V en remoto', tags};
  }
  if(n === 'aj-relay' || n.endsWith('relay')){
    add('relay','rele','relé','contacto seco','automatizacion','domotica','puerta garaje','porton','control remoto');
    return {icon:'🔌', family:'Confort y automatización', sub:'Relés', desc:'Relé inalámbrico de contacto seco', tags};
  }
  return null;
}

const descripcionProductoAnterior_164 = descripcionProducto;
descripcionProducto = function(p){
  const meta = metaProducto164(p);
  if(meta) return {icon:meta.icon, desc:meta.desc, family:meta.family, official:meta.sub};
  return descripcionProductoAnterior_164(p);
};
function esSwitchPoe165(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('vdms105gp') || n.includes('vdms108gp') || (n.includes('switch') && n.includes('poe'));
}
function esInyectorPoe165(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('inj-poe') || n.includes('injector-poe') || n.includes('inyector-poe');
}
function esDiscoDuro165(p){
  const n = normaliza((p && p.name) || '');
  return /^hd\d+tb/.test(n) || n.includes('disco') || n.includes('hdd');
}
function esTarjetaSD165(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('hs-tf') || n.includes('microsd') || n.includes('micro-sd') || n.includes('tarjeta-sd') || n.includes('tarjeta sd');
}

const metaProductoAnterior_165 = typeof metaProducto164 === 'function' ? metaProducto164 : null;
metaProducto164 = function(p){
  const raw = String((p && p.name) || '');
  const n = normaliza(raw);
  const tags = [];
  const add = (...xs)=>xs.forEach(x=>{ if(x) tags.push(x); });

  if(esSwitchPoe165(p)){
    const puertos = n.includes('108') ? '8' : (n.includes('105') ? '5' : '');
    add('switch poe','poe','switch','red','ethernet','lan','gigabit','camaras ip','videovigilancia','alimentacion poe', puertos ? `${puertos} puertos` : '', puertos ? `switch poe ${puertos}` : '');
    return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', desc:`Switch PoE${puertos ? ' de ' + puertos + ' puertos' : ''} para red, cámaras IP y alimentación PoE`, tags};
  }
  if(esInyectorPoe165(p)){
    add('inyector poe','injector poe','poe','red','ethernet','lan','alimentacion poe','camara ip','cctv','30w','poe injector');
    return {icon:'⚡', family:'Red / PoE', sub:'Inyectores PoE', desc:'Inyector PoE para alimentar dispositivos de red por cable Ethernet', tags};
  }
  if(esDiscoDuro165(p)){
    const cap = (raw.match(/HD(\d+)TB/i)||[])[1];
    add('disco','disco duro','hdd','almacenamiento','memoria','grabacion','grabación','nvr','videovigilancia','cctv', cap ? `${cap}tb` : '', cap ? `disco ${cap}tb` : '');
    return {icon:'💾', family:'Almacenamiento', sub:'Discos duros', desc:`Disco duro ${cap ? cap + ' TB ' : ''}para grabación en NVR`, tags};
  }
  if(esTarjetaSD165(p)){
    const cap = (raw.match(/(32|64|128|256|512)G/i)||[])[1];
    add('tarjeta sd','micro sd','microsd','memoria','tarjeta memoria','almacenamiento','grabacion','grabación','camara','cctv', cap ? `${cap}gb` : '', cap ? `micro sd ${cap}gb` : '');
    return {icon:'💾', family:'Almacenamiento', sub:'Tarjetas microSD', desc:`Tarjeta microSD ${cap ? cap + ' GB ' : ''}para almacenamiento y grabación`, tags};
  }
  return metaProductoAnterior_165 ? metaProductoAnterior_165(p) : null;
};
function esProductoBateria166(p){
  const n = normaliza((p && p.name) || '');
  return n.includes('battery') || n.includes('batt') || n.includes('internalbattery') || n.includes('batterybox') || n.includes('batterykit') || n.includes('hubbatt');
}

const metaProductoAnterior_166 = typeof metaProducto164 === 'function' ? metaProducto164 : null;
metaProducto164 = function(p){
  const n = normaliza((p && p.name) || '');
  if(esProductoBateria166(p)){
    return {
      icon:'🔋',
      family:'Alimentación',
      sub:'Baterías',
      desc: n.includes('internalbattery') ? 'Batería interna para equipos AJAX' : (n.includes('batterybox') ? 'Caja de batería para alimentación de respaldo' : 'Batería o kit de alimentación de respaldo'),
      tags:['bateria','batería','battery','batterybox','batterykit','pila','alimentacion','alimentación','respaldo','backup','autonomia','autonomía']
    };
  }
  return metaProductoAnterior_166 ? metaProductoAnterior_166(p) : null;
};


/* =====================================================
   PRO v1.7.5 - CARGA CSV EXTERNO ROBUSTA + BÚSQUEDA ESTABLE
   Objetivo:
   - El CSV externo manda SIEMPRE.
   - Productos nuevos aparecen por referencia/nombre aunque no tengan ficha.
   - El conocimiento solo enriquece; no puede ocultar productos.
   - Parser acepta ;, tabuladores, columnas extra y líneas pegadas simples.
   - Descripciones existentes se mantienen.
   ===================================================== */
function parseCSVRobusto175(txt){
  txt = String(txt || '').replace(/^\uFEFF/, '').replace(/\r/g, '').trim();
  if(!txt) return [];

  const rawLines = txt.split('\n').map(l => l.trim()).filter(Boolean);
  if(!rawLines.length) return [];

  const splitLine = (line) => {
    if(line.includes(';')) return splitCSVLine(line, ';');
    if(line.includes('\t')) return line.split('\t').map(x => x.trim());

    // Fallback para líneas pegadas tipo: "RACK-WALL        168.00"
    const m = line.match(/^(.+?)\s+([0-9]+(?:[.,][0-9]+)?)$/);
    if(m) return [m[1].trim(), '', m[2].trim()];
    return [line.trim(), '', '0'];
  };

  const first = splitLine(rawLines[0]);
  const headers = first.map(h => String(h || '').trim());
  const headerNorm = headers.map(h => normaliza(h).replace(/[^a-z0-9]/g,''));
  const hasHeader = headerNorm.some(h => ['name','nombre','producto','descripcion','referencia','codigo','brand','marca','fabricante','pvp','precio','price','importe'].includes(h));
  const start = hasHeader ? 1 : 0;
  const find = aliases => headerNorm.findIndex(h => aliases.includes(h));

  let idxName = 0;
  let idxBrand = 1;
  let idxPvp = 2;
  let idxDescription = -1;
  let idxShortDescription = -1;
  let idxImage = -1;
  let idxStock = -1;
  let idxCost = -1;
  let idxCategory = -1;
  let idxFamily = -1;
  let idxSubcategory = -1;
  let idxProductType = -1;
  let idxSeries = -1;
  let idxTechnology = -1;
  let idxProtocol = -1;
  let idxColor = -1;
  let idxConnectivity = -1;
  let idxResolution = -1;
  let idxEnvironment = -1;
  let idxPhoto = -1;
  let idxPoe = -1;
  let idxWifi = -1;
  let idxLte4g = -1;
  let idxCompatibility = -1;
  let idxChannels = -1;
  let idxLens = -1;
  let idxMounting = -1;
  let idxPower = -1;
  let idxAttributes = -1;
  let idxOrder = -1;
  let idxRelatedProducts = -1;

  if(hasHeader){
    idxName = find(['name','nombre','producto','referencia','codigo','ref','sku']);
    idxBrand = find(['brand','marca','fabricante','manufacturer']);
    idxPvp = find(['pvp','precio','price','importe','tarifa','retailprice']);
    idxDescription = find(['description','descripcion','detalle','texto']);
    idxShortDescription = find(['shortdescription','descripcioncorta','shortdesc','desccorta','descriptionshort']);
    idxImage = find(['image','imagen','foto','photourl','imageurl','urlimagen','imagepath']);
    idxStock = find(['stock','stocklabel','existencias','disponible','quantity','cantidadstock','availablestock','stockavailable']);
    idxCost = find(['precionetocompra']);
    idxCategory = find(['category','categoria','categoryname','nombrecategoria','maincategory','categoria1','nivel1','department','departamento']);

    // "family" y "subcategory" son niveles distintos en la salida de Netlify.
    // Si un CSV antiguo solo trae category + subcategory, esa subcategory actúa como familia.
    const idxExplicitFamily = find(['family','familia','category2','categoria2','nivel2','productfamily']);
    const idxGenericSubcategory = find(['subcategory','subcategoria','subcategoryname','subcategorianame']);
    const idxExplicitSubfamily = find(['subfamily','subfamilia','subcategory2','subcategoria2','category3','categoria3','nivel3','productsubfamily']);
    idxFamily = idxExplicitFamily >= 0 ? idxExplicitFamily : idxGenericSubcategory;
    idxSubcategory = idxExplicitSubfamily >= 0
      ? idxExplicitSubfamily
      : (idxExplicitFamily >= 0 ? idxGenericSubcategory : -1);
    idxProductType = find(['producttype','tipoproducto','tipo','type','productgroup','grupoproducto']);
    idxSeries = find(['series','serie','productseries','seriefamilia']);
    idxTechnology = find(['technology','tecnologia','range','gama']);
    idxProtocol = find(['protocol','protocolo','communicationprotocol','protocolocomunicacion']);
    idxColor = find(['color','colour','finish','acabado']);
    idxConnectivity = find(['connectivity','conectividad','connection','conexion','communications','comunicaciones']);
    idxResolution = find(['resolution','resolucion','megapixels','megapixeles','mp']);
    idxEnvironment = find(['environment','entorno','installation','instalacion','indooroutdoor','interiorexterior','useenvironment']);
    idxPhoto = find(['photo','foto','imagecapture','capturaimagen','photosensor','fotosensor']);
    idxPoe = find(['poe','poweroverethernet']);
    idxWifi = find(['wifi','wirelesslan','wlan']);
    idxLte4g = find(['lte4g','4glte','lte','4g','gsm']);
    idxCompatibility = find(['compatibility','compatibilidad','compatiblewith','compatiblecon']);
    idxChannels = find(['channels','canales','ports','puertos']);
    idxLens = find(['lens','lente','focallength','distanciafocal','optics','optica']);
    idxMounting = find(['mounting','montaje','mount','soporte','installationtype','tipoinstalacion']);
    idxPower = find(['power','alimentacion','voltage','voltaje','powersupply','fuentealimentacion']);
    idxAttributes = find(['attributes','attributesjson','filterattributes','atributos','atributosjson']);
    idxOrder = find(['order','orden','sortorder','priority','prioridad']);
    idxRelatedProducts = find([
      'relatedproducts','related','productosrelacionados','productosrelacionados'
    ]);
    if(idxName < 0) idxName = 0;
  }

  const reservedIndexes = new Set([
    idxName,idxBrand,idxPvp,idxDescription,idxShortDescription,idxImage,idxStock,idxCost,
    idxCategory,idxFamily,idxSubcategory,idxProductType,idxSeries,idxTechnology,idxProtocol,
    idxColor,idxConnectivity,idxResolution,idxEnvironment,idxPhoto,idxPoe,idxWifi,idxLte4g,
    idxCompatibility,idxChannels,idxLens,idxMounting,idxPower,idxAttributes,idxOrder,idxRelatedProducts
  ].filter(i => i >= 0));

  const isUsefulDynamicHeader = key => {
    if(!key || ['ean','upc','isbn','weight','peso','height','alto','width','ancho','depth','profundidad'].includes(key)) return false;
    return /(color|colour|finish|acabado|technology|tecnologia|protocol|protocolo|connect|conect|wifi|wlan|wireless|lte|4g|gsm|poe|resolution|resolucion|megapixel|lens|lente|focal|indoor|outdoor|interior|exterior|environment|entorno|uso|use|aplicacion|deteccion|detection|pir|compat|channel|canal|port|puerto|hdmi|mount|montaje|power|alimentacion|voltage|voltaje|battery|bateria|autonomia|audio|video|iprating|proteccionip|protection|proteccion|grado|sensor|detector|format|formato|type|tipo|series|serie|range|gama|frequency|frecuencia|alcance|distancia|angle|angulo|tamper|mascota|pet|sensitivity|sensibilidad|certification|certificacion|temperature|temperatura|humidity|humedad|wdr|onvif|infrared|night|noche|radio|jeweller|wings|fibra|ethernet|sim|memory|memoria|storage|almacenamiento)/.test(key);
  };

  const rows = [];
  for(const line of rawLines.slice(start)){
    const cols = splitLine(line).map(c => String(c || '').trim());
    if(!cols.length) continue;

    const name = (cols[idxName] || cols[0] || '').trim();
    if(!name) continue;

    const brand = idxBrand >= 0 ? String(cols[idxBrand] || '').trim() : '';
    let pvpRaw = idxPvp >= 0 ? cols[idxPvp] : '';
    if(!pvpRaw || !String(pvpRaw).match(/[0-9]/)){
      for(let i=cols.length-1; i>=0; i--){
        if(String(cols[i]).match(/^[€\s]*[0-9]+(?:[.,][0-9]+)?\s*€?$/)){
          pvpRaw = cols[i];
          break;
        }
      }
    }
    let pvp = numero(pvpRaw);
    if(!Number.isFinite(pvp)) pvp = 0;

    const read = index => index >= 0 ? String(cols[index] || '').trim() : '';
    let attributes = {};
    const attributesRaw = read(idxAttributes);
    if(attributesRaw){
      try{
        const parsed = JSON.parse(attributesRaw);
        if(parsed && typeof parsed === 'object' && !Array.isArray(parsed)) attributes = parsed;
      }catch(_error){}
    }
    if(hasHeader){
      headerNorm.forEach((key,index) => {
        if(reservedIndexes.has(index) || !isUsefulDynamicHeader(key)) return;
        const value = String(cols[index] || '').trim();
        if(value && value.length <= 180) attributes[key] = value;
      });
    }

    rows.push({
      name,
      brand,
      pvp,
      description:read(idxDescription),
      short_description:read(idxShortDescription),
      image:read(idxImage),
      stock:read(idxStock),
      precio_neto_compra:idxCost >= 0 ? numero(cols[idxCost]) : 0,
      category:read(idxCategory),
      family:read(idxFamily),
      subcategory:read(idxSubcategory),
      product_type:read(idxProductType),
      series:read(idxSeries),
      technology:read(idxTechnology),
      protocol:read(idxProtocol),
      color:read(idxColor),
      connectivity:read(idxConnectivity),
      resolution:read(idxResolution),
      environment:read(idxEnvironment),
      photo:read(idxPhoto),
      poe:read(idxPoe),
      wifi:read(idxWifi),
      lte_4g:read(idxLte4g),
      compatibility:read(idxCompatibility),
      channels:read(idxChannels),
      lens:read(idxLens),
      mounting:read(idxMounting),
      power:read(idxPower),
      related_products:read(idxRelatedProducts),
      attributes,
      order:idxOrder >= 0 ? numero(cols[idxOrder]) : 0,
      raw:cols
    });
  }

  return rows
    .filter(p => p.name)
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));
}

// Mantener compatibilidad: cualquier llamada antigua a parseCSV usa el parser nuevo.
parseCSV = parseCSVRobusto175;

function extraTagsCSV175(p){
  const n = normaliza((p && p.name) || '');
  const tags = [];

  const add = (...xs) => xs.forEach(x => { if(x) tags.push(x); });

  // Nuevos productos / genéricos de tienda
  if(n.includes('rack')){
    add('rack','rack pared','armario rack','mural','pared','red','cableado','comunicaciones','infraestructura');
  }
  if(n.includes('abe') || n.includes('barrera')){
    add('barrera','barrera exterior','perimetral','proteccion perimetral','protección perimetral','intrusion','intrusión','exterior');
  }

  // Red / PoE
  if(n.includes('sw1008') || n.includes('vdms105') || n.includes('vdms108') || (n.includes('switch') && n.includes('poe'))){
    add('red','poe','switch','switch poe','ethernet','lan','camaras ip','cámaras ip','videovigilancia');
    if(n.includes('1008') || n.includes('108')) add('8 puertos','switch poe 8','8p');
    if(n.includes('105')) add('5 puertos','switch poe 5','5p');
  }
  if(n.includes('inj-poe') || n.includes('injector') || n.includes('inyector')){
    add('red','poe','inyector','inyector poe','injector poe','alimentacion poe','alimentación poe','ethernet','lan');
  }

  // Almacenamiento
  if(/^hd\d+tb/.test(n) || n.includes('disco') || n.includes('hdd')){
    add('almacenamiento','disco','disco duro','hdd','grabacion','grabación','nvr','cctv','videovigilancia');
  }
  if(n.includes('hs-tf') || n.includes('microsd') || n.includes('micro sd') || n.includes('tarjeta sd')){
    add('almacenamiento','tarjeta sd','micro sd','microsd','memoria','grabacion','grabación','camara','cámara');
  }

  // Alimentación / baterías
  if(n.includes('battery') || n.includes('batt') || n.includes('bateria') || n.includes('batería')){
    add('bateria','batería','battery','pila','alimentacion','alimentación','respaldo','backup');
  }
  if(n.includes('dc12') || n.includes('dc1224') || n.includes('psu') || n.includes('fuente')){
    add('fuente','alimentacion','alimentación','psu','12v','24v','baja tension','baja tensión');
  }

  // Mecanismos / automatización
  if(n.includes('solobutton') || n.includes('centerbutton') || n.includes('sidebutton')){
    add('confort','automatizacion','automatización','mecanismo','lightswitch','lightcore','interruptor','tecla','panel tactil','panel táctil');
  }
  if(n.includes('solocover') || n.includes('centercover') || n.includes('sidecover')){
    add('confort','automatizacion','automatización','mecanismo','outletcore','outlet','enchufe','tapa','cover','embellecedor');
  }

  return tags.join(' ');
}

function prepararIndiceBusqueda175(){
  const camposFiltro = [
    'category','family','subcategory','product_type','series','technology','protocol','color',
    'connectivity','resolution','environment','photo','poe','wifi','lte_4g','compatibility',
    'channels','lens','mounting','power'
  ];
  productos.forEach((p)=>{
    let d = {desc:'', family:'', official:''};
    try{ d = descripcionProducto(p) || d; }catch(e){}
    p._desc = d.desc || '';
    p._family = d.family || '';
    p._official = d.official || '';
    const atributos = p?.attributes && typeof p.attributes === 'object' && !Array.isArray(p.attributes)
      ? Object.values(p.attributes)
      : [];
    p._search175 = normaliza([
      p.name,
      p.brand,
      p.description,
      p.short_description,
      p._desc,
      p._family,
      p._official,
      ...camposFiltro.map(campo => p?.[campo]),
      ...atributos,
      extraTagsCSV175(p)
    ].filter(Boolean).join(' '));
  });
}

function hxEsProductoAjax(p){
  const ref = String(p?.name || '').trim().toUpperCase();
  const marca = normaliza(p?.brand || '');
  return marca === 'ajax' || ref.startsWith('AJ-') || ref.startsWith('10XAJ-');
}

function hxTextoProveedor(p){
  return normaliza([
    p?.category, p?.family, p?.subcategory, p?.product_type,
    p?.short_description, p?.description, p?.name
  ].filter(Boolean).join(' '));
}

function hxEsAlmacenamientoSurveillance(p){
  const texto = hxTextoProveedor(p);
  return /almacenamiento|storage/.test(texto)
    && /disco duro|discos duros|surveillance|hard drive|hdd/.test(texto);
}

function hxEsTarjetaSDOriginal(p){
  const texto = hxTextoProveedor(p);
  return /almacenamiento|storage/.test(texto)
    && /tarjetas? sd|micro ?sd|microsd|sd card|memory card/.test(texto);
}

function hxEsPilaAlimentacion(p){
  const texto = hxTextoProveedor(p);
  const compact = texto.replace(/[^a-z0-9]/g,'');
  if(!/baterias y pilas/.test(texto)) return false;

  const excluded = /batterybox|batterykit|batterypack|batteryholder|batterycase|powerbank|acumulador|accumulator|modulobateria|batterymodule/.test(compact);
  const cell = /pila|pilas|batterycell|coincell|buttoncell|battcr|cr\d{3,4}[a-z]?|lr\d+[a-z]?|er\d+[a-z]?|batt(?:aa|aaa|aaaa|9v)/.test(compact);
  return cell && !excluded;
}

function hxEsFuenteAlimentador(p){
  const texto = hxTextoProveedor(p);
  return /fuentes y alimentadores|fuente alimentador|power supply|power supplies/.test(texto);
}

function hxEsSAI(p){
  const niveles = [p?.category,p?.family,p?.subcategory]
    .map(value=>normaliza(value).trim())
    .filter(Boolean);

  return niveles.some(value =>
    value === 'sai' || value === 'sais' || value === 'ups'
    || value.endsWith('sais') || value.endsWith('ups')
    || /sistemas de alimentacion ininterrumpida/.test(value)
  );
}

function hxEsSwitchNoGestionable(p){
  const texto = hxTextoProveedor(p);
  return /switching|switches/.test(texto)
    && /no gestionable|unmanaged/.test(texto);
}

function hxEsRackPared(p){
  const texto = hxTextoProveedor(p);
  if(!/racks?|armario rack/.test(texto)) return false;

  const ref = String(p?.name || '').trim().toUpperCase();
  return /RACK-WALL/.test(ref) || /LOCKBOX-\d+U-SL(?:-|$)/.test(ref);
}

function hxEsBarreraInfrarroja(p){
  const texto = hxTextoProveedor(p);
  return /intrusion/.test(texto)
    && /barrera infrarroja|barreras infrarrojas|infrared barrier|photobeam/.test(texto);
}

function hxEsInyectorPoE(p){
  const texto = hxTextoProveedor(p);
  return /networking|accesorios/.test(texto)
    && /poe/.test(texto)
    && /inyector poe|poe injector|injector poe/.test(texto);
}

function hxEsRouterMovil(p){
  const texto = hxTextoProveedor(p);
  return /networking|routing/.test(texto)
    && /routers? 3g\/4g\/5g|routers? 3g|routers? 4g|routers? 5g|3g\/4g\/5g/.test(texto);
}

function hxEsSoporteCCTVSeleccionado(p){
  const ref = String(p?.name || '').trim().toUpperCase();
  return ref === 'DS-1280ZJ-XS'
    || ref === 'DS-1280ZJ-XS-B';
}

function hxEsProductoProveedorExtra(p){
  return hxEsAlmacenamientoSurveillance(p)
    || hxEsTarjetaSDOriginal(p)
    || hxEsPilaAlimentacion(p)
    || hxEsFuenteAlimentador(p)
    || hxEsSAI(p)
    || hxEsSwitchNoGestionable(p)
    || hxEsRackPared(p)
    || hxEsBarreraInfrarroja(p)
    || hxEsInyectorPoE(p)
    || hxEsRouterMovil(p)
    || hxEsSoporteCCTVSeleccionado(p);
}

function hxEsProductoBasePermitido(p){
  return hxEsProductoAjax(p) || hxEsProductoProveedorExtra(p);
}


function hxUnirCatalogos(base, manual){
  const mapa = new Map();
  const tieneValor = valor => valor !== undefined && valor !== null && (typeof valor !== 'string' || valor.trim() !== '');
  const atributosValidos = atributos => {
    if(!atributos || typeof atributos !== 'object' || Array.isArray(atributos)) return {};
    return Object.fromEntries(Object.entries(atributos).filter(([,valor]) => tieneValor(valor)));
  };

  (Array.isArray(base) ? base : []).filter(hxEsProductoBasePermitido).forEach(p=>{
    const ref = String(p?.name || '').trim().toUpperCase();
    if(ref) mapa.set(ref, {...p, attributes:atributosValidos(p?.attributes), origen_catalogo:'visio'});
  });

  // El CSV manual manda únicamente en los campos que realmente trae informados.
  // Los campos vacíos nunca borran clasificación, stock ni atributos recibidos desde Netlify.
  (Array.isArray(manual) ? manual : []).forEach(p=>{
    const ref = String(p?.name || '').trim().toUpperCase();
    if(!ref) return;
    const anterior = mapa.get(ref) || {};
    const esProveedorOriginal = hxEsProductoProveedorExtra(anterior);
    const camposProveedorOriginal = new Set([
      'brand','description','short_description','image','stock',
      'category','family','subcategory','product_type','series','technology','color'
    ]);
    const informados = Object.fromEntries(
      Object.entries(p || {}).filter(([clave,valor]) => {
        if(clave === 'attributes' || clave === 'raw' || !tieneValor(valor)) return false;
        if(esProveedorOriginal && camposProveedorOriginal.has(clave)) return false;
        return true;
      })
    );
    const pvpManual = numero(p?.pvp);
    const costeManual = numero(p?.precio_neto_compra);
    const ordenManual = numero(p?.order);
    const merged = {
      ...anterior,
      ...informados,
      name: p.name || anterior.name,
      brand: p.brand || anterior.brand || 'Ajax',
      pvp: pvpManual > 0 ? pvpManual : (numero(anterior.pvp) || 0),
      precio_neto_compra: costeManual > 0 ? costeManual : (numero(anterior.precio_neto_compra) || 0),
      order: ordenManual > 0 ? ordenManual : (numero(anterior.order) || 0),
      attributes: {
        ...atributosValidos(anterior.attributes),
        ...atributosValidos(p.attributes)
      },
      origen_catalogo: esProveedorOriginal ? 'visio+manual' : 'manual'
    };
    mapa.set(ref, merged);
  });
  return [...mapa.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
}

const HX_CATALOGO_LOCAL_KEY='hx_catalogo_remoto_csv_v5_related';
const HX_CATALOGO_LOCAL_OLD_KEYS=['hx_catalogo_remoto_csv_v1','hx_catalogo_remoto_csv_v2','hx_catalogo_remoto_csv_v3','hx_catalogo_remoto_csv_v4'];
const HX_CATALOGO_LOCAL_TTL=48*60*60*1000;

const HX_CATALOGO_BASELINE_KEY='hx_catalogo_refs_baseline_v1';
const HX_CATALOGO_NEW_KEY='hx_catalogo_nuevos_v1';
const HX_CATALOGO_NEW_DAYS=15;

function hxCatalogoRefs(lista){
  return [...new Set((Array.isArray(lista)?lista:[])
    .map(p=>String(p?.name||'').trim().toUpperCase())
    .filter(Boolean))].sort();
}

function hxActualizarProductosNuevos(lista){
  try{
    const ahora=Date.now();
    const refs=hxCatalogoRefs(lista);
    const baselineRaw=localStorage.getItem(HX_CATALOGO_BASELINE_KEY);
    if(!baselineRaw){
      localStorage.setItem(HX_CATALOGO_BASELINE_KEY,JSON.stringify(refs));
      localStorage.setItem(HX_CATALOGO_NEW_KEY,JSON.stringify({}));
      window.HX_PRODUCTOS_NUEVOS={};
      return {};
    }
    const prev=new Set(JSON.parse(baselineRaw)||[]);
    let nuevos={};
    try{ nuevos=JSON.parse(localStorage.getItem(HX_CATALOGO_NEW_KEY)||'{}')||{}; }catch(_e){}
    refs.forEach(ref=>{ if(!prev.has(ref) && !nuevos[ref]) nuevos[ref]=ahora; });
    const limite=HX_CATALOGO_NEW_DAYS*24*60*60*1000;
    Object.keys(nuevos).forEach(ref=>{
      if(!refs.includes(ref) || (ahora-Number(nuevos[ref]||0))>limite) delete nuevos[ref];
    });
    localStorage.setItem(HX_CATALOGO_BASELINE_KEY,JSON.stringify(refs));
    localStorage.setItem(HX_CATALOGO_NEW_KEY,JSON.stringify(nuevos));
    window.HX_PRODUCTOS_NUEVOS=nuevos;
    return nuevos;
  }catch(_error){
    window.HX_PRODUCTOS_NUEVOS={};
    return {};
  }
}


function hxCatalogoLocalLeer(){
  try{
    const raw=localStorage.getItem(HX_CATALOGO_LOCAL_KEY);
    if(!raw) return null;
    const data=JSON.parse(raw);
    const ts=Number(data?.ts)||0;
    const csv=String(data?.csv||'');
    if(!ts || !csv || (Date.now()-ts)>=HX_CATALOGO_LOCAL_TTL){
      localStorage.removeItem(HX_CATALOGO_LOCAL_KEY);
      return null;
    }
    return {ts,csv};
  }catch(_error){ return null; }
}

function hxCatalogoLocalGuardar(csv){
  try{
    HX_CATALOGO_LOCAL_OLD_KEYS.forEach(key=>localStorage.removeItem(key));
    localStorage.setItem(HX_CATALOGO_LOCAL_KEY,JSON.stringify({ts:Date.now(),csv:String(csv||'')}));
  }catch(_error){}
}

async function hxLeerCSV(url){
  const esFuncionCatalogo = String(url || '').includes('/.netlify/functions/catalogo-remoto');

  if(esFuncionCatalogo){
    const local=hxCatalogoLocalLeer();
    if(local){
      const ageSeconds=Math.floor((Date.now()-local.ts)/1000);
      window.HX_CATALOGO_CACHE={
        age:ageSeconds,
        cacheStatus:'browser-local',
        generatedAt:new Date(local.ts).toISOString(),
        productsWithCost:0,
        costField:'',
        cached:true,
        local:true
      };
      return local.csv;
    }
  }

  const finalUrl = esFuncionCatalogo ? url : `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  const r = await fetch(finalUrl, {cache: esFuncionCatalogo ? 'default' : 'no-store'});
  if(!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);

  const text=await r.text();

  if(esFuncionCatalogo){
    const age = Number(r.headers.get('age') || 0);
    const cacheStatus = String(r.headers.get('cache-status') || r.headers.get('x-nf-cache') || '').trim();
    const generatedAt = String(r.headers.get('x-hiperajax-generated-at') || '').trim();
    const productsWithCost = Number(r.headers.get('x-hiperajax-products-with-cost') || 0);
    const costField = String(r.headers.get('x-hiperajax-cost-field') || '').trim();
    window.HX_CATALOGO_CACHE = {
      age: Number.isFinite(age) ? age : 0,
      cacheStatus,
      generatedAt,
      productsWithCost,
      costField,
      cached: age > 0 || /hit/i.test(cacheStatus),
      local:false
    };
    hxCatalogoLocalGuardar(text);
    console.info('[Catálogo Netlify]', window.HX_CATALOGO_CACHE);
  }
  return text;
}

async function cargarCatalogo(){
  let origen = 'remoto + manual';
  const prev = $('#previewProducto');
  let avisoLento = null;

  if(prev){
    prev.textContent = '⏳ Comprobando catálogo…';
    avisoLento = setTimeout(()=>{
      if(prev.textContent.includes('Comprobando')) prev.textContent = '📥 Descargando catálogo Ajax…';
    }, 2500);
  }

  try{
    let baseTxt = '';
    try{
      baseTxt = await hxLeerCSV('/.netlify/functions/catalogo-remoto?v=213-related');
    }catch(errorRemoto){
      console.warn('Catálogo remoto no disponible; se usa la copia local.', errorRemoto);
      baseTxt = await hxLeerCSV(CSV_URL);
      origen = 'copia local + manual';
    }

    let manualTxt = '';
    try{ manualTxt = await hxLeerCSV('./catalogo_manual.csv'); }
    catch(errorManual){ console.warn('No se pudo cargar catalogo_manual.csv.', errorManual); }

    const base = parseCSVRobusto175(baseTxt);
    const manual = manualTxt ? parseCSVRobusto175(manualTxt) : [];
    productos = hxUnirCatalogos(base, manual);
    try{
      const conRelacionados = productos.filter(p=>String(p?.related_products||'').trim()).length;
      window.HX_RELATED_DIAGNOSTIC = {
        total: productos.length,
        conRelacionados,
        ejemplo: productos.find(p=>String(p?.related_products||'').trim())?.name || ''
      };
      console.info('[Compatibles] related_products cargados:', window.HX_RELATED_DIAGNOSTIC);
    }catch(_error){}
    hxActualizarProductosNuevos(productos);
    if(!productos.length) throw new Error('Catálogo vacío o columnas no reconocidas');
    try{
      window.HX_EXPLORER_PRO?.resetCache?.();
      window.dispatchEvent(new CustomEvent('hx:catalogo-cargado', {detail:{count:productos.length}}));
    }catch(_error){}
  }catch(e){
    productos = [];
    const msg = 'No se pudo cargar el catálogo remoto ni la copia local.';
    if(prev) prev.textContent = msg;
    console.error('Error cargando catálogo:', e);
    cargarSelect();
    renderRecientes();
    pintarResultados('');
    return;
  }finally{
    if(avisoLento) clearTimeout(avisoLento);
  }

  prepararIndiceBusqueda175();
  if(prev){
    if(origen === 'remoto + manual'){
      const c = window.HX_CATALOGO_CACHE || {};
      const minutos = Math.max(0, Math.floor((Number(c.age)||0) / 60));
      const cacheTxt = c.cached ? `caché Netlify · ${minutos} min` : 'actualizado ahora · caché iniciada';
      prev.textContent = `✅ ${productos.length} productos · ${cacheTxt}.`;
      prev.title = c.generatedAt ? `CSV generado: ${c.generatedAt}` : 'La caché del catálogo se conserva hasta 48 horas.';
    }else{
      prev.textContent = `⚠️ ${productos.length} productos cargados (copia local + manual).`;
    }
  }
  window.HX_CATALOGO_ORIGEN = origen;

  cargarSelect();
  renderRecientes();
  pintarResultados('');
}

const descripcionProductoAnterior_175 = descripcionProducto;
descripcionProducto = function(p){
  const n = normaliza((p && p.name) || '');

  // StreetSiren: solo DoubleDeck / Custom / Brandplate son personalizables.
  if(n.includes('streetsiren')){
    if(n.includes('doubledeck') || n.includes('custom') || n.includes('brandplate')){
      return {icon:'🔔', desc:'Sirena inalámbrica con soporte para panel frontal personalizable', family:'Sirenas', official:'StreetSiren personalizable'};
    }
    return {icon:'🔔', desc:'Sirena inalámbrica para interiores y exteriores', family:'Sirenas', official:'StreetSiren Jeweller'};
  }

  // Productos nuevos y accesorios añadidos por CSV.
  if(n.includes('rack')){
    return {icon:'🗄️', desc:'Rack mural para instalación de red y comunicaciones', family:'Infraestructura', official:'Rack pared'};
  }
  if(n.includes('sw1008') || n.includes('vdms105') || n.includes('vdms108') || (n.includes('switch') && n.includes('poe'))){
    const puertos = n.includes('1008') || n.includes('108') ? '8' : (n.includes('105') ? '5' : '');
    return {icon:'🌐', desc:`Switch PoE${puertos ? ' de ' + puertos + ' puertos' : ''} para red y cámaras IP`, family:'Red / PoE', official:'Switch PoE'};
  }
  if(n.includes('inj-poe') || n.includes('injector') || n.includes('inyector')){
    return {icon:'⚡', desc:'Inyector PoE para alimentación por cable Ethernet', family:'Red / PoE', official:'Inyector PoE'};
  }
  if(/^hd\d+tb/.test(n)){
    const cap = ((p.name||'').match(/HD(\d+)TB/i)||[])[1];
    return {icon:'💾', desc:`Disco duro${cap ? ' ' + cap + ' TB' : ''} para grabación en NVR`, family:'Almacenamiento', official:'Disco duro'};
  }
  if(n.includes('hs-tf') || n.includes('microsd') || n.includes('micro sd')){
    const cap = ((p.name||'').match(/(32|64|128|256|512)G/i)||[])[1];
    return {icon:'💾', desc:`Tarjeta microSD${cap ? ' ' + cap + ' GB' : ''} para grabación`, family:'Almacenamiento', official:'Tarjeta microSD'};
  }
  if(n.includes('abe') || n.includes('barrera')){
    return {icon:'🛡️', desc:'Barrera de protección perimetral', family:'Protección contra intrusiones', official:'Barrera perimetral'};
  }

  return descripcionProductoAnterior_175(p);
};
try{
  const setVersion = ()=>{
  };
  document.addEventListener('DOMContentLoaded', setVersion);
}catch(e){}


const descripcionProductoAnterior_181 = descripcionProducto;
function ref181(p){ return String((p && p.name) || '').trim(); }
function has181(n, ...xs){ return xs.some(x => n.includes(normaliza(x))); }
function cap181(s){ return String(s||'').replace(/^AJ-/i,'').replace(/-DUMMY$/i,'').replace(/-/g,' '); }
function modelDummy181(n, original){
  if(n.includes('combiprotect')) return 'CombiProtect';
  if(n.includes('motioncamoutdoor')) return 'MotionCam Outdoor';
  if(n.includes('motioncam')) return 'MotionCam';
  if(n.includes('motionprotectplus')) return 'MotionProtect Plus';
  if(n.includes('motionprotect')) return 'MotionProtect';
  if(n.includes('curtainprotect')) return 'MotionProtect Curtain';
  if(n.includes('dualcurtain')) return 'DualCurtain Outdoor';
  if(n.includes('outdoorprotect')) return 'MotionProtect Outdoor';
  if(n.includes('doorprotectplus')) return 'DoorProtect Plus';
  if(n.includes('doorprotect')) return 'DoorProtect';
  if(n.includes('glassprotect')) return 'GlassProtect';
  if(n.includes('fireprotectplus')) return 'FireProtect Plus';
  if(n.includes('fireprotect')) return 'FireProtect';
  if(n.includes('homesiren')) return 'HomeSiren';
  if(n.includes('streetsirencustom')) return 'StreetSiren Custom';
  if(n.includes('streetsiren')) return 'StreetSiren';
  if(n.includes('keypadcombi')) return 'KeyPad Combi';
  if(n.includes('keypadplus')) return 'KeyPad Plus';
  if(n.includes('keypad')) return 'KeyPad';
  if(n.includes('spacecontrol')) return 'SpaceControl';
  if(n.includes('hub2plus')) return 'Hub 2 Plus';
  if(n.includes('hub2')) return 'Hub 2';
  if(n.includes('hub')) return 'Hub';
  return cap181(original);
}
function tipoDummy181(n){
  if(has181(n,'siren')) return 'sirena';
  if(has181(n,'keypad')) return 'teclado';
  if(has181(n,'hub')) return 'hub';
  if(has181(n,'fireprotect')) return 'detector de incendio';
  if(has181(n,'doorprotect')) return 'detector de apertura';
  if(has181(n,'glassprotect')) return 'detector de rotura de cristal';
  if(has181(n,'combiprotect')) return 'detector combinado de movimiento y rotura de cristal';
  if(has181(n,'motioncam')) return 'detector de movimiento con verificación fotográfica';
  if(has181(n,'motion','curtain','outdoorprotect')) return 'detector de movimiento';
  if(has181(n,'spacecontrol')) return 'mando';
  return 'dispositivo AJAX';
}
function meta181(p){
  const raw = ref181(p); const n = normaliza(raw);
  if(!raw) return null;

  // DUMMY siempre es carcasa/maqueta, nunca producto funcional.
  if(n.includes('dummy')){
    const modelo = modelDummy181(n, raw);
    const tipo = tipoDummy181(n);
    return {
      icon:'📦', family:'Accesorios', sub:'Carcasas vacías', official:modelo + ' Dummy',
      desc:`Carcasa vacía para ${modelo}. Maqueta sin electrónica ni sensores, pensada para demostración, formación o efecto disuasorio.`,
      tags:['dummy','carcasa','carcasa vacia','carcasa vacía','maqueta','sin electronica','sin electrónica',tipo,modelo]
    };
  }

  // Brackets / soportes de instalación. Nunca armarios rack.
  if(has181(n,'bracket')){
    let para = 'dispositivo AJAX';
    if(has181(n,'bracketdp','magnetdp')) para = 'DoorProtect';
    else if(has181(n,'bracketfp')) para = 'FireProtect';
    else if(has181(n,'brackeths')) para = 'HomeSiren';
    else if(has181(n,'brackethub')) para = 'Hub';
    else if(has181(n,'bracketkp')) para = 'KeyPad';
    else if(has181(n,'bracketmc')) para = 'MotionCam';
    else if(has181(n,'bracketmco','bracketmpo')) para = 'MotionProtect Outdoor / MotionCam Outdoor';
    else if(has181(n,'bracketmp')) para = 'MotionProtect';
    else if(has181(n,'bracketss')) para = 'StreetSiren';
    return {icon:'🛠️', family:'Accesorios', sub:'Accesorios de instalación', official:'Soporte de montaje', desc:`Soporte de montaje para ${para}.`, tags:['bracket','soporte','soporte montaje','instalacion','instalación',para]};
  }
  if(has181(n,'holder')){
    if(has181(n,'dinholder')) return {icon:'🛠️', family:'Accesorios', sub:'Accesorios de instalación', official:'DIN Holder', desc:'Soporte DIN para instalar Relay o WallSwitch en carril DIN.', tags:['holder','soporte','din','carril din','relay','wallswitch']};
    return {icon:'🛠️', family:'Accesorios', sub:'Accesorios de instalación', official:'Holder', desc:'Soporte de instalación para fijación de accesorios AJAX.', tags:['holder','soporte','instalacion','instalación']};
  }
  if(has181(n,'mountcam')){
    const modelo = n.includes('a1')?'A1':n.includes('a2')?'A2':n.includes('b1')?'B1':n.includes('b2')?'B2':'';
    return {icon:'🛠️', family:'Accesorios', sub:'Soportes para cámaras', official:'MountCam '+modelo, desc:`Soporte de pared ${modelo ? modelo + ' ' : ''}para cámaras IP cableadas AJAX.`, tags:['mountcam','soporte camara','soporte cámara','pared','cctv','camera','camara','cámara',modelo]};
  }
  if(has181(n,'junctionbox')) return {icon:'🧰', family:'Accesorios', sub:'Cajas de conexiones', official:'JunctionBox', desc:'Caja de conexiones para instalación de cámaras IP cableadas AJAX.', tags:['junctionbox','caja conexiones','caja montaje','camara','cámara','cctv']};
  if(has181(n,'surfacebox')) return {icon:'🧰', family:'Accesorios', sub:'Cajas de superficie', official:'SurfaceBox', desc:'Caja de montaje en superficie para mecanismos LightSwitch u Outlet.', tags:['surfacebox','caja superficie','caja montaje','mecanismo','lightswitch','outlet']};
  if(has181(n,'hood')) return {icon:'🛡️', family:'Accesorios', sub:'Accesorios de instalación', official:'Hood', desc:'Visera protectora para detectores de exterior AJAX.', tags:['hood','visera','protector','exterior','motionprotect outdoor','motioncam outdoor']};

  // Tapas, marcos y mecanismos. No pánico.
  if(has181(n,'solocover','centercover','sidecover','coverplate')){
    let destino = 'OutletCore';
    if(has181(n,'lan')) destino = 'Outlet LAN';
    if(has181(n,'smart')) destino = 'Outlet inteligente';
    if(has181(n,'cp','coverplate')) destino = 'CoverPlate / caja de montaje';
    return {icon:'🧩', family:'Confort y automatización', sub:'Tapas y embellecedores', official:'Tapa', desc:`Tapa/embellecedor para ${destino}.`, tags:['cover','tapa','embellecedor','mecanismo','outletcore','outlet','enchufe',destino]};
  }
  if(has181(n,'solobutton','centerbutton','sidebutton')){
    let tipo = has181(n,'dimmer') ? 'dimmer' : has181(n,'2g') ? '2 bandas' : has181(n,'1g2w') ? '1 banda / 2 vías' : 'LightSwitch';
    return {icon:'💡', family:'Confort y automatización', sub:'Mecanismos LightSwitch', official:'Tecla LightSwitch', desc:`Botón/tecla frontal para mecanismo LightSwitch ${tipo}.`, tags:['button','boton','botón','tecla','mecanismo','lightswitch','interruptor','domotica','domótica',tipo]};
  }
  if(/^aj-frame/i.test(raw) || has181(n,'frame-')){
    const plazas = (raw.match(/FRAME-(\d)/i)||[])[1] || '';
    return {icon:'🪟', family:'Confort y automatización', sub:'Marcos', official:'Frame', desc:`Marco${plazas ? ' de ' + plazas + ' elementos' : ''} para mecanismos LightSwitch / Outlet.`, tags:['frame','marco','mecanismo','lightswitch','outlet','enchufe',plazas]};
  }
  if(has181(n,'lightcore')){
    let tipo = has181(n,'dimmer')?'dimmer':has181(n,'cross')?'cruce':has181(n,'2g2w')?'2 bandas y 2 vías':has181(n,'2g')?'2 bandas':has181(n,'2w')?'2 vías':'1 banda';
    return {icon:'💡', family:'Confort y automatización', sub:'Módulos LightSwitch', official:'LightCore', desc:`Módulo LightSwitch ${tipo} para interruptor inteligente táctil.`, tags:['core','modulo','módulo','lightswitch','interruptor','luz','domotica','domótica',tipo]};
  }
  if(has181(n,'outletcore')){
    let tipo = has181(n,'lan')?'Ethernet/LAN':has181(n,'smart')?'inteligente con monitor de consumo':'básico';
    return {icon:'🔌', family:'Confort y automatización', sub:'Módulos Outlet', official:'OutletCore', desc:`Módulo Outlet ${tipo} para base de enchufe AJAX.`, tags:['core','modulo','módulo','outlet','enchufe','base enchufe','toma corriente','mecanismo',tipo]};
  }

  // KeyPadCombi especial.
  if(has181(n,'keypadcombi')) return {icon:'⌨️', family:'Teclados', sub:'Teclados con sirena', official:'KeyPad Combi', desc:'Teclado inalámbrico con sirena integrada, compatible con Pass, Tag, smartphones y códigos.', tags:['keypad','teclado','sirena','teclado con sirena','pass','tag','codigo','código']};

  // Infraestructura / Red / Almacenamiento / Alimentación.
  if(has181(n,'rack-wall') || /^rack/.test(n)) return {icon:'🗄️', family:'Infraestructura', sub:'Armarios Rack', official:'Rack mural', desc:'Armario rack mural para instalación de equipos de comunicaciones, red y videovigilancia.', tags:['rack','rack mural','armario','pared','mural','19','comunicaciones','nvr','switch','red']};
  if(has181(n,'sw1008poe','vdms108gp')) return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', official:'Switch PoE 8 puertos', desc:'Switch PoE de 8 puertos para alimentación y conexión de cámaras IP y equipos de red.', tags:['switch','switch poe','poe','8 puertos','ethernet','red','cctv','camara ip','cámara ip']};
  if(has181(n,'vdms105gp','sw1005poe')) return {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', official:'Switch PoE 5 puertos', desc:'Switch PoE de 5 puertos para alimentación y conexión de cámaras IP y equipos de red.', tags:['switch','switch poe','poe','5 puertos','ethernet','red','cctv','camara ip','cámara ip']};
  if(has181(n,'inj-poe','injector','inyector')) return {icon:'⚡', family:'Red / PoE', sub:'Inyectores PoE', official:'Inyector PoE', desc:'Inyector PoE para alimentar dispositivos de red mediante cable Ethernet.', tags:['inyector','injector','poe','alimentacion poe','alimentación poe','ethernet','red']};
  if(/^hd\d+tb/.test(n) || has181(n,'hdd','disco')){ const cap=(raw.match(/HD(\d+)TB/i)||[])[1]; return {icon:'💾', family:'Almacenamiento', sub:'Discos duros', official:'Disco duro', desc:`Disco duro${cap?' '+cap+' TB':''} para grabación en NVR y sistemas de videovigilancia.`, tags:['disco','disco duro','hdd','grabacion','grabación','nvr','almacenamiento',cap]}; }
  if(has181(n,'hs-tf','microsd','micro-sd','tarjeta-sd')){ const cap=(raw.match(/(32|64|128|256|512)G/i)||[])[1]; return {icon:'💾', family:'Almacenamiento', sub:'Tarjetas microSD', official:'Tarjeta microSD', desc:`Tarjeta microSD${cap?' '+cap+' GB':''} para almacenamiento y grabación.`, tags:['sd','micro sd','microsd','tarjeta','memoria','grabacion','grabación',cap]}; }
  if(has181(n,'battery','batt') || /^aj-battery/.test(n)) return {icon:'🔋', family:'Alimentación', sub:'Baterías', official:'Batería', desc:'Batería o pack de alimentación para dispositivos AJAX.', tags:['battery','bateria','batería','pila','alimentacion','alimentación']};
  if(has181(n,'psu','dc12v','dc1224v','dc6v','ac220v')) return {icon:'⚡', family:'Alimentación', sub:'Fuentes de alimentación', official:'Fuente de alimentación', desc:'Fuente o módulo de alimentación para dispositivos AJAX.', tags:['psu','fuente','alimentacion','alimentación','12v','24v','6v','baja tension','baja tensión']};

  return null;
}


descripcionProducto = function(p){
  const m = meta181(p);
  if(m) return {icon:m.icon, desc:m.desc, family:m.sub ? `${m.family} · ${m.sub}` : m.family, official:m.official};
  return descripcionProductoAnterior_181(p);
};
function ref182(p){ return String((p && p.name) || '').trim(); }
function has182(n,...xs){ return xs.some(x => n.includes(normaliza(x))); }
function dummyTarget182(n){
  if(has182(n,'combiprotect')) return 'detector combinado de movimiento y rotura de cristal CombiProtect';
  if(has182(n,'motioncamoutdoor')) return 'detector exterior MotionCam Outdoor';
  if(has182(n,'motioncam')) return 'detector de movimiento con verificación fotográfica MotionCam';
  if(has182(n,'motionprotectplus')) return 'detector de movimiento MotionProtect Plus';
  if(has182(n,'motionprotect')) return 'detector de movimiento MotionProtect';
  if(has182(n,'curtain')) return 'detector de movimiento tipo cortina';
  if(has182(n,'doorprotectplus')) return 'detector de apertura DoorProtect Plus';
  if(has182(n,'doorprotect')) return 'detector de apertura DoorProtect';
  if(has182(n,'glassprotect')) return 'detector de rotura de cristal GlassProtect';
  if(has182(n,'fireprotect')) return 'detector de incendio FireProtect';
  if(has182(n,'homesiren')) return 'sirena interior HomeSiren';
  if(has182(n,'streetsiren')) return 'sirena exterior StreetSiren';
  if(has182(n,'keypadcombi')) return 'teclado con sirena KeyPad Combi';
  if(has182(n,'keypad')) return 'teclado KeyPad';
  if(has182(n,'hub')) return 'central Hub';
  return 'dispositivo AJAX';
}
function meta182(p){
  const raw = ref182(p), n = normaliza(raw);
  let prev = null; try{ if(typeof meta181 === 'function') prev = meta181(p); }catch(e){}
  if(has182(n,'dummy')){ const target = dummyTarget182(n); return {icon:'📦',family:'Accesorios de instalación',sub:'Carcasas vacías / maquetas',official:'Carcasa vacía',desc:`Carcasa vacía para ${target}. Producto sin electrónica, sin sensores y sin comunicación; útil para demostración, reposición de carcasa o efecto disuasorio.`,tags:['dummy','carcasa','carcasa vacia','carcasa vacía','maqueta','sin electrónica','accesorio','instalación',target]}; }
  if(has182(n,'dinholder')) return {icon:'🛠️',family:'Accesorios de instalación',sub:'Soportes DIN',official:'DIN Holder',desc:'Soporte DIN para montaje de Relay o WallSwitch en carril DIN.',tags:['din holder','soporte din','carril din','relay','wallswitch','soporte']};
  if(has182(n,'holder') && !has182(n,'coverholder')) return {icon:'🛠️',family:'Accesorios de instalación',sub:'Soportes',official:'Holder',desc:'Soporte de instalación para fijar accesorios o botones AJAX en superficie.',tags:['holder','soporte','fijación','instalación']};
  if(has182(n,'bracket')) return {icon:'🛠️',family:'Accesorios de instalación',sub:'Soportes de montaje',official:'SmartBracket / Bracket',desc:'Soporte de montaje para instalación de dispositivos AJAX.',tags:['bracket','smartbracket','soporte','soporte montaje','instalación','montaje','accesorio']};
  if(has182(n,'mountcam')){ const modelo=(raw.match(/MOUNTCAM-([AB]\d)/i)||[])[1]||''; return {icon:'🛠️',family:'Accesorios de instalación',sub:'Soportes para cámaras',official:'MountCam',desc:`Soporte de pared${modelo?' '+modelo:''} para cámaras IP cableadas AJAX.`,tags:['mountcam','soporte camara','soporte cámara','pared','camara','cámara','cctv',modelo]}; }
  if(has182(n,'junctionbox')) return {icon:'🧰',family:'Accesorios de instalación',sub:'Cajas de conexiones',official:'JunctionBox',desc:'Caja de conexiones para instalación de cámaras IP cableadas AJAX.',tags:['junctionbox','caja conexiones','caja montaje','camara','cámara','cctv']};
  if(has182(n,'ip66')) return {icon:'🧰',family:'Accesorios de instalación',sub:'Cajas estancas IP66',official:'Caja IP66',desc:'Caja estanca IP66 para protección de conexiones y equipos en instalaciones de exterior.',tags:['ip66','caja estanca','exterior','protección','agua','polvo']};
  if(has182(n,'solocover','centercover','sidecover','coverplate')){ let destino='OutletCore'; if(has182(n,'lan')) destino='Outlet LAN'; if(has182(n,'smart')) destino='Outlet inteligente'; if(has182(n,'coverplate','cp')) destino='caja de montaje / CoverPlate'; return {icon:'🧩',family:'Confort y automatización',sub:'Tapas y embellecedores',official:'Tapa',desc:`Tapa / embellecedor para ${destino}.`,tags:['cover','tapa','embellecedor','mecanismo','outletcore','outlet','enchufe','base enchufe',destino]}; }
  if(/^aj-frame/i.test(raw) || has182(n,'frame-')){ const plazas=(raw.match(/FRAME-(\d)/i)||[])[1]||''; return {icon:'🪟',family:'Confort y automatización',sub:'Marcos',official:'Frame',desc:plazas?`Marco de ${plazas} elementos para mecanismos LightSwitch / Outlet.`:'Marco para mecanismos LightSwitch / Outlet.',tags:['frame','marco','embellecedor','mecanismo','lightswitch','outlet','enchufe',plazas]}; }
  if(has182(n,'solobutton','centerbutton','sidebutton')){ let tipo=has182(n,'dimmer')?'dimmer':has182(n,'2g')?'2 bandas':has182(n,'1g2w')?'1 banda / 2 vías':'LightSwitch'; return {icon:'💡',family:'Confort y automatización',sub:'Mecanismos LightSwitch',official:'Tecla LightSwitch',desc:`Botón / tecla frontal para mecanismo LightSwitch ${tipo}.`,tags:['button','botón','tecla','mecanismo','lightswitch','interruptor','luz','domótica',tipo]}; }
  if(has182(n,'lightcore')){ let tipo=has182(n,'dimmer')?'dimmer':has182(n,'cross')?'cruce':has182(n,'2g2w')?'2 bandas y 2 vías':has182(n,'2g')?'2 bandas':has182(n,'2w')?'2 vías':'1 banda'; return {icon:'💡',family:'Confort y automatización',sub:'Módulos LightSwitch',official:'LightCore',desc:`Módulo LightSwitch ${tipo} para interruptor inteligente táctil.`,tags:['core','módulo','lightswitch','interruptor','luz','domótica',tipo]}; }
  if(has182(n,'outletcore')){ let tipo=has182(n,'lan')?'Ethernet/LAN':has182(n,'smart')?'inteligente con monitor de consumo':'básico'; return {icon:'🔌',family:'Confort y automatización',sub:'Módulos Outlet',official:'OutletCore',desc:`Módulo Outlet ${tipo} para base de enchufe AJAX.`,tags:['core','módulo','outlet','enchufe','base enchufe','toma corriente','mecanismo',tipo]}; }
  if(has182(n,'socket')) return {icon:'🔌',family:'Confort y automatización',sub:'Enchufes inteligentes',official:'Socket',desc:'Enchufe inteligente AJAX con monitor de consumo eléctrico.',tags:['socket','enchufe','enchufe inteligente','toma corriente','schuko','consumo','domótica']};
  if(has182(n,'outlet')) return {icon:'🔌',family:'Confort y automatización',sub:'Bases de enchufe',official:'Outlet',desc:'Base de enchufe AJAX para mecanismos de pared.',tags:['outlet','enchufe','base enchufe','toma corriente','mecanismo','pared']};
  if(has182(n,'wallswitch')) return {icon:'⚡',family:'Confort y automatización',sub:'Relés',official:'WallSwitch',desc:'Relé de potencia para controlar alimentación de 110/230 V en remoto.',tags:['wallswitch','relé','relé potencia','automatización','110v','230v']};
  if(has182(n,'relay')) return {icon:'⚡',family:'Confort y automatización',sub:'Relés',official:'Relay',desc:'Relé inalámbrico de contacto seco para control remoto.',tags:['relay','relé','contacto seco','automatización']};
  if(has182(n,'keypadcombi')) return {icon:'⌨️',family:'Teclados',sub:'Teclados con sirena',official:'KeyPad Combi',desc:'Teclado inalámbrico con sirena integrada, compatible con Pass, Tag, smartphones y códigos.',tags:['keypad','teclado','sirena','teclado con sirena','pass','tag','código']};
  if(has182(n,'rack-wall') || /^rack/.test(n)) return {icon:'🗄️',family:'Infraestructura',sub:'Armarios Rack',official:'Rack mural',desc:'Armario rack mural para instalación de equipos de comunicaciones, red y videovigilancia.',tags:['rack','rack mural','armario','pared','mural','19','comunicaciones','nvr','switch','red']};
  if(has182(n,'sw1008poe','vdms108gp') || (/^sw.*poe/.test(n) && has182(n,'1008','108','8'))) return {icon:'🌐',family:'Red / PoE',sub:'Switches PoE',official:'Switch PoE 8 puertos',desc:'Switch PoE de 8 puertos para alimentación y conexión de cámaras IP y equipos de red.',tags:['switch','switch poe','poe','8 puertos','ethernet','red','cctv','cámara ip']};
  if(has182(n,'vdms105gp','sw1005poe') || (/^sw.*poe/.test(n) && has182(n,'1005','105','5'))) return {icon:'🌐',family:'Red / PoE',sub:'Switches PoE',official:'Switch PoE 5 puertos',desc:'Switch PoE de 5 puertos para alimentación y conexión de cámaras IP y equipos de red.',tags:['switch','switch poe','poe','5 puertos','ethernet','red','cctv','cámara ip']};
  if(has182(n,'inj-poe','injector','inyector')) return {icon:'⚡',family:'Red / PoE',sub:'Inyectores PoE',official:'Inyector PoE',desc:'Inyector PoE para alimentar dispositivos de red mediante cable Ethernet.',tags:['inyector','injector','poe','alimentación poe','ethernet','red']};
  if(/^hd\d+tb/.test(n) || has182(n,'hdd','disco')){ const cap=(raw.match(/HD(\d+)TB/i)||[])[1]; return {icon:'💾',family:'Almacenamiento',sub:'Discos duros',official:'Disco duro',desc:`Disco duro${cap?' '+cap+' TB':''} para grabación en NVR y sistemas de videovigilancia.`,tags:['disco','disco duro','hdd','grabación','nvr','almacenamiento',cap]}; }
  if(has182(n,'hs-tf','microsd','micro-sd','tarjeta-sd')){ const cap=(raw.match(/(32|64|128|256|512)G/i)||[])[1]; return {icon:'💾',family:'Almacenamiento',sub:'Tarjetas microSD',official:'Tarjeta microSD',desc:`Tarjeta microSD${cap?' '+cap+' GB':''} para almacenamiento y grabación.`,tags:['sd','micro sd','microsd','tarjeta','memoria','grabación',cap]}; }
  if(has182(n,'battery','batt') || /^aj-battery/.test(n)) return {icon:'🔋',family:'Alimentación',sub:'Baterías',official:'Batería',desc:'Batería o pack de alimentación para dispositivos AJAX.',tags:['battery','batería','pila','alimentación','backup','respaldo']};
  if(has182(n,'dc12v2a','dc12v','dc1224v','dc6v','psu','ac220v')) return {icon:'⚡',family:'Alimentación',sub:'Fuentes de alimentación',official:'Fuente de alimentación',desc:'Fuente o módulo de alimentación para dispositivos AJAX.',tags:['dc','dc12','dc12v2a','psu','fuente','alimentación','12v','24v','6v','baja tensión']};
  if(has182(n,'streetsiren') && !has182(n,'doubledeck','custom','brandplate')) return {icon:'🔊',family:'Sirenas',sub:'Sirenas exterior/interior',official:'StreetSiren',desc:'Sirena inalámbrica para interiores y exteriores.',tags:['sirena','streetsiren','alarma','exterior','interior','acústica']};
  return prev;
}
const descripcionProducto_PRE182 = descripcionProducto;
descripcionProducto = function(p){ const m = meta182(p); if(m) return {icon:m.icon,desc:m.desc,family:m.sub?`${m.family} · ${m.sub}`:m.family,official:m.official}; try{return descripcionProducto_PRE182(p);}catch(e){return {icon:'📦',desc:'Producto del catálogo',family:'Producto nuevo',official:ref182(p)};} };
const HX_RECIENTES_KEY='hiperajax_productos_recientes_v1';
function leerRecientes(){
  try{
    const refs=JSON.parse(localStorage.getItem(HX_RECIENTES_KEY)||'[]');
    return Array.isArray(refs)?refs.filter(Boolean):[];
  }catch(_e){ return []; }
}
function registrarReciente(nombre){
  const name=String(nombre||'').trim();
  if(!name) return;
  const refs=leerRecientes().filter(ref=>String(ref).toUpperCase()!==name.toUpperCase());
  refs.unshift(name);
  try{ localStorage.setItem(HX_RECIENTES_KEY,JSON.stringify(refs.slice(0,12))); }catch(_e){}
  renderRecientes();
}
function renderRecientes(){
  const wrap=document.querySelector('#recentes');
  if(!wrap) return;
  const limite=window.matchMedia('(max-width:760px)').matches?3:8;
  const refs=leerRecientes()
    .filter(ref=>findProductoByQuery(ref))
    .slice(0,limite);
  if(!refs.length){ wrap.innerHTML=''; wrap.hidden=true; return; }
  wrap.hidden=false;
  wrap.innerHTML='<span class="recent-label">Recientes</span>'+refs.map(ref=>`<button type="button" class="recent-chip" data-name="${escapeHtml(ref)}">${escapeHtml(ref)}</button>`).join('');
  wrap.querySelectorAll('.recent-chip').forEach(btn=>btn.addEventListener('click',()=>{
    const p=findProductoByQuery(btn.dataset.name);
    const qty=Number(document.querySelector('#cantidad')?.value)||1;
    if(p && hxAddProductoSeguro(p.name,qty,null,p.pvp)){
      render();
      hxToastGlobal(`${p.name} añadido`,'ok');
      btn.classList.add('added-ok');
      const original=btn.textContent;
      btn.textContent='✓ Añadido';
      setTimeout(()=>{ btn.textContent=original; btn.classList.remove('added-ok'); },700);
    }else{
      hxToastGlobal('No se pudo añadir el producto.','error');
    }
  }));
}
const guardar_PRE182 = guardar;
guardar = function(){ if(!Array.isArray(lineas)||lineas.length===0){ alert('Añade al menos un producto antes de guardar el presupuesto.'); return; } return guardar_PRE182(); };
const pintarResultados_PRE182 = pintarResultados;
pintarResultados = function(term){ const r=pintarResultados_PRE182(term); const panel=document.querySelector('#resultados'); if(panel) panel.scrollTop=0; return r; };
const pintarCatalogPanel_PRE182 = (typeof pintarCatalogPanel==='function') ? pintarCatalogPanel : null;
if(pintarCatalogPanel_PRE182){ pintarCatalogPanel=function(term){ const r=pintarCatalogPanel_PRE182(term); const items=document.querySelector('#catalogItems'); if(items) items.scrollTop=0; const card=document.querySelector('#catalogModal .modal-card'); if(card) card.scrollTop=0; return r; }; }
document.addEventListener('DOMContentLoaded',()=>{ ['#btnCatalogo','#btnFamilias'].forEach(sel=>document.querySelector(sel)?.addEventListener('click',()=>setTimeout(()=>{ document.querySelectorAll('.modal-card,#catalogItems,#resultados').forEach(x=>{try{x.scrollTop=0;}catch(e){}}); },30))); });


function ref183(p){ return String((p && p.name) || '').trim(); }
function n183(p){ return normaliza(ref183(p)); }
function has183(txt,...keys){ return keys.some(k => txt.includes(normaliza(k))); }

function meta183(p){
  const raw = ref183(p);
  const n = n183(p);
  let m = null;
  try{ if(typeof meta182 === 'function') m = meta182(p); }catch(e){ m = null; }

  // Fuentes DC / PSU / AC: familia correcta sin cambiar la descripción visible.
  if(
    /(^|-)DC\d{1,2}V/i.test(raw) ||
    has183(n,'dc12v','dc1224v','dc6v','dc12v2a','psu','ac220v','fuente dc','12v psu')
  ){
    return Object.assign({}, m || {}, {
      icon:'⚡',
      family:'Alimentación',
      sub:'Fuentes de alimentación DC / PSU',
      official:(m && m.official) || 'Fuente de alimentación',
      tags:[...new Set([...(m && m.tags || []),'fuente','fuente dc','alimentación','alimentacion','dc','dc12','dc12v','dc12v2a','psu','12v','24v','6v','baja tensión','alimentador'])]
    });
  }

  // IP66: caja estanca / instalación exterior.
  if(has183(n,'ip66')){
    return Object.assign({}, m || {}, {
      icon:'🧰',
      family:'Accesorios de instalación',
      sub:'Cajas estancas IP66',
      official:(m && m.official) || 'Caja estanca IP66',
      tags:[...new Set([...(m && m.tags || []),'ip66','caja','caja estanca','exterior','instalación exterior','protección','agua','polvo'])]
    });
  }

  // Rack mural.
  if(has183(n,'rack-wall') || /^rack/.test(n)){
    return Object.assign({}, m || {}, {
      icon:'🗄️',
      family:'Infraestructura',
      sub:'Armarios Rack',
      official:(m && m.official) || 'Rack mural',
      tags:[...new Set([...(m && m.tags || []),'rack','rack mural','armario','pared','mural','19','comunicaciones','nvr','switch','red'])]
    });
  }

  // Switch PoE e inyector.
  if(has183(n,'poe') && (has183(n,'switch','sw1008','sw1005','vdms105','vdms108') || /^sw/.test(n))){
    return Object.assign({}, m || {}, {
      icon:'🌐',
      family:'Red / PoE',
      sub:'Switches PoE',
      official:(m && m.official) || 'Switch PoE',
      tags:[...new Set([...(m && m.tags || []),'switch','switch poe','poe','red','ethernet','cctv','cámaras ip','camara ip','8 puertos','5 puertos'])]
    });
  }
  if(has183(n,'inj-poe','injector','inyector')){
    return Object.assign({}, m || {}, {
      icon:'⚡',
      family:'Red / PoE',
      sub:'Inyectores PoE',
      official:(m && m.official) || 'Inyector PoE',
      tags:[...new Set([...(m && m.tags || []),'inyector','injector','poe','alimentación poe','alimentacion poe','ethernet','red'])]
    });
  }

  // Almacenamiento.
  if(/^hd\d+tb/.test(n) || has183(n,'hdd','disco duro')){
    return Object.assign({}, m || {}, {
      icon:'💾',
      family:'Almacenamiento',
      sub:'Discos duros',
      official:(m && m.official) || 'Disco duro',
      tags:[...new Set([...(m && m.tags || []),'disco','disco duro','hdd','hd','grabación','grabacion','nvr','almacenamiento'])]
    });
  }
  if(has183(n,'hs-tf','microsd','micro-sd','tarjeta-sd','tarjeta sd')){
    return Object.assign({}, m || {}, {
      icon:'💾',
      family:'Almacenamiento',
      sub:'Tarjetas microSD',
      official:(m && m.official) || 'Tarjeta microSD',
      tags:[...new Set([...(m && m.tags || []),'sd','micro sd','microsd','tarjeta','tarjeta sd','memoria','grabación','grabacion'])]
    });
  }

  // Baterías.
  if(has183(n,'battery','batt','batterybox','batterykit','internalbattery','hubbatt')){
    return Object.assign({}, m || {}, {
      icon:'🔋',
      family:'Alimentación',
      sub:'Baterías',
      official:(m && m.official) || 'Batería',
      tags:[...new Set([...(m && m.tags || []),'batería','bateria','battery','pila','alimentación','alimentacion','respaldo','backup'])]
    });
  }

  return m;
}

const descripcionProducto_PRE183 = descripcionProducto;
descripcionProducto = function(p){
  const m = meta183(p);
  let prev = null;
  try{ prev = descripcionProducto_PRE182 ? descripcionProducto_PRE182(p) : descripcionProducto_PRE183(p); }catch(e){
    try{ prev = descripcionProducto_PRE183(p); }catch(_){ prev = null; }
  }
  if(m){
    return {
      icon: m.icon || (prev && prev.icon) || '📦',
      // Importante: mantener descripción anterior buena. No pisar con meta.
      desc: (prev && prev.desc) || (m.desc) || 'Producto del catálogo',
      family: m.sub ? `${m.family} · ${m.sub}` : (m.family || (prev && prev.family) || 'Catálogo'),
      official: (prev && prev.official) || m.official || ref183(p)
    };
  }
  return prev || {icon:'📦', desc:'Producto del catálogo', family:'Producto nuevo', official:ref183(p)};
};

function textoIndex183(p){
  const m = meta183(p) || {};
  let prev = '';
  try{ const d = descripcionProducto_PRE182 ? descripcionProducto_PRE182(p) : descripcionProducto_PRE183(p); prev = [d.desc,d.family,d.official].join(' '); }catch(e){}
  return normaliza([
    ref183(p), p && p.brand,
    m.family, m.sub, m.official,
    (m.tags||[]).join(' '),
    prev,
    p && p._search175
  ].join(' '));
}

function construirIndice183(){
  try{
    productos.forEach((p,i)=>{
      p._idx183 = i;
      p._n183 = n183(p);
      p._tokens183 = p._n183.split(/[^a-z0-9]+/).filter(Boolean);
      p._search183 = textoIndex183(p);
    });
  }catch(e){}
}
const cargarCatalogo_PRE183 = cargarCatalogo;
cargarCatalogo = async function(){
  const r = await cargarCatalogo_PRE183();
  construirIndice183();
  return r;
};


function brandInfo186(p){
  const b = String((p && p.brand) || '').trim();
  if(!b) return '';
  const nb = normaliza(b);
  if(nb === 'ajax') return '';
  // Marcas puras conocidas: se usan para búsqueda, pero no como descripción visible.
  if(['wester','western','western digital','hikvision','seagate','toshiba'].includes(nb)) return '';
  return b;
}
function rawText186(p){ return [String((p&&p.name)||''), String((p&&p.brand)||'')].join(' '); }
function has186(txt,...keys){ return keys.some(k => txt.includes(normaliza(k))); }

function metaMarca186(p){
  const raw = rawText186(p);
  const n = normaliza(raw);
  const know = brandInfo186(p);
  const tags = [];
  const add = (...xs)=>xs.forEach(x=>{ if(x) tags.push(x); });
  let meta = null;

  // Familias por nombre + por texto de marca/conocimiento. No toca descripción si AJAX.
  if(/(^|\b|-)dc\s*\d{1,2}\s*v/i.test(raw) || has186(n,'dc12v','dc 12v','dc12','dc24','12v 2a','12v2a','fuente dc','alimentacion dc','alimentación dc','psu','ac220v')){
    add('fuente','fuente dc','alimentación','alimentacion','alimentador','dc','12v','24v','psu','transformador');
    meta = {icon:'⚡', family:'Alimentación', sub:'Fuentes de alimentación DC / PSU', desc:know || 'Fuente de alimentación de baja tensión', tags};
  }else if(has186(n,'ip66','caja estanca','estanco','exterior')){
    add('ip66','caja','caja estanca','exterior','instalacion exterior','instalación exterior','agua','polvo');
    meta = {icon:'🧰', family:'Accesorios de instalación', sub:'Cajas estancas IP66', desc:know || 'Caja estanca IP66 para instalaciones exteriores', tags};
  }else if(has186(n,'rack-wall','rack wall') || /^rack/.test(n) || has186(n,'armario rack','rack mural')){
    add('rack','rack mural','armario','pared','mural','19','comunicaciones','nvr','switch','red');
    meta = {icon:'🗄️', family:'Infraestructura', sub:'Armarios Rack', desc:know || 'Armario rack mural para comunicaciones y videovigilancia', tags};
  }else if((has186(n,'poe') && (has186(n,'switch','sw1008','sw1005','vdms105','vdms108') || /^sw/.test(n))) || has186(n,'switch poe')){
    add('switch','switch poe','poe','red','ethernet','gigabit','cctv','camaras ip','cámaras ip','5 puertos','8 puertos');
    meta = {icon:'🌐', family:'Red / PoE', sub:'Switches PoE', desc:know || 'Switch PoE para alimentar y conectar dispositivos IP', tags};
  }else if(has186(n,'inj-poe','injector poe','inyector poe','poe injector','poe 30w')){
    add('inyector','inyector poe','injector poe','poe','red','ethernet','alimentacion poe','alimentación poe');
    meta = {icon:'⚡', family:'Red / PoE', sub:'Inyectores PoE', desc:know || 'Inyector PoE para alimentación por cable Ethernet', tags};
  }else if(/^hd\d+tb/.test(n) || has186(n,'hdd','disco duro','hard disk','surveillance')){
    add('disco','disco duro','hdd','almacenamiento','grabacion','grabación','nvr','vigilancia');
    meta = {icon:'💾', family:'Almacenamiento', sub:'Discos duros', desc:know || 'Disco duro para grabación de videovigilancia/NVR', tags};
  }else if(has186(n,'hs-tf','micro sd','microsd','tarjeta sd','tf card','sd card')){
    add('sd','micro sd','microsd','tarjeta','tarjeta sd','memoria','grabacion','grabación','camara','cámara');
    meta = {icon:'💽', family:'Almacenamiento', sub:'Tarjetas microSD', desc:know || 'Tarjeta microSD para almacenamiento de vídeo', tags};
  }else if(has186(n,'battery','batt','bateria','batería','pila')){
    add('bateria','batería','battery','pila','alimentacion','alimentación','respaldo','backup');
    meta = {icon:'🔋', family:'Alimentación', sub:'Baterías', desc:know || 'Batería o alimentación de respaldo', tags};
  }else if(has186(n,'abe-150','barrera','perimetral')){
    add('barrera','perimetral','seguridad perimetral','exterior','intrusion','intrusión');
    meta = {icon:'🛡️', family:'Seguridad perimetral', sub:'Barreras', desc:know || 'Barrera de seguridad perimetral', tags};
  }else if(know){
    // Producto nuevo no AJAX: conserva el texto de marca como conocimiento visible.
    add(...know.split(/[\s,;\/]+/).filter(Boolean));
    meta = {icon:'📦', family:'Productos añadidos', sub:'Pendiente de clasificación avanzada', desc:know, tags};
  }

  if(meta){
    meta.official = meta.desc;
    meta.tags = [...new Set(meta.tags || [])];
  }
  return meta;
}

const descripcionProducto_PRE186 = descripcionProducto;
descripcionProducto = function(p){
  const prev = descripcionProducto_PRE186(p);
  const know = brandInfo186(p);
  const meta = metaMarca186(p);
  // Si es AJAX, no se toca absolutamente nada.
  if(!know && normaliza(String((p&&p.brand)||'AJAX')) === 'ajax') return prev;
  if(meta){
    return {
      icon: meta.icon || (prev && prev.icon) || '📦',
      // Solo para productos no AJAX usamos marca/conocimiento como descripción.
      desc: meta.desc || (prev && prev.desc) || 'Producto del catálogo',
      family: meta.sub ? `${meta.family} · ${meta.sub}` : meta.family,
      official: (prev && prev.official) || String((p&&p.name)||'')
    };
  }
  return prev;
};

function textoIndex186(p){
  const prev = (p && (p._search183 || p._search182 || p._search175)) || '';
  const meta = metaMarca186(p) || {};
  const know = brandInfo186(p);
  return normaliza([
    p && p.name,
    p && p.brand,
    know,
    meta.family,
    meta.sub,
    meta.desc,
    (meta.tags||[]).join(' '),
    prev
  ].join(' '));
}
function construirIndice186(){
  try{
    productos.forEach((p,i)=>{
      p._idx186 = i;
      p._n186 = normaliza(String((p&&p.name)||''));
      p._tokens186 = p._n186.split(/[^a-z0-9]+/).filter(Boolean);
      p._search186 = textoIndex186(p);
    });
  }catch(e){}
}
const cargarCatalogo_PRE186 = cargarCatalogo;
cargarCatalogo = async function(){
  const r = await cargarCatalogo_PRE186();
  construirIndice186();
  return r;
};
function ref188(p){ return String((p && p.name) || '').trim(); }
function n188(p){ return normaliza(ref188(p)); }
function isAjaxKit188(p){
  const n = n188(p);
  return /^aj-hub2kit/.test(n) || n.includes('starterkit');
}
function color188(n){
  if(/-w$/.test(n) || n.endsWith('white')) return 'Blanco';
  if(/-b$/.test(n) || n.endsWith('black')) return 'Negro';
  return '';
}
function kitDesc188(p){
  const n = n188(p);
  if(!isAjaxKit188(p)) return null;

  let hub = 'Hub 2';
  if(n.includes('hub2plus')) hub = 'Hub 2 Plus';
  if(n.includes('hubbp')) hub = 'Hub BP';
  if(n.includes('hubhybrid')) hub = 'Hub Hybrid';
  if(n.includes('hub2kit4g') || n.includes('hub2-4g') || /(^|-)4g($|-)/.test(n)) hub += ' 4G';

  const piezas = [];
  if(/(^|-)mp($|-)/.test(n) || n.includes('motionprotect')) piezas.push('MotionProtect');
  if(/(^|-)dp($|-)/.test(n) || n.includes('doorprotect')) piezas.push('DoorProtect');
  if(/(^|-)phod($|-)/.test(n) || n.includes('phod')) piezas.push('dispositivos Photo On Demand');
  if(/(^|-)pro($|-)/.test(n)) piezas.push('accesorios Professional');

  const c = color188(n);
  let desc = `Kit de alarma Ajax ${hub}${c ? ' ' + c : ''}`;
  if(piezas.length){
    desc += ` con ${piezas.join(', ')}`;
  }else{
    desc += ' con central y accesorios incluidos';
  }
  return {
    icon: '📦',
    desc,
    family: 'Kits Ajax · Alarma',
    official: ref188(p),
    tags: ['kit','kit ajax','kit alarma','starter','alarma completa','pack alarma','hub','central','ajax']
  };
}

const descripcionProducto_PRE188 = descripcionProducto;
descripcionProducto = function(p){
  const k = kitDesc188(p);
  if(k) return k;
  return descripcionProducto_PRE188(p);
};
function ref189(p){ return String((p && p.name) || '').trim(); }
function n189(p){ return normaliza(ref189(p)); }
function isNvrAjax189(p){
  const n = n189(p);
  return /^aj-nvr/.test(n) && !n.includes('psu');
}
function nvrChannels189(p){
  const n = n189(p);
  // En Ajax, estos códigos indican capacidad de canales:
  // 108/208/KIT108 => 8 canales; 116/216 => 16 canales; 232 => 32 canales.
  if(/nvr(?:kit)?108/.test(n) || /nvr208/.test(n)) return 8;
  if(/nvr116/.test(n) || /nvr216/.test(n)) return 16;
  if(/nvr232/.test(n)) return 32;
  if(/(^|-)8ch($|-)/.test(n) || /(^|-)8-ch($|-)/.test(n)) return 8;
  if(/(^|-)16ch($|-)/.test(n) || /(^|-)16-ch($|-)/.test(n)) return 16;
  if(/(^|-)32ch($|-)/.test(n) || /(^|-)32-ch($|-)/.test(n)) return 32;
  return null;
}
function nvrPoePorts189(p){
  const n = n189(p);
  if(/(^|-)16p($|-)/.test(n)) return 16;
  if(/(^|-)8p($|-)/.test(n)) return 8;
  return null;
}
function nvrDesc189(p){
  if(!isNvrAjax189(p)) return null;
  const n = n189(p);
  const ch = nvrChannels189(p);
  const poe = nvrPoePorts189(p);
  const c = color188 ? color188(n) : (/\-w$/.test(n) ? 'Blanco' : (/\-b$/.test(n) ? 'Negro' : ''));
  const esKit = n.includes('nvrkit');
  let desc = esKit ? 'Kit de videovigilancia Ajax' : 'Grabador de vídeo en red Ajax NVR';
  if(ch) desc += ` de ${ch} canales`;
  if(n.includes('ai')) desc += ' con IA';
  if(n.includes('hac') || n.includes('hdc')) desc += ' con salida HDMI';
  if(poe) desc += ` y ${poe} puertos PoE`;
  if(n.includes('dc') || n.includes('hdc')) desc += ' alimentado por baja tensión';
  if(c) desc += ` ${c}`;
  if(esKit){
    if(n.includes('bullet')) desc += ' con cámaras BulletCam incluidas';
    if(n.includes('turret')) desc += ' con cámaras TurretCam incluidas';
  }
  return {
    icon:'💾',
    desc,
    family: esKit ? 'Kits Ajax · Videovigilancia' : 'Grabadores NVR Ajax',
    official: ref189(p),
    tags:['nvr','grabador','videograbador','camaras','cámaras','canales','hdmi','hdd','videovigilancia'].concat(ch ? [`${ch} canales`, `${ch}ch`] : []).concat(poe ? [`${poe} poe`, `${poe} puertos poe`] : [])
  };
}

const descripcionProducto_PRE189 = descripcionProducto;
descripcionProducto = function(p){
  const nvr = nvrDesc189(p);
  if(nvr) return nvr;
  return descripcionProducto_PRE189(p);
};
function ref190(p){ return String((p && p.name) || '').trim(); }
function n190(p){ return normaliza(ref190(p)); }
function color190(n){
  if(typeof color188 === 'function') return color188(n);
  if(/-w$/.test(n) || n.endsWith('white')) return 'Blanco';
  if(/-b$/.test(n) || n.endsWith('black')) return 'Negro';
  return '';
}
function isCurtainAjax190(p){
  const n = n190(p);
  return n.includes('curtainprotect') || n.includes('curtainoutdoor') || n.includes('dualcurtainoutdoor') || n.includes('curtaincamoutdoor') || n.includes('dualcurtain');
}
function isDoorAjax190(p){
  const n = n190(p);
  // DoorBell es timbre/cámara, no DoorProtect. Curtain no es puerta/ventana.
  return !isCurtainAjax190(p) && !n.includes('doorbell') && (n.includes('doorprotect') || /^aj-doorprotect/.test(n));
}
function curtainDesc190(p){
  if(!isCurtainAjax190(p)) return null;
  const n = n190(p);
  const c = color190(n);
  const dummy = n.includes('dummy');
  let official = 'CurtainProtect';
  let desc = 'Detector de movimiento Ajax tipo cortina';
  let sub = 'Detectores tipo cortina';
  let icon = '🛡️';

  if(n.includes('curtaincamoutdoor')){
    official = 'CurtainCam Outdoor';
    desc = 'Detector exterior Ajax tipo cortina con cámara y verificación fotográfica';
    sub = 'Detectores exteriores con cámara';
    icon = '📷';
    if(n.includes('highmount')) desc += ' para montaje alto';
    if(n.includes('phod')) desc += ' Photo On Demand';
  }else if(n.includes('dualcurtainoutdoor') || n.includes('dualcurtain')){
    official = 'DualCurtain Outdoor';
    desc = 'Detector exterior Ajax de movimiento tipo cortina doble para protección perimetral';
    sub = 'Detectores exteriores tipo cortina';
  }else if(n.includes('curtainoutdoor')){
    official = 'Curtain Outdoor';
    desc = 'Detector exterior Ajax de movimiento tipo cortina para protección perimetral';
    sub = 'Detectores exteriores tipo cortina';
    if(n.includes('mini')) official = 'Curtain Outdoor Mini';
    if(n.includes('mini')) desc = 'Detector exterior Ajax Curtain Outdoor Mini tipo cortina para protección perimetral';
  }else if(n.includes('curtainprotect')){
    official = 'CurtainProtect';
    desc = 'Detector inalámbrico Ajax de movimiento tipo cortina para proteger accesos, pasillos y perímetros interiores';
    sub = 'Detectores interiores tipo cortina';
  }

  if(dummy) desc = `Maqueta/demo ${official} sin electrónica funcional`;
  if(c) desc += ` ${c}`;

  return {
    icon,
    desc,
    family: `Protección contra intrusiones · ${sub}`,
    official,
    tags: [
      'curtain','cortina','detector cortina','tipo cortina','barrera cortina','movimiento','pir','perimetral','perimetro','perímetro',
      'proteccion perimetral','protección perimetral','exterior','interior','pasillo','ventanal','acceso', official.toLowerCase()
    ]
  };
}
function doorDesc190(p){
  if(!isDoorAjax190(p)) return null;
  const n = n190(p);
  const c = color190(n);
  const dummy = n.includes('dummy');
  let official = n.includes('doorprotectplus') ? 'DoorProtect Plus' : 'DoorProtect';
  let desc = n.includes('doorprotectplus')
    ? 'Detector magnético Ajax de apertura con sensor de impacto e inclinación para puerta o ventana'
    : 'Detector magnético Ajax de apertura para puerta o ventana';
  if(dummy) desc = `Maqueta/demo ${official} sin electrónica funcional`;
  if(c) desc += ` ${c}`;
  return {
    icon:'🚪',
    desc,
    family:'Protección contra intrusiones · Puertas / ventanas',
    official,
    tags:['doorprotect','door','puerta','ventana','apertura','contacto magnetico','contacto magnético','iman','imán','magnético','magnetico',official.toLowerCase()]
  };
}

const descripcionProducto_PRE190 = descripcionProducto;
descripcionProducto = function(p){
  const cur = curtainDesc190(p);
  if(cur) return cur;
  const door = doorDesc190(p);
  if(door) return door;
  return descripcionProducto_PRE190(p);
};
function ref191(p){ return String((p && p.name) || '').trim(); }
function n191(p){ return normaliza(ref191(p)); }
function color191(n){
  if(typeof color190 === 'function') return color190(n);
  if(/-w$/.test(n)) return 'Blanco';
  if(/-b$/.test(n)) return 'Negro';
  if(/-gra$/.test(n)) return 'Grafito';
  if(/-gre$/.test(n)) return 'Gris';
  return '';
}
function addColor191(desc,n){ const c=color191(n); return c ? desc + ' ' + c : desc; }
function camLens191(n){ return n.includes('0400') || /-4($|-)/.test(n) ? '4 mm' : (n.includes('0280') || n.includes('2-8') ? '2.8 mm' : ''); }
function camMp191(n){ const m = n.match(/(?:^|-)cam-(\d)(?:-|$)|(?:bulletcam|domecam|turretcam|indoorcam|doorbell)-(\d)(?:-|$)/); return m ? (m[1]||m[2]) : ''; }
function isCamera191(n){ return n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam') || n.includes('indoorcam') || n.includes('doorbell'); }
function preciseDesc191(p){
  const raw = ref191(p); const n = n191(p); const tags = [];

  // Cámaras cableadas / Wi-Fi / timbre. Basado en textos del catálogo pegado.
  if(isCamera191(n)){
    let shape = n.includes('bulletcam') ? 'BulletCam' : n.includes('domecam') ? 'DomeCam Mini' : n.includes('turretcam') ? 'TurretCam' : n.includes('doorbell') ? 'DoorBell' : 'IndoorCam';
    const mp = camMp191(n); const lens = camLens191(n);
    const hl = n.includes('hlvf') || n.includes('-hl-') || n.endsWith('-hl');
    const vf = n.includes('hlvf');
    let desc = '';
    if(n.includes('doorbell')) desc = 'Vídeo timbre Ajax con IA integrada, sensor PIR y control desde la app';
    else if(n.includes('indoorcam')) desc = 'Cámara de seguridad Wi-Fi Ajax para interiores con sensor de movimiento PIR e IA integrada';
    else desc = `Cámara IP Ajax ${shape}${mp ? ' de '+mp+' MP' : ''}${lens ? ' / '+lens : ''} con IA, True WDR, micrófono y alimentación PoE/12 V`;
    if(!n.includes('doorbell') && !n.includes('indoorcam')){
      desc += n.includes('domecam') || n.includes('turretcam') || n.includes('bulletcam') ? '. Para exteriores e interiores' : '';
      if(hl) desc += vf ? ', objetivo varifocal motorizado e iluminación híbrida' : ', iluminación híbrida';
      else desc += ', iluminación IR';
    }
    desc = addColor191(desc,n);
    tags.push('camara','cámara','ip','ia','video','vídeo','poe','12v','true wdr','microfono','micrófono',shape.toLowerCase(),mp?mp+' mp':'',lens,hl?'iluminacion hibrida':'ir',vf?'varifocal':'');
    if(n.includes('doorbell')) tags.push('timbre','videoportero','doorbell','pir');
    if(n.includes('indoorcam')) tags.push('wifi','wi-fi','interior','indoorcam','pir');
    return {icon:n.includes('doorbell')?'🔔':'📷', family:n.includes('doorbell')?'Timbres Ajax':'Cámaras Ajax', official:shape, desc, tags};
  }

  // Teclados.
  if(n.includes('keypad')){
    let official='KeyPad', desc='Teclado inalámbrico Ajax para control del sistema de alarma mediante códigos';
    if(n.includes('outdoor')){ official='KeyPad Outdoor'; desc='Teclado inalámbrico Ajax para exteriores e interiores que admite Pass, Tag, smartphones y códigos'; }
    else if(n.includes('touchscreen')){ official='KeyPad TouchScreen'; desc='Teclado inalámbrico Ajax con pantalla táctil que admite smartphones, Pass, Tag y códigos'; }
    else if(n.includes('keypadplus')){ official='KeyPad Plus'; desc='Teclado inalámbrico y táctil Ajax compatible con tarjetas y mandos cifrados sin contacto'; }
    else if(n.includes('keypadcombi')){ official='KeyPad Combi'; desc='Teclado inalámbrico Ajax con sirena integrada, compatible con Pass, Tag y códigos'; }
    desc = addColor191(desc,n);
    return {icon:'⌨️', family:'Teclados Ajax', official, desc, tags:['teclado','keypad','codigo','código','pass','tag','smartphone','autenticacion','autenticación',official.toLowerCase()]};
  }

  // FireProtect 2 y EN54.
  if(n.includes('fireprotect') || n.includes('manualcallpoint')){
    if(n.includes('manualcallpoint')){
      let color = n.includes('blue')?'azul':n.includes('green')?'verde':n.includes('yellow')?'amarillo':n.includes('white')?'blanco':'rojo';
      return {icon:'🧯', family:'Pulsadores manuales de alarma Ajax', official:'ManualCallPoint', desc:`Botón inalámbrico Ajax reajustable y programable de color ${color}`, tags:['pulsador','boton','botón','manualcallpoint','alarma','incendio',color]};
    }
    const hasH = /fireprotect2-(h|hc|hs|hsc)/.test(n) || n.includes('heat');
    const hasS = /fireprotect2-(s|hs|hsc)/.test(n) || n.includes('smoke');
    const hasC = /fireprotect2-(c|hc|hsc)/.test(n) || n.includes('co') || n.includes('plus');
    const ac = n.includes('-ac-'); const rb = n.includes('-rb-'); const sb = n.includes('-sb-');
    let sensores=[]; if(hasS) sensores.push('humo'); if(hasH) sensores.push('calor'); if(hasC) sensores.push('CO');
    let desc = n.includes('fireprotect2') ? `Detector inalámbrico Ajax FireProtect 2 de ${sensores.length?sensores.join(', '):'incendio'}` : (n.includes('plus') ? 'Detector inalámbrico Ajax FireProtect Plus de calor, humo y CO' : 'Detector inalámbrico Ajax FireProtect de incendio con sensores de calor y humo');
    if(ac) desc += ' alimentado por red eléctrica';
    if(rb) desc += ' con baterías reemplazables';
    if(sb) desc += ' con baterías integradas';
    desc = addColor191(desc,n);
    return {icon:'🔥', family:'Detectores de incendio Ajax', official:n.includes('fireprotect2')?'FireProtect 2':(n.includes('plus')?'FireProtect Plus':'FireProtect'), desc, tags:['incendio','fuego','humo','calor','co','monoxido','monóxido','fireprotect','detector',ac?'ac':'',rb?'rb bateria reemplazable':'',sb?'sb bateria integrada':'']};
  }

  // NVR: añade descripción más oficial sin tocar canales ya corregidos en v1.8.9.
  if(typeof isNvrAjax189 === 'function' && isNvrAjax189(p)){
    const ch = nvrChannels189(p); const poe = nvrPoePorts189(p);
    let desc = `Grabador de vídeo en red Ajax${ch?' de '+ch+' canales':''}`;
    if(n.includes('ai')) desc += ' con IA';
    if(n.includes('h2d') || n.includes('hac') || n.includes('hdc')) desc += ' con salida HDMI 4K';
    if(poe) desc += `, ${poe} puertos PoE`;
    if(n.includes('2g')) desc += ', 2 puertos Gigabit Ethernet';
    if(n.includes('dc') || n.includes('hdc')) desc += ' y alimentación de baja tensión';
    desc += ' y soporte para discos duros';
    return {icon:'💾', family:'Grabadores NVR Ajax', official:'NVR', desc, tags:['nvr','grabador','videograbador','video','vídeo','canales','hdmi','4k','hdd','disco duro','poe',ch?ch+' canales':'',poe?poe+' poe':'']};
  }

  // Automatización, enchufes, relés, switches.
  if(n.includes('lightswitch') || n.includes('lightcore')){
    let vias = n.includes('dimmer')?'Dimmer':n.includes('cross')||n.includes('crossover')?'cruce':n.includes('2g2w')?'2 bandas y 2 vías':n.includes('2g')?'2 bandas':n.includes('2w')?'2 vías':'1 banda';
    return {icon:'💡', family:'Interruptores de luz Ajax', official:'LightSwitch', desc:`Interruptor de luz inteligente Ajax táctil de ${vias}`, tags:['interruptor','luz','lightswitch','lightcore','tactil','táctil','dimmer','domotica','domótica',vias]};
  }
  if(n.includes('outlet')){
    const lan = n.includes('lan');
    return {icon:'🔌', family:'Bases de enchufe Ajax', official:lan?'Outlet LAN':'Outlet', desc: lan?'Base de enchufe Ethernet Ajax con dos puertos':'Base de enchufe inteligente Ajax con monitor de consumo eléctrico', tags:['enchufe','base','outlet','socket','consumo','ethernet',lan?'lan':'']};
  }
  if(n.includes('socket')){
    return {icon:'🔌', family:'Enchufes inteligentes Ajax', official:'Socket', desc:'Enchufe inteligente Ajax con monitor de consumo eléctrico', tags:['enchufe','socket','consumo','inteligente','domotica','domótica']};
  }
  if(n.includes('relay') || n.includes('wallswitch')){
    const multi = n.includes('multirelay');
    const wall = n.includes('wallswitch');
    let desc = multi ? 'Relé Ajax de cuatro canales de control remoto' : (wall ? 'Relé de potencia Ajax para controlar la alimentación 110/230 V en remoto' : 'Relé inalámbrico Ajax de contacto seco');
    return {icon:'⚡', family:'Relés Ajax', official:multi?'MultiRelay':(wall?'WallSwitch':'Relay'), desc, tags:['rele','relé','relay','wallswitch','contacto seco','control remoto','domotica','domótica']};
  }

  // Aire / inundación / agua.
  if(n.includes('lifequality')){
    const lite = n.includes('lite');
    return {icon:'🌡️', family:'Detectores de calidad del aire Ajax', official:lite?'LifeQuality Lite':'LifeQuality', desc: lite?'Monitor inalámbrico Ajax de temperatura y humedad':'Monitor inalámbrico Ajax de temperatura, humedad y CO₂', tags:['temperatura','humedad','co2','co₂','calidad aire','lifequality','monitor',lite?'lite':'']};
  }
  if(n.includes('leaksprotect')){
    return {icon:'💧', family:'Detectores de inundación Ajax', official:'LeaksProtect', desc:addColor191('Detector inalámbrico Ajax de inundación',n), tags:['inundacion','inundación','agua','fuga','leaksprotect','detector inundacion']};
  }
  if(n.includes('waterstop')){
    let tam = raw.match(/(1\"|½\"|¾\"|DN\s?\d+)/i); tam = tam ? ' '+tam[1] : '';
    return {icon:'🚰', family:'Válvulas de cierre Ajax', official:'WaterStop', desc:`Válvula de cierre de agua Ajax inalámbrica de control remoto${tam}`, tags:['waterstop','valvula','válvula','agua','cierre','llave','fuga','inundacion']};
  }

  // Módulos de integración y Fibra.
  if(n.includes('multitransmitter') || n.includes('transmitter') || n.includes('vhfbridge')){
    let official = n.includes('multitransmitter')?'MultiTransmitter':n.includes('vhfbridge')?'vhfBridge':'Transmitter';
    let desc = n.includes('multitransmitter') ? 'Módulo Ajax para integrar hasta 18 dispositivos de terceros en el sistema' : n.includes('vhfbridge') ? 'Módulo Ajax para conectar el sistema a transmisores VHF de terceros' : 'Módulo Ajax para integrar un dispositivo de terceros en el sistema';
    if(n.includes('fibra')) desc = desc.replace('Módulo Ajax','Módulo cableado Ajax Fibra');
    else desc = desc.replace('Módulo Ajax','Módulo inalámbrico Ajax');
    if(n.includes('4x4')) desc += ' con 4 entradas y 4 salidas';
    return {icon:'🔗', family:'Módulos de integración Ajax', official, desc, tags:['modulo','módulo','integracion','integración','terceros','transmitter','multitransmitter','fibra','vhf']};
  }
  if(n.includes('lineprotect') || n.includes('linesplit') || n.includes('linesupply')){
    let desc = n.includes('lineprotect')?'Módulo Ajax Fibra de protección de línea contra cortocircuito y sabotaje':n.includes('linesplit')?'Módulo Ajax Fibra para dividir una línea en cuatro líneas':'Módulo Ajax Fibra para alimentación adicional de la línea';
    if(n.includes('45w')) desc += ' de 45 W'; if(n.includes('75w')) desc += ' de 75 W';
    return {icon:'🧩', family:'Accesorios Fibra Ajax', official:'Fibra', desc, tags:['fibra','lineprotect','linesplit','linesupply','linea','línea','alimentacion','proteccion']};
  }

  // Carcasas y fuentes.
  if(/^aj-case|case/.test(n)){
    let desc='Carcasa Ajax para módulos y accesorios';
    if(n.includes('casee')) desc='Carcasa impermeable Ajax para hub con batería interna. Para exteriores e interiores';
    return {icon:'📦', family:'Carcasas Ajax', official:'Case', desc, tags:['carcasa','case','caja','modulo','módulo']};
  }
  if(n.includes('psu') || n.includes('pcb')){
    let desc = n.includes('nvr') ? 'Fuente de alimentación Ajax para NVR' : 'Fuente de alimentación Ajax para funcionamiento con alimentación de baja tensión';
    if(n.includes('12v')) desc='Fuente de alimentación Ajax 12 V para Hub, Hub Plus o ReX';
    if(n.includes('6v')) desc='Fuente de alimentación Ajax 6 V para funcionamiento con batería portátil';
    return {icon:'🔋', family:'Fuentes de alimentación Ajax', official:'PSU', desc, tags:['fuente','alimentacion','alimentación','psu','12v','6v','baja tension','batería','bateria']};
  }

  return null;
}
const descripcionProducto_PRE191 = descripcionProducto;
descripcionProducto = function(p){
  // Mantener Curtain y Door del parche 1.9.0 por delante.
  try{ const cur = (typeof curtainDesc190 === 'function') ? curtainDesc190(p) : null; if(cur) return cur; }catch(e){}
  try{ const door = (typeof doorDesc190 === 'function') ? doorDesc190(p) : null; if(door) return door; }catch(e){}
  const m = preciseDesc191(p); if(m) return m;
  return descripcionProducto_PRE191(p);
};
function ref192(p){ return String((p && p.name) || '').trim(); }
function n192(p){ return normaliza(ref192(p)); }
function color192(n){
  if(typeof color191 === 'function') return color191(n);
  if(/-w($|-)/.test(n)) return 'Blanco';
  if(/-b($|-)/.test(n)) return 'Negro';
  if(/-gra($|-)/.test(n)) return 'Grafito';
  if(/-gre($|-)/.test(n)) return 'Gris';
  return '';
}
function withColor192(desc,n){ const c=color192(n); return c ? `${desc} ${c}` : desc; }
function isDummy192(n){ return n.includes('dummy'); }
function dummyOfficial192(n){
  if(n.includes('curtainprotect')) return 'CurtainProtect Dummy';
  if(n.includes('dualcurtainoutdoor')) return 'DualCurtain Outdoor Dummy';
  if(n.includes('motioncamoutdoor')) return 'MotionCam Outdoor Dummy';
  if(n.includes('motioncam')) return 'MotionCam Dummy';
  if(n.includes('motionprotect')) return 'MotionProtect Dummy';
  if(n.includes('doorprotect')) return 'DoorProtect Dummy';
  if(n.includes('combiprotect')) return 'CombiProtect Dummy';
  if(n.includes('glassprotect')) return 'GlassProtect Dummy';
  if(n.includes('fireprotect')) return 'FireProtect Dummy';
  if(n.includes('homesiren')) return 'HomeSiren Dummy';
  if(n.includes('streetsirencustom')) return 'StreetSiren Custom Dummy';
  if(n.includes('streetsiren')) return 'StreetSiren Dummy';
  if(n.includes('keypadplus')) return 'KeyPad Plus Dummy';
  if(n.includes('keypadcombi')) return 'KeyPad Combi Dummy';
  if(n.includes('keypad')) return 'KeyPad Dummy';
  if(n.includes('spacecontrol')) return 'SpaceControl Dummy';
  if(n.includes('outdoorprotect')) return 'OutdoorProtect Dummy';
  if(n.includes('hub')) return 'Hub Dummy';
  return 'Dummy Ajax';
}
function familyDesc192(p){
  const raw=ref192(p), n=n192(p);

  // DUMMY SIEMPRE PRIMERO: maqueta/carcasa, nunca detector real.
  if(isDummy192(n)){
    const official=dummyOfficial192(n);
    let base = 'Maqueta/carcasa Ajax sin electrónica funcional para exposición, reposición estética o demostración';
    if(n.includes('curtain')) base = 'Maqueta/carcasa Ajax tipo cortina sin electrónica funcional';
    if(n.includes('siren')) base = 'Carcasa/maqueta Ajax de sirena sin electrónica funcional';
    if(n.includes('hub')) base = 'Carcasa/maqueta Ajax de central Hub sin electrónica funcional';
    return {
      icon:'📦', official, family:'Carcasas y maquetas Ajax · Dummy',
      desc:withColor192(base,n),
      tags:['dummy','maqueta','carcasa','sin electronica','sin electrónica','demo','exposicion','exposición','repuesto estetico','repuesto estético',official.toLowerCase()]
    };
  }

  // Carcasas / maletas / soportes que no son dispositivos de alarma.
  if(n.includes('democase') || n.includes('suitcase') || n.includes('case') || n.includes('brackethub') || n.includes('hood-') || n.includes('-lens') || n.includes('lens')){
    let official='Accesorio Ajax';
    let desc='Accesorio Ajax de instalación o demostración';
    let sub='Accesorios';
    if(n.includes('democase')){ official='DemoCase'; desc='Maletín demostrativo Ajax para exposición y formación'; sub='Maletas demo'; }
    else if(n.includes('suitcase')){ official='Suitcase'; desc='Maleta Ajax para transporte, demo o instalación'; sub='Maletas'; }
    else if(n.includes('brackethub')){ official='BracketHub'; desc='Soporte de montaje Ajax para central Hub'; sub='Soportes'; }
    else if(n.includes('hood')){ official='Hood'; desc='Visera protectora Ajax para detector exterior'; sub='Accesorios detectores'; }
    else if(n.includes('lens')){ official='Lens'; desc='Lente de recambio Ajax para detector'; sub='Recambios'; }
    else if(n.includes('case')){ official='Case'; desc='Carcasa Ajax para módulos, hubs o accesorios'; sub='Carcasas'; }
    return {icon:'🧰', official, family:`Carcasas y accesorios Ajax · ${sub}`, desc:withColor192(desc,n), tags:['accesorio','carcasa','case','maleta','demo','soporte','bracket','hood','lente','lens',official.toLowerCase()]};
  }

  // Intrusión: familias principales.
  if(n.includes('curtain')){
    let official='CurtainProtect', desc='Detector Ajax de movimiento tipo cortina para protección de accesos, pasillos y perímetros', sub='Cortina';
    if(n.includes('curtaincamoutdoor')){ official='CurtainCam Outdoor'; desc='Detector exterior Ajax tipo cortina con cámara y verificación fotográfica'; sub='Cortina exterior con cámara'; }
    else if(n.includes('dualcurtainoutdoor')){ official='DualCurtain Outdoor'; desc='Detector exterior Ajax tipo cortina doble para protección perimetral'; sub='Cortina exterior doble'; }
    else if(n.includes('curtainoutdoor')){ official='Curtain Outdoor'; desc='Detector exterior Ajax tipo cortina para protección perimetral'; sub='Cortina exterior'; }
    return {icon:n.includes('cam')?'📷':'🛡️', official, family:`Intrusión Ajax · Detectores tipo cortina · ${sub}`, desc:withColor192(desc,n), tags:['curtain','cortina','tipo cortina','detector cortina','perimetral','perímetro','pir','movimiento','exterior','interior',official.toLowerCase()]};
  }
  if(n.includes('doorprotect') && !n.includes('outdoorprotect') && !n.includes('doorbell')){
    const plus=n.includes('plus');
    return {icon:'🚪', official:plus?'DoorProtect Plus':'DoorProtect', family:'Intrusión Ajax · Contactos magnéticos', desc:withColor192(plus?'Detector magnético Ajax de apertura con impacto e inclinación para puertas y ventanas':'Detector magnético Ajax de apertura para puertas y ventanas',n), tags:['doorprotect','puerta','ventana','apertura','contacto magnético','magnetico','magnético','iman','imán']};
  }
  if(n.includes('motioncam') || n.includes('motionprotect') || n.includes('outdoorprotect')){
    let official='MotionProtect', desc='Detector volumétrico PIR Ajax de movimiento', sub='Movimiento interior';
    if(n.includes('motioncamoutdoor')){ official='MotionCam Outdoor'; desc='Detector exterior Ajax de movimiento con cámara y verificación fotográfica'; sub='Movimiento exterior con cámara'; }
    else if(n.includes('motioncam')){ official='MotionCam'; desc='Detector volumétrico Ajax de movimiento con cámara y verificación fotográfica'; sub='Movimiento con cámara'; }
    else if(n.includes('outdoorprotect')){ official='OutdoorProtect'; desc='Detector exterior Ajax de movimiento para protección perimetral'; sub='Movimiento exterior'; }
    else if(n.includes('motionprotectplus')){ official='MotionProtect Plus'; desc='Detector volumétrico Ajax PIR con sensor adicional de microondas'; sub='Movimiento interior'; }
    if(n.includes('phod')) desc += ' Photo On Demand';
    if(n.includes('highmount')) desc += ' para montaje alto';
    return {icon:n.includes('cam')?'📷':'🛡️', official, family:`Intrusión Ajax · ${sub}`, desc:withColor192(desc,n), tags:['motion','movimiento','volumetrico','volumétrico','pir','detector','exterior','interior','camara','cámara','phod',official.toLowerCase()]};
  }
  if(n.includes('glassprotect')){
    return {icon:'🪟', official:'GlassProtect', family:'Intrusión Ajax · Rotura de cristal', desc:withColor192('Detector Ajax de rotura de cristal',n), tags:['glassprotect','cristal','rotura','vidrio','detector']};
  }
  if(n.includes('combiprotect')){
    return {icon:'🛡️', official:'CombiProtect', family:'Intrusión Ajax · Movimiento + cristal', desc:withColor192('Detector combinado Ajax de movimiento y rotura de cristal',n), tags:['combiprotect','combi','movimiento','cristal','rotura','pir','detector']};
  }

  // Control, mandos, botones y sirenas.
  if(n.includes('spacecontrol')) return {icon:'🎛️', official:'SpaceControl', family:'Control Ajax · Mandos', desc:withColor192('Mando inalámbrico Ajax SpaceControl para controlar el sistema de alarma',n), tags:['mando','spacecontrol','llavero','control','armar','desarmar','boton','botón']};
  if(n.includes('doublebutton')) return {icon:'🆘', official:'DoubleButton', family:'Control Ajax · Botones de pánico', desc:withColor192('Botón inalámbrico Ajax DoubleButton para alarma de pánico con doble pulsación',n), tags:['doublebutton','boton','botón','panico','pánico','alarma','pulsador']};
  if(n.includes('button') && !n.includes('centerbutton') && !n.includes('sidebutton') && !n.includes('solobutton')) return {icon:'🔘', official:'Button', family:'Control Ajax · Botones', desc:withColor192('Botón inalámbrico Ajax configurable para alarma o escenarios',n), tags:['button','boton','botón','escenario','panico','pánico','control']};
  if(n.includes('homesiren') || n.includes('streetsiren')){
    let official=n.includes('homesiren')?'HomeSiren':(n.includes('custom')?'StreetSiren Custom':'StreetSiren');
    let desc=n.includes('homesiren')?'Sirena interior inalámbrica Ajax':'Sirena exterior inalámbrica Ajax';
    if(n.includes('custom')) desc='Sirena exterior Ajax personalizable';
    return {icon:'📣', official, family:n.includes('homesiren')?'Sirenas Ajax · Interior':'Sirenas Ajax · Exterior', desc:withColor192(desc,n), tags:['sirena','siren','alarma','sonora','interior','exterior',official.toLowerCase()]};
  }

  return null;
}

const descripcionProducto_PRE192 = descripcionProducto;
descripcionProducto = function(p){
  const m=familyDesc192(p); if(m) return m;
  return descripcionProducto_PRE192(p);
};
let catalogLetter193 = '';
const pintarCatalogPanel_PRE193 = pintarCatalogPanel;
pintarCatalogPanel = function(term=catalogTerm){
  ensureAlphabet193();
  pintarCatalogPanel_PRE193(term);
};

// Pequeños refuerzos de puntuación sin filtrar de forma agresiva.
// Reinicia A-Z al abrir catálogo desde botón para que no parezca que faltan productos.
const abrirCatalogo_PRE193 = typeof abrirCatalogo === 'function' ? abrirCatalogo : null;
if(abrirCatalogo_PRE193){
  abrirCatalogo = function(){
    catalogLetter193 = '';
    ensureAlphabet193();
    document.querySelectorAll('.az-chip').forEach(b => b.classList.toggle('active', b.dataset.letter === ''));
    return abrirCatalogo_PRE193.apply(this, arguments);
  };
}

document.addEventListener('DOMContentLoaded',()=>{
  try{
    ensureAlphabet193();
  }catch(e){}
});
const resolverDesdeInput_BASE194 = resolverDesdeInput;
let searchTimer194 = null;

// Limpia caches al recargar catálogo y mantiene versión visible simple.
const cargarCatalogo_BASE194 = cargarCatalogo;
cargarCatalogo = async function(){
  return cargarCatalogo_BASE194.apply(this, arguments);
};


function parseNumeroHA196(num){
  const m = String(num || '').trim().match(/^HA-(\d{4})-(\d+)$/i);
  if(!m) return null;
  return {year:Number(m[1]), n:Number(m[2])};
}
function maxNumeroGuardado196(year){
  return leerListaPresupuestos().reduce((max,p)=>{
    const info = parseNumeroHA196(p && p.numero);
    return info && info.year === year ? Math.max(max, info.n) : max;
  }, 0);
}
function avanzarContadorSiHaceFalta196(numero){
  const info = parseNumeroHA196(numero);
  if(!info) return;
  let data = leerJSON(STORAGE_CONTADOR, {year:info.year, n:1});
  if(data.year !== info.year) data = {year:info.year, n:1};
  if(Number(data.n || 1) <= info.n){
    data.n = info.n + 1;
    escribirJSON(STORAGE_CONTADOR, data);
  }
}

// Sustituye la numeración base por una que mira también los presupuestos guardados.
siguienteNumero = function(soloVer=false){
  const year = new Date().getFullYear();
  let data = leerJSON(STORAGE_CONTADOR, {year, n:1});
  if(data.year !== year) data = {year, n:1};
  const n = Math.max(Number(data.n || 1), maxNumeroGuardado196(year) + 1);
  const numero = `HA-${year}-${String(n).padStart(4,'0')}`;
  if(!soloVer){
    data = {year, n:n+1};
    escribirJSON(STORAGE_CONTADOR, data);
  }
  return numero;
};

const nuevoPresupuesto_BASE196 = nuevoPresupuesto;
nuevoPresupuesto = function(){
  nuevoPresupuesto_BASE196.apply(this, arguments);
  const saved = $('#presupuestosGuardados');
  if(saved) saved.value = '';
};

// Guardado seguro: nuevo = número único; recuperado = actualiza el recuperado.
guardar = function(){
  if(!Array.isArray(lineas) || lineas.length === 0){
    alert('Añade al menos un producto antes de guardar el presupuesto.');
    return;
  }

  let lista = leerListaPresupuestos();
  const savedSelect = $('#presupuestosGuardados');
  const selectedId = savedSelect ? String(savedSelect.value || '') : '';
  const selectedIdx = selectedId ? lista.findIndex(p => String(p.id) === selectedId) : -1;

  const data = datosPresupuesto();
  let numero = String(data.numero || '').trim();

  if(selectedIdx >= 0){
    // Estamos editando un presupuesto recuperado: se actualiza ese mismo.
    const duplicado = numero && lista.some((p,i)=>i !== selectedIdx && String(p.numero || '').trim() === numero);
    if(!numero || duplicado){
      numero = siguienteNumero(false);
      data.numero = numero;
      const inputNumero = $('#numero');
      if(inputNumero) inputNumero.value = numero;
    }else{
      avanzarContadorSiHaceFalta196(numero);
    }
    data.id = lista[selectedIdx].id;
    lista[selectedIdx] = data;
  }else{
    // Presupuesto nuevo: si el número ya existe, se asigna el siguiente automáticamente.
    const existe = numero && lista.some(p => String(p.numero || '').trim() === numero);
    if(!numero || existe){
      numero = siguienteNumero(false);
      data.numero = numero;
      const inputNumero = $('#numero');
      if(inputNumero) inputNumero.value = numero;
    }else{
      avanzarContadorSiHaceFalta196(numero);
    }
    data.id = Date.now().toString();
    data.guardado = new Date().toISOString();
    lista.unshift(data);
  }

  escribirListaPresupuestos(lista.slice(0,100));
  refrescarPresupuestosGuardados();
  if(savedSelect) savedSelect.value = data.id;
  alert(`Presupuesto guardado con número ${data.numero}.`);
};

// Duplicar siempre crea presupuesto nuevo, nunca pisa el original seleccionado.
duplicarPresupuesto = function(){
  if(!Array.isArray(lineas) || lineas.length === 0){
    alert('Añade al menos un producto antes de duplicar el presupuesto.');
    return;
  }
  const actual = datosPresupuesto();
  actual.id = Date.now().toString();
  actual.numero = siguienteNumero(false);
  actual.estado = 'Borrador';
  actual.fecha = new Date().toISOString().slice(0,10);
  actual.guardado = new Date().toISOString();
  const saved = $('#presupuestosGuardados');
  if(saved) saved.value = '';
  aplicarPresupuesto(actual);
  guardar();
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    const num = $('#numero');
    if(num && !String(num.value || '').trim()) num.value = siguienteNumero(true);
  }catch(e){}
});


function camaraDesc198(p, base){
  const n = normaliza((p && p.name) || '');
  if(!(n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam'))) return null;
  let tipo = n.includes('bulletcam') ? 'bullet' : (n.includes('domecam') ? 'domo' : 'turret/torreta');
  const mp = n.includes('-8-') || n.includes('cam-8') ? '8 Mp' : (n.includes('-4-') || n.includes('cam-4') ? '4 Mp' : (n.includes('-5-') || n.includes('cam-5') ? '5 Mp' : ''));
  const hl = n.includes('hlvf') || n.includes('-hl-') || n.includes('hl-') ? ' con iluminación híbrida' : '';
  let lente = '';
  if(n.includes('hlvf') || n.includes('-vf') || n.includes('vf-')) lente = 'objetivo varifocal 2,8–12 mm';
  else if(n.includes('0400')) lente = 'lente fija de 4 mm';
  else lente = 'lente fija de 2,8 mm';
  const mpTxt = mp ? ` ${mp}` : '';
  return {icon:'📷', desc:`Cámara IP Ajax tipo ${tipo}${mpTxt} con ${lente}${hl}, IA, True WDR y PoE/12 V`, family:(base&&base.family)||'Cámaras'};
}

const descripcionProducto_BASE198 = descripcionProducto;
descripcionProducto = function(p){
  const base = descripcionProducto_BASE198.apply(this, arguments);
  const cam = camaraDesc198(p, base);
  return cam || base;
};
function presupuestoTexto198(p){
  return normaliza([
    p && p.numero,
    p && p.cliente,
    p && p.telefono,
    p && p.email,
    p && p.fecha,
    p && p.estado,
    p && p.tienda,
    (p && Array.isArray(p.lineas)) ? p.lineas.map(l=>l.name).join(' ') : ''
  ].join(' '));
}
function ensureBudgetSearch198(){
  const sel = $('#presupuestosGuardados');
  if(!sel) return;
  let input = $('#buscarPresupuestoGuardado');
  if(!input){
    input = document.createElement('input');
    input.id = 'buscarPresupuestoGuardado';
    input.className = 'saved-search-input saved-search';
    input.placeholder = 'Buscar presupuesto...';
    input.autocomplete = 'off';
    input.title = 'Buscar por número, cliente, teléfono, fecha, tienda o producto';
    sel.parentNode.insertBefore(input, sel);
  }
  if(!input.dataset.searchBound){
    input.addEventListener('input',()=>refrescarPresupuestosGuardados());
    input.dataset.searchBound = '1';
  }
}

const refrescarPresupuestosGuardados_BASE198 = refrescarPresupuestosGuardados;
refrescarPresupuestosGuardados = function(){
  ensureBudgetSearch198();
  const sel = $('#presupuestosGuardados');
  if(!sel) return refrescarPresupuestosGuardados_BASE198.apply(this, arguments);
  const selected = sel.value;
  const q = normaliza($('#buscarPresupuestoGuardado')?.value || '').trim();
  let lista = leerListaPresupuestos().sort((a,b)=>String(b.guardado||'').localeCompare(String(a.guardado||'')));
  if(q){
    const parts = q.split(/\s+/).filter(Boolean);
    lista = lista.filter(p => parts.every(part => presupuestoTexto198(p).includes(part)));
  }
  sel.innerHTML = '<option value="">' + (q ? `Resultados: ${lista.length}` : 'Presupuestos guardados') + '</option>' + lista.map(p=>{
    const nombre = [p.numero || 'Sin número', p.cliente || 'Sin cliente', p.fecha || '', p.estado || ''].filter(Boolean).join(' · ');
    return `<option value="${escapeHtml(p.id)}">${escapeHtml(nombre)}</option>`;
  }).join('');
  if(selected && lista.some(p=>String(p.id)===String(selected))) sel.value = selected;
};

document.addEventListener('DOMContentLoaded',()=>{
  try{
    ensureBudgetSearch198();
    refrescarPresupuestosGuardados();
  }catch(e){}
});


function ref199(p){ return normaliza((p && p.name) || ''); }

function resumenProducto199(p){
  const n = ref199(p);
  const tags = [];
  if(n.includes('hub2plus')) tags.push('Hub 2 Plus', 'Wi-Fi', 'Ethernet', '2 SIM');
  else if(n.includes('hub2') && n.includes('4g')) tags.push('Hub 2', '4G/LTE', '2 SIM');
  else if(n.includes('hubbp')) tags.push('Hub BP', 'batería', '4G/LTE');
  else if(n.includes('hub') && !n.includes('bracket') && !n.includes('battery')) tags.push('Central Ajax');
  if(n.includes('kit')) tags.push('kit');

  if(n.includes('motioncam')) tags.push('movimiento con cámara');
  else if(n.includes('motionprotect')) tags.push('movimiento PIR');
  if(n.includes('phod')) tags.push('PhOD / fotoverificación');
  if(n.includes('doorprotect')) tags.push('apertura puerta/ventana');
  if(n.includes('curtain')) tags.push('tipo cortina');
  if(n.includes('glassprotect')) tags.push('rotura cristal');
  if(n.includes('fireprotect')) tags.push('incendio');
  if(n.includes('streetsiren')) tags.push('sirena exterior');
  if(n.includes('homesiren')) tags.push('sirena interior');
  if(n.includes('keypad')) tags.push('teclado');
  if(n.includes('spacecontrol')) tags.push('mando');
  if(n.includes('waterstop')) tags.push('válvula agua');
  if(n.includes('leaksprotect')) tags.push('inundación');

  if(n.includes('bulletcam')) tags.push('BulletCam');
  if(n.includes('domecam')) tags.push('DomeCam');
  if(n.includes('turretcam')) tags.push('TurretCam');
  if(n.includes('indoorcam')) tags.push('Wi-Fi interior');
  if(n.includes('nvr')) tags.push('NVR');
  if(n.includes('hlvf') || n.includes('-vf') || n.includes('vf-')) tags.push('varifocal 2,8–12 mm');
  else if((n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam')) && n.includes('0400')) tags.push('4 mm');
  else if(n.includes('bulletcam') || n.includes('domecam') || n.includes('turretcam')) tags.push('2,8 mm');
  if(n.includes('-8-') || n.includes('cam-8')) tags.push('8 MP');
  if(n.includes('-5-') || n.includes('cam-5')) tags.push('5 MP');
  if(n.includes('-4-') || n.includes('cam-4')) tags.push('4 MP');

  if(n.endsWith('-w') || n.includes('-w-')) tags.push('blanco');
  if(n.endsWith('-b') || n.includes('-b-')) tags.push('negro');
  return [...new Set(tags)].slice(0,5).join(' · ');
}
pintarResultados = function(term){
  const panel = $('#resultados');
  const results = hxBuscarComun(term);
  activeIndex = -1;
  if(!term.trim() || !results.length){
    panel.classList.add('hidden');
    panel.innerHTML='';
    panel.dataset.firstIndex='';
    return;
  }
  panel.dataset.firstIndex = String(results[0].i);
  panel.innerHTML = results.slice(0, 80).map((x,k)=>{
    const d = descripcionProducto(x.p);
    const extra = resumenProducto199(x.p);
    const meta = extra ? `${extra} · ${d.desc}` : d.desc;
    return `<div class="result-item result-item-pro" data-index="${x.i}" data-ref="${escapeHtml(x.p.name)}" data-pvp="${Number(x.p.pvp)}" data-k="${k}"><div><div class="result-name">${escapeHtml(x.p.name)}</div><div class="result-meta">${escapeHtml(meta)}</div></div><div class="result-price">${fmt.format(x.p.pvp)}</div></div>`;
  }).join('');
  // Cada consulta nueva empieza arriba; no mueve el scroll de la página.
  panel.scrollTop = 0;
  panel.querySelectorAll('.result-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ activeIndex = Number(el.dataset.k); marcarActivo(); });
    el.addEventListener('click',()=> seleccionarProductoSeguro(el.dataset.ref, el.dataset.pvp, true));
    el.addEventListener('dblclick',()=>{ seleccionarProductoSeguro(el.dataset.ref, el.dataset.pvp, true); addLinea(); });
  });
  panel.classList.remove('hidden');
};


function ref203(p){ return normaliza((p && p.name) || ''); }
function color203(n){
  if(/-w(\b|-|$)/.test(n)) return ' Blanco';
  if(/-b(\b|-|$)/.test(n)) return ' Negro';
  return '';
}
function descHubSeguro203(p){
  const n = ref203(p);
  if(!n) return null;

  // Accesorios de hub: nunca describir como central.
  if(n.includes('brackethub')){
    return {icon:'🧩', family:'Accesorios Ajax', official:'BracketHub', desc:'Soporte de montaje Ajax para Hub'+color203(n)};
  }
  if(n.includes('repairkithub')){
    return {icon:'🧩', family:'Accesorios Ajax', official:'RepairKitHub', desc:'Kit de reparación Ajax para Hub'+color203(n)};
  }
  if(n.includes('hubbatt') || n.includes('internalbattery')){
    return {icon:'🔋', family:'Baterías Ajax', official:'Batería Hub', desc:'Batería de repuesto Ajax para Hub'};
  }
  if(n.includes('hub') && n.includes('dummy')){
    return {icon:'📦', family:'Maquetas Ajax', official:'Hub Dummy', desc:'Carcasa/maqueta Ajax Hub sin electrónica'+color203(n)};
  }
  if(n.includes('minihub')){
    return {icon:'🧩', family:'Accesorios Ajax', official:'MiniHub', desc:'Accesorio Ajax MiniHub'+color203(n)};
  }

  // Kits con Hub: no son una central suelta.
  if(n.includes('hub2kit') || n.includes('hubkit') || n.includes('starterkit')){
    let hub = n.includes('hub2kit') ? 'Hub 2' : (n.includes('starterkitplus') ? 'Hub 2 Plus' : 'Hub');
    if(n.includes('4g')) hub += ' 4G';
    let partes = [];
    if(n.includes('mp')) partes.push('MotionProtect');
    if(n.includes('dp')) partes.push('DoorProtect');
    if(n.includes('phod')) partes.push('detectores con fotoverificación PhOD');
    if(n.includes('pro')) partes.push('accesorios profesionales');
    const extra = partes.length ? ' con '+partes.join(', ') : ' con accesorios de alarma';
    return {icon:'📦', family:'Kits Ajax', official:'HubKit', desc:`Kit de alarma Ajax ${hub}${extra}${color203(n)}`};
  }

  // Centrales Hub reales.
  if(/^aj-hub2plus/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub 2 Plus', desc:'Central de alarma profesional Ajax Hub 2 Plus - Grado 2. Admite Wi-Fi, Ethernet y dos tarjetas SIM (2G/3G/LTE)'+color203(n)};
  }
  if(/^aj-hub2-4g/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub 2 4G', desc:'Central de alarma profesional Ajax Hub 2 4G - Grado 2 con fotoverificación. Admite Ethernet y dos tarjetas SIM (2G/3G/LTE)'+color203(n)};
  }
  if(/^aj-hub2/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub 2', desc:'Central de alarma profesional Ajax Hub 2 - Grado 2 con fotoverificación. Admite Ethernet y dos tarjetas SIM (2G)'+color203(n)};
  }
  if(/^aj-hubbp/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub BP', desc:'Central de alarma profesional Ajax Hub BP alimentada por batería. Admite fotoverificación y dos tarjetas SIM (2G/3G/LTE)'+color203(n)};
  }
  if(/^aj-hub(?:-|$)/.test(n)){
    return {icon:'🏠', family:'Hubs Ajax', official:'Hub', desc:'Central de alarma profesional Ajax - Grado 2. Admite Ethernet y una tarjeta SIM (2G)'+color203(n)};
  }
  return null;
}

const descripcionProducto_BASE203 = descripcionProducto;
descripcionProducto = function(p){
  const hub = descHubSeguro203(p);
  if(hub) return hub;
  return descripcionProducto_BASE203.apply(this, arguments);
};
let catalogQuick204 = '';

const QUICK_CATALOG_204 = [
  {id:'cam', label:'📷 Cámaras', test:n=>/bulletcam|domecam|turretcam|indoorcam|doorbell/.test(n)},
  {id:'hub', label:'🏠 Hubs', test:n=>/^aj-hub/.test(n) && !/bracket|batt|battery|dummy|repair|kit/.test(n)},
  {id:'det', label:'🚨 Detectores', test:n=>/motionprotect|motioncam|doorprotect|glassprotect|combiprotect|curtain|outdoorprotect|fireprotect|leaksprotect|lifequality|seismoprotect/.test(n) && !/dummy|lens|bracket/.test(n)},
  {id:'sir', label:'📢 Sirenas', test:n=>/homesiren|streetsiren|speakerss/.test(n) && !/dummy|bracket/.test(n)},
  {id:'key', label:'⌨️ Teclados', test:n=>/keypad/.test(n) && !/dummy|bracket/.test(n)},
  {id:'dom', label:'💡 Domótica', test:n=>/lightcore|lightswitch|centerbutton|sidebutton|solobutton|centercove?r|sidecove?r|solocove?r|coverplate|outletcore|outletbasic|outletlan|socket|wallswitch|relay|multirelay|bypass|frame|surfacebox/.test(n)},
  {id:'nvr', label:'🎥 NVR', test:n=>/nvr/.test(n)},
  {id:'sup', label:'🧩 Soportes', test:n=>/junctionbox/.test(n)},
  {id:'out', label:'🌦️ Exterior', test:n=>/outdoor|street|doorbell|waterstop|curtainoutdoor/.test(n)},
  {id:'fire', label:'🔥 Incendio', test:n=>/fireprotect|manualcallpoint|en54/.test(n)},
  {id:'used', label:'🕒 Más usados', test:n=>/hub2plus|hub2-4g|motioncam|motionprotect|doorprotect|streetsiren|homesiren|keypad|nvr108|nvr116|bulletcam|domecam|turretcam/.test(n)}
];
function ensureQuickCatalog204(){
  const modal = document.getElementById('catalogModal');
  const row = modal ? modal.querySelector('.modal-search-row') : null;
  if(!row || document.getElementById('catalogQuick204')) return;
  const box = document.createElement('div');
  box.id = 'catalogQuick204';
  box.className = 'catalog-quick-panel';
  box.innerHTML = '<button type="button" class="quick-cat-chip active" data-q="">Todos</button>' +
    QUICK_CATALOG_204.map(x=>`<button type="button" class="quick-cat-chip" data-q="${x.id}">${x.label}</button>`).join('');
  const az = document.getElementById('catalogAZ');
  // Colocar acciones rápidas POR ENCIMA del A-Z
  if(az) az.insertAdjacentElement('beforebegin', box);
  else row.insertAdjacentElement('afterend', box);
  box.addEventListener('click', e=>{
    const btn = e.target.closest('.quick-cat-chip');
    if(!btn) return;
    catalogQuick204 = btn.dataset.q || '';
    document.querySelectorAll('.quick-cat-chip').forEach(b=>b.classList.toggle('active', b.dataset.q === catalogQuick204));
    pintarCatalogPanel(document.getElementById('catalogFilter')?.value || catalogTerm || '');
  });
}
const pintarCatalogPanel_BASE204 = pintarCatalogPanel;
pintarCatalogPanel = function(term=catalogTerm){
  ensureQuickCatalog204();
  pintarCatalogPanel_BASE204.apply(this, arguments);
  ensureQuickCatalog204();
  document.querySelectorAll('.quick-cat-chip').forEach(b=>b.classList.toggle('active', b.dataset.q === catalogQuick204));
};

const abrirCatalogo_BASE204 = typeof abrirCatalogo === 'function' ? abrirCatalogo : null;
if(abrirCatalogo_BASE204){
  abrirCatalogo = function(){
    catalogQuick204 = '';
    const r = abrirCatalogo_BASE204.apply(this, arguments);
    setTimeout(()=>{
      ensureQuickCatalog204();
      document.querySelectorAll('.quick-cat-chip').forEach(b=>b.classList.toggle('active', b.dataset.q === ''));
    }, 10);
    return r;
  };
}

document.addEventListener('DOMContentLoaded',()=>{
  try{
    ensureQuickCatalog204();
  }catch(e){}
});


const STORAGE_USO_PRODUCTOS_206 = 'hiperajax_productos_mas_usados_v206';

function leerUsoProductos206(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_USO_PRODUCTOS_206) || '{}') || {}; }
  catch(e){ return {}; }
}
function guardarUsoProductos206(data){
  try{ localStorage.setItem(STORAGE_USO_PRODUCTOS_206, JSON.stringify(data || {})); }
  catch(e){}
}
const HX_MAS_USADOS_DIAS=30;
function limpiarUsoProductosInexistentes206(lista=productos){
  try{
    const validas=new Set((Array.isArray(lista)?lista:[]).map(p=>String(p?.name||'').trim().toUpperCase()).filter(Boolean));
    const data=leerUsoProductos206(), ahora=Date.now(), limite=HX_MAS_USADOS_DIAS*24*60*60*1000;
    let cambio=false;
    Object.keys(data).forEach(ref=>{
      const last=Date.parse(String(data[ref]?.last||''))||0;
      if(!validas.has(String(ref).trim().toUpperCase()) || !last || (ahora-last)>limite){ delete data[ref]; cambio=true; }
    });
    if(cambio) guardarUsoProductos206(data);
    return data;
  }catch(e){ return leerUsoProductos206(); }
}
function registrarUsoProducto206(p){
  if(!p || !p.name) return;
  const key = String(p.name).trim();
  if(!key) return;
  const data = leerUsoProductos206();
  const item = data[key] || {count:0, last:''};
  item.count = (Number(item.count)||0) + 1;
  item.last = new Date().toISOString();
  data[key] = item;
  guardarUsoProductos206(data);
}
function listaMasUsados206(term=''){
  const data = limpiarUsoProductosInexistentes206(productos);
  const q = normaliza(term||'').trim();
  const rows = productos
    .map((p,i)=>({p,i,u:data[p.name]||null,n:normaliza(p.name)}))
    .filter(x=>x.u && (Number(x.u.count)||0) > 0)
    .filter(x=>!q || x.n.includes(q) || normaliza(descripcionProducto(x.p).desc).includes(q))
    .sort((a,b)=>(Number(b.u.count)||0)-(Number(a.u.count)||0) || String(b.u.last||'').localeCompare(String(a.u.last||'')) || a.p.name.localeCompare(b.p.name,'es'))
    .slice(0,80)
    .map(x=>({p:x.p,i:x.i,score:100000+(Number(x.u.count)||0)}));
  return rows;
}

const addProductoObj_BASE206 = addProductoObj;
addProductoObj = function(p, qty=1, dto=null){
  const ok = addProductoObj_BASE206.apply(this, arguments);
  if(ok) registrarUsoProducto206(p);
  return ok;
};
const pintarCatalogPanel_BASE206 = pintarCatalogPanel;
pintarCatalogPanel = function(term=catalogTerm){
  pintarCatalogPanel_BASE206.apply(this, arguments);
  try{
    if(typeof catalogQuick204 !== 'undefined' && catalogQuick204 === 'used'){
      const countWrap = document.querySelector('#catalogCount');
      const itemsWrap = document.querySelector('#catalogItems');
      const hasUsed = listaMasUsados206(term).length > 0;
      if(countWrap) countWrap.textContent = hasUsed ? countWrap.textContent + ' · por uso real' : '0 productos · añade productos para aprender';
      if(itemsWrap && !hasUsed){
        itemsWrap.innerHTML = '<div class="catalog-empty">Todavía no hay estadísticas. Añade productos y este filtro aprenderá tus más usados.</div>';
      }
    }
  }catch(e){}
};


(function(){
  function orderCatalogFilters207(){
    const row=document.querySelector('#catalogModal .modal-search-row');
    const quick=document.getElementById('catalogQuick204');
    const az=document.getElementById('catalogAZ');
    if(!row) return;
    if(quick && quick.previousElementSibling !== row){
      row.insertAdjacentElement('afterend', quick);
    }
    if(quick && az && az.previousElementSibling !== quick){
      quick.insertAdjacentElement('afterend', az);
    }else if(!quick && az && az.previousElementSibling !== row){
      row.insertAdjacentElement('afterend', az);
    }
  }
  const _ensureQuick = typeof ensureQuickCatalog204 === 'function' ? ensureQuickCatalog204 : null;
  if(_ensureQuick){
    ensureQuickCatalog204 = function(){
      const r=_ensureQuick.apply(this, arguments);
      orderCatalogFilters207();
      return r;
    };
  }
  const _ensureAZ = typeof ensureAlphabet193 === 'function' ? ensureAlphabet193 : null;
  if(_ensureAZ){
    ensureAlphabet193 = function(){
      const r=_ensureAZ.apply(this, arguments);
      orderCatalogFilters207();
      return r;
    };
  }
  const _pintar = typeof pintarCatalogPanel === 'function' ? pintarCatalogPanel : null;
  if(_pintar){
    pintarCatalogPanel = function(){
      const r=_pintar.apply(this, arguments);
      setTimeout(orderCatalogFilters207,0);
      return r;
    };
  }
  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(orderCatalogFilters207,50); });
})();


(function(){
  function ensureCatalogHosts208(){
    const modal = document.getElementById('catalogModal');
    const row = modal ? modal.querySelector('.modal-search-row') : null;
    const items = document.getElementById('catalogItems');
    if(!row || !items) return null;

    let wrap = document.getElementById('catalogTopFilters208');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'catalogTopFilters208';
      wrap.className = 'catalog-top-filters';
      wrap.innerHTML = '<div id="catalogQuickHost208"></div><div id="catalogAZHost208"></div>';
      row.insertAdjacentElement('afterend', wrap);
    }

    // Asegurar que el bloque completo siempre queda justo después del buscador.
    if(wrap.previousElementSibling !== row){
      row.insertAdjacentElement('afterend', wrap);
    }
    return wrap;
  }

  function placeCatalogFilters208(){
    const wrap = ensureCatalogHosts208();
    if(!wrap) return;
    const quick = document.getElementById('catalogQuick204');
    const az = document.getElementById('catalogAZ');
    const quickHost = document.getElementById('catalogQuickHost208');
    const azHost = document.getElementById('catalogAZHost208');

    if(quick && quickHost && quick.parentElement !== quickHost){
      quickHost.appendChild(quick);
    }
    if(az && azHost && az.parentElement !== azHost){
      azHost.appendChild(az);
    }

    if(quickHost) quickHost.style.display = '';
  }

  document.addEventListener('click', (e)=>{
    if(e.target.closest('#btnCatalogo')){
      setTimeout(placeCatalogFilters208, 0);
      setTimeout(placeCatalogFilters208, 40);
    }
  }, true);

  const _ensureAZ208 = typeof ensureAlphabet193 === 'function' ? ensureAlphabet193 : null;
  if(_ensureAZ208){
    ensureAlphabet193 = function(){
      const r = _ensureAZ208.apply(this, arguments);
      placeCatalogFilters208();
      return r;
    };
  }

  const _ensureQuick208 = typeof ensureQuickCatalog204 === 'function' ? ensureQuickCatalog204 : null;
  if(_ensureQuick208){
    ensureQuickCatalog204 = function(){
      const r = _ensureQuick208.apply(this, arguments);
      placeCatalogFilters208();
      return r;
    };
  }

  const _pintar208 = typeof pintarCatalogPanel === 'function' ? pintarCatalogPanel : null;
  if(_pintar208){
    pintarCatalogPanel = function(){
      const r = _pintar208.apply(this, arguments);
      placeCatalogFilters208();
      return r;
    };
  }

  const _abrirCatalogo208 = typeof abrirCatalogo === 'function' ? abrirCatalogo : null;
  if(_abrirCatalogo208){
    abrirCatalogo = function(){
      const r = _abrirCatalogo208.apply(this, arguments);
      setTimeout(placeCatalogFilters208, 0);
      setTimeout(placeCatalogFilters208, 40);
      return r;
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(placeCatalogFilters208, 60);
  });
})();


(function(){
  function ensureTopFilterHost2016(){
    const modal = document.getElementById('catalogModal');
    const row = modal ? modal.querySelector('.modal-search-row') : null;
    if(!row) return null;

    let wrap = document.getElementById('catalogTopFilters208') || document.getElementById('catalogTopFilters2016');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'catalogTopFilters2016';
      wrap.className = 'catalog-top-filters';
      wrap.innerHTML = '<div id="catalogQuickHost208"></div><div id="catalogAZHost208"></div>';
    }

    if(wrap.previousElementSibling !== row){
      row.insertAdjacentElement('afterend', wrap);
    }

    if(!document.getElementById('catalogQuickHost208')){
      const qh = document.createElement('div');
      qh.id = 'catalogQuickHost208';
      wrap.appendChild(qh);
    }
    if(!document.getElementById('catalogAZHost208')){
      const ah = document.createElement('div');
      ah.id = 'catalogAZHost208';
      wrap.appendChild(ah);
    }
    return wrap;
  }

  function placeFilters2016(){
    const wrap = ensureTopFilterHost2016();
    if(!wrap) return;

    const quick = document.getElementById('catalogQuick204');
    const az = document.getElementById('catalogAZ');
    const quickHost = document.getElementById('catalogQuickHost208');
    const azHost = document.getElementById('catalogAZHost208');

    if(quick && quickHost && quick.parentElement !== quickHost){
      quickHost.appendChild(quick);
    }
    if(az && azHost && az.parentElement !== azHost){
      azHost.appendChild(az);
    }

    if(quickHost) quickHost.style.display = '';
  }

  function placeFiltersSoon2016(){
    placeFilters2016();
    setTimeout(placeFilters2016, 0);
    setTimeout(placeFilters2016, 40);
    setTimeout(placeFilters2016, 120);
  }

  document.addEventListener('click', (e)=>{
    if(e.target.closest('#btnCatalogo')) placeFiltersSoon2016();
    if(e.target.closest('.quick-cat-chip') || e.target.closest('.az-chip')){
      placeFiltersSoon2016();
    }
  }, true);

  document.addEventListener('input', (e)=>{
    if(e.target && e.target.id === 'catalogFilter') placeFiltersSoon2016();
  }, true);

  const _pintar2016 = typeof pintarCatalogPanel === 'function' ? pintarCatalogPanel : null;
  if(_pintar2016){
    pintarCatalogPanel = function(){
      const r = _pintar2016.apply(this, arguments);
      placeFiltersSoon2016();
      return r;
    };
  }

  const _abrirCatalogo2016 = typeof abrirCatalogo === 'function' ? abrirCatalogo : null;
  if(_abrirCatalogo2016){
    abrirCatalogo = function(){
      const r = _abrirCatalogo2016.apply(this, arguments);
      placeFiltersSoon2016();
      return r;
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(placeFilters2016, 80);
  });
})();

/* =====================================================
   EXPLORER PRO
   La interfaz y navegación viven en explorer.js.
   ===================================================== */

/* =====================================================
   v4.1.5 - Recuperación robusta y gestor móvil espacioso
   - MongoDB como fuente mediante leerListaPresupuestos().
   - Carpetas Recientes / Todos / Tiendas / Comerciales.
   - Filtros combinables y tarjetas adaptativas.
   ===================================================== */
(function(){
  let pmSelectedId='';
  let pmView={type:'recent',value:''};
  const byId=id=>document.getElementById(id);
  const PM_ICON={
    warning:'<span class="pmx-nav-icon pmx-nav-warning" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17.3v.2"/></svg></span>',
    store:'<span class="pmx-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 9h16v11H4zM3 9l2-5h14l2 5"/><path d="M8 20v-6h4v6M3 9c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/></svg></span>',
    person:'<span class="pmx-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4.3 3.3-7 8-7s7.3 2.7 8 7"/></svg></span>',
    calendar:'<span class="pmx-inline-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg></span>',
    folder:'<span class="pmx-inline-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h7l2 2h9v11H3z"/></svg></span>',
    search:'<span class="pmx-inline-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span>',
    document:'<span class="pmx-document-svg" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></svg></span>',
    package:'<span class="pmx-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m4 7 8-4 8 4-8 4z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></svg></span>'
  };
  const modal=()=>byId('pmModal');
  const rows=p=>Array.isArray(p?.lineas)?p.lineas.filter(l=>l&&!l.separador&&l.tipo!=='separador'):[];
  const qty=l=>Math.max(0,Number(l?.qty??l?.cantidad??l?.cant)||0);
  const product=l=>String(l?.name??l?.nombre??l?.producto??l?.descripcion??l?.ref??'Producto');
  const identifier=p=>String(p?.identificador||'').trim();
  const title=p=>identifier(p)||String(p?.numero||'Sin identificar');
  const idOf=p=>String(p?.id||p?.mongoId||p?._id||'');
  const listAll=()=>{try{return typeof leerListaPresupuestos==='function'?(leerListaPresupuestos()||[]):[]}catch(e){return[]}};
  const modified=p=>String(p?.updatedAt||p?.guardado||p?.createdAt||p?.fecha||'');
  function calc(p){let base=0;rows(p).forEach(l=>{const price=Number(l.pvp)||0,d= Math.min(100,Math.max(0,Number(l.dto??l.descuento)||0));base+=price*qty(l)*(1-d/100)});base*=1-Math.min(100,Math.max(0,Number(p?.dtoGeneral)||0))/100;return {count:rows(p).length,total:base*(1+Math.max(0,Number(p?.iva)||0)/100)}}
  function date(v){if(!v)return 'Sin fecha';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)}
  function searchText(p){
    const rawDate=String(p?.fecha||modified(p)||'');
    const shownDate=date(rawDate);
    const productText=rows(p).map(product).join(' ');
    return [identifier(p),p?.numero,p?.cliente,p?.telefono,p?.email,p?.tienda,p?.comercial,rawDate,shownDate,productText].filter(Boolean).join(' ').toLowerCase();
  }
  function pmDateValue(p){
    const raw=String(p?.fecha||modified(p)||'').trim();
    if(!raw)return null;
    const iso=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(iso)return new Date(Number(iso[1]),Number(iso[2])-1,Number(iso[3]));
    const es=raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
    if(es)return new Date(Number(es[3]),Number(es[2])-1,Number(es[1]));
    const d=new Date(raw);return Number.isNaN(d.getTime())?null:new Date(d.getFullYear(),d.getMonth(),d.getDate());
  }
  function pmDayStart(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
  function pmDateBounds(mode){
    const today=pmDayStart(new Date());
    if(mode==='today')return [today,today];
    if(mode==='7days'){const from=new Date(today);from.setDate(from.getDate()-6);return [from,today]}
    if(mode==='month')return [new Date(today.getFullYear(),today.getMonth(),1),today];
    if(mode==='prevmonth')return [new Date(today.getFullYear(),today.getMonth()-1,1),new Date(today.getFullYear(),today.getMonth(),0)];
    if(mode==='custom'){
      const from=byId('pmDateFrom')?.value,to=byId('pmDateTo')?.value;
      return [from?pmDayStart(new Date(from+'T00:00:00')):null,to?pmDayStart(new Date(to+'T00:00:00')):null];
    }
    return [null,null];
  }
  function pmMatchesDate(p){
    const mode=byId('pmFilterDate')?.value||'';if(!mode)return true;
    const d=pmDateValue(p);if(!d)return false;
    const [from,to]=pmDateBounds(mode);if(from&&d<from)return false;if(to&&d>to)return false;return true;
  }
  function pmDateLabel(){
    const mode=byId('pmFilterDate')?.value||'';
    if(mode==='today')return 'Hoy';if(mode==='7days')return 'Últimos 7 días';if(mode==='month')return 'Este mes';if(mode==='prevmonth')return 'Mes anterior';
    if(mode==='custom'){
      const f=byId('pmDateFrom')?.value,t=byId('pmDateTo')?.value;
      return f||t?`Fecha: ${f?date(f):'…'} – ${t?date(t):'…'}`:'Rango personalizado';
    }
    return '';
  }
  function pmSyncDateRange(){const range=byId('pmDateRange');if(range)range.hidden=(byId('pmFilterDate')?.value!=='custom')}
  function pmActiveFilterCount(){
    const store=byId('pmFilterStore')?.value||'', commercial=byId('pmFilterCommercial')?.value||'', mode=byId('pmFilterDate')?.value||'';
    const dateActive=mode==='custom' ? !!(byId('pmDateFrom')?.value||byId('pmDateTo')?.value) : !!mode;
    return (store?1:0)+(commercial?1:0)+(dateActive?1:0);
  }
  function pmSyncFiltersUI(){
    const panel=byId('pmAdvancedFilters'),toggle=byId('pmFiltersToggle'),badge=byId('pmFiltersBadge'),toolbar=modal()?.querySelector('.pmx-toolbar');
    const count=pmActiveFilterCount();
    if(badge){badge.textContent=String(count);badge.hidden=!count}
    const open=!!panel && !panel.hidden;
    toggle?.classList.toggle('is-active',!!count || open);
    toggle?.setAttribute('aria-expanded',open?'true':'false');
    toolbar?.classList.toggle('pmx-filters-open',open);
  }
  function selected(){return listAll().find(p=>idOf(p)===String(pmSelectedId))||null}
  function unique(field){return [...new Set(listAll().map(p=>String(p?.[field]||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es',{numeric:true}))}
  function countBy(field,value){return listAll().filter(p=>String(p?.[field]||'').trim()===String(value||'').trim()).length}
  function syncFilters(){
    const all=listAll();
    const store=byId('pmFilterStore'), commercial=byId('pmFilterCommercial');
    const oldS=store?.value||'',oldC=(commercial?.value==='__NONE__'?'':(commercial?.value||''));
    if(store){store.innerHTML='<option value="">Todas las tiendas</option>'+unique('tienda').map(x=>`<option>${escapeHtml(x)}</option>`).join('');store.value=oldS}
    if(commercial){commercial.innerHTML='<option value="">Todos los comerciales</option>'+unique('comercial').map(x=>`<option>${escapeHtml(x)}</option>`).join('');commercial.value=oldC}
    const sf=byId('pmStoreFolders'),cf=byId('pmCommercialFolders');
    if(sf)sf.innerHTML=unique('tienda').map(x=>`<button type="button" class="pmx-folder pmx-folder-child" data-pm-view="store" data-pm-value="${escapeHtml(x)}">${PM_ICON.store}<span>${escapeHtml(x)}</span><b class="pmx-folder-count">(${countBy('tienda',x)})</b></button>`).join('');
    if(cf)cf.innerHTML=unique('comercial').map(x=>`<button type="button" class="pmx-folder pmx-folder-child" data-pm-view="commercial" data-pm-value="${escapeHtml(x)}">${PM_ICON.person}<span>${escapeHtml(x)}</span><b class="pmx-folder-count">(${countBy('comercial',x)})</b></button>`).join('');
    const pending=byId('pmPendingFolders');
    if(pending){
      const missingStore=all.filter(p=>!String(p.tienda||'').trim()).length;
      pending.innerHTML=missingStore
        ? `<button type="button" class="pmx-folder pmx-folder-child" data-pm-view="missing-store">${PM_ICON.folder}<span>Sin tienda</span><b class="pmx-folder-count">(${missingStore})</b></button>`
        : '';
    }
    const recent=byId('pmFolderRecentCount'),total=byId('pmFolderAllCount');
    if(recent)recent.textContent=`(${Math.min(20,all.length)})`;
    if(total)total.textContent=`(${all.length})`;
  }
  function filtered(){
    let list=listAll().slice();
    if(pmView.type==='store')list=list.filter(p=>String(p.tienda||'').trim()===pmView.value);
    else if(pmView.type==='commercial')list=list.filter(p=>String(p.comercial||'').trim()===pmView.value);
    else if(pmView.type==='missing-store')list=list.filter(p=>!String(p.tienda||'').trim());
    const s=byId('pmFilterStore')?.value||'',c=byId('pmFilterCommercial')?.value||'';
    if(s==='__NONE__')list=list.filter(p=>!String(p.tienda||'').trim());else if(s)list=list.filter(p=>String(p.tienda||'').trim()===s);
    if(c==='__NONE__')list=list.filter(p=>!String(p.comercial||'').trim());else if(c)list=list.filter(p=>String(p.comercial||'').trim()===c);
    list=list.filter(pmMatchesDate);
    const q=String(byId('pmSearch')?.value||'').trim().toLowerCase();if(q.length>=2)list=list.filter(p=>q.split(/\s+/).every(part=>searchText(p).includes(part)));
    const sort=byId('pmSort')?.value||'recent';
    if(sort==='identifier')list.sort((a,b)=>title(a).localeCompare(title(b),'es',{numeric:true}));
    else if(sort==='client')list.sort((a,b)=>String(a.cliente||'').localeCompare(String(b.cliente||''),'es'));
    else if(sort==='total')list.sort((a,b)=>calc(b).total-calc(a).total);
    else list.sort((a,b)=>modified(b).localeCompare(modified(a)));
    if(pmView.type==='recent')list=list.slice(0,20);
    return list;
  }
  function markFolder(){
    document.querySelectorAll('#pmModal .pmx-folder').forEach(b=>{
      const sameType=b.dataset.pmView===pmView.type;
      const needsValue=pmView.type==='store'||pmView.type==='commercial';
      const active=sameType&&(!needsValue||b.dataset.pmValue===pmView.value);
      b.classList.toggle('is-active',active);
      b.dataset.pmActive=active?'true':'false';
      b.setAttribute('aria-current',active?'page':'false');
      // El estado activo se dibuja con CSS. No insertar un cuarto elemento en
      // la rejilla: quitaba espacio al nombre de tiendas largas como Valencia.
      b.querySelector('.pmx-active-mark')?.remove();
    });
  }
  function updateFilterNotice(){
    pmSyncFiltersUI();
    const box=byId('pmFilterNotice');if(!box)return;
    const parts=[];
    if(pmView.type==='recent')parts.push('Recientes');
    else if(pmView.type==='all')parts.push('Todos');
    else if(pmView.type==='store')parts.push(`Tienda: ${pmView.value}`);
    else if(pmView.type==='commercial')parts.push(`Comercial: ${pmView.value}`);
    else if(pmView.type==='missing-store')parts.push('Sin tienda');
    const store=byId('pmFilterStore')?.value||'',commercial=byId('pmFilterCommercial')?.value||'',q=String(byId('pmSearch')?.value||'').trim(),dateMode=byId('pmFilterDate')?.value||'';
    const validQuery=q.length>=2;
    if(store)parts.push(store==='__NONE__'?'Sin tienda':`Tienda: ${store}`);
    if(commercial)parts.push(commercial==='__NONE__'?'Sin comercial':`Comercial: ${commercial}`);
    if(dateMode && (dateMode!=='custom' || byId('pmDateFrom')?.value || byId('pmDateTo')?.value))parts.push(pmDateLabel());
    if(validQuery)parts.push(`Búsqueda: “${q}”`);
    const active=pmView.type!=='recent'||store||commercial||dateMode||validQuery;
    box.classList.toggle('is-filtered',!!active);
    box.hidden=!active;
    if(!active){box.innerHTML='';return}
    box.innerHTML=`<span>${PM_ICON.search} Filtrando: <strong>${escapeHtml(parts.join(' · ')||'Recientes')}</strong></span><button type="button" id="pmClearFilters">Limpiar filtros</button>`;
    byId('pmClearFilters')?.addEventListener('click',()=>{pmView={type:'recent',value:''};if(byId('pmFilterStore'))byId('pmFilterStore').value='';if(byId('pmFilterCommercial'))byId('pmFilterCommercial').value='';if(byId('pmFilterDate'))byId('pmFilterDate').value='';if(byId('pmDateFrom'))byId('pmDateFrom').value='';if(byId('pmDateTo'))byId('pmDateTo').value='';if(byId('pmSearch'))byId('pmSearch').value='';pmSyncDateRange();clearSelection();render()});
  }
  function clearMobileInlineState(){
    const m=modal();if(!m)return;
    ['.pmx-preview','.pmx-actions','.pmx-browser','.pmx-folders','.pmx-toolbar','.pmx-filter-notice'].forEach(selector=>{
      const el=m.querySelector(selector);if(!el)return;
      ['display','visibility','opacity'].forEach(prop=>el.style.removeProperty(prop));
    });
  }
  function clearSelection(){
    pmSelectedId='';
    window.HX_PM_SELECTED_ID='';
    const s=byId('presupuestosGuardados');if(s)s.value='';
    document.querySelectorAll('#pmModal .pmx-row.is-selected').forEach(r=>r.classList.remove('is-selected'));
    clearMobileInlineState();
    modal()?.classList.remove('pm-has-selection','pm-mobile-preview');
    preview();
  }
  function resetManagerView({preserveSearch=false}={}){
    pmSelectedId='';
    window.HX_PM_SELECTED_ID='';
    pmView={type:'recent',value:''};
    const m=modal();
    clearMobileInlineState();
    m?.classList.remove('pm-mobile-preview','pm-mobile-list','pm-has-selection');
    const select=byId('presupuestosGuardados');if(select)select.value='';
    if(!preserveSearch && byId('pmSearch'))byId('pmSearch').value='';
    if(byId('pmFilterStore'))byId('pmFilterStore').value='';
    if(byId('pmFilterCommercial'))byId('pmFilterCommercial').value='';
    if(byId('pmFilterDate'))byId('pmFilterDate').value='';
    if(byId('pmDateFrom'))byId('pmDateFrom').value='';
    if(byId('pmDateTo'))byId('pmDateTo').value='';
    pmSyncDateRange();
    if(byId('pmSort'))byId('pmSort').value='recent';
    document.querySelectorAll('#pmModal .pmx-row.is-selected').forEach(r=>r.classList.remove('is-selected'));
    ['pmOpen','pmDuplicate','pmPdf','pmRename','pmDelete'].forEach(id=>{const b=byId(id);if(b)b.disabled=true});
    const list=byId('pmList');if(list)list.scrollTop=0;
    const browser=m?.querySelector('.pmx-browser');if(browser)browser.scrollTop=0;
    preview();
  }
  function preview(){
    const p=selected(),root=byId('pmPreview'),head=byId('pmPreviewTitle'),active=!!p;
    ['pmOpen','pmDuplicate','pmPdf','pmRename','pmDelete'].forEach(id=>{const e=byId(id);if(e)e.disabled=!active});
    modal()?.classList.toggle('pm-has-selection',active);
    if(!root||!head)return;
    if(!p){head.textContent='Selecciona un presupuesto';root.className='pmx-preview-body pmx-preview-empty';root.innerHTML=`<div class="pmx-empty-icon">${PM_ICON.document}</div><strong>Selecciona un presupuesto</strong><p>Aquí verás sus datos antes de recuperarlo.</p>`;return}
    const c=calc(p),r=rows(p),shown=r.slice(0,5);head.textContent=title(p);
    root.className='pmx-preview-body pmx-preview-pro';root.innerHTML=`<div class="pmx-identity"><span class="pmx-document-icon">${PM_ICON.document}</span><div><p class="pmx-id-number">${escapeHtml(p.numero||'Sin número')} · ${escapeHtml(date(p.fecha||modified(p)))}</p></div></div><dl class="pmx-meta"><div>${PM_ICON.person}<span><dt>Cliente</dt><dd>${escapeHtml(p.cliente||'Sin cliente')}</dd></span></div><div>${PM_ICON.store}<span><dt>Tienda</dt><dd>${escapeHtml(p.tienda||'Sin tienda')}</dd></span></div><div>${PM_ICON.person}<span><dt>Comercial</dt><dd>${escapeHtml(p.comercial||'Sin asignar')}</dd></span></div><div>${PM_ICON.package}<span><dt>Productos</dt><dd>${c.count}</dd></span></div></dl><div class="pmx-total"><span>Total</span><strong>${fmt.format(c.total)}</strong></div><div class="pmx-products"><div class="pmx-products-title"><span>Productos <b>(${c.count})</b></span>${r.length>5?`<small>Ver ${r.length} productos</small>`:''}</div><ul>${shown.length?shown.map(l=>`<li><span>${escapeHtml(product(l))}</span><b>x${qty(l)||1}</b></li>`).join(''):'<li class="pmx-no-products">Sin productos</li>'}</ul></div>`;
  }
  function render(){
    syncFilters();markFolder();updateFilterNotice();const all=listAll(),list=filtered(),root=byId('pmList');
    if(byId('pmCount'))byId('pmCount').textContent=`${all.length} ${all.length===1?'guardado':'guardados'}`;
    if(byId('pmVisibleCount'))byId('pmVisibleCount').textContent=`${list.length} visibles`;
    if(!root)return;if(pmSelectedId&&!all.some(p=>idOf(p)===pmSelectedId))pmSelectedId='';
    if(!list.length){window.HX_PM_SELECTED_ID='';root.innerHTML=`<div class="pmx-list-empty"><span>${PM_ICON.document}</span><strong>No hay presupuestos</strong><small>Cambia la carpeta o los filtros.</small></div>`;pmSelectedId='';preview();return}
    root.innerHTML=list.map(p=>{const c=calc(p),id=idOf(p),sel=id===pmSelectedId;return `<button type="button" class="pmx-row${sel?' is-selected':''}" data-pm-id="${escapeHtml(id)}"><span class="pmx-row-icon">${PM_ICON.document}</span><span class="pmx-row-main"><strong class="pmx-card-identifier${identifier(p)?'':' is-empty'}">${escapeHtml(identifier(p)||'Sin identificador')}</strong><b class="pmx-card-number">${escapeHtml(p.numero||'Sin número')}</b><small class="pmx-card-client">${PM_ICON.person}<span>Cliente:</span> ${escapeHtml(p.cliente||'Sin cliente')}</small><span class="pmx-card-fields"><em>${PM_ICON.store}${escapeHtml(p.tienda||'')}</em><em>${PM_ICON.person}${escapeHtml(p.comercial||'')}</em><em>${PM_ICON.calendar}${escapeHtml(date(p.fecha||modified(p)))}</em></span></span><span class="pmx-row-side"><strong>${fmt.format(c.total)}</strong><small>${c.count} productos</small></span></button>`}).join('');
    root.querySelectorAll('.pmx-row').forEach(row=>row.addEventListener('click',()=>{
      // En PC selecciona; en móvil abre una vista previa separada antes de recuperar.
      pmSelectedId=row.dataset.pmId||'';
      window.HX_PM_SELECTED_ID=pmSelectedId;
      const s=byId('presupuestosGuardados');if(s)s.value=pmSelectedId;
      render();
      if(matchMedia('(max-width:900px)').matches){
        const m=modal();
        m?.classList.add('pm-mobile-list','pm-mobile-preview','pm-has-selection');
        const previewPanel=m?.querySelector('.pmx-preview');
        const actions=m?.querySelector('.pmx-actions');
        const browser=m?.querySelector('.pmx-browser');
        const folders=m?.querySelector('.pmx-folders');
        const toolbar=m?.querySelector('.pmx-toolbar');
        const notice=m?.querySelector('.pmx-filter-notice');
        previewPanel?.style.setProperty('display','flex','important');
        previewPanel?.style.setProperty('visibility','visible','important');
        previewPanel?.style.setProperty('opacity','1','important');
        actions?.style.setProperty('display','grid','important');
        browser?.style.setProperty('display','none','important');
        folders?.style.setProperty('display','none','important');
        toolbar?.style.setProperty('display','none','important');
        notice?.style.setProperty('display','none','important');
      }
    }));preview();
  }
  async function pdfSelected(){
    const p=selected();
    if(!p) return;
    const snapshot=datosPresupuesto();
    const activeId=window.HX_ACTIVE_BUDGET_ID;
    try{
      aplicarPresupuesto(p);
      await pdf();
    }finally{
      aplicarPresupuesto(snapshot);
      window.HX_ACTIVE_BUDGET_ID=activeId;
    }
  }
  async function show(){
    const m=modal();if(!m)return;
    resetManagerView();
    m.classList.remove('hidden');m.setAttribute('aria-hidden','false');
    try{window.HX_LOADING_SHOW?.('Cargando presupuestos...');await window.HX_RECARGAR_PRESUPUESTOS?.({silencioso:true,forzar:true})}catch(e){}finally{window.HX_LOADING_HIDE?.()}
    render();
    if(!matchMedia('(max-width:900px)').matches) setTimeout(()=>byId('pmSearch')?.focus(),30);
  }
  function hide(){
    const m=modal();if(!m)return;
    resetManagerView();
    m.classList.add('hidden');m.setAttribute('aria-hidden','true');
    render();
  }
  document.addEventListener('DOMContentLoaded',()=>{
    byId('btnBudgets')?.addEventListener('click',show);byId('pmPdf')?.addEventListener('click',()=>{pdfSelected().catch(error=>{console.error('[Hiper Ajax] PDF guardado:',error);alert('No se pudo generar el PDF del presupuesto.');});});byId('pmClose')?.addEventListener('click',hide);byId('pmBackdrop')?.addEventListener('click',hide);byId('pmBackMobile')?.addEventListener('click',()=>{
      clearSelection();
      const m=modal();
      m?.classList.remove('pm-mobile-preview','pm-has-selection');
      m?.classList.add('pm-mobile-list');
      render();
    });
    byId('pmMobileBackFilters')?.addEventListener('click',()=>{
      const m=modal();
      m?.classList.remove('pm-mobile-list','pm-mobile-preview','pm-has-selection');
      pmSelectedId='';
      window.HX_PM_SELECTED_ID='';
      const s=byId('presupuestosGuardados');if(s)s.value='';
      preview();
    });
    // Buscador del gestor:
    // - PC mantiene búsqueda automática con debounce.
    // - Móvil NO salta mientras se escribe: el usuario confirma con "Buscar"
    //   o con Enter. Así puede pensar, corregir y borrar sin que cambie de pantalla.
    let pmSearchTimer=null;
    const runMobileSearch=()=>{
      const q=String(byId('pmSearch')?.value||'').trim();
      if(q.length<2){
        updateFilterNotice();
        byId('pmSearch')?.focus();
        return;
      }
      clearSelection();
      render();
      modal()?.classList.add('pm-mobile-list');
    };
    byId('pmSearchMobileGo')?.addEventListener('click',runMobileSearch);
    byId('pmSearch')?.addEventListener('keydown',e=>{
      if(e.key==='Enter' && matchMedia('(max-width:900px)').matches){
        e.preventDefault();
        runMobileSearch();
      }
    });
    byId('pmSearch')?.addEventListener('input',()=>{
      clearTimeout(pmSearchTimer);
      const q=String(byId('pmSearch')?.value||'').trim();
      const mobileSearch=matchMedia('(max-width:900px)').matches;
      if(mobileSearch){
        // En móvil escribir nunca navega ni filtra por sí solo.
        updateFilterNotice();
        return;
      }
      if(q.length===1){updateFilterNotice();return;}
      if(q.length===0){clearSelection();render();return;}
      pmSearchTimer=setTimeout(()=>{clearSelection();render();},320);
    });
    byId('pmFiltersToggle')?.addEventListener('click',()=>{
      const panel=byId('pmAdvancedFilters');if(!panel)return;
      panel.hidden=!panel.hidden;pmSyncFiltersUI();
    });
    ['pmFilterStore','pmFilterCommercial','pmSort'].forEach(id=>byId(id)?.addEventListener('change',()=>{
      clearSelection();render();if(matchMedia('(max-width:900px)').matches) modal()?.classList.add('pm-mobile-list');
    }));
    byId('pmFilterDate')?.addEventListener('change',()=>{
      pmSyncDateRange();clearSelection();render();
      if(matchMedia('(max-width:900px)').matches && byId('pmFilterDate')?.value!=='custom') modal()?.classList.add('pm-mobile-list');
    });
    ['pmDateFrom','pmDateTo'].forEach(id=>byId(id)?.addEventListener('change',()=>{clearSelection();render();if(matchMedia('(max-width:900px)').matches) modal()?.classList.add('pm-mobile-list')}));
    pmSyncDateRange();pmSyncFiltersUI();
    byId('pmList')?.addEventListener('dblclick',async e=>{if(matchMedia('(max-width:900px)').matches)return;const r=e.target.closest('.pmx-row');if(r){pmSelectedId=r.dataset.pmId||'';const s=byId('presupuestosGuardados');if(s)s.value=pmSelectedId;await window.HX_ABRIR_PRESUPUESTO?.(pmSelectedId);}});
    byId('pmModal')?.addEventListener('click',e=>{const b=e.target.closest('.pmx-folder');if(!b)return;pmView={type:b.dataset.pmView||'all',value:b.dataset.pmValue||''};if(pmView.type==='store'&&byId('pmFilterStore'))byId('pmFilterStore').value='';if(pmView.type==='commercial'&&byId('pmFilterCommercial'))byId('pmFilterCommercial').value='';clearSelection();render();if(matchMedia('(max-width:900px)').matches)modal()?.classList.add('pm-mobile-list')});
    window.addEventListener('hiperajax:presupuestos-importados',render);window.addEventListener('hiperajax:identificador-cambiado',render);
  });
  // Móvil: volver desde la lista (también cuando una búsqueda no devuelve nada)
  // debe regresar a la pantalla principal del gestor, no dejar al usuario en
  // una vista de "Recientes" arrastrando la búsqueda anterior.
  window.HX_PM_MOBILE_HOME=(options={})=>{
    resetManagerView(options);
    render();
  };
  window.HX_PM_RENDER=render;
})();

/* =====================================================
   CATÁLOGO: CONTROL PROFESIONAL DE PRECIOS
   - Fuente única: catalogo_ajax.csv, solicitado sin caché.
   - Revisa catálogo, presupuesto abierto y TODOS los guardados.
   - Guarda huella y fecha de carga para identificar el catálogo usado.
   - El estado correcto es discreto; solo las incidencias son pulsables.
   ===================================================== */
const HX_CATALOG_DIAG_VERSION = '2.0';
const HX_CATALOG_META_KEY = 'hiperajax_catalogo_meta_v2';

function hxCatalogRef(value){
  return String(value || '').trim().toUpperCase();
}
function hxCatalogMoney(value){
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function hxCatalogSamePrice(a, b){
  return Math.abs(hxCatalogMoney(a) - hxCatalogMoney(b)) < 0.005;
}
function hxCatalogHash(text){
  let hash = 2166136261;
  const value = String(text || '');
  for(let i=0;i<value.length;i++){
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8,'0');
}
function hxCatalogFingerprint(items){
  const rows = (Array.isArray(items) ? items : [])
    .map(p=>`${hxCatalogRef(p?.name)}|${hxCatalogMoney(p?.pvp).toFixed(2)}`)
    .sort();
  return hxCatalogHash(rows.join('\n'));
}
function hxCatalogDate(value){
  try{
    return new Intl.DateTimeFormat('es-ES',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
  }catch(e){ return String(value || ''); }
}
function hxBudgetLabel(p, index){
  const numero = String(p?.numero || '').trim();
  const cliente = String(p?.cliente || '').trim();
  const id = numero || cliente || `Presupuesto ${index + 1}`;
  return cliente && numero ? `${numero} · ${cliente}` : id;
}
function hxGetCatalogMeta(){
  try{
    const data = JSON.parse(localStorage.getItem(HX_CATALOG_META_KEY) || '{}');
    return data && typeof data === 'object' ? data : {};
  }catch(e){ return {}; }
}
function hxSaveCatalogMeta(meta){
  try{ localStorage.setItem(HX_CATALOG_META_KEY, JSON.stringify(meta || {})); }catch(e){}
}

function hxEnsureCatalogDiagnosticUI(){
  let status = document.getElementById('catalogHealth');
  if(!status){
    // Se usa un span y no un botón para evitar estilos verdes globales.
    // Solo se vuelve interactivo cuando existe una incidencia real.
    status = document.createElement('span');
    status.id = 'catalogHealth';
    status.className = 'catalog-health is-checking';
    status.hidden = true;
    status.setAttribute('aria-live', 'polite');
    const abrirDetalle = ()=>{
      const informe = window.HX_CATALOGO_DIAGNOSTICO;
      if(informe && informe.totalAvisos > 0) hxOpenCatalogDiagnostic();
    };
    status.addEventListener('click', abrirDetalle);
    status.addEventListener('keydown', e=>{
      if((e.key === 'Enter' || e.key === ' ') && status.getAttribute('role') === 'button'){
        e.preventDefault();
        abrirDetalle();
      }
    });
    const preview = document.getElementById('previewProducto');
    if(preview && preview.parentNode) preview.insertAdjacentElement('afterend', status);
  }

  if(!document.getElementById('catalogDiagnosticModal')){
    const modal = document.createElement('div');
    modal.id = 'catalogDiagnosticModal';
    modal.className = 'modal hidden catalog-diagnostic-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-backdrop" data-catalog-diagnostic-close></div>
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="catalogDiagnosticTitle">
        <div class="modal-head">
          <div>
            <h2 id="catalogDiagnosticTitle">Revisar precios</h2>
            <p id="catalogDiagnosticSubtitle">Compara el catálogo actual con tus presupuestos.</p>
          </div>
          <button type="button" class="modal-close catalog-diagnostic-close" data-catalog-diagnostic-close aria-label="Cerrar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        <div id="catalogDiagnosticBody" class="catalog-diagnostic-body"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-catalog-diagnostic-close]').forEach(el=>el.addEventListener('click', hxCloseCatalogDiagnostic));
  }
  return status;
}
function hxOpenCatalogDiagnostic(){
  const modal = document.getElementById('catalogDiagnosticModal');
  if(!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
}
function hxCloseCatalogDiagnostic(){
  const modal = document.getElementById('catalogDiagnosticModal');
  if(!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  if(!document.querySelector('.modal:not(.hidden)')) document.body.classList.remove('modal-open');
}

function hxCompareLinesWithCatalog(lines, porRef){
  const diferencias = [];
  (Array.isArray(lines) ? lines : []).forEach((linea,index)=>{
    if(!linea || linea.manual || linea.separador) return;
    const ref = hxCatalogRef(linea.name);
    if(!ref) return;
    const vigente = porRef.get(ref);
    if(!vigente) return;
    if(!hxCatalogSamePrice(linea.pvp, vigente.pvp)){
      diferencias.push({
        ref,
        linea:index + 1,
        guardado:hxCatalogMoney(linea.pvp),
        catalogo:hxCatalogMoney(vigente.pvp),
        diferencia:hxCatalogMoney(vigente.pvp)-hxCatalogMoney(linea.pvp)
      });
    }
  });
  return diferencias;
}

function hxDiagnosticarCatalogo(opciones={}){
  hxEnsureCatalogDiagnosticUI();
  const abrirSiHayAvisos = opciones.abrirSiHayAvisos !== false;
  const avisarToast = opciones.avisarToast !== false;
  const porRef = new Map();
  const duplicados = [];
  const conflictosPrecio = [];

  (Array.isArray(productos) ? productos : []).forEach((p,index)=>{
    const ref = hxCatalogRef(p?.name);
    if(!ref) return;
    const actual={ref,pvp:hxCatalogMoney(p?.pvp),index,producto:p};
    if(!porRef.has(ref)){ porRef.set(ref,actual); return; }
    const anterior=porRef.get(ref);
    duplicados.push({ref,anterior,actual});
    if(!hxCatalogSamePrice(anterior.pvp,actual.pvp)) conflictosPrecio.push({ref,anterior:anterior.pvp,nuevo:actual.pvp});
  });

  const presupuestoActual = hxCompareLinesWithCatalog(lineas, porRef);
  const identificadorActual = String(
    (typeof window.HX_GET_IDENTIFICADOR_ACTUAL === 'function' ? window.HX_GET_IDENTIFICADOR_ACTUAL() : '')
    || (typeof hxIdentificadorActual !== 'undefined' ? hxIdentificadorActual : '')
    || ''
  ).trim();

  function hxLowCostLines(listaLineas){
    const salida = [];
    (Array.isArray(listaLineas) ? listaLineas : []).forEach((linea,index)=>{
      if(!linea || linea.manual || linea.separador) return;
      const ref = hxCatalogRef(linea.name);
      const vigente = porRef.get(ref);
      const coste = hxCatalogMoney(linea.precio_neto_compra || vigente?.producto?.precio_neto_compra);
      const pvp = hxCatalogMoney(linea.pvp);
      const dto = Math.max(0,Math.min(100,Number(linea.dto)||0));
      const precioFinal = pvp * (1-dto/100);
      if(coste > 0 && precioFinal < coste){
        salida.push({
          ref:ref || String(linea.name||''),
          linea:index+1,
          pvp,dto,precioFinal,coste,
          diferencia:precioFinal-coste
        });
      }
    });
    return salida;
  }

  const bajoCosteActual = hxLowCostLines(lineas);
  const guardados = [];
  const guardadosBajoCoste = [];
  const listaGuardada = typeof leerListaPresupuestos === 'function' ? leerListaPresupuestos() : [];
  (Array.isArray(listaGuardada) ? listaGuardada : []).forEach((p,index)=>{
    const diferencias = hxCompareLinesWithCatalog(p?.lineas, porRef);
    if(diferencias.length){
      guardados.push({
        id:String(p?.id || ''),
        etiqueta:hxBudgetLabel(p,index),
        identificador:String(p?.identificador || '').trim(),
        fecha:String(p?.fecha || p?.guardado || ''),
        diferencias
      });
    }
    const bajoCoste = hxLowCostLines(p?.lineas);
    if(bajoCoste.length){
      guardadosBajoCoste.push({
        id:String(p?.id || ''),
        etiqueta:hxBudgetLabel(p,index),
        identificador:String(p?.identificador || '').trim(),
        fecha:String(p?.fecha || p?.guardado || ''),
        lineas:bajoCoste
      });
    }
  });

  const fingerprint = hxCatalogFingerprint(productos);
  const anteriorMeta = hxGetCatalogMeta();
  const cargadoEn = new Date().toISOString();
  const catalogoCambio = Boolean(anteriorMeta.fingerprint && anteriorMeta.fingerprint !== fingerprint);
  const meta={
    version:HX_CATALOG_DIAG_VERSION,
    fuente:String(window.HX_CATALOGO_ORIGEN || 'catálogo local'),
    fingerprint,
    cargadoEn,
    productos:Array.isArray(productos)?productos.length:0,
    referencias:porRef.size,
    anteriorFingerprint:String(anteriorMeta.fingerprint || ''),
    catalogoCambio
  };
  hxSaveCatalogMeta(meta);

  const lineasGuardadasAfectadas = guardados.reduce((n,p)=>n+p.diferencias.length,0);
  const lineasGuardadasBajoCoste = guardadosBajoCoste.reduce((n,p)=>n+p.lineas.length,0);
  const totalAvisos = conflictosPrecio.length + presupuestoActual.length + lineasGuardadasAfectadas + bajoCosteActual.length + lineasGuardadasBajoCoste + (productos.length ? 0 : 1);
  const informe={
    ...meta,
    duplicados,
    conflictosPrecio,
    presupuestoActual,
    bajoCosteActual,
    presupuestosGuardadosBajoCoste:guardadosBajoCoste,
    presupuestosGuardados:guardados,
    presupuestosGuardadosAfectados:guardados.length,
    lineasGuardadasAfectadas,
    totalAvisos
  };
  window.HX_CATALOGO_DIAGNOSTICO=informe;

  const status=document.getElementById('catalogHealth');
  const body=document.getElementById('catalogDiagnosticBody');
  const subtitle=document.getElementById('catalogDiagnosticSubtitle');
  if(!status || !body) return informe;

  status.classList.remove('is-checking','is-ok','is-warn','is-error');
  status.removeAttribute('aria-disabled');
  status.removeAttribute('title');
  status.removeAttribute('role');
  status.removeAttribute('tabindex');
  status.hidden = false;
  if(!productos.length){
    status.classList.add('is-error');
    status.textContent='Error de catálogo';
    status.title='Ver el problema';
    status.setAttribute('role','button');
    status.tabIndex=0;
  }else if(totalAvisos){
    status.classList.add('is-warn');
    status.textContent=`⚠ Diferencias de precios (${totalAvisos})`;
    status.title='Ver diferencias de precios y avisos de revisión';
    status.setAttribute('role','button');
    status.tabIndex=0;
  }else{
    // Si todo está correcto no se añade ruido visual: queda únicamente
    // el contador normal de productos cargados que ya muestra la app.
    status.classList.add('is-ok');
    status.textContent='';
    status.hidden = true;
    status.setAttribute('aria-disabled','true');
  }

  if(subtitle) subtitle.textContent=`${informe.productos} productos · cargado ${hxCatalogDate(cargadoEn)} · control ${fingerprint}`;

  const bloques=[];
  bloques.push(`<section class="catalog-diag-summary ${totalAvisos?'has-warning':'is-clean'}">
    <strong>${totalAvisos?'Hay PVP y avisos que conviene revisar':'Catálogo y presupuestos comprobados'}</strong>
    <span>${informe.productos} productos · ${informe.referencias} referencias · Fuente: ${escapeHtml(informe.fuente)}</span>
    <small>Cargado: ${escapeHtml(hxCatalogDate(cargadoEn))} · Identificador: ${escapeHtml(fingerprint)}</small>
  </section>`);

  if(catalogoCambio){
    bloques.push(`<section class="catalog-diag-section catalog-diag-info"><h3>Catálogo actualizado</h3>
      <p>La huella del catálogo ha cambiado desde la última carga. Se han vuelto a comprobar todos los presupuestos guardados.</p>
    </section>`);
  }
  if(conflictosPrecio.length){
    bloques.push(`<section class="catalog-diag-section"><h3>La misma referencia aparece con dos PVP</h3>${conflictosPrecio.map(x=>`
      <div class="catalog-diag-item is-warning"><b>${escapeHtml(x.ref)}</b><span>PVP ${fmt.format(x.anterior)} → PVP ${fmt.format(x.nuevo)}</span></div>`).join('')}</section>`);
  }
  if(presupuestoActual.length){
    bloques.push(`<section class="catalog-diag-section"><h3>Cambios de PVP · presupuesto abierto</h3>
      ${identificadorActual?`<p class="catalog-diag-help"><b>Identificador:</b> ${escapeHtml(identificadorActual)}</p>`:''}
      ${presupuestoActual.map(x=>`
      <div class="catalog-diag-item is-warning"><b>${escapeHtml(x.ref)}</b><span>Línea ${x.linea}: PVP guardado ${fmt.format(x.guardado)} → PVP actual ${fmt.format(x.catalogo)}</span></div>`).join('')}
      <p class="catalog-diag-help">No se cambia ningún precio automáticamente para no alterar un presupuesto sin tu permiso.</p></section>`);
  }
  if(bajoCosteActual.length){
    bloques.push(`<section class="catalog-diag-section catalog-diag-lowcost"><h3>Venta bajo coste · presupuesto abierto</h3>
      ${identificadorActual?`<p class="catalog-diag-help"><b>Identificador:</b> ${escapeHtml(identificadorActual)}</p>`:''}
      <p><b>${bajoCosteActual.length}</b> línea${bajoCosteActual.length===1?'':'s'} requiere${bajoCosteActual.length===1?'':'n'} revisión por venta bajo coste.</p>
      ${bajoCosteActual.map(x=>`<div class="catalog-diag-item is-lowcost"><b>${escapeHtml(x.ref)}</b><span>Línea ${x.linea}: Precio final ${fmt.format(x.precioFinal)}</span></div>`).join('')}
    </section>`);
  }
  if(guardadosBajoCoste.length){
    bloques.push(`<section class="catalog-diag-section catalog-diag-lowcost"><h3>Bajo coste en presupuestos guardados</h3>
      <p><b>${lineasGuardadasBajoCoste}</b> línea${lineasGuardadasBajoCoste===1?'':'s'} bajo coste en <b>${guardadosBajoCoste.length}</b> presupuesto${guardadosBajoCoste.length===1?'':'s'}.</p>
      ${guardadosBajoCoste.map(p=>`<details class="catalog-diag-budget"><summary>${escapeHtml(p.etiqueta)}${p.identificador?` · ${escapeHtml(p.identificador)}`:''} <span>${p.lineas.length} aviso${p.lineas.length===1?'':'s'}</span></summary>
        ${p.lineas.map(x=>`<div class="catalog-diag-item is-lowcost"><b>${escapeHtml(x.ref)}</b><span>Precio final ${fmt.format(x.precioFinal)}</span></div>`).join('')}
      </details>`).join('')}
    </section>`);
  }

  if(guardados.length){
    bloques.push(`<section class="catalog-diag-section"><h3>Cambios de PVP · presupuestos guardados</h3>
      <p><b>${guardados.length}</b> presupuesto${guardados.length===1?'':'s'} · <b>${lineasGuardadasAfectadas}</b> línea${lineasGuardadasAfectadas===1?'':'s'} para revisar.</p>
      ${guardados.slice(0,30).map(p=>`<details class="catalog-diag-budget"><summary>${escapeHtml(p.etiqueta)}${p.identificador?` · ${escapeHtml(p.identificador)}`:''} <span>${p.diferencias.length} diferencia${p.diferencias.length===1?'':'s'}</span></summary>
        ${p.diferencias.map(x=>`<div class="catalog-diag-item is-warning"><b>${escapeHtml(x.ref)}</b><span>PVP guardado ${fmt.format(x.guardado)} → PVP actual ${fmt.format(x.catalogo)}</span></div>`).join('')}
      </details>`).join('')}
      ${guardados.length>30?`<p class="catalog-diag-help">Se muestran los primeros 30 presupuestos afectados.</p>`:''}
    </section>`);
  }
  if(duplicados.length && !conflictosPrecio.length){
    bloques.push(`<section class="catalog-diag-section"><h3>Referencias repetidas</h3><p>${duplicados.length} referencia${duplicados.length===1?'':'s'} repetida${duplicados.length===1?'':'s'}, todas con el mismo PVP.</p></section>`);
  }
  if(!totalAvisos && !duplicados.length){
    bloques.push(`<section class="catalog-diag-section"><p>No hay diferencias de PVP entre el catálogo actual, el presupuesto abierto y los presupuestos guardados.</p></section>`);
  }
  body.innerHTML=bloques.join('');

  if(totalAvisos && avisarToast){
    try{ hxToastGlobal(`${totalAvisos} aviso${totalAvisos===1?'':'s'} de precios para revisar`, 'error'); }catch(e){}
  }
  if(totalAvisos && abrirSiHayAvisos) hxOpenCatalogDiagnostic();
  return informe;
}

// Único envoltorio final de carga. La petición original ya usa cache:'no-store'
// y un parámetro temporal; después se registra la huella y se revisa todo.
const cargarCatalogo_BASE_DIAGNOSTICO = cargarCatalogo;
cargarCatalogo = async function(){
  const resultado = await cargarCatalogo_BASE_DIAGNOSTICO.apply(this, arguments);

  // El control de precios necesita también la lista cloud. Se realiza una sola
  // carga silenciosa al arrancar para poder avisar en Inicio sin obligar a abrir
  // primero el gestor de presupuestos. No abre modal ni muestra toast.
  if(!window.HX_PRICE_CONTROL_CLOUD_LOADED){
    window.HX_PRICE_CONTROL_CLOUD_LOADED=true;
    try{
      if(typeof window.HX_RECARGAR_PRESUPUESTOS === 'function'){
        await window.HX_RECARGAR_PRESUPUESTOS({silencioso:true});
      }
    }catch(error){
      console.warn('[Hiper Ajax] Control de precios: no se pudo cargar la lista cloud.',error);
    }
  }

  hxDiagnosticarCatalogo({abrirSiHayAvisos:false,avisarToast:false});
  return resultado;
};

// Mantener el control actualizado tras abrir, guardar, importar o borrar presupuestos.
function hxRefreshPriceControlSoon(){
  setTimeout(()=>{
    if(Array.isArray(productos) && productos.length) hxDiagnosticarCatalogo({abrirSiHayAvisos:false,avisarToast:false});
  },40);
}
window.addEventListener('hiperajax:presupuestos-importados',hxRefreshPriceControlSoon);
const aplicarPresupuesto_BASE_DIAGNOSTICO = aplicarPresupuesto;
aplicarPresupuesto = function(){
  const r=aplicarPresupuesto_BASE_DIAGNOSTICO.apply(this,arguments);
  hxRefreshPriceControlSoon();
  return r;
};
const escribirListaPresupuestos_BASE_DIAGNOSTICO = escribirListaPresupuestos;
escribirListaPresupuestos = function(){
  const r=escribirListaPresupuestos_BASE_DIAGNOSTICO.apply(this,arguments);
  hxRefreshPriceControlSoon();
  return r;
};

document.addEventListener('DOMContentLoaded', hxEnsureCatalogDiagnosticUI);
(()=>{
  const HX_MONGO_ENDPOINT = '/.netlify/functions/guardar-presupuesto';
  const HX_APP_VERSION_MONGO = '4.2.19';
  let hxDuplicadoDePendiente = null;
  let hxIdentificadorDuplicadoPendiente = '';
  let hxGuardandoMongo = false;
  // Estado persistente del presupuesto abierto en el editor. No depende de la
  // selección temporal del modal, que se limpia al cerrarlo.
  window.HX_ACTIVE_BUDGET_ID = String(window.HX_ACTIVE_BUDGET_ID || '');

  function hxPresupuestoSeleccionado(){
    const sel = $('#presupuestosGuardados');
    const idModal = sel ? String(sel.value || '').trim() : '';
    const id = idModal || String(window.HX_ACTIVE_BUDGET_ID || '').trim();
    if(!id) return null;
    return leerListaPresupuestos().find(p => String(p.id || p.mongoId || p._id || '') === id) || null;
  }

  async function hxEnviarPresupuestoMongo(data, opciones={}){
    const payload = {
      presupuesto: {
        ...data,
        mongoId: opciones.mongoId || data.mongoId || null,
        versionApp: HX_APP_VERSION_MONGO
      }
    };
    if(opciones.mongoId) payload.mongoId = opciones.mongoId;
    if(opciones.duplicadoDe) payload.duplicadoDe = opciones.duplicadoDe;

    const res = await fetch(HX_MONGO_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });

    let out = null;
    try{ out = await res.json(); }
    catch(e){ throw new Error(`Respuesta no válida del servidor (${res.status})`); }
    if(!res.ok || !out || !out.ok){
      throw new Error(out?.mensaje || `No se pudo guardar en MongoDB (${res.status})`);
    }
    return out;
  }

  function hxGuardarCopiaLocal(data, selectedId=''){
    let lista = leerListaPresupuestos();
    const idx = selectedId ? lista.findIndex(p => String(p.id) === String(selectedId)) : -1;
    if(idx >= 0){
      data.id = lista[idx].id;
      lista[idx] = data;
    }else{
      data.id = data.id || Date.now().toString();
      lista.unshift(data);
    }
    escribirListaPresupuestos(lista.slice(0,100));
    refrescarPresupuestosGuardados();
    const sel = $('#presupuestosGuardados');
    if(sel) sel.value = data.id;
  }

  guardar = async function(){
    if(hxGuardandoMongo) return;
    if(!Array.isArray(lineas) || lineas.length === 0){
      alert('Añade al menos un producto antes de guardar el presupuesto.');
      return;
    }

    hxGuardandoMongo = true;
    const sel = $('#presupuestosGuardados');
    const selectedIdModal = sel ? String(sel.value || '').trim() : '';
    const selectedId = selectedIdModal || String(window.HX_ACTIVE_BUDGET_ID || '').trim();
    const recuperado = hxPresupuestoSeleccionado();
    const duplicadoDe = hxDuplicadoDePendiente || '';

    // El identificador es el nombre interno del presupuesto. En uno nuevo se
    // solicita antes de enviar nada a MongoDB; al editar se conserva el actual.
    const esEdicion = Boolean(selectedId && recuperado && !duplicadoDe);
    let identificador = esEdicion
      ? String(hxIdentificadorActual || recuperado?.identificador || '').trim()
      : String(duplicadoDe ? hxIdentificadorDuplicadoPendiente : '').trim();

    // Un presupuesto nuevo normal pide aquí su identificador. Duplicar ya lo
    // ha pedido antes de modificar el editor o iniciar cualquier petición.
    if(!esEdicion && !identificador){
      const sugerido = String($('#cliente')?.value || '').trim();
      const respuesta = prompt(
        'Identificador del presupuesto\nEj.: Casa del pueblo, Oficina Madrid, Chalet García...',
        sugerido
      );
      if(respuesta === null){
        hxGuardandoMongo = false;
        hxDuplicadoDePendiente = null;
        hxIdentificadorDuplicadoPendiente = '';
        return;
      }
      identificador = String(respuesta || '').trim();
      if(!identificador){
        alert('Escribe un identificador para guardar el presupuesto.');
        hxGuardandoMongo = false;
        hxDuplicadoDePendiente = null;
        hxIdentificadorDuplicadoPendiente = '';
        return;
      }
    }

    hxIdentificadorActual = identificador;
    const data = datosPresupuesto();
    data.identificador = identificador;
    const mongoId = recuperado && recuperado.mongoId ? String(recuperado.mongoId) : '';
    let hxLoadingActivo = false;

    try{
      window.HX_LOADING_SHOW?.(duplicadoDe ? 'Duplicando presupuesto...' : 'Guardando presupuesto...');
      hxLoadingActivo = true;
      const resultado = await hxEnviarPresupuestoMongo(data, {
        mongoId: duplicadoDe ? '' : mongoId,
        duplicadoDe
      });

      data.mongoId = resultado.mongoId;
      data.numero = resultado.numero;
      data.guardado = new Date().toISOString();
      data.createdAt = resultado.createdAt || recuperado?.createdAt || data.guardado;
      data.updatedAt = resultado.updatedAt || data.guardado;
      if(duplicadoDe) data.duplicadoDe = duplicadoDe;

      const numeroInput = $('#numero');
      if(numeroInput) numeroInput.value = data.numero;

      hxGuardarCopiaLocal(data, duplicadoDe ? '' : selectedId);
      window.HX_ACTIVE_BUDGET_ID = String(resultado.mongoId || data.mongoId || '');

      // Sincronizar la lista cloud/cache que alimenta Mis presupuestos.
      // MongoDB ya ha guardado correctamente; sin este upsert, la caché de 10 min
      // podía seguir mostrando la versión anterior del presupuesto actualizado.
      window.HX_CLOUD_UPSERT_PRESUPUESTO?.({
        ...data,
        id: String(resultado.mongoId || data.mongoId || ''),
        mongoId: String(resultado.mongoId || data.mongoId || ''),
        numero: resultado.numero || data.numero,
        updatedAt: resultado.updatedAt || data.updatedAt || new Date().toISOString()
      });

      hxDuplicadoDePendiente = null;
      hxIdentificadorDuplicadoPendiente = '';
      alert(resultado.operacion === 'actualizado'
        ? `Presupuesto ${data.numero} actualizado.`
        : `Presupuesto guardado con número ${data.numero}.`);

      // Después de guardar, dejar el presupuestador preparado para uno nuevo.
      nuevoPresupuesto();
      setTimeout(()=>$('#cliente')?.focus(),30);
    }catch(error){
      console.error('[Hiper Ajax] Error MongoDB:', error);
      hxDuplicadoDePendiente = null;
      hxIdentificadorDuplicadoPendiente = '';
      alert(`No se pudo guardar en la base de datos. No se ha creado ningún número definitivo.\n\n${error.message}`);
    }finally{
      if(hxLoadingActivo) window.HX_LOADING_HIDE?.();
      hxGuardandoMongo = false;
    }
  };

  duplicarPresupuesto = async function(){
    if(!Array.isArray(lineas) || lineas.length === 0){
      alert('Añade al menos un producto antes de duplicar el presupuesto.');
      return;
    }
    const origen = hxPresupuestoSeleccionado();
    if(!origen?.mongoId){
      alert('Selecciona primero el presupuesto que quieres duplicar.');
      return;
    }

    const sugerido = String(origen.identificador || $('#cliente')?.value || '').trim();
    const respuesta = prompt(
      'Nuevo identificador para la copia\nEj.: Casa del pueblo, Oficina Madrid, Chalet García...',
      sugerido
    );
    if(respuesta === null) return;
    const nuevoIdentificador = String(respuesta || '').trim();
    if(!nuevoIdentificador){
      alert('Escribe un identificador para duplicar el presupuesto.');
      return;
    }

    // Solo después de validar se prepara la copia.
    hxDuplicadoDePendiente = String(origen.mongoId);
    hxIdentificadorDuplicadoPendiente = nuevoIdentificador;
    const sel = $('#presupuestosGuardados');
    if(sel) sel.value = '';
    const numeroInput = $('#numero');
    if(numeroInput) numeroInput.value = '';
    $('#estado').value = 'Borrador';
    $('#fecha').value = new Date().toISOString().slice(0,10);
    await guardar();
  };

  const hxNuevoPresupuestoBase = nuevoPresupuesto;
  nuevoPresupuesto = function(){
    hxNuevoPresupuestoBase.apply(this, arguments);
    window.HX_ACTIVE_BUDGET_ID='';
    hxDuplicadoDePendiente = null;
    hxIdentificadorDuplicadoPendiente = '';
    const numeroInput = $('#numero');
    if(numeroInput){
      numeroInput.value = '';
      numeroInput.placeholder = 'Se genera al guardar';
    }
    const sel = $('#presupuestosGuardados');
    if(sel) sel.value = '';
  };
})();


(()=>{
  const HX_LISTAR_ENDPOINT_413 = '/.netlify/functions/listar-presupuestos';
  const HX_LEER_ENDPOINT_413 = '/.netlify/functions/leer-presupuesto';
  let hxCloudLista413 = [];
  let hxCloudCargando413 = null;
  let hxCloudCargadaEn413 = 0;
  const HX_CLOUD_LIST_TTL_413 = 10 * 60 * 1000;
  const HX_CLOUD_SESSION_KEY_413 = 'hx_cloud_presupuestos_v1';

  function hxCloudRestaurarSesion413(){
    try{
      const raw=sessionStorage.getItem(HX_CLOUD_SESSION_KEY_413);
      if(!raw) return false;
      const data=JSON.parse(raw);
      const ts=Number(data?.ts)||0;
      const lista=Array.isArray(data?.lista)?data.lista:[];
      if(!ts || !lista.length || (Date.now()-ts)>=HX_CLOUD_LIST_TTL_413){
        sessionStorage.removeItem(HX_CLOUD_SESSION_KEY_413);
        return false;
      }
      hxCloudLista413=lista.map(hxNormalizarResumen413);
      hxCloudCargadaEn413=ts;
      return true;
    }catch(_error){ return false; }
  }

  function hxCloudGuardarSesion413(){
    try{
      sessionStorage.setItem(HX_CLOUD_SESSION_KEY_413,JSON.stringify({
        ts:hxCloudCargadaEn413||Date.now(),
        lista:hxCloudLista413
      }));
    }catch(_error){}
  }

  function hxNormalizarResumen413(p){
    const mongoId = String(p?.mongoId || p?._id || '').trim();
    return {
      ...(p || {}),
      id: mongoId,
      mongoId,
      tienda: String(p?.tienda || ''),
      comercial: String(p?.comercial || ''),
      identificador: String(p?.identificador || ''),
      lineas: Array.isArray(p?.lineas) ? p.lineas : [],
      guardado: p?.updatedAt || p?.guardado || p?.createdAt || p?.fecha || ''
    };
  }

  function hxMensajeCloud413(text, error=false){
    document.querySelector('.hx-cloud-toast-413')?.remove();
    const el=document.createElement('div');
    el.className='pmx-global-toast hx-cloud-toast-413';
    el.textContent=text;
    if(error) el.style.background='#8f2525';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),220);},1800);
  }

  async function hxCargarListaCloud413({silencioso=false,forzar=false}={}){
    if(!hxCloudLista413.length && !forzar) hxCloudRestaurarSesion413();
    const ahora=Date.now();
    const cacheValida=!forzar
      && hxCloudLista413.length
      && hxCloudCargadaEn413
      && (ahora-hxCloudCargadaEn413) < HX_CLOUD_LIST_TTL_413;

    if(cacheValida){
      refrescarPresupuestosGuardados();
      return hxCloudLista413;
    }

    if(hxCloudCargando413) return hxCloudCargando413;
    hxCloudCargando413=(async()=>{
      try{
        const res=await fetch(HX_LISTAR_ENDPOINT_413,{cache:'no-store'});
        const out=await res.json().catch(()=>null);
        if(!res.ok || !out?.ok) throw new Error(out?.mensaje || out?.error || `Error ${res.status}`);
        hxCloudLista413=(Array.isArray(out.presupuestos)?out.presupuestos:[]).map(hxNormalizarResumen413);
        hxCloudCargadaEn413=Date.now();
        hxCloudGuardarSesion413();
        refrescarPresupuestosGuardados();
        window.dispatchEvent(new CustomEvent('hiperajax:presupuestos-importados'));
        return hxCloudLista413;
      }catch(error){
        console.error('[Hiper Ajax] No se pudo listar desde MongoDB:',error);
        if(!silencioso) hxMensajeCloud413(`No se pudieron cargar los presupuestos: ${error.message}`,true);
        throw error;
      }finally{
        hxCloudCargando413=null;
      }
    })();
    return hxCloudCargando413;
  }

  async function hxAbrirCloud413(mongoId){
    const id=String(mongoId||'').trim();
    if(!id){ hxMensajeCloud413('Selecciona un presupuesto.',true); return; }

    const hxRecoveryStarted=Date.now();
    window.HX_LOADING_SHOW?.('Recuperando presupuesto...');
    try{
      // La lista del gestor ya contiene el documento completo, incluidas sus líneas.
      // Se recupera desde memoria de forma inmediata y solo se consulta MongoDB como respaldo.
      let presupuesto=hxCloudLista413.find(p=>String(p?.mongoId||p?.id||'')===id)||null;

      if(!presupuesto || !Array.isArray(presupuesto.lineas)){
        const res=await fetch(`${HX_LEER_ENDPOINT_413}?id=${encodeURIComponent(id)}`,{cache:'no-store'});
        const out=await res.json().catch(()=>null);
        if(!res.ok || !out?.ok || !out.presupuesto) throw new Error(out?.mensaje || out?.error || `Error ${res.status}`);
        presupuesto={...out.presupuesto,id,mongoId:id};
      }else{
        presupuesto={...presupuesto,id,mongoId:id};
      }

      aplicarPresupuesto(presupuesto);
      window.HX_ACTIVE_BUDGET_ID=id;
      const sel=document.getElementById('presupuestosGuardados');
      if(sel) sel.value=id;
      const pos=hxCloudLista413.findIndex(p=>p.mongoId===id);
      if(pos>=0) hxCloudLista413[pos]=hxNormalizarResumen413({...hxCloudLista413[pos],...presupuesto});
      const modal=document.getElementById('pmModal');
      if(modal){modal.classList.remove('pm-mobile-preview','pm-mobile-list','pm-has-selection');modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');}
      hxMensajeCloud413(`Presupuesto ${presupuesto.numero||''} abierto.`);
      return presupuesto;
    }catch(error){
      console.error('[Hiper Ajax] No se pudo abrir desde MongoDB:',error);
      hxMensajeCloud413(`No se pudo abrir el presupuesto: ${error.message}`,true);
      return null;
    }finally{
      const hxRemaining=Math.max(0,650-(Date.now()-hxRecoveryStarted));
      if(hxRemaining) await new Promise(resolve=>setTimeout(resolve,hxRemaining));
      window.HX_LOADING_HIDE?.();
    }
  }

  // El gestor existente sigue intacto, pero su fuente pasa a ser esta caché cloud.
  leerListaPresupuestos=function(){ return hxCloudLista413.slice(); };

  // La caché cloud se carga solo al abrir el gestor. Guardar no vuelve a
  // descargar toda la colección: la próxima apertura obtiene el estado actual.

  document.addEventListener('click',event=>{
    const openBtn=event.target.closest?.('#pmOpen,#btnLoadSaved');
    if(!openBtn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hxAbrirCloud413(document.getElementById('presupuestosGuardados')?.value||'');
  },true);

  document.addEventListener('dblclick',event=>{
    const row=event.target.closest?.('.pmx-row');
    if(!row) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const id=row.dataset.pmId||'';
    const sel=document.getElementById('presupuestosGuardados');
    if(sel) sel.value=id;
    hxAbrirCloud413(id);
  },true);
window.HX_RECARGAR_PRESUPUESTOS=hxCargarListaCloud413;
  window.HX_ABRIR_PRESUPUESTO=hxAbrirCloud413;
  window.HX_CLOUD_GET_PRESUPUESTO=id=>hxCloudLista413.find(p=>String(p?.mongoId||p?.id||'')===String(id||''))||null;
  window.HX_CLOUD_UPSERT_PRESUPUESTO=presupuesto=>{
    const normalizado=hxNormalizarResumen413(presupuesto);
    const id=normalizado.mongoId;
    const pos=hxCloudLista413.findIndex(p=>String(p.mongoId)===id);
    if(pos>=0) hxCloudLista413[pos]=normalizado; else hxCloudLista413.unshift(normalizado);
    hxCloudCargadaEn413=Date.now();
    hxCloudGuardarSesion413();
    refrescarPresupuestosGuardados();
    window.dispatchEvent(new CustomEvent('hiperajax:presupuestos-importados'));
    return normalizado;
  };
  window.HX_CLOUD_REMOVE_PRESUPUESTO=id=>{
    const key=String(id||'');
    hxCloudLista413=hxCloudLista413.filter(p=>String(p?.mongoId||p?.id||'')!==key);
    hxCloudCargadaEn413=Date.now();
    hxCloudGuardarSesion413();
    refrescarPresupuestosGuardados();
    window.dispatchEvent(new CustomEvent('hiperajax:presupuestos-importados'));
  };
})();


(()=>{
  const HX_GUARDAR_414='/.netlify/functions/guardar-presupuesto';

  function hxToast414(text,error=false){
    document.querySelector('.hx-toast-414')?.remove();
    const el=document.createElement('div');
    el.className='pmx-global-toast hx-toast-414';
    el.textContent=text;
    if(error) el.style.background='#8f2525';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),220);},1800);
  }

  async function hxRenombrarCloud414(){
    const id=String(document.getElementById('presupuestosGuardados')?.value||window.HX_ACTIVE_BUDGET_ID||'').trim();
    if(!id){hxToast414('Selecciona un presupuesto.',true);return;}
    try{
      const actualDoc=window.HX_CLOUD_GET_PRESUPUESTO?.(id);
      if(!actualDoc) throw new Error('El presupuesto no está cargado. Cierra y abre el gestor.');
      const actual=String(actualDoc.identificador||'').trim();
      const sugerido=actual||String(actualDoc.cliente||'').trim()||String(actualDoc.numero||'').trim();
      const value=prompt('Nombre o identificador del presupuesto:',sugerido);
      if(value===null)return;
      const identificador=value.trim();
      if(!identificador){hxToast414('Escribe un identificador.',true);return;}
      const presupuesto={...actualDoc,identificador,mongoId:id,versionApp:'4.2.16'};
      const saveRes=await fetch(HX_GUARDAR_414,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mongoId:id,presupuesto})});
      const saveOut=await saveRes.json().catch(()=>null);
      if(!saveRes.ok||!saveOut?.ok) throw new Error(saveOut?.mensaje||saveOut?.error||`Error ${saveRes.status}`);
      window.HX_CLOUD_UPSERT_PRESUPUESTO?.({...presupuesto,updatedAt:saveOut.updatedAt||new Date().toISOString()});
      hxIdentificadorActual=identificador;
      window.dispatchEvent(new CustomEvent('hiperajax:identificador-cambiado',{detail:{id,identificador}}));
      window.HX_PM_RENDER?.();
      hxToast414(`Identificador actualizado: “${identificador}”.`);
    }catch(error){
      console.error('[Hiper Ajax] No se pudo renombrar:',error);
      hxToast414(`No se pudo renombrar: ${error.message}`,true);
    }
  }

  window.HX_RENAME_ACTIVE_BUDGET = hxRenombrarCloud414;

  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('#pmRename');
    if(!btn)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hxRenombrarCloud414();
  },true);
})();


(()=>{
  const HX_APP_VERSION_DUP_415='4.2.16';
  const HX_DUP_ENDPOINT_415='/.netlify/functions/guardar-presupuesto';
  let hxDuplicando415=false;

  function hxFechaLocal415(){
    const d=new Date();
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function hxToast415(text,error=false){
    document.querySelector('.hx-dup-toast-415')?.remove();
    const el=document.createElement('div');
    el.className='pmx-global-toast hx-dup-toast-415';
    el.textContent=text;
    if(error) el.style.background='#8f2525';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),220);},1900);
  }


  async function hxDuplicar415(){
    if(hxDuplicando415) return;
    const sel=document.getElementById('presupuestosGuardados');
    // Fuente única: la tarjeta activa del gestor. El select oculto se mantiene
    // solo por compatibilidad con el editor antiguo y puede quedar vacío.
    const filaActiva=document.querySelector('#pmModal .pmx-row.is-selected[data-pm-id]');
    const mongoId=String(window.HX_PM_SELECTED_ID || filaActiva?.dataset?.pmId || sel?.value || '').trim();
    if(!mongoId){
      hxToast415('Selecciona o abre primero el presupuesto que quieres duplicar.',true);
      return;
    }

    const origen=window.HX_CLOUD_GET_PRESUPUESTO?.(mongoId);
    if(!origen){
      hxToast415('No se encontró el presupuesto seleccionado en la caché del gestor.',true);
      return;
    }

    const baseIdentificador=String(origen.identificador||origen.cliente||origen.numero||'').trim();
    const sugerido=baseIdentificador ? `${baseIdentificador} - copia` : '';
    const respuesta=prompt('Identificador para el presupuesto duplicado:',sugerido);
    if(respuesta===null) return;
    const nuevoIdentificador=String(respuesta).trim();
    if(!nuevoIdentificador){
      hxToast415('Escribe un identificador para duplicar el presupuesto.',true);
      return;
    }

    hxDuplicando415=true;
    const botones=[document.getElementById('btnDuplicate'),document.getElementById('pmDuplicate')].filter(Boolean);
    botones.forEach(b=>b.disabled=true);
    window.HX_LOADING_SHOW?.('Duplicando presupuesto...');
    try{
      // Duplicar utiliza el mismo guardado estable que los presupuestos nuevos.
      // Se envía una copia completa SIN mongoId: MongoDB genera solo el número;
      // el identificador escrito viaja como dato normal y no puede sustituirse.
      const copiaParaGuardar={
        ...origen,
        id:undefined,
        _id:undefined,
        mongoId:null,
        numero:'',
        identificador:nuevoIdentificador,
        fecha:hxFechaLocal415(),
        estado:'Borrador',
        guardado:new Date().toISOString(),
        versionApp:HX_APP_VERSION_DUP_415
      };
      const res=await fetch(HX_DUP_ENDPOINT_415,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({presupuesto:copiaParaGuardar,duplicadoDe:mongoId})
      });
      const out=await res.json().catch(()=>null);
      if(!res.ok || !out?.ok){
        throw new Error(out?.mensaje || out?.error || `Error ${res.status}`);
      }

      const nuevoId=String(out.mongoId||out.id||'').trim();
      const nuevoNumero=String(out.numero||'').trim();
      if(!nuevoId || !nuevoNumero) throw new Error('El servidor no devolvió el nuevo presupuesto correctamente.');

      // Construimos exactamente la copia enviada y añadimos solo los valores
      // que pertenecen al servidor: mongoId y número automático.
      const identificadorConfirmado=nuevoIdentificador;
      const duplicado={
        ...copiaParaGuardar,
        id:nuevoId,
        mongoId:nuevoId,
        numero:nuevoNumero,
        identificador:identificadorConfirmado,
        duplicadoDe:mongoId,
        createdAt:out.createdAt||new Date().toISOString(),
        updatedAt:out.updatedAt||new Date().toISOString()
      };

      window.HX_CLOUD_UPSERT_PRESUPUESTO?.(duplicado);
      hxDuplicadoDePendiente=null;
      aplicarPresupuesto(duplicado);
      hxIdentificadorActual=identificadorConfirmado;
      refrescarPresupuestosGuardados();
      if(sel) sel.value=nuevoId;
      window.HX_PM_SELECTED_ID=nuevoId;
      window.dispatchEvent(new CustomEvent('hiperajax:identificador-cambiado',{
        detail:{id:nuevoId,identificador:identificadorConfirmado}
      }));

      const modal=document.getElementById('pmModal');
      if(modal){
        modal.classList.remove('pm-mobile-preview');
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden','true');
      }
      hxToast415(`Duplicado ${duplicado.numero} · ${identificadorConfirmado}`);
    }catch(error){
      console.error('[Hiper Ajax] Error al duplicar:',error);
      hxToast415(`No se pudo duplicar: ${error.message}`,true);
    }finally{
      window.HX_LOADING_HIDE?.();
      hxDuplicando415=false;
      botones.forEach(b=>b.disabled=false);
    }
  }

  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('#btnDuplicate,#pmDuplicate');
    if(!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hxDuplicar415();
  },true);
})();


(()=>{
  const HX_DELETE_416='/.netlify/functions/borrar-presupuesto';
  let hxDeleting416=false;

  const $416=id=>document.getElementById(id);
  const hxList416=()=>{
    try{ return typeof leerListaPresupuestos==='function' ? (leerListaPresupuestos()||[]) : []; }
    catch(e){ return []; }
  };
  const hxSelectedId416=()=>String($416('presupuestosGuardados')?.value||window.HX_ACTIVE_BUDGET_ID||'').trim();
  const hxSelected416=()=>hxList416().find(p=>String(p.id||p.mongoId||p._id)===hxSelectedId416())||null;
  const hxIdentifier416=p=>String(p?.identificador||'').trim();

  function hxToast416(text,error=false){
    document.querySelector('.hx-toast-416')?.remove();
    const el=document.createElement('div');
    el.className='pmx-global-toast hx-toast-416';
    el.textContent=text;
    if(error) el.style.background='#8f2525';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),220);},2100);
  }

  function hxEnsureIdentifier416(){
    const title=document.querySelector('.section-title-under-actions');
    if(!title || $416('hxBudgetIdentifier416')) return;
    const box=document.createElement('div');
    box.id='hxBudgetIdentifier416';
    box.className='hx-budget-identifier-416 is-empty';
    box.innerHTML='<span>Identificador</span><strong>Sin identificador</strong><button type="button" class="hx-id-edit-416" aria-label="Editar identificador" title="Editar identificador">✎</button>';
    title.appendChild(box);
  }

  function hxRefreshIdentifier416(){
    hxEnsureIdentifier416();
    const box=$416('hxBudgetIdentifier416');
    if(!box) return;
    const p=hxSelected416();
    const value=String(hxIdentificadorActual || hxIdentifier416(p) || '').trim();
    box.classList.toggle('is-empty',!value);
    const strong=box.querySelector('strong');
    if(strong) strong.textContent=value||'Sin identificador';
    box.title=value ? 'Identificador interno del presupuesto' : 'Asigna un identificador';
  }

  function hxEnhanceCards416(){
    const list=hxList416();
    document.querySelectorAll('#pmList .pmx-row[data-pm-id]').forEach(row=>{
      const id=String(row.dataset.pmId||'');
      const p=list.find(x=>String(x.id||x.mongoId||x._id)===id);
      if(!p) return;
      const main=row.querySelector('.pmx-row-main');
      if(!main) return;
      const identifier=hxIdentifier416(p);
      const cliente=String(p.cliente||'Sin cliente');
      const numero=String(p.numero||'Sin número');
      const tienda=String(p.tienda||'Sin tienda');
      const comercial=String(p.comercial||'Sin asignar');
      const fecha=String(p.fecha||'').split('T')[0];
      const html=`
        ${identifier?`<strong class="pmx-card-identifier-416">${escapeHtml(identifier)}</strong>`:''}
        <b class="pmx-card-number-416">${escapeHtml(numero)}</b>
        <small class="pmx-card-client-416">${escapeHtml(cliente)}</small>
        <small class="pmx-card-meta-416">${escapeHtml(tienda)} · ${escapeHtml(comercial)}${fecha?` · ${escapeHtml(fecha)}`:''}</small>`;
      if(main.innerHTML.trim()!==html.trim()) main.innerHTML=html;
    });
  }

  function hxClearOpen416(){
    window.HX_ACTIVE_BUDGET_ID='';
    const sel=$416('presupuestosGuardados');
    if(sel) sel.value='';
    try{
      // Reinicio directo: no llamar a limpiar(), porque abriría una segunda confirmación.
      if(typeof nuevoPresupuesto==='function') nuevoPresupuesto();
      else {
        hxIdentificadorActual='';
        ['cliente','telefono','email','observaciones'].forEach(id=>{const el=$416(id);if(el)el.value='';});
        if(Array.isArray(lineas)){ lineas=[]; if(typeof render==='function') render(); }
      }
    }catch(e){ console.warn('[Hiper Ajax] No se pudo limpiar tras borrar',e); }
    hxRefreshIdentifier416();
  }

  async function hxDelete416(){
    if(hxDeleting416) return;
    const id=hxSelectedId416();
    const p=hxSelected416();
    if(!id){ hxToast416('Selecciona un presupuesto.',true); return; }
    const numero=String(p?.numero||'este presupuesto');
    const identificador=hxIdentifier416(p);
    const texto=identificador ? `¿Eliminar definitivamente “${identificador}” (${numero})?` : `¿Eliminar definitivamente ${numero}?`;
    if(!confirm(`${texto}\n\nEsta acción lo borrará de MongoDB y no se puede deshacer.`)) return;

    hxDeleting416=true;
    window.HX_LOADING_SHOW?.('Eliminando presupuesto...');
    const btn=$416('pmDelete');
    if(btn) 
    try{
      const res=await fetch(HX_DELETE_416,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({mongoId:id})
      });
      const out=await res.json().catch(()=>null);
      if(!res.ok || !out?.ok) throw new Error(out?.mensaje||out?.error||`Error ${res.status}`);

      hxClearOpen416();
      window.HX_CLOUD_REMOVE_PRESUPUESTO?.(id);
      // En móvil, al borrar el presupuesto que ocupa la vista previa no tiene
      // sentido dejar esa pantalla vacía. Volvemos a la portada del gestor.
      // En PC conservamos el gestor abierto con la lista visible.
      if(window.matchMedia('(max-width:900px)').matches && typeof window.HX_PM_MOBILE_HOME==='function'){
        window.HX_PM_MOBILE_HOME();
      }
      hxEnhanceCards416();
      hxToast416(`Presupuesto ${numero} eliminado.`);
    }catch(error){
      console.error('[Hiper Ajax] Error al borrar:',error);
      hxToast416(`No se pudo borrar: ${error.message}`,true);
    }finally{
      window.HX_LOADING_HIDE?.();
      hxDeleting416=false;
      if(btn) btn.disabled=false;
    }
  }

  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('#pmDelete,#btnDeleteSaved');
    if(!btn) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hxDelete416();
  },true);

  document.addEventListener('change',event=>{
    if(event.target?.id==='presupuestosGuardados') setTimeout(hxRefreshIdentifier416,0);
  });

  window.addEventListener('hiperajax:presupuestos-importados',()=>{
    setTimeout(()=>{hxRefreshIdentifier416();hxEnhanceCards416();},50);
  });
  window.addEventListener('hiperajax:identificador-cambiado',()=>setTimeout(hxRefreshIdentifier416,0));

  document.addEventListener('DOMContentLoaded',()=>{
    hxEnsureIdentifier416();
    hxRefreshIdentifier416();
    $416('hxBudgetIdentifier416')?.addEventListener('click',()=>{
      const id=hxSelectedId416();
      if(!id){hxToast416('Guarda o abre primero el presupuesto.',true);return;}
      const sel=$416('presupuestosGuardados');
      if(sel) sel.value=id;
      // El botón del modal queda deshabilitado al cerrarlo. Llamar a su .click()
      // no ejecuta nada; el lápiz debe invocar directamente el mismo renombrado.
      if(typeof window.HX_RENAME_ACTIVE_BUDGET==='function'){
        window.HX_RENAME_ACTIVE_BUDGET();
      }else{
        hxToast416('No se pudo abrir la edición del identificador.',true);
      }
    });
    const root=$416('pmList');
    if(root){
      new MutationObserver(()=>hxEnhanceCards416()).observe(root,{childList:true,subtree:true});
    }
  });

  window.HX_GET_IDENTIFICADOR_ACTUAL=()=>String(hxIdentificadorActual || hxIdentifier416(hxSelected416()) || '').trim();
})();


/* v4.1.2 · Loading global reutilizable */
(()=>{
  let depth=0;
  let hideTimer=0;
  function ensure(){
    let e=document.getElementById('hxGlobalLoading');
    if(!e){
      e=document.createElement('div');
      e.id='hxGlobalLoading';
      e.className='hx-global-loading hidden';
      e.innerHTML='<div class="hx-loading-card"><span class="hx-spinner"></span><strong id="hxLoadingText">Procesando...</strong></div>';
      document.body.appendChild(e);
    }
    return e;
  }
  window.HX_LOADING_SHOW=(text='Procesando...')=>{
    depth++;
    clearTimeout(hideTimer);
    const e=ensure();
    const t=e.querySelector('#hxLoadingText');
    if(t)t.textContent=text;
    e.classList.remove('hidden');
  };
  window.HX_LOADING_HIDE=()=>{
    depth=Math.max(0,depth-1);
    if(depth)return;
    clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>ensure().classList.add('hidden'),80);
  };
  // Cada operación abre y cierra su propio indicador después de validar.
  // No mostrar carga desde un listener global: los prompt cancelados no deben
  // dejar mensajes falsos de Guardando, Duplicando o Renombrando.
  window.addEventListener('hiperajax:presupuestos-importados',()=>{
    clearTimeout(window.__hxActionFallback428);
    depth=1;
    window.HX_LOADING_HIDE();
  });
})();

/* =====================================================
   v4.2.0 · Flujo consolidado del gestor
   - Un clic: selecciona.
   - Doble clic PC: recupera.
   - Botón Recuperar: recupera siempre.
   - Móvil: filtros -> lista -> selección -> recuperar.
   ===================================================== */
(function(){
  const isMobile=()=>window.matchMedia('(max-width:900px)').matches;
  const modal=()=>document.getElementById('pmModal');
  const selectedId=()=>String(document.getElementById('presupuestosGuardados')?.value||'').trim();

  document.addEventListener('click',function(e){
    const folder=e.target.closest?.('#pmModal .pmx-folder');
    if(folder&&isMobile()){
      setTimeout(()=>modal()?.classList.add('pm-mobile-list'),0);
    }
  },true);

  document.addEventListener('click',function(e){
    const back=e.target.closest?.('#pmMobileBackFilters');
    if(!back)return;
    e.preventDefault();e.stopPropagation();
    // En móvil Atrás vuelve siempre a la pantalla principal del gestor.
    // Esto limpia una búsqueda sin resultados y evita caer en la lista de
    // "Recientes" con el estado anterior todavía activo.
    if(isMobile()&&typeof window.HX_PM_MOBILE_HOME==='function'){
      // Volver desde resultados conserva el texto para poder corregirlo y buscar de nuevo.
      window.HX_PM_MOBILE_HOME({preserveSearch:true});
      setTimeout(()=>document.getElementById('pmSearch')?.focus(),0);
      return;
    }
    modal()?.classList.remove('pm-mobile-list','pm-has-selection');
    const sel=document.getElementById('presupuestosGuardados');if(sel)sel.value='';
    document.querySelectorAll('#pmModal .pmx-row.is-selected').forEach(r=>r.classList.remove('is-selected'));
    ['pmOpen','pmDuplicate','pmPdf','pmRename','pmDelete'].forEach(id=>{const b=document.getElementById(id);if(b)b.disabled=true});
  },true);

  document.addEventListener('dblclick',function(e){
    if(isMobile())return;
    const row=e.target.closest?.('#pmModal .pmx-row');if(!row)return;
    const id=String(row.dataset.pmId||'').trim();if(!id)return;
    e.preventDefault();e.stopImmediatePropagation();
    const sel=document.getElementById('presupuestosGuardados');if(sel)sel.value=id;
    window.HX_ABRIR_PRESUPUESTO?.(id);
  },true);

  document.addEventListener('click',function(e){
    const open=e.target.closest?.('#pmOpen');if(!open)return;
    const id=selectedId();
    if(!id)return;
    e.preventDefault();
    window.HX_ABRIR_PRESUPUESTO?.(id);
  },false);
})();


/* v4.2.20 · descripción real del CSV sin alterar PDF ni presupuesto */
const hxDescripcionProductoBase = descripcionProducto;
descripcionProducto = function(p){
  const base = hxDescripcionProductoBase.apply(this, arguments) || {icon:'📦',desc:'',family:'',official:''};
  const corta = String((p && p.short_description) || '').trim();
  const real = String((p && p.description) || '').trim();
  return corta ? {...base, desc:corta} : (real ? {...base, desc:real} : base);
};

/* =====================================================
   v4.2.20c · Buscador inicial preciso + miniaturas
   - Si una palabra de 4+ letras aparece realmente en referencias,
     elimina coincidencias débiles provocadas por descripciones/subsecuencias.
   - Añade la misma foto y descripción real al buscador inicial.
   - No modifica Catálogo, Explorer, presupuesto ni responsive existente.
   ===================================================== */
(function(){
  // El ranking pertenece exclusivamente a search_engine.js.
  pintarResultados = function(term){
    const panel = document.querySelector('#resultados');
    if(!panel) return;
    const results = hxBuscarComun(term);
    activeIndex = -1;
    if(!String(term||'').trim() || !results.length){
      panel.classList.add('hidden');
      panel.innerHTML='';
      panel.dataset.firstIndex='';
      return;
    }
    panel.dataset.firstIndex=String(results[0].i);
    panel.innerHTML=results.slice(0,80).map((x,k)=>{
      const d=descripcionProducto(x.p);
      return `<div class="result-item result-item-pro result-item-visual" data-index="${x.i}" data-ref="${escapeHtml(x.p.name)}" data-pvp="${Number(x.p.pvp)}" data-k="${k}">
        ${hxProductVisualHtml(x.p,d,'search')}
        <div class="result-price">${fmt.format(x.p.pvp)}</div>
      </div>`;
    }).join('');
    hxBindProductImages(panel);
    panel.querySelectorAll('.result-item').forEach(el=>{
      el.addEventListener('mouseenter',()=>{ activeIndex=Number(el.dataset.k); });
      el.addEventListener('click',()=>seleccionarProductoSeguro(el.dataset.ref,el.dataset.pvp,true));
      el.addEventListener('dblclick',()=>{ seleccionarProductoSeguro(el.dataset.ref,el.dataset.pvp,true); addLinea(); });
    });
    panel.classList.remove('hidden');

    const resetPanelScroll=()=>{
      panel.scrollTop=0;
      try{ panel.scrollTo({top:0,left:0,behavior:'auto'}); }catch(_error){}
    };
    resetPanelScroll();
    requestAnimationFrame(() => {
      resetPanelScroll();
      requestAnimationFrame(resetPanelScroll);
    });
    setTimeout(resetPanelScroll,60);
  };
})();


/* =====================================================
   v4.2.21 · Indicadores de scroll del presupuesto
   - Solo aparecen si existen filas ocultas arriba/abajo.
   - No cambian la altura ni la estructura de la tabla.
   - Clic/tap desplaza una vista de productos suavemente.
   ===================================================== */
(function(){
  function initBudgetScrollHints(){
    const scroller=document.querySelector('.budget-card .table-scroll');
    if(!scroller || scroller.dataset.hxScrollHints==='1') return;
    scroller.dataset.hxScrollHints='1';

    const make=(dir,label)=>{
      const b=document.createElement('button');
      b.type='button';
      b.className=`hx-budget-scroll-hint hx-budget-scroll-${dir}`;
      b.setAttribute('aria-label',label);
      b.setAttribute('title',label);
      b.innerHTML=dir==='up'
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 15.5 5.5-5 5.5 5"/><path d="m6.5 10.5 5.5-5 5.5 5"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 8.5 5.5 5 5.5-5"/><path d="m6.5 13.5 5.5 5 5.5-5"/></svg>';
      scroller.appendChild(b);
      return b;
    };

    const up=make('up','Ver productos anteriores');
    const down=make('down','Ver más productos');
    let raf=0;
    const update=()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
        const overflow=max>6;
        up.classList.toggle('is-visible',overflow && scroller.scrollTop>6);
        down.classList.toggle('is-visible',overflow && scroller.scrollTop<max-6);
      });
    };
    const move=dir=>{
      const amount=Math.max(120,Math.round(scroller.clientHeight*.72));
      scroller.scrollBy({top:dir*amount,behavior:'smooth'});
    };
    up.addEventListener('click',e=>{e.preventDefault();move(-1)});
    down.addEventListener('click',e=>{e.preventDefault();move(1)});
    scroller.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update,{passive:true});
    const tbody=scroller.querySelector('tbody');
    if(tbody && window.MutationObserver) new MutationObserver(update).observe(tbody,{childList:true,subtree:true});
    if(window.ResizeObserver) new ResizeObserver(update).observe(scroller);
    update();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initBudgetScrollHints,{once:true});
  else initBudgetScrollHints();
})();
