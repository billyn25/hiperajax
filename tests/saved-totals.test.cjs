'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const totalsStart = source.indexOf('function calcularTotalesPresupuesto(');
const totalsEnd = source.indexOf('function moverLinea(', totalsStart);
const applyStart = source.indexOf('function aplicarPresupuesto(d){');
const applyEnd = source.indexOf('function storageHashPresupuestos(', applyStart);
const managerStart = source.indexOf("(function(){\n  let pmSelectedId='';");
const managerEnd = source.indexOf('  window.HX_PM_RENDER=render;', managerStart);
assert.ok(totalsStart >= 0 && totalsEnd > totalsStart, 'Cálculo compartido disponible');
assert.ok(applyStart >= 0 && applyEnd > applyStart, 'Recuperación real disponible');
assert.ok(managerStart >= 0 && managerEnd > managerStart, 'Gestor real disponible');

const totalsCode = source.slice(totalsStart, totalsEnd);
const applyCode = source.slice(applyStart, applyEnd);
const managerCode = source.slice(managerStart, managerEnd) + `
  window.managerTest = {
    calc, filtered, render, preview,
    select(id) { pmSelectedId = id; },
    all() { pmView = { type: 'all', value: '' }; }
  };
})();`;
const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function element() {
  return {
    value: '', textContent: '', innerHTML: '', hidden: false, disabled: false,
    classList: { add() {}, remove() {}, toggle() {} },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener(event, handler) { this['on' + event] = handler; },
    setAttribute() {}
  };
}

function run(list, mobile = false) {
  const elements = {};
  for (const id of [
    'iva', 'dtoGeneral', 'pmModal', 'pmList', 'pmPreview', 'pmPreviewTitle',
    'pmCount', 'pmVisibleCount', 'pmFolderRecentCount', 'pmFolderAllCount',
    'pmFilterNotice', 'pmShowAllDates', 'pmFilterStore', 'pmFilterCommercial',
    'pmFilterDate', 'pmSearch', 'pmSort'
  ]) elements[id] = element();
  const toggle = element();
  elements.pmPreview.querySelector = selector =>
    selector === '.pmx-products-toggle' && elements.pmPreview.innerHTML.includes('pmx-products-toggle')
      ? toggle : null;
  const scope = {
    console, Intl, Date, lineas: [], hxIdentificadorActual: '',
    $: selector => elements[selector.replace(/^#/, '')] || null,
    render() {}, setTimeout() {}, clearTimeout() {},
    leerListaPresupuestos: () => list,
    escapeHtml: value => String(value ?? ''),
    fmt: money,
    matchMedia: () => ({ matches: mobile }),
    document: {
      getElementById: id => elements[id] || null,
      querySelectorAll: () => [],
      addEventListener() {}
    },
    window: { addEventListener() {}, dispatchEvent() {} }
  };
  vm.createContext(scope);
  vm.runInContext(totalsCode + applyCode + '\nwindow.editorCalc=calc;\n' + managerCode, scope, { timeout: 3000 });
  const api = scope.window.managerTest;
  api.all();
  return {
    api, elements, toggle,
    currentLines: () => scope.lineas,
    editor(presupuesto) {
      scope.aplicarPresupuesto(presupuesto);
      return scope.window.editorCalc();
    }
  };
}

function budget(extra = {}) {
  return {
    id: 'test-budget', numero: 'PRUEBA-001', fecha: '2026-11-03',
    dtoGeneral: 55, iva: 21,
    lineas: [{ name: 'PRODUCTO-1', pvp: 100, qty: 2, dto: 55 }],
    ...extra
  };
}

function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} debe ser ${expected}`);
}

test('El descuento general ya incluido en cada línea se aplica una sola vez', () => {
  const p = budget();
  const { api, editor } = run([p]);
  close(api.calc(p).total, 108.90);
  close(editor(p).total, 108.90);
  assert.equal(api.calc(p).count, 1);
});

test('Cantidades, descuentos distintos, líneas manuales y separadores coinciden al recuperar', () => {
  const p = budget({ lineas: [
    { name: 'PRODUCTO-1', pvp: 100, qty: 2, dto: 55 },
    { name: 'PRODUCTO-2', pvp: 20, qty: 3, dto: 0 },
    { name: '', desc: 'Trabajo manual', pvp: 50, qty: 2, dto: 10, manual: true, tipo: 'linea-vacia' },
    { name: 'PRODUCTO-3', pvp: 200, qty: 1, dto: 100 },
    { name: 'SECCIÓN', pvp: 9999, qty: 10, dto: 0, separador: true },
    { name: 'OTRA SECCIÓN', pvp: 8888, qty: 10, dto: 0, tipo: 'separador' }
  ] });
  const { api, editor } = run([p]);
  close(api.calc(p).total, 290.40);
  close(editor(p).total, 290.40);
  assert.equal(api.calc(p).count, 4);
});

test('Un cambio posterior por línea conserva descuentos de 0 % y 100 %', () => {
  for (const dtoGeneral of [0, 55, 100]) {
    const p = budget({ dtoGeneral, iva: 0, lineas: [
      { name: 'SIN-DESCUENTO', pvp: 80, qty: 2, dto: 0 },
      { name: 'GRATIS', pvp: 500, qty: 3, dto: 100 }
    ] });
    const { api, editor } = run([p]);
    close(api.calc(p).total, 160);
    close(editor(p).total, 160);
  }
});

test('IVA numérico o guardado como texto produce el mismo total que el editor', () => {
  for (const iva of [0, 4, 10, 21, '21']) {
    const p = budget({ iva });
    const { api, editor } = run([p]);
    const expected = 90 + 90 * Number(iva) / 100;
    close(api.calc(p).total, expected);
    close(editor(p).total, expected);
  }
});

test('Los decimales no se redondean antes del total', () => {
  const p = budget({ lineas: [{ name: 'DECIMAL', pvp: 123.45, qty: 3, dto: 12.5 }] });
  const { api, editor } = run([p]);
  close(api.calc(p).total, 392.1080625);
  close(editor(p).total, 392.1080625);
  assert.equal(money.format(api.calc(p).total), money.format(392.11));
});

for (const mobile of [false, true]) {
  test(`Tarjeta y previsualización muestran el total completo (${mobile ? 'móvil' : 'PC'})`, () => {
    const p = budget({ iva: 0, lineas: Array.from({ length: 7 }, (_, index) => ({
      name: `PRODUCTO-${index + 1}`, pvp: 10, qty: 1, dto: 0
    })) });
    const { api, elements, toggle, editor } = run([p], mobile);
    api.select(p.id);
    api.render();
    const total = money.format(70);
    assert.ok(elements.pmList.innerHTML.includes(`<strong>${total}</strong>`));
    assert.ok(elements.pmPreview.innerHTML.includes(`<strong>${total}</strong>`));
    assert.ok(elements.pmList.innerHTML.includes('7 productos'));
    assert.ok(elements.pmPreview.innerHTML.includes('Mostrar todos (7)'));
    assert.equal((elements.pmPreview.innerHTML.match(/<li>/g) || []).length, 5);
    toggle.onclick();
    assert.equal((elements.pmPreview.innerHTML.match(/<li>/g) || []).length, 7);
    assert.ok(elements.pmPreview.innerHTML.includes(`<strong>${total}</strong>`));
    close(editor(p).total, 70);
  });
}

test('Ordenar por importe utiliza los totales corregidos', () => {
  const high = budget({ id: 'high', dtoGeneral: 99, iva: 0, lineas: [{ name: 'A', pvp: 100, qty: 1, dto: 0 }] });
  const low = budget({ id: 'low', dtoGeneral: 0, iva: 0, lineas: [{ name: 'B', pvp: 80, qty: 1, dto: 0 }] });
  const { api, elements } = run([low, high]);
  elements.pmSort.value = 'total';
  assert.deepEqual(Array.from(api.filtered(), p => p.id), ['high', 'low']);
});

test('Consultar totales, renderizar y recuperar no modifica el presupuesto guardado', () => {
  const p = budget();
  p.lineas.forEach(Object.freeze);
  Object.freeze(p.lineas);
  Object.freeze(p);
  const before = JSON.stringify(p);
  const { api, editor } = run([p]);
  api.calc(p);
  api.select(p.id);
  api.render();
  editor(p);
  assert.equal(JSON.stringify(p), before);
});

test('Un presupuesto sin líneas suma cero', () => {
  const p = budget({ lineas: [] });
  const { api, editor } = run([p]);
  assert.equal(api.calc(p).count, 0);
  assert.equal(api.calc(p).total, 0);
  assert.equal(editor(p).total, 0);
});

test('Recuperar líneas antiguas normaliza cantidad y descuento para filas y total', () => {
  const p = budget({ lineas: [
    { name: 'ANTIGUO-1', pvp: 100, cantidad: 2, descuento: 25 },
    { name: 'ANTIGUO-2', pvp: 20, cant: 3, descuento: 50 },
    { name: 'SECCIÓN', pvp: 9999, cant: 10, tipo: 'separador' }
  ] });
  const before = JSON.stringify(p);
  const { api, editor, currentLines } = run([p]);
  close(api.calc(p).total, 217.80);
  close(editor(p).total, 217.80);
  assert.deepEqual(Array.from(currentLines(), line => [line.qty, line.dto, line.separador]), [
    [2, 25, false], [3, 50, false], [1, 0, true]
  ]);
  assert.equal(JSON.stringify(p), before);
});

test('PDF guardado usa cantidades, descuentos y total de su fuente sin alterar el editor', async () => {
  const pdfStart = source.indexOf('async function pdf(presupuestoFuente=null){');
  const pdfEnd = source.indexOf('/* Explorer Pro vive en explorer.js.', pdfStart);
  assert.ok(pdfStart >= 0 && pdfEnd > pdfStart, 'Generación PDF real disponible');
  const p = budget({ numero: 'GUARDADO-001', cliente: 'Cliente del documento', lineas: [
    { name: 'ANTIGUO-1', pvp: 100, cantidad: 2, descuento: 25 },
    { name: 'ANTIGUO-2', pvp: 20, cant: 3, descuento: 50 },
    { name: 'SECCIÓN', pvp: 9999, cant: 10, tipo: 'separador' }
  ] });
  p.lineas.forEach(Object.freeze);
  Object.freeze(p.lineas);
  Object.freeze(p);
  const savedBefore = JSON.stringify(p);
  const editorLines = Object.freeze([Object.freeze({ name: 'EDITOR', pvp: 99999, qty: 8, dto: 0 })]);
  const captured = { text: [], body: null, filename: null };
  class PdfStub {
    constructor() {
      this.internal = {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
        getNumberOfPages: () => 1
      };
    }
    text(value) { captured.text.push(value); }
    getTextWidth() { return 0; }
    autoTable(options) { captured.body = options.body; this.lastAutoTable = { finalY: 100 }; }
    save(filename) { captured.filename = filename; }
  }
  PdfStub.API = { autoTable() {} };
  for (const method of ['setFillColor', 'rect', 'setTextColor', 'setFont', 'setFontSize',
    'setDrawColor', 'setLineWidth', 'line', 'roundedRect', 'setPage']) {
    PdfStub.prototype[method] = function () {};
  }
  const scope = {
    console, lineas: editorLines, fmt: money,
    $() { throw new Error('El PDF guardado no debe leer campos del editor'); },
    aplicarPresupuesto() { throw new Error('El PDF guardado no debe abrirse en el editor'); },
    alert(message) { throw new Error(message); },
    navigator: { userAgent: 'Node test', platform: '', maxTouchPoints: 0 },
    imagenComoDataURL: async () => null,
    descripcionPdfCorta: line => line.desc || '',
    formatFechaES: value => value,
    window: { jspdf: { jsPDF: PdfStub } }
  };
  vm.createContext(scope);
  vm.runInContext(totalsCode + source.slice(pdfStart, pdfEnd), scope, { timeout: 3000 });
  await scope.pdf(p);
  assert.equal(captured.body.length, 3);
  assert.deepEqual(Array.from(captured.body[0]).slice(3), ['2', '25%', money.format(150)]);
  assert.deepEqual(Array.from(captured.body[1]).slice(3), ['3', '50%', money.format(30)]);
  assert.equal(captured.body[2][0].colSpan, 6);
  const totalPosition = captured.text.indexOf('TOTAL');
  assert.ok(totalPosition >= 0);
  assert.equal(captured.text[totalPosition + 1], money.format(217.80));
  assert.ok(captured.text.includes('Cliente del documento'));
  assert.equal(captured.filename, 'presupuesto_GUARDADO-001.pdf');
  assert.equal(scope.lineas, editorLines);
  assert.equal(JSON.stringify(p), savedBefore);
});
