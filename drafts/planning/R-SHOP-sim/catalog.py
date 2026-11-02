#!/usr/bin/env python3
"""R-SHOP catalog (local, not game code). One table holds every shop item group, so the counts, coins, shelves and art numbers
in R-SHOP.md come from here and not from hand sums. Usage: python3 catalog.py > catalog.md
art kinds: tint = a colour entry only (no new picture) | fx = a data recipe using shared particle shapes | char = a new character layer
(rendered for 13 animations x 8 directions x 2 bodies) | decor = a static picture in the dojo | ui = a screen picture"""
from contrast import BELT_MONTHS

BANDS = {'XS': 100, 'S': 200, 'M': 400, 'L': 800, 'XL': 1600, 'Showpiece': 3200}
# (category, group, band, art kind, pictures, {belt it opens at: how many items}, [names])
G = [
 ('Looks', 'Gi dyes (solid)', 'S', 'tint', 0, {1: 6, 2: 6}, ['Rose', 'Peach', 'Mint', 'Aqua', 'Lilac', 'Sage', 'Plum', 'Teal', 'Pine', 'Mauve', 'Bubblegum', 'Lime']),
 ('Looks', 'Fun hair dyes', 'S', 'tint', 0, {1: 4, 2: 4}, ['Bubblegum', 'Mint', 'Lilac', 'Peach', 'Aqua', 'Sunset', 'Silver', 'Rose gold']),
 ('Looks', 'Patterned headbands', 'M', 'char', 4, {1: 2, 2: 3, 3: 3}, ['Dots, pink', 'Dots, teal', 'Stars, yellow', 'Stars, sky', 'Waves, blue', 'Waves, mint', 'Checks, plum', 'Checks, orange']),
 ('Looks', 'Hair accessories', 'M', 'char', 3, {1: 2, 2: 2, 3: 2}, ['Bow, pink', 'Bow, sky', 'Hair clips, yellow', 'Hair clips, mint', 'Flower, rose', 'Flower, lilac']),
 ('Looks', 'Gi prints', 'M', 'char', 3, {3: 3, 4: 3}, ['Clouds, sky', 'Clouds, rose', 'Waves, ocean', 'Waves, teal', 'Leaves, sage', 'Leaves, plum']),
 ('Looks', 'Scarves', 'M', 'char', 2, {4: 2, 5: 2}, ['Knit scarf, mint', 'Knit scarf, rose', 'Bandana, dots', 'Bandana, stars']),
 ('Looks', 'Glasses (clear lenses)', 'M', 'char', 2, {5: 2, 6: 2}, ['Round frames, blue', 'Round frames, pink', 'Star frames, yellow', 'Star frames, mint']),
 ('Looks', 'Back items', 'L', 'char', 4, {5: 4}, ['Little backpack', 'Folded kite', 'Satchel', 'Paper umbrella']),
 ('Looks', 'Outfits (belt stays on top)', 'XL', 'char', 6, {6: 3, 7: 3}, ['Festival jacket', 'Summer tee and shorts', 'Snow-day jacket', 'Garden overalls', 'Rainbow track suit', 'Starry pajamas']),
 ('Effects', 'Walk trails', 'M', 'fx', 0, {1: 3, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1}, ['Cherry petals', 'Maple leaves', 'Ink swish', 'Star dust', 'Bubbles', 'Paper confetti', 'Fireflies', 'Snow sparkle', 'Ribbon swirl', 'Little hearts']),
 ('Effects', 'Dash puffs', 'S', 'fx', 0, {1: 4}, ['Dust cloud', 'Leaf puffs', 'Star puffs', 'Snow puffs']),
 ('Effects', 'Hit pops', 'L', 'fx', 0, {2: 1, 3: 2, 4: 2, 5: 2, 6: 1}, ['Star pop', 'Petal burst', 'Ink splash', 'Leaf burst', 'Drum ring', 'Firework pop', 'Bubble pop', 'Paper-bits burst']),
 ('Effects', 'Victory bursts', 'L', 'fx', 0, {2: 1, 3: 1, 4: 1, 5: 1, 6: 2}, ['Lantern rise', 'Petal rain', 'Confetti fall', 'Fireworks', 'Paper stars', 'Ribbon streamers']),
 ('Space', 'Bag skins', 'M', 'ui', 4, {1: 4}, ['Sunrise', 'Night sky', 'Garden', 'Ocean']),
 ('Space', 'Wall paint', 'M', 'tint', 0, {1: 3, 2: 3}, ['Sunrise', 'Seafoam', 'Lavender', 'Sand', 'Sky', 'Rose']),
 ('Space', 'Floor patterns', 'L', 'decor', 4, {3: 2, 4: 2}, ['Wood plank', 'Woven floor', 'Stone path', 'Pastel tiles']),
 ('Space', 'Wall hangings', 'M', 'decor', 4, {1: 3, 2: 2, 3: 1, 7: 2}, ['Wave, blue', 'Wave, rose', 'Mountain, green', 'Mountain, grey', 'Moon, indigo', 'Moon, yellow', 'Sun, orange', 'Sun, pink']),
 ('Space', 'Large wall hangings', 'L', 'decor', 2, {4: 2, 5: 2}, ['Koi, orange', 'Koi, blue', 'Sakura, pink', 'Sakura, white']),
 ('Space', 'Wall pieces', 'L', 'decor', 8, {3: 2, 4: 2, 5: 2, 6: 2}, ['Moonlit window', 'Sakura window', 'Mountain window', 'Rainy window', 'Bell wind chime', 'Shell wind chime', 'Star mobile', 'Paper boat mobile']),
 ('Space', 'Small floor pieces', 'M', 'decor', 9, {1: 4, 2: 3, 3: 3}, ['Round rug, blue', 'Round rug, rose', 'Low tea table', 'Shoe cubby', 'Sunflower pot', 'Umbrella stand', 'Cat basket', 'Book stack', 'Fish bowl', 'Plush toy bin']),
 ('Space', 'Medium floor pieces', 'L', 'decor', 8, {3: 2, 4: 2, 5: 2, 6: 2}, ['Bookshelf', 'Rock garden', 'Fish tank', 'Water fountain', 'Stepping stones', 'Hammock', 'Craft table', 'Toy chest']),
 ('Space', 'Large floor pieces', 'XL', 'decor', 6, {4: 1, 5: 2, 6: 1, 7: 2}, ['Koi pond', 'Cherry tree', 'Gazebo', 'Tea house nook', 'Big round rug', 'Play loft']),
 ('Space', 'Showpieces', 'Showpiece', 'decor', 4, {5: 1, 6: 1, 7: 2}, ['Moon garden', 'Cherry grove', 'Waterfall garden', 'Giant kite display']),
]
SPARKLES = ['Cherry-blossom trail', 'Confetti win', 'Drum-roll finish', 'Lantern glow', 'Star shower', 'Bubble pop']   # XS 100 per use, one run each
SHAPES = ['petal', 'leaf', 'ink stroke', 'star', 'bubble', 'confetti bit', 'soft dot', 'four-point sparkle', 'ribbon', 'heart', 'soft puff',
          'ink blob', 'ring', 'spark line', 'lantern orb', 'firework burst']   # shared particle pictures for every effect
