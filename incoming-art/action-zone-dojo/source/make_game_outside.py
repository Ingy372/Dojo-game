"""Action Zone dojo - OUTSIDE as game-ready art.  Post-processes the per-group renders written by
    blender -b -P build_action_zone_dojo.py -- --scene outside --game <dir>                       (day,  full entrance view, 80 ppt)
    blender -b -P build_action_zone_dojo.py -- --scene outside --game <dir> --dusk                (dusk: same + the wall-lamp lens)
    blender -b -P build_action_zone_dojo.py -- --scene outside --game <dir> --slot --ppt 44 --ow-mult 1.818          (town slot, day)
    blender -b -P build_action_zone_dojo.py -- --scene outside --game <dir> --slot --dusk --ppt 44 --ow-mult 1.818   (town slot, dusk)
into ../sprites/: the entrance view as layers (ground, building, phone/address overlays + scenery sprites), day and dusk,
and the scaled-down town-square dojo-slot building (1x and @2x, day and dusk), merged into static.json + outside-entrance.json.
Dusk uses the PR #301 town-square recipe, applied per layer (see grade()).
Usage: python3 make_game_outside.py [work-dir, default /workspace/gamework]"""
import os, sys, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "sprites"); PRE = os.path.join(HERE, "..", "previews")
WORK = sys.argv[1] if len(sys.argv) > 1 else "/workspace/gamework"
COS = math.cos(math.radians(35)); PAD = 2
os.makedirs(os.path.join(OUT, "1x"), exist_ok=True); os.makedirs(PRE, exist_ok=True)
CX, X0, X1, RF, RB, ZE, ZR = 7.0, 3.0, 11.0, 6.0, 4.3, 2.4, 4.3
# ---- the two frames. P(c, r, z) = pixel of tile (c, r) lifted by z, in that frame
ENT = dict(cols=14.0, rows=8.9, cx=7.0, rc=4.55, ppt=80)
SLOT = dict(cols=10.0, rows=7.1, cx=7.0, rc=3.65, ppt=44)
def frame(F):
    W, H = round(F["cols"] * F["ppt"]), round(F["rows"] * F["ppt"])
    ox, oy = W / 2 - F["cx"] * F["ppt"], H / 2 - F["rc"] * F["ppt"]
    return W, H, (lambda c, r, z=0.0: (ox + c * F["ppt"], oy + r * F["ppt"] - z * F["ppt"] * COS))
EW, EH, EP = frame(ENT); SW, SH, SP = frame(SLOT)
def frame_rect(F, W, H, P):
    x, y = P(0, 0); return {"col0": round(-x / F["ppt"], 3), "row0": round(-y / F["ppt"], 3), "col1": round((W - x) / F["ppt"], 3), "row1": round((H - y) / F["ppt"], 3)}

# ---------------- dusk: the town-square recipe (make_concept.py), per layer
DUSK_MUL, DUSK_TINT, WARM = (120, 112, 165), (60, 45, 70), (255, 226, 170)
def grade(im):
    """multiply by (120,112,165)/255, then 10% toward (60,45,70); alpha untouched"""
    r, a = im.convert("RGB"), im.getchannel("A")
    r = ImageChops.multiply(r, Image.new("RGB", r.size, DUSK_MUL)); r = Image.blend(r, Image.new("RGB", r.size, DUSK_TINT), 0.1)
    r = r.convert("RGBA"); r.putalpha(a); return r
def lit_pass(graded, orig, lit):
    """lit panes: a warm lamp-yellow, shaded by the original pane's tone (so the glass keeps its low/high split); stays bright, like the town lights"""
    o = np.asarray(orig.convert("RGB")).astype(float) / 255; L = (o @ [0.3, 0.59, 0.11])[..., None]
    warm = np.clip(np.array([255, 222, 148]) * (0.9 + 0.2 * (L - 0.5)), 0, 255)
    g = np.asarray(graded).astype(float); m = (np.asarray(lit.getchannel("A")).astype(float) / 255)[..., None]
    g[..., :3] = g[..., :3] * (1 - m) + warm * m
    return Image.fromarray(g.round().astype("uint8"), "RGBA")
