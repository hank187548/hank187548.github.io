const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'travel/story.js'), 'utf8');

function setup() {
  let doc;
  const node = () => {
    const captures = new Set();
    return { events: {}, style: {}, dataset: {}, hidden: true,
      classList: { add() {}, remove() {} },
      setAttribute() {}, focus() { doc.activeElement = this; },
      addEventListener(name, fn) { this.events[name] = fn; },
      animate() { return { cancel() {} }; },
      setPointerCapture: id => captures.add(id), hasPointerCapture: id => captures.has(id), releasePointerCapture: id => captures.delete(id)
    };
  };
  const lightbox = node(), img = node(), meta = node(), opener = node(), gallery = node();
  const close = node(), prev = node(), next = node();
  const nodes = { '[data-lightbox]': lightbox, '[data-lightbox-image]': img, '[data-lightbox-meta]': meta,
    '[data-lightbox-close]': close, '[data-lightbox-previous]': prev, '[data-lightbox-next]': next };
  lightbox.querySelector = selector => nodes[selector];
  lightbox.querySelectorAll = () => [close, prev, next];
  doc = { activeElement: opener, body: node(), events: {}, querySelector: selector => nodes[selector], addEventListener(name, fn) { this.events[name] = fn; } };
  const context = { document: doc, gallery, media: ['first.webp', 'clip.mp4', 'second.webp'], journey: { title: 'Test journey' }, assetUrl: s => s, formatDate: s => s };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('  const photos ='), source.lastIndexOf('})();')), context);
  return { doc, img, lightbox, opener, close, prev, next, meta,
    open: () => vm.runInContext('openLightbox("first.webp")', context),
    pointer(type, x, y = 100) { img.events[type]({ type, clientX: x, clientY: y, button: 0, pointerId: 1, pointerType: 'touch', isPrimary: true, preventDefault() {} }); }
  };
}
test('photo viewer supports touch swipes in both directions, skips videos, and wraps', () => {
  const c = setup(); c.open();
  c.pointer('pointerdown', 250); c.pointer('pointermove', 150);
  assert.ok(c.img.style.transform.includes('-65px'));
  c.pointer('pointerup', 150);
  assert.equal(c.img.src, 'second.webp');
  c.pointer('pointerdown', 150); c.pointer('pointermove', 250); c.pointer('pointerup', 250);
  assert.equal(c.img.src, 'first.webp');
  c.prev.events.click(); assert.equal(c.img.src, 'second.webp');
  c.next.events.click(); assert.equal(c.img.src, 'first.webp');
});
test('tap, vertical movement and pointer cancellation do not switch photos', () => {
  const c = setup(); c.open();
  c.pointer('pointerdown', 200); c.pointer('pointerup', 200);
  c.pointer('pointerdown', 200); c.pointer('pointermove', 198, 150); c.pointer('pointerup', 198, 150);
  c.pointer('pointerdown', 250); c.pointer('pointermove', 150); c.pointer('pointercancel', 150);
  assert.equal(c.img.src, 'first.webp');
  assert.equal(c.img.style.transform, '');
});
test('keyboard focus stays inside the viewer and returns after closing', () => {
  const c = setup(); c.open();
  assert.equal(c.doc.activeElement, c.close);
  c.doc.events.keydown({key:'Tab',shiftKey:true,preventDefault(){}});
  assert.equal(c.doc.activeElement,c.next);
  c.doc.events.keydown({key:'Tab',shiftKey:false,preventDefault(){}});
  assert.equal(c.doc.activeElement,c.close);
  c.doc.events.keydown({key:'ArrowRight',preventDefault(){}});
  assert.equal(c.img.src,'second.webp');
  c.doc.events.keydown({key:'Escape'});
  assert.equal(c.lightbox.hidden,true);
  assert.equal(c.doc.activeElement,c.opener);
});
