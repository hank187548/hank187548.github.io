const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'..','script.js'),'utf8');
function setup() {
  const button = {attrs:{'aria-expanded':'false'},events:{},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},addEventListener(k,v){this.events[k]=v;},focus(){this.focused=true;}};
  const link = {addEventListener(k,v){this[k]=v;}};
  const menu = {classList:{toggle(){}},setAttribute(){},querySelectorAll(){return [link];}};
  const doc = {events:{},body:{style:{}},querySelector:s=>s.includes('menu-button')?button:menu,addEventListener(k,v){this.events[k]=v;}};
  const media = {addEventListener(k,v){this[k]=v;}};
  vm.runInNewContext(source.slice(source.indexOf('  const menuButton ='),source.indexOf('  const year =')),{document:doc,window:{matchMedia:()=>media}});
  return {button,doc,media,link};
}
test('mobile menu opens, closes on navigation, and releases scroll',()=>{
  const c=setup(); c.button.events.click();
  assert.equal(c.doc.body.style.overflow,'hidden');
  c.link.click(); assert.equal(c.button.attrs['aria-expanded'],'false');
  assert.equal(c.doc.body.style.overflow,'');
});
test('Escape and desktop breakpoint both release an open mobile menu',()=>{
  const c=setup(); c.button.events.click();
  c.doc.events.keydown({key:'Escape'});
  assert.equal(c.doc.body.style.overflow,''); assert.equal(c.button.focused,true);
  c.button.events.click(); c.media.change({matches:true});
  assert.equal(c.doc.body.style.overflow,''); assert.equal(c.button.attrs['aria-expanded'],'false');
});
