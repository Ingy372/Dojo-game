#!/usr/bin/env python3
"""LP-C1 faith pack checker. Run from repo root. Add --online to re-check KJV text against bible-api.com."""
import json, re, sys, glob, urllib.request, urllib.parse
P = json.load(open('drafts/content/faith/LP-C1-faith-pack.json'))
doc = open('docs/faith-and-creed.md').read()
fails = []
def fail(m): fails.append(m)
# wall text = faith-and-creed.md section 3 + section 6 KJV fixes
sec3 = doc.split('## 3.')[1].split('## 4.')[0]
wall = {m.group(2): m.group(3).strip() for m in re.finditer(r'\*\*(.+?): (.+?)\*\*\n(.+)', sec3)}
wall['Romans 3:23'] = wall['Romans 3:23'].replace('and falled short', 'and come short')
wall['Romans 5:8'] = wall['Romans 5:8'].replace('Christ dies', 'Christ died')
sec4 = doc.split('## 4.')[1].split('## 5.')[0]
cov = {m.group(1): m.group(2).strip() for m in re.finditer(r'\| \*\*(.+?)\*\* \| (.+?\.)(?: \*\(.*)? ?\|', sec4)}
cov['Honesty'] = cov.pop('Honest')  # LP-C2: Manager picked the section 6 name
sec5 = doc.split('## 5.')[1].split('## 6.')[0]
words = re.findall(r'\| ([A-Z]) \| (\w+) \| ([\w/]+) \|', sec5)
sec1 = doc.split('## 1.')[1].split('## 2.')[0]
creed = '\n'.join(l[2:] if l.startswith('> ') else l[1:] for l in sec1.splitlines() if l.startswith('>')).replace('**', '').strip()
if P['creedScroll']['text'] != creed: fail('creed text differs from section 1')
refs = [s['reference'] for s in P['verseScrolls']]
if sorted(refs) != sorted(wall): fail(f'verse set differs: {refs}')
for s in P['verseScrolls']:
    if s['wallText'] != wall.get(s['reference']): fail(f"{s['id']}: wallText differs from doc")
    if s['showText'] not in ('kjv', 'wall'): fail(f"{s['id']}: bad showText")
    c = s['covenant']
    if c and cov.get(c['name']) != c['text']: fail(f"{s['id']}: covenant {c['name']} differs from section 4")
used = [s['covenant']['name'] for s in P['verseScrolls'] if s['covenant']]
if sorted(used) != sorted(cov): fail('covenant set differs from section 4')
L = [(x['letter'], x['word']) for x in P['faithDoesBanner']['letters']]
if L != [(a, b) for a, b, _ in words]: fail('FAITH DOES letters differ from section 5')
if ''.join(a for a, _ in L) != P['faithDoesBanner']['acrostic'].replace(' ', ''): fail('acrostic mismatch')
# Guardians match bosses and overlay
names = {json.load(open(f))['faithOverlayKey']: json.load(open(f))['name'] for f in glob.glob('drafts/content/bosses/*.json')}
ov = {g['faithOverlayKey'] for g in json.load(open('drafts/content/faith/guardian-faith-overlay.json'))['guardians']}
gs = P['guardianRestored']['guardians']
if {g['faithOverlayKey'] for g in gs} != ov: fail('guardian keys differ from overlay')
for g in gs:
    if names.get(g['faithOverlayKey']) != g['name']: fail(f"{g['faithOverlayKey']}: name differs from bosses file")
# kid lines: <= 8 words, no banned words
kid = []
kid += [('creed.' + k, v) for k, v in P['creedScroll']['lines'].items()]
kid += [('banner.' + k, v) for k, v in P['faithDoesBanner']['lines'].items()]
for x in P['faithDoesBanner']['letters']: kid += [(x['letter'] + '.meaning', x['meaning']), (x['letter'] + '.lit', x['lit'])]
for s in P['verseScrolls']: kid += [(s['id'] + '.' + k, v) for k, v in s['lines'].items()]
kid += [('guardian.template', P['guardianRestored']['template'])] + [(g['faithOverlayKey'], g['line']) for g in gs]
for k, v in kid:
    n = len(v.split())
    if n > 8: fail(f'{k}: {n} words: {v}')
    if re.search(r'perfect|must|should|shame|bad kid|peace, be still', v, re.I): fail(f'{k}: banned word: {v}')
if '--online' in sys.argv:
    for s in P['verseScrolls'] + [{'id': 'motto', 'reference': P['creedScroll']['mottoVerse']['reference'], 'kjvText': P['creedScroll']['mottoVerse']['text']}]:
        r = s['reference'].replace('–', '-')
        d = json.load(urllib.request.urlopen('https://bible-api.com/' + urllib.parse.quote(r) + '?translation=kjv'))
        t = ' '.join(' '.join(v['text'].split()) for v in d['verses'])
        if t != s['kjvText']: fail(f"{s['id']}: kjvText differs from bible-api KJV: {t}")
print(f'{len(kid)} kid lines, {len(P["verseScrolls"])} scrolls, {len(gs)} guardians')
for f in fails: print('FAIL', f)
print('PASS' if not fails else f'{len(fails)} FAIL'); sys.exit(1 if fails else 0)
