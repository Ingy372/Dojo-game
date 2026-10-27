import sys,json
sys.path.insert(0,'/tmp/insight-bal')
from drv import *
E=dict(PRESS_WIDE=1,WIND_ATK=1,SB_FOCUS=7)
F0={"iron-skin":{"amount":1.2},"wind-step":{"amount":0.3,"everyHits":7,"seconds":3},"double-strike":{"amount":0.2}}
nw={"calm-breath":{"amount":0.15},"steady-start":{"amount":40}}
H=ROUTES
CAND={
 "Ta":{"wind-step":{"amount":0.25,"everyHits":5}},
 "Tb":{"wind-step":{"amount":0.25,"everyHits":5,"seconds":4}},
 "Tc":{"wind-step":{"everyHits":5,"seconds":2}},
 "Td":{"wind-step":{"amount":0.2,"everyHits":4}},
 "Tw5":{"wind-step":{"everyHits":5}},
 "Tq21":{"quick-hands":{"amount":0.21}},
 "Tr9":{"rally":{"amount":0.9}},
 "Ti16":{"iron-skin":{"amount":1.6}},
}
def jobs_kid(tag,ch,kata=False):
    o=merge(F0,ch)
    return [dict(tag=tag+'solo',bot='kid',env=E,ovr=o,new=nw,cfgs=SOLO+['none'],seeds=100),
            dict(tag=tag+'route',bot='kid',env=E,ovr=o,new=nw,cfgs=H+['pool','pool9'],seeds=150)]
if __name__=="__main__":
    js=[]
    for t in sys.argv[1:]: js+=jobs_kid(t,CAND[t])
    batch(js,8)
