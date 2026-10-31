"""Build the final Town Growth overlays (day + dusk) from the Blender passes, and the cumulative stage previews.

Usage:  python3 make_growth.py --passes <dir with <id>-<day|dusk>-{color,lit}.png from build_town_growth.py>
                               --base-town base_town@2x.png --base-lights base_lights@2x.png   (the town base without the old dojo, see render_all.sh)
Writes  ../overlays/<n>-<id>-<day|dusk>[@2x].png  (transparent, same frame as the approved town base, 1864x860 @2x / 932x430)
        ../previews/stage-<n>-<id>-<day|dusk>.png  (cumulative stages composited on the town base) and growth-sheet-<day|dusk>.png
Dusk uses the PR #301 recipe (make_concept.py): multiply (120,112,165), blend 10% (60,45,70), lit pixels warm (255,226,170),
glow = blurred lit mask, pools = soft ellipses on the ground right under a source."""
import argparse, json, math, os, random
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument("--passes", required=True); ap.add_argument("--base-town", required=True); ap.add_argument("--base-lights", required=True)
ap.add_argument("--only", default=None)
A = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.dirname(HERE)
AZ = os.path.join(OUT, "..", "..", "action-zone-dojo"); CONCEPT = os.path.join(OUT, "..", "..", "town-square-concept", "source")
W, H, PPT = 1864, 860, 80.0
SHIFT = int(0.95 * PPT)

BELTS = [  # id, belt, changeId, short title, what grows
    ("white", "White", "wc-lantern-halls-lamps", "Lantern Halls", "bigger glass lamps, a new bridge lamp"),
    ("yellow", "Yellow", "wc-sunrise-garden-blooms", "Sunrise Garden", "flower beds, lawn tufts, a flowering vine"),
    ("orange", "Orange", "wc-ember-kitchens-chimney", "Ember Kitchens", "shop chimney, bread, brick oven, long table"),
    ("green", "Green", "wc-giants-steps-path", "Giant's Steps", "stepping-stone path, stone giant bench"),
    ("blue", "Blue", "wc-quiet-river-clear", "Quiet River", "clear water, koi, lilies, sitting dock"),
    ("red", "Red", "wc-forge-courage-banners", "Forge of Courage", "gold flame banners, dummy, brazier"),
    ("redblack", "Red-Black", "wc-hall-echoes-bell", "Hall of Echoes", "wind chime and welcome bell"),
    ("brown", "Brown", "wc-root-library-tree", "Root Library", "reading tree, root bench, book-swap box"),
    ("brownblack", "Brown-Black", "wc-storm-stair-tower-glow", "Storm Stair", "Tower glow, rainbow, puddles, window lantern"),
]
MSG = {
    "white": "You brought light home! The town lamps are glowing.", "yellow": "The garden woke up! Flowers are blooming everywhere.",
    "orange": "Supper smells so good! The town has a table for everyone.", "green": "Step by step! A new path is ready to explore.",
    "blue": "The river is calm and clear. Come sit a while!", "red": "Be brave! The practice yard is ready for you.",
    "redblack": "Listen! The town sings hello to you.", "brown": "A reading tree grew! Its roots go deep, like yours.",
    "brownblack": "The storm is quiet. The Tower glows bright for you!"}