def glow_layer(lit, ppt):
    """soft warm halo around every lit pane: the lit mask blurred at 0.35 tile, x3, 0.6 x 0.55 of (255,196,110); it is erased over the lit pane itself (the pane stays crisp, as in the town)"""
    m = lit.getchannel("A"); g = np.asarray(m.filter(ImageFilter.GaussianBlur(0.35 * ppt))).astype(float) / 255
    g = np.clip(g * 3, 0, 1) * 0.6 * 0.55 * (1 - np.asarray(m).astype(float) / 255)
    out = np.zeros(m.size[::-1] + (4,), "uint8"); out[..., 0], out[..., 1], out[..., 2] = 255, 196, 110; out[..., 3] = (g * 255).round()
    return Image.fromarray(out, "RGBA")
def pools_layer(size, P, sources, ppt, clip=None):
    """warm pools of light on the ground, one ellipse under each source (blurred 0.3 tile, 0.8 of (255,186,104)); clipped to the ground's alpha"""
    pool = Image.new("L", size); d = ImageDraw.Draw(pool)
    for c, r, sx in sources:
        x, y = P(c, r); d.ellipse((x - sx * ppt, y - 0.42 * ppt, x + sx * ppt, y + 0.42 * ppt), fill=255)
    a = np.asarray(pool.filter(ImageFilter.GaussianBlur(0.3 * ppt))).astype(float) / 255 * 0.8
    if clip is not None: a = a * (np.asarray(clip).astype(float) / 255)
    out = np.zeros(size[::-1] + (4,), "uint8"); out[..., 0], out[..., 1], out[..., 2] = 255, 186, 104; out[..., 3] = (a * 255).round()
    return Image.fromarray(out, "RGBA")
# every pool sits on the ground under a real source: the two lit windows, the lit door panes, the wall lamp (c, r, half-width in tiles)
SOURCES = [(4.95, RF + 0.35, 0.95), (9.05, RF + 0.35, 0.95), (CX, RF + 0.5, 1.05), (10.5, RF + 0.55, 0.55)]

def load(d, g):
    p = os.path.join(d, g + ".png"); return Image.open(p).convert("RGBA") if os.path.exists(p) else None
def bbox(im, pad=PAD):
    b = im.getchannel("A").point(lambda v: 255 if v > 0 else 0).getbbox()
    return None if not b else (max(0, b[0] - pad), max(0, b[1] - pad), min(im.width, b[2] + pad), min(im.height, b[3] + pad))
def save(im, fn, folder=OUT): im.save(os.path.join(folder, fn), optimize=True)

def dusk_set(d, ppt, P, size, with_pools=True):
    """returns {group: dusk image}, plus 'glow' and 'pools' for the building's lit mask; every group in dir d is graded, the building also gets its lit pass"""
    res = {}
    for f in sorted(os.listdir(d)):
        if f.endswith(".lit.png") or not f.endswith(".png"): continue
        g = f[:-4]; im = load(d, g); gr = grade(im)
        lit = load(d, g + ".lit")
        if lit is not None:
            res[g + ".glow"] = glow_layer(lit, ppt); gr = lit_pass(gr, im, lit)
        res[g] = gr
    return res

