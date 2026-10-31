import json,os,subprocess,sys,math
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'/tmp/insight-bal')
from mscan import U,F
def runper(tag,ovr,env,total=4000,chunks=8,combo="masher:novice:standard"):
    per=total//chunks
    def one(i):
        out=f'/tmp/insight-bal/per-{tag}-{i}.jsonl'
        if os.path.exists(out): os.remove(out)
        e=dict(os.environ)
        for k in ('DROP','ONLY','PRESS_WIDE','WIND_ATK','SB_FOCUS'): e.pop(k,None)
        e.update(env);e.update(S0=str(1+i*per),SEEDS=str(per),COMBOS=combo,OUT='/dev/null',PER=out,TAG=tag,OVR=json.dumps(ovr))
        subprocess.run("cd /workspace/dg/packages/sim && npx vitest run test/balance/zz-masher.test.ts",shell=True,env=e,capture_output=True)
        return out
    with ThreadPoolExecutor(chunks) as ex: outs=list(ex.map(one,range(chunks)))
    rows=[json.loads(l) for o in outs for l in open(o) if l.strip()]
    json.dump(rows,open(f'/tmp/insight-bal/perrows-{tag}.json','w'))
    return rows
def blocks(rows,B,total):
    # conditional rate per block of B consecutive seeds
    out=[]
    for a in range(1,total-B+2,B):
        r=[x for x in rows if a<=x['s']<a+B]
        if r: out.append((len(r),sum(x['won'] for x in r)))
    return out
def summ(rows,total,Bs=(60,240,600,1000)):
    print(f"  all: reached {len(rows)} won {sum(x['won'] for x in rows)} cond {100*sum(x['won'] for x in rows)/len(rows):.1f}%  overall {100*sum(x['won'] for x in rows)/total:.1f}%")
    for B in Bs:
        bl=blocks(rows,B,total); rates=[100*w/n for n,w in bl if n]
        m=sum(rates)/len(rates); sd=math.sqrt(sum((x-m)**2 for x in rates)/(len(rates)-1))
        p75=sum(1 for r in rates if r>=75)/len(rates)
        print(f"  N={B:5d} blocks={len(rates):3d} reached/blk~{sum(n for n,w in bl)/len(bl):.0f} mean {m:.1f} sd {sd:.1f} min {min(rates):.1f} max {max(rates):.1f} frac>=75 {100*p75:.0f}%")
if __name__=="__main__":
    tag=sys.argv[1]
    if tag=="main": ovr,env={}, {}
    elif tag=="F": ovr,env=F,{"PRESS_WIDE":"1","WIND_ATK":"1","SB_FOCUS":"7"}
    rows=runper(tag,ovr,env); print(tag); summ(rows,4000)