# ---------------------------------------------------------------- shared inputs
def L(path): return Image.open(path)
town_a = Image.new("L", (W, H)); town_a.paste(L(A.base_town).convert("RGBA").split()[3], (0, SHIFT))
lights = Image.new("L", (W, H)); lights.paste(L(A.base_lights).convert("L"), (0, SHIFT))
info = json.load(open(os.path.join(AZ, "sprites", "static.json")))["sprites"]["town-slot-dojo"]
ax, ay = info["anchorPx"]; tx, ty = info["anchorTownTile"]
sprite = {v: Image.open(os.path.join(AZ, "sprites", info["files"][v])).convert("RGBA") for v in ("day", "dusk")}
dojo_a = Image.new("L", (W, H)); dojo_a.paste(sprite["day"].split()[3], (round(tx * PPT - ax), round(ty * PPT + SHIFT - ay)))
OCC = ImageChops.lighter(town_a, dojo_a)                     # everything the town base draws in front of the sky / far hills
far = Image.open(os.path.join(CONCEPT, "render_far@2x.png")).convert("RGBA")
far = far.resize((int(far.width * 0.92), int(far.height * 0.92)), Image.LANCZOS)
fdx = int(14.2 * PPT - far.width / 2); col = far.crop((far.width // 2 - 2, 0, far.width // 2 + 2, far.height)).getbbox(); fdy = int(0.3 * PPT) - col[1]
far_a = Image.new("L", (W, H)); far_a.paste(far.split()[3], (fdx, fdy))
# the Tower itself (so the rainbow passes behind it): its column of the far layer, x 1090..1190
tower_a = far_a.copy(); tm = Image.new("L", (W, H), 0); ImageDraw.Draw(tm).rectangle((1085, 0, 1195, 330), fill=255); tower_a = ImageChops.multiply(tower_a, tm)

FRONT = {  # parts of an overlay that stand IN FRONT of the dojo sprite (everything else is held out by the dojo's silhouette)
    "yellow": [(40, 290, 150, 460)], "redblack": [(160, 330, 380, 440)], "brownblack": [(165, 330, 215, 385)],
    "green": [(0, 0, 0, 0)], "red": [(0, 0, 0, 0)]}
POOLS = {  # (tile col, ground row, half-width in tiles): a soft warm pool right under a real source (dusk only)
    "white": [(5.0, 9.05, 0.95), (19.0, 9.05, 0.95), (15.6, 7.7, 0.5)],
    "orange": [(12.2, 4.25, 0.65), (13.55, 4.3, 0.8)], "blue": [(15.59, 5.6, 0.5)], "red": [(5.3, 7.8, 0.85)], "brown": [(22.85, 4.3, 0.55)]}
FIREFLIES = {  # dusk only: (px, py) of a firefly that really flies there
    "yellow": [(78, 340), (118, 372), (88, 404), (126, 330), (104, 436), (738, 500), (792, 484), (770, 520), (1090, 500), (1136, 486), (1112, 522), (46, 436), (560, 440)]}

def grade(rgb):
    out = ImageChops.multiply(rgb, Image.new("RGB", rgb.size, (120, 112, 165)))
    return Image.blend(out, Image.new("RGB", rgb.size, (60, 45, 70)), 0.1)

def solid(c, a_mask): return Image.merge("RGBA", (*Image.new("RGB", a_mask.size, c).split(), a_mask))

def build(id_, v):
    dusk = v == "dusk"
    c = L(os.path.join(A.passes, f"{id_}-{v}-color.png")).convert("RGBA")
    lt = L(os.path.join(A.passes, f"{id_}-{v}-lit.png")).convert("RGBA")
    m = ImageChops.multiply(lt.convert("L"), lt.split()[3])          # lit mask: the emissive objects of this belt
    r, g, b, a = c.split()
    hold = ImageChops.invert(dojo_a)
    for (x0, y0, x1, y1) in FRONT.get(id_, []):
        d = ImageDraw.Draw(hold); d.rectangle((x0, y0, x1, y1), fill=255)
    a = ImageChops.multiply(a, hold)
    rgb = Image.merge("RGB", (r, g, b))
    layers = []
    if dusk:
        warm = ImageChops.multiply(rgb, Image.new("RGB", rgb.size, (255, 226, 170)))
        rgb = grade(rgb); rgb.paste(warm, (0, 0), m)
        if id_ in POOLS:
            pool = Image.new("L", (W, H)); pd = ImageDraw.Draw(pool)
            for cc, rr, sx in POOLS[id_]:
                x, y = cc * PPT, rr * PPT + SHIFT; pd.ellipse((x - sx * PPT, y - 0.42 * PPT, x + sx * PPT, y + 0.42 * PPT), fill=255)
            pool = pool.filter(ImageFilter.GaussianBlur(int(0.3 * PPT)))
            layers.append(solid((255, 186, 104), pool.point(lambda q: int(q * 0.8))))
        glow = m.filter(ImageFilter.GaussianBlur(int(0.35 * PPT))).point(lambda q: min(255, q * 3))
        layers.append(solid((255, 196, 110), glow.point(lambda q: int(q * 0.6 * 0.55))))
        if id_ in FIREFLIES:
            ff = Image.new("L", (W, H)); fd = ImageDraw.Draw(ff); core = Image.new("L", (W, H)); cd = ImageDraw.Draw(core)
            for (x, y) in FIREFLIES[id_]:
                rad = 0.05 * PPT; fd.ellipse((x - 3.5 * rad, y - 3.5 * rad, x + 3.5 * rad, y + 3.5 * rad), fill=120); cd.ellipse((x - rad, y - rad, x + rad, y + rad), fill=255)
            layers.append(solid((236, 255, 160), ff.filter(ImageFilter.GaussianBlur(int(0.1 * PPT))).point(lambda q: int(q * 0.7))))
            layers.append(solid((250, 255, 215), core.filter(ImageFilter.GaussianBlur(1))))
    obj = Image.merge("RGBA", (*rgb.split(), a))
    if id_ == "brownblack":
        layers = two_d_brownblack(v, layers)
    out = Image.new("RGBA", (W, H))
    for l in layers[:0]: pass
    # draw order: 2D scene layers first (they sit behind town objects), then light, then this belt's objects
    for l in layers: out.alpha_composite(l)
    out.alpha_composite(obj)
    return out

def two_d_brownblack(v, layers):
    dusk = v == "dusk"
    cx, cy = 1137, 50                                              # the Tower's lamp
    sky_ok = ImageChops.invert(OCC)                                # never over anything the town draws
    def put(layer_rgba, behind_tower=True, over_town=False):
        al = layer_rgba.split()[3]
        if not over_town: al = ImageChops.multiply(al, sky_ok)
        if behind_tower: al = ImageChops.multiply(al, ImageChops.invert(tower_a))
        return Image.merge("RGBA", (*layer_rgba.split()[:3], al))
    res = []
    if not dusk:
        # --- rainbow: orange / yellow / green / blue / violet (NO red), soft, behind the Tower and the town, in front of the hills
        rb = Image.new("RGBA", (W * 2, H * 2)); d = ImageDraw.Draw(rb)
        ccx, ccy, r0, bw = 560 * 2, 560 * 2, 440 * 2, 11 * 2
        for k, colr in enumerate(((255, 168, 64), (255, 224, 92), (126, 214, 124), (110, 176, 245), (172, 134, 236))):
            ro = r0 + (4 - k) * bw
            d.ellipse((ccx - ro, ccy - ro, ccx + ro, ccy + ro), outline=colr + (150,), width=bw + 1)
        rb = rb.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.8))
        res.append(put(rb))
        # --- puddles: flat shiny decals in open paving corners, mirroring the sky
        pd_ = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(pd_)
        for (pc, pr, sx) in PUDDLES:
            x, y = pc * PPT, pr * PPT + SHIFT
            d.ellipse((x - sx * PPT, y - 0.2 * sx * PPT, x + sx * PPT, y + 0.2 * sx * PPT), fill=(146, 200, 238, 190), outline=(214, 236, 252, 220))
            d.ellipse((x - 0.5 * sx * PPT, y - 0.1 * sx * PPT, x + 0.1 * sx * PPT, y), fill=(236, 248, 255, 200))
        res.append(pd_)
        # --- the Tower's lamp glows warm gold, with a few kind sparkles around it (source: the lamp)
        gl = Image.new("L", (W, H)); ImageDraw.Draw(gl).ellipse((cx - 70, cy - 60, cx + 70, cy + 80), fill=200); gl = gl.filter(ImageFilter.GaussianBlur(26))
        res.append(put(solid((255, 232, 150), gl.point(lambda q: int(q * 0.55))), behind_tower=False, over_town=True))
        sp = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(sp)
        for (sx_, sy_, rr) in ((cx - 62, cy - 22, 9), (cx + 66, cy - 30, 11), (cx + 38, cy + 44, 7), (cx - 40, cy + 48, 6), (cx + 4, cy - 66, 8)):
            d.polygon([(sx_, sy_ - rr), (sx_ + rr * .28, sy_ - rr * .28), (sx_ + rr, sy_), (sx_ + rr * .28, sy_ + rr * .28), (sx_, sy_ + rr), (sx_ - rr * .28, sy_ + rr * .28), (sx_ - rr, sy_), (sx_ - rr * .28, sy_ - rr * .28)], fill=(255, 250, 214, 255))
        res.append(put(sp, behind_tower=False, over_town=True))
    else:
        gl = Image.new("L", (W, H)); ImageDraw.Draw(gl).ellipse((cx - 110, cy - 80, cx + 110, cy + 130), fill=235); gl = gl.filter(ImageFilter.GaussianBlur(34))
        res.append(put(solid((255, 222, 140), gl.point(lambda q: int(q * 0.5))), behind_tower=False, over_town=True))
        sp = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(sp)
        for (sx_, sy_, rr) in ((cx - 70, cy - 24, 9), (cx + 74, cy - 34, 11), (cx + 44, cy + 50, 7), (cx - 46, cy + 54, 6), (cx + 6, cy - 72, 8)):
            d.polygon([(sx_, sy_ - rr), (sx_ + rr * .28, sy_ - rr * .28), (sx_ + rr, sy_), (sx_ + rr * .28, sy_ + rr * .28), (sx_, sy_ + rr), (sx_ - rr * .28, sy_ + rr * .28), (sx_ - rr, sy_), (sx_ - rr * .28, sy_ - rr * .28)], fill=(255, 246, 200, 255))
        res.append(put(sp, behind_tower=False, over_town=True))
        # the town's existing lights glow a little warmer (source: those same lights)
        gm = lights.filter(ImageFilter.GaussianBlur(int(0.35 * PPT))).point(lambda q: min(255, q * 3))
        res.append(solid((255, 200, 120), gm.point(lambda q: int(q * 0.28))))
        # soft reflected puddles of the dusk sky, with a warm lamp gleam
        pd_ = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(pd_)
        for (pc, pr, sx) in PUDDLES:
            x, y = pc * PPT, pr * PPT + SHIFT
            d.ellipse((x - sx * PPT, y - 0.2 * sx * PPT, x + sx * PPT, y + 0.2 * sx * PPT), fill=(150, 126, 188, 190), outline=(206, 176, 214, 200))
            d.ellipse((x - 0.5 * sx * PPT, y - 0.1 * sx * PPT, x + 0.1 * sx * PPT, y), fill=(255, 214, 160, 170))
        res.append(pd_)
    return layers + res

