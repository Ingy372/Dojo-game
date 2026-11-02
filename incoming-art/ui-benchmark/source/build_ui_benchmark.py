"""R-BENCHMARK samples (B2 one paper-and-wood look, B4 Tower Climb icons). Three images, all drawn by script:
  python3 incoming-art/ui-benchmark/source/build_ui_benchmark.py
Needs only Pillow + numpy. Uses incoming-art/tools/board_ui_kit.py, climb_icons.py and the A-MENU2 kit.
All words and numbers in the mocks are placeholders. No text lives inside the art pieces."""
import os, sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(os.path.dirname(ROOT), 'tools'))
import board_ui_kit as ku
import climb_icons as ci
from board_ui_kit import K, M, Screen, font, spr, sized, tint, INK, INK_SOFT, CREAM
import mat

PV = os.path.join(ROOT, 'preview')
os.makedirs(PV, exist_ok=True)
SHADOW_TXT = (60, 32, 14)


def put_piece(sc, im, x, y):
    """pieces carry M points of shadow margin; x, y are the visible top-left."""
    sc.put(im, x - M, y - M)


def label(sc, x, y, s, sz, col=INK, anchor='mm', w='ExtraBold', shadow=None):
    sc.text(x, y, s, sz, col, anchor, w, shadow)


def tri(sc, cx, cy, size, col, left=False):
    d = ImageDraw.Draw(sc.img)
    s = size * K
    x, y = cx * K, cy * K
    if left:
        pts = [(x + s * .5, y - s * .6), (x + s * .5, y + s * .6), (x - s * .6, y)]
    else:
        pts = [(x - s * .5, y - s * .6), (x - s * .5, y + s * .6), (x + s * .6, y)]
    d.polygon(pts, fill=col)


def levelbar(sc, bx, y, bw, frac):
    sc.put(sized('xp-bar-frame', bw, 20), bx, y)
    fw = (bw - 8) * frac
    if fw > 2:
        sc.put(ku.nine(tint(spr('xp-bar-fill'), (242, 193, 78)), int(fw * K), 11 * K, [0, 6, 0, 6]), bx + 4, y + 4)
        sc.put(ku.nine(spr('xp-bar-gloss'), int(fw * K), 11 * K, [0, 6, 0, 6]), bx + 4, y + 4)


# ============ shared chrome: left stage + tabs + frame ============
TABS = [('climb', 'Climb'), ('gear', 'Gear'), ('abilities', 'Abilities'), ('gate', 'Gate')]


