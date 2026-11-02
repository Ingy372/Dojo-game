"""FINAL export for the Programmer (R-BENCHMARK B2 / B3 / B4):  python3 incoming-art/ui-benchmark/source/export_sprites.py
Writes incoming-art/ui-benchmark/sprites/  (kit/ tab-icons/ climb/ wall/ + board-ui.json) and three previews.
Every sprite is a PNG at 1x (name.png) and @2x (name@2x.png). Sizes in the manifest are 1x points (the 1x file is that many px).
Every kit piece carries a 6 pt shadow margin (shadowMargin). nineSlice is [top, right, bottom, left] in 1x px, same as menu2.json.
No text is baked into any piece (the 師 seal glyph is art, not copy). Needs Pillow + numpy."""
import os, sys, json, math
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(os.path.dirname(ROOT), 'tools'))
sys.path.insert(0, HERE)
import board_ui_kit as ku
import climb_icons as ci
import make_tab_icons as ti
import mat
from board_ui_kit import K, M, Screen, font, spr, sized, tint, INK, INK_SOFT, CREAM
from mat import S
import build_ui_benchmark as bb

SP = os.path.join(ROOT, 'sprites')
PV = os.path.join(ROOT, 'preview')
MAN = {}


def save2(im2, path_noext):
    os.makedirs(os.path.dirname(path_noext), exist_ok=True)
    im2.save(path_noext + '@2x.png', optimize=True)
    im2.resize((im2.width // 2, im2.height // 2), Image.LANCZOS).save(path_noext + '.png', optimize=True)


def emit(group, name, im2, note, nine=None, state=None, visible=None, extra=None):
    """im2 is the @2x image. visible = [x, y, w, h] of the drawn shape inside the file (1x pt)."""
    save2(im2, os.path.join(SP, group, name))
    e = {'file': f'{group}/{name}.png', 'file2x': f'{group}/{name}@2x.png', 'size': [im2.width // 2, im2.height // 2]}
    if nine is not None:
        e['nineSlice'] = nine
    if visible is not None:
        e['visibleRect'] = visible
        e['shadowMargin'] = M
    if state:
        e['state'] = state
    if extra:
        e.update(extra)
    e['note'] = note
    MAN[f'{group}/{name}'] = e


def vis(w, h):
    return [M, M, w, h]


# ---------------- buttons: 3 families x states, 3-slice along x (height is fixed at 44) ----------------
BW, BH = 120, 44
BN = [27, 28, 27, 28]            # [t, r, b, l]; t/b = half the file height, so only the middle column stretches
ENT = (ku.ENTER_TOP, ku.ENTER_BOT, ku.ENTER_OL)
GOLD = (mat.GOLD_L, mat.GOLD, mat.GOLD_D)
bn_note = ' 3-slice along x only (left and right caps 28 px, middle column stretches). Height is fixed at 44 pt. Text is drawn by the game.'
emit('kit', 'button-enter', ku.lacquer_button(BW, BH, *ENT), 'ENTER THE TOWER button (the only orange in the UI). Text cream with an orange-brown outline.' + bn_note, BN, 'normal', vis(BW, BH))
emit('kit', 'button-enter-pressed', ku.lacquer_button(BW, BH, *ENT, pressed=True), 'ENTER THE TOWER, pressed (2 pt lower, short shadow). Move the text down 2 pt.' + bn_note, BN, 'pressed', vis(BW, BH))
emit('kit', 'button-gold', ku.lacquer_button(BW, BH, *GOLD), 'Gold lacquer main action (Climb again). Text dark ink #462a16.' + bn_note, BN, 'normal', vis(BW, BH))
emit('kit', 'button-gold-pressed', ku.lacquer_button(BW, BH, *GOLD, pressed=True), 'Gold, pressed. Move the text down 2 pt.' + bn_note, BN, 'pressed', vis(BW, BH))
emit('kit', 'button-wood', ku.wood_button(BW, BH), 'Wood button for secondary actions (Practice room, back to Dojo). Text cream with a dark shadow.' + bn_note, BN, 'normal', vis(BW, BH))
emit('kit', 'button-wood-pressed', ku.wood_button(BW, BH, pressed=True), 'Wood, pressed.' + bn_note, BN, 'pressed', vis(BW, BH))
emit('kit', 'button-wood-disabled', ku.wood_button(BW, BH, disabled=True), 'Wood, disabled (locked). Text colour #bea07c.' + bn_note, BN, 'disabled', vis(BW, BH))

# ---------------- tabs ----------------
TW, TH = 126, 44
TN = [20, 20, 12, 20]
tb = ' 3-slice along x (20 px caps). Open at the bottom: the tab sits on the frame. Icon and label are drawn by the game.'
emit('kit', 'tab-normal', ku.tab(TW, TH, 'normal'), 'Wood tab, resting. Top of the shape is 8 pt below the active tab.' + tb, TN, 'normal', vis(TW, TH))
emit('kit', 'tab-pressed', ku.tab(TW, TH, 'pressed', seed=12), 'Wood tab, pressed (darker).' + tb, TN, 'pressed', vis(TW, TH))
emit('kit', 'tab-active', ku.tab(TW, TH + 4, 'active'), 'ACTIVE tab: raised honey-gold lacquer, 4 pt taller. Draw it 4 pt higher than the others. Label dark ink #462a16.' + tb, [20, 20, 12, 20], 'active', vis(TW, TH + 4))
emit('kit', 'new-dot', ku.new_dot(6), 'Small gold "something new" dot. No number, never red. Sits at the tab\'s top-right: (tabLeft + tabWidth - 20, tabTop).', None, None, vis(12, 12))

# ---------------- paper card, ribbons ----------------
emit('kit', 'paper-card', ku.paper_card(80, 60), 'Cream paper card with a wood edge: the one paper tone on every tab. 9-slice 18 px (6 shadow + 10 corner + 2).', [18, 18, 18, 18], None, vis(80, 60))
RW, RH = 94, 22
emit('kit', 'ribbon-rooted', ku.ribbon(RW, RH, ku.ROOTED), 'Rooted family ribbon (blue). Small bookmark flag with a notched tail. 3-slice along x: 14 px left cap, 24 px right cap (the notch).', [0, 24, 0, 14], None, vis(RW, RH))
emit('kit', 'ribbon-flowing', ku.ribbon(RW, RH, ku.FLOWING), 'Flowing family ribbon (green). Same shape and slice.', [0, 24, 0, 14], None, vis(RW, RH))

# ---------------- gate: medallions, ring (24 steps), sensei seal ----------------
emit('kit', 'medallion-lit', ku.medallion(19, 'lit'), 'Gate lock seal, lit: gold with a check. Diameter 38 pt. One per lock that is lit.', None, 'lit', vis(38, 38))
emit('kit', 'medallion-locked', ku.medallion(19, 'locked'), 'Gate lock seal, locked: wood with a paper padlock. Diameter 38 pt.', None, 'locked', vis(38, 38))
for i in range(25):
    emit('kit/ring', f'ring-{i:02d}', ku.progress_ring(32, i / 24, 8), f'Progress ring {i}/24 (gold arc from the top, clockwise, on a wood track). Diameter 64 pt. Pick the nearest of 25 steps; ring-24 is full.', None, f'{i}/24', vis(64, 64),
         {'step': i, 'of': 24} if True else None)


def sensei_seal(lit):
    d_ = 64
    img = ku.cv(d_, d_)
    m = mat.ell(*img.size, [S(M), S(M), S(M + d_), S(M + d_)])
    mat.drop_shadow(img, m, 1.6, 1.8, .4)
    if lit:
        mat.tex(img, mat.brass(*img.size, mat.GOLD_L, mat.GOLD, mat.GOLD_D), m)
        mat.bevel(img, m, 1.6, 1.2, hi_a=.55, lo_a=.35)
        mat.rim_light(img, m, alpha=.7)
        glyph = (98, 58, 30)
    else:
        mat.tex(img, mat.paper(*img.size, 9, mat.PAPER_D, (200, 170, 126), vignette=0), m)
        mat.inner_shadow(img, m, 2, 2, .3)
        glyph = (176, 148, 112)
    mat.outline(img, m, mat.WOOD_DD, 1.6)
    ImageDraw.Draw(img).text((S(M + d_ / 2), S(M + d_ / 2 + 1)), '\u5e2b', font=bb.ImageFont_cjk(30), fill=glyph + (255,), anchor='mm')
    return ku.out(img, d_, d_)


emit('kit', 'sensei-seal-unlit', sensei_seal(False), "Sensei's Seal, not lit yet: paper stamp with the 師 character (master) in muted brown. Diameter 64 pt.", None, 'unlit', vis(64, 64))
emit('kit', 'sensei-seal-lit', sensei_seal(True), "Sensei's Seal, lit (Sensei says you are ready): gold with the 師 in dark brown. Cross-fade from unlit over about 0.3 s.", None, 'lit', vis(64, 64))

# ---------------- level bar, floor mat, wall ----------------
emit('kit', 'level-fill-gold', ku.nine(tint(spr('xp-bar-fill'), (242, 193, 78)), 192 * K, 11 * K, [0, 6, 0, 6]), 'Level bar fill, gold-tinted. Frame = menu2 xp-bar-frame (see menu2Refs). Draw the fill 4 pt inside the frame, width = (frameWidth - 8) * fraction, 11 pt tall. 3-slice along x, 6 px caps. Gloss = menu2 xp-bar-gloss on top.', [0, 6, 0, 6], None, None)
emit('kit', 'floor-mat', ku.mat_tatami(190, 22), 'Tatami floor mat the hero stands on (flat oval). Hero feet at the middle of the mat.', None, None, vis(190, 22))
emit('wall', 'wall-844x390', ku.wall(844, 390), 'The wood wall behind every tab, one image at the 844 x 390 design size. Scale to cover. Vertical planks every 58 pt.', None, None, None)

# ---------------- tab icons (B3 final) ----------------
for k in ti.KINDS:
    emit('tab-icons', f'tab-icon-{k}', ti.render(k, 26 * K), f'B3 final {k} tab icon, 26 pt box. Dark outline so it reads on the wood tab and on the gold active tab. No red.', None, None, None,
         {'tab': k})

# ---------------- climb room icons: 5 kinds x 3 states ----------------
ROOM = {'fight': 'battle', 'chest': 'treasure', 'shrine': 'rest', 'door': 'challenge', 'guardian': 'boss'}
HUEN = {'fight': 'blue', 'chest': 'gold', 'shrine': 'green', 'door': 'orchid', 'guardian': 'purple'}
STN = {'cleared': 'filled + gold check seal', 'current': 'filled + cream-and-gold ring (you are here)', 'ahead': 'outline ring only (not reached yet)'}
for k in ci.KINDS:
    for st in ci.STATES:
        emit('climb', f'{ROOM[k]}-{st}', ci.render(k, st, ci.U * K), f'Tower Climb {ROOM[k]} room, {HUEN[k]}, {st}: {STN[st]}. 72 pt art box, shape inset 4 pt. Nominal draw size 46 pt (boss 1.2x).', None, st, None,
             {'room': ROOM[k], 'hue': HUEN[k]})

ABOUT = {
    'about': 'R-BENCHMARK final export: Training Board kit sprites (B2), Tower Climb room icons (B4), final tab icons (B3). Sizes are 1x points; every file also exists as name@2x.png. nineSlice = [top, right, bottom, left] in 1x px (same as menu2.json).',
    'shadowMargin': M,
    'rule': 'No text in any sprite except the 師 seal glyph. Orange = ENTER THE TOWER only. No red anywhere in the UI. Guardian/boss is purple.',
    'menu2Refs': {k: {'file': 'menu2/sprites/' + ku.MAN[k]['file'], 'size': ku.MAN[k]['size'], 'nineSlice': ku.MAN[k].get('nineSlice')} for k in
                  ['panel-frame', 'panel-inset', 'title-plaque', 'xp-bar-frame', 'xp-bar-gloss', 'stat-tile', 'sheet-icon-well', 'doll-backing', 'gear-ring-common', 'tray-tile-normal', 'cubby-earned', 'cubby-notyet', 'switch-track', 'switch-left-on']},
    'menu2RefsNote': 'These already exist in incoming-art/menu2/sprites (A-MENU2). Not copied here. The Board uses them as they are.',
    'tabLayout': {'unit': 'pt', 'tabWidth': 126, 'gap': 6, 'firstTabX': 306, 'restingTop': 8, 'activeTop': 4, 'iconBox': 26, 'iconX': 14, 'iconCentreY': 'tab centre (active: 2 pt higher)', 'labelX': 48, 'labelFont': '14 pt ExtraBold',
                  'labelColour': {'normal': '#fff4dc with a #3c200e shadow', 'active': '#462a16'}, 'newDot': 'x = tabLeft + 100, y = 8'},
    'tabs': ['climb', 'gear', 'abilities', 'gate'],
    'climbRooms': {'mapping': ROOM, 'practice': None,
                   'note': 'RoomKind also has "practice". It has NO icon here (only five were approved). Use the battle icon or ask Art for a sixth.',
                   'states': STN, 'nominalSize': 46, 'bossScale': 1.2, 'artBox': 72},
    'ring': {'steps': 24, 'start': 'top, clockwise', 'file': 'kit/ring/ring-NN.png (NN = 00..24)'},
}
json.dump({**ABOUT, 'sprites': MAN}, open(os.path.join(SP, 'board-ui.json'), 'w'), indent=1, ensure_ascii=False)
print(len(MAN), 'sprites')

# ================== previews ==================
BG = Image.new('RGBA', (1, 1))


def load(key, scale2=True):
    e = MAN[key]
    return Image.open(os.path.join(SP, e['file2x'])).convert('RGBA')


def cap(sc, x, y, t, col=(226, 196, 150), sz=12):
    sc.text(x, y, t, sz, col, 'mm', 'Bold')


# ---- 04: the export contact sheet
def contact():
    W, H = 844, 840
    sc = Screen(W, H)
    sc.text(22, 24, 'Final export: Board kit sprites', 20, CREAM, 'lm', 'ExtraBold', bb.SHADOW_TXT)
    sc.text(822, 24, 'every file at 1x and @2x', 12, (226, 196, 150), 'rm', 'Bold')

    def put_vis(key, x, y):
        """x, y = visible top-left; the file's shadow margin hangs outside it."""
        sc.put(load(key), x - M, y - M)

    for i, k in enumerate(['button-enter', 'button-enter-pressed', 'button-gold', 'button-gold-pressed', 'button-wood', 'button-wood-pressed', 'button-wood-disabled']):
        x = 24 + (i % 4) * 204
        yy = 56 + (i // 4) * 78
        put_vis('kit/' + k, x, yy)
        cap(sc, x + 60, yy + BH + 14, k)
    for i, k in enumerate(['tab-normal', 'tab-pressed', 'tab-active']):
        x = 24 + i * 204
        put_vis('kit/' + k, x, 222 + (0 if k == 'tab-active' else 4))
        cap(sc, x + 63, 222 + 44 + 26, k)
    put_vis('kit/new-dot', 650, 236)
    cap(sc, 668, 266, 'new-dot')
    y = 310
    put_vis('kit/paper-card', 24, y)
    cap(sc, 64, y + 74, 'paper-card')
    put_vis('kit/ribbon-rooted', 140, y)
    cap(sc, 187, y + 36, 'ribbon-rooted')
    put_vis('kit/ribbon-flowing', 140, y + 46)
    cap(sc, 187, y + 82, 'ribbon-flowing')
    put_vis('kit/medallion-lit', 270, y)
    put_vis('kit/medallion-locked', 322, y)
    cap(sc, 322, y + 54, 'medallion lit / locked')
    put_vis('kit/sensei-seal-unlit', 410, y)
    put_vis('kit/sensei-seal-lit', 486, y)
    cap(sc, 484, y + 80, 'sensei seal unlit / lit')
    put_vis('kit/floor-mat', 596, y + 10)
    cap(sc, 691, y + 54, 'floor-mat')
    y = 424
    for i, n in enumerate((0, 6, 12, 18, 24)):
        put_vis(f'kit/ring/ring-{n:02d}', 24 + i * 80, y)
    cap(sc, 24 + 2 * 80 + 32, y + 78, 'ring-00 / 06 / 12 / 18 / 24 (25 steps)')
    y = 538
    sc.text(22, y, 'Tower Climb room icons (3 states each)', 15, CREAM, 'lm', 'ExtraBold', bb.SHADOW_TXT)
    for j, (k, room) in enumerate(ROOM.items()):
        sc.text(150 + j * 96, y + 22, room, 12, (226, 196, 150), 'mm', 'Bold')
        for r, st in enumerate(ci.STATES):
            sc.put(load(f'climb/{room}-{st}').resize((64 * K, 64 * K), Image.LANCZOS), 118 + j * 96, y + 32 + r * 66)
    for r, st in enumerate(ci.STATES):
        sc.text(22, y + 32 + r * 66 + 32, st, 12, (226, 196, 150), 'lm', 'Bold')
    sc.text(660, y, 'Tab icons (26 pt)', 15, CREAM, 'lm', 'ExtraBold', bb.SHADOW_TXT)
    for i, kk in enumerate(ti.KINDS):
        sc.put(load(f'tab-icons/tab-icon-{kk}').resize((44 * K, 44 * K), Image.LANCZOS), 660 + (i % 2) * 80, y + 28 + (i // 2) * 70)
        cap(sc, 660 + (i % 2) * 80 + 22, y + 28 + (i // 2) * 70 + 52, kk, sz=11)
    sc.save(os.path.join(PV, '04-export-contact-sheet'))


contact()


# ---- 05: B3 tab icons
def tabs_preview():
    W, H = 844, 560
    sc = Screen(W, H)
    sc.text(22, 24, 'B3: final tab icons', 20, CREAM, 'lm', 'ExtraBold', bb.SHADOW_TXT)
    sc.text(822, 24, 'tower  \u00b7  bag  \u00b7  fist and spark  \u00b7  gate with a lock', 12, (226, 196, 150), 'rm', 'Bold')
    for i, k in enumerate(ti.KINDS):
        sc.put(ti.render(k, 128 * K), 22 + i * 206, 44)
    # in place: normal and active tabs
    sc.text(22, 190, 'In place (26 pt): resting and active', 15, CREAM, 'lm', 'ExtraBold', bb.SHADOW_TXT)
    for row, active in enumerate((None, 'climb', 'gear', 'abilities', 'gate')):
        y = 210 + row * 62 if row < 1 else None
    for i, (key, name) in enumerate(bb.TABS):
        for r, on in enumerate((False, True)):
            x = 22 + i * 206
            ty = 214 + r * 60 + (4 if not on else 0) - 4
            if on:
                sc.put(ku.tab(126, 48, 'active'), x - M, ty - M)
            else:
                sc.put(ku.tab(126, 44, 'normal', seed=11 + i), x - M, ty + 4 - M)
            ic = ku.tab_icon(key, 26)
            sc.put(ic, x + 14, ty + (4 if not on else 0) + 22 - 13 - (2 if on else 0))
            sc.text(x + 48, ty + (4 if not on else 0) + 22 - (2 if on else 0), name, 14, INK if on else CREAM, 'lm', 'ExtraBold', None if on else bb.SHADOW_TXT)
    # tiny test
    sc.text(22, 362, 'Tiny test: colour, grey, shape only (26 pt and 20 pt)', 15, CREAM, 'lm', 'ExtraBold', bb.SHADOW_TXT)
    for r, mode in enumerate(('colour', 'grey', 'shape')):
        sc.text(22, 392 + r * 40 + 14, mode, 12, (226, 196, 150), 'lm', 'Bold')
        for i, k in enumerate(ti.KINDS):
            for j, px in enumerate((26, 20)):
                im = ti.render(k, px * K)
                if mode == 'grey':
                    im = im.convert('LA').convert('RGBA')
                elif mode == 'shape':
                    a = im.getchannel('A')
                    im = Image.new('RGBA', im.size, (255, 244, 220, 255))
                    im.putalpha(a)
                sc.put(im, 100 + i * 100 + j * 40, 392 + r * 40)
    # before / after
    sc.text(560, 362, 'Before (placeholder) and after', 15, CREAM, 'lm', 'ExtraBold', bb.SHADOW_TXT)
    for i, k in enumerate(ti.KINDS):
        sc.put(ku.tab_icon_placeholder(k, 52), 560 + i * 66, 384)
        sc.put(ti.render(k, 52 * K), 560 + i * 66, 444)
    sc.text(540, 410, 'before', 12, (226, 196, 150), 'rm', 'Bold')
    sc.text(540, 470, 'after', 12, (226, 196, 150), 'rm', 'Bold')
    sc.save(os.path.join(PV, '05-b3-tab-icons'))


tabs_preview()


# ---- 06: 9-slice proof (rebuilt from the exported files + the manifest margins)
def nine_test():
    W, H = 844, 520
    sc = Screen(W, H)
    sc.text(22, 24, '9-slice proof: each sprite re-stretched from its exported PNG and manifest margins', 16, CREAM, 'lm', 'ExtraBold', bb.SHADOW_TXT)
    rows = [('kit/button-enter', [(120, 44), (200, 44), (300, 44)]), ('kit/button-gold', [(90, 44), (160, 44), (300, 44)]),
            ('kit/button-wood', [(90, 44), (160, 44), (300, 44)]), ('kit/tab-normal', [(100, 44), (126, 44), (180, 44)]),
            ('kit/tab-active', [(100, 48), (126, 48), (180, 48)]), ('kit/ribbon-rooted', [(60, 22), (94, 22), (150, 22)]),
            ('kit/paper-card', [(60, 50), (120, 70), (200, 90)])]
    y = 48
    for key, sizes in rows:
        e = MAN[key]
        im = load(key)
        x = 22
        for (w, h) in sizes:
            out = ku.nine(im, (w + 2 * M) * K, (h + 2 * M) * K, e['nineSlice'])
            sc.put(out, x - M, y - M)
            x += w + 28
        sc.text(822, y + 22, key.split('/')[1], 12, (226, 196, 150), 'rm', 'Bold')
        y += (h + 18) if key != 'kit/paper-card' else 0
    sc.save(os.path.join(PV, '06-nine-slice-proof'))


nine_test()
print('previews ok')
