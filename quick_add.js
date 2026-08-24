(()=>{'use strict';
const CFG=[
 {family:'Centrales'},
 {family:'Detectores'},
 {family:'Accesorios inalámbricos'},
 {family:'Domótica',label:'Domótica',onlyGroups:['Clima / Aire / LifeQuality','Timbre / Doorbell']},
 {family:'Cámaras IP'},
 {family:'NVRs Profesionales',label:'NVR'},
 {family:'Accesorios CCTV',label:'Accesorios CCTV'},
 {family:'Almacenamiento',label:'Almacenamiento',sources:[
   {family:'Discos duros',label:'Discos duros',refPrefixes:['HD1TB','HD2TB','HD3TB','HD4TB','HD6TB','HD8TB']},
   {family:'Tarjetas SD',label:'Tarjetas SD',onlyGroups:['32 GB','64 GB','128 GB']}
 ]},
 {family:'Alimentación',label:'Alimentación',onlyRefs:['DC12V2A-IP66','DC12V2A','DC12V2A-L','DC1215-W','DC1220-W','DC12V5A','INJ-POE-30W-V2','RG-POE-AT30']},
 {family:'Switches no gestionables',label:'Switches PoE',onlyRefs:['GAG1105PD', 'VDMS105GP', 'VDMS108GP', 'SW1008POE-100-E', 'SW0604POE-65-E', 'SF-SW0604HIPOE-60', 'SW8FE2FE-100W']},
 {family:'Racks de pared',label:'Racks'}
];
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const collator=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
function baseRef(ref){return String(ref||'').toUpperCase().replace(/-(?:B|W|GRA|GR|BLACK|WHITE)$/,'');}
function colorRank(v){const s=String(v||'').toLowerCase();if(/blanco|white/.test(s))return 0;if(/negro|black/.test(s))return 1;if(/gris|grey|gray/.test(s))return 2;return 9;}
function sortProducts(list){return list.slice().sort((a,b)=>collator.compare(baseRef(a.reference),baseRef(b.reference))||colorRank(a.color)-colorRank(b.color)||collator.compare(a.color||'',b.color||'')||(Number(a.price)||0)-(Number(b.price)||0)||collator.compare(a.reference||'',b.reference||''));}

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
function setActiveNav(id){
 const nav=$('hxqNav');if(!nav)return;
 nav.querySelectorAll('[data-hxq-jump]').forEach(item=>item.classList.toggle('is-active',item.dataset.hxqJump===id));
 const active=nav.querySelector('.hxq-nav-item.is-active');
 if(active && window.matchMedia('(max-width:640px)').matches){
  active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
 }
}
function updateNavMore(){
 const nav=$('hxqNav');
 const more=document.querySelector('.hxq-nav-more');
 if(!nav||!more)return;
 const mobile=window.matchMedia('(max-width:640px)').matches;
 if(!mobile){more.classList.remove('is-visible');return}
 const max=Math.max(0,nav.scrollWidth-nav.clientWidth);
 more.classList.toggle('is-visible',nav.scrollLeft<max-8);
}
function updateActiveFamily(){
 const root=$('hxqContent');if(!root)return;
 const families=[...root.querySelectorAll('.hxq-family[id]')];
 if(!families.length)return;

 /* Al llegar al fondo, la última familia queda activa aunque su título
    no pueda alcanzar el umbral superior. Funciona igual en PC y móvil. */
 const atBottom=root.scrollTop+root.clientHeight>=root.scrollHeight-6;
 if(atBottom){
  setActiveNav(families[families.length-1].id);
  return;
 }

 const top=root.getBoundingClientRect().top;
 const mobile=window.matchMedia('(max-width:640px)').matches;
 /* En móvil seguimos la familia que va entrando en pantalla, no solo la
    que ya ha llegado arriba. Así una familia pulsada no queda visualmente
    enganchada mientras el usuario continúa haciendo scroll. */
 const threshold=mobile?Math.max(110,root.clientHeight-120):72;
 let current=families[0];
 for(const family of families){
  if(family.getBoundingClientRect().top-top<=threshold) current=family;
  else break;
 }
 setActiveNav(current.id);
}
function renderNav(items){
 const nav=$('hxqNav');if(!nav)return;
 nav.innerHTML=items.map((item,index)=>`<span class="hxq-nav-item ${index===0?'is-active':''}" data-hxq-jump="${esc(item.id)}" role="button" tabindex="0">${esc(item.label)}</span>`).join('');
 requestAnimationFrame(updateNavMore);
}

function sortPriceRefColor(list){
 return list.slice().sort((a,b)=>
   (Number(a.price)||0)-(Number(b.price)||0) ||
   collator.compare(baseRef(a.reference),baseRef(b.reference)) ||
   colorRank(a.color)-colorRank(b.color) ||
   collator.compare(a.reference||'',b.reference||'')
 );
}
function quickSpecificFilter(groupName,products){
 return products.filter(p=>{
  const ref=String(p.reference||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  const curtain=/curtain/.test(ref);
  const motioncam=/motioncam|curtaincam/.test(ref);
  const combi=/combiprotect/.test(ref);
  const poe=/poe/.test(ref)||/gag1105pd|vdms105gp|vdms108gp|sw1008poe100e|sw0604poe65e|sfsw0604hipoe60|sw8fe2fe100w/.test(ref);
  if(groupName==='Movimiento / PIR'&&(curtain||motioncam))return false;
  if(/^\d+\s+puertos$/.test(groupName)&&poe)return false;
  return true;
 });
}
function stockState(raw){
 const value=String(raw??'').trim();
 const key=value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
 if(!value)return null;
 if(['high','alto','mucho','disponible','available','instock','enstock'].includes(key))return ['is-ok',value];
 if(['medium','medio','low','bajo','poco','limited','limitado'].includes(key))return ['is-low',value];
 if(['none','nostock','sinstock','agotado','outofstock','unavailable','nodisponible','zero'].includes(key))return ['is-none',value];
 const n=Number(value.replace(',','.'));
 if(Number.isFinite(n))return [n>=10?'is-ok':n>0?'is-low':'is-none',value];
 return ['is-low',value];
}
function card(p){
 const img=p.image?`<img src="${esc(p.image)}" alt="" loading="lazy">`:'';
 const state=stockState(p.stock);
 const stock=state?`<span class="hxq-stock-dot ${state[0]}" title="Stock: ${esc(state[1])}" aria-label="Stock: ${esc(state[1])}"></span>`:'';
 return `<article class="hxq-product" data-ref="${esc(p.reference)}" data-price="${Number(p.price)||0}">${stock}<div class="hxq-photo" data-hxq-image="${esc(p.image||'')}" role="${p.image?'button':'presentation'}" tabindex="${p.image?'0':'-1'}" aria-label="${p.image?'Ampliar imagen':''}">${img}</div><strong class="hxq-reference">${esc(p.reference)}</strong><div class="hxq-actions"><div class="hxq-qty"><span class="hxq-minus" data-hxq-minus role="button" tabindex="0">−</span><span class="hxq-value">1</span><span class="hxq-plus" data-hxq-plus role="button" tabindex="0">+</span></div><span class="hxq-add" data-hxq-add role="button" tabindex="0">Añadir</span></div></article>`;
}
function render(){
 const api=window.HX_EXPLORER_PRO,root=$('hxqContent');if(!root)return;
 if(!api?.quickAddData){root.innerHTML='<p class="hxq-empty">Cargando…</p>';renderNav([]);return}
 const html=[],navItems=[];
 for(const cfg of CFG){
  const sourceCfgs=Array.isArray(cfg.sources)?cfg.sources:[cfg];
  const sourceFamilies=sourceCfgs.map(sourceCfg=>{
    const family=api.quickAddData([sourceCfg.family])[0];
    return family?{family,sourceCfg}:null;
  }).filter(Boolean);
  if(!sourceFamilies.length)continue;

  const familyId=`hxq-family-${slug(cfg.label||cfg.family)}`;
  const groups=[];

  for(const sourceEntry of sourceFamilies){
   const family=sourceEntry.family,activeCfg=sourceEntry.sourceCfg;
   let familyGroups=family.groups||[];
   if(activeCfg.family==='Accesorios CCTV' && !familyGroups.some(group=>group?.products?.length)){
    const products=(family.products||[]);
    if(products.length) familyGroups=[{name:'Soportes',products}];
   }

   for(const group of familyGroups){
    if(!group?.products?.length)continue;
    if(Array.isArray(activeCfg.onlyGroups) && !activeCfg.onlyGroups.includes(group.name)) continue;
    if(group.name==='Combi'||group.name==='Hub Plus') continue;
    const familyName=String(activeCfg.family||'');
   const detectorPriceGroups=new Set(['Movimiento / PIR','MotionCam','PhOD','Cristal','Combi','Exterior','Cortina','Incendio']);
   const sorter=
      (familyName==='Detectores' && detectorPriceGroups.has(group.name))?sortPriceRefColor:
      group.name==='Botones / Mandos'?sortRemoteButtons:
      group.name==='Transmitters'?sortPriceRef:
      group.name==='Teclados'?sortPriceRefColor:
      (familyName==='Accesorios CCTV' && group.name==='Soportes')?sortPriceRefColor:
      familyName==='Alimentación'?sortPriceRefColor:
      familyName==='Switches no gestionables'?sortPriceRefColor:
      familyName==='Racks de pared'?sortPriceRefColor:
      familyName==='Tarjetas SD'?sortPriceRefColor:
      familyName==='Cámaras IP'?sortPriceRef:
      familyName==='NVRs Profesionales'?sortPriceRef:
      sortProducts;

   let candidates=group.products;
   if(Array.isArray(activeCfg.refPrefixes)){
    const prefixes=activeCfg.refPrefixes.map(ref=>String(ref).toUpperCase());
    candidates=candidates.filter(p=>{
      const ref=String(p.reference||'').toUpperCase();
      return prefixes.some(prefix=>ref===prefix || ref.startsWith(prefix+'-') || ref.startsWith(prefix+'_'));
    });
   }
   if(Array.isArray(activeCfg.onlyRefs)){
    const wanted=new Set(activeCfg.onlyRefs.map(ref=>String(ref).toUpperCase()));
    candidates=candidates.filter(p=>wanted.has(String(p.reference||'').toUpperCase()));
   }

   candidates=quickSpecificFilter(group.name,candidates);
   const seen=new Set();
   const products=sorter(candidates.filter(p=>{
    const k=String(p.reference||'').toUpperCase();
    if(!k||seen.has(k))return false;
    seen.add(k);
    return true;
   }));
   if(!products.length)continue;

    const baseLabel=(activeCfg.family==='Domótica' && group.name==='Clima / Aire / LifeQuality')?'LifeQuality':group.name;
    const groupLabel=Array.isArray(cfg.sources)
      ? `${activeCfg.label}${activeCfg.family==='Tarjetas SD' ? ` · ${baseLabel}` : (baseLabel && baseLabel!==activeCfg.label ? ` · ${baseLabel}` : '')}`
      : baseLabel;
    groups.push(`<section class="hxq-group"><div class="hxq-group-title"><strong>${esc(groupLabel)}</strong><span>${products.length}</span></div><div class="hxq-grid">${products.map(card).join('')}</div></section>`);
   }
  }

  if(groups.length){
   const label=cfg.label||cfg.family;
   navItems.push({id:familyId,label});
   html.push(`<section class="hxq-family" id="${esc(familyId)}"><h2>${esc(label)}</h2>${groups.join('')}</section>`);
  }
 }
 root.innerHTML=html.join('')||'<p class="hxq-empty">No hay productos rápidos disponibles.</p>';
 renderNav(navItems);
}
function open(){window.HXQ_RESET_SESSION?.();render();$('hxqModal')?.classList.remove('hxq-hidden');$('hxqModal')?.setAttribute('aria-hidden','false');document.documentElement.classList.add('hxq-lock');document.body.classList.add('hxq-lock');requestAnimationFrame(updateActiveFamily)}
function close(){window.HXQ_RESET_SESSION?.();$('hxqModal')?.classList.add('hxq-hidden');$('hxqModal')?.setAttribute('aria-hidden','true');document.documentElement.classList.remove('hxq-lock');document.body.classList.remove('hxq-lock')}
function openImagePreview(url){
 if(!url)return;
 let modal=document.getElementById('hxImagePreview');
 if(!modal){
  modal=document.createElement('div');
  modal.id='hxImagePreview';
  modal.className='hx-image-preview hidden';
  modal.innerHTML='<button type="button" class="hx-image-preview-close" aria-label="Cerrar">×</button><img alt="Vista ampliada del producto">';
  document.body.appendChild(modal);
  modal.addEventListener('click',ev=>{if(ev.target===modal||ev.target.closest('.hx-image-preview-close'))modal.classList.add('hidden')});
 }
 modal.querySelector('img').src=url;
 modal.classList.remove('hidden');
}
function activate(el){
 if(el?.closest?.('[data-hxq-close]')){close();return true}
 const photo=el?.closest?.('[data-hxq-image]');
 if(photo?.dataset.hxqImage){openImagePreview(photo.dataset.hxqImage);return true}
 const jump=el?.closest('[data-hxq-jump]');
 if(jump){
  const target=document.getElementById(jump.dataset.hxqJump),root=$('hxqContent');
  if(target&&root){
   setActiveNav(jump.dataset.hxqJump);
   const top=target.getBoundingClientRect().top-root.getBoundingClientRect().top+root.scrollTop;
   root.scrollTo({top:Math.max(0,top),behavior:'smooth'});
  }
  return true;
 }
 const c=el?.closest('.hxq-product');if(!c)return false;
 const q=c.querySelector('.hxq-value');let n=Math.max(1,Number(q.textContent)||1);
 if(el.matches('[data-hxq-minus]')){n=Math.max(1,n-1);q.textContent=n;const add=c.querySelector('[data-hxq-add]');if(add&&!add.classList.contains('is-added'))add.textContent=n>1?`Añadir ${n}`:'Añadir';return true}
 if(el.matches('[data-hxq-plus]')){n=n+1;q.textContent=n;const add=c.querySelector('[data-hxq-add]');if(add&&!add.classList.contains('is-added'))add.textContent=n>1?`Añadir ${n}`:'Añadir';return true}
 if(el.matches('[data-hxq-add]')){
  if(el.dataset.hxqFeedback==='1') return true;
  const result=window.HXQ_ADD_PRODUCT?.(c.dataset.ref,n,Number(c.dataset.price));
  if(result?.ok){
   el.dataset.hxqFeedback='1';
   el.setAttribute('aria-disabled','true');
   el.textContent=n>1?`✓ ${n} uds`:'✓ Añadido';el.classList.add('is-added');
   setTimeout(()=>{const current=Math.max(1,Number(q.textContent)||1);el.textContent=current>1?`Añadir ${current}`:'Añadir';el.classList.remove('is-added');el.removeAttribute('aria-disabled');delete el.dataset.hxqFeedback},1050);
  }
  return true;
 }
 return false;
}
function install(){
 const opener=$('hxqOpen');
 opener?.addEventListener('click',open);
 opener?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
 $('hxqModal')?.addEventListener('click',e=>activate(e.target));
 $('hxqModal')?.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"]')){e.preventDefault();activate(e.target)}});
 addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 const content=$('hxqContent');
 content?.addEventListener('scroll',()=>requestAnimationFrame(updateActiveFamily),{passive:true});
 const nav=$('hxqNav');
 nav?.addEventListener('scroll',()=>requestAnimationFrame(updateNavMore),{passive:true});
 addEventListener('resize',()=>requestAnimationFrame(updateNavMore),{passive:true});
}
window.HX_QUICK_ADD={open,close,render,config:CFG};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();})();