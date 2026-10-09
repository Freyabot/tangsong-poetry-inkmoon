const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function snapTarget(position,velocity,max){return clamp(Math.round(position+clamp(velocity*140,-1.15,1.15)),-1,max)}
export function dampBoundary(position,max){if(position< -1)return -1+(position+1)*.2;if(position>max)return max+(position-max)*.2;return position}
export const easeOut=t=>1-Math.pow(1-t,4);
const softBack=t=>{const u=t-1;return 1+1.45*u*u*u+.45*u*u};
export function createWheel(el,{initial=-1,reduced=()=>false,onBegin=()=>{},onSettle=()=>{},onTick=()=>{},onGesture=()=>{}}={}){
 const nodes=[...el.querySelectorAll('.picker-slot')],max=nodes.length-2;
 let position=initial,frame=0,pending=0,disposed=false,drag=null,nearest=initial,lastWheel=0;
 const events=new AbortController();
 const time=()=>performance.now();
 function rowHeight(){const h=el.getBoundingClientRect().height;return h?h/3.6*1.28:48}
 function cancel(){cancelAnimationFrame(frame);clearTimeout(pending);frame=0;onBegin()}
 function paint(){if(disposed)return;const row=rowHeight();for(const node of nodes){const i=Number(node.dataset.index),d=i-position,a=Math.abs(d),opacity=a>1.5?0:clamp(1-a*.66,0,1);node.style.transform=`translate3d(0,calc(-50% + ${d*row}px),0) rotateX(${reduced()?0:clamp(-d*23,-48,48)}deg) scale(${1-Math.min(a,1.8)*.17})`;node.style.opacity=String(opacity);node.style.filter=reduced()?'none':`blur(${Math.max(0,a-.65)*.6}px)`;node.style.pointerEvents=a>1.4?'none':'auto';node.setAttribute('aria-hidden',a>1.5?'true':'false');node.setAttribute('aria-current',Math.round(position)===i?'true':'false')}
 const n=clamp(Math.round(position),-1,max);if(n!==nearest){nearest=n;if(n>=0)onTick(n)}
 }
 function settle(target,duration=280){cancel();target=clamp(target,-1,max);const from=position,start=time(),length=reduced()?90:duration;if(Math.abs(from-target)<.001){position=target;paint();onSettle(target);return}function step(now){if(disposed)return;const t=clamp((now-start)/length,0,1);position=from+(target-from)*(reduced()?easeOut(t):softBack(t));paint();if(t<1)frame=requestAnimationFrame(step);else{frame=0;position=target;paint();onSettle(target)}}frame=requestAnimationFrame(step)}
 function start(e){if(e.button!==undefined&&e.button!==0)return;onGesture();cancel();drag={id:e.pointerId,startY:e.clientY,lastY:e.clientY,at:time(),origin:position,velocity:0,moved:false}}
 function move(e){if(!drag||e.pointerId!==drag.id)return;const now=time(),dy=e.clientY-drag.lastY,dt=Math.max(8,now-drag.at);if(Math.abs(e.clientY-drag.startY)>6&&!drag.moved){drag.moved=true;if(!e.touchGesture)el.setPointerCapture(e.pointerId);el.classList.add('dragging')}if(drag.moved){position=dampBoundary(drag.origin+(drag.startY-e.clientY)/rowHeight(),max);const v=-dy/rowHeight()/dt;drag.velocity=drag.velocity*.3+v*.7;paint()}drag.lastY=e.clientY;drag.at=now}
 function finish(e){if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;el.classList.remove('dragging');if(d.moved){el._suppressClickUntil=Date.now()+250;const velocity=time()-d.at>90?0:d.velocity;settle(snapTarget(position,reduced()?0:velocity,max),320)}else settle(Math.round(position))}
 function cancelled(e){if(e?.type==='lostpointercapture'&&e.target!==el)return;if(!drag)return;drag=null;el.classList.remove('dragging');cancel();position=clamp(Math.round(position),-1,max);paint();onSettle(position)}
 const touchEvents='ontouchstart' in globalThis;
 const normalize=t=>({pointerId:t.identifier,clientY:t.clientY,button:0,touchGesture:true});
 if(touchEvents){
 el.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;e.preventDefault();start(normalize(e.touches[0]))},{passive:false,signal:events.signal});
 el.addEventListener('touchmove',e=>{const t=[...e.touches].find(t=>t.identifier===drag?.id);if(!t)return;e.preventDefault();move(normalize(t))},{passive:false,signal:events.signal});
 el.addEventListener('touchend',e=>{const t=[...e.changedTouches].find(t=>t.identifier===drag?.id);if(!t)return;e.preventDefault();finish(normalize(t))},{passive:false,signal:events.signal});
 el.addEventListener('touchcancel',cancelled,{signal:events.signal});}
 el.addEventListener('pointerdown',e=>{if(touchEvents&&e.pointerType==='touch')return;start(e)},{signal:events.signal});el.addEventListener('pointermove',e=>{if(touchEvents&&e.pointerType==='touch')return;move(e)},{signal:events.signal});el.addEventListener('pointerup',e=>{if(touchEvents&&e.pointerType==='touch')return;finish(e)},{signal:events.signal});el.addEventListener('pointercancel',e=>{if(touchEvents&&e.pointerType==='touch')return;cancelled(e)},{signal:events.signal});el.addEventListener('lostpointercapture',cancelled,{signal:events.signal});
 el.addEventListener('wheel',e=>{e.preventDefault();if(!e.deltaY)return;onGesture();cancel();let delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?rowHeight()*3:1);position=dampBoundary(position+clamp(delta/90,-.85,.85),max);paint();lastWheel=time();pending=setTimeout(()=>{if(time()-lastWheel>=115)settle(Math.round(position),270)},125)},{passive:false,signal:events.signal});
 el.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();onGesture();settle(Math.round(position)+(e.key==='ArrowDown'?1:-1),230)}},{signal:events.signal});
 paint();return {get position(){return position},get dragging(){return !!drag?.moved},to(index,animate=true){if(disposed)return;onGesture();if(animate)settle(index,250);else{cancel();position=clamp(index,-1,max);paint();onSettle(position)}},destroy(){disposed=true;cancelAnimationFrame(frame);clearTimeout(pending);drag=null;events.abort();el.classList.remove('dragging')}}
}
export const SUCCESS_TIMING={glyph:260,readDelay:260,secondPulse:620,reveal:850,ready:1550};
export function createEffects(reduced=()=>false){let running=new Set();function animate(el,frames,opts,allowReduced=false){if(!el?.animate||reduced()&&!allowReduced)return Promise.resolve();const a=el.animate(frames,opts);running.add(a);return a.finished.catch(()=>{}).finally(()=>running.delete(a))}function clear(){for(const a of running)a.cancel();running.clear()}
 return {clear,
 async glyph(el){if(reduced())return;const base=el?.style.transform||'translateY(0)';await animate(el,[{transform:base,textShadow:'0 0 0px #ceeaff00'},{transform:base+' translateY(-3px)',textShadow:'0 0 12px #e7faff,0 0 28px #b9ddffa0',offset:.55},{transform:base+' translateY(-1px)',textShadow:'0 0 8px #cbefff70'}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'})},
 success(root){if(!root)return;const quote=root.querySelector('.full-quote'),glow=root.querySelector('.success-glow'),reveal=[...root.querySelectorAll('.byline,.meaning-block,.resonance-block,.reading-actions,.next-hint')];if(reduced()){animate(root,[{opacity:.6},{opacity:1}],{duration:180},true);return}
 animate(quote,[{opacity:.55,transform:'translateY(7px)',textShadow:'0 0 5px #a9ddff30'},{opacity:1,transform:'translateY(0)',textShadow:'0 0 20px #c2eaff80,0 0 46px #a4d7ff60',offset:.10},{opacity:1,transform:'translateY(0)',textShadow:'0 0 8px #a9ddff40',offset:.22},{opacity:1,transform:'translateY(-1px)',textShadow:'0 0 24px #e4f8ffaa,0 0 56px #b5e0ff60',offset:.30},{opacity:1,transform:'translateY(0)',textShadow:'0 0 12px #a9ddff60'}],{duration:1250,easing:'ease-in-out'});
 animate(glow,[{opacity:0,transform:'scale(.75)'},{opacity:.52,transform:'scale(.96)',offset:.12},{opacity:.1,transform:'scale(1)',offset:.22},{opacity:.38,transform:'scale(1.05)',offset:.30},{opacity:0,transform:'scale(1.12)'}],{duration:1280,easing:'ease-in-out'});
 reveal.forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:500+i*90,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
 const sparks=[...root.querySelectorAll('.success-spark')];sparks.forEach((el,i)=>animate(el,[{opacity:0,transform:'translate(0,0) scale(.3)'},{opacity:.8,transform:`translate(${Number(el.dataset.x)*.35}px,${Number(el.dataset.y)*.35}px) scale(1)`,offset:.25},{opacity:0,transform:`translate(${el.dataset.x}px,${el.dataset.y}px) scale(.2)`}],{duration:700+i%3*90,delay:340+i*25,easing:'ease-out'}));
 },
 exit(el){return animate(el,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-5px)'}],{duration:170,easing:'ease-in'})},
 enter(el){return animate(el,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'})},
 wrong(el){animate(el,[{transform:'translateY(0)'},{transform:'translateY(2px)'},{transform:'translateY(0)'}],{duration:230,easing:'ease-out'})}
 };
}
