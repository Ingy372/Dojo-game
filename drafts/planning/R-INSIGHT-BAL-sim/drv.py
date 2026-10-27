import json,os,subprocess,sys,itertools,time
BASE_OVR={"ripple-counter":{"amount":1.2},"iron-skin":{"amount":1.0},"wind-step":{"amount":0.4,"everyHits":5,"seconds":4},"double-strike":{"amount":0.3},"quick-hands":{"amount":0.2},"rally":{"amount":0.75},"heavy-hands":{"amount":0.2}}
NEW=[{"id":"calm-breath","name":"Calm Breath","family":"virtue","text":"Focus fills 30% faster.","effect":{"type":"focusGain","amount":0.3}},{"id":"steady-start","name":"Steady Start","family":"virtue","text":"Start each fight with 2 Strikes ready.","effect":{"type":"startFocus","amount":70}}]
SOLO=[f"start:{i}" for i in "ripple-counter iron-skin wind-step double-strike quick-hands press-the-advantage shield-breaker heavy-hands rally calm-breath steady-start".split()]
ROUTES=["start:ripple-counter+iron-skin","start:wind-step+double-strike+quick-hands","start:press-the-advantage+shield-breaker+heavy-hands","start:rally+calm-breath+steady-start"]
def merge(a,b):
    o={k:dict(v) for k,v in a.items()}
    for k,v in b.items(): o.setdefault(k,{}).update(v)
    return o
def launch(tag,ovr=None,env=None,cfgs=None,bot='kid',seeds=100,diffs='standard',belts='1,2,3,4,5,6,7,8,9,10',new=None,suffix=None):
    e=dict(os.environ); e.update({k:str(v) for k,v in (env or {}).items()})
    e['OVR']=json.dumps(merge(BASE_OVR,ovr or {}))
    nw=NEW if new is None else new
    # allow patching new cards: dict id->effect patch
    nn=[]
    for n in NEW:
        n=json.loads(json.dumps(n))
        if new and n['id'] in new: n['effect'].update(new[n['id']])
        nn.append(n)
    e['NEW']=json.dumps(nn)
    e.update(CONFIGS=','.join(cfgs if cfgs else SOLO+ROUTES),BOTS=bot,DIFFS=diffs,SEEDS=str(seeds),BELTS=belts,BALANCE='1')
    out=f'/tmp/insight-bal/r4/{tag}-{bot}.jsonl'
    if os.path.exists(out): os.remove(out)
    e['OUT']=out
    log=open(f'/tmp/insight-bal/r4/{tag}-{bot}.log','w')
    return subprocess.Popen(['npx','vitest','run','test/balance/zz-insight-bal.test.ts'],cwd='/workspace/dg/packages/sim',env=e,stdout=log,stderr=subprocess.STDOUT)
def batch(jobs,par=4):
    pend=list(jobs); run=[]
    while pend or run:
        while pend and len(run)<par: run.append(launch(**pend.pop(0)))
        time.sleep(1); run=[p for p in run if p.poll() is None]
