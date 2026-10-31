import json,sys,glob,collections
for tag in sys.argv[1:]:
  for f in sorted(glob.glob(f'/tmp/insight-bal/r4/{tag}-*.jsonl')):
    d=collections.OrderedDict()
    for l in open(f):
      r=json.loads(l); a=d.setdefault(r['cfg'],[0,0,0.0,0.0]); a[0]+=r['n'];a[1]+=r['won'];a[2]+=r['lostPct']/max(r['fights'],1)*r['n'];a[3]+=r['fightTicks']/max(r['fights'],1)*r['n']
    print(f.split('/')[-1][:-6], ' | '.join(f"{k[6:].replace('press-the-advantage','press').replace('shield-breaker','sb').replace('heavy-hands','heavy')[:30]} {100*v[1]/v[0]:.0f}% L{100*v[2]/v[0]:.0f}" for k,v in d.items()))
