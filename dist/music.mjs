export function createMusic({enabled=()=>true,volume=()=>.1,Audio=globalThis.Audio}={}){
 const audio=new Audio(new URL('./assets/bgm.mp3',import.meta.url).href);
 audio.loop=true;audio.preload='auto';let activated=false,failed=false,pending=null,context=null,gain=null;
 const level=()=>Math.max(0,Math.min(1,volume()))**2;
 const apply=()=>{if(gain){audio.volume=1;gain.gain.setValueAtTime(level(),context.currentTime)}else audio.volume=level();if(!enabled()||document.hidden)audio.pause()};
 const ready=new Promise(resolve=>{audio.addEventListener('canplay',resolve,{once:true});audio.addEventListener('error',resolve,{once:true})});audio.volume=level();audio.load();
 async function unlock(){activated=true;if(!context){const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(Context)try{context=new Context();const source=context.createMediaElementSource(audio);gain=context.createGain();source.connect(gain);gain.connect(context.destination)}catch{context=null;gain=null}}if(context?.state==='suspended')await context.resume().catch(()=>{});if(audio.error)audio.load();return play()}
 async function play(){apply();if(!activated||!enabled()||document.hidden||pending||!audio.paused)return;try{pending=audio.play();await pending;failed=false}catch(e){if(e.name!=='NotAllowedError'&&e.name!=='AbortError')failed=true}finally{pending=null}}
 audio.addEventListener('error',()=>{failed=true;const status=document.querySelector('#music-status');if(status)status.textContent='音乐暂未加载，可关闭后重新开启。'});
 return {ready,unlock,sync(){apply();return play()},pause(){audio.pause()},resume(){return play()},get failed(){return failed}};
}
