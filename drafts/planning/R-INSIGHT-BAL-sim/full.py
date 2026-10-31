from drv import *
E=dict(PRESS_WIDE=1,WIND_ATK=1,SB_FOCUS=7)
ovr={"iron-skin":{"amount":1.2},"wind-step":{"amount":0.3,"everyHits":7,"seconds":3},"double-strike":{"amount":0.2}}
nw={"calm-breath":{"amount":0.15},"steady-start":{"amount":40}}
H=ROUTES
L=["pick:lean:ripple-counter+iron-skin","pick:lean:wind-step+double-strike+quick-hands","pick:lean:press-the-advantage+shield-breaker+heavy-hands","pick:lean:rally+calm-breath+steady-start"]
SEEDS={'kid':(100,60,150),'newer':(50,30,60),'careful':(50,30,60)}
jobs=[]
for b,(s1,s2,s3) in SEEDS.items():
    jobs.append(dict(tag='Fsolo',bot=b,env=E,ovr=ovr,new=nw,cfgs=SOLO+['none'],seeds=s1))
    jobs.append(dict(tag='Froute',bot=b,env=E,ovr=ovr,new=nw,cfgs=H+L+['pool','pool9'],seeds=s3))
    jobs.append(dict(tag='Fpair',bot=b,env=E,ovr=ovr,new=nw,cfgs=['PAIRS'],seeds=s2))
    jobs.append(dict(tag='Fgc',bot=b,env=E,ovr=ovr,new=nw,cfgs=SOLO+ROUTES+['pool','pool9','none'],seeds=s2,diffs='guided,challenge'))
    jobs.append(dict(tag='Fkata',bot=b,env={**E,'KATA':'{"type":"powerScale","amount":0.12}'},ovr=ovr,new=nw,cfgs=SOLO+ROUTES+['none','PAIRS'],seeds=s2))
batch(jobs,4)
