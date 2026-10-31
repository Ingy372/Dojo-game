import sys
from an import *
rows=load(sys.argv[1]); bot=sys.argv[2]; diff=sys.argv[3]; met=sys.argv[4]
d=agg(rows,['bot','diff','cfg','tier'])
cfgs=[]
for k in d:
    if k[2] not in cfgs: cfgs.append(k[2])
print(f"{bot} {diff} {met}")
print(f"{'':30s}"+''.join(f"{b:>7d}" for b in range(1,11)))
for cfg in cfgs:
    line=f"{cfg:30s}"
    for b in range(1,11):
        c=d.get((bot,diff,cfg,b))
        if not c: line+=f"{'-':>7s}"; continue
        f=fmt(c); line+=f"{f[met]:7.1f}"
    print(line)