def chrome(sc, active, new_on=('gear',), level=(3, 18, 40)):
    W, H = sc.w, sc.h
    # --- left stage (B1 is its own item; this is context so the screen reads as a whole)
    label(sc, 16, 28, 'Training Board', 16, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    put_piece(sc, ku.wood_button(86, 44), 202, 8)
    tri(sc, 221, 30, 6, CREAM, left=True)
    label(sc, 254, 30, 'Dojo', 15, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    cx = 151
    sc.put(ku.mat_tatami(190, 22), cx - 95 - M, 139 - M)
    sh = ku.shadow_oval(64, 9, .5)
    sc.img.alpha_composite(sh, (int(cx * K - sh.width / 2), int(150 * K - sh.height / 2)))
    hp = ku.hero(100)
    sc.img.alpha_composite(hp, (int(cx * K - hp.width / 2), int(152 * K - hp.height)))
    sc.put(sized('title-plaque', 212, 34), cx - 106, 161)
    label(sc, cx, 178, 'Kai M. \u00b7 Green Belt', 15, INK, 'mm', 'ExtraBold')
    lv, cur, tot = level
    label(sc, 45, 204, f'Level {lv}', 12, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    label(sc, 257, 204, f'{cur} of {tot}', 12, CREAM, 'rm', 'ExtraBold', SHADOW_TXT)
    levelbar(sc, 45, 210, 212, cur / tot)
    # buttons
    put_piece(sc, ku.lacquer_button(274, 44, ku.ENTER_TOP, ku.ENTER_BOT, ku.ENTER_OL), 14, 236)
    label(sc, 151, 258, 'ENTER THE TOWER', 17, CREAM, 'mm', 'ExtraBold', ku.ENTER_OL)
    put_piece(sc, ku.wood_button(274, 40), 14, 286)
    label(sc, 151, 306, 'Practice room', 15, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    put_piece(sc, ku.paper_card(274, 46), 14, 332)
    label(sc, 30, 347, 'YOUR NEXT STEP', 12, mat.GOLD_D, 'lm', 'ExtraBold')
    label(sc, 30, 364, 'Self-Defense #18', 16, INK, 'lm', 'ExtraBold')
    label(sc, 276, 364, 'Video soon', 12, INK_SOFT, 'rm', 'Bold')
    tri(sc, 211, 364, 3.6, INK_SOFT)
    # --- right wall: tabs + frame
    x0, tw, gap = 306, 126, 6
    for i, (key, name) in enumerate(TABS):
        x = x0 + i * (tw + gap)
        on = key == active
        if on:
            put_piece(sc, ku.tab(tw, 48, 'active'), x, 4)
        else:
            put_piece(sc, ku.tab(tw, 44, 'normal', seed=11 + i), x, 8)
        ic = ku.tab_icon(key, 26)
        sc.img.alpha_composite(ic, (int((x + 14) * K), int((7 + 22 - 13 + (0 if not on else -2)) * K)))
        label(sc, x + 48, 30 - (2 if on else 0), name, 14, INK if on else CREAM, 'lm', 'ExtraBold', None if on else SHADOW_TXT)
        if key in new_on and not on:
            put_piece(sc, ku.new_dot(6), x + tw - 20, 8)
    sc.put(sized('panel-frame', 536, 340), 300, 46)


# ============ sample 2: the Gate tab, full screen ============
def gate_tab(sc):
    X0 = 326
    label(sc, X0 + 8, 90, 'The Gate to Blue Belt', 20, INK, 'lm', 'ExtraBold')
    label(sc, X0 + 8, 113, '3 of 7 locks lit. A real promotion opens the Gate.', 14, INK_SOFT, 'lm', 'SemiBold')
    names = ['David and\nGoliath', 'Defense\n#16', 'Defense\n#17', 'Defense\n#18', 'Defense\n#19', 'Defense\n#20', 'Kick 4']
    cell = 68
    sx = X0 + 8 + cell / 2
    cy = 158
    d = ImageDraw.Draw(sc.img)
    # the rope joins the seals: gold where lit, wood-brown where locked
    d.line([(sx * K, cy * K), ((sx + 2 * cell) * K, cy * K)], fill=(238, 182, 58), width=5 * K)
    d.line([((sx + 2 * cell) * K, cy * K), ((sx + 6 * cell) * K, cy * K)], fill=(170, 124, 80), width=5 * K)
    for i, nm in enumerate(names):
        x = sx + i * cell
        lit = i < 3
        sc.put(ku.medallion(19, 'lit' if lit else 'locked', seed=31 + i), x - 19 - M, cy - 19 - M)
        for j, line in enumerate(nm.split('\n')):
            label(sc, x, 192 + j * 14 + (7 if '\n' not in nm else 0), line, 12, INK if lit else INK_SOFT, 'mm', 'ExtraBold' if lit else 'Bold')
    # two inset cards
    cw, ch, cyy = 232, 100, 240
    for k, x in enumerate((X0 + 8, X0 + 8 + cw + 12)):
        sc.put(sized('panel-inset', cw, ch), x, cyy)
    sc.put(ku.progress_ring(32, 15 / 24, 8), X0 + 8 + 14 - M, cyy + 18 - M)
    label(sc, X0 + 8 + 14 + 32, cyy + 50, '63%', 14, INK, 'mm', 'ExtraBold')
    label(sc, X0 + 8 + 90, cyy + 36, 'Classes done', 16, INK, 'lm', 'ExtraBold')
    label(sc, X0 + 8 + 90, cyy + 62, '15 of 24', 20, INK, 'lm', 'ExtraBold')
    x2 = X0 + 8 + cw + 12
    # sensei's seal: a paper stamp circle with the character 'master', not lit yet
    sc.put(sized('sheet-icon-well', 64, 64), x2 + 12, cyy + 18)
    d2 = ImageDraw.Draw(sc.img)
    cjk = ImageFont_cjk(30)
    d2.text(((x2 + 44) * K, (cyy + 49) * K), '\u5e2b', font=cjk, fill=(176, 148, 112), anchor='mm')
    label(sc, x2 + 84, cyy + 34, "Sensei's Seal", 16, INK, 'lm', 'ExtraBold')
    label(sc, x2 + 84, cyy + 56, 'Lit when Sensei says', 14, INK_SOFT, 'lm', 'SemiBold')
    label(sc, x2 + 84, cyy + 74, "you're ready.", 14, INK_SOFT, 'lm', 'SemiBold')


def ImageFont_cjk(sz):
    from PIL import ImageFont
    return ImageFont.truetype(ku.CJK, int(sz * K), index=2)



# ============ Tower Climb strip (B4) ============
SEQ = [('fight', 'cleared'), ('fight', 'cleared'), ('door', 'cleared'), ('chest', 'cleared'), ('fight', 'cleared'),
       ('shrine', 'cleared'), ('fight', 'current'), ('door', 'ahead'), ('guardian', 'ahead')]


def climb_strip(sc, x, y, w, seq=SEQ, icon=46, rise=6, numbers=True):
    """a rising step line: one wood block per room, the icon stands on it. Returns the strip height."""
    n = len(seq)
    step = w / n
    base = y + icon + rise * (n - 1) + 4          # top of the first block sits at base ... lower blocks rise
    bottom = base + 22
    d_ = ImageDraw.Draw(sc.img)
    for i, (kind, st) in enumerate(seq):
        top = bottom - 22 - rise * i
        bx = x + i * step
        wood = mat.wood(int(step * K) + 2, int((bottom - top) * K), seed=40 + i)
        blk = Image.new('RGBA', wood.size, (0, 0, 0, 0))
        m = Image.new('L', wood.size, 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, wood.size[0] - 1, wood.size[1] + 20], 6 * K, fill=255)
        blk.paste(wood, (0, 0), m)
        sc.img.alpha_composite(blk, (int(bx * K), int(top * K)))
        d_ = ImageDraw.Draw(sc.img)
        d_.line([(bx * K + 5, top * K + 2), ((bx + step) * K - 5, top * K + 2)], fill=(214, 160, 100), width=2)
        d_.line([((bx + step) * K - 1, top * K + 4), ((bx + step) * K - 1, bottom * K)], fill=(66, 38, 20), width=2)
        if numbers:
            sc.text(bx + step / 2, top + 13, str(i + 1), 12, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
        box_ = icon * (1.2 if kind in ci.BIG else 1.0)
        im = ci.render(kind, st, int(box_ * K))
        ix = bx + step / 2 - box_ / 2
        iy = top - box_ * 0.9 + 1
        sc.put(im, ix, iy)
    return bottom - y


def sample_climb():
    sc = Screen(844, 540)
    label(sc, 22, 26, 'Tower Climb: five rooms, five shapes', 20, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    sc.put(sized('panel-frame', 808, 206), 18, 44)
    sc.put(sized('title-plaque', 190, 34), 34 + 4, 38)
    label(sc, 38 + 95, 55, 'Floor 7 of 9', 15, INK, 'mm', 'ExtraBold')
    climb_strip(sc, 52, 70, 740, icon=62, rise=8)
    # --- the matrix: 5 kinds x 3 states
    put_piece(sc, ku.paper_card(534, 252, seed=22), 18, 262)
    names = {'fight': 'Fight', 'chest': 'Chest', 'shrine': 'Shrine', 'door': 'Challenge', 'guardian': 'Guardian'}
    rows = [('cleared', 'Cleared'), ('current', 'You are here'), ('ahead', 'Not yet')]
    cx0, cw, cy0, rh = 150, 80, 322, 62
    for j, k in enumerate(ci.KINDS):
        label(sc, cx0 + j * cw + 4, 288, names[k], 14, INK, 'mm', 'ExtraBold')
    for r, (st, nm) in enumerate(rows):
        label(sc, 34, cy0 + r * rh + 10, nm, 14, INK, 'lm', 'ExtraBold')
        for j, k in enumerate(ci.KINDS):
            sc.put(ci.render(k, st, 56 * K), cx0 + j * cw + 4 - 28, cy0 + r * rh - 22)
    label(sc, 34, 502, 'Filled = cleared \u00b7 thick ring = you are here \u00b7 outline = not reached yet', 14, INK_SOFT, 'lm', 'SemiBold')
    # --- the tiny-size test
    tx = 572
    put_piece(sc, ku.paper_card(254, 252, seed=23), tx, 262)
    label(sc, tx + 14, 280, 'Tiny-size test (30 pt)', 14, INK, 'lm', 'ExtraBold')
    sz = 34
    for r, nm in enumerate(['colour', 'grey', 'shape only']):
        y = 300 + r * 54
        label(sc, tx + 14, y + 38, nm, 12, INK_SOFT, 'lm', 'Bold')
        for j, k in enumerate(ci.KINDS):
            im = ci.render(k, 'cleared', sz * K)
            if r == 1:
                g = im.convert('LA').convert('RGBA')
                im = g
            elif r == 2:
                m_ = ci.sil(k).resize((sz * K, sz * K), Image.LANCZOS)
                im = Image.new('RGBA', (sz * K, sz * K), INK + (255,))
                im.putalpha(m_)
            sc.put(im, tx + 14 + j * 44, y)
    sc.save(os.path.join(PV, '03-climb-icons'))
    return sc


# ============ the other three tabs: same wood, same paper ============
X0 = 326


def lastrun_tab(sc):
    label(sc, X0 + 8, 90, 'Last run', 20, INK, 'lm', 'ExtraBold')
    label(sc, X0 + 8, 113, 'Floor 7 of 9 \u00b7 1 min 42 s', 14, INK_SOFT, 'lm', 'SemiBold')
    climb_strip(sc, X0 + 8, 114, 468, icon=46, rise=6, numbers=False)
    tiles = [('stat-perfect', '12', 'Perfect'), ('stat-combo', '7', 'Best combo'), ('stat-xp', '36', 'XP')]
    for i, (ic, v, cap) in enumerate(tiles):
        x = X0 + 8 + i * 106
        sc.put(sized('stat-tile', 98, 60), x, 258)
        sc.put(spr(ic), x + 8, 268)
        label(sc, x + 62, 278, v, 18, INK, 'mm', 'ExtraBold')
        label(sc, x + 49, 304, cap, 12, INK_SOFT, 'mm', 'Bold')
    put_piece(sc, ku.lacquer_button(150, 44, mat.GOLD_L, mat.GOLD, mat.GOLD_D), X0 + 8 + 330, 266)
    label(sc, X0 + 8 + 330 + 75, 288, 'Climb again', 16, INK, 'mm', 'ExtraBold')
    label(sc, X0 + 8, 340, 'You found a Rare charm. Look in Gear!', 14, INK_SOFT, 'lm', 'SemiBold')


def gear_tab(sc):
    label(sc, X0 + 8, 90, 'Gear', 20, INK, 'lm', 'ExtraBold')
    label(sc, X0 + 8, 113, 'Wear what you win in the Tower.', 14, INK_SOFT, 'lm', 'SemiBold')
    sc.put(sized('doll-backing', 116, 156), X0 + 20, 136)
    hp = ku.hero(92)
    sc.img.alpha_composite(hp, (int((X0 + 78) * K - hp.width / 2), int(284 * K - hp.height)))
    for i, nm in enumerate(['Gi', 'Charm', 'Belt tag']):
        y = 138 + i * 52
        sc.put(sized('gear-ring-common', 46, 46), X0 + 150, y)
        label(sc, X0 + 206, y + 24, nm, 14, INK, 'lm', 'Bold')
    label(sc, X0 + 268, 142, 'Bag', 16, INK, 'lm', 'ExtraBold')
    for i in range(8):
        sc.put(sized('tray-tile-normal', 46, 46), X0 + 268 + (i % 4) * 50, 156 + (i // 4) * 54)
    label(sc, X0 + 268, 282, 'Empty for now.', 14, INK, 'lm', 'Bold')
    label(sc, X0 + 268, 302, 'Win a chest to fill it!', 14, INK_SOFT, 'lm', 'SemiBold')


def abilities_tab(sc):
    label(sc, X0 + 8, 90, 'Abilities', 20, INK, 'lm', 'ExtraBold')
    label(sc, X0 + 8, 113, '3 learned. 5 more to find.', 14, INK_SOFT, 'lm', 'SemiBold')
    sc.put(sized('switch-track', 190, 40), X0 + 290, 76)
    sc.put(sized('switch-left-on', 94, 34), X0 + 293, 79)
    label(sc, X0 + 340, 96, 'Learned', 12, INK, 'mm', 'ExtraBold')
    label(sc, X0 + 436, 96, 'All', 12, CREAM, 'mm', 'ExtraBold')
    got = ['icon-sweep-64', 'icon-strong-block-64', 'icon-sharp-eyes-64']
    nm = ['Sweep', 'Strong Block', 'Sharp Eyes', 'Disarm', 'Throw', 'Steady Breath', 'Off-balance', 'Escape Step']
    for i in range(8):
        x = X0 + 8 + (i % 4) * 118
        y = 128 + (i // 4) * 108
        on = i < 3
        sc.put(sized('cubby-earned' if on else 'cubby-notyet', 84, 84), x + 8, y)
        if on:
            ic = spr(got[i]).resize((52 * K, 52 * K), Image.LANCZOS)
            sc.put(ic, x + 8 + 16, y + 16)
        label(sc, x + 50, y + 94, nm[i], 12, INK if on else INK_SOFT, 'mm', 'ExtraBold' if on else 'Bold')


TAB_CONTENT = {'climb': lastrun_tab, 'gear': gear_tab, 'abilities': abilities_tab, 'gate': gate_tab}


def screen_for(tab):
    sc = Screen(844, 390)
    chrome(sc, tab)
    TAB_CONTENT[tab](sc)
    return sc


def sample_kit():
    W = 844
    sc = Screen(W, 1074)
    y = 10

    def head(txt, yy, note=None):
        label(sc, 22, yy, txt, 15, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
        if note:
            label(sc, 822, yy, note, 12, (226, 196, 150), 'rm', 'Bold')

    def cap(x, yy, txt, col=(226, 196, 150)):
        label(sc, x, yy, txt, 12, col, 'mm', 'Bold')

    label(sc, 22, y + 16, 'Training Board kit: one paper-and-wood look', 20, CREAM, 'lm', 'ExtraBold', SHADOW_TXT)
    # --- tabs
    y = 52
    head('Tabs (icon + label, no numbers)', y)
    states = [('Climb', 'climb', 'normal', 'normal'), ('Gear', 'gear', 'normal', 'normal + new dot'),
              ('Abilities', 'abilities', 'pressed', 'pressed'), ('Gate', 'gate', 'active', 'active (raised, gold)')]
    for i, (nm, key, st, cp) in enumerate(states):
        x = 22 + i * 204
        ty = 70 + (0 if st == 'active' else 4)
        put_piece(sc, ku.tab(130, 48 if st == 'active' else 44, st, seed=11 + i), x, ty)
        ic = ku.tab_icon(key, 26)
        sc.img.alpha_composite(ic, (int((x + 14) * K), int((ty + 22 - 13 - (2 if st == 'active' else 0)) * K)))
        label(sc, x + 50, ty + 22 - (2 if st == 'active' else 0), nm, 14, INK if st == 'active' else CREAM, 'lm', 'ExtraBold', None if st == 'active' else SHADOW_TXT)
        if nm == 'Gear':
            put_piece(sc, ku.new_dot(6), x + 110, 76)
        cap(x + 65, 128, cp)
    # --- buttons
    y = 150
    head('Buttons', y, 'orange = Enter the Tower only. Red = danger only (none here).')
    ENT = (ku.ENTER_TOP, ku.ENTER_BOT, ku.ENTER_OL)
    put_piece(sc, ku.lacquer_button(250, 46, *ENT), 22, 170)
    label(sc, 147, 193, 'ENTER THE TOWER', 17, CREAM, 'mm', 'ExtraBold', ku.ENTER_OL)
    put_piece(sc, ku.lacquer_button(250, 46, *ENT, pressed=True), 22, 224)
    label(sc, 147, 248, 'ENTER THE TOWER', 17, CREAM, 'mm', 'ExtraBold', ku.ENTER_OL)
    cap(147, 282, 'orange, normal + pressed')
    GOLD = (mat.GOLD_L, mat.GOLD, mat.GOLD_D)
    put_piece(sc, ku.lacquer_button(190, 44, *GOLD), 296, 170)
    label(sc, 391, 192, 'Climb again', 16, INK, 'mm', 'ExtraBold')
    put_piece(sc, ku.lacquer_button(190, 44, *GOLD, pressed=True), 296, 224)
    label(sc, 391, 247, 'Climb again', 16, INK, 'mm', 'ExtraBold')
    cap(391, 282, 'gold = the main action')
    put_piece(sc, ku.wood_button(150, 44), 512, 170)
    label(sc, 587, 192, 'Practice room', 15, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    put_piece(sc, ku.wood_button(150, 44, pressed=True), 512, 224)
    label(sc, 587, 247, 'Practice room', 15, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    cap(587, 282, 'wood = second action')
    put_piece(sc, ku.wood_button(130, 44, disabled=True), 692, 170)
    label(sc, 757, 192, 'Locked', 15, (190, 160, 124), 'mm', 'ExtraBold')
    put_piece(sc, ku.wood_button(130, 44), 692, 224)
    tri(sc, 719, 247, 6, CREAM, left=True)
    label(sc, 765, 247, 'Dojo', 15, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
    cap(757, 282, 'disabled, and back')
    # --- surfaces
    y = 312
    head('Surfaces: the same paper on every tab', y)
    sc.put(sized('panel-frame', 300, 164), 18, 328)
    label(sc, 40, 362, 'Panel frame', 16, INK, 'lm', 'ExtraBold')
    label(sc, 40, 384, 'Wood frame, brass corners,', 14, INK_SOFT, 'lm', 'SemiBold')
    label(sc, 40, 402, 'one cream paper inside.', 14, INK_SOFT, 'lm', 'SemiBold')
    sc.put(sized('panel-inset', 130, 44), 40, 418)
    label(sc, 105, 440, 'Inset well', 14, INK, 'mm', 'ExtraBold')
    put_piece(sc, ku.paper_card(120, 44), 182, 418)
    label(sc, 242, 440, 'Card', 14, INK, 'mm', 'ExtraBold')
    sc.put(sized('title-plaque', 190, 36), 334, 332)
    label(sc, 429, 350, 'Kai M. \u00b7 Green Belt', 15, INK, 'mm', 'ExtraBold')
    cap(429, 380, 'wood sign (name and belt)')
    put_piece(sc, ku.ribbon(94, 22, ku.ROOTED), 334, 396)
    label(sc, 381, 407, 'Rooted', 12, CREAM, 'mm', 'ExtraBold', (20, 50, 100))
    put_piece(sc, ku.ribbon(94, 22, ku.FLOWING), 436, 396)
    label(sc, 483, 407, 'Flowing', 12, CREAM, 'mm', 'ExtraBold', (14, 80, 56))
    cap(429, 436, 'family ribbons: small only')
    # progress things
    for i, f in enumerate((0, .45, 1)):
        levelbar(sc, 334, 448 + i * 24, 150, f)
    label(sc, 496, 458, 'empty', 12, (226, 196, 150), 'lm', 'Bold')
    label(sc, 496, 482, 'part', 12, (226, 196, 150), 'lm', 'Bold')
    label(sc, 496, 506, 'full', 12, (226, 196, 150), 'lm', 'Bold')
    # right column of bits, on one paper card
    put_piece(sc, ku.paper_card(270, 190), 556, 328)
    for i, st in enumerate(('lit', 'locked')):
        sc.put(ku.medallion(20, st, seed=31 + i), 580 + i * 52 - M, 350 - M)
    sc.put(ku.progress_ring(22, .62, 7), 708 - M, 348 - M)
    sc.put(ku.progress_ring(22, .12, 7), 764 - M, 348 - M)
    label(sc, 620, 402, 'seal lit / locked', 12, INK_SOFT, 'mm', 'Bold')
    label(sc, 758, 402, 'ring: x of y', 12, INK_SOFT, 'mm', 'Bold')
    put_piece(sc, ku.new_dot(6), 576, 424)
    label(sc, 590, 424, 'new: gold dot, no number', 12, INK_SOFT, 'lm', 'Bold')
    for i, (k, st) in enumerate((('chest', 'cleared'), ('fight', 'current'), ('shrine', 'ahead'), ('door', 'ahead'))):
        sc.put(ci.render(k, st, 40 * K), 574 + i * 46, 442)
    label(sc, 576, 494, 'map icons: cleared, here, not yet', 12, INK_SOFT, 'lm', 'Bold')
    # --- palette
    y = 548
    head('Palette (tokens.json)', y)
    sw = [('wall', (122, 78, 44)), ('frame', (150, 96, 58)), ('paper', (247, 235, 210)), ('ink', INK), ('honey', (226, 170, 98)),
          ('gold', (238, 182, 58)), ('enter orange', (236, 118, 32)), ('rooted', ku.ROOTED), ('flowing', ku.FLOWING), ('danger red', None)]
    for i, (nm, c) in enumerate(sw):
        x = 22 + i * 80
        d = ImageDraw.Draw(sc.img)
        if c is None:
            d.rounded_rectangle([x * K, 564 * K, (x + 70) * K, 604 * K], 6 * K, outline=(226, 196, 150), width=2 * K)
            sc.text(x + 35, 584, 'not used', 12, (226, 196, 150), 'mm', 'Bold')
        else:
            d.rounded_rectangle([x * K, 564 * K, (x + 70) * K, 604 * K], 6 * K, fill=c, outline=(40, 22, 12), width=2)
        cap(x + 35, 616, nm)
        cap(x + 35, 630, '#%02x%02x%02x' % c if c else 'danger only')
    # --- proof: four tabs, one look
    y = 662
    head('Four tabs, one paper tone inside one wood frame', y, 'Climb \u00b7 Gear \u00b7 Abilities \u00b7 Gate')
    for i, t in enumerate(TAB_CONTENT):
        th = screen_for(t).img.resize((410 * K, 190 * K), Image.LANCZOS) if False else screen_for(t).img.resize((int(412 * K), int(190.4 * K)), Image.LANCZOS)
        sc.img.alpha_composite(th, (int((18 + (i % 2) * 414) * K), int((680 + (i // 2) * 196) * K)))
    sc.save(os.path.join(PV, '01-board-panel-kit'))
    return sc


def sample_screen():
    sc = screen_for('gate')
    sc.save(os.path.join(PV, '02-board-gate-844x390'))
    return sc


if __name__ == '__main__':
    sample_screen()
    sample_climb()
    sample_kit()
