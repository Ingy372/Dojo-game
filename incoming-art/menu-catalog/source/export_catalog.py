"""FINAL export for the Programmer (MENU-CATALOG-01):  python3 incoming-art/menu-catalog/source/export_catalog.py
Writes incoming-art/menu-catalog/sprites/  (card/ mini/ family-art/ + catalog-ui.json + moves-text.json) and
preview/05-composed-from-sprites (a card page built ONLY from the exported PNGs + the manifest, to prove the layout numbers).
Every sprite is a PNG at 1x (name.png) and @2x (name@2x.png); sizes in the manifest are 1x points.
Every frame/piece carries the Board's 6 pt shadow margin (shadowMargin); positions in LAYOUT are card points measured from the
top-left of the VISIBLE card (add shadowMargin to get the pixel in the file).
NO move text is baked into any sprite: names, belts, steps and results are drawn by the game from moves-text.json
(which is copied mechanically from docs/self-defense.md, no rewording). Needs Pillow + numpy; needs the #412 kit (board_ui_kit.py)."""
import os, sys, json
from PIL import Image, ImageDraw
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_catalog as bc
import board_ui_kit as ku
import mat
import moves_text as mt
from board_ui_kit import K, M, Screen, font, sized, INK, INK_SOFT, CREAM
from mat import S

ROOT = bc.ROOT
SP = os.path.join(ROOT, 'sprites')
PV = bc.PV
FAMS = ['counter', 'escape', 'guard', 'disarm', 'throw', 'strike', 'kata']
RIMS = bc.RIM
MAN = {}


def hexc(c):
    return '#%02x%02x%02x' % tuple(c[:3])