statics = {}; sheet = []
# ======================================================================================================================
# 1. the full entrance view
# ======================================================================================================================
SPR = {   # id -> (group, anchor tile (col,row), footprint rect (x0,x1,r0,r1), note)
 "bin":     ("bin",     (11.9, 6.7),   (11.7, 12.1, 6.3, 6.7),   "small blue bin by the right corner."),
 "bench-a": ("bench-a", (4.35, 6.65),  (3.5, 5.2, 6.25, 6.65),   "long brown bench under the left window."),
 "bench-b": ("bench-b", (8.75, 6.6),   (8.27, 9.23, 6.2, 6.6),   "short bench under the right window."),
 "chair-a": ("chair-a", (9.85, 6.55),  (9.65, 10.05, 6.2, 6.55), "red metal chair (branded red, see DECIDE)."),
 "chair-b": ("chair-b", (10.55, 6.78), (10.3, 10.8, 6.4, 6.78),  "second red metal chair, turned 8 degrees."),
 "bed-a":   ("bed-a",   (5.7, 7.9),    (4.9, 6.5, 6.8, 7.9),     "flower bed, left of the walk."),
 "bed-b":   ("bed-b",   (8.3, 7.9),    (7.5, 9.1, 6.8, 7.9),     "flower bed, right of the walk."),
 "shrub":   ("shrub",   (7.0, 7.22),   (6.7, 7.3, 6.9, 7.22),    "round shrub between the beds."),
 "palm":    ("palm",    (12.4, 6.51),  (12.3, 12.5, 6.3, 6.51),  "small palm at the right end of the pad."),
 "tree-1":  ("tree-1",  (1.2, 4.72),   (1.08, 1.32, 4.6, 4.72),  "round tree behind-left of the building (behind it: sortRow 4.72)."),
 "tree-2":  ("tree-2",  (13.0, 4.52),  (12.88, 13.12, 4.4, 4.52), "round tree behind-right."),
 "tree-3":  ("tree-3",  (0.6, 7.0),    (0.5, 0.7, 6.9, 7.0),     "small round tree at the front-left edge."),
}
day = os.path.join(WORK, "out-day"); dusk = os.path.join(WORK, "out-dusk")
gd = {f[:-4]: load(day, f[:-4]) for f in os.listdir(day) if f.endswith(".png") and ".lit" not in f}
dd = dusk_set(dusk, ENT["ppt"], EP, (EW, EH))
ground_alpha = gd["ground"].getchannel("A")
pools = pools_layer((EW, EH), EP, SOURCES, ENT["ppt"], clip=ground_alpha)
glow = dd.pop("building.glow")

# full-frame layers
LAYER_NOTE = {
 "ground": "grass, gravel + pebbles, the concrete pad and walk, the two parking curbs. Draw first.",
 "pools": "dusk only: warm pools of light on the ground, one under each window, one under the door, one under the wall lamp (clipped to the ground). Draw right above the ground.",
 "building": "the building: tan ribbed metal, brown roof, red 3D sign (CMA / MARTIAL ARTS), logo badge, door, windows, banners, blank house-number plate. Everything on it is the approved sample, unchanged.",
 "phone": "swappable overlay: blank placeholder bar on the left banner. The real phone number is NOT in the repo; the Programmer swaps this one file.",
 "address": "swappable overlay: blank placeholder bar on the house-number plate. The real house number is NOT in the repo; swap this one file.",
 "glow": "dusk only: soft warm halo round each lit window, the lit door panes and the wall-lamp lens. Draw ABOVE everything.",
}
def entry_full(tag, layers):
    files = {}
    for k, im in layers.items():
        fn = f"outside-entrance-{tag}_{k}.png"; save(im, fn); files[k] = fn
    return {"size": [EW, EH], "layers": list(layers), "files": files,
            "groundRect": dict(frame_rect(ENT, EW, EH, EP), note="the frame in tiles: 14.0 x 8.9; tile (0,0) is the frame's anchorPx"),
            "topExtraTiles": 0.0, "anchorPx": [round(EP(0, 0)[0], 1), round(EP(0, 0)[1], 1)],
            "anchorNote": "the frame's pixel for tile (0,0)'s top-left corner (ground, z=0); the door's front is at row 6.0, column 7.0",
            "place": "scene", "note": " | ".join(f"{k}: {LAYER_NOTE[k]}" for k in layers)}
