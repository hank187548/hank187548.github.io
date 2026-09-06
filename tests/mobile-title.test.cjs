const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname,'..','script.js'),'utf8');
const fn = source.slice(source.indexOf('  function fitMobileRouteTitle('),source.indexOf('  function updateRouteContent('));
function setup(width, naturalWidth, mobile = true) {
  const props = {};
  const c = {mobileLayout:{matches:mobile},routeTitle:{clientWidth:width,scrollWidth:naturalWidth,style:{removeProperty:key=>delete props[key],setProperty:(key,val)=>{props[key]=val;}}},window:{getComputedStyle:()=>({fontSize:'60px'})}};
  vm.createContext(c); vm.runInContext(fn,c);
  return {c,props,fit:()=>c.fitMobileRouteTitle()};
}
test('long mobile titles shrink enough for a single line',()=>{
  const s=setup(261,390); s.fit();
  assert.ok(parseFloat(s.props['--route-title-size'])/60*390<=259);
});
test('short titles keep the base size instead of stretching',()=>{
  const s=setup(331,250); s.fit();
  assert.equal(s.props['--route-title-size'],undefined);
});
test('switching to desktop removes the mobile font override',()=>{
  const s=setup(261,390); s.fit();
  s.c.mobileLayout.matches=false; s.fit();
  assert.equal(s.props['--route-title-size'],undefined);
});
test('font fitting handles a hidden/unmeasured title safely',()=>{
  const s=setup(0,390); s.fit();
  assert.equal(s.props['--route-title-size'],undefined);
});
