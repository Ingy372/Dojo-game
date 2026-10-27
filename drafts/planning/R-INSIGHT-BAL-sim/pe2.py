import sys,glob,json
from an import *
import numpy as np
def build(bot='kid',diff='standard'):
    rows=load('/tmp/insight-bal/solo-*.jsonl')+load('/tmp/insight-bal/ruler-kid.jsonl')+load('/tmp/insight-bal/rul/*.jsonl')
    d=agg(rows,['bot','diff','cfg']); g=lambda c: fmt(d[(bot,diff,c)])
    xs=[0,10,20,30,40,60]
    cf=['none']+[f'syn:powerScale:{p/100}' for p in xs[1:]]
    ys={m:[g(c)[m] for c in cf] for m in ['cleared','lost','ticks','win']}
    return xs,ys
def pe_of(f,xs,ys):
    out={}
    use=[m for m in ['cleared','lost','ticks'] if m!='cleared' or max(ys['cleared'])-min(ys['cleared'])>1.0]
    for m in use:
        a=ys[m]; v=f[m]
        if m!='cleared': a=[-x for x in a]; v=-v
        out[m]=float(np.interp(v,a,xs))
    out['PE']=sum(out.values())/len(out)
    return out
if __name__=='__main__':
    bot=sys.argv[1] if len(sys.argv)>1 else 'kid'; diff=sys.argv[2] if len(sys.argv)>2 else 'standard'
    pat=sys.argv[3] if len(sys.argv)>3 else '/tmp/insight-bal/scan/*.jsonl'
    xs,ys=build(bot,diff)
    for f in sorted(glob.glob(pat)):
        rows=load(f); d=agg(rows,['bot','diff','cfg'])
        for k,c in d.items():
            if k[0]!=bot or k[1]!=diff: continue
            ff=fmt(c); p=pe_of(ff,xs,ys)
            print(f"{f.split('/')[-1][:-6]:14s} {k[2][:40]:40s} win {ff['win']:5.1f} rooms {ff['cleared']:.2f} lost {ff['lost']:5.1f} tk {ff['ticks']:4.0f} | PE rooms {p.get('cleared',float('nan')):5.1f} lost {p['lost']:5.1f} ticks {p['ticks']:5.1f}  PE {p['PE']:5.1f}")
