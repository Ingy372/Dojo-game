#!/usr/bin/env python3
"""L11-C1: build the 56 room files for tiers 4-10 (drafts/planning/L11-SPEC.md section 2).
Each room copies a live room's layout from content/rooms/, swaps enemies as the spec says,
and takes its kid-facing name and sign from that tier's themed draft (drafts/content/rooms/<place>.json).
Writes one file per room to drafts/content/rooms/L11/, in the exact content/rooms format,
so L11-B2 can move a tier's 8 files into content/rooms/ when its Guardian is ready.
Usage: python3 drafts/content/tools/build-l11-rooms.py"""
import json, os, copy
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
OUT = os.path.join(ROOT, 'drafts/content/rooms/L11')
def live(name): return json.load(open(os.path.join(ROOT, 'content/rooms', name + '.json')))

# swap rules: ('all', from, to) swaps every one; ('one', from, to) swaps only the first.
SW_SPARK = [('all', 'swarmer', 'spark-sprite')]
TIERS = {
  4: dict(place='giants-steps', guardian='stone-giant', helper='swarmer', rooms=[
    ('battle', 'pillar-court', SW_SPARK, 'pebble-path'),
    ('battle', 'staff-and-shield', [], 'shield-shelf'),
    ('battle', 'bopper-yard', [('all', 'swarmer', 'doughling')], 'swarm-slope'),
    ('battle', 'oven-row', [('all', 'brute', 'shield')], 'switchback-road'),
    ('challenge', 'shield-wall', SW_SPARK, 'giants-gate'),
    ('treasure', 'treasure-vault', [], 'water-jar-landing'),
    ('rest', 'quiet-shrine', [], 'resting-step'),
    ('boss', 'keepers-hall', None, 'great-stair')]),
  5: dict(place='quiet-river', guardian='river-watcher', helper='spark-sprite', rooms=[
    ('battle', 'long-table-hall', [], 'ferry-landing'),
    ('battle', 'bopper-yard', [], 'reed-bank'),
    ('battle', 'lantern-room', [('all', 'shield', 'ladle-lobber')], 'crab-shallows'),
    ('battle', 'pin-lanes', [], 'wave-lanes'),
    ('challenge', 'supper-rush', [('all', 'rolling-pin', 'bopper')], 'lantern-barge'),
    ('treasure', 'treasure-vault', [], 'oar-locker'),
    ('rest', 'quiet-shrine', [], 'still-pool'),
    ('boss', 'keepers-hall', None, 'watching-pool')]),
  6: dict(place='forge-of-courage', guardian='ember-knight', helper='swarmer', rooms=[
    ('battle', 'brute-and-swarm', [], 'bellows-door'),
    ('battle', 'training-yard', [], 'cub-crowd'),
    ('battle', 'bamboo-hall', [], 'anvil-alley'),
    ('battle', 'ember-pantry', [], 'sweeping-hall'),
    ('challenge', 'gauntlet', [], 'smiths-rush'),
    ('treasure', 'treasure-vault', [], 'shield-rack'),
    ('rest', 'quiet-shrine', [], 'cool-embers'),
    ('boss', 'keepers-hall', None, 'knights-forge')]),
  7: dict(place='hall-of-echoes', guardian='echo-mask', helper='swarmer', rooms=[
    ('battle', 'twin-shields', [('one', 'shield', 'brute')], 'whisper-gate'),
    ('battle', 'guarded-swarm', [], 'split-mirrors'),
    ('battle', 'narrow-bridge', [], 'shade-gallery'),
    ('battle', 'pin-lanes', [], 'masklet-circle'),
    ('challenge', 'shield-wall', [('one', 'shield', 'brute')], 'echo-chamber'),
    ('treasure', 'treasure-vault', [], 'kind-word-nook'),
    ('rest', 'quiet-shrine', [], 'quiet-corner'),
    ('boss', 'keepers-hall', None, 'mask-hall')]),
  8: dict(place='root-library', guardian='root-keeper', helper='spark-sprite', rooms=[
    ('battle', 'staff-and-shield', [], 'dusty-entry'),
    ('battle', 'long-table-hall', [], 'reading-roots'),
    ('battle', 'narrow-bridge', [], 'inkwell-aisle'),
    ('battle', 'oven-row', [], 'root-stacks'),
    ('challenge', 'gauntlet', SW_SPARK, 'great-reading-room'),
    ('treasure', 'treasure-vault', [], 'story-shelf'),
    ('rest', 'quiet-shrine', [], 'reading-nook'),
    ('boss', 'keepers-hall', None, 'root-hall')]),
  9: dict(place='storm-stair', guardian='storm-herald', helper='swarmer', rooms=[
    ('battle', 'bopper-yard', [], 'rainy-landing'),
    ('battle', 'pillar-court', [], 'breezy-bend'),
    ('battle', 'pin-lanes', [], 'drum-landing'),
    ('battle', 'training-yard', [], 'zigzag-steps'),
    ('challenge', 'supper-rush', [], 'storm-gate'),
    ('treasure', 'treasure-vault', [], 'feather-nook'),
    ('rest', 'quiet-shrine', [], 'dry-alcove'),
    ('boss', 'keepers-hall', None, 'heralds-landing')]),
  10: dict(place='summit', guardian='lost-lightbearer', helper='spark-sprite', rooms=[
    ('battle', 'brute-and-swarm', [], 'summit-steps'),
    ('battle', 'twin-shields', [], 'wisp-walk'),
    ('battle', 'long-table-hall', [], 'knight-terrace'),
    ('battle', 'ember-pantry', [], 'sweeper-ridge'),
    ('challenge', 'gauntlet', [], 'last-climb'),
    ('treasure', 'treasure-vault', [], 'bell-nook'),
    ('rest', 'quiet-shrine', [], 'lamp-stand'),
    ('boss', 'keepers-hall', None, 'summit-lamp')]),
}
# Signs trimmed to 8 words for this set (the themed draft keeps its own text).
SIGN_FIX = {'The steps are tall. Take them one at a time.': 'Tall steps? Take them one at a time.'}
# Challenge words: seconds stay with the layout; kid lines are 8 words or fewer and fit the place.
LATE = {4: 'Steep hill! You still earned a chest.', 5: 'Wide river! You still earned a chest.',
        6: 'Busy forge! You still earned a chest.', 7: 'Loud echoes! You still earned a chest.',
        8: 'Tall shelves! You still earned a chest.', 9: 'Loud storm! You still earned a chest.',
        10: 'Long climb! You still earned a chest.'}
