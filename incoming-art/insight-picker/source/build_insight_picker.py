"""G2 Insight picker re-skin (R-BENCH-G2): samples. Every image is drawn by script:
  python3 incoming-art/insight-picker/source/build_insight_picker.py
Needs Pillow + numpy. Reads the Board kit helpers in incoming-art/tools/board_ui_kit.py (not changed),
the real card words from content/insights/insights.json and the Insight icons in incoming-art/icons/sprites/.
Words are the game's own. The only placeholder is the label over the held row (see DELIVERY_NOTE, DECIDE)."""
import os, sys, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                      # incoming-art/insight-picker
ART = os.path.dirname(ROOT)                       # incoming-art
REPO = os.path.dirname(ART)
sys.path.insert(0, os.path.join(ART, 'tools'))
import board_ui_kit as ku
from board_ui_kit import K, M, Screen, sized, INK, INK_SOFT, CREAM
import mat

PV = os.path.join(ROOT, 'preview')
os.makedirs(PV, exist_ok=True)
SHADOW_TXT = (60, 32, 14)
BODY = (88, 58, 34)                                # body text on paper (darker than INK_SOFT, 8:1)

INS = {i['id']: i for i in json.load(open(os.path.join(REPO, 'content', 'insights', 'insights.json')))['insights']}
TITLE, SUB = 'Choose an Insight', 'It lasts for this run.'          # InsightPicker.ts, verbatim
HELD_LABEL = 'Your Insights this run'                             # PLACEHOLDER (DECIDE 2)

# Family ribbon colours. Rooted and Flowing are the Board kit's. Virtue is the kit gold.
# Power was orange in the game; orange is only for ENTER THE TOWER, so this is a new orchid (DECIDE 1).
FAM = {'rooted': (86, 150, 232), 'flowing': (64, 184, 138), 'power': (210, 140, 200), 'virtue': (238, 182, 58)}
FAM_TXT = {k: INK for k in FAM}                   # dark ink on all four: 4.3 to 7.1 to 1 on the ribbon colour

_icon = {}
def icon(iid, px):
    k = (iid, px)
    if k not in _icon:
        im = Image.open(os.path.join(ART, 'icons', 'sprites', f'icon-{iid}.png')).convert('RGBA')
        _icon[k] = im.resize((int(px * K), int(px * K)), Image.LANCZOS)
    return _icon[k]

_rib = {}
def ribbon(fam, w, h):
    k = (fam, w, h)
    if k not in _rib:
        _rib[k] = ku.ribbon(w, h, FAM[fam])
    return _rib[k]


def wrap(text, sz, w, wt):
    f = ku.font(sz, wt)
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if f.getlength(t) / K <= w or not cur:
            cur = t
        else:
            lines.append(cur); cur = wd
    lines.append(cur)
    return lines


class Spec:
    """card geometry in points at scale s."""
    def __init__(self, s=1.0, w=232):
        self.s, self.w = s, w * s
        self.rib_h, self.rib_w = 26 * s, 104 * s
        self.top = 44 * s
        self.icon = 60 * s
        self.name_sz, self.body_sz = 20 * s, 16 * s
        self.lh_name, self.lh_body = 24 * s, 21 * s
        self.pad = 14 * s

    def lines(self, ins):
        return (wrap(ins['name'], self.name_sz, self.w - 24 * self.s, 'ExtraBold'),
                wrap(ins['text'], self.body_sz, self.w - 30 * self.s, 'SemiBold'))

    def height(self, inss):
        h = 0
        for i in inss:
            n, b = self.lines(i)
            h = max(h, self.top + self.icon + 6 * self.s + len(n) * self.lh_name + 4 * self.s + len(b) * self.lh_body + self.pad)
        return math.ceil(h)


