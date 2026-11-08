#!/usr/bin/env python3
"""J27: check drafts/content/abilities/J27-seal-renames.json (real technique names for seals #1-10).
Checks: ids, order, text and effect match content/abilities/abilities.json seals[0..9] (ids never change); every PROPOSED name
appears word for word (case aside) on the cited line of docs/self-defense.md or docs/curriculum.md, and the subtitle is that name;
altName is the current name; OPEN seals keep their current name and have an openNote; no two seals share a proposed name;
names are 3 words or fewer; Nov 8: each proposed Strike name is on its cited curriculum line, ids/combo unchanged, old name in altName,
Kick Combo 5 is Hook Kick; seal #16 keeps its id, OPEN with description "Hammer Fist, Back Fist", kid line says "a low hammer fist", 8 words or fewer,
no groin/face/head; every audit row Real/Rename candidate is on its cited line; 'about' lines are 8 words or fewer; no banned words in new names and lines (OPEN seals keep their current names). Usage: check-j27-seal-names.py [path-to-json]"""
import json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parents[3]
path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R / 'drafts/content/abilities/J27-seal-renames.json'
d = json.loads(path.read_text())
live = json.loads((R / 'content/abilities/abilities.json').read_text())['seals'][:10]
DOCS = ('docs/self-defense.md', 'docs/curriculum.md')
BANNED = ('perfect', 'loot box', 'buy', 'purchase', 'streak', 'throat', 'eyes', 'groin', 'nose', 'broken')
bad = []
seals = d.get('seals', [])
if len(seals) != 10: bad.append(f'need 10 seals, found {len(seals)}')
seen = {}
for i, (e, s) in enumerate(zip(seals, live), 1):
    t = f'#{i} {e.get("id")}'
    if e.get('id') != s['id']: bad.append(f'{t}: id changed (abilities.json has {s["id"]})')
    if e.get('technique') != i: bad.append(f'{t}: technique should be {i}')
    if e.get('text') != s['text'] or e.get('effect') != s['effect']: bad.append(f'{t}: text or effect differs from abilities.json')
    if e.get('callout') != f'Self-Defense #{i}!': bad.append(f'{t}: callout must be "Self-Defense #{i}!"')
    if e.get('subtitle') != e.get('name'): bad.append(f'{t}: subtitle must equal name')
    name = e.get('name') or ''
    if len(name.split()) > 3: bad.append(f'{t}: name over 3 words')
    if e.get('status') == 'PROPOSED':
        if e.get('altName') != s['name']: bad.append(f'{t}: altName must be the current name {s["name"]!r}')
        src = e.get('source') or ''
        m = re.fullmatch(r'(.+):(\d+)', src)
        if not m or m.group(1) not in DOCS: bad.append(f'{t}: source must be one of {DOCS} with a line number'); continue
        lines = (R / m.group(1)).read_text().split('\n'); n = int(m.group(2))
        line = lines[n - 1] if 0 < n <= len(lines) else ''
        if not re.search(r'(?<![a-z])' + re.escape(name.lower()) + r'(?![a-z])', line.lower()):
            anywhere = [f'{doc}:{k}' for doc in DOCS for k, l in enumerate((R / doc).read_text().split('\n'), 1) if name.lower() in l.lower()]
            bad.append(f'{t}: {name!r} is not on {src}' + (f' (it is on {anywhere[:3]})' if anywhere else ' and is not in the docs at all: never invent a name'))
        if name.lower() in seen: bad.append(f'{t}: {name!r} is also proposed for {seen[name.lower()]}')
        seen[name.lower()] = t
        a = e.get('about') or ''
        if not a or len(a.split()) > 8: bad.append(f'{t}: about line must be 1 to 8 words')
    elif e.get('status') == 'OPEN':
        if name != s['name']: bad.append(f'{t}: OPEN seal must keep its current name')
        if not e.get('openNote'): bad.append(f'{t}: OPEN seal needs an openNote')
    else: bad.append(f'{t}: status must be PROPOSED or OPEN')
    for w in [] if e.get('status') == 'OPEN' else re.findall(r"[A-Za-z][A-Za-z\-]*", ' '.join(str(e.get(k) or '') for k in ('name', 'subtitle', 'about'))):
        if w.lower() in BANNED: bad.append(f'{t}: banned word {w!r}')