def challenge_for(base_c, tier):
    s = base_c['seconds']
    when = f'{s // 60} minutes' if s % 60 == 0 and s >= 120 else f'{s} seconds'
    return {'seconds': s, 'text': f'Finish in {when} for a better chest!', 'inTimeText': 'In time!',
            'outOfTimeText': LATE[tier], 'outOfTimeShort': "Time's up!"}
SWAP_NAMES = {'swarmer': 'Swarmers', 'spark-sprite': 'Spark Sprites', 'doughling': 'Doughlings', 'brute': 'Brute',
              'shield': 'Shield', 'ladle-lobber': 'Ladle Lobbers', 'rolling-pin': 'Rolling Pins', 'bopper': 'Boppers'}
# Art notes that named enemies not built yet, rewritten to fit the live enemies.
ART_NOTE = 'Layout copied from {src}. Theme and props from the {place} draft room "{theme}".'

def swap(enemies, rules):
    out = copy.deepcopy(enemies)
    for mode, a, b in rules:
        for e in out:
            if e['enemy'] == a:
                e['enemy'] = b
                if mode == 'one': break
    return out

def guardian_enemies(g, helper):
    # Guardian + 4 helpers, like the Hearth Cook's Great Hearth: 2 beside it, then 2 more.
    return [dict(enemy=g, column=10, row=3, wave=1),
            dict(enemy=helper, column=6, row=4, wave=1), dict(enemy=helper, column=14, row=4, wave=1),
            dict(enemy=helper, column=6, row=5, wave=2), dict(enemy=helper, column=14, row=5, wave=2)]

def main():
    for f in os.listdir(OUT):
        if f.endswith('.json'): os.remove(os.path.join(OUT, f))
    n = 0
    for tier, t in TIERS.items():
        theme = {r['id']: r for r in json.load(open(os.path.join(ROOT, 'drafts/content/rooms', t['place'] + '.json')))['rooms']}
        for kind, src, rules, themed in t['rooms']:
            base, th = live(src), theme[themed]
            assert base['kind'] == kind, (src, base['kind'], kind)
            room = {'id': f't{tier}-{themed}', 'name': th['name'], 'kind': kind, 'minBeltTier': tier, 'floorSet': t['place']}
            for k, v in base.items():
                if k in ('id', 'name', 'kind', 'minBeltTier', 'floorSet', 'enemies', 'artProps', 'signs'): continue
                room[k] = copy.deepcopy(v)
            if kind == 'challenge': room['challenge'] = challenge_for(base['challenge'], tier)
            if rules:
                said = '; '.join(('every ' if m == 'all' else 'one ') + f'{SWAP_NAMES[a]} -> {SWAP_NAMES[b]}' for m, a, b in rules)
                room['mix'] = (room.get('mix', '') + f' L11 swap: {said}.').strip()
            if 'enemies' in base:
                room['enemies'] = guardian_enemies(t['guardian'], t['helper']) if kind == 'boss' else swap(base['enemies'], rules)
            room['artProps'] = ART_NOTE.format(src=src, place=t['place'], theme=themed) + ' ' + th.get('artProps', '')
            room['artProps'] = room['artProps'].strip()
            room['signs'] = [SIGN_FIX.get(s, s) for s in th.get('signs', [])]
            json.dump(room, open(os.path.join(OUT, room['id'] + '.json'), 'w'), indent=2, ensure_ascii=False)
            open(os.path.join(OUT, room['id'] + '.json'), 'a').write('\n')
            n += 1
    print(f'wrote {n} rooms to drafts/content/rooms/L11/')
main()
