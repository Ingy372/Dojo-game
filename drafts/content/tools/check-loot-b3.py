#!/usr/bin/env python3
"""LOOT-B3-01: check the live loot table content/loot/drops.json (copied from #439) and that the draft drafts/content/loot/LOOT-B3-01.json
still matches it (fails if they diverge: top-level keys, chests, or any enemy chance).
Checks: the four original entries (swarmer, shield, bopper, brute) are unchanged; every enemy that appears in an
Ember Kitchens room (floorSet ember-kitchens in content/rooms/, plus split targets) has an entry unless it is a boss; no boss has an entry;
every key is a real enemy in content/enemies/; chances are numbers from 0 to 1 and not above the brute's; chance follows the health band
(about 22 health: 3.5% or less; 60-75 health: 10% or less); expected enemy drops PER RUN (the enemies a run really meets, measured by
drafts/content/tools/loot-per-run-sim.test.ts.keep and stored in drafts/content/loot/LOOT-B3-01-per-run.json) on belt 3 are within
25% of belt 1; kid-safe words; the room and enemy data the ratio depends on (belt 1 White Dojo and belt 3 Ember Kitchens) still match the data
the per-run counts were measured on (one SHA-256 per belt stored in the per-run file; if either differs, re-run the sim). (The old per-floor room count missed that a run is 8 rooms and meets about 54 Spark Sprites: it said
1.16 where the real ratio was 1.35.)
Usage: python3 drafts/content/tools/check-loot-b3.py   (--print-hash prints the current belt 1 and belt 3 data hashes)"""
import json, glob, pathlib, re, collections, hashlib
R = pathlib.Path(__file__).resolve().parents[3]
live = json.loads((R / 'content/loot/drops.json').read_text())
new = json.loads((R / 'drafts/content/loot/LOOT-B3-01.json').read_text())
bad = []
enemies = {}
for f in glob.glob(str(R / 'content/enemies/*.json')):
    e = json.load(open(f)); enemies[e['id']] = e
ORIGINAL = {'swarmer': 0.035, 'shield': 0.1, 'bopper': 0.1, 'brute': 0.15}
if set(new) != set(live): bad.append(f'top-level keys differ between the draft and live: {sorted(set(new) ^ set(live))}')
if new.get('chests') != live.get('chests'): bad.append('chests differ between the draft and live')
ch = live['enemyDropChance']   # the live table is what the game uses, so the ratio is worked out from it
if new['enemyDropChance'] != ch:
    diff = sorted(k for k in set(new['enemyDropChance']) | set(ch) if new['enemyDropChance'].get(k) != ch.get(k))
    bad.append(f'draft and live drops.json have diverged on: {diff} (update one to match the other)')
for k, v in ORIGINAL.items():
    if ch.get(k) != v: bad.append(f'original entry {k} changed or removed (live {ch.get(k)}, was {v})')
for k, v in ch.items():
    if k not in enemies: bad.append(f'{k}: not an enemy in content/enemies/')
    if not isinstance(v, (int, float)) or isinstance(v, bool) or not 0 <= v <= 1: bad.append(f'{k}: chance must be 0 to 1')
    elif v > ch['brute']: bad.append(f'{k}: higher than the brute ({ch["brute"]})')
    if enemies.get(k, {}).get('boss') and k not in ORIGINAL: bad.append(f'{k}: bosses give chest prizes, not drops')
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
    if not e or e.get('boss') or k in ORIGINAL: continue
    hp = e['maxHealth']
    if hp <= 30 and v > 0.035: bad.append(f'{k}: {hp} health but chance {v} is above the swarmer 0.035')
    if 55 <= hp <= 80 and not 0.05 <= v <= 0.1: bad.append(f'{k}: {hp} health, expected 0.05 to 0.1 (shield/bopper are 0.1), got {v}')
per_run = json.loads((R / 'drafts/content/loot/LOOT-B3-01-per-run.json').read_text())
def data_hash(rooms):
    # SHA-256 of the data a belt's per-run counts depend on: every room of its floor set, and every enemy those rooms use (and split into).
    ids = set()
    for r in rooms:
        for e in r.get('enemies', []):
            ids.add(e['enemy'])
            sp = enemies.get(e['enemy'], {}).get('split')
            if sp: ids.add(sp['into'])
    blob = {'rooms': sorted(rooms, key=lambda r: r['id']), 'enemies': [enemies[i] for i in sorted(ids) if i in enemies]}
    return hashlib.sha256(json.dumps(blob, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
HASHES = {'belt1': (white, 'White Dojo (belt 1)'), 'belt3': (ember, 'Ember Kitchens (belt 3)')}
if '--print-hash' in __import__('sys').argv:
    for belt, (rooms, _) in HASHES.items(): print(belt, data_hash(rooms))
    raise SystemExit(0)
for belt, (rooms, label) in HASHES.items():
    if not rooms: bad.append(f'{belt}: no rooms found for {label}')
    if per_run[belt].get('dataSha256') != data_hash(rooms):
        bad.append(f'the {label} rooms or enemies changed since the per-run counts were measured: re-run the sim '
                   '(drafts/content/tools/loot-per-run-sim.test.ts.keep), update LOOT-B3-01-per-run.json, then store the new hashes '
                   '(python3 drafts/content/tools/check-loot-b3.py --print-hash)')
def run_exp(belt):
    # expected enemy drops in one real run = sum over enemies of (how many a run meets) x (drop chance)
    return sum(ch.get(k, 0) * n for k, n in per_run[belt]['enemiesPerRun'].items())
for belt, tier in (('belt1', 1), ('belt3', 3)):
    if per_run[belt]['tier'] != tier or per_run[belt]['runs'] < 200: bad.append(f'{belt}: per-run file needs tier {tier} and at least 200 runs')
ember_exp = run_exp('belt3'); white_exp = run_exp('belt1')
ratio = ember_exp / white_exp if white_exp else 0
if not 0.75 <= ratio <= 1.25: bad.append(f'expected enemy drops per run {ember_exp:.2f} on belt 3 vs {white_exp:.2f} on belt 1 (ratio {ratio:.2f}) is outside 0.75-1.25')
for m in re.finditer(r'[A-Za-z\-]+', json.dumps([new['notes'], live['notes']])):
    if m.group(0).lower() in ('perfect', 'loot box', 'buy', 'purchase', 'streak'): bad.append(f'notes use banned word {m.group(0)}')
print(f'Ember enemies needing drops: {sorted(k for k in need if not enemies[k].get("boss"))}')
print(f'expected enemy drops per run: belt 3 {ember_exp:.2f}; belt 1 {white_exp:.2f}; ratio {ratio:.2f}')
if bad:
    print('PROBLEMS'); [print(' -', b) for b in bad]; raise SystemExit(1)
print('OK: LOOT-B3-01 passes')
