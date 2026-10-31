from drv import *
E=dict(PRESS_WIDE=1,WIND_ATK=1,SB_FOCUS=7,SCORES='/tmp/insight-bal/scoresF.json')
ovr={"iron-skin":{"amount":1.2},"wind-step":{"amount":0.3,"everyHits":7,"seconds":3},"double-strike":{"amount":0.2}}
nw={"calm-breath":{"amount":0.15},"steady-start":{"amount":40}}
jobs=[]
for b,s in (('kid',60),('newer',30),('careful',30)):
    jobs.append(dict(tag='Fpick',bot=b,env=E,ovr=ovr,new=nw,cfgs=['pick:greedy:','pick:worst:'],seeds=s))
batch(jobs,3)
