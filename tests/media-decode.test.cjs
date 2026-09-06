const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname,'..');
const ffmpeg = process.env.FFMPEG_PATH || (process.platform === 'win32' ? 'C:/ffmpeg/bin/ffmpeg.exe' : 'ffmpeg');
const ffprobe = process.env.FFPROBE_PATH || (process.platform === 'win32' ? 'C:/ffmpeg/bin/ffprobe.exe' : 'ffprobe');
const available = !spawnSync(ffmpeg,['-version']).error && !spawnSync(ffprobe,['-version']).error;
const c = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'content/archive.js'),'utf8'),c);
const story = fs.readFileSync(path.join(root,'travel/story.js'),'utf8');
vm.runInNewContext(story.slice(story.indexOf('  const mobileVideoCopies ='),story.indexOf('  const absolute ='))+'\nthis.mobileVideoCopies = mobileVideoCopies;',c);
const files = new Set();
let videoCount = 0;
for (const [slug,media] of Object.entries(c.window.JOURNEY_MEDIA)) {
  files.add(`assets/archive/${slug}/cover.webp`);
  for (const filename of media) {
    if (filename.endsWith('.mp4')) {
      videoCount++;
      const playback = c.mobileVideoCopies.has(filename) ? filename.replace('.mp4','-web.mp4') : filename;
      files.add(`assets/archive/${slug}/${playback}`);
      files.add(`assets/archive/${slug}/${filename.replace('.mp4','-poster.webp')}`);
    } else files.add(`assets/archive/${slug}/${filename}`);
  }
}
test(`all ${files.size} published photos, covers, posters and videos decode without errors`, {skip:!available,timeout:120000}, () => {
  for (const file of files) {
    const result = spawnSync(ffmpeg,['-v','error','-i',path.join(root,file),'-f','null','-'],{encoding:'utf8',timeout:30000});
    assert.equal(result.status,0,`${file}: ${result.stderr || result.error}`);
    assert.equal(result.stderr.trim(),'',file);
  }
});
test(`all ${videoCount} web videos use 8-bit H.264 with valid duration`, {skip:!available}, () => {
  for (const file of [...files].filter(file=>file.endsWith('.mp4'))) {
    const result = spawnSync(ffprobe,['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,pix_fmt,width,height','-show_entries','format=duration','-of','json',path.join(root,file)],{encoding:'utf8'});
    assert.equal(result.status,0,file);
    const probe = JSON.parse(result.stdout);
    assert.equal(probe.streams[0].codec_name,'h264',file);
    assert.ok(['yuv420p','yuvj420p'].includes(probe.streams[0].pix_fmt),file);
    assert.ok(+probe.format.duration > 0,file);
  }
});
