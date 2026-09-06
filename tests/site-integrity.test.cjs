const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const c = {window:{}};
for (const filename of ['journeys.js','archive.js']) vm.runInNewContext(fs.readFileSync(path.join(root,'content',filename),'utf8'), c);
const journeys = c.window.JOURNEYS;
const exists = filename => assert.ok(fs.existsSync(filename), `Missing file: ${path.relative(root, filename)}`);
for (const j of journeys) {
  test(`${j.slug}: page, cover, all photos, videos and posters exist in chronological order`, () => {
    exists(path.join(root,j.href,'index.html'));
    exists(path.join(root,j.cover.split('?')[0]));
    const media = c.window.JOURNEY_MEDIA[j.slug];
    assert.ok(media.length);
    assert.equal(new Set(media).size,media.length);
    assert.deepEqual([...media].sort(), [...media]);
    for (const filename of media) {
      exists(path.join(root,'assets/archive',j.slug,filename));
      if (filename.endsWith('.mp4')) exists(path.join(root,'assets/archive',j.slug,filename.replace('.mp4','-poster.webp')));
    }
  });
}
for (const filename of ['index.html', ...journeys.map(j => `${j.href}index.html`)]) {
  test(`${filename}: internal links, scripts, images, and styles resolve`, () => {
    const full = path.join(root,filename);
    const html = fs.readFileSync(full,'utf8');
    for (const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if (/^(?:https?:|mailto:|#)/.test(url)) continue;
      let target = path.resolve(path.dirname(full),url.split(/[?#]/)[0]);
      if (url.endsWith('/')) target = path.join(target,'index.html');
      exists(target);
    }
    assert.ok(html.includes('name="viewport"'));
  });
}
