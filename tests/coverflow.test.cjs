const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

function setup(width = 1366, cardWidth = 330) {
  const element = () => {
    const classes = new Set();
    const properties = {};
    const captured = new Set();
    return {
      textContent: '', dataset: {}, events: {}, children: [], offsetWidth: cardWidth, clientWidth: width,
      style: { setProperty: (key, value) => { properties[key] = value; }, getPropertyValue: key => properties[key] },
      classList: { add: key => classes.add(key), remove: key => classes.delete(key), toggle: (key, on) => on ? classes.add(key) : classes.delete(key) },
      setAttribute() {}, append(child) { this.children.push(child); },
      addEventListener(name, callback) { this.events[name] = callback; },
      setPointerCapture: id => captured.add(id), hasPointerCapture: id => captured.has(id), releasePointerCapture: id => captured.delete(id)
    };
  };
  const nodes = Object.fromEntries(['coverflow', 'coverflow-stage', 'current', 'current-title', 'current-route', 'previous', 'next'].map(key => [`[data-${key}]`, element()]));
  const frames = new Map();
  let now = 0, sequence = 0;
  const context = {
    journeys: Array.from({length: 7}, (_, i) => ({ title: `Journey ${i}`, route: `Route ${i}` })),
    pad: i => String(i + 1).padStart(2, '0'), performance: { now: () => now },
    document: { querySelector: selector => nodes[selector], createElement: element },
    window: { innerWidth: width, setTimeout() {}, requestAnimationFrame: fn => { frames.set(++sequence, fn); return sequence; }, cancelAnimationFrame: id => frames.delete(id) }
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  const coverflow ='), source.indexOf('  const heroObserver =')) + '\nrenderCoverflow();', context);
  const stage = nodes['[data-coverflow-stage]'];
  return {
    nodes, stage, x: index => +stage.children[index].style.getPropertyValue('--x').replace('px', ''),
    state: () => vm.runInContext('({selected, coverPosition, coverTarget, suppressClick})', context),
    tick(ms) { now += ms; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn(now)); },
    pointer(type, x, y = 0, extra = {}) { const event = { type, clientX: x, clientY: y, pointerId: 1, button: 0, isPrimary: true, preventDefault() {}, ...extra }; stage.events[type](event); }
  };
}

for (const [width, card] of [[1366, 330], [390, 285]]) {
  test(`arrows animate progressively at width ${width}`, () => {
    const c = setup(width, card);
    const before = c.x(1);
    c.nodes['[data-next]'].events.click();
    assert.equal(c.x(1), before);
    c.tick(200);
    assert.ok(c.x(1) > 0 && c.x(1) < before);
    c.tick(450);
    assert.equal(c.x(1), 0);
    c.nodes['[data-previous]'].events.click();
    c.tick(650);
    assert.equal(c.x(0), 0);
  });
  test(`drag follows pointer, settles, and suppresses link activation at width ${width}`, () => {
    const c = setup(width, card);
    c.pointer('pointerdown', 300);
    c.pointer('pointermove', 220);
    assert.ok(c.x(0) < 0);
    assert.ok(c.stage.hasPointerCapture(1));
    c.pointer('pointerup', 220);
    assert.equal(c.state().suppressClick, true);
    c.tick(650);
    assert.equal(c.state().selected, 1);
    assert.equal(c.x(1), 0);
    let prevented = false;
    c.stage.events.click({ target: { closest: () => c.stage.children[1] }, preventDefault() { prevented = true; } });
    assert.ok(prevented);
    assert.equal(c.stage.hasPointerCapture(1), false);
  });
}

test('touch scrolling and cancelled gestures do not change the journey', () => {
  const c = setup(390, 285);
  c.pointer('pointerdown', 250);
  c.pointer('pointermove', 249, 60);
  c.pointer('pointercancel', 249, 60);
  assert.equal(c.state().selected, 0);
  c.pointer('pointerdown', 250);
  c.pointer('pointermove', 140);
  c.pointer('pointercancel', 140);
  c.tick(650);
  assert.equal(c.state().selected, 0);
  assert.equal(c.x(0), 0);
});

test('tap opens the active card normally', () => {
  const c = setup();
  c.pointer('pointerdown', 250);
  c.pointer('pointerup', 250);
  let prevented = false;
  c.stage.events.click({ target: { closest: () => c.stage.children[0] }, preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
});

test('wraparound and repeated arrows keep the nearest continuous path', () => {
  const c = setup();
  c.nodes['[data-previous]'].events.click();
  c.tick(300);
  assert.ok(c.state().coverPosition < 0 && c.state().coverPosition > -1);
  c.tick(350);
  assert.equal(c.state().selected, 6);
  assert.equal(c.x(6), 0);
  c.nodes['[data-next]'].events.click();
  c.nodes['[data-next]'].events.click();
  c.tick(650);
  assert.equal(c.state().selected, 1);
  assert.equal(c.x(1), 0);
});
