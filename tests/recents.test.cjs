'use strict';
const test=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=source.indexOf("(function(){\n  let pmSelectedId='';");
const end=source.indexOf('  window.HX_PM_RENDER=render;',start);
assert.ok(start>=0 && end>start);
const code=source.slice(start,end)+`window.testAPI={filtered,syncFilters,updateFilterNotice,pmRecentBounds,pmIsRecent,setView(type,value=''){pmView={type,value}}};\n})();`;
const now=new Date(2026,9,15,16,20);
function run(list,mobile=false){
  const elements={};
  for(const id of ['pmFolderRecentCount','pmFolderAllCount','pmFilterNotice','pmShowAllDates','pmFilterStore','pmFilterCommercial','pmFilterDate','pmSearch','pmSort']){
    elements[id]={value:'',textContent:'',innerHTML:'',hidden:false,classList:{toggle(){}},addEventListener(k,fn){this['on'+k]=fn;}};
  }
  class Clock extends Date{constructor(...args){super(...(args.length?args:[+now]));}}
  const scope={Date:Clock,Intl,console,setTimeout,clearTimeout,leerListaPresupuestos:()=>list,escapeHtml:x=>String(x??''),fmt:new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}),matchMedia:()=>({matches:mobile}),document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}}};
  vm.runInNewContext(code,scope,{timeout:3000});
  return {api:scope.window.testAPI,elements};
}
const dataset=()=>['2026-10-15','2026-10-14','2026-10-07','2026-09-16','2026-09-14','2026-09-01','2026-08-20','2026-08-01'].map((fecha,i)=>Object.freeze({id:String(i),fecha,cliente:'Prueba-'+i,tienda:i%2?'B':'A',comercial:'Luis',updatedAt:'2026-10-15T14:00:00Z',lineas:[]}));
const ids=x=>Array.from(x,p=>p.id).sort();
test('HTML carga directamente el JS corregido; no requiere build especial',()=>{new vm.Script(source);assert.ok(html.includes('app.js?v=recientes-30d-20261015-2'));assert.ok(html.includes('<span>Últimos 30 días</span>'));assert.ok(!source.includes("if(pmView.type==='recent')list=list.slice(0,20);"));});
for(const mobile of [false,true])test('Gestor real de versión 4.2.38, modo '+(mobile?'móvil':'PC')+': 4 recientes de 8',()=>{const all=Object.freeze(dataset()),before=JSON.stringify(all),{api,elements}=run(all,mobile);assert.deepEqual(ids(api.filtered()),['0','1','2','3']);api.syncFilters();assert.equal(elements.pmFolderRecentCount.textContent,'(4)');assert.equal(elements.pmFolderAllCount.textContent,'(8)');api.setView('all');assert.equal(api.filtered().length,8);assert.equal(JSON.stringify(all),before);});
test('Rango del 16/09 al 15/10 visible y Ver todos conserva histórico',()=>{const {api,elements}=run(dataset());api.updateFilterNotice();assert.equal(elements.pmFilterNotice.hidden,false);assert.match(elements.pmFilterNotice.innerHTML,/16\/09\/2026/);assert.match(elements.pmFilterNotice.innerHTML,/15\/10\/2026/);elements.pmShowAllDates.onclick();assert.equal(api.filtered().length,8);});
test('Antiguos, futuros e inválidos no aparecen aunque updatedAt sea de hoy',()=>{const all=['2026-09-15','2026-10-16','2026-02-30','bad'].map(fecha=>({fecha,updatedAt:'2026-10-15T14:00:00Z'}));const {api}=run(all);assert.equal(api.filtered().length,0);api.setView('all');assert.equal(api.filtered().length,4);});
test('Sin límite arbitrario de 20 documentos',()=>{const all=Array.from({length:25},(_,i)=>({id:String(i),fecha:'2026-10-15'}));const {api,elements}=run(all);assert.equal(api.filtered().length,25);api.syncFilters();assert.equal(elements.pmFolderRecentCount.textContent,'(25)');});
test('Tiendas, comerciales y búsqueda mantienen el histórico en Todos',()=>{const {api,elements}=run(dataset());api.setView('store','A');assert.equal(api.filtered().length,4);api.setView('commercial','Luis');assert.equal(api.filtered().length,8);elements.pmSearch.value='Prueba-5';api.setView('recent');assert.equal(api.filtered().length,0);api.setView('all');assert.deepEqual(ids(api.filtered()),['5']);});
test('Filtros reales de mes anterior y hoy',()=>{const {api,elements}=run(dataset());api.setView('all');elements.pmFilterDate.value='prevmonth';assert.deepEqual(ids(api.filtered()),['3','4','5']);elements.pmFilterDate.value='today';assert.deepEqual(ids(api.filtered()),['0']);});
