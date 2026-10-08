// Deterministic controller/audio scheduling tests, not a browser or listening test.
import assert from 'node:assert/strict';
import {createWheel,createEffects,snapTarget,dampBoundary,SUCCESS_TIMING} from '../dist/motion.mjs';
import {createSound} from '../dist/sound.mjs';
let now=0,nextId=1;const jobs=new Map();
Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
globalThis.requestAnimationFrame=fn=>{const id=nextId++;jobs.set(id,{at:now+16,fn,frame:true});return id};
globalThis.cancelAnimationFrame=id=>jobs.delete(id);
globalThis.setTimeout=(fn,delay=0)=>{const id=nextId++;jobs.set(id,{at:now+delay,fn});return id};
globalThis.clearTimeout=id=>jobs.delete(id);
function advance(ms){const end=now+ms;while(true){const item=[...jobs.entries()].sort((a,b)=>a[1].at-b[1].at)[0];if(!item||item[1].at>end)break;now=item[1].at;jobs.delete(item[0]);item[1].fn(item[1].frame?now:undefined)}now=end}
class Node{constructor(index){this.dataset={index:String(index)};this.style={};this.attrs={}}setAttribute(k,v){this.attrs[k]=v}}
class Picker{constructor(){this.nodes=Array.from({length:6},(_,i)=>new Node(i-1));this.events=new Map();this.classList={add(){},remove(){}}}querySelectorAll(){return this.nodes}getBoundingClientRect(){return {height:180}}addEventListener(name,fn,{signal}={}){const fns=this.events.get(name)||new Set();fns.add(fn);this.events.set(name,fns);signal?.addEventListener('abort',()=>fns.delete(fn),{once:true})}setPointerCapture(){}emit(name,props={}){for(const fn of this.events.get(name)||[])fn({pointerId:1,button:0,clientY:100,preventDefault(){},...props})}}
assert.equal(snapTarget(3.8,2,4),4);assert.equal(snapTarget(-.5,-2,4),-1);assert.equal(dampBoundary(6,4),4.4);
const settled=[],ticks=[];let began=0;const el=new Picker(),wheel=createWheel(el,{onBegin:()=>began++,onTick:n=>ticks.push(n),onSettle:n=>settled.push(n)});
assert.equal(wheel.position,-1);el.emit('pointerdown');advance(16);el.emit('pointermove',{clientY:4});assert.equal(wheel.dragging,true);assert.equal(wheel.position,.5);assert.equal(settled.length,0);assert(el.nodes[2].style.transform.includes('32px'));
el.emit('pointerup',{clientY:4});advance(160);assert(!Number.isInteger(wheel.position));assert.equal(settled.length,0);advance(180);assert.equal(wheel.position,2);assert.deepEqual(settled,[2]);assert(ticks.includes(1)&&ticks.includes(2));
wheel.to(4);advance(32);el.emit('pointerdown');el.emit('pointercancel');advance(500);assert.equal(settled.length,1);
el.emit('wheel',{deltaY:40,deltaMode:0});advance(90);assert.equal(settled.length,1);advance(400);assert.equal(settled.length,2);
const before=settled.length;wheel.to(0);advance(32);wheel.destroy();advance(500);assert.equal(settled.length,before);el.emit('keydown',{key:'ArrowDown'});advance(500);assert.equal(settled.length,before);assert.equal(el.events.get('wheel').size,0);assert(began>0);
const reducedEl=new Picker(),reduced=createWheel(reducedEl,{reduced:()=>true});reduced.to(1);advance(100);assert.equal(reduced.position,1);assert(reducedEl.nodes[2].style.transform.includes('rotateX(0deg)'));reduced.destroy();
const calls=[];function animated(name){return {style:{transform:'translate3d(0,-50%,0)'},dataset:{x:'10',y:'-20'},animate(frames,options){calls.push({name,frames,options});return {finished:Promise.resolve(),cancel(){}}}}}
const root=animated('root'),quote=animated('quote'),glow=animated('glow'),reveal=Array.from({length:5},(_,i)=>animated('reveal'+i));root.querySelector=s=>s==='.full-quote'?quote:glow;root.querySelectorAll=s=>s==='.success-spark'?[animated('spark')]:reveal;
const fx=createEffects();await fx.glyph(animated('glyph'));assert(calls[0].frames.every(f=>f.transform.startsWith('translate3d(0,-50%,0)')));fx.success(root);const flash=calls.find(c=>c.name==='quote');assert.equal(flash.frames.length,5);assert(flash.frames[1].textShadow!==flash.frames[2].textShadow);assert(flash.frames[3].textShadow!==flash.frames[2].textShadow);const latest=calls.filter(c=>c.name.startsWith('reveal')).at(-1);assert(latest.options.delay+latest.options.duration+SUCCESS_TIMING.readDelay<=SUCCESS_TIMING.ready);fx.clear();
calls.length=0;createEffects(()=>true).success(root);assert.equal(calls.length,1);assert.equal(calls[0].options.duration,180);
class Param{events=[];setValueAtTime(v,t){this.events.push({v,t})}exponentialRampToValueAtTime(v,t){this.events.push({v,t})}}
let audio=null,enabled=true,volume=.35;
class Audio{constructor(){audio=this;this.state='suspended';this.currentTime=0;this.voices=[];this.gains=[];this.destination={}}async resume(){this.state='running'}createOscillator(){const o={frequency:new Param(),connect(){},disconnect(){},start(t){this.started=t},stop(t){this.stops??=[];this.stops.push(t)}};this.voices.push(o);return o}createGain(){const g={gain:new Param(),connect(){},disconnect(){}};this.gains.push(g);return g}}
const sound=createSound({enabled:()=>enabled,volume:()=>volume,AudioContext:Audio});sound.success();assert.equal(audio,null);assert.equal(await sound.unlock(),true);sound.tick(0);sound.tick(1);assert.equal(audio.voices.length,1);audio.currentTime=.06;sound.tick(1);assert.equal(audio.voices.length,2);sound.success();assert.equal(audio.voices.length,6);assert.equal(audio.voices[4].started,audio.currentTime+.62);assert(audio.gains.every(g=>g.gain.events[0].v===.0001));enabled=false;sound.stop();const voices=audio.voices.length;sound.success();assert.equal(audio.voices.length,voices);assert(audio.voices.every(v=>v.stops.includes(undefined)));enabled=true;volume=0;sound.success();assert.equal(audio.voices.length,voices);
assert.equal(await createSound({AudioContext:null}).unlock(),false);
console.log('PASS: 连续拖动、过字不判定、有限惯性、吸附、滚轮静止后判定、取消/销毁无回调、减少动态、双光脉冲参数、字基线、声音手势解锁/限频/双铃调度/静音/零音量（模拟时钟）');