def save2(im2, path_noext):
    os.makedirs(os.path.dirname(path_noext), exist_ok=True)
    im2.save(path_noext + '@2x.png', optimize=True)
    im2.resize((im2.width // 2, im2.height // 2), Image.LANCZOS).save(path_noext + '.png', optimize=True)


def emit(group, name, im2, note, nine=None, state=None, visible=None, extra=None):
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


def canvas(w, h):
    return Screen(w + 2 * M, h + 2 * M, bg=Image.new('RGBA', ((w + 2 * M) * K, (h + 2 * M) * K), (0, 0, 0, 0)))


# ------------------------------------------------------------------ card frames (no text)
def front_frame(fam):
    sc = canvas(bc.CW, bc.CH)
    rim = RIMS[fam]
    L = bc.LAYOUT['front']
    bc.put_piece(sc, bc.frame_piece(bc.CW, bc.CH, rim, bc.BWD, 16), M, M)
    rx, ry, rw, rh = L['ribbonRect']
    bc.put_piece(sc, ku.ribbon(rw, rh, rim), M + rx, M + ry)
    cx, cy = L['stageDisc']['center']
    bc.stage_disc(sc, M + cx, M + cy, L['stageDisc']['radius'], rim)
    return sc.img


def back_frame(fam):
    sc = canvas(bc.CW, bc.CH)
    rim = RIMS[fam]
    L = bc.LAYOUT['back']
    bc.put_piece(sc, bc.frame_piece(bc.CW, bc.CH, rim, bc.BWD, 16, seed=27), M, M)
    rx, ry, rw, rh = L['ribbonRect']
    bc.put_piece(sc, ku.ribbon(rw, rh, rim), M + rx, M + ry)
    return sc.img


def flip_arrow_sprite():
    import math
    W, H = 84, 56
    sc = canvas(W, H)
    d = ImageDraw.Draw(sc.img, 'RGBA')
    cx, cy, r = M + 42, M + 40, 34
    for off, col in ((2, (50, 24, 8, 150)), (0, (255, 236, 190, 255))):
        bb = [(cx - r) * K, (cy - r * .8 + off) * K, (cx + r) * K, (cy + r * .8 + off) * K]
        d.arc(bb, 200, 335, fill=col, width=int(4 * K))
        ax, ay = cx + r * math.cos(math.radians(335)), cy + off + r * .8 * math.sin(math.radians(335))
        d.polygon([((ax - 9) * K, (ay - 5) * K), ((ax + 8) * K, (ay - 7) * K), ((ax + 3) * K, (ay + 9) * K)], fill=col)
    return sc.img


def family_art(fam):
    """128 pt picture for a family. Escape and Throw are not drawn yet: blank rim + cream face (the game draws a number or leaves it)."""
    if fam in bc.DRAWN:
        im = bc.si.ALL[fam]()
    else:
        im = bc.si.medallion(RIMS[fam]).result()
    return im.resize((256, 256), Image.LANCZOS)


def build():
    BWc, BHc = bc.CW, bc.CH
    vis = lambda w, h: [M, M, w, h]
    # ---- big card: front and back frames, one per family
    for fam in FAMS:
        emit('card', f'front-{fam}', front_frame(fam),
             f'{fam.capitalize()} card FRONT: family-colour frame, cream paper, blank ribbon, pale stage disc for the picture. 250 x 396 pt. '
             'No text, no picture: draw the family art, names, kid line and the In-the-dojo panel on top (see layout.front).',
             None, None, vis(BWc, BHc), {'family': fam, 'rim': hexc(RIMS[fam])})
        emit('card', f'back-{fam}', back_frame(fam),
             f'{fam.capitalize()} card BACK ("How it goes"): same frame, blank ribbon. 250 x 396 pt. Draw the small family art, names, attack, numbered steps and the What-happens panel on top (see layout.back).',
             None, None, vis(BWc, BHc), {'family': fam, 'rim': hexc(RIMS[fam])})
    # ---- panels and chips
    ins = bc.sized('panel-inset', 1, 1)  # warm the menu2 sprite
    emit('card', 'inset-placeholder-front', bc.placeholder_inset(222, 92), 'PLACEHOLDER panel for the front In-the-dojo box when a move has no words yet: paper inset with a dashed tan outline. 222 x 92 pt. No margin. Draw the label and your placeholder wording on it.', None, 'placeholder', None, {'size': [222, 92]})
    emit('card', 'inset-placeholder-steps', bc.placeholder_inset(222, 126), 'PLACEHOLDER panel for the back steps area when a move has no steps yet. 222 x 126 pt. No margin.', None, 'placeholder', None, {'size': [222, 126]})
    emit('card', 'flip-chip', bc.flip_chip(104, 22), 'Gold chip with a play arrow at the right end, for "Flip for steps" (text drawn by the game, centred in the left 84 pt). 104 x 22 pt.', None, None, vis(104, 22))
    emit('card', 'step-badge', ku.new_dot(10), 'Round gold badge for a step number (20 x 20 pt). The number is drawn by the game, 12 pt ExtraBold ink.', None, None, vis(20, 20))
    emit('card', 'flip-arrow', flip_arrow_sprite(), 'Curved "tap to flip" arrow between the front and back in the detail view (84 x 56 pt). Cream with a soft shadow, on the dark scrim. The words "Tap to flip" are drawn by the game under it.', None, None, vis(84, 56))
    # ---- grid cards (87 x 94 pt): one frame per family, plus locked and the NEW ribbon
    MW, MH = 87, 94
    for fam in FAMS:
        sc = canvas(MW, MH)
        bc.put_piece(sc, bc.frame_piece(MW, MH, RIMS[fam], 3.2, 9, seed=21), M, M)
        emit('mini', f'collected-{fam}', sc.img,
             f'{fam.capitalize()} catalog card, collected (also the base for NEW). 87 x 94 pt, no text, no picture: family art at 52 pt centred 34 pt below the top, dojo name and game name below (see layout.mini).',
             None, 'collected', vis(MW, MH), {'family': fam, 'rim': hexc(RIMS[fam])})
    sc = canvas(MW, MH)
    bc.put_piece(sc, bc.locked_piece(MW, MH, 9, 43), M, M)
    sc.put(ku.medallion(20, 'locked', seed=41), M + MW / 2 - 20 - M, M + 9 - M)
    emit('mini', 'locked', sc.img, 'Locked catalog card: dark wood, pressed in, with the wood padlock seal baked in at the top (40 pt). Same for every family: a locked card shows no move name and no family. 87 x 94 pt. Draw the dojo name and then the belt where the move is learned (text rules in layout.mini).',
         None, 'locked', vis(MW, MH))
    emit('mini', 'new-ribbon', ku.ribbon(36, 15, (244, 190, 66)), 'Gold NEW ribbon, blank (36 x 15 pt). Place at the card top-left, 5 pt left of the card edge and 7 pt down. The game draws NEW (9.5 pt ExtraBold ink) at x+17, y+7.5 of the ribbon.', None, 'new', vis(36, 15))
    # ---- family pictures
    for fam in FAMS:
        nm = fam if fam in bc.DRAWN else fam + '-placeholder'
        emit('family-art', nm, family_art(fam), ('PB-07 (#419 v3) family picture' if fam in bc.DRAWN else 'PLACEHOLDER family picture: the rim and the cream face only, until the art is drawn') +
             f' for {fam}. 128 x 128 pt, no shadow margin. Large card 124 pt, back 56 pt, grid card 52 pt, rim key 22 pt.',
             None, None, None, {'family': fam, 'rim': hexc(RIMS[fam]), 'placeholder': fam not in bc.DRAWN, 'size': [128, 128]})


def moves_text():
    out = {}
    for n in range(1, 41):
        m = bc.MOVES[n]
        dj = bc.dojo_of(n)
        fam = bc.RANK[n][0] if n in bc.RANK else None
        out[str(n)] = dict(
            dojoName=f'Self-Defense #{n}', gridName=f'Defense #{n}', belt=bc.BELT_OF[n] + ' Belt',
            family=fam, gameName=bc.RANK[n][1] if n in bc.RANK else None, kidLine=bc.RANK[n][2] if n in bc.RANK else None,
            written=m['stated'], shortLine=dj['short'], attack=dj['attack'], steps=dj['steps'], stepsNeedReview=dj['review'],
            result=dj['result'])
    combos = {}
    for ln in open(os.path.join(mt.REPO, 'docs', 'curriculum.md'), encoding='utf-8'):
        import re
        m = re.match(r'\|\s*([1-7])\s*\|\s*([A-Za-z/]+)\s*\|\s*Kick combo \d: (.*?)\s*\|\s*$', ln)
        if m:
            n = int(m.group(1))
            line = m.group(3)
            line = re.sub(r'\s*\((?:spin kick)\)', '', line) if n == 1 else line
            steps, review = (([mt.sentence(p) for p in line.rstrip('.').split(', ')], False) if n == 1 else ([mt.sentence(line)], True))
            st = [t for t in bc.TEXTS['strikes'] if t['combo'] == n]
            combos[str(n)] = dict(dojoName=f'Kick Combo {n}', gridName=f'Kick Combo {n}', belt=m.group(2) + ' Belt', family='strike',
                                  gameName=st[0]['name'] if st else None, kidLine=st[0]['text'] if st else None, written=True,
                                  shortLine=line if n == 1 else None, steps=steps, stepsNeedReview=review)
    return {'about': 'Jay\'s words, copied mechanically from docs/self-defense.md (Self-Defense 1-40) and docs/curriculum.md (Kick Combos 1-7). '
                     'NO rewording. Allowed edits: the (Jay, date) notes are dropped, the first letter of a step is capitalised and a full stop is added. '
                     'Steps are split only at Jay\'s commas. A sentence that points at another move ("Same as #1", "As #21", "Like #3") or starts "Self defense NN:" '
                     'stays ONE step with stepsNeedReview=true, because splitting it would be a guess. written=false: Jay has not described it (#36-40): draw the PLACEHOLDER panel. '
                     'The game should read the real words from its own data; this file is the reference for the card sprites. kidLine/gameName/family exist for #1-15 only (PB-06). '
                     'Regenerate: python3 incoming-art/menu-catalog/source/export_catalog.py',
            'selfDefense': out, 'kickCombos': combos}


# ------------------------------------------------------------------ the manifest
def manifest():
    L = bc.LAYOUT
    fam = {}
    for f in FAMS:
        fam[f] = dict(rim=hexc(RIMS[f]), name=bc.RIM_NAME[f], art=f'family-art/{f if f in bc.DRAWN else f + "-placeholder"}.png',
                      placeholderArt=f not in bc.DRAWN, front=f'card/front-{f}.png', back=f'card/back-{f}.png', mini=f'mini/collected-{f}.png')
    return {
        'about': 'Move Catalog sprites for the Programmer. Text-free card frames, grid cards, states and family pictures. The game draws every word (see layout and moves-text.json). '
                 'Sizes are 1x points; the @2x file is the same picture at twice the pixels. visibleRect and shadowMargin: each frame carries a 6 pt shadow margin, so the visible card starts 6 pt in. '
                 'nineSlice is [top, right, bottom, left] in 1x px, as in menu2.json.',
        'shadowMargin': M,
        'rule': 'No text is baked into any file. No red. Orange is not used. The card rim colour is the family colour.',
        'menu2Refs': {'panel-inset': 'menu2 sprite: the cream inset box on the front (222 x 92) and the back (222 x 84). 9-slice from menu2.json.',
                      'panel-frame': 'menu2 sprite: the Board paper panel the catalog grid sits in (536 x 340 on the 844 x 390 Board).',
                      'tabs and chips': 'ui-benchmark/sprites/kit/tab-active and tab-normal (PR #412) for the Self-Defense / Kick Combos / Forms sub-tabs; ring-00..24 for the progress ring (8 of 40 = ring-05).'},
        'families': fam,
        'states': {
            'collected': 'mini/collected-{family}.png + family art + dojo name + game name',
            'new': 'collected + mini/new-ribbon.png at the top-left (the NEW word is drawn by the game)',
            'locked': 'mini/locked.png (family-neutral) + dojo name + the belt where the move is learned. No game name, no picture.',
            'placeholder': 'big card only: card/inset-placeholder-front.png (front) or card/inset-placeholder-steps.png (back) instead of the cream inset'},
        'layout': {
            'units': 'points; origin is the top-left corner of the VISIBLE card (the file starts shadowMargin pt earlier)',
            'front': L['front'], 'back': L['back'], 'card': L['card'],
            'mini': {
                'size': [87, 94], 'art': dict(center=[43.5, 34], size=52),
                'dojoName': dict(at=[43.5, 63], anchor='mm', size=11.5, weight='ExtraBold', maxWidth=75, fit='shrink the size until it fits maxWidth, never below 7 pt', color='#462a16 (locked: #f0deba)'),
                'secondLine': dict(at=[43.5, 79], anchor='mm', size=10.5, weight='Bold', maxWidth=75, collected='game name, colour = family rim darkened 42%', locked='belt where learned, e.g. "Yellow Belt", colour #ceac7c'),
                'newRibbon': dict(offset=[-5, 7], text=dict(at=[12, 14.5], size=9.5, weight='ExtraBold', color='#462a16')),
                'lockedSeal': 'baked into mini/locked.png (40 pt, 9 pt below the top)'},
            'grid': {
                'columns': 5, 'cardSize': [87, 94], 'gap': 9,
                'beltHeader': dict(size=11, weight='ExtraBold', color='#6e4a2e', rule='1.6 pt tan line #c49c6a from the end of the text to the right edge of the row', text='"{BELT} BELT  \u00b7  #a\u2013b"'),
                'grouping': 'by belt, five moves per belt (#1-5 White, #6-10 Yellow, #11-15 Orange, #16-20 Green, #21-25 Blue, #26-30 Red, #31-35 Red/Black, #36-40 Brown)',
                'headerRow': 'ring + "Move Catalog" 20 pt + "{n} of 40 moves collected" 13 pt; sub-tabs on the right'},
            'detail': {'frontBack': 'front card left, back card right, 96 pt apart (214 pt wide cards at scale 0.856); flip-arrow centred between them at y = 168; previous/next wood buttons 52 pt; close = menu2 sheet-close',
                       'scrim': 'rgba(28,14,6,0.80) over the catalog'}},
        'text': {
            'bigName': 'dojo name: "Self-Defense #n" (grid: "Defense #n")', 'gameName': 'game name under it (PB-06), only on cards that are not locked',
            'frontLine': 'short "In the dojo:" line = the attack in Jay\'s table (Kick Combos: the list of kicks), then the "Flip for steps" chip',
            'back': 'attack under IT STARTS WITH, numbered steps (moves-text.json, split at Jay\'s commas, no rewording), Jay\'s result under What happens:',
            'lockedBelt': 'ui.sealLocked in seal-families-text.json = "{belt}" where belt is the full name, e.g. "Orange Belt"',
            'placeholder': 'Moves with no words: draw "[PLACEHOLDER]" in dev builds; the player-facing wording is a DECIDE item',
            'file': 'moves-text.json'},
        'sprites': MAN}


# ------------------------------------------------------------------ preview 05: composed ONLY from the exported files + LAYOUT
def sp(name):
    return Image.open(os.path.join(SP, name + '@2x.png')).convert('RGBA')


def put_sp(sc, im, x, y, s=1.0):
    if s != 1.0:
        im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    sc.img.alpha_composite(im, (int(round(x * K)), int(round(y * K))))


def art(sc, name, cx, cy, d):
    im = sp('family-art/' + name).resize((int(d * K), int(d * K)), Image.LANCZOS)
    put_sp(sc, im, cx - d / 2, cy - d / 2)


def dk(c, t):
    return bc.darken(c, t)


def txt(sc, x, y, s, spec, text, col=INK, w=None):
    sc.text(x + spec['at'][0] * s, y + spec['at'][1] * s, text, spec['size'] * s, col, spec['anchor'], w or spec['weight'])


def compose_front(sc, x, y, s, fam, d):
    L = bc.LAYOUT['front']; rim = RIMS[fam]
    put_sp(sc, sp(f'card/front-{fam}'), x - M * s, y - M * s, s)
    art(sc, d['art'], x + L['medallion']['center'][0] * s, y + L['medallion']['center'][1] * s, L['medallion']['size'] * s)
    txt(sc, x, y, s, L['ribbonText'], d['ribbon'], bc.ink_on(rim))
    txt(sc, x, y, s, L['beltText'], d['belt'], INK_SOFT)
    txt(sc, x, y, s, L['bigName'], d['big'], INK)
    txt(sc, x, y, s, L['gameName'], d['game'], dk(rim, .42))
    e = L['effect']
    for i, ln in enumerate(bc.wrap(d['effect'], e['size'] * s, 'SemiBold', e['maxWidth'] * s)[:e['maxLines']]):
        sc.text(x + e['at'][0] * s, y + (e['at'][1] + i * e['lineHeight']) * s, ln, e['size'] * s, INK_SOFT, 'mm', 'SemiBold')
    ir = L['inset']['rect']
    if d['short']:
        put_sp(sc, bc.sized('panel-inset', int(ir[2] * s), int(ir[3] * s)), x + ir[0] * s, y + ir[1] * s)
    else:
        put_sp(sc, sp('card/inset-placeholder-front'), x + ir[0] * s, y + ir[1] * s, s)
    txt(sc, x, y, s, L['insetLabel'], 'In the dojo:', dk(rim, .45))
    if d['short']:
        t = L['shortLine']
        for i, ln in enumerate(bc.wrap(d['short'], t['size'] * s, 'Bold', t['maxWidth'] * s)[:t['maxLines']]):
            sc.text(x + t['at'][0] * s, y + (t['at'][1] + i * t['lineHeight']) * s, ln, t['size'] * s, INK, 'lm', 'Bold')
        fr = L['flipChip']['rect']
        put_sp(sc, sp('card/flip-chip'), x + (fr[0] - M) * s, y + (fr[1] - M) * s, s)
        txt(sc, x, y + 1 * s, s, L['flipChip']['text'], 'Flip for steps', INK)
    else:
        cx = x + (ir[0] + ir[2] / 2) * s
        sc.text(cx, y + (ir[1] + 52) * s, '[PLACEHOLDER]', 11 * s, INK_SOFT, 'mm', 'ExtraBold')
        sc.text(cx, y + (ir[1] + 70) * s, bc.PLACEHOLDER_TXT, 14 * s, INK_SOFT, 'mm', 'Bold')


def compose_back(sc, x, y, s, fam, d):
    L = bc.LAYOUT['back']; rim = RIMS[fam]
    put_sp(sc, sp(f'card/back-{fam}'), x - M * s, y - M * s, s)
    txt(sc, x, y, s, L['ribbonText'], 'HOW IT GOES', bc.ink_on(rim))
    art(sc, d['art'], x + L['medallion']['center'][0] * s, y + L['medallion']['center'][1] * s, L['medallion']['size'] * s)
    txt(sc, x, y, s, L['bigName'], d['big'], INK)
    txt(sc, x, y, s, L['gameName'], d['game'], dk(rim, .42))
    txt(sc, x, y, s, L['startsLabel'], 'IT STARTS WITH', INK_SOFT)
    txt(sc, x, y, s, L['attack'], d['attack'][:1].upper() + d['attack'][1:], INK)
    sa = L['stepsArea']; rx, ry, rw, rh = sa['rect']
    sz, rows, fits = bc.fit_steps(d['steps'], sa['text']['maxWidth'] * s, rh * s, sa['text']['sizeMax'] * s, sa['text']['sizeMin'] * s)
    yy, used = y + ry * s, 0
    for i, (lines, hh) in enumerate(rows):
        if used + hh > rh * s:
            bc.tri_down(sc, x + 125 * s, yy - 3 * s, 5 * s, INK_SOFT)
            break
        used += hh
        put_sp(sc, sp('card/step-badge'), x + (22 - M) * s, yy + (1 - M) * s, s)
        sc.text(x + sa['badge']['center_x'] * s, yy + 11 * s, str(i + 1), 12 * s, INK, 'mm', 'ExtraBold')
        for j, ln in enumerate(lines):
            sc.text(x + sa['text']['x'] * s, yy + 11 * s + j * sz * 1.16, ln, sz, INK, 'lm', 'Bold')
        yy += hh
    ir = L['inset']['rect']
    put_sp(sc, bc.sized('panel-inset', int(ir[2] * s), int(ir[3] * s)), x + ir[0] * s, y + ir[1] * s)
    txt(sc, x, y, s, L['insetLabel'], 'What happens:', dk(rim, .45))
    t = L['resultLines']
    for i, ln in enumerate(bc.wrap(d['result'], t['size'] * s, 'Bold', t['maxWidth'] * s)[:t['maxLines']]):
        sc.text(x + t['at'][0] * s, y + (t['at'][1] + i * t['lineHeight']) * s, ln, t['size'] * s, INK, 'lm', 'Bold')


def fit_sz(text, sz, w, maxw, minsz=7):
    while sz > minsz and font(sz, w).getlength(text) > maxw * K:
        sz -= .5
    return sz


def compose_mini(sc, x, y, state, fam, name, art_name, second):
    rim = RIMS[fam]
    if state == 'locked':
        put_sp(sc, sp('mini/locked'), x - M, y - M)
        sc.text(x + 43.5, y + 63, name, 11.5, (240, 222, 186), 'mm', 'ExtraBold')
        sc.text(x + 43.5, y + 79, second, fit_sz(second, 10.5, 'Bold', 75), (206, 172, 124), 'mm', 'Bold')
        return
    put_sp(sc, sp(f'mini/collected-{fam}'), x - M, y - M)
    art(sc, art_name, x + 43.5, y + 34, 52)
    sc.text(x + 43.5, y + 63, name, fit_sz(name, 11.5, 'ExtraBold', 75), INK, 'mm', 'ExtraBold')
    sc.text(x + 43.5, y + 79, second, fit_sz(second, 10.5, 'Bold', 75), dk(rim, .42), 'mm', 'Bold')
    if state == 'new':
        put_sp(sc, sp('mini/new-ribbon'), x - 5 - M, y + 7 - M)
        sc.text(x - 5 + 17, y + 7 + 7.5, 'NEW', 9.5, INK, 'mm', 'ExtraBold')


def card_d(n, fam_override=None):
    f, g, e = bc.RANK[n]
    dj = bc.dojo_of(n)
    return dict(fam=f, art=f if f in bc.DRAWN else f + '-placeholder', ribbon=bc.RIM_NAME[f], belt=bc.BELT_OF[n] + ' Belt', big='Self-Defense #%d' % n,
                game=g, effect=e, short=dj['short'], attack=dj['attack'], steps=dj['steps'], result=dj['result'])


def preview_composed():
    sc = Screen(844, 390)
    sc.text(22, 20, 'Built only from the exported sprites + the manifest layout: the game draws every word', 15, CREAM, 'lm', 'ExtraBold', bc.SHADOW_TXT)
    s = .78
    d = card_d(3); f = d['fam']
    compose_front(sc, 22, 40, s, f, d)
    compose_back(sc, 22 + 250 * s + 14, 40, s, f, card_d(6))
    ph = dict(card_d(3), ribbon='KATA', big='Basic Form 1', game='Rooted Form', effect='Your first form.', short=None, belt='White Belt', art='kata')
    compose_front(sc, 22 + 2 * (250 * s + 14), 40, s, 'kata', ph)
    x = 22 + 3 * (250 * s + 14) + 4
    d6, d9, d10 = card_d(6), card_d(9), card_d(10)
    compose_mini(sc, x, 44, 'collected', d6['fam'], 'Defense #6', d6['art'], d6['game'])
    compose_mini(sc, x, 150, 'new', d9['fam'], 'Defense #9', d9['art'], d9['game'])
    compose_mini(sc, x, 256, 'locked', d10['fam'], 'Defense #10', d10['art'], d10['belt'])
    for i, c in enumerate(('Card front', 'Card back (#6)', 'Placeholder front')):
        sc.text(22 + i * (250 * s + 14) + 250 * s / 2, 372, c, 12, CREAM, 'mm', 'ExtraBold', bc.SHADOW_TXT)
    sc.text(x + 43.5, 372, 'Grid states', 12, CREAM, 'mm', 'ExtraBold', bc.SHADOW_TXT)
    sc.save(os.path.join(PV, '05-composed-from-sprites-844x390'))


def contact_sheet():
    names = [k for k in MAN]
    cell, cols = 150, 8
    rows = (len(names) + cols - 1) // cols
    sheet = Image.new('RGBA', (cols * cell, rows * (cell + 20) + 10), (150, 112, 70, 255))
    d = ImageDraw.Draw(sheet)
    for i, k in enumerate(names):
        im = Image.open(os.path.join(SP, MAN[k]['file']))
        sc_ = min((cell - 16) / im.width, (cell - 16) / im.height, 1.0)
        im = im.resize((max(1, int(im.width * sc_)), max(1, int(im.height * sc_))), Image.LANCZOS)
        cx, cy = (i % cols) * cell, (i // cols) * (cell + 20)
        sheet.alpha_composite(im, (cx + (cell - im.width) // 2, cy + 8 + (cell - 16 - im.height) // 2))
        d.text((cx + cell // 2, cy + cell + 4), k.split('/')[-1][:22], font=ImageFont.load_default(), fill=(255, 240, 210, 255), anchor='mm')
    sheet.save(os.path.join(PV, '06-export-contact-sheet.png'))
    sheet.resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS).save(os.path.join(PV, '06-export-contact-sheet-1x.png'))


from PIL import ImageFont

if __name__ == '__main__':
    build()
    mt_ = moves_text()
    json.dump(mt_, open(os.path.join(SP, 'moves-text.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    json.dump(manifest(), open(os.path.join(SP, 'catalog-ui.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    preview_composed()
    contact_sheet()
    print('exported', len(MAN), 'sprites')
