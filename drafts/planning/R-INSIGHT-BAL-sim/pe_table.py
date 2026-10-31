import sys
from pe2 import *
ids=['ripple-counter','iron-skin','wind-step','double-strike','quick-hands','press-the-advantage','shield-breaker','heavy-hands','rally']+(['calm-breath','steady-start'] if len(sys.argv)>2 else [])
pat=sys.argv[1]; 
rows=load(pat); dd=agg(rows,['bot','diff','cfg'])
print(f"{'card':22s}"+''.join(f"{b[:3]}-{d[:3]:>5s}" for d in ['gui','sta','cha'] for b in ['kid','newer','careful']))
res={}
for d in ['guided','standard','challenge']:
  for b in ['kid','newer','careful']:
    xs,ys=build(b,d)
    for i in ids+['pool9','pool']:
        k=(b,d,'start:'+i if not i.startswith('pool') else i)
        if k in dd: res[(i,b,d)]=pe_of(fmt(dd[k]),xs,ys)['PE']
for i in ids+['pool9','pool']:
    print(f"{i:22s}"+''.join(f"{res.get((i,b,d),float('nan')):10.0f}" for d in ['guided','standard','challenge'] for b in ['kid','newer','careful']))
