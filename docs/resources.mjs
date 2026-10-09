export async function fetchResource(url,{attempts=2,timeout=20000,localCache=false}={}){
 let cache;
 const valid=bytes=>{try{const data=JSON.parse(new TextDecoder().decode(bytes));return Array.isArray(data)&&data.length===300&&new Set(data.map(p=>p.id)).size===300}catch{return false}};
 if(localCache&&globalThis.caches)try{cache=await caches.open('poetry-content-v1');const saved=await cache.match(url);if(saved){const bytes=await saved.arrayBuffer();if(valid(bytes))return {bytes,type:saved.headers.get('content-type')||'application/json'};await cache.delete(url)}}catch{}
 let last;
 for(let i=0;i<attempts;i++){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('资源暂时无法下载');const bytes=await r.arrayBuffer(),type=r.headers.get('content-type')||'application/octet-stream';if(localCache&&!valid(bytes))throw Error('诗词数据尚未准备好');if(cache)try{await cache.put(url,new Response(bytes,{headers:{'content-type':type}}))}catch{}return {bytes,type}}catch(e){last=e}finally{clearTimeout(timer)}}
 throw Error(last?.name==='AbortError'?'网络较慢，下载超时，请重试':'资源下载失败，请检查网络后重试');
}
