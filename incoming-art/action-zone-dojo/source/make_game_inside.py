"""Action Zone dojo - INSIDE as game-ready art.  Post-processes the per-group renders written by
    blender -b -P build_action_zone_dojo.py -- --scene inside --samples 24 --game <groups-dir>
into ../sprites/: four full-room layers (the full layers only, no chunk tiles), cropped prop sprites with anchors, foreground sprites (seat backs, bag tops),
static.json (merged), inside-room.json (collision grid, interactables, seats, spawn, exit) and the review previews.
Usage: python3 make_game_inside.py <groups-dir>"""
import os, sys, json, math, glob
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
import layout_main_floor as LM

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "..", "sprites"); PRE = os.path.join(HERE, "..", "previews")
SRC = sys.argv[1] if len(sys.argv) > 1 else "/workspace/gamework/inside"
PPT = 80; COS = math.cos(math.radians(35)); OX, OY = 56, 168        # tile (0,0) top-left in the room frame; z lifts by PPT*cos35 per tile
PAD = 2
os.makedirs(OUT, exist_ok=True); os.makedirs(PRE, exist_ok=True)
P = lambda c, r, z=0.0: (OX + c * PPT, OY + r * PPT - z * PPT * COS)

LAYERS = ["floor", "walls", "props", "foreground"]
LAYER_NOTE = {
    "floor": "ground: lobby tile, blue mats, big red square with the school logo, thresholds, front-door mat, the seating decks and steps, the red gear-bag box base. Draw first, at depth 0.",
    "walls": "the north wall with its wall art, the side wall strips, the back-wall drywall. Nothing above the drywall. Draw above floor.",
    "props": "wall-hugging furniture that never moves: the creed boards, flag, mural frames, the gear shelf and crash mats. Under every character.",
    "foreground": "the front wall (curb, door posts, door header, open door leaves): the one FULL-FRAME layer drawn ABOVE characters, so a student walking in or out passes behind it. The seat backs and the bag tops are foreground SPRITES (see foregroundSprites), because each has its own sortRow.",
}
# ---- y-sorted sprites: id -> (group file, kind, anchor tile (col,row), footprint rect (x0,x1,r0,r1), sortRow, interactive, note)
SPR = {
 "wing-west":      ("wing-west",      "structure", (3.5, 9.95),  (0.0, 7.0, 9.78, 10.12), 9.95,  False, "pro-shop alcove wall (the left wing). Hides the mat when a character is NORTH of it, is hidden by characters SOUTH of it."),
 "wing-east":      ("wing-east",      "structure", (23.2, 9.95), (19.4, 27.0, 9.78, 10.12), 9.95, False, "east wing wall that carries the two cross doors and the handprint wall (their sprites go on top of it)."),
 "pro-counter":    ("pro-counter",    "prop",      (3.6, 11.95), (1.9, 5.3, 11.05, 11.95), 11.95, True,  "pro shop counter in the left alcove (its back is the wing wall)."),
 "bag-black":      ("bag-black",      "prop",      (22.8, 4.23), (22.3, 23.3, 3.37, 4.23), 4.23,   True,  "heavy bag, black."),
 "bag-blue":       ("bag-blue",       "prop",      (24.0, 5.03), (23.5, 24.5, 4.17, 5.03), 5.03,   True,  "heavy bag, blue."),
 "bag-red":        ("bag-red",        "prop",      (25.2, 4.23), (24.7, 25.7, 3.37, 4.23), 4.23,   True,  "heavy bag, branded red (DECIDE item, see README)."),
 "gear-box":       ("gear-box",       "prop",      (13.2, 9.95), (9.6, 16.8, 8.6, 9.95), 9.95,  True,  "the red gear-bag box with a 2.6-tile gap at each end onto the mat. Openings face the lobby (south)."),
 "seats":          ("seats",          "prop",      (13.5, 14.7), (8.95, 18.05, 10.2, 14.7), 14.7, True, "parent stadium seating, 3 tiers of 8 seats facing the mat, with the end steps. One sprite so the tiers never fight over depth."),
 "bench":          ("bench",          "prop",      (2.4, 16.15), (1.5, 3.3, 15.65, 16.15), 16.15, False, "waiting bench against the lobby's west side."),
 "plant":          ("plant",          "prop",      (10.6, 17.75), (10.35, 10.85, 17.25, 17.75), 17.75, False, "potted plant by the door."),
 "trash-can":      ("trash-can",      "prop",      (17.3, 17.77), (17.03, 17.57, 17.23, 17.77), 17.77, False, "bin by the door."),
 "whiteboard":     ("whiteboard",     "prop",      (21.3, 6.4),  (20.6, 22.0, 6.2, 6.4), 6.4,   False, "stand whiteboard (blank, no writing)."),
 # wall dressing that is also interactive: drawn once, BEHIND every character (sortRow = its wall's row + 0.01)
 "target-wall":    ("target-wall",    "wall-decal", (3.5, 1.0),  (0.4, 6.6, 0.8, 1.0), 1.01,  True,  "yellow target wall on the north wall (logo art + styles mural frame)."),
 "back-doors":     ("back-doors",     "wall-decal", (14.4, 1.0), (13.3, 15.5, 0.8, 1.0), 1.01, True,  "double back doors in the north wall (to the back room)."),
 "cross-door-a":   ("cross-door-a",   "wall-decal", (20.6, 9.95), (19.9, 21.3, 9.95, 10.1), 9.96, True, "cross door A on the east wing (its shut face is on the lobby side)."),
 "cross-door-b":   ("cross-door-b",   "wall-decal", (25.6, 9.95), (24.9, 26.3, 9.95, 10.1), 9.96, True, "cross door B on the east wing."),
 "handprint-wall": ("handprint-wall", "wall-decal", (23.1, 9.95), (21.6, 24.6, 9.95, 10.1), 9.96, True, "handprint wall between the two cross doors: plain handprints, NO names."),
}
INTERACT = {   # id -> (label key, approach tile (col,row), facing, extra approach tiles)
 "pro-counter": ("shop", (3, 12), "north", []), "target-wall": ("target-wall", (3, 2), "north", []), "back-doors": ("back-doors", (14, 2), "north", []),
 "cross-door-a": ("cross-door", (20, 10), "north", []), "cross-door-b": ("cross-door", (25, 10), "north", []), "handprint-wall": ("handprints", (23, 10), "north", []),
 "bag-black": ("heavy-bag", (22, 5), "north", [(23, 4)]), "bag-blue": ("heavy-bag", (23, 6), "north", [(24, 5)]), "bag-red": ("heavy-bag", (25, 5), "north", [(26, 4)]),
 "gear-box": ("gear-box", (8, 9), "east", [(17, 9)]), "seats": ("parent-seats", (13, 15), "north", []),
}

