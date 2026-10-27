import json,os,subprocess,sys,math
from concurrent.futures import ThreadPoolExecutor
def run(tag,env,chunks=4,per=250,key='stepOutOfLanding',s0=501):
    outs=[]
    def one(i):
        out=f'/tmp/insight-bal/p5-{tag}-{i}.jsonl'
        if os.path.exists(out): os.remove(out)
        e=dict(os.environ);e.update(env);e.update(S0=str(s0+i*per),SEEDS=str(per),OUT=out,KEY=key)
        subprocess.run("cd /workspace/dg/packages/sim && npx vitest run test/balance/zz-p5.test.ts",shell=True,env=e,capture_output=True)
        return out
    with ThreadPoolExecutor(4) as ex: outs=list(ex.map(one,range(chunks)))
    rows=[json.loads(l) for o in outs for l in open(o)]
    return rows
def stats(rows,n=None):
    rows=rows[:n] if n else rows
    d=[(r['on']-r['off']) for r in rows]; m=sum(d)/len(d); sd=math.sqrt(sum((x-m)**2 for x in d)/(len(d)-1))
    on=sum(r['on'] for r in rows); off=sum(r['off'] for r in rows)
    return dict(n=len(rows),on=on,off=off,pct=100*(on-off)/off,se_pct=100*sd/math.sqrt(len(d))*len(d)/off)
if __name__=="__main__":
    tag=sys.argv[1]; env=json.loads(sys.argv[2]) if len(sys.argv)>2 else {}
    rows=run(tag,env)
    for n in (60,240,500,1000):
        print(tag,stats(rows,n))
