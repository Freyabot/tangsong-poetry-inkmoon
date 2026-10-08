// Decorations are presentation only: the supplied knowledge text stays unchanged.
export function kaomojiFor(poem,sentence=''){
 const tags=poem.tags.join(' '),text=tags+' '+sentence;
 if(/悼亡|亡国|国破|悲剧|绝笔|遗嘱|怀念.*离开/.test(text))return '(｡•́︿•̀｡)';
 if(/乡愁|乡思|思乡|思归|归家|回乡|还乡|亲情|母爱|家书/.test(tags))return '(っ´ω`c)';
 if(/误会|委屈|无奈|不平|落第|报国无门|后悔|难过|失眠/.test(text))return '(´･_･`)';
 if(/友情|兄弟|怀友|劝友|友聚|重逢|访友|交游|酬赠/.test(tags))return '(づ｡◕‿‿◕｡)づ';
 if(/离愁|离别|送别|赠别|别意|忆别|饯别|聚散/.test(tags))return '(｡･ω･)ﾉﾞ';
 if(/孤独|孤寂|孤苦|寂寞|幽怨|宫怨|闺怨|惆怅|伤感|悲秋|秋愁|感伤|愁/.test(tags))return '(｡•́︿•̀｡)';
 if(/相思|爱情|恋情|暗恋|深情|痴情|情痴|情思|夫妻|寄内|浪漫|七夕/.test(tags))return '( ˘͈ ᵕ ˘͈ )♡';
 if(/励志|勉励|壮志|抱负|理想|豪情|豪放|豪迈|勇武|从军|军旅|爱国|明志|生命力/.test(tags))return '(๑•̀ㅂ•́)و✧';
 if(/童趣|喜悦|喜讯|狂喜|遇赦|登科|轻快|丰收|戏谑|自嘲/.test(tags))return '☆*:.｡.o(≧▽≦)o.｡.:*☆';
 if(/哲思|哲理|感悟|人生|沧桑|今昔|回忆|惜时|怀古|怀旧/.test(tags))return '( ˘⌣˘ )';
 if(/自守|品格|气节|高洁|坚贞|忠贞|冰心|决绝|孤高/.test(tags))return '(ง •̀_•́)ง';
 if(/旷达|豁达|闲适|闲淡|禅意|归隐|隐逸|田园|幽静|清雅|淡远/.test(tags))return '✧( ´ ▽ ` )✧';
 if(/月|夜色|梦|星/.test(tags))return '✧( ˘ω˘ )✧';
 if(/春|生机|花|清新|江南/.test(tags))return '(｡･ω･｡)ﾉ♡';
 return '(｡･ω･｡)';
}
export function resonanceSentences(poem){
 const sentences=String(poem.realLife).match(/[^。！？!?\r\n]+[。！？!?]?[”」』]?/gu)||[poem.realLife];
 return sentences.map(text=>({text:text.trim(),kaomoji:kaomojiFor(poem,text).replace(/[\r\n]/g,'')})).filter(s=>s.text);
}
export function meaningPreview(text,max=42){
 text=String(text);if(Array.from(text).length<=max)return text;
 const first=text.match(/^.*?[。！？]/u)?.[0];if(first&&Array.from(first).length<=max)return first;
 // Prefer a complete clause instead of cutting a Chinese word in half.
 const chars=Array.from(text),head=chars.slice(0,max).join('');const cut=Math.max(head.lastIndexOf('，'),head.lastIndexOf('；'));
 return (cut>=max*.5?head.slice(0,cut):head)+'…';
}
