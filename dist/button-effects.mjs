export function initButtonEffects(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let last=0;
 function burst(button){if(button.disabled||reduced.matches||document.hidden||performance.now()-last<90)return;last=performance.now();const r=button.getBoundingClientRect();if(!r.width||!r.height)return;
 const layer=document.createElement('div');layer.className='button-stardust';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 for(let i=0;i<7;i++){const star=document.createElement('i');star.className='button-star-fragment';star.textContent=i%3?'✦':'✧';const x=r.left+r.width*(.2+Math.random()*.6),y=r.top+r.height*.55;star.style.cssText=`left:${x}px;top:${y}px;font-size:${7+Math.random()*7}px`;layer.append(star);star.animate([{opacity:0,transform:'translate(0,-4px) scale(.4)'},{opacity:.95,transform:`translate(${(i-3)*5}px,5px) scale(1)`,offset:.2},{opacity:0,transform:`translate(${(i-3)*15}px,${48+Math.random()*40}px) rotate(${(i-3)*32}deg) scale(.2)`}],{duration:650+Math.random()*300,easing:'cubic-bezier(.25,.6,.6,1)',fill:'forwards'})}
 setTimeout(()=>layer.remove(),1000);
 }
 document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const b=e.target.closest('button');if(b&&!b.contains(e.relatedTarget))burst(b)});
 document.addEventListener('focusin',e=>{const b=e.target.closest('button');if(b?.matches(':focus-visible'))burst(b)});
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){const b=e.target.closest('button');if(b)burst(b)}});
}