def load(g):
    return Image.open(os.path.join(SRC, g + ".png")).convert("RGBA")
def bbox(im, pad=PAD):
    b = im.getchannel("A").point(lambda v: 255 if v > 0 else 0).getbbox()
    if not b: return None
    return (max(0, b[0] - pad), max(0, b[1] - pad), min(im.width, b[2] + pad), min(im.height, b[3] + pad))

full = load("floor").size
statics = {}
# ---------------- room layers (full frame; shipped whole, no chunking)
for L in LAYERS:
    im = load(L); assert im.size == full, (L, im.size)
    im.save(os.path.join(OUT, f"inside-main-floor_{L}.png"), optimize=True)
statics["inside-main-floor"] = {
    "size": list(full), "layers": LAYERS, "files": {L: f"inside-main-floor_{L}.png" for L in LAYERS},
    "groundRect": {"col0": 0, "row0": 0, "col1": LM.W, "row1": 19.0, "note": "the room's walkable ground in tiles (27 x 19); the walls sit on its north edge, the front wall on row 18.4"},
    "topExtraTiles": 0.0, "anchorPx": [OX, OY], "anchorNote": "the room frame's pixel for grid tile (0,0)'s top-left corner (same convention as home-dojo room_*.png)",
    "place": "room",
    "note": "ONE wide scrolling room. Draw order: floor, walls, props, then wall-decal sprites and y-sorted sprites and characters sorted by sortRow, then foreground ABOVE the characters. " + " | ".join(f"{k}: {v}" for k, v in LAYER_NOTE.items())}

