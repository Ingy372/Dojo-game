#!/usr/bin/env python3
"""LOOT-B3-01: check the drop-in loot table drafts/content/loot/LOOT-B3-01.json.
Checks: same top-level shape and chests as content/loot/drops.json; the four live entries are unchanged; every enemy that appears in an
Ember Kitchens room (floorSet ember-kitchens in content/rooms/, plus split targets) has an entry unless it is a boss; no boss has an entry;
every key is a real enemy in content/enemies/; chances are numbers from 0 to 1 and not above the brute's; chance follows the health band
(about 22 health: 3.5% or less; 60-75 health: 10%); expected enemy drops per Ember floor are within 25% of a belt 1 floor; kid-safe words.
Usage: python3 drafts/content/tools/check-loot-b3.py"""
import json, glob, pathlib, re, collections
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
    if 55 <= hp <= 80 and v != 0.1: bad.append(f'{k}: {hp} health, expected 0.1 like shield/bopper, got {v}')
ember_exp = sum(ch.get(k, 0) * n for k, n in count.items())
def room_exp(rs):
    return sum(ch.get(e['enemy'], 0) for r in rs for e in r.get('enemies', [])) / max(1, len(rs))
def floor_exp(rs):
    # a floor plays 4 battle rooms, the challenge and the boss room (treasure and rest rooms have no enemies)
    by = lambda kind: [r for r in rs if r.get('kind') == kind]
    return 4 * room_exp(by('battle')) + room_exp(by('challenge')) + room_exp(by('boss'))
white_exp = floor_exp(white)
ratio = ember_exp / white_exp if white_exp else 0
if not 0.75 <= ratio <= 1.25: bad.append(f'expected enemy drops per Ember floor {ember_exp:.2f} vs belt 1 {white_exp:.2f} (ratio {ratio:.2f}) is outside 0.75-1.25')
for m in re.finditer(r'[A-Za-z\-]+', json.dumps(new['notes'])):
    if m.group(0).lower() in ('perfect', 'loot box', 'buy', 'purchase', 'streak'): bad.append(f'notes use banned word {m.group(0)}')
print(f'Ember enemies needing drops: {sorted(k for k in need if not enemies[k].get("boss"))}')
print(f'expected enemy drops per Ember floor {ember_exp:.2f}; belt 1 floor {white_exp:.2f}; ratio {ratio:.2f}')
if bad:
    print('PROBLEMS'); [print(' -', b) for b in bad]; raise SystemExit(1)
print('OK: LOOT-B3-01 passes')
