import re,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'docs/source-300.md').read_text()
parts=re.split(r'^## (\d+) [｜|]([^\n]+)',s,flags=re.M)
poems=[];changes=[]
for i in range(1,len(parts),3):
 number,title,body=parts[i:i+3];number=int(number)
 author,era,genre=re.search(r'\*\*([^（]+)（([^）]+)）· ([^*]+)\*\*',body).groups()
 raw=re.findall(r'^>(?: (.*))?$',body,re.M);raw=[x or '' for x in raw]
 def field(k):
  m=re.search(r'\*\*'+k+r'\*\*：([^\n]+)',body);assert m,k
  return m.group(1).strip()
 quote=field('名句');originalEye=field('诗眼').split('|')[0].strip();eye=originalEye[0]
 alt=field('拟字')
 if number==16:alt=alt.split('｜')[0].split('：',1)[1].strip();changes.append({'id':number,'reason':'双诗眼取直','original':originalEye,'adapted':eye})
 if number==189:eye='凝';changes.append({'id':number,'reason':'冷不在原文，适配为凝','original':originalEye,'adapted':eye})
 single={11:('心',['性','色','真','意']),61:('恰',['声','句','关','嘤']),202:('独',['空','闲','静','孤']),221:('误',['负','错','拖','阻']),222:('误',['累','害','坑','阻']),226:('愁',['悲','怨','苦','痛']),232:('无',['莫','休','须','早']),255:('如',['依','仍','若','似']),279:('商',['酝','思','酿','谋'])}
 if number in single:
  eye,newOptions=single[number];changes.append({'id':number,'reason':'词组诗眼/拟字适配为单字题','original':originalEye,'answer':eye,'options':newOptions});alt=' / '.join(newOptions)
 source=quote
 if eye not in source:
  source=next((line for line in raw if eye in line),None)
  assert source,(number,eye)
  changes.append({'id':number,'reason':'诗眼不在名句，取原文所在完整行出题','answer':eye,'source':source})
 clauses=re.findall(r'[^，。！？；]+[，。！？；]?',source)
 clause=next(c for c in clauses if eye in c)
 prompt=clause.rstrip('，。！？；').strip()
 options=[x.strip() for x in alt.split('/')];assert all(len(x)==1 for x in options),(number,options)
 options=list(dict.fromkeys(x for x in options if x!=eye));options.insert(number%5,eye)
 assert len(options)==5,(number,options)
 display=re.findall(r'[^，。！？；]+[，。！？；]?',source)
 poems.append({'id':f'p{number:03}','number':number,'title':title.strip(),'author':author,'era':era,'dynasty':'唐' if era=='唐' else '宋','genre':genre.strip(),'fullTextLines':raw,'quote':quote,'answer':eye,'originalEye':originalEye,'prompt':prompt,'blankIndex':prompt.index(eye),'options':options,'displayLines':display,'meaning':field('今译'),'realLife':field('共鸣'),'tags':field('标签').split('、'),'volume':(number-1)//10})
assert len(poems)==300
assert len({p['id'] for p in poems})==300
for p in poems:
 assert p['prompt'][p['blankIndex']]==p['answer']
 assert p['options'].count(p['answer'])==1
 assert all(p[k] for k in ['meaning','realLife','fullTextLines','displayLines'])
(root/'dist/poems.json').write_text(json.dumps(poems,ensure_ascii=False,indent=2))
(root/'docs/content-adaptations.json').write_text(json.dumps(changes,ensure_ascii=False,indent=2))
print(json.dumps({'count':len(poems),'tang':sum(p['dynasty']=='唐' for p in poems),'song':sum(p['dynasty']=='宋' for p in poems),'adaptations':len(changes)},ensure_ascii=False))
