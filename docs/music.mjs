export function createMusic({enabled=()=>true,volume=()=>.1,contextProvider,Audio=globalThis.Audio}={}){
 const audio=new Audio();
 audio.loop=true;audio.preload='auto';let activated=false,failed=false,pending=null,context=null,gain=null;
 const level=()=>Math.max(0,Math.min(1,volume()))**2;
 audio.volume=level();
 const apply=()=>{if(gain){audio.volume=1;gain.gain.setValueAtTime(level(),context.currentTime)}else audio.volume=level();if(!enabled()||document.hidden)audio.pause()};
 const ready=(async()=>{const response=await fetch(new URL('./assets/bgm.mp3',import.meta.url),{signal:typeof AbortSignal.timeout==='function'?AbortSignal.timeout(60000):undefined});if(!response.ok)throw Error('音乐下载失败，请重试');const blob=await response.blob();audio.src=URL.createObjectURL(blob);audio.volume=level();audio.load()})();ready.catch(()=>{});
 function unlock(){activated=true;try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch{}if(!context){const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(Context)try{context=contextProvider?.()||new Context();const source=context.createMediaElementSource(audio);gain=context.createGain();source.connect(gain);gain.connect(context.destination)}catch{context=null;gain=null}}const resumed=context&&context.state!=='running'?context.resume().catch(()=>{}):Promise.resolve();if(audio.error)audio.load();const playing=play();return Promise.all([resumed,playing])}
 async function play(){apply();if(!activated||!enabled()||document.hidden||pending||!audio.paused)return;try{pending=audio.play();await pending;failed=false}catch(e){if(e.name!=='NotAllowedError'&&e.name!=='AbortError')failed=true}finally{pending=null}}
 audio.addEventListener('error',()=>{failed=true;const status=document.querySelector('#music-status');if(status)status.textContent='音乐暂未加载，可关闭后重新开启。'});
 return {ready,unlock,sync(){apply();return play()},pause(){audio.pause()},resume(){return play()},get readyToEnter(){return !enabled()||(!audio.paused&&context?.state!=='suspended')},get failed(){return failed}};
}
