// Run with: node --test tests/route-animation.test.cjs
// Execute the production geometry/drawing functions against a recording canvas.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const functions = source.slice(source.indexOf('  function createRouteShape('), source.indexOf('  function renderCities('));
const data = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'content/journeys.js'), 'utf8'), data);
const journeys = data.window.JOURNEYS.filter(j => j.type === 'Travel').map(j => ({
  ...j, stops: j.stops.map(s => ({ ...s, x: (s.lon + 180) / 360 * 100, y: (90 - s.lat) / 180 * 100 }))
}));

for (const reduced of [false, true]) {
  test(`flight plays progressively and advances with reduced motion = ${reduced}`, () => {
    const frames = [];
    const paints = [];
    const timers = [];
    const c = {
      reducedMotion: { matches: reduced }, routeProgress: 0, routeGeneration: 1,
      heroVisible: true, document: { hidden: false }, performance: { now: () => 0 },
      routeAnimation: 0, routeTimer: 0, routeCycleMs: 8800, activeRoute: 0,
      drawRoute: progress => paints.push(progress), updateCities() {}, activateRoute() {},
      window: {
        requestAnimationFrame: callback => { frames.push(callback); return frames.length; },
        clearTimeout() {}, setTimeout: (callback, ms) => { timers.push({ callback, ms }); return 1; }
      }
    };
    vm.createContext(c);
    vm.runInContext(source.slice(source.indexOf('  function animateRoute('), source.indexOf('  function updateRouteContent(')), c);
    c.animateRoute();
    assert.deepEqual(paints, [], 'never paint the full route before the first frame');
    frames.shift()(800);
    assert.equal(paints.at(-1), .25);
    frames.shift()(1600);
    assert.equal(paints.at(-1), .5);
    frames.shift()(3200);
    assert.equal(paints.at(-1), 1);
    c.scheduleNextRoute();
    assert.equal(timers.at(-1)?.ms, 8800, 'automatic cycling is enabled on both hosts');
  });
}

function renderer(width, height) {
  const mobile = width <= 700;
  const split = width >= 1000 && width / height >= 1.2;
  const heroHeight = Math.max(height, mobile ? 700 : split ? 580 : 680);
  const hero = { clientWidth: width, clientHeight: heroHeight };
  const mapWidth = mobile ? width * 1.9 : Math.max(width * 1.22, height * 2);
  const mapFrame = { style: { setProperty() {} } };
  const strokes = [];
  const dots = [];
  const context = {
    hero, mapFrame, siteHeader: { offsetHeight: 80 }, routeCopy: { offsetTop: heroHeight - 300 },
    mobileLayout: { matches: mobile }, window: { devicePixelRatio: 3 },
    routeViewport: {}, currentProjection: null, routeShape: null, routeGeometry: null,
    routeCanvas: { parentElement: hero, style: {} }, routeDensity: 1,
    getComputedStyle: e => e === hero
      ? { getPropertyValue: () => split ? 'split' : 'stacked' }
      : { width: String(mapWidth), height: String(mapWidth / 2) },
    Path2D: class {
      constructor() { this.commands = []; }
      moveTo(x, y) { this.start = { x, y }; }
      quadraticCurveTo(cx, cy, x, y) { this.commands.push({ cx, cy, x, y }); }
    },
    routeContext: {
      clearRect() { strokes.length = 0; dots.length = 0; },
      setTransform() {}, save() {}, restore() {}, beginPath() {}, fill() {},
      createLinearGradient() { return { addColorStop() {} }; },
      stroke(p) { strokes.push(p); }, arc(x, y) { dots.push({ x, y }); }
    }
  };
  vm.createContext(context);
  vm.runInContext(functions, context);
  return { context, strokes, dots };
}

for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1024, 768], [1280, 600], [1366, 768], [1920, 1080], [2560, 1080], [3840, 2160]]) {
  test(`all six routes fit and trace correctly at ${width} × ${height}`, () => {
    const { context: c, strokes, dots } = renderer(width, height);
    for (const journey of journeys) {
      c.applyMapFocus(journey);
      c.sizeRouteCanvas();
      c.routeGeometry = c.buildRouteGeometry(journey);
      const geometry = c.routeGeometry;
      assert.ok(geometry.totalLength > 0, journey.title);
      for (const segment of geometry.segments) {
        for (const p of segment.points) {
          assert.ok(p.x >= 0 && p.x <= width && p.y >= 80 && p.y <= c.hero.clientHeight - 80, `${journey.title}: route outside frame`);
        }
      }
      assert.ok(c.routeCanvas.width * c.routeCanvas.height <= 16010000, 'retina canvas memory stays bounded');
      c.drawRoute(0);
      assert.equal(strokes.length, 0, 'no route before departure');
      for (const progress of [.001, .1, .3, .6, .9, .999]) {
        c.drawRoute(progress);
        const commands = strokes[0].commands;
        const endpoint = commands.at(-1);
        const tip = dots[0];
        assert.ok(Math.hypot(endpoint.x - tip.x, endpoint.y - tip.y) < .002, 'line ends exactly at the flying point');
        const expectedSegments = geometry.segments.filter(s => s.offset < geometry.totalLength * progress).length;
        assert.equal(commands.length, expectedSegments, 'future segments must not be drawn');
      }
      c.drawRoute(1);
      assert.equal(strokes[0].commands.length, geometry.segments.length, 'complete route at arrival');
      const end = strokes[0].commands.at(-1);
      const destination = geometry.stops.at(-1);
      assert.ok(Math.hypot(end.x - destination.x, end.y - destination.y) < .002);
    }
  });
}
