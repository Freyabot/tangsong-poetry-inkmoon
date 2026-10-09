const started=performance.now();
document.body.classList.toggle('reduced',matchMedia('(prefers-reduced-motion: reduce)').matches)
export function bootProgress(value){const fill=document.querySelector('#boot-fill');if(fill)fill.style.transform=`scaleX(${value/100})`;document.querySelector('.boot-track')?.setAttribute('aria-valuenow',String(value))}
export function failBoot(){document.querySelector('#boot-screen')?.remove();document.body.classList.remove('booting')}
export async function finishBoot({music,sound}){
 const bg=new Image();bg.src=new URL('./assets/background.png',import.meta.url).href;
 const caption=document.querySelector('.boot-caption');caption.textContent='正在准备音乐与诗境';
 sound.prepare();
 await Promise.all([bg.decode(),document.fonts?.ready,music.ready]);
 bootProgress(100);
 caption.textContent='音乐与音效已就绪';
 const enter=document.createElement('button');enter.className='primary boot-enter';enter.textContent='进入诗境';document.querySelector('.boot-center').append(enter);
 await new Promise(resolve=>{enter.addEventListener('click',async()=>{if(enter.disabled)return;enter.disabled=true;try{await Promise.all([sound.unlock(),music.unlock()]);if(!sound.unlocked||!music.readyToEnter)throw Error('声音尚未开启，请再点击一次');sound.click();resolve()}catch(e){caption.textContent=e.message||'声音尚未开启，请重试';enter.disabled=false}})});
 await new Promise(resolve=>setTimeout(resolve,Math.max(220,1000-(performance.now()-started))));
 const screen=document.querySelector('#boot-screen');document.body.classList.remove('booting');
 const reduce=document.body.classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(screen&&!reduce&&screen.animate)await screen.animate([{opacity:1},{opacity:0}],{duration:350,easing:'ease-out',fill:'forwards'}).finished.catch(()=>{});
 screen?.remove();
}
