// State/render integration checks without a browser engine. This does not verify visual layout.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createStore} from '../dist/store.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../dist/poems.json',import.meta.url),'utf8'));
const elements=new Map();
class E{constructor(){this._html='';this.children=[];this.classList={add(){},remove(){},toggle(){},contains(){return false}}}set innerHTML(s){this._html=s;for(const id of [...elements.keys()])if(!['#app','#notice','#stars','#confirm','#confirm-title','#confirm-body'].includes(id))elements.delete(id)}get innerHTML(){return this._html}querySelector(k){return get(k)}addEventListener(){}setAttribute(){}append(e){this.children.push(e)}focus(){}click(){}setPointerCapture(){}get style(){return {}}}
const get=k=>{if(!elements.has(k))elements.set(k,new E());return elements.get(k)};
class Memory{map=new Map();get length(){return this.map.size}key(i){return [...this.map.keys()][i]}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,v)}removeItem(k){this.map.delete(k)}}
const storage=new Memory();const registry=[];const context=vm.createContext({createStore,console,document:{querySelector:get,querySelectorAll:()=>[],createElement:()=>new E(),body:new E(),addEventListener(){},modelContext:{registerTool(t){registry.push(t)}}},window:{scrollTo(){},addEventListener(){},scrollY:0},localStorage:storage,matchMedia:()=>({matches:false,addEventListener(){}}),location:{_hash:'',get hash(){return this._hash},set hash(v){this._hash=v.startsWith('#')?v:'#'+v},reload(){}},fetch:async()=>({ok:true,json:async()=>structuredClone(data)}),setTimeout:()=>1,clearTimeout(){},queueMicrotask:f=>f(),getSelection:()=>({toString:()=>''}),URL,Blob,AbortController,Date,Map,Set,Array,Error,Promise});
const source=fs.readFileSync(new URL('../dist/app.mjs',import.meta.url),'utf8').replace("import {createStore} from './store.mjs';",'');vm.runInContext(source,context);await new Promise(r=>setImmediate(r));
const run=s=>vm.runInContext(s,context),html=()=>get('#app').innerHTML;
assert(html().includes('picker'));assert.equal(run('count()'),0);
run('select(0,false);checkAnswer()');assert.equal(run('current().phase'),'select');assert.equal(run('count()'),0);
run('select(poem().options.indexOf(poem().answer),false);checkAnswer()');assert.equal(run('current().phase'),'read');assert.equal(run('count()'),1);assert(html().includes('海内存知己，'));assert(html().replace(/<[^>]+>/g,'').includes('天涯若比邻。'));assert(html().includes(data[0].realLife));
run('enterVolume(0);current().phase="preview";renderHome()');assert(html().includes('已查看答案，尚未点亮'));assert.equal(run('count()'),1);
run('store.favorite("p002",true);view="library";tab="favorites";renderLibrary()');assert(html().includes('山中'));assert.equal(run('count()'),1);
run('tab="all";query="王安石";dynasty="宋";renderLibrary()');assert(run('filtered().every(p=>p.author==="王安石"&&p.dynasty==="宋")'));assert(run('filtered().length')>0);
const boat=data.find(p=>p.title==='泊船瓜洲');run(`practice=fresh('${boat.id}','practice');practice.phase='read';renderHome()`);assert(html().replace(/<[^>]+>/g,'').includes('明月何时照我还。'));assert.equal(run('active.id'),'p002');
run('practice=null;enterVolume(1)');for(let i=0;i<10;i++)run('next(true)');assert.equal(run('active.phase'),'end');assert(html().includes('还有 10 首'));assert.equal(run('count()'),1);
run('renderJourney()');assert.equal((html().match(/class="volume"/g)||[]).length,30);
assert.deepEqual(registry.map(x=>x.name),['read_poetry_progress','open_poem_detail']);assert.equal(registry[0].execute({}).total,300);registry[1].execute({poemId:'p001'});assert(html().includes(data[0].title));assert.throws(()=>registry[1].execute({poemId:'bad'}));
console.log('PASS: 页面状态与渲染集成、错误/正确判定、答案预览、完整联句、收藏筛选、作者筛选、独立练习、跳过卷末、30卷渲染、WebMCP工具注册及输入校验（模拟上下文）');