words = json.dumps([d.get('notes')] + [[e.get(k) for k in ('name', 'subtitle', 'about', 'openNote', 'text')] for e in seals]).lower()
if 'perfect' in words: bad.append('the file uses the word perfect')  # effect type names such as healOnPerfect are code ids, not words

# Nov 8 additions: kick combo Strikes, seal #16, and the audit list.
def on_line(name, src):
    m = re.fullmatch(r'(.+):(\d+)', src or '')
    if not m or m.group(1) not in DOCS: return False
    lines = (R / m.group(1)).read_text().split('\n'); n = int(m.group(2))
    return 0 < n <= len(lines) and re.search(r'(?<![a-z])' + re.escape(name.lower()) + r'(?![a-z])', lines[n - 1].lower()) is not None
strikes_now = {x['id']: x for x in json.loads((R / 'drafts/content/abilities/strikes-4-7-text.json').read_text())['strikes']}
for e in d.get('strikes', []):
    t = f'strike {e.get("id")}'
    old = strikes_now.get(e.get('id'))
    if not old: bad.append(f'{t}: id not in strikes-4-7-text.json (ids never change)'); continue
    if e.get('combo') != old['combo']: bad.append(f'{t}: combo changed')
    if e.get('altName') != old['altName'] and e.get('altName') != old['name']: bad.append(f'{t}: altName must hold the old name')
    if not on_line(e.get('name', ''), e.get('source')): bad.append(f'{t}: {e.get("name")!r} is not on {e.get("source")}: never invent a name')
    if 'low-high' in (e.get('name') or '').lower(): bad.append(f'{t}: still uses Low-High')
    if len((e.get('unlock') or '').split()) > 8: bad.append(f'{t}: unlock line over 8 words')
if not any(e.get('id') == 'hook-kick' and e.get('name') == 'Hook Kick' for e in d.get('strikes', [])): bad.append('Kick Combo 5 must be proposed as Hook Kick')
s16 = d.get('seal16') or {}
ids16 = [x['id'] for x in json.loads((R / 'drafts/content/abilities/seals-16-20-text.json').read_text())['seals']]
if s16.get('id') != ids16[0]: bad.append('seal16: id must stay ' + ids16[0])
if s16.get('status') == 'PROPOSED' and not on_line(s16.get('name', ''), s16.get('source')): bad.append('seal16: proposed name is not in the docs')
if s16.get('status') == 'OPEN' and s16.get('proposedDescription') != 'Hammer Fist, Back Fist': bad.append('seal16: OPEN needs the description "Hammer Fist, Back Fist"')
kid = (s16.get('kidText') or '').lower()
if 'low hammer fist' not in kid: bad.append('seal16: kid text must say "a low hammer fist"')
if len(kid.split()) > 8: bad.append('seal16: kid text over 8 words')
for w in ('groin', 'perfect', 'face', 'head'):
    if re.search(r'\b' + w + r'\b', kid): bad.append(f'seal16: kid text uses {w!r}')
audit = json.loads((R / 'drafts/content/abilities/J27-audit.json').read_text())
for r in audit:
    if r['live'] != ('live' if r['file'].startswith('content/') else 'drafts'): bad.append(f'audit {r["id"]}: live flag wrong')
    if not (R / r['file']).exists(): bad.append(f'audit {r["id"]}: file {r["file"]} missing')
    if r['status'] in ('Real', 'Rename') and not on_line(r['cand'], r['src']): bad.append(f'audit {r["file"]} {r["id"]}: candidate {r["cand"]!r} is not on {r["src"]}')
    if r['status'] == 'OPEN' and r['cand'] != 'OPEN': bad.append(f'audit {r["id"]}: OPEN row must say OPEN')
print(f'strikes: {len(d.get("strikes", []))}; seal16: {s16.get("status")}; audit rows: {len(audit)}')
op = [e['technique'] for e in seals if e.get('status') == 'OPEN']
print(f'proposed: {len(seen)}; OPEN: {op}')
if bad: print('PROBLEMS'); [print(' -', b) for b in bad]; raise SystemExit(1)
print('OK: J27 seal names pass')
