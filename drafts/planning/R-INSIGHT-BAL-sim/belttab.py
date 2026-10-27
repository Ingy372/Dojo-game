import json,collections
def load(f,cfg,diff):
    o={}
    for l in open(f):
        r=json.loads(l)
        if r['cfg']==cfg and r['diff']==diff: o[r['tier']]=100*r['won']/r['n']
    return o
for name,cfg,f,d in [("pool9 Standard","pool9","route","standard"),("pool9 Guided","pool9","gc","guided"),("pool9 Challenge","pool9","gc","challenge")]:
    for tag in ("F","TC"):
        o=load(f"r4/{tag}{f}-kid.jsonl",cfg,d)
        if not o: print(name,tag,"none");continue
        v=[o[k] for k in sorted(o)]
        mx=max(max(a,b)/max(min(a,b),0.5) for a,b in zip(v,v[1:]))
        print(name,tag,' / '.join(f"{x:.0f}" for x in v),f"mean {sum(v)/len(v):.0f} maxjump {mx:.2f}x")
