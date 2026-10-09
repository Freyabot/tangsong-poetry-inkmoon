export const SET_ID='tangsong-selected-300-v1';
const PREFIX='tangsong300:';
export function createStore(storage,ids,onError=()=>{}){
 const valid=new Set(ids);let memory={completed:{},favorites:{},session:null,reduced:null,soundEnabled:true,soundVolume:.35,musicEnabled:true,musicVolume:.1};
 function read(key,fallback){try{const raw=storage.getItem(PREFIX+key);return raw===null?fallback:JSON.parse(raw)}catch{onError();return fallback}}
 function write(key,value){try{storage.setItem(PREFIX+key,JSON.stringify(value));return true}catch{onError();return false}}
 function reload(){for(const id of ids){const c=read('c:'+id,null);if(validTime(c?.first)&&validTime(c?.last))memory.completed[id]=c;else delete memory.completed[id];const f=read('f:'+id,null);if(typeof f?.on==='boolean'&&validTime(f?.at))memory.favorites[id]=f;else delete memory.favorites[id]}memory.session=read('session',memory.session);memory.reduced=read('reduced',memory.reduced);memory.soundEnabled=read('soundEnabled',memory.soundEnabled);memory.soundVolume=read('soundVolume',memory.soundVolume);if(typeof memory.soundEnabled!=='boolean')memory.soundEnabled=true;if(!Number.isFinite(memory.soundVolume)||memory.soundVolume<0||memory.soundVolume>1)memory.soundVolume=.35;memory.musicEnabled=read('musicEnabled',memory.musicEnabled);memory.musicVolume=read('musicVolume',memory.musicVolume);if(typeof memory.musicEnabled!=='boolean')memory.musicEnabled=true;if(!Number.isFinite(memory.musicVolume)||memory.musicVolume<0||memory.musicVolume>1)memory.musicVolume=.1;return memory}
 reload();
 return {
  get state(){return memory},
  reload,
  complete(id){if(!valid.has(id))throw Error('未知诗词');const existing=read('c:'+id,null)||memory.completed[id];const first=validTime(existing?.first)?existing.first:Date.now();memory.completed[id]={first,last:Date.now()};return write('c:'+id,memory.completed[id])},
  favorite(id,on){if(!valid.has(id)||typeof on!=='boolean')throw Error('无效收藏');memory.favorites[id]={on,at:Date.now()};return write('f:'+id,memory.favorites[id])},
  session(s){memory.session=s;return write('session',s)},
  reduced(value){memory.reduced=!!value;return write('reduced',!!value)},
  soundEnabled(value){memory.soundEnabled=!!value;return write('soundEnabled',memory.soundEnabled)},
  soundVolume(value){if(!Number.isFinite(value)||value<0||value>1)throw Error('音量无效');memory.soundVolume=value;return write('soundVolume',value)},
  musicEnabled(value){memory.musicEnabled=!!value;return write('musicEnabled',memory.musicEnabled)},
  musicVolume(value){if(!Number.isFinite(value)||value<0||value>1)throw Error('音量无效');memory.musicVolume=value;return write('musicVolume',value)},
  backup(){return {schemaVersion:1,contentSetId:SET_ID,exportedAt:new Date().toISOString(),completed:memory.completed,favorites:memory.favorites,session:memory.session,reduced:memory.reduced,soundEnabled:memory.soundEnabled,soundVolume:memory.soundVolume,musicEnabled:memory.musicEnabled,musicVolume:memory.musicVolume}},
  validate(input){
   if(!input||input.schemaVersion!==1||input.contentSetId!==SET_ID||!plain(input.completed)||!plain(input.favorites))throw Error('备份格式或合集不匹配');
   const completed={},favorites={};let unknown=0;
   for(const [id,c] of Object.entries(input.completed)){if(!valid.has(id)){unknown++;continue}if(!plain(c)||!validTime(c.first)||!validTime(c.last))throw Error('完成记录无效');completed[id]={first:c.first,last:c.last}}
   for(const [id,f] of Object.entries(input.favorites)){if(!valid.has(id)){unknown++;continue}if(!plain(f)||typeof f.on!=='boolean'||!validTime(f.at))throw Error('收藏记录无效');favorites[id]={on:f.on,at:f.at}}
   let session=null;if(input.session){const s=input.session;if(!plain(s)||!valid.has(s.id)||!['select','preview','read','end'].includes(s.phase)||!['reading','journey','practice','review'].includes(s.mode)||!Number.isInteger(s.candidate)||s.candidate < -1||s.candidate>4||!Array.isArray(s.skipped))throw Error('会话记录无效');session={id:s.id,phase:s.phase,mode:s.mode,candidate:s.candidate,skipped:s.skipped.filter(x=>valid.has(x)),at:Date.now()}}
   if(input.soundEnabled!==undefined&&typeof input.soundEnabled!=='boolean')throw Error('音效偏好无效');if(input.soundVolume!==undefined&&(!Number.isFinite(input.soundVolume)||input.soundVolume<0||input.soundVolume>1))throw Error('音量偏好无效');
   if(input.musicEnabled!==undefined&&typeof input.musicEnabled!=='boolean')throw Error('音乐偏好无效');if(input.musicVolume!==undefined&&(!Number.isFinite(input.musicVolume)||input.musicVolume<0||input.musicVolume>1))throw Error('音乐音量无效');
   return {completed,favorites,session,musicEnabled:typeof input.musicEnabled==='boolean'?input.musicEnabled:null,musicVolume:Number.isFinite(input.musicVolume)?input.musicVolume:null,soundEnabled:typeof input.soundEnabled==='boolean'?input.soundEnabled:null,soundVolume:Number.isFinite(input.soundVolume)?input.soundVolume:null,reduced:typeof input.reduced==='boolean'?input.reduced:null,unknown}
  },
  import(data,replace=false){
   const input=this.validate(data);if(replace){if(!this.clear())throw Error('现有记录未能清除，请重试')}else reload();
   for(const [id,c] of Object.entries(input.completed)){const old=memory.completed[id];memory.completed[id]=old?{first:Math.min(old.first,c.first),last:Math.max(old.last,c.last)}:c;write('c:'+id,memory.completed[id])}
   for(const [id,f] of Object.entries(input.favorites)){const old=memory.favorites[id];if(!old||f.at>=old.at){memory.favorites[id]=f;write('f:'+id,f)}}
   if(replace){this.session(input.session);if(input.musicEnabled!==null)this.musicEnabled(input.musicEnabled);if(input.musicVolume!==null)this.musicVolume(input.musicVolume);if(input.reduced!==null)this.reduced(input.reduced);if(input.soundEnabled!==null)this.soundEnabled(input.soundEnabled);if(input.soundVolume!==null)this.soundVolume(input.soundVolume)}return input
  },
  clear(){try{const keys=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k?.startsWith(PREFIX))keys.push(k)}for(const k of keys)storage.removeItem(k)}catch{onError();return false}memory={completed:{},favorites:{},session:null,reduced:null,soundEnabled:true,soundVolume:.35,musicEnabled:true,musicVolume:.1};return true},
  retry(){let ok=true;for(const [id,c] of Object.entries(memory.completed))ok=write('c:'+id,c)&&ok;for(const [id,f] of Object.entries(memory.favorites))ok=write('f:'+id,f)&&ok;ok=write('session',memory.session)&&ok;ok=write('reduced',memory.reduced)&&ok;ok=write('soundEnabled',memory.soundEnabled)&&ok;ok=write('soundVolume',memory.soundVolume)&&ok;ok=write('musicEnabled',memory.musicEnabled)&&ok;ok=write('musicVolume',memory.musicVolume)&&ok;return ok}
 };
}
function validTime(t){return typeof t==='number'&&Number.isFinite(t)&&t>0&&t<=Date.now()+86400000}
function plain(x){return typeof x==='object'&&x!==null&&!Array.isArray(x)}