statics["outside-entrance-day"] = entry_full("day", {"ground": gd["ground"], "building": gd["building"], "phone": gd["overlay-phone"], "address": gd["overlay-address"]})
statics["outside-entrance-dusk"] = entry_full("dusk", {"ground": dd["ground"], "pools": pools, "building": dd["building"], "phone": dd["overlay-phone"], "address": dd["overlay-address"], "glow": glow})
statics["outside-entrance-day"]["note"] = "ENTRANCE VIEW, DAY. Draw order: ground, then trees behind (sortRow < 6), building, phone/address overlays, then the scenery sprites sorted by sortRow (all are in front of the wall). " + statics["outside-entrance-day"]["note"]
statics["outside-entrance-dusk"]["note"] = "ENTRANCE VIEW, DUSK (same geometry, same sprites; every glow has a real source). Draw order: ground, pools, trees behind, building, overlays, scenery sprites, glow last. " + statics["outside-entrance-dusk"]["note"]

# scenery sprites (cropped, day + dusk share one bbox)
for sid, (g, (ac, ar), fp, note) in SPR.items():
    b = bbox(gd[g])
    if b is None: raise SystemExit("empty " + sid)
    px, py = EP(ac, ar); files = {}
    for st, src in (("day", gd[g]), ("dusk", dd[g])):
        fn = f"outside-{sid}_{st}.png"; save(src.crop(b), fn); files[st] = fn
    statics["outside-" + sid] = {"size": [b[2] - b[0], b[3] - b[1]], "layers": ["day", "dusk"], "files": files,
        "groundRect": {"col0": round((b[0] - EP(0, 0)[0]) / ENT["ppt"], 3), "row0": round((b[1] - EP(0, 0)[1]) / ENT["ppt"], 3), "col1": round((b[2] - EP(0, 0)[0]) / ENT["ppt"], 3), "row1": round((b[3] - EP(0, 0)[1]) / ENT["ppt"], 3), "note": "the image's pixel box in entrance tiles (rows shown without lifting heights)"},
        "topExtraTiles": round(max(0, py - b[1]) / ENT["ppt"], 2), "anchorPx": [round(px - b[0], 1), round(py - b[1], 1)],
        "anchorNote": "the point of the image that sits on the anchor tile position (bottom-centre of the footprint on the ground)",
        "anchorTile": [ac, ar], "footprintRect": list(fp), "place": "scenery" if not sid.startswith("tree") else "scenery-tree", "sortRow": ar, "entrancePx": [b[0], b[1]], "interactive": False, "note": note}
    sheet.append((sid, Image.open(os.path.join(OUT, files["day"])), Image.open(os.path.join(OUT, files["dusk"]))))

# ---------------- previews + the day check against the approved sample
def composite(state):
    base = Image.new("RGBA", (EW, EH), (236, 232, 224, 255)); G = gd if state == "day" else dd
    order = [("ground", None, -1)] + ([("pools", pools, -0.5)] if state == "dusk" else []) + [("building", G["building"], RF), ("phone", G["overlay-phone"], RF + 0.001), ("address", G["overlay-address"], RF + 0.002)]
    order += [(s, G[SPR[s][0]], SPR[s][1][1]) for s in SPR]
    order[0] = ("ground", G["ground"], -1)
    for n, im, r in sorted(order, key=lambda t: t[2]): base.alpha_composite(im)
    if state == "dusk": base.alpha_composite(glow)
    return base
