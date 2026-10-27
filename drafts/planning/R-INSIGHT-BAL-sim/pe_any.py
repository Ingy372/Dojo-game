import sys,glob
from pe2 import *
def show(tags,bots=('kid','newer','careful'),diff='standard',only=None):
    for tag in tags:
        for bot in bots:
            f=glob.glob(f'/tmp/insight-bal/r4/{tag}-{bot}.jsonl')
            if not f: continue
            d=agg(load(f[0]),['bot','diff','cfg']); xs,ys=build(bot,diff)
            out=[]
            for k,c in d.items():
                if k[0]!=bot or k[1]!=diff: continue
                if only and not any(o in k[2] for o in only): continue
                ff=fmt(c); p=pe_of(ff,xs,ys)['PE']
                nm=k[2][6:].replace('press-the-advantage','press').replace('shield-breaker','sb').replace('heavy-hands','heavy').replace('ripple-counter','ripple').replace('iron-skin','iron').replace('wind-step','wind').replace('double-strike','dbl').replace('quick-hands','quick').replace('calm-breath','calm').replace('steady-start','steady')
                out.append(f"{nm} {p:.0f}({ff['win']:.0f})")
            print(tag,bot,'|',' | '.join(out))
if __name__=='__main__': show(sys.argv[1:])
