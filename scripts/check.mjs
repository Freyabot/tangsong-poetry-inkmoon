import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createStore,SET_ID} from '../dist/store.mjs';
const poems=JSON.parse(fs.readFileSync(new URL('../dist/poems.json',import.meta.url),'utf8'));
assert.equal(poems.length,300);assert.equal(new Set(poems.map(p=>p.id)).size,300);
assert.equal(poems.filter(p=>p.dynasty==='唐').length,150);
for(const p of poems){assert.equal([...p.answer].length,1);assert.equal([...p.prompt][p.blankIndex],p.answer);assert.equal(p.options.length,5);assert.equal(new Set(p.options).size,5);assert.equal(p.options.filter(x=>x===p.answer).length,1);assert(p.displayLines.join('').includes(p.answer));assert(p.fullTextLines.length&&p.meaning&&p.realLife)}
const boat=poems.find(p=>p.title==='泊船瓜洲');assert.equal(boat.displayLines.join(''),'春风又绿江南岸，明月何时照我还。');
class MemoryStorage{map=new Map();get length(){return this.map.size}key(i){return [...this.map.keys()][i]}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,v)}removeItem(k){this.map.delete(k)}}
const disk=new MemoryStorage();const ids=poems.map(p=>p.id);const a=createStore(disk,ids);const b=createStore(disk,ids);
a.complete('p001');const first=a.state.completed.p001.first;a.complete('p001');assert.equal(Object.keys(a.state.completed).length,1);assert.equal(a.state.completed.p001.first,first);
a.favorite('p002',true);assert.equal(Object.keys(a.state.completed).length,1);a.favorite('p002',false);assert.equal(a.state.favorites.p002.on,false);assert.equal(Object.keys(a.state.completed).length,1);
b.complete('p003');a.reload();assert.deepEqual(Object.keys(a.state.completed).sort(),['p001','p003']);
a.session({id:'p001',phase:'read',mode:'journey',candidate:1,skipped:[],at:Date.now()});const restored=createStore(disk,ids);assert.equal(restored.state.session.phase,'read');assert.equal(Object.keys(restored.state.completed).length,2);
const backup=a.backup();a.import(backup);a.import(backup);assert.equal(Object.keys(a.state.completed).length,2);
assert.equal(a.state.soundEnabled,true);assert.equal(a.state.soundVolume,.35);a.soundEnabled(false);a.soundVolume(.6);const audioBackup=a.backup();const audioRestored=createStore(disk,ids);assert.equal(audioRestored.state.soundEnabled,false);assert.equal(audioRestored.state.soundVolume,.6);assert.throws(()=>a.validate({...audioBackup,soundVolume:4}));a.soundEnabled(true);a.soundVolume(.2);a.import(audioBackup);assert.equal(a.state.soundVolume,.2);a.import(audioBackup,true);assert.equal(a.state.soundEnabled,false);assert.equal(a.state.soundVolume,.6);
const invalid={...backup,completed:{p005:{first:'bad',last:0}}};assert.throws(()=>a.import(invalid));assert.equal(Object.keys(a.state.completed).length,2);
assert.throws(()=>a.validate({...backup,contentSetId:'other'}));assert.equal(a.validate({...backup,completed:{...backup.completed,unknown:{first:Date.now(),last:Date.now()}}}).unknown,1);
const blank={schemaVersion:1,contentSetId:SET_ID,completed:{},favorites:{},session:null};a.import(blank,true);assert.equal(Object.keys(a.state.completed).length,0);b.reload();assert.equal(Object.keys(b.state.completed).length,0);
let errors=0;const bad=createStore({getItem(){return null},setItem(){throw Error('quota')},get length(){return 0}},ids,()=>errors++);assert.equal(bad.complete('p001'),false);assert(bad.state.completed.p001);assert(errors>0);
for(let i=0;i<300;i++)a.complete(ids[i]);assert.equal(Object.keys(a.state.completed).length,300);for(let v=0;v<30;v++)assert.equal(poems.filter(p=>p.volume===v&&a.state.completed[p.id]).length,10);
assert(fs.existsSync(new URL('../dist/assets/background.png',import.meta.url)));
console.log('PASS: 300题完整性、泊船瓜洲联句、重复去重、收藏独立、跨页合并、刷新恢复、导入校验、保存失败及全集/分卷统计');
