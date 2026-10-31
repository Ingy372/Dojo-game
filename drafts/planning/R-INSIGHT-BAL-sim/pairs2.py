import sys
from pe2 import *
pat=sys.argv[1]; diff=sys.argv[2]
rows=load(pat); d=agg(rows,['bot','diff','cfg'])
for bot in ['kid','newer','careful']:
    xs,ys=build(bot,diff)
    res=[]
    for k,c in d.items():
        if k[0]!=bot or k[1]!=diff or not k[2].startswith('start:'): continue
        f=fmt(c); p=pe_of(f,xs,ys)
        res.append((p['PE'],f['win'],f['lost'],k[2][6:]))
    res.sort(reverse=True)
    print('==',bot,diff,len(res))
    for r in res[:12]: print(f"  PE {r[0]:5.1f} win {r[1]:5.1f} lost {r[2]:5.1f} {r[3]}")
    print('  ...')
    for r in res[-6:]: print(f"  PE {r[0]:5.1f} win {r[1]:5.1f} lost {r[2]:5.1f} {r[3]}")
    pairs=[r for r in res if r[3].count('+')==1]
    import statistics
    print('  pairs n',len(pairs),'mean PE',round(statistics.mean(r[0] for r in pairs),1),'max',round(max(r[0] for r in pairs),1))
    print('  >45:',[ (r[3],round(r[0])) for r in pairs if r[0]>45])
    print('  <20:',[ (r[3],round(r[0])) for r in pairs if r[0]<20 and bot=='kid'])
