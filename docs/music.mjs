export function createMusic({enabled=()=>true,volume=()=>.1,Audio=globalThis.Audio}={}){
 const audio=new Audio(new URL('./assets/bgm.mp3',import.meta.url).href);
 audio.loop=true;audio.preload='metadata';let activated=false,failed=false,pending=null;
 const apply=()=>{audio.volume=Math.max(0,Math.min(1,volume()));if(!enabled()||document.hidden)audio.pause()};
 async function play(){apply();if(!activated||!enabled()||document.hidden||pending||!audio.paused)return;try{pending=audio.play();await pending;failed=false}catch(e){if(e.name!=='NotAllowedError'&&e.name!=='AbortError')failed=true}finally{pending=null}}
 audio.addEventListener('error',()=>{failed=true;const status=document.querySelector('#music-status');if(status)status.textContent='音乐暂未加载，可关闭后重新开启。'});
 return {unlock(){activated=true;if(audio.error)audio.load();return play()},sync(){apply();return play()},pause(){audio.pause()},resume(){return play()},get failed(){return failed}};
}