def draw_card(sc, sp, ins, x, y, h):
    """one paper card with its family ribbon, icon, name and words."""
    s, w = sp.s, sp.w
    sc.put(ku.paper_card(w, h), x - M, y - M)
    names, body = sp.lines(ins)
    cx = x + w / 2
    sc.img.alpha_composite(icon(ins['id'], sp.icon) if abs(s - 1) < .01 else
                           Image.open(os.path.join(ART, 'icons', 'sprites', f"icon-{ins['id']}.png")).convert('RGBA').resize((int(sp.icon * K), int(sp.icon * K)), Image.LANCZOS),
                           (int(round((cx - sp.icon / 2) * K)), int(round((y + sp.top) * K))))
    yy = y + sp.top + sp.icon + 6 * s
    for ln in names:
        sc.text(cx, yy + sp.lh_name / 2, ln, sp.name_sz, INK, 'mm', 'ExtraBold')
        yy += sp.lh_name
    yy += 4 * s
    for ln in body:
        sc.text(cx, yy + sp.lh_body / 2, ln, sp.body_sz, BODY, 'mm', 'SemiBold')
        yy += sp.lh_body
    # ribbon last: it hangs over the card's left edge like a bookmark
    fam = ins['family']
    rx, ry = x - 8 * s, y + 12 * s
    sc.put(ribbon(fam, int(sp.rib_w), int(sp.rib_h)), rx - M, ry - M)
    sc.text(rx + (sp.rib_w - 9 * s) / 2, ry + sp.rib_h / 2, fam.upper(), 13 * s, FAM_TXT[fam], 'mm', 'ExtraBold',
            SHADOW_TXT if FAM_TXT[fam] == CREAM else None)


def layer(w, h):
    return Screen(w, h, bg=Image.new('RGBA', (w * K, h * K), (0, 0, 0, 0)))


def paste_layer(sc, lay, dy=0.0, dim=1.0, alpha=1.0, scale=1.0, cx=None, cy=None):
    im = lay.img
    if dim < 1:
        rgb = ImageEnhance.Brightness(im.convert('RGB')).enhance(dim)
        a = im.getchannel('A')
        im = Image.merge('RGBA', (*rgb.split(), a))
    if scale != 1:
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    if alpha < 1:
        im.putalpha(im.getchannel('A').point(lambda v: int(v * alpha)))
    ox = 0 if cx is None else int(cx * K - im.width / 2)
    oy = int(dy * K) if cy is None else int(cy * K - im.height / 2)
    sc.img.alpha_composite(im, (ox, oy)) if ox >= 0 and oy >= 0 else sc.img.alpha_composite(im, (max(ox, 0), max(oy, 0)))


def backdrop(w, h):
    sc = Screen(w, h)
    # the room is paused behind a warm wash: darker wood, no HUD showing through (the problem in the "today" shot)
    wash = Image.new('RGBA', sc.img.size, (34, 18, 8, 120))
    sc.img.alpha_composite(wash)
    return sc


def title(sc, y=8):
    sc.put(sized('title-plaque', 300, 38), 422 - 150, y)
    sc.text(422, y + 19, TITLE, 22, INK, 'mm', 'ExtraBold')
    sc.text(422, y + 54, SUB, 15, CREAM, 'mm', 'SemiBold', SHADOW_TXT)


def held_row(sc, ids, y, new_id=None):
    W = 728
    x0 = 58
    sc.put(sized('panel-inset', W, 52), x0, y)
    sc.text(x0 + 18, y + 26, HELD_LABEL, 13, INK, 'lm', 'ExtraBold')
    x = x0 + 216
    for iid in ids:
        sc.img.alpha_composite(icon(iid, 34), (int(x * K), int((y + 9) * K)))
        sc.text(x + 40, y + 26, INS[iid]['name'], 14, INK, 'lm', 'ExtraBold')
        wlen = ku.font(14, 'ExtraBold').getlength(INS[iid]['name']) / K
        if iid == new_id:
            sc.put(ku.new_dot(6), x + 40 + wlen + 2 - M, y + 14 - M)
        x += 40 + wlen + 34
    sc.text(422, y + 52 + 14, 'The label on the left is a placeholder.', 12, CREAM, 'mm', 'SemiBold', SHADOW_TXT)


