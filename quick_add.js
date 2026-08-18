(()=>{'use strict';
const CFG=[
 {family:'Centrales',groups:['Hub','Hub 2','4G / LTE','Wi‑Fi','Hub Plus','Hybrid']},
 {family:'Detectores',groups:['Movimiento / PIR','Apertura','MotionCam','Cristal','Exterior','Cortina','Incendio']},
 {family:'Accesorios inalámbricos',groups:['Teclados','Sirenas','Botones / Mandos','Repetidores','Relés','Transmitters']},
 {family:'Cámaras IP',groups:['Domo','Turret','Bullet','PTZ']},
 {family:'NVRs Profesionales',label:'NVR',groups:['4 canales','8 canales','16 canales','32+ canales','HDMI']},
 {family:'Accesorios CCTV',label:'Soportes',groups:['Soportes']}
];
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function card(p){
 const img=p.image?`<img src="${esc(p.image)}" alt="" loading="lazy">`:'';
 return `<article class="hxq-product" data-ref="${esc(p.reference)}" data-price="${Number(p.price)||0}">
  <div class="hxq-photo">${img}</div>
  <strong class="hxq-reference">${esc(p.reference)}</strong>
  <div class="hxq-actions">
   <div class="hxq-qty"><button type="button" class="hxq-minus" data-hxq-minus>−</button><span>1</span><button type="button" class="hxq-plus" data-hxq-plus>+</button></div>
   <button type="button" class="hxq-add" data-hxq-add>Añadir</button>
  </div>
 </article>`;
}
function render(){
 const api=window.HX_EXPLORER_PRO,root=$('hxqContent'); if(!root)return;
 if(!api?.quickAddData){root.innerHTML='<p class="hxq-empty">Cargando…</p>';return}
 const html=[];
 for(const cfg of CFG){
  const family=api.quickAddData([cfg.family])[0]; if(!family)continue;
  const seen=new Set(),groups=[];
  for(const name of cfg.groups){
   const group=family.groups?.find(g=>g.name===name); if(!group?.products?.length)continue;
   const products=group.products.filter(p=>{const k=String(p.reference||'').toUpperCase();if(!k||seen.has(k))return false;seen.add(k);return true});
   if(!products.length)continue;
   groups.push(`<section class="hxq-group"><div class="hxq-group-title"><strong>${esc(name)}</strong><span>${products.length}</span></div><div class="hxq-grid">${products.map(card).join('')}</div></section>`);
  }
  if(groups.length)html.push(`<section class="hxq-family"><h2>${esc(cfg.label||family.family)}</h2>${groups.join('')}</section>`);
 }
 root.innerHTML=html.join('')||'<p class="hxq-empty">No hay productos rápidos disponibles.</p>';
}
function open(){render();$('hxqModal')?.classList.remove('hxq-hidden')}
function close(){$('hxqModal')?.classList.add('hxq-hidden')}
function install(){
 $('hxqOpen')?.addEventListener('click',open);
 $('hxqModal')?.addEventListener('click',e=>{
  if(e.target.closest('[data-hxq-close]'))return close();
  const c=e.target.closest('.hxq-product');if(!c)return;
  const q=c.querySelector('.hxq-qty span');let n=Math.max(1,Number(q.textContent)||1);
  if(e.target.closest('[data-hxq-minus]')){q.textContent=Math.max(1,n-1);return}
  if(e.target.closest('[data-hxq-plus]')){q.textContent=n+1;return}
  const b=e.target.closest('[data-hxq-add]');
  if(b&&window.HXQ_ADD_PRODUCT?.(c.dataset.ref,n,Number(c.dataset.price))){b.textContent='Añadido';setTimeout(()=>b.textContent='Añadir',700)}
 });
 addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}
window.HX_QUICK_ADD={open,close,render,config:CFG};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',install,{once:true}):install();
})();