# ---------------- sprites
sheet = []
for sid, (g, kind, (ac, ar), fp, srow, interactive, note) in SPR.items():
    im = load(g); b = bbox(im)
    if b is None: raise SystemExit("empty sprite " + sid)
    crop = im.crop(b); fn = f"{sid}_{sid}.png"; crop.save(os.path.join(OUT, fn), optimize=True)
    px, py = P(ac, ar)
    ent = {"size": list(crop.size), "layers": [sid], "files": {sid: fn},
           "groundRect": {"col0": round((b[0] - OX) / PPT, 3), "row0": round((b[1] - OY) / PPT, 3), "col1": round((b[2] - OX) / PPT, 3), "row1": round((b[3] - OY) / PPT, 3), "note": "the image's pixel box in room tiles (rows shown without lifting heights)"},
           "topExtraTiles": round(max(0, (py - b[1])) / PPT, 2),
           "anchorPx": [round(px - b[0], 1), round(py - b[1], 1)], "anchorNote": "the point of the image that sits on the anchor tile position (bottom-centre of the footprint on the floor)",
           "anchorTile": [ac, ar], "footprintRect": list(fp), "place": kind, "sortRow": srow, "roomPx": [b[0], b[1]], "interactive": interactive, "note": note}
    if kind == "wall-decal": ent["note"] += " Wall decal: draw it above its wall and below every character."
    statics[sid] = ent; sheet.append((sid, crop, ent))

# ---------------- foreground sprites: the tall parts a student walks BEHIND (seat backs, bag tops). They are pixel-identical copies of the same pixels that are already inside the base sprite
# (seat backs: rendered with everything else as a holdout; bag tops: the base sprite cut above BAG_CUT_Z), so the room looks the same; the game draws them AGAIN above the characters, but only for
# characters whose footprint row is LESS than sortRow (north of the object). A character in front of / south of it must NOT be covered, or the student loses their head to the sprite.
BAG_CUT_Z = 1.25; FG_RULE = "draw this sprite ABOVE a character only when the character's footprint (feet) row < sortRow; otherwise leave it out (the base sprite is already under the character)"
FGS = {"seats-back": ("fg-seat-backs", "seats", "the 24 seat backs (backs and their inset panels) of the parent seating")}
for bid in ("black", "blue", "red"): FGS[f"bag-{bid}-top"] = (f"bag-{bid}", f"bag-{bid}", f"top of the {bid} heavy bag: everything above the band, z over {BAG_CUT_Z} tile")
fgs = {}
for fid, (g, base, why) in FGS.items():
    im = load(g); b0 = statics[base]; ac, ar = b0["anchorTile"]
    if fid.endswith("-top"):
        cut = round(P(ac, ar - 0.43, BAG_CUT_Z)[1]); im = im.crop((0, 0, im.width, cut)); 
    if not fid.endswith("-top"):      # seat backs: take the pixels from the BASE sprite wherever the holdout render says "a back is visible here"
        a = np.asarray(im.getchannel("A")) > 200; bm = np.asarray(load(base))
        im = Image.fromarray(np.where(a[..., None], bm, 0).astype("uint8"), "RGBA")
    arr = np.asarray(im).copy(); arr[arr[..., 3] < 255] = 0; im = Image.fromarray(arr, "RGBA")     # only fully opaque pixels: drawn over the base they are exactly the same colour, so the room picture does not change (no doubled anti-aliased edges)
    b = bbox(im); crop = im.crop(b); fn = f"{fid}_{fid}.png"; crop.save(os.path.join(OUT, fn), optimize=True)
    px, py = P(ac, ar)
    ent = {"size": list(crop.size), "layers": [fid], "files": {fid: fn},
           "groundRect": {"col0": round((b[0] - OX) / PPT, 3), "row0": round((b[1] - OY) / PPT, 3), "col1": round((b[2] - OX) / PPT, 3), "row1": round((b[3] - OY) / PPT, 3), "note": "the image's pixel box in room tiles (rows shown without lifting heights)"},
           "topExtraTiles": round(max(0, (py - b[1])) / PPT, 2), "anchorPx": [round(px - b[0], 1), round(py - b[1], 1)], "anchorNote": "same anchor tile as the base sprite, so the two line up when both are placed at the same spot",
           "anchorTile": [ac, ar], "footprintRect": b0["footprintRect"], "place": "foreground-sprite", "drawLayer": "foreground", "basedOn": base, "sortRow": b0["sortRow"], "roomPx": [b[0], b[1]], "interactive": False,
           "foregroundRule": FG_RULE, "note": why + ". Foreground sprite: an identical copy of pixels already in '" + base + "' (draw the base y-sorted as usual, then this one above the characters that are north of it)."}
    statics[fid] = ent; fgs[fid] = ent; sheet.append((fid, crop, ent))