def star_burst(sc, cx, cy, r_out, r_in, n=12, rot=0):
    """gold burst behind the stamp. The stamp is its light source."""
    lay = Image.new('RGBA', sc.img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    pts = []
    for i in range(n * 2):
        a = rot + math.pi * i / n
        r = r_out if i % 2 == 0 else r_in
        pts.append(((cx + r * math.cos(a)) * K, (cy + r * math.sin(a)) * K))
    glow = Image.new('RGBA', sc.img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([(cx - r_out * 1.25) * K, (cy - r_out * 1.25) * K, (cx + r_out * 1.25) * K, (cy + r_out * 1.25) * K], fill=(255, 226, 140, 120))
    glow = glow.filter(ImageFilter.GaussianBlur(10 * K))
    sc.img.alpha_composite(glow)
    d.polygon(pts, fill=(255, 226, 142, 255), outline=(168, 112, 30, 255))
    d.line(pts + [pts[0]], fill=(168, 112, 30, 255), width=int(1.6 * K), joint='curve')
    sc.img.alpha_composite(lay)


def stamp(sc, cx, cy, r=26, rot=-12):
    star_burst(sc, cx, cy, r * 1.9, r * 1.25)
    m = ku.medallion(r, 'lit')
    m = m.rotate(rot, resample=Image.BICUBIC, expand=False)
    sc.img.alpha_composite(m, (int((cx - r - M) * K), int((cy - r - M) * K)))


def picker(offered, held, new_id=None, chosen=None, lift=14, w=844, h=390):
    sc = backdrop(w, h)
    title(sc)
    sp = Spec()
    H = sp.height([INS[i] for i in offered])
    gap = 18
    left = (w - (sp.w * len(offered) + gap * (len(offered) - 1))) / 2
    top = 82
    for i, iid in enumerate(offered):
        x = left + i * (sp.w + gap)
        lay = layer(w, h)
        if chosen == iid:
            # ground shadow under the lifted card, then the card
            sh = ku.shadow_oval(int(sp.w * .86), 16, .85)
            sc.img.alpha_composite(sh, (int((x + sp.w / 2) * K - sh.width / 2), int((top + H + 4) * K - sh.height / 2)))
            draw_card(lay, sp, INS[iid], x, top - lift, H)
            paste_layer(sc, lay)
            stamp(sc, x + sp.w - 22, top - lift + 36)
        elif chosen:
            draw_card(lay, sp, INS[iid], x, top + 6, H)
            paste_layer(sc, lay, dim=.66, alpha=.92)
        else:
            draw_card(lay, sp, INS[iid], x, top, H)
            paste_layer(sc, lay)
    held_row(sc, held, top + H + 12, new_id)
    return sc, H, left, sp


def close_up():
    sc = backdrop(844, 390)
    sp = Spec(1.3)
    iid = 'press-the-advantage'
    H = sp.height([INS[iid]])
    x, y = 36, (390 - H) / 2
    sc.put(ku.paper_card(1, 1), -50, -50) if False else None
    lay = layer(844, 390)
    draw_card(lay, sp, INS[iid], x, y, H)
    paste_layer(sc, lay)
    # right panel: family ribbons and the sizes
    px = 392
    sc.put(sized('panel-frame', 430, 366), px, 12)
    sc.text(px + 28, 52, 'Family ribbons', 18, INK, 'lm', 'ExtraBold')
    for i, fam in enumerate(['rooted', 'flowing', 'power', 'virtue']):
        gx = px + 30 + (i % 2) * 196
        gy = 74 + (i // 2) * 44
        sc.put(ribbon(fam, 112, 28), gx - M, gy - M)
        sc.text(gx + 51, gy + 14, fam.upper(), 13, FAM_TXT[fam], 'mm', 'ExtraBold', SHADOW_TXT if FAM_TXT[fam] == CREAM else None)
    rows = [
        ('Card', f'{int(232)} x {int(Spec().height([INS["iron-skin"], INS["ripple-counter"], INS["wind-step"]]))} pt. All of it is the button (44 pt is the minimum).'),
        ('Words', 'Name 20, text 16, ribbon 13. The game draws every word.'),
        ('Kit', 'Paper card, wood edge and ribbon from the Board kit (#412).'),
        ('Icon', 'The Insight icon is unchanged.'),
    ]
    yy = 178
    for k, v in rows:
        sc.text(px + 28, yy, k, 14, INK, 'lm', 'ExtraBold')
        for j, ln in enumerate(wrap(v, 14, 296, 'SemiBold')):
            sc.text(px + 100, yy + j * 18, ln, 14, BODY, 'lm', 'SemiBold')
        yy += 18 * len(wrap(v, 14, 296, 'SemiBold')) + 14
    return sc


def motion():
    """three frames of a pick, real size: lift, stamp, close."""
    w, h = 844, 390
    sc = backdrop(w, h)
    sp = Spec()
    iid = 'wind-step'
    H = sp.height([INS[iid]])
    gx = 22
    fw = (w - 2 * gx) / 3
    frames = [('1  Lift', 'lift'), ('2  Stamp', 'stamp'), ('3  Close', 'close')]
    for i, (lab, kind) in enumerate(frames):
        x = gx + i * fw + (fw - sp.w) / 2
        top = 64
        sc.text(gx + i * fw + fw / 2, 28, lab, 18, CREAM, 'mm', 'ExtraBold', SHADOW_TXT)
        lay = layer(w, h)
        if kind == 'lift':
            sh = ku.shadow_oval(int(sp.w * .86), 16, .85)
            sc.img.alpha_composite(sh, (int((x + sp.w / 2) * K - sh.width / 2), int((top + H + 8) * K - sh.height / 2)))
            draw_card(lay, sp, INS[iid], x, top - 10, H)
            paste_layer(sc, lay)
        elif kind == 'stamp':
            sh = ku.shadow_oval(int(sp.w * .86), 16, .85)
            sc.img.alpha_composite(sh, (int((x + sp.w / 2) * K - sh.width / 2), int((top + H + 8) * K - sh.height / 2)))
            draw_card(lay, sp, INS[iid], x, top - 10, H)
            paste_layer(sc, lay)
            stamp(sc, x + sp.w - 22, top - 10 + 36)
        else:
            draw_card(lay, sp, INS[iid], x, top - 10, H)
            sc_ = 1.0
            tx, ty = x + sp.w / 2 + 10, top - 10 + H * .5 - 30          # where the card's centre ends up
            ccx, ccy = x + sp.w / 2, top - 10 + H * .5
            paste_layer(sc, lay, alpha=.55, scale=sc_, cx=tx - (ccx - w / 2) * sc_, cy=ty - (ccy - h / 2) * sc_)
    sc.text(w / 2, 372, 'Reduced motion: no slide, no lift, just a highlight on the card you tapped.', 13, CREAM, 'mm', 'SemiBold', SHADOW_TXT)
    return sc


if __name__ == '__main__':
    offered = ['ripple-counter', 'iron-skin', 'wind-step']
    held = ['quick-hands', 'heavy-hands']
    sc, H, left, sp = picker(offered, held)
    sc.save(os.path.join(PV, '01-picker-844x390'))
    close_up().save(os.path.join(PV, '02-card-close-up'))
    sc, *_ = picker(offered, held + ['wind-step'], new_id='wind-step', chosen='wind-step')
    sc.save(os.path.join(PV, '03-picked-stamp-844x390'))
    motion().save(os.path.join(PV, '04-pick-three-frames'))
    print('card height', H, 'left', left)
