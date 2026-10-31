import sys,json
from pe2 import *
tag=sys.argv[1]; diff=sys.argv[2]
ids=['ripple-counter','iron-skin','wind-step','double-strike','quick-hands','press-the-advantage','shield-breaker','heavy-hands','rally','calm-breath','steady-start']
rows=load(f'/tmp/insight-bal/{tag}*.jsonl'); d=agg(rows,['bot','diff','cfg'])
print(diff)
for i in ids:
    line=f'{i:22s}'
    for bot in ['kid','newer','careful']:
        xs,ys=build(bot,diff); c=d.get((bot,diff,'start:'+i))
        if not c: line+='   n/a'; continue
        f=fmt(c); line+=f" {pe_of(f,xs,ys)['PE']:5.1f}({f['win']:3.0f})"
    print(line)
if diff=='standard':
    sc={}
    for bot in ['kid','newer','careful']:
        xs,ys=build(bot,diff); sc[bot]={'solo':{},'pair':{}}
        for k,c in d.items():
            if k[0]!=bot or k[1]!=diff or not k[2].startswith('start:'): continue
            ids_=k[2][6:].split('+'); pe=pe_of(fmt(c),xs,ys)['PE']
            if len(ids_)==1: sc[bot]['solo'][ids_[0]]=pe
            elif len(ids_)==2: sc[bot]['pair']['|'.join(sorted(ids_))]=pe
    json.dump(sc,open('/tmp/insight-bal/scores3.json','w'))
