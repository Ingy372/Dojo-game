"""The Street Smarts places as game art (Nov 24, lessons 2-5). Post-processes one place's group renders from
build_place.py into ../sprites/<place>/ (the room's four full-frame layers, the cropped y-sorted pieces, cast props like
the car, static.json), writes the room file the game reads (content/street-smarts/<place>-room.json) and a flat
preview picture (../preview/<place>.png).
    python make_game_place.py <groups-dir>"""
import os, sys, json, math
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1]
F = json.load(open(os.path.join(SRC, "frame.json")))
PL = json.load(open(os.path.join(SRC, "place.json")))
PID = PL["id"]
OUT = os.path.join(HERE, "..", "sprites", PID)
ROOM_OUT = os.path.join(HERE, "..", "..", "..", "content", "street-smarts", f"{PID}-room.json")
PREV = os.path.join(HERE, "..", "preview")
os.makedirs(OUT, exist_ok=True); os.makedirs(PREV, exist_ok=True)
PPT = F["ppt"]; OX, OY = F["originX"], F["originY"]
P = lambda c, r: (OX + c * PPT, OY + r * PPT)
PACK = f"street-{PID}"
ROOM_ID = f"{PACK}-room"
LAYERS = ["floor", "walls", "props", "foreground"]


def load(g):
    path = os.path.join(SRC, g + ".png")
    if os.path.exists(path):
        return Image.open(path).convert("RGBA")
    return None


def bbox(im, pad=2):
    b = im.getchannel("A").getbbox()
    return (max(0, b[0] - pad), max(0, b[1] - pad), min(im.width, b[2] + pad), min(im.height, b[3] + pad))


full = load("floor")
sprites = {}
layer_ims = {}
for L in LAYERS:
    im = load(L) or Image.new("RGBA", full.size, (0, 0, 0, 0))
    layer_ims[L] = im
    im.save(os.path.join(OUT, f"{ROOM_ID}_{L}.png"), optimize=True)
sprites[ROOM_ID] = {
    "size": list(full.size), "layers": LAYERS, "files": {L: f"{ROOM_ID}_{L}.png" for L in LAYERS},
    "anchorPx": [OX, OY], "anchorNote": "the frame pixel of grid tile (0,0)'s top-left corner", "place": "room",
    "note": f"The Street Smarts {PID} (Nov 24). Draw floor, walls, props; then the y-sorted pieces and people by sortRow; then foreground above everyone."}
piece_ims = []
for sid, pc in PL["pieces"].items():
    im = load(sid)
    b = bbox(im); crop = im.crop(b)
    fn = f"{sid}_{sid}.png"; crop.save(os.path.join(OUT, fn), optimize=True)
    ac, ar = pc["anchorTile"]; px, py = P(ac, ar)
    s = {"size": list(crop.size), "layers": [sid], "files": {sid: fn}, "anchorPx": [round(px - b[0], 1), round(py - b[1], 1)], "note": pc["note"]}
    if pc.get("actor"):
        s["place"] = "actor"
    else:
        s.update(anchorTile=[ac, ar], footprintRect=pc["footprintRect"], place="prop", sortRow=pc["sortRow"])
        piece_ims.append((pc["sortRow"], im))
    sprites[sid] = s
json.dump({"pixelsPerTile": PPT, "camera": "orthographic, 35 deg down, looking north", "sprites": sprites}, open(os.path.join(OUT, "static.json"), "w"), indent=1)

room = {
    "notes": f"The {PID} for a Street Smarts lesson (Nov 24). Written by incoming-art/claude-street-places/source/make_game_place.py from build_place.py. "
             "marks: named spots in tiles [x, y] (or [x, y, height] for a spot up off the floor) that the scenario's stage cues use. "
             "cast: the art pack for each person (\"static:<id>\" is a prop from the room pack, like the car); the grown-up is Mom or Dad by the player's pick. "
             "start: the marks the camera shows first.",
    "id": PID, "pack": PACK, "roomSprite": ROOM_ID, "pixelsPerTile": PPT, "size": PL["size"],
    "start": PL["start"], "cast": PL["cast"], "marks": PL["marks"],
}
json.dump(room, open(ROOM_OUT, "w", newline="\n"), indent=1)

# a flat preview: the layers and pieces in draw order, with the marks as dots
prev = Image.new("RGBA", full.size, (42, 37, 51, 255))
for L in ("floor", "walls", "props"):
    prev.alpha_composite(layer_ims[L])
for _, im in sorted(piece_ims, key=lambda t: t[0]):
    prev.alpha_composite(im)
for sid, pc in PL["pieces"].items():
    if pc.get("actor"):
        prev.alpha_composite(load(sid))
prev.alpha_composite(layer_ims["foreground"])
from PIL import ImageDraw
d = ImageDraw.Draw(prev)
for name, m in PL["marks"].items():
    x, y = P(m[0], m[1] - (m[2] if len(m) > 2 else 0) * math.cos(math.radians(35)))
    d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(255, 60, 60, 255))
    d.text((x + 7, y - 6), name, fill=(255, 255, 255, 255))
prev.convert("RGB").save(os.path.join(PREV, f"{PID}.png"))
print("wrote", len(sprites), "sprites,", ROOM_OUT)
