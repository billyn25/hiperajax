'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

function catalog() {
  return [
    {name: 'AJ-HOMESIREN-W', pvp: 100, color: 'Blanco', short_description: 'Sirena interior inalámbrica'},
    {name: 'AJ-HOMESIREN-B', pvp: 100, color: 'Negro', short_description: 'Sirena interior inalámbrica'},
    {name: 'AJ-SOCKET-W', pvp: 60, short_description: 'Enchufe inalámbrico'},
    {name: 'AJ-KEYPAD-W', pvp: 200, order: 1, short_description: 'Teclado inalámbrico'},
    {name: 'AJ-OTRO-W', pvp: 0, short_description: 'Accesorio inalámbrico'}
  ].map(product => ({category: 'Ajax Inalámbrico', family: 'Accesorios', ...product}));
}

function load(products = catalog()) {
  let hashes = 0;
  const math = Object.create(Math);
  math.imul = (...args) => { hashes++; return Math.imul(...args); };
  const scope = {
    productos: products,
    Math: math,
    document: {readyState: 'loading', addEventListener() {}, getElementById() { return null; }},
    MutationObserver: class { observe() {} },
    addEventListener() {},
    requestAnimationFrame() {},
    __sortCalls: 0
  };
  scope.window = scope;
  vm.createContext(scope);
  vm.runInContext(`const originalSort=Array.prototype.sort;
    Array.prototype.sort=function(...args){
      globalThis.__sortCalls++;
      return originalSort.apply(this,args);
    };`, scope);
  vm.runInContext(fs.readFileSync(path.join(root, 'search_engine.js'), 'utf8'), scope);
  vm.runInContext(fs.readFileSync(path.join(root, 'explorer.js'), 'utf8'), scope);
  return {scope, products, counts: () => ({hashes, sorts: scope.__sortCalls})};
}

test('el motor con clasificación y orden reales de Explorer encuentra HomeSiren al escribir homesi', () => {
  const {scope, products} = load();
  const results = scope.HXA_COMMON_SEARCH.rows(products, 'homesi');
  const explorerResults = scope.HX_EXPLORER_PRO.auditSearch('homesi');
  assert.deepEqual(Array.from(results, row => row.p.name), ['AJ-HOMESIREN-B', 'AJ-HOMESIREN-W']);
  assert.deepEqual(Array.from(explorerResults, row => row.reference), ['AJ-HOMESIREN-B', 'AJ-HOMESIREN-W']);
});

test('«home si» prioriza el modelo frente a la afinidad Smart Home, sin cambiar «home»', () => {
  const products = catalog();
  products.push({
    name: 'AJ-SIDECOVER-W', category: 'Ajax', family: 'Smart Home',
    pvp: 10, short_description: 'Tapa lateral para enchufe'
  });
  const {scope} = load(products);
  const names = query => Array.from(scope.HXA_COMMON_SEARCH.rows(products, query), row => row.p.name);
  assert.equal(names('home')[0], 'AJ-SIDECOVER-W');
  assert.deepEqual(names('home si').slice(0, 2), ['AJ-HOMESIREN-B', 'AJ-HOMESIREN-W']);
  assert.deepEqual(
    Array.from(scope.HX_EXPLORER_PRO.auditSearch('home si', 2), row => row.reference),
    ['AJ-HOMESIREN-B', 'AJ-HOMESIREN-W']
  );
});

test('el orden preparado conserva prioridad comercial, precio, color e índices de familia', () => {
  const {scope, products} = load();
  const snapshot = scope.HXA_EXPLORER_PREPARE_SEARCH();
  assert.deepEqual(products.map(product => snapshot.naturalOrder(product)), [3, 2, 1, 0, 4]);
  for (const product of products) {
    assert.equal(snapshot.naturalOrder(product), scope.HXA_EXPLORER_NATURAL_ORDER(product));
    assert.equal(snapshot.classification(product), scope.HXA_EXPLORER_CLASSIFICATION(product));
  }
  assert.equal(snapshot.naturalOrder({...products[0]}), 3);
  assert.equal(snapshot.naturalOrder({name: 'DESCONOCIDO'}), Number.MAX_SAFE_INTEGER);
  assert.equal(snapshot.naturalOrder(null), Number.MAX_SAFE_INTEGER);
});

test('consultar los candidatos preparados no vuelve a recorrer el catálogo ni ordenar familias', () => {
  const {scope, products, counts} = load();
  const snapshot = scope.HXA_EXPLORER_PREPARE_SEARCH();
  const before = counts();
  assert.ok(before.hashes > 0);
  assert.ok(before.sorts > 0);
  for (let pass = 0; pass < 3; pass++) {
    for (const product of products) {
      snapshot.classification(product);
      snapshot.naturalOrder(product);
    }
  }
  assert.deepEqual(counts(), before);
});

test('una consulta nueva refleja precio y prioridad modificados', () => {
  const {scope, products} = load();
  const first = scope.HXA_EXPLORER_PREPARE_SEARCH();
  assert.equal(first.naturalOrder(products[0]), 3);
  products[0].pvp = 30;
  const second = scope.HXA_EXPLORER_PREPARE_SEARCH();
  assert.equal(second.naturalOrder(products[0]), 1);
  products[0].order = 0.5;
  const third = scope.HXA_EXPLORER_PREPARE_SEARCH();
  assert.equal(third.naturalOrder(products[0]), 0);
});

test('recargar objetos del catálogo con los mismos datos conserva la clasificación', () => {
  const {scope, products} = load();
  const first = scope.HXA_EXPLORER_PREPARE_SEARCH();
  const original = first.classification(products[0]);
  assert.ok(original);
  scope.productos = products.map(product => ({...product}));
  const refreshed = scope.HXA_EXPLORER_PREPARE_SEARCH();
  assert.deepEqual(refreshed.classification(scope.productos[0]), original);
  assert.equal(refreshed.naturalOrder(scope.productos[0]), 3);
  scope.productos[0].family = 'Repuestos';
  const reclassified = scope.HXA_EXPLORER_PREPARE_SEARCH();
  assert.equal(reclassified.classification(scope.productos[0]).family, 'Repuestos');
});
