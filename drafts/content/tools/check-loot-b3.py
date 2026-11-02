#!/usr/bin/env python3
"""LOOT-B3-01: check the drop-in loot table drafts/content/loot/LOOT-B3-01.json.
Checks: same top-level shape and chests as content/loot/drops.json; the four live entries are unchanged; every enemy that appears in an
Ember Kitchens room (floorSet ember-kitchens in content/rooms/, plus split targets) has an entry unless it is a boss; no boss has an entry;
every key is a real enemy in content/enemies/; chances are numbers from 0 to 1 and not above the brute's; chance follows the health band
(about 22 health: 3.5% or less; 60-75 health: 10% or less); expected enemy drops PER RUN (the enemies a run really meets, measured by
drafts/content/tools/loot-per-run-sim.test.ts.keep and stored in drafts/content/loot/LOOT-B3-01-per-run.json) on belt 3 are within
25% of belt 1; kid-safe words; the Ember Kitchens room and enemy data still match the data the per-run counts were measured on
(a SHA-256 stored in the per-run file; if it differs, re-run the sim). (The old per-floor room count missed that a run is 8 rooms and meets about 54 Spark Sprites: it said
1.16 where the real ratio was 1.35.)
Usage: python3 drafts/content/tools/check-loot-b3.py   (--print-hash prints the current Ember data hash)"""
import json, glob, pathlib, re, collections, hashlib
R = pathlib.Path(__file__).resolve().parents[3]
live = json.loads((R / 'content/loot/drops.json').read_text())
new = json.loads((R / 'drafts/content/loot/LOOT-B3-01.json').read_text())
bad = []
enemies = {}
for f in glob.glob(str(R / 'content/enemies/*.json')):
    e = json.load(open(f)); enemies[e['id']] = e
if set(new) != set(live): bad.append(f'top-level keys differ: {sorted(set(new) ^ set(live))}')
if new.get('chests') != live.get('chests'): bad.append('chests changed (this item only adds enemy chances)')
ch = new['enemyDropChance']
for k, v in live['enemyDropChance'].items():
    if ch.get(k) != v: bad.append(f'live entry {k} changed or removed')
for k, v in ch.items():
    if k not in enemies: bad.append(f'{k}: not an enemy in content/enemies/')
    if not isinstance(v, (int, float)) or isinstance(v, bool) or not 0 <= v <= 1: bad.append(f'{k}: chance must be 0 to 1')
    elif v > ch['brute']: bad.append(f'{k}: higher than the brute ({ch["brute"]})')
    if enemies.get(k, {}).get('boss') and k not in live['enemyDropChance']: bad.append(f'{k}: bosses give chest prizes, not drops')
def rooms_for(fs):
    out = []
    for f in glob.glob(str(R / 'content/rooms/*.json')):
        d = json.load(open(f))
        if d.get('floorSet') == fs: out.append(d)
    return out
ember = rooms_for('ember-kitchens'); white = rooms_for('white-dojo')
need = set()
count = collections.Counter()
for r in ember:
    for e in r.get('enemies', []):
        need.add(e['enemy']); count[e['enemy']] += 1
        sp = enemies.get(e['enemy'], {}).get('split')
        if sp: need.add(sp['into']); count[sp['into']] += sp['count']
for k in sorted(need):
    if enemies[k].get('boss'): continue
    if k not in ch: bad.append(f'{k}: appears in Ember Kitchens but has no drop entry')
for k, v in ch.items():
    e = enemies.get(k)
    if not e or e.get('boss') or k in live['enemyDropChance']: continue
    hp = e['maxHealth']
    if hp <= 30 and v > 0.035: bad.append(f'{k}: {hp} health but chance {v} is above the swarmer 0.035')
    if 55 <= hp <= 80 and not 0.05 <= v <= 0.1: bad.append(f'{k}: {hp} health, expected 0.05 to 0.1 (shield/bopper are 0.1), got {v}')
per_run = json.loads((R / 'drafts/content/loot/LOOT-B3-01-per-run.json').read_text())
def ember_data_hash():
    # SHA-256 of the data the per-run counts depend on: every Ember Kitchens room, and every enemy those rooms use (and split into).
    ids = set()
    for r in ember:
        for e in r.get('enemies', []):
            ids.add(e['enemy'])
            sp = enemies.get(e['enemy'], {}).get('split')
            if sp: ids.add(sp['into'])
    blob = {'rooms': sorted(ember, key=lambda r: r['id']), 'enemies': [enemies[i] for i in sorted(ids) if i in enemies]}
    return hashlib.sha256(json.dumps(blob, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
if '--print-hash' in __import__('sys').argv:
    print(ember_data_hash()); raise SystemExit(0)
if per_run.get('emberDataSha256') != ember_data_hash():
    bad.append('the Ember Kitchens rooms or enemies changed since the per-run counts were measured: re-run the sim '
               '(drafts/content/tools/loot-per-run-sim.test.ts.keep), update LOOT-B3-01-per-run.json, then store the new hash '
               '(python3 drafts/content/tools/check-loot-b3.py --print-hash)')
def run_exp(belt):
    # expected enemy drops in one real run = sum over enemies of (how many a run meets) x (drop chance)
    return sum(ch.get(k, 0) * n for k, n in per_run[belt]['enemiesPerRun'].items())
for belt, tier in (('belt1', 1), ('belt3', 3)):
    if per_run[belt]['tier'] != tier or per_run[belt]['runs'] < 200: bad.append(f'{belt}: per-run file needs tier {tier} and at least 200 runs')
ember_exp = run_exp('belt3'); white_exp = run_exp('belt1')
ratio = ember_exp / white_exp if white_exp else 0
if not 0.75 <= ratio <= 1.25: bad.append(f'expected enemy drops per run {ember_exp:.2f} on belt 3 vs {white_exp:.2f} on belt 1 (ratio {ratio:.2f}) is outside 0.75-1.25')
for m in re.finditer(r'[A-Za-z\-]+', json.dumps(new['notes'])):
    if m.group(0).lower() in ('perfect', 'loot box', 'buy', 'purchase', 'streak'): bad.append(f'notes use banned word {m.group(0)}')
print(f'Ember enemies needing drops: {sorted(k for k in need if not enemies[k].get("boss"))}')
print(f'expected enemy drops per run: belt 3 {ember_exp:.2f}; belt 1 {white_exp:.2f}; ratio {ratio:.2f}')
if bad:
    print('PROBLEMS'); [print(' -', b) for b in bad]; raise SystemExit(1)
print('OK: LOOT-B3-01 passes')
