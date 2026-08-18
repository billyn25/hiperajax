(() => {
'use strict';

const CONFIG=Object.freeze([
  {family:'Centrales',tone:'green',shortcuts:['Hub','Hub 2','4G / LTE','Wi‑Fi','Hub Plus','Hybrid']},
  {family:'Detectores',tone:'amber',shortcuts:['Movimiento / PIR','Apertura','MotionCam','Cristal','Exterior','Cortina','Incendio']},
  {family:'Accesorios inalámbricos',tone:'blue',shortcuts:['Teclados','Sirenas','Botones / Mandos','Repetidores','Relés','Transmitters']},
  {family:'Cámaras IP',tone:'violet',shortcuts:['Domo','Turret','Bullet','PTZ']},
  {family:'NVRs Profesionales',label:'NVR',tone:'rose',shortcuts:['4 canales','8 canales','16 canales','32+ canales','HDMI']},
  {family:'Accesorios CCTV',label:'Soportes',tone:'cyan',shortcuts:['Soportes']}
]);

const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function stock(v){
  const s=String(v??'').trim().toLowerCase();
  if(/sin stock|agotado|none|out/.test(s))return['is-out','Sin stock'];
  if(/limit|bajo|low|poco/.test(s))return['is-low','Stock limitado'];
  return['is-ok','Disponible'];
}

function pick(data,cfg){
  const out=[],seen=new Set();

  // First: one representative per real Explorer shortcut, in configured order.
  for(const shortcut of cfg.shortcuts){
    const g=data.quickGroups?.find(x=>x.name===shortcut);
    if(!g?.products?.length) continue;
    const p=g.products.find(x=>!seen.has(x.reference));
    if(p){out.push({...p,shortcut});seen.add(p.reference);}
  }

  // Second: useful alternatives from same shortcuts until 14 products.
  for(const shortcut of cfg.shortcuts){
    const g=data.quickGroups?.find(x=>x.name===shortcut);
    if(!g?.products?.length) continue;
    for(const p of g.products){
      if(seen.has(p.reference))continue;
      out.push({...p,shortcut});
      seen.add(p.reference);
      if(out.length>=14)return out;
    }
  }

  // Fallback only if no shortcuts existed.
  if(!out.length){
    for(const p of (data.products||[])){
      if(seen.has(p.reference))continue;
      out.push({...p,shortcut:''});
      seen.add(p.reference);
      if(out.length>=14)break;
    }
  }
  return out;
}

function card(p){
  const st=stock(p.stock);
  const img=p.image?`<img src="${esc(p.image)}" alt="" loading="lazy">`:'';
  return `<article class="quick-add-product" data-ref="${esc(p.reference)}" data-price="${Number(p.price)||0}">
    <div class="quick-add-photo">${img}</div>
    <div class="quick-add-main">
      <div class="quick-add-refline"><strong>${esc(p.reference)}</strong>${p.shortcut?`<em>${esc(p.shortcut)}</em>`:''}</div>
      <span>${esc(p.description)}</span>
      <small class="${st[0]}"><i></i>${st[1]}</small>
    </div>
    <div class="quick-add-buy">
      <b>${fmt.format(Number(p.price)||0)}</b>
      <div class="quick-add-qty"><button type="button" data-minus>−</button><span>1</span><button type="button" data-plus>+</button></div>
      <button type="button" class="quick-add-do" data-add>Añadir</button>
    </div>
  </article>`;
}

function render(){
  const api=window.HX_EXPLORER_PRO,root=$('quickAddContent');
  if(!root)return;
  if(!api?.quickData){root.innerHTML='<p class="quick-add-empty">Cargando productos…</p>';return;}

  root.innerHTML=CONFIG.map(cfg=>{
    const data=api.quickData([cfg.family])[0];
    if(!data)return'';
    const products=pick(data,cfg);
    if(!products.length)return'';

    const chips=cfg.shortcuts.map(name=>{
      const g=data.quickGroups?.find(x=>x.name===name);
      return g?.count?`<span class="quick-add-chip">${esc(name)} <b>${g.count}</b></span>`:'';
    }).join('');

    return `<section class="quick-add-section tone-${cfg.tone}">
      <div class="quick-add-section-head">
        <h3>${esc(cfg.label||data.family)}</h3>
        <div class="quick-add-chips">${chips}</div>
      </div>
      <div class="quick-add-products">${products.map(card).join('')}</div>
    </section>`;
  }).join('') || '<p class="quick-add-empty">No hay productos rápidos disponibles.</p>';
}

function open(){
  const m=$('quickAddModal');
  if(!m)return;
  render();
  m.classList.remove('hidden');
  m.setAttribute('aria-hidden','false');
  document.body.classList.add('quick-add-open');
}

function close(){
  const m=$('quickAddModal');
  if(!m)return;
  m.classList.add('hidden');
  m.setAttribute('aria-hidden','true');
  document.body.classList.remove('quick-add-open');
}

function install(){
  $('btnQuickAdd')?.addEventListener('click',open);

  $('quickAddModal')?.addEventListener('click',e=>{
    if(e.target.closest('[data-quick-add-close]'))return close();
    const c=e.target.closest('.quick-add-product');
    if(!c)return;
    const q=c.querySelector('.quick-add-qty span');
    let n=Math.max(1,Number(q?.textContent)||1);

    if(e.target.closest('[data-minus]')){q.textContent=Math.max(1,n-1);return;}
    if(e.target.closest('[data-plus]')){q.textContent=n+1;return;}

    if(e.target.closest('[data-add]')){
      const ok=window.hxAddProductoSeguro?.(c.dataset.ref,n,null,Number(c.dataset.price));
      if(ok){
        try{window.render?.();}catch(_){}
        const b=e.target.closest('[data-add]');
        b.textContent='Añadido';
        setTimeout(()=>b.textContent='Añadir',800);
      }
    }
  });

  addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!$('quickAddModal')?.classList.contains('hidden'))close();
  });
  addEventListener('hx:catalogo-cargado',()=>{
    if(!$('quickAddModal')?.classList.contains('hidden'))render();
  });
}

window.HX_QUICK_ADD={open,close,render,config:CONFIG};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();