# ---------------- collision grid (27 x 19 cells; cell (c,r) = tiles [c,c+1) x [r,r+1))
W_, H_ = int(LM.W), 19
def cover(rect, thr=0.12, n=8):
    x0, x1, r0, r1 = rect; out = set()
    for r in range(H_):
        for c in range(W_):
            xs = np.linspace(c, c + 1, n, endpoint=False) + 0.5 / n; ys = np.linspace(r, r + 1, n, endpoint=False) + 0.5 / n
            f = ((xs >= x0) & (xs <= x1)).mean() * ((ys >= r0) & (ys <= r1)).mean()
            if f >= thr: out.add((c, r))
    return out
grid = [["." for _ in range(W_)] for _ in range(H_)]
def paint(cells, ch):
    for c, r in cells:
        if 0 <= c < W_ and 0 <= r < H_: grid[r][c] = ch
# zones first (walkable kinds), then blockers on top
paint(cover((0, LM.W, LM.R_N, LM.R_MAT_S), 0.5), "m")                         # mat room (rows 1..9)
paint(cover((LM.REDSQ[0], LM.REDSQ[1], LM.REDSQ[2], LM.REDSQ[3]), 0.5), "r")  # the red square
paint(cover((LM.GAP[0], LM.GAP[1] + 2.6, 9.0, 10.0), 0.4), "g"); paint(cover((LM.GAP_R[0] - 2.6, LM.GAP_R[1], 9.0, 10.0), 0.4), "g")
paint({(c, 9) for c in range(0, W_)}, "m")                                   # row 9 is the mat's south strip (wings overwrite it)
paint({(c, r) for c in range(W_) for r in (0, )}, "#")                         # north wall row
paint({(c, 18) for c in range(W_)}, "#"); paint({(c, 18) for c in (12, 13, 14)}, "D")   # front wall row, door cells = exit
blockers = []
def block(bid, rect, ch="P", why=""):
    cells = cover(rect); paint(cells, ch); blockers.append({"id": bid, "rect": list(rect), "cells": sorted([c, r] for c, r in cells), "why": why})
block("wing-west", (0.0, 7.0, 9.0, 10.0), "#", "west wing wall row"); block("wing-east", (19.4, 27.0, 9.0, 10.0), "#", "east wing wall row")
paint({(6, r) for r in (10, 11, 12)} | {(19, r) for r in (10, 11, 12)}, "#")
blockers += [{"id": "stub-west", "rect": [6.9, 7.1, 10.0, 12.35], "cells": [[6, 10], [6, 11], [6, 12]], "why": "wing end wall (west); the thin wall is given the column on its alcove side"}, {"id": "stub-east", "rect": [19.4, 19.6, 10.0, 12.35], "cells": [[19, 10], [19, 11], [19, 12]], "why": "wing end wall (east); the thin wall is given its own column"}]
block("pro-counter", (1.9, 5.3, 11.05, 11.95), "P"); block("gear-box", LM.CUBBY, "P", "red gear-bag box (gaps on both ends stay open)")
block("seats", (8.95, 18.05, 10.2, 14.7), "S", "parent seating decks and steps")
for (bx, br, nm) in LM.BAGS: block("bag-" + nm, (bx - .5, bx + .5, br - .43, br + .43), "P", "heavy bag base")
block("crash-mats", LM.CRASH, "P"); block("whiteboard", (20.6, 22.0, 6.2, 6.4), "P")
block("bench", (1.5, 3.3, 15.65, 16.15), "P"); paint({(10, 17)}, "P"); blockers.append({"id": "plant", "rect": [10.35, 10.85, 17.25, 17.75], "cells": [[10, 17]], "why": "pot"})
paint({(17, 17)}, "P"); blockers.append({"id": "trash-can", "rect": [17.03, 17.57, 17.23, 17.77], "cells": [[17, 17]], "why": "bin"})
# side walls are outside the 27 columns (the room frame draws them as thin strips)
leaf_rects = [{"id": "door-leaf-west", "rect": [12.36, 12.44, 17.25, 18.35]}, {"id": "door-leaf-east", "rect": [14.56, 14.64, 17.25, 18.35]}]
tiles = ["".join(r) for r in grid]
walk = set(".mrgD")
mats = sum(1 for r in tiles for ch in r if ch in walk)

# ---------------- seats
SX0, SX1 = LM.SEATS; pitch = (SX1 - SX0 - 0.6) / 8; seat_slots = []
for ti, (rf, dp, zt) in enumerate(LM.TIERS):
    for k in range(8): seat_slots.append({"tier": ti, "index": k, "tile": [round(SX0 + 0.3 + pitch * (k + .5), 3), round(rf - dp / 2 - 0.1, 3)], "z": round(zt + 0.34, 2), "faces": "north"})
