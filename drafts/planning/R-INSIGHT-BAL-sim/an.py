import json,glob,sys,collections
def load(pat):
    rows=[]
    for f in glob.glob(pat):
        rows+= [json.loads(l) for l in open(f)]
    return rows
def agg(rows,keys,belts=None):
    d=collections.defaultdict(lambda: collections.Counter())
    for r in rows:
        if belts and r['tier'] not in belts: continue
        k=tuple(r[x] for x in keys)
        for m in ['n','won','cleared','fights','lostPct','fightTicks','dealt','picked']: d[k][m]+=r[m]
    return d
def fmt(c):
    return dict(win=100*c['won']/c['n'], cleared=c['cleared']/c['n'], lost=100*c['lostPct']/max(1,c['fights']), ticks=c['fightTicks']/max(1,c['fights']), picked=c['picked']/c['n'])
if __name__=='__main__':
    rows=load(sys.argv[1])
    belts=None
    d=agg(rows,['bot','diff','cfg'])
    cfgs=[]
    for k in d:
        if k[2] not in cfgs: cfgs.append(k[2])
    for diff in ['guided','standard','challenge']:
        print('==',diff)
        for bot in ['kid','newer','careful']:
            print(bot)
            for cfg in cfgs:
                c=d.get((bot,diff,cfg))
                if not c: continue
                f=fmt(c)
                print(f"  {cfg:34s} win {f['win']:5.1f}  rooms {f['cleared']:4.1f} lost/fight {f['lost']:5.2f}%  ticks/fight {f['ticks']:6.0f} picked {f['picked']:.1f}")
