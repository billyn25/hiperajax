'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function engine(overrides = {}) {
  const scope = {...overrides};
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '..', 'search_engine.js'), 'utf8'),
    scope
  );
  return scope.HXA_COMMON_SEARCH;
}

const names = rows => Array.from(rows, row => row.p.name);
const products = Object.freeze([
  Object.freeze({name: 'AJ-HOMESIREN-W', short_description: 'Sirena interior inalámbrica blanca'}),
  Object.freeze({name: 'AJ-HOMESIREN-B', short_description: 'Sirena interior inalámbrica negra'}),
  Object.freeze({name: 'AJ-STREETSIREN-W', short_description: 'Sirena exterior inalámbrica blanca'}),
  Object.freeze({name: 'AJ-KEYPADCOMBI-W', short_description: 'Teclado inalámbrico'}),
  Object.freeze({name: 'AJ-MOTIONCAM-W', short_description: 'Detector de movimiento con cámara'})
]);

test('HomeSiren aparece al escribir homesi, sin exigir el modelo completo', () => {
  const search = engine();
  for (const query of ['hom', 'home', 'homesi', 'HOMESI', 'AJ-HOMESI', 'homesiren']) {
    assert.deepEqual(names(search.rows(products, query)).sort(), ['AJ-HOMESIREN-B', 'AJ-HOMESIREN-W'], query);
  }
});

test('los campos reference y sku siguen siendo buscables si name es descriptivo', () => {
  const catalog = [
    {name: 'Sirena interior blanca', reference: 'AJ-HOMESIREN-W'},
    {name: 'Sirena interior negra', sku: 'AJ-HOMESIREN-B'},
    {name: 'Sirena exterior', reference: 'AJ-STREETSIREN-W'}
  ];
  const search = engine();
  assert.equal(search.rows(catalog, 'homesi').length, 2);
  assert.deepEqual(names(search.rows(catalog, 'AJ-HOMESIREN-W')), ['Sirena interior blanca']);
});

test('se buscan prefijos también cuando el modelo sólo figura en descripción o atributos', () => {
  const catalog = [
    {name: 'AJ-001-W', description: 'Sirena de interior HomeSiren Jeweller'},
    {name: 'AJ-001-B', attributes: {modelo: 'HomeSiren', color: 'Negro'}},
    {name: 'AJ-002-W', description: 'Sirena de exterior StreetSiren Jeweller'}
  ];
  const search = engine();
  assert.deepEqual(names(search.rows(catalog, 'homesi')).sort(), ['AJ-001-B', 'AJ-001-W']);
  assert.deepEqual(names(search.rows(catalog, 'homesi neg')), ['AJ-001-B']);
});

test('una palabra exacta en otro producto no hace desaparecer resultados parciales', () => {
  const catalog = [
    {name: 'AJ-001', short_description: 'HomeSiren Jeweller'},
    {name: 'AJ-002', short_description: 'homesi'}
  ];
  const search = engine();
  assert.deepEqual(names(search.rows(catalog, 'homesi')), ['AJ-002', 'AJ-001']);
  assert.deepEqual(names(search.rows(catalog.slice(0, 1), 'homesi')), ['AJ-001']);
});

test('HomeSiren sigue apareciendo con «home si» aunque otra descripción contenga «si»', () => {
  const catalog = [
    {name: 'AJ-HOMESIREN-W', short_description: 'Sirena interior inalámbrica'},
    {name: 'AJ-OTRO', description: 'Consulte si necesita alimentación adicional'}
  ];
  assert.deepEqual(names(engine().rows(catalog, 'home si')), ['AJ-HOMESIREN-W']);
});

test('un modelo dividido en palabras se resuelve por la referencia completa sin reglas de marca', () => {
  const catalog = [
    {name: 'VC-CAMX-W', short_description: 'Sensor interior'},
    {name: 'VC-CAM-W', short_description: 'Sensor exterior'}
  ];
  const search = engine();
  assert.deepEqual(names(search.rows(catalog, 'cam x')), ['VC-CAMX-W']);
  assert.deepEqual(names(search.rows(catalog, 'cam x exterior')), []);
});

test('las consultas de varias palabras siguen exigiendo todos los términos', () => {
  const search = engine();
  assert.deepEqual(names(search.rows(products, 'home si')).sort(), ['AJ-HOMESIREN-B', 'AJ-HOMESIREN-W']);
  assert.deepEqual(names(search.rows(products, 'homesi negr')), ['AJ-HOMESIREN-B']);
  assert.deepEqual(names(search.rows(products, 'homesi exterior')), []);
  assert.deepEqual(names(search.rows(products, 'sirena inter')).sort(), ['AJ-HOMESIREN-B', 'AJ-HOMESIREN-W']);
});

test('mantiene referencias compuestas, normalización y coincidencias precisas', () => {
  const search = engine();
  assert.deepEqual(names(search.rows(products, 'keypad')), ['AJ-KEYPADCOMBI-W']);
  assert.deepEqual(names(search.rows(products, 'motionc')), ['AJ-MOTIONCAM-W']);
  assert.deepEqual(names(search.rows(products, 'inalámbrico tecl')), ['AJ-KEYPADCOMBI-W']);
  assert.deepEqual(names(search.rows(products, 'horsien')), []);
  assert.deepEqual(names(search.rows(products, '   ')), []);
});

test('rows y rank conservan producto, índice y orden compartido entre buscadores', () => {
  const search = engine();
  const before = JSON.stringify(products);
  const rows = search.rows(products, 'homesi');
  const ranked = search.rank(products, 'homesi');
  assert.deepEqual(Array.from(ranked, p => p.name), names(rows));
  for (const row of rows) assert.equal(row.p, products[row.i]);
  assert.deepEqual(Array.from(ranked, p => p._hxaIndex), Array.from(rows, row => row.i));
  assert.equal(search.rows(products, 'homesi', 1).length, 1);
  assert.equal(JSON.stringify(products), before);
});

test('respeta el orden natural existente de Explorer dentro de la misma familia', () => {
  const search = engine({
    HXA_EXPLORER_CLASSIFICATION: () => ({family: 'Sirenas'}),
    HXA_EXPLORER_NATURAL_ORDER: product => product.name.endsWith('-W') ? 0 : 1
  });
  assert.deepEqual(names(search.rows(products, 'homesi')), ['AJ-HOMESIREN-W', 'AJ-HOMESIREN-B']);
});

test('prepara Explorer una vez por consulta y reutiliza sus datos para cada resultado', () => {
  const calls = {prepare: 0, classification: 0, order: 0, legacy: 0};
  const search = engine({
    HXA_EXPLORER_PREPARE_SEARCH() {
      calls.prepare++;
      return {
        classification() { calls.classification++; return {family: 'Sirenas'}; },
        naturalOrder(product) { calls.order++; return product.name.endsWith('-W') ? 0 : 1; }
      };
    },
    HXA_EXPLORER_CLASSIFICATION() { calls.legacy++; },
    HXA_EXPLORER_NATURAL_ORDER() { calls.legacy++; }
  });
  assert.deepEqual(names(search.rows(products, 'homesi')), ['AJ-HOMESIREN-W', 'AJ-HOMESIREN-B']);
  assert.deepEqual(calls, {prepare: 1, classification: 2, order: 2, legacy: 0});
  search.rows(products, '');
  assert.equal(calls.prepare, 1);
});
