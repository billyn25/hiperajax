(()=>{'use strict';
const CFG=[
 {family:'Centrales'},
 {family:'Detectores'},
 {family:'Accesorios inalámbricos'},
 {family:'Cámaras IP'},
 {family:'NVRs Profesionales',label:'NVR'},
 {family:'Accesorios CCTV',label:'Soportes'},
 {family:'Discos duros',label:'Almacenamiento',refPrefixes:['HD1TB','HD2TB','HD3TB','HD4TB','HD6TB','HD8TB']}
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
function renderNav(items){
 const nav=$('hxqNav');if(!nav)return;
 nav.innerHTML=items.map(item=>`<span class="hxq-nav-item" data-hxq-jump="${esc(item.id)}" role="button" tabindex="0">${esc(item.label)}</span>`).join('');
}
function card(p){const img=p.image?`<img src="${esc(p.image)}" alt="" loading="lazy">`:'';return `<article class="hxq-product" data-ref="${esc(p.reference)}" data-price="${Number(p.price)||0}"><div class="hxq-photo">${img}</div><strong class="hxq-reference">${esc(p.reference)}</strong><div class="hxq-actions"><div class="hxq-qty"><span class="hxq-minus" data-hxq-minus role="button" tabindex="0">−</span><span class="hxq-value">1</span><span class="hxq-plus" data-hxq-plus role="button" tabindex="0">+</span></div><span class="hxq-add" data-hxq-add role="button" tabindex="0">Añadir</span></div></article>`}
function render(){
 const api=window.HX_EXPLORER_PRO,root=$('hxqContent');if(!root)return;
 if(!api?.quickAddData){root.innerHTML='<p class="hxq-empty">Cargando…</p>';renderNav([]);return}
 const html=[],navItems=[];
 for(const cfg of CFG){
  const family=api.quickAddData([cfg.family])[0];if(!family)continue;
  const familyId=`hxq-family-${slug(cfg.label||family.family)}`;
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

   let candidates=group.products;
   if(Array.isArray(cfg.refPrefixes)){
    const prefixes=cfg.refPrefixes.map(ref=>String(ref).toUpperCase());
    candidates=candidates.filter(p=>{
      const ref=String(p.reference||'').toUpperCase();
      return prefixes.some(prefix=>ref===prefix || ref.startsWith(prefix+'-') || ref.startsWith(prefix+'_'));
    });
   }

   const products=sorter(candidates.filter(p=>{
    const k=String(p.reference||'').toUpperCase();
    if(!k||seen.has(k))return false;seen.add(k);return true;
   }));
   if(!products.length)continue;

   groups.push(`<section class="hxq-group"><div class="hxq-group-title"><strong>${esc(group.name)}</strong><span>${products.length}</span></div><div class="hxq-grid">${products.map(card).join('')}</div></section>`);
  }

  if(groups.length){
   navItems.push({id:familyId,label:cfg.label||family.family});
   html.push(`<section class="hxq-family" id="${esc(familyId)}"><h2>${esc(cfg.label||family.family)}</h2>${groups.join('')}</section>`);
  }
 }
 root.innerHTML=html.join('')||'<p class="hxq-empty">No hay productos rápidos disponibles.</p>';
 renderNav(navItems);
}
function open(){window.HXQ_RESET_SESSION?.();render();$('hxqModal')?.classList.remove('hxq-hidden');$('hxqModal')?.setAttribute('aria-hidden','false');document.documentElement.classList.add('hxq-lock');document.body.classList.add('hxq-lock')}
function close(){window.HXQ_RESET_SESSION?.();$('hxqModal')?.classList.add('hxq-hidden');$('hxqModal')?.setAttribute('aria-hidden','true');document.documentElement.classList.remove('hxq-lock');document.body.classList.remove('hxq-lock')}
function activate(el){
 if(el?.closest?.('[data-hxq-close]')){close();return true}
 const jump=el?.closest('[data-hxq-jump]');
 if(jump){
  const target=document.getElementById(jump.dataset.hxqJump),root=$('hxqContent');
  if(target&&root)root.scrollTo({top:Math.max(0,target.offsetTop-10),behavior:'smooth'});
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