PUDDLES = [(1.1, 10.15, 0.55), (22.7, 10.05, 0.5), (0.95, 7.9, 0.4), (22.9, 7.7, 0.42)]

def rgba_save(im, path):
    im.save(path, optimize=True)

def banner(img, text, sub, scale):
    w, h = img.size; bar = int(44 * scale)
    out = Image.new("RGB", (w, h + bar), (38, 30, 44)); out.paste(img, (0, 0))
    d = ImageDraw.Draw(out)
    try: f1 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(17 * scale)); f2 = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", int(13 * scale))
    except OSError: f1 = f2 = ImageFont.load_default()
    d.text((int(12 * scale), h + int(5 * scale)), text, fill=(255, 236, 190), font=f1); d.text((int(12 * scale), h + int(26 * scale)), sub, fill=(220, 214, 232), font=f2)
    return out

if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "overlays"), exist_ok=True); os.makedirs(os.path.join(OUT, "previews"), exist_ok=True)
    manifest = []; built = {}
    for n, (id_, belt, cid, title, what) in enumerate(BELTS, 1):
        if A.only and id_ not in A.only.split(","): continue
        files = {}
        for v in ("day", "dusk"):
            ov = build(id_, v); built[(id_, v)] = ov
            base = f"{n}-{id_}-{v}"
            rgba_save(ov, os.path.join(OUT, "overlays", base + "@2x.png"))
            rgba_save(ov.resize((W // 2, H // 2), Image.LANCZOS), os.path.join(OUT, "overlays", base + ".png"))
            files[v] = {"@2x": f"overlays/{base}@2x.png", "1x": f"overlays/{base}.png"}
        manifest.append({"stage": n, "belt": belt, "changeId": cid, "title": title, "adds": what, "rewardMessage": MSG[id_], "files": files})
    json.dump({"frame": {"size2x": [W, H], "size1x": [W // 2, H // 2], "pixelsPerTile2x": 80, "note": "every overlay is a full-frame transparent PNG, the same frame as incoming-art/action-zone-dojo/previews/town-slot-in-town-<day|dusk>[@2x].png; stack them in stage order on that base"}, "overlays": manifest}, open(os.path.join(OUT, "overlays", "overlays.json"), "w"), indent=1)
    # ----- cumulative stage previews on the town base (+ a growth sheet)
    PS = 0.75; thumbs = {"day": [], "dusk": []}
    for v in ("day", "dusk"):
        base = Image.open(os.path.join(AZ, "previews", f"town-slot-in-town-{v}@2x.png")).convert("RGBA")
        cur = base.copy()
        pairs = [(0, "base", "The town today", "town square + the new dojo slot, before any belt add-on")] + [(n, id_, f"Stage {n} · {belt} belt: {title}", f"adds {what}  |  \"{MSG[id_]}\"") for n, (id_, belt, cid, title, what) in enumerate(BELTS, 1)]
        for n, id_, t1, t2 in pairs:
            if n:
                key = (id_, v)
                if key not in built: built[key] = Image.open(os.path.join(OUT, "overlays", f"{n}-{id_}-{v}@2x.png")).convert("RGBA")
                cur.alpha_composite(built[key])
            im = cur.resize((int(W * PS), int(H * PS)), Image.LANCZOS)
            nm = f"stage-{n}-{id_}-{v}.png"
            banner(im, t1, t2, 1.0).save(os.path.join(OUT, "previews", nm), optimize=True)
            thumbs[v].append((n, im.copy(), t1))
    for v in ("day", "dusk"):
        tw = 620; th = int(tw * H / W); cols = 2; rows = 5
        sheet = Image.new("RGB", (cols * (tw + 10) + 10, rows * (th + 34) + 10), (38, 30, 44)); d = ImageDraw.Draw(sheet)
        try: f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 15)
        except OSError: f = ImageFont.load_default()
        for i, (n, im, t1) in enumerate(thumbs[v]):
            x = 10 + (i % cols) * (tw + 10); y = 10 + (i // cols) * (th + 34)
            d.text((x, y + 4), t1, fill=(255, 236, 190), font=f); sheet.paste(im.resize((tw, th), Image.LANCZOS).convert("RGB"), (x, y + 28))
        sheet.save(os.path.join(OUT, "previews", f"growth-sheet-{v}.png"), optimize=True)
    print("ok")
