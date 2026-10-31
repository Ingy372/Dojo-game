import json,os,subprocess,sys
from concurrent.futures import ThreadPoolExecutor
F={"ripple-counter":{"amount":1.2},"iron-skin":{"amount":1.2},"wind-step":{"amount":0.3,"everyHits":7,"seconds":3},"double-strike":{"amount":0.2},"quick-hands":{"amount":0.2},"rally":{"amount":0.75},"heavy-hands":{"amount":0.2}}
FENV={"PRESS_WIDE":"1","WIND_ATK":"1","SB_FOCUS":"7"}
# unit changes: name -> (ovr dict, env dict)
U={"ripple1.2":({"ripple-counter":F["ripple-counter"]},{}),
 "iron1.2":({"iron-skin":F["iron-skin"]},{}),
 "wind":({"wind-step":F["wind-step"]},{"WIND_ATK":"1"}),
 "double0.2":({"double-strike":F["double-strike"]},{}),
 "quick0.2":({"quick-hands":F["quick-hands"]},{}),
 "rally0.75":({"rally":F["rally"]},{}),
 "pressB":({},{"PRESS_WIDE":"1"}),
 "sbC":({},{"SB_FOCUS":"7"})}
def run(tag,names,seeds,combos="masher:novice:standard",extra=None):
    ovr={};env={}
    for n in names:
        ovr.update(U[n][0]);env.update(U[n][1])
    if extra: 
        for k,v in extra.get('ovr',{}).items(): ovr.setdefault(k,{}).update(v)
        env.update(extra.get('env',{}))
    e=dict(os.environ);e.update(env);e.update(TAG=tag,SEEDS=str(seeds),COMBOS=combos,OUT=f'/tmp/insight-bal/m-{tag}.jsonl',OVR=json.dumps(ovr))
    for k in ('DROP','ONLY'): e.pop(k,None)
    if os.path.exists(e['OUT']): os.remove(e['OUT'])
    subprocess.run("cd /workspace/dg/packages/sim && npx vitest run test/balance/zz-masher.test.ts",shell=True,env=e,capture_output=True)
    return [json.loads(l) for l in open(e['OUT'])]
if __name__=="__main__":
    seeds=int(sys.argv[1]); jobs=[("main",[]),("F",list(U))]
    for n in U: jobs.append(("only-"+n,[n])); jobs.append(("minus-"+n,[m for m in U if m!=n]))
    with ThreadPoolExecutor(4) as ex:
        res=list(ex.map(lambda j: (j[0],run(j[0]+f"-{seeds}",j[1],seeds)),jobs))
    for t,r in res:
        r=r[0]; print(f"{t:16s} reached {r['reached']:4d} won {r['won']:4d} cond {r['pct']:5.1f}%  overall {100*r['won']/r['N']:5.1f}%  sec {r['sec']}")
