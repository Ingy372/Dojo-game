#!/usr/bin/env python3
"""J27 audit: list every technique, move, Seal, Strike, family and Form name in content/abilities and drafts/content, with a real-name
candidate from docs/curriculum.md / docs/self-defense.md (or OPEN). Writes drafts/content/abilities/J27-audit.json and prints totals.
Run from the repo root. A list only: it changes no content file. The table in J27-audit.md is made from the JSON."""
import json,re,pathlib,collections
R=pathlib.Path('.')
DOCS=['docs/curriculum.md','docs/self-defense.md','docs/framework.md']
txt={d:open(d).read().split('\n') for d in DOCS}
def where(name):
    for d in DOCS:
        for i,l in enumerate(txt[d],1):
            if re.search(r'(?<![a-z])'+re.escape(name.lower())+r'(?![a-z])',l.lower()): return f'{d}:{i}'
SD=lambda n:f'docs/self-defense.md:{10+n}'
KC=lambda n:f'docs/curriculum.md:{45+n}'
# candidate per technique number / combo: (term or None, note)
SEAL={1:('double punch',''),2:(None,'same as #1, other side'),3:('back fist','also #5, #10'),4:(None,'family Advancing (Jay, Nov 8: "Self-defense #4 belongs to Advancing."); no real name in the docs. Push-back effect kept'),
5:(None,'candidates back fist (also #3) / elbow'),6:(None,'candidate hook punch (attacker also throws one)'),7:('palm heel',''),8:(None,'block-and-strike, no set name'),
9:(None,'as #8, high'),10:('double knifehand block',''),11:('osotogari','Jay\'s spelling; S4 "Osoto Gari"'),12:(None,'osotogari again (also #11)'),
13:('inside kick','also #14'),14:(None,'candidate spin kick (clashes with Strike "Spin Kick")'),15:(None,'candidate double punch (also #1)'),
16:(None,'Jay (Nov 8): low hammer fist, then back fist; no name in docs'),17:('arm bar',''),18:('parry','parry is in many; no set name'),19:('wrist lock',''),20:(None,'grab and combo, no set name'),
31:(None,'candidate arm bar (also #17)'),32:(None,'"slide to the wrist" is a step; candidate wrist lock (also #19)'),33:('party flex',''),34:(None,'no name ("same as 33 with a slam")'),
35:(None,'candidate wrist lock (also #19)'),36:(None,'not stated yet'),37:(None,'not stated yet'),38:(None,'not stated yet'),39:(None,'not stated yet'),40:(None,'not stated yet')}
COMBO={1:('spin kick',''),2:('jumping spin kicks','doc: "3 jumping spin kicks" (plural, word for word)'),3:('butterfly kick','"tornado kick (we call it butterfly kick)"'),4:('side kick','doc: "step behind side kick"'),
5:('hook kick','Jay (Nov 8): the combo is Hook Kick'),6:('jumping front kick','doc: "chambered jumping front kick"'),7:('spinning hook kick','')}
rows=[]
def add(f,id_,name,cand,src,live,note=''):
    ok=where(name)
    rows.append(dict(file=f,id=id_,name=name,verbatim=ok,cand=cand,src=src,live=live,note=note))
def seal(f,id_,name,n,live):
    t,note=SEAL.get(n,(None,'no row'))
    add(f,id_,name,t.title() if t else 'OPEN',SD(n) if t else (SD(n) if n<=40 else ''),live,note)
def strike(f,id_,name,n,live):
    t,note=COMBO[n]; add(f,id_,name,t.title(),KC(n),live,note)
ab=json.load(open('content/abilities/abilities.json'))
for i,s in enumerate(ab['seals'],1): seal('content/abilities/abilities.json',s['id'],s['name'],i,'live')
for i,s in enumerate(ab['strikes'],1): strike('content/abilities/abilities.json',s['id'],s['name'],i,'live')
st={'beginners-stance':None,'ready-stance':None,'cat-stance':None,'front-stance':None,'fighting-stance':None,'horse-stance':None}
for s in ab['stances']:
    w=where(s['name']); add('content/abilities/abilities.json',s['id'],s['name'],s['name'] if w else 'OPEN',w or '','live','stance name; ask Jay to add stance names to docs' if not w else '')
for i,s in enumerate(json.load(open('content/abilities/strikes.json'))['strikes'],1): strike('content/abilities/strikes.json',s['id'],s['name'],i,'live')
for fam in json.load(open('content/abilities/seal-families.json'))['families']:
    add('content/abilities/seal-families.json',fam['id'],fam['name'],'OPEN','','live','family label (game group), not a technique')
    for r in fam['ranks']: seal('content/abilities/seal-families.json',f"{fam['id']} #{r['technique']}",r['name'],r['technique'],'live')
sf=json.load(open('drafts/content/abilities/seal-families-text.json'))
for fam in sf['families']:
    add('drafts/content/abilities/seal-families-text.json',fam['id'],fam['name'],'OPEN','','drafts','family label (game group), not a technique')
    for r in fam['ranks']:
        seal('drafts/content/abilities/seal-families-text.json',f"{fam['id']} #{r['technique']}",r['name'],r['technique'],'drafts')
        if 'carries' in r: add('drafts/content/abilities/seal-families-text.json',r['carries']['oldSeal'],r['carries']['name'],'OPEN','','drafts','old placeholder Seal carried on a rank')
