import sys,json,copy
sys.path.insert(0,'/tmp/insight-bal')
from p5 import *
from mscan import F
Tc=copy.deepcopy(F); Tc['wind-step'].update(everyHits=5,seconds=2)
E={"PRESS_WIDE":"1","WIND_ATK":"1","SB_FOCUS":"7"}
cfg={"main":{}, "F":dict(E,OVR=json.dumps(F)), "Tc":dict(E,OVR=json.dumps(Tc))}
for t in sys.argv[1:]:
    key='stepOutOfLanding'
    env=dict(cfg[t])
    for k in ("PRESS_WIDE","WIND_ATK","SB_FOCUS","OVR"):
        os.environ.pop(k,None)
    rows=run('2k-'+t,env,chunks=8,per=250,key=key)
    json.dump(rows,open(f'/tmp/insight-bal/p5rows-{t}.json','w'))
    for n in (60,240,500,1000,2000): print(t,stats(rows,n),flush=True)