inter = []
for sid, (key, (ac, ar), face, extra) in INTERACT.items():
    if sid.startswith("bag-"): rect = next(b["rect"] for b in blockers if b["id"] == sid)
    else: rect = statics[sid]["footprintRect"]
    inter.append({"id": sid, "kind": key, "sprite": sid if sid in statics else None, "footprintRect": rect, "approachTile": [ac, ar], "approachFacing": face, "alsoApproach": [list(e) for e in extra],
                  "sortRow": statics[sid]["sortRow"] if sid in statics else None, "tapPx": None,
                  "foregroundSprite": ("seats-back" if sid == "seats" else sid + "-top") if (sid == "seats" or sid.startswith("bag-")) else None})
# tap rectangles in room px: the sprite's bbox
for it in inter:
    s = statics.get(it["sprite"]); 
    if s: it["tapRectPx"] = [s["roomPx"][0], s["roomPx"][1], s["roomPx"][0] + s["size"][0], s["roomPx"][1] + s["size"][1]]   # [x0, y0, x1, y1] in room px, same form as the outside rects
bagrects = {"bag-black": (22.8, 3.8), "bag-blue": (24.0, 4.6), "bag-red": (25.2, 3.8)}
room = {
    "id": "inside-main-floor", "pixelsPerTile": PPT, "frameSize": list(full), "roomPx": {"tile00": [OX, OY], "note": "room frame pixel of tile (0,0)'s top-left; px = 56 + col*80, py = 168 + row*80 - z*80*cos35"},
    "gridSize": [W_, H_], "tileLegend": {"#": "wall / blocked (walls, wings)", "P": "blocked prop", "S": "blocked parent seating", ".": "walkable lobby floor", "m": "walkable mat", "r": "walkable red square (on the mat)", "g": "walkable gap/threshold onto the mat", "D": "front door cell = exit trigger"},
    "walkableChars": "".join(sorted(walk)), "tiles": tiles, "walkableCells": mats,
    "blockers": blockers, "doorLeaves": leaf_rects, "doorLeafNote": "the two open front-door leaves are thin (0.08) and left walkable in the grid; use the rects if you want the exact squeeze",
    "spawn": {"enter": [13, 17], "note": "first tile inside the door; the student walks in from row 18"}, "exit": {"cells": [[12, 18], [13, 18], [14, 18]], "rect": [12.3, 14.7, 17.9, 19.0], "to": "town-square"},
    "zones": {"matRoom": [0, LM.W, 1.0, LM.R_MAT_S], "redSquare": list(LM.REDSQ), "lobby": [0, LM.W, LM.R_MAT_S, LM.R_FRONT], "gapWest": [7.0, 9.6, 8.6, 10.0], "gapEast": [16.8, 19.4, 8.6, 10.0], "proShop": [0, 7.0, 10.12, 12.35], "crashMats": list(LM.CRASH)},
    "interactables": inter, "seatSlots": seat_slots,
    "foregroundSprites": [{"id": k, "file": e["files"][k], "basedOn": e["basedOn"], "sortRow": e["sortRow"], "roomPx": e["roomPx"], "size": e["size"], "anchorPx": e["anchorPx"], "anchorTile": e["anchorTile"], "drawLayer": "foreground", "rule": FG_RULE} for k, e in fgs.items()],
    "foregroundRule": FG_RULE + ". The full-frame foreground layer (the front wall) is drawn above every character as before; these sprites are the per-object foreground.",
    "drawOrder": ["floor", "walls", "props", "wall-decal sprites (sortRow = wall row + 0.01)", "y-sorted sprites + characters by sortRow (footprint bottom row)", "foreground (above characters): the full-frame foreground layer (front wall) always; then the foreground sprites (seats-back, bag-*-top) above each character whose footprint row < the sprite's sortRow"],
    "scroll": {"note": "the room is 2272 x 1696 px at 80 ppt; the game camera follows the student inside it", "cameraClampPx": [0, 0, full[0], full[1]]},
}
json.dump(room, open(os.path.join(OUT, "inside-room.json"), "w"), indent=1)
# merge into static.json
sp = os.path.join(OUT, "static.json")
d = json.load(open(sp)) if os.path.exists(sp) else {"pixelsPerTile": PPT, "camera": {"projection": "orthographic", "elevationDeg": 35.0, "facing": "north (the one game view)"}, "groundRule": "a ground tile is exactly ppt x ppt px (the scene's depth is stretched by 1/sin(35)); heights show at ppt*cos(35) px per tile", "sprites": {}}
d["sprites"].update(statics); json.dump(d, open(sp, "w"), indent=1)