for i,s in enumerate(sf['strikes'],1): strike('drafts/content/abilities/seal-families-text.json',s['id'],s['name'],i,'drafts')
for f,base in (('seals-11-15-text.json',11),('seals-16-20-text.json',16),('seals-31-40-text.json',31)):
    for i,s in enumerate(json.load(open('drafts/content/abilities/'+f))['seals']): seal('drafts/content/abilities/'+f,s['id'],s['name'],base+i,'drafts')
for s in json.load(open('drafts/content/abilities/strikes-4-7-text.json'))['strikes']:
    strike('drafts/content/abilities/strikes-4-7-text.json',s['id'],s['name'],s['combo'],'drafts')
for c in json.load(open('drafts/content/abilities/technique-callouts.json'))['callouts']:
    if c['kind']=='virtue': continue
    f='drafts/content/abilities/technique-callouts.json'
    if c['kind']=='seal': seal(f,c['ability']+' (subtitle)',c['subtitle'],int(c['callout'].split('#')[1].rstrip('!')),'drafts')
    elif c['kind']=='strike': strike(f,c['ability']+' (subtitle)',c['subtitle'],int(c['callout'].split()[-1].rstrip('!')),'drafts')
    else:
        n=1 if '1' in c['callout'] else 2; add(f,c['ability']+' (subtitle)',c['subtitle'],f'Basic Form {n}',f'docs/curriculum.md:{18+n}','drafts','kata name; the callout line already says it')
for v in json.load(open('drafts/content/abilities/unlock-text.json'))['sealCarries']:
    k=v.get('technique')
    add('drafts/content/abilities/unlock-text.json',f'sealCarries {k}',v['name'],'OPEN','','drafts','old placeholder Seal carried on a rank')
ut=json.load(open('drafts/content/abilities/unlock-text.json'))
for x in ut['strikes']: strike('drafts/content/abilities/unlock-text.json',x['id']+' (title)',x['title'],ut['strikes'].index(x)+1,'drafts')
for x in ut['seals']: seal('drafts/content/abilities/unlock-text.json',f"seal #{x['technique']} (title)",x['title'],x['technique'],'drafts')
for k,v in json.load(open('drafts/content/katas/moves.json'))['moves'].items():
    w=where(v.rstrip('!'))
    add('drafts/content/katas/moves.json',k,v,v if w else 'OPEN',w or '','drafts','kata move; file says wording is a guess' + ('' if w else '; not in the 3 docs (Jay\'s kata sheets may have it)'))
for r in rows:
    if r['file'].endswith('abilities.json') and r['id'].endswith('stance') and r['cand']=='OPEN':
        r['note']="Jay-approved stance (J1, drafts/content/katas/stances.json), but not in the 3 docs"
    r['status']='Real' if r['cand'].lower()==r['name'].lower().rstrip('!') else ('OPEN' if r['cand']=='OPEN' else 'Rename')
import collections; FIX={'pivot':('Skip','','motion word, not a technique'),'turn.180':('Skip','','motion word'),'turn':('Skip','','motion word'),'turn.big-special':('Skip','','motion word'),
'stance.attention':('Skip','','"attention" position, not a technique; docs match is unrelated'),'chamber':('Skip','','motion word'),'catch':('Skip','','docs match is unrelated'),
'strike.backfist':('Back Fist','docs/self-defense.md:13','spelling: docs write "back fist"'),'block.double-knife-hand':('Double Knifehand Block','docs/self-defense.md:20','docs spelling "knifehand"')}
for r in rows:
    if r['file'].endswith('moves.json') and r['id'] in FIX:
        c,s,n=FIX[r['id']]; r['cand'],r['src'],r['note']=(c if c!='Skip' else '-'),s,n; r['status']='Skip' if c=='Skip' else 'Rename'
# Manager's calls on #447 (Nov 8): ready names become drop-ins in J27-seal-renames.json 'renames'; family labels are KEEP;
# stances stay OPEN because Jay's own words naming them are not in decisions.md or progress.md.
for r in rows:
    if r['status'] == 'Rename': r['status'] = 'Renamed (drop-in)'
    if r['status'] == 'OPEN' and 'family label' in r['note']: r['status'] = 'KEEP'; r['cand'] = 'KEEP'; r['note'] = 'game group label (Manager, Nov 8: keep)'
    if r['status'] == 'OPEN' and 'stance' in r['note'].lower(): r['note'] = "Jay-approved stance (J1), but Jay's own words naming it are not in decisions.md or progress.md, so curriculum.md was not edited"
json.dump(rows,open('drafts/content/abilities/J27-audit.json','w'),indent=1); open('drafts/content/abilities/J27-audit.json','a').write('\n')
print(len(rows), 'names;', dict(collections.Counter((r['status'],r['live']) for r in rows)))
