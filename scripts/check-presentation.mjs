// Presentation data and pointer events in a simulated DOM; no visual browser claim.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {resonanceSentences,meaningPreview} from '../dist/resonance.mjs';
import {initStarCursor} from '../dist/cursor.mjs';
const poems=JSON.parse(fs.readFileSync(new URL('../dist/poems.json',import.meta.url),'utf8'));
for(const p of poems){const copy=structuredClone(p),parts=resonanceSentences(p);assert(parts.length);assert.equal(parts.map(x=>x.text).join(''),p.realLife.trim());for(const s of parts){assert(s.kaomoji.length);assert(!/[\r\n]/u.test(s.kaomoji));assert(Array.from(s.kaomoji).length<=30)}assert(Array.from(meaningPreview(p.meaning)).length<=43);assert.deepEqual(p,copy)}
assert(resonanceSentences(poems[0])[0].kaomoji.includes('づ'));assert(resonanceSentences(poems[1])[0].kaomoji.includes('ω'));assert(resonanceSentences({tags:['悼亡'],realLife:'想念。仍想念。'}).every(s=>s.kaomoji==='(｡•́︿•̀｡)'));
class Element extends EventTarget{constructor(){super();this.style={};this.attrs={};this.children=[];this.classes=new Set();this.classList={add:(...xs)=>xs.forEach(x=>this.classes.add(x)),remove:(...xs)=>xs.forEach(x=>this.classes.delete(x)),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)}}setAttribute(k,v){this.attrs[k]=v}append(el){this.children.push(el)}closest(){return null}remove(){this.removed=true}}
const doc=new Element(),win=new Element();doc.body=new Element();doc.documentElement=new Element();doc.createElement=()=>new Element();globalThis.document=doc;globalThis.window=win;
// An embedded browser may report coarse input even when a real mouse is in use.
globalThis.matchMedia=()=>({matches:false});let frame;globalThis.requestAnimationFrame=fn=>{frame=fn;return 1};globalThis.cancelAnimationFrame=()=>{frame=null};
const emit=(el,name,props={})=>{const e=new Event(name);Object.assign(e,props);el.dispatchEvent(e)};
initStarCursor();assert.equal(doc.body.children.length,1);const star=doc.body.children[0];assert(!doc.body.classes.has('has-star-cursor'));
emit(doc,'pointermove',{pointerType:'mouse',clientX:80,clientY:120});frame();assert(star.classes.has('visible'));assert(doc.body.classes.has('has-star-cursor'));assert.equal(star.style.transform,'translate3d(80px,120px,0)');
emit(doc,'pointerdown',{pointerType:'mouse'});assert(star.classes.has('pressed'));emit(doc,'pointerup');assert(!star.classes.has('pressed'));
emit(doc,'pointermove',{pointerType:'touch',clientX:20,clientY:30});assert(!star.classes.has('visible'));assert(!doc.body.classes.has('has-star-cursor'));
emit(doc,'pointermove',{pointerType:'mouse',clientX:80,clientY:120});frame();emit(win,'blur');assert(!star.classes.has('visible'));emit(win,'pagehide',{persisted:false});assert(star.removed);
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../dist/style.css',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8');assert(html.includes('<title>诗眼•见字如晤</title>'));assert(!html.includes('data-action="journey"'));assert(html.includes('app.mjs?v=20261008-4'));assert(html.includes('style.css?v=20261008-4'));assert([...app.matchAll(/from '(.*?)'/g)].every(x=>x[1].endsWith('?v=20261008-4')));assert(css.includes('.kaomoji{display:inline-block;white-space:nowrap!important;'));
console.log('PASS: 300首逐句颜文字/原文保留/短释意、全文展开集成、嵌入环境真实鼠标星星/触摸隐藏/失焦释放、名称/无旅程入口/资源版本一致/颜文字不拆行（模拟上下文）');