STAGE = {'tint': 1, 'fx': 1, 'decor': 2, 'ui': 2, 'char': 3}
STAGE_NAME = {1: 'Stage 1: no new pictures (colour entries, effect recipes)', 2: 'Stage 2: still pictures (decor, bag skins)', 3: 'Stage 3: character layers'}
RUNS_PER_MONTH = 8 * 4.35   # PROGRESSION.typicalRunsPerWeek x weeksPerMonth, config.ts

for c, g, b, a, p, s, n in G: assert sum(s.values()) == len(n), (g, sum(s.values()), len(n))
ITEMS = []   # (category, group, band, art kind, name, belt it opens at)
for c, g, b, a, p, s, names in G:
    i = 0
    for bt, k in sorted(s.items()):
        for n in names[i:i + k]: ITEMS.append((c, g, b, a, n, bt))
        i += k
COUNT, TOTAL = len(ITEMS), sum(BANDS[i[2]] for i in ITEMS)

def shelf():
    out = {t: [0, 0, 0] for t in range(1, 11)}
    for c, g, b, a, n, bt in ITEMS: out[bt][0] += 1; out[bt][1] += BANDS[b]; out[bt][2] += b in ('S', 'M')
    return out

if __name__ == '__main__':
    print('## Catalog groups\n\n| Category | Group | Band | Price | Items | Sub-total | Opens at belt | Art |\n|---|---|---|---|---|---|---|---|')
    for c, g, b, a, p, s, n in G:
        belts = ', '.join(f'{t} ({k})' for t, k in sorted(s.items()))
        print(f'| {c} | {g} | {b} | {BANDS[b]} | {len(n)} | {len(n) * BANDS[b]:,} | {belts} | {a}{f", {p} pictures" if p else ""} |')
    print(f'| **Total permanent** | | | | **{COUNT}** | **{TOTAL:,}** | | |')
    print('\n## Every item\n\n| Group | Price | Items (belt it opens at in brackets) |\n|---|---|---|')
    for c, g, b, a, p, s, n in G:
        out, i = [], 0
        for bt, k in sorted(s.items()):
            out += [f'{x} [{bt}]' for x in n[i:i + k]]; i += k
        print(f'| {g} | {BANDS[b]:,} | ' + '; '.join(out) + ' |')
    print(f'| Run sparkles (one run each) | 100 | ' + '; '.join(SPARKLES) + ' (all at belt 1) |')
    print('\n## Counts by category\n\n| Category | Items | Coins |\n|---|---|---|')
    for cat in ('Looks', 'Effects', 'Space'):
        its = [i for i in ITEMS if i[0] == cat]; print(f'| {cat} | {len(its)} | {sum(BANDS[i[2]] for i in its):,} |')
    print(f'| Run sparkles (one run each, 100) | {len(SPARKLES)} | n/a |')
    print('\n## Shelf per belt (what opens at promotion)\n\n| Belt | Months in rank | Items opening | Coins opening | Cumulative coins open | Cumulative share | Small items (S or M) |\n|---|---|---|---|---|---|---|')
    sh, cum = shelf(), 0
    for t in range(1, 11):
        cum += sh[t][1]; print(f'| {t} | {BELT_MONTHS[t - 1]} | {sh[t][0]} | {sh[t][1]:,} | {cum:,} | {100 * cum / TOTAL:.0f}% | {sh[t][2]} |')
    ratios = [max(sh[t][1] / sh[t + 1][1], sh[t + 1][1] / sh[t][1]) for t in range(1, 7)]
    print(f'\nBiggest neighbour jump in shelf value, belts 1 to 7: x{max(ratios):.2f}. Smallest shelf with small items: {min(sh[t][2] for t in range(1, 8))} (belts 1 to 7).')
    print('\n## Art, in three buckets\n')
    char = sum(p for c, g, b, a, p, s, n in G if a == 'char'); decor = sum(p for c, g, b, a, p, s, n in G if a in ('decor', 'ui')) + 1  # +1: tintable wall picture for Wall paint
    tint = sum(len(n) for c, g, b, a, p, s, n in G if a == 'tint') + sum(len(n) - p for c, g, b, a, p, s, n in G if a in ('char', 'decor', 'ui'))
    fxn = sum(len(n) for c, g, b, a, p, s, n in G if a == 'fx')
    print(f'| Bucket | Count | What |\n|---|---|---|\n| New character layers | {char} | each rendered for 13 animations x 8 directions x 2 bodies |\n| Colour entries, no new picture | {tint} | gi and hair dyes, wall paints, and the extra colourways of a picture |\n| Effect and decor pictures | {len(SHAPES) + decor} | {len(SHAPES)} shared particle shapes + {decor - 1} still pictures + 1 tintable wall |\n| Effect recipes (data) | {fxn} + {len(SPARKLES)} sparkles | {fxn} permanent effects and {len(SPARKLES)} sparkles, all built from the shapes above |')
    print(f'\nNew pictures in total: {char + len(SHAPES) + decor}. Character layers need about 1,190 renders per body each (80 min per body for 32 layers on 8 cores, incoming-art/player-custom/README.md), so all {char} take about {char * 80 / 32 / 60:.1f} hours per body of machine time. The slow parts are the modelling and Jay approving each picture.')
    print('\n## Ship order (cheapest art first)\n\n| Stage | Items | Coins | Pictures needed |\n|---|---|---|---|')
    for st in (1, 2, 3):
        its = [i for i in ITEMS if STAGE[i[3]] == st]
        pic = {1: f'{len(SHAPES)} small shapes + 1 wall (+ the effect renderer)', 2: f'{sum(p for c, g, b, a, p, s, n in G if a in ("decor", "ui"))} still pictures', 3: f'{char} character layers'}[st]
        print(f'| {STAGE_NAME[st]} | {len(its)} | {sum(BANDS[i[2]] for i in its):,} | {pic} |')
