const started=performance.now();
document.body.classList.toggle('reduced',matchMedia('(prefers-reduced-motion: reduce)').matches)
export function bootProgress(value){const fill=document.querySelector('#boot-fill');if(fill)fill.style.transform=`scaleX(${value/100})`;document.querySelector('.boot-track')?.setAttribute('aria-valuenow',String(value))}
export function failBoot(){document.querySelector('#boot-screen')?.remove();document.body.classList.remove('booting')}
export async function finishBoot(musicReady){
 const bg=new Image();bg.src=new URL('./assets/background.png',import.meta.url).href;
 const ready=Promise.allSettled([bg.decode(),document.fonts?.ready,musicReady]);
 await Promise.race([ready,new Promise(resolve=>setTimeout(resolve,5000))]);
 bootProgress(100);
 await new Promise(resolve=>setTimeout(resolve,Math.max(220,1000-(performance.now()-started))));
 const screen=document.querySelector('#boot-screen');document.body.classList.remove('booting');
 const reduce=document.body.classList.contains('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(screen&&!reduce&&screen.animate)await screen.animate([{opacity:1},{opacity:0}],{duration:350,easing:'ease-out',fill:'forwards'}).finished.catch(()=>{});
 screen?.remove();
}
