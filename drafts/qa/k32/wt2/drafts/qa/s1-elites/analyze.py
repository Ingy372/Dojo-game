import json,collections as C
cells=json.load(open('raw.json'))
def st(c):
    rs=c['runs'];n=len(rs)
    win=100*sum(r['won'] for r in rs)/n
    mins=sum(r['ticks'] for r in rs)/20/60
    ppm=sum((r['pf'] or 0) for r in rs)/mins if mins else 0
    d=C.Counter(x['id'] for r in rs for x in r['rooms'] if x['died'] or x['to'])
    return win,ppm,d
K={(c['variant'],c['profile'],c['d'],c['bot']):c for c in cells}
bots=['typical/smart','novice/smart','novice/stand','novice/masher','novice/flail']
print('## Win % (none / elites 20-35% / every-room Swift / every-room Guarding)')
print('|profile|bot|diff|none|elites|allSwift|allGuard|PC/min none→elites|')
print('|-|-|-|-|-|-|-|-|')
for p in ['p1','p2','p3']:
  for b in bots:
    for d in ['guided','standard','challenge']:
      row=[]
      for v in ['none','elites','allSwift','allGuard']:
        c=K.get((v,p,d,b)); row.append(f"{st(c)[0]:.1f}" if c else '-')
      a=st(K[('none',p,d,b)])[1];e=st(K[('elites',p,d,b)])[1]
      print(f"|{p}|{b}|{d}|"+"|".join(row)+f"|{a:.1f}→{e:.1f}|")
print('\n## Losses by room, p1 novice/smart (none → elites → allSwift → allGuard)')
for d in ['guided','standard','challenge']:
  ds=[st(K[(v,'p1',d,'novice/smart')])[2] for v in ['none','elites','allSwift','allGuard']]
  ids=sorted(set().union(*ds))
  print(d, '; '.join(f"{i}: "+'/'.join(str(x[i]) for x in ds) for i in ids))
print('\n## Avg room seconds (cleared rooms, p1 novice/smart standard), none vs rooms with elite')
for v in ['none','elites','allSwift','allGuard']:
  c=K[(v,'p1','standard','novice/smart')]
  t=C.defaultdict(list)
  for r in c['runs']:
    for x in r['rooms']:
      if not x['died'] and not x['to']: t[x['id']].append(x['t']/20)
  print(v,{k:round(sum(a)/len(a),1) for k,a in sorted(t.items())})
c=K[('elites','p1','standard','novice/smart')]
el=c['elites'];print('\nelite log p1 std novice/smart:',len(el),'elites in',len(c['runs']),'runs', C.Counter((e['type'],e['enemy']) for e in el), C.Counter(e['kind'] for e in el))
c=K[('elites','p1','guided','novice/smart')];print('guided',C.Counter(e['type'] for e in c['elites']))
