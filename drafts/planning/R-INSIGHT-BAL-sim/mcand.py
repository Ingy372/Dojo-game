import sys,json,copy
sys.path.insert(0,'/tmp/insight-bal')
from mper import *
def cand(name,**ch):
    o=copy.deepcopy(F)
    for k,v in ch.items(): o[k.replace('_','-')].update(v)
    return name,o
C=[cand('w.2/5/3',wind_step={'amount':0.2,'everyHits':5}),cand('w.25/5/3',wind_step={'amount':0.25,'everyHits':5}),cand('w.3/5/2',wind_step={'everyHits':5,'seconds':2}),cand('w.25/5/4',wind_step={'amount':0.25,'everyHits':5,'seconds':4}),cand('w.2/4/3',wind_step={'amount':0.2,'everyHits':4}),cand('w.25/6/3',wind_step={'amount':0.25,'everyHits':6}),cand('w.2/6/4',wind_step={'amount':0.2,'everyHits':6,'seconds':4}),cand('w.2/7/3',wind_step={'amount':0.2}),cand("quick0.21",quick_hands={"amount":0.21}),
 cand("quick0.25",quick_hands={"amount":0.25}),
 cand("wind.3/5/3",wind_step={"everyHits":5}),
 cand("wind.3/6/3",wind_step={"everyHits":6}),
 cand("wind.35/7/3",wind_step={"amount":0.35}),
 cand("wind.3/7/4",wind_step={"seconds":4}),
 cand("wind.3/6/4",wind_step={"everyHits":6,"seconds":4}),
 cand("iron1.4",iron_skin={"amount":1.4}),
 cand("iron1.5",iron_skin={"amount":1.5}),
 cand("iron1.6",iron_skin={"amount":1.6}),
 cand("rally.9",rally={"amount":0.9}),
 cand("rally1.0",rally={"amount":1.0}),
 cand("double.1",double_strike={"amount":0.1}),
 cand("double.3",double_strike={"amount":0.3}),
]
sel=sys.argv[1:] 
env={"PRESS_WIDE":"1","WIND_ATK":"1","SB_FOCUS":"7"}
for n,o in C:
    if sel and n not in sel: continue
    rows=runper("c-"+n.replace('/','_'),o,env)
    w=sum(x['won'] for x in rows)
    print(f"{n:12s} reached {len(rows)} cond {100*w/len(rows):.1f}% overall {100*w/4000:.1f}%",flush=True)
