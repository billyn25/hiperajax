(()=>{'use strict';
const CFG=[
 {family:'Centrales'},
 {family:'Detectores'},
 {family:'Accesorios inalámbricos'},
 {family:'Cámaras IP'},
 {family:'NVRs Profesionales',label:'NVR'},
 {family:'Accesorios CCTV',label:'Soportes'}
];
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const collator=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
function baseRef(ref){return String(ref||'').toUpperCase().replace(/-(?:B|W|GRA|GR|BLACK|WHITE)$/,'');}
function colorRank(v){const s=String(v||'').toLowerCase();if(/blanco|white/.test(s))return 0;if(/negro|black/.test(s))return 1;if(/gris|grey|gray/.test(s))return 2;return 9;}
function sortProducts(list){return list.slice().sort((a,b)=>collator.compare(baseRef(a.reference),baseRef(b.reference))||colorRank(a.color)-colorRank(b.color)||collator.compare(a.color||'',b.color||'')||(Number(a.price)||0)-(Number(b.price)||0)||collator.compare(a.reference||'',b.reference||''));}
function sortPirProducts(list){
 return list.slice().sort((a,b)=>
   (Number(a.price)||0)-(Number(b.price)||0) ||
   collator.compare(baseRef(a.reference),baseRef(b.reference)) ||
   colorRank(a.color)-colorRank(b.color) ||
   collator.compare(a.reference||'',b.reference||'')
 );
}

function sortRemoteButtons(list){
 return list.slice().sort((a,b)=>
   (Number(a.price)||0)-(Number(b.price)||0) ||
   collator.compare(baseRef(a.reference),baseRef(b.reference)) ||
   collator.compare(a.reference||'',b.reference||'')
 );
}

function sortPriceRef(list){
 return list.slice().sort((a,b)=>
   (Number(a.price)||0)-(Number(b.price)||0) ||
   collator.compare(baseRef(a.reference),baseRef(b.reference)) ||
   collator.compare(a.reference||'',b.reference||'')
 );
}


function slug(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function iconSvg(name){
 const n=String(name||'').toLowerCase();let path='';
 if(/movimiento|pir|motion/.test(n)) path='<circle cx="12" cy="12" r="3"/><path d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8"/>';
 else if(/apertura|door|puerta/.test(n)) path='<path d="M6 3h10v18H6zM10 12h.01"/>';
 else if(/cortina|curtain/.test(n)) path='<path d="M5 4h14M7 4v16M12 4v16M17 4v16"/>';
 else if(/cristal|glass/.test(n)) path='<path d="M5 3h14l-2 18H7zM9 8l6 6M15 8l-6 6"/>';
 else if(/incendio|fire|humo/.test(n)) path='<path d="M12 3c2 4-1 5 1 7 1-2 3-2 4-1 2 2 2 7-1 9-2 2-6 3-9 0-3-4 1-7 5-15z"/>';
 else if(/inund|leak|agua/.test(n)) path='<path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z"/>';
 else if(/teclado|keypad/.test(n)) path='<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>';
 else if(/sirena|siren/.test(n)) path='<path d="M7 16h10l-1-7a4 4 0 0 0-8 0zM5 20h14M4 10H2M22 10h-2"/>';
 else if(/bot|mando|button|remote/.test(n)) path='<rect x="7" y="3" width="10" height="18" rx="4"/><circle cx="12" cy="9" r="2"/>';
 else if(/repet|rex/.test(n)) path='<path d="M5 12a7 7 0 0 1 12-5M19 12a7 7 0 0 1-12 5"/><path d="M15 4h3v3M9 20H6v-3"/>';
 else if(/transmit/.test(n)) path='<path d="M12 20V9M8 13a6 6 0 0 1 8 0M5 10a10 10 0 0 1 14 0"/><circle cx="12" cy="20" r="1"/>';
 else if(/hub|central|wifi|lte|4g/.test(n)) path='<circle cx="12" cy="12" r="3"/><path d="M5 9a9 9 0 0 1 14 0M8 12a5 5 0 0 1 8 0M12 15v5"/>';
 else if(/domo|turret|bullet|ptz|camara|cámara/.test(n)) path='<rect x="3" y="6" width="14" height="12" rx="2"/><path d="m17 10 4-2v8l-4-2z"/>';
 else if(/nvr|canales|hdmi/.test(n)) path='<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h10M7 14h6"/><circle cx="17" cy="14" r="1"/>';
 else if(/soporte|bracket/.test(n)) path='<path d="M5 4v16h14M5 14h8v6"/>';
 else path='<circle cx="12" cy="12" r="7"/><path d="M12 8v8M8 12h8"/>';
 return `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}
function renderNav(items){
 const nav=$('hxqNav');if(!nav)return;
 nav.innerHTML=items.map(item=>`<span class="hxq-nav-item" data-hxq-jump="${esc(item.id)}" role="button" tabindex="0" title="${esc(item.label)}" aria-label="${esc(item.label)}">${iconSvg(item.label)}</span>`).join('');
}
function card(p){const img=p.image?`<img src="${esc(p.image)}" alt="" loading="lazy">`:'';return `<article class="hxq-product" data-ref="${esc(p.reference)}" data-price="${Number(p.price)||0}"><div class="hxq-photo">${img}</div><strong class="hxq-reference">${esc(p.reference)}</strong><div class="hxq-actions"><div class="hxq-qty"><span class="hxq-minus" data-hxq-minus role="button" tabindex="0">−</span><span class="hxq-value">1</span><span class="hxq-plus" data-hxq-plus role="button" tabindex="0">+</span></div><span class="hxq-add" data-hxq-add role="button" tabindex="0">Añadir</span></div></article>`}
function render(){
 const api=window.HX_EXPLORER_PRO,root=$('hxqContent');if(!root)return;
 if(!api?.quickAddData){root.innerHTML='<p class="hxq-empty">Cargando…</p>';renderNav([]);return}
 const html=[],navItems=[];
 for(const cfg of CFG){
  const family=api.quickAddData([cfg.family])[0];if(!family)continue;
  const seen=new Set(),groups=[];
  for(const group of (family.groups||[])){
   if(!group?.products?.length)continue;
   const familyName=String(cfg.family||'');
   const sorter=
      group.name==='Movimiento / PIR'?sortPirProducts:
      group.name==='Botones / Mandos'?sortRemoteButtons:
      group.name==='Transmitters'?sortPriceRef:
      familyName==='Cámaras IP'?sortPriceRef:
      familyName==='NVRs Profesionales'?sortPriceRef:
      sortProducts;
   const products=sorter(group.products.filter(p=>{
    const k=String(p.reference||'').toUpperCase();
    if(!k||seen.has(k))return false;seen.add(k);return true;
   }));
   if(!products.length)continue;
   const id=`hxq-${slug(family.family)}-${slug(group.name)}`;
   navItems.push({id,label:group.name});
   groups.push(`<section class="hxq-group" id="${esc(id)}"><div class="hxq-group-title"><strong>${esc(group.name)}</strong><span>${products.length}</span></div><div class="hxq-grid">${products.map(card).join('')}</div></section>`);
  }
  if(groups.length)html.push(`<section class="hxq-family"><h2>${esc(cfg.label||family.family)}</h2>${groups.join('')}</section>`);
 }
 root.innerHTML=html.join('')||'<p class="hxq-empty">No hay productos rápidos disponibles.</p>';
 renderNav(navItems);
}
function open(){window.HXQ_RESET_SESSION?.();render();$('hxqModal')?.classList.remove('hxq-hidden');$('hxqModal')?.setAttribute('aria-hidden','false');document.documentElement.classList.add('hxq-lock');document.body.classList.add('hxq-lock')}
function close(){window.HXQ_RESET_SESSION?.();$('hxqModal')?.classList.add('hxq-hidden');$('hxqModal')?.setAttribute('aria-hidden','true');document.documentElement.classList.remove('hxq-lock');document.body.classList.remove('hxq-lock')}
function activate(el){
 if(el?.matches('[data-hxq-close]')){close();return true}
 const jump=el?.closest('[data-hxq-jump]');
 if(jump){
  const target=document.getElementById(jump.dataset.hxqJump),root=$('hxqContent');
  if(target&&root)root.scrollTo({top:Math.max(0,target.offsetTop-8),behavior:'smooth'});
  return true;
 }
 const c=el?.closest('.hxq-product');if(!c)return false;
 const q=c.querySelector('.hxq-value');let n=Math.max(1,Number(q.textContent)||1);
 if(el.matches('[data-hxq-minus]')){q.textContent=Math.max(1,n-1);return true}
 if(el.matches('[data-hxq-plus]')){q.textContent=n+1;return true}
 if(el.matches('[data-hxq-add]')){
  const result=window.HXQ_ADD_PRODUCT?.(c.dataset.ref,n,Number(c.dataset.price));
  if(result?.ok){
   const total=Math.max(1,Number(result.totalQty)||n);
   el.textContent=`✓ ${total} ud${total===1?'':'s'}`;el.classList.add('is-added');
   setTimeout(()=>{el.textContent='Añadir';el.classList.remove('is-added')},1050);
  }
  return true;
 }
 return false;
}
function install(){const opener=$('hxqOpen');opener?.addEventListener('click',open);opener?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});$('hxqModal')?.addEventListener('click',e=>activate(e.target));$('hxqModal')?.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"]')){e.preventDefault();activate(e.target)}});addEventListener('keydown',e=>{if(e.key==='Escape')close()})}
window.HX_QUICK_ADD={open,close,render,config:CFG};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();})();