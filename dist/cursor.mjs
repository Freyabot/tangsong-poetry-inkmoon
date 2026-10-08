export function initStarCursor(){
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 if(!fine.matches)return;
 const star=document.createElement('div');star.id='star-cursor';star.setAttribute('aria-hidden','true');
 star.innerHTML='<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M12 1.7 15.1 8l6.9 1-5 4.9 1.2 6.9L12 17.6l-6.2 3.2L7 13.9 2 9l6.9-1z"/></svg>';
 document.body.append(star);let frame=0,x=0,y=0,visible=false;
 const events=new AbortController(),options={signal:events.signal};
 function hide(){visible=false;cancelAnimationFrame(frame);frame=0;star.classList.remove('visible','pressed');document.body.classList.remove('has-star-cursor')}
 function paint(){frame=0;if(visible)star.style.transform=`translate3d(${x}px,${y}px,0)`}
 document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!fine.matches){hide();return}if(e.target.closest('input,textarea,select,[contenteditable="true"],dialog[open]')){hide();return}x=e.clientX;y=e.clientY;visible=true;star.classList.add('visible');document.body.classList.add('has-star-cursor');star.classList.toggle('over-control',!!e.target.closest('button,a,#picker'));if(!frame)frame=requestAnimationFrame(paint)},options);
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&visible)star.classList.add('pressed')},options);
 document.addEventListener('pointerup',()=>star.classList.remove('pressed'),options);
 document.documentElement.addEventListener('pointerleave',hide,options);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()},options);
 window.addEventListener('blur',hide,options);fine.addEventListener('change',hide,options);
 window.addEventListener('pagehide',e=>{hide();if(!e.persisted){events.abort();star.remove()}},options);
}