# ---------------- previews
comp = Image.new("RGBA", full, (0, 0, 0, 0))
order = [("floor", 0), ("walls", 0), ("props", 0)]
for L, _ in order: comp.alpha_composite(load(L))
ent_sorted = sorted(statics.items(), key=lambda kv: (kv[1].get("sortRow", -1), kv[0])); 
for sid, e in ent_sorted:
    if sid == "inside-main-floor" or sid in fgs: continue
    comp.alpha_composite(Image.open(os.path.join(OUT, e["files"][sid])).convert("RGBA"), tuple(e["roomPx"]))
comp.alpha_composite(load("foreground"))
for fid, e in fgs.items(): comp.alpha_composite(Image.open(os.path.join(OUT, e["files"][fid])).convert("RGBA"), tuple(e["roomPx"]))   # (pixel-identical copies: the picture is unchanged)
bg = Image.new("RGBA", full, (236, 232, 224, 255)); bg.alpha_composite(comp); bg.convert("RGB").save(os.path.join(PRE, "inside-game-composite@2x.png"))
bg.resize((full[0] // 2, full[1] // 2), Image.LANCZOS).convert("RGB").save(os.path.join(PRE, "inside-game-composite.png"))
# collision overlay (violet = blocked, teal = walkable; no red)
ov = bg.copy(); od = ImageDraw.Draw(ov, "RGBA")
col = {"#": (88, 60, 160, 120), "P": (120, 70, 190, 130), "S": (150, 90, 200, 120), "D": (255, 210, 60, 150)}
for r, row in enumerate(tiles):
    for c, ch in enumerate(row):
        x, y = P(c, r); b = (x, y, x + PPT, y + PPT)
        od.rectangle(b, fill=col.get(ch, (40, 170, 150, 55)), outline=(20, 20, 40, 90))
for sid, e in statics.items():
    if "anchorTile" in e:
        x, y = P(*e["anchorTile"]); od.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(255, 220, 40, 255), outline=(20, 18, 28, 255))
for it in inter:
    ax, ay = it["approachTile"]; x, y = P(ax + .5, ay + .5); od.ellipse((x - 8, y - 8, x + 8, y + 8), outline=(255, 255, 255, 255), width=3)
for s in seat_slots:
    x, y = P(*s["tile"]); od.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(255, 255, 255, 220))
ov.convert("RGB").save(os.path.join(PRE, "inside-collision-overlay@2x.png")); ov.resize((full[0] // 2, full[1] // 2), Image.LANCZOS).convert("RGB").save(os.path.join(PRE, "inside-collision-overlay.png"))
# sprite sheet with anchors
mx = max(e["size"][0] for _, _, e in sheet); my = max(e["size"][1] for _, _, e in sheet); sc = 0.5
cell = (int(min(mx, 700) * sc) + 20, int(min(my, 420) * sc) + 36)
rows = math.ceil(len(sheet) / 4); S = Image.new("RGB", (cell[0] * 4, cell[1] * rows), (236, 232, 224)); sd = ImageDraw.Draw(S)
for n, (sid, im, e) in enumerate(sheet):
    t = im.copy(); t.thumbnail((cell[0] - 20, cell[1] - 36), Image.LANCZOS); k = t.width / im.width
    x0, y0 = (n % 4) * cell[0] + 10, (n // 4) * cell[1] + 22; S.paste(t, (x0, y0), t)
    ax, ay = e["anchorPx"]; sd.ellipse((x0 + ax * k - 4, y0 + ay * k - 4, x0 + ax * k + 4, y0 + ay * k + 4), fill=(255, 220, 40), outline=(20, 18, 28))
    sd.text((x0, y0 - 16), f"{sid}  {e['size'][0]}x{e['size'][1]}  sortRow {e['sortRow']}", fill=(30, 30, 40))
S.save(os.path.join(PRE, "inside-sprite-sheet.png"))
print("walkable cells", mats, "of", W_ * H_); print("\n".join(tiles))
tot = 0
for f in glob.glob(os.path.join(OUT, "**", "inside-main-floor_*.png"), recursive=True) + [os.path.join(OUT, e["files"][s]) for s, e in statics.items() if s != "inside-main-floor"]: tot += os.path.getsize(f)
print("bytes", tot)