cd_, cu_ = composite("day"), composite("dusk")
save(cd_, "outside-entrance-day@2x.png", PRE); save(cu_, "outside-entrance-dusk@2x.png", PRE)
for nm, im in (("day", cd_), ("dusk", cu_)): save(im.resize((EW // 2, EH // 2), Image.LANCZOS), f"outside-entrance-{nm}.png", PRE)
try:
    s = Image.open(os.path.join(HERE, "..", "samples", "outside-face@2x.png")).convert("RGBA")
    with_ov = Image.new("RGBA", s.size, (236, 232, 224, 255)); with_ov.alpha_composite(s)
    # the sample has no overlays on it; build the day composite without them for the check
    chk = Image.new("RGBA", (EW, EH), (236, 232, 224, 255))
    for n, im, r in sorted([("ground", gd["ground"], -1), ("building", gd["building"], RF)] + [(x, gd[SPR[x][0]], SPR[x][1][1]) for x in SPR], key=lambda t: t[2]): chk.alpha_composite(im)
    d = np.abs(np.asarray(chk.convert("RGB")).astype(int) - np.asarray(with_ov.convert("RGB")).astype(int)).max(2)
    print("day composite vs approved outside sample: px", d.size, ">8:", int((d > 8).sum()), ">40:", int((d > 40).sum()), "mean %.3f" % d.mean())
except Exception as e: print("diff skipped", e)

# ---------------- outside-entrance.json (hotspots, overlays, blockers, draw order)
dr = lambda r: round(r, 2)
door = [EP(CX - 0.75, RF, 1.6), EP(CX + 0.75, RF, 0.0)]
ent_json = {
 "frame": {"size": [EW, EH], "pixelsPerTile": ENT["ppt"], "tiles": [ENT["cols"], ENT["rows"]], "tile00Px": [round(EP(0, 0)[0], 1), round(EP(0, 0)[1], 1)], "note": "@2x only; the game import shrinks it like the other static art. px = tile00Px + (col*80, row*80 - z*80*cos35)."},
 "states": {"day": "outside-entrance-day", "dusk": "outside-entrance-dusk"},
 "drawOrder": ["ground", "pools (dusk)", "scenery with sortRow < 6.0 (tree-1, tree-2)", "building", "phone", "address", "scenery sorted by sortRow (+ the player when in this view)", "glow (dusk)"],
 "building": {"footprintRect": [X0, X1, RB, RF], "sortRow": RF, "doorCentreTile": [CX, RF]},
 "interactables": [{"id": "front-door", "label": "enter-dojo", "target": "inside-main-floor", "tapRectPx": [round(door[0][0]), round(door[0][1]), round(door[1][0]), round(door[1][1])], "approachTile": [CX, RF + 0.6], "approachFacing": "north", "note": "tap the double doors to go inside (the inside room's spawn is its door mat)."}],
 "overlays": {
   "phone": {"layerFile": "outside-entrance-{state}_phone.png", "frame": "full entrance frame", "rectPx": [round(EP(4.25, RF, 2.15)[0]), round(EP(4.25, RF, 2.15)[1]), round(EP(5.65, RF, 1.95)[0]), round(EP(5.65, RF, 1.95)[1])], "content": "BLANK placeholder bar; the real number goes in by swapping this one PNG (never committed)"},
   "address": {"layerFile": "outside-entrance-{state}_address.png", "frame": "full entrance frame", "rectPx": [round(EP(CX + 0.58, RF, 1.88)[0]), round(EP(CX + 0.58, RF, 1.88)[1]), round(EP(CX + 0.98, RF, 1.68)[0]), round(EP(CX + 0.98, RF, 1.68)[1])], "content": "BLANK placeholder bar on the house-number plate; the real house number is NOT in the repo."}},
 "blockers": [{"id": k, "rect": SPR[k][2]} for k in ("bin", "bench-a", "bench-b", "chair-a", "chair-b", "bed-a", "bed-b", "shrub", "palm")] + [{"id": "building", "rect": [X0, X1, RB, RF + 0.1]}],
 "spawn": {"tile": [CX, 8.6], "note": "where the player arrives from the town / leaves the inside room: on the walk, below the beds"},
 "lightSources": [{"id": "window-left", "tile": [4.95, RF], "z": 1.18}, {"id": "window-right", "tile": [9.05, RF], "z": 1.18}, {"id": "door-panes", "tile": [CX, RF], "z": 1.0}, {"id": "wall-lamp", "tile": [10.5, RF], "z": 2.0, "note": "dusk only: the lens object exists only in the dusk render (the day sample draws the lamp as a plain box)"}],
}
json.dump(ent_json, open(os.path.join(OUT, "outside-entrance.json"), "w"), indent=1)

# ======================================================================================================================
# 2. the town-slot dojo (PR #301 town square: 80 ppt @2x, dojo slot 4.4 tiles wide, front at row 4.4, column 3.6)
# ======================================================================================================================
sday, sdusk = os.path.join(WORK, "slot-day"), os.path.join(WORK, "slot-dusk")
sd = load(sday, "building"); su_in = load(sdusk, "building"); su_lit = load(sdusk, "building.lit")
assert sd.size == (SW, SH), sd.size
def slot_dusk():
    gr = lit_pass(grade(su_in), su_in, su_lit); gl = glow_layer(su_lit, SLOT["ppt"])
    pl = pools_layer((SW, SH), SP, [(4.95, RF + 0.35, 0.95), (9.05, RF + 0.35, 0.95), (CX, RF + 0.5, 1.05), (10.5, RF + 0.55, 0.55)], SLOT["ppt"])
    out = Image.new("RGBA", (SW, SH)); out.alpha_composite(pl); out.alpha_composite(gr); out.alpha_composite(gl); return out
sdu = slot_dusk()
files, files1 = {}, {}
for st, im in (("day", sd), ("dusk", sdu)):
    fn = f"town-slot-dojo_{st}.png"; save(im, fn); files[st] = fn
    save(im.resize((SW // 2, SH // 2), Image.LANCZOS), fn, os.path.join(OUT, "1x")); files1[st] = "1x/" + fn
tl, br = SP(X0, RF, ZR), SP(X1, RF, 0.0)
statics["town-slot-dojo"] = {"size": [SW, SH], "size1x": [SW // 2, SH // 2], "layers": ["day", "dusk"], "files": files, "files1x": files1,
    "groundRect": dict(frame_rect(SLOT, SW, SH, SP), note="the image's pixel box in the building's own tiles (the building is 8 of them wide; in the town one of them is 0.55 town tile)"),
    "topExtraTiles": round(SP(CX, RF)[1] / SLOT["ppt"], 2),
    "anchorPx": [round(SP(CX, RF)[0], 1), round(SP(CX, RF)[1], 1)],
    "anchorNote": "the building's front-centre on the ground (under the door). Put this pixel on town tile (3.6, 4.4), the dojo slot of the PR #301 town square (that slot's front wall row). @2x here = the town's @2x art scale 1:1 (80 ppt town tiles); the 1x file is the 40 ppt twin.",
    "anchorTownTile": [3.6, 4.4], "place": "town-slot", "sortRow": 4.4, "footprintRectTownTiles": [1.4, 5.8, 3.0, 4.4],
    "tapRectPx": [round(tl[0]), round(tl[1]), round(br[0]), round(br[1])], "tapRectNote": "front face of the building (wall + roof gable) in @2x px; tap it to enter. Halve for 1x.",
    "interactive": True, "target": "outside-entrance-day|dusk", "scale": 0.55,
    "note": "the Action Zone building at 0.55 scale for the town square's classmate-dojo slot (the old green-noren 'dojo0' placeholder). Day and dusk are separate sprites; dusk has its glow + ground pools baked in (they extend past the building a little: the glow 0.35 tile, the pool ~1 tile in front). Line weight matches the town (1 px @1x, 2 px @2x). No phone/address overlay here (they would be 3 px tall)."}

# ---------------- merge into static.json
sp = os.path.join(OUT, "static.json"); S = json.load(open(sp)) if os.path.exists(sp) else {"pixelsPerTile": 80, "sprites": {}}
S["sprites"].update(statics); json.dump(S, open(sp, "w"), indent=1)

# ---------------- sprite sheet preview (entrance sprites: day on top, dusk below, each with its id)
cw, chh = 230, 250; cols = 6; nrow = (len(sheet) + cols - 1) // cols
sh = Image.new("RGBA", (cw * cols, nrow * (2 * chh + 24)), (236, 232, 224, 255)); dd_ = ImageDraw.Draw(sh)
for i, (sid, a, b) in enumerate(sheet):
    x, y = (i % cols) * cw, (i // cols) * (2 * chh + 24)
    for k, im in enumerate((a, b)):
        t = im.copy(); t.thumbnail((cw - 16, chh - 16)); sh.alpha_composite(t, (x + 8, y + 20 + k * chh + 8))
    dd_.text((x + 8, y + 4), sid, fill=(40, 40, 50, 255))
save(sh.convert("RGB"), "outside-sprite-sheet.png", PRE)
print("ok", list(statics))
