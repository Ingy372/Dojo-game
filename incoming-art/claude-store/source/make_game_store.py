"""The Street Smarts store as game art (Nov 24). Post-processes the group renders of build_store.py into ../sprites/
(the room's four full-frame layers, the cropped y-sorted pieces, static.json) and writes the room file the game reads
(content/street-smarts/store-room.json: the named spots the cut scene uses, in tiles, and who plays whom).
    python make_game_store.py <groups-dir>"""
import os, sys, json, math
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "sprites")
ROOM_OUT = os.path.join(HERE, "..", "..", "..", "content", "street-smarts", "store-room.json")
SRC = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
F = json.load(open(os.path.join(SRC, "frame.json")))
PPT = F["ppt"]; OX, OY = F["originX"], F["originY"]; COS = math.cos(math.radians(35))
P = lambda c, r, z=0.0: (OX + c * PPT, OY + r * PPT - z * PPT * COS)

LAYERS = ["floor", "walls", "props", "foreground"]
# id -> (anchor tile, footprint [x0, x1, r0, r1], sortRow, note)
SPR = {
    "island-a": ((3.6, 3.8), (1.0, 6.2, 3.2, 3.8), 3.8, "aisle shelves, back row west (aisle sign 1)."),
    "island-b": ((10.3, 3.8), (8.2, 12.4, 3.2, 3.8), 3.8, "aisle shelves, back row east (aisle sign 2)."),
    "island-c": ((2.2, 5.3), (1.0, 3.4, 4.7, 5.3), 5.3, "aisle shelves, front row, lower (aisle sign 3)."),
    "island-d": ((5.1, 5.3), (4.0, 6.2, 4.7, 5.3), 5.3, "aisle shelves, front row, lower (aisle sign 4)."),
    "display": ((5.0, 6.65), (4.25, 6.32, 5.95, 6.65), 6.65, "the little display the worker stocks, with a box of stock."),
    "counter": ((11.2, 6.75), (9.55, 12.85, 5.95, 6.75), 6.75, "the checkout counter with the register."),
    "boxes": ((1.3, 8.3), (0.4, 2.2, 7.4, 8.3), 8.3, "a stack of boxes (the hiding spot)."),
    "carts": ((14.9, 6.95), (14.2, 15.45, 5.8, 6.95), 6.95, "shopping carts by the door."),
}


def load(g):
    return Image.open(os.path.join(SRC, g + ".png")).convert("RGBA")


def bbox(im, pad=2):
    b = im.getchannel("A").getbbox()
    return (max(0, b[0] - pad), max(0, b[1] - pad), min(im.width, b[2] + pad), min(im.height, b[3] + pad))


sprites = {}
full = load("floor").size
for L in LAYERS:
    load(L).save(os.path.join(OUT, f"street-store-room_{L}.png"), optimize=True)
sprites["street-store-room"] = {
    "size": list(full), "layers": LAYERS, "files": {L: f"street-store-room_{L}.png" for L in LAYERS},
    "anchorPx": [OX, OY], "anchorNote": "the frame pixel of grid tile (0,0)'s top-left corner", "place": "room",
    "note": "The Street Smarts store (Nov 24). Draw floor, walls, props; then the y-sorted pieces and people by sortRow; then foreground (the front wall) above everyone."}
for sid, ((ac, ar), fp, srow, note) in SPR.items():
    im = load(sid); b = bbox(im); crop = im.crop(b)
    fn = f"{sid}_{sid}.png"; crop.save(os.path.join(OUT, fn), optimize=True)
    px, py = P(ac, ar)
    sprites[sid] = {"size": list(crop.size), "layers": [sid], "files": {sid: fn}, "anchorPx": [round(px - b[0], 1), round(py - b[1], 1)],
                    "anchorTile": [ac, ar], "footprintRect": list(fp), "place": "prop", "sortRow": srow, "note": note}
json.dump({"pixelsPerTile": PPT, "camera": "orthographic, 35 deg down, looking north", "sprites": sprites}, open(os.path.join(OUT, "static.json"), "w"), indent=1)

room = {
    "notes": "The store for the Street Smarts lesson 'Lost in the store' (Nov 24). Written by incoming-art/claude-store/source/make_game_store.py. marks: named spots in tiles [x, y] (or [x, y, height] for a spot up on a wall) that the scenario's stage cues use. cast: the art pack for each person; the grown-up is Mom or Dad by the player's pick.",
    "id": "store",
    "pack": "street-store",
    "roomSprite": "street-store-room",
    "pixelsPerTile": PPT,
    "size": [16, 10],
    "start": ["enter-player", "toy-player", "hide-spot"],
    "cast": {"worker": "people-worker", "cashier": "people-cashier", "stranger": "people-stranger", "shopper": "people-shopper",
             "grownup": {"Mom": "people-mom", "Dad": "people-dad"}},
    "marks": {
        "enter-player": [13.6, 8.1], "enter-grownup": [14.5, 8.1],
        "east-aisle": [13.2, 2.4], "east-aisle-grownup": [13.9, 2.3],
        "toy-player": [2.8, 2.35], "toy-grownup": [4.4, 2.3], "grownup-away": [13.4, 2.4],
        "middle-aisle-back": [7.2, 2.4], "middle-aisle-front": [7.2, 5.7], "front-player": [8.2, 7.0],
        "worker": [6.75, 6.4], "cashier": [11.0, 5.55], "stranger": [3.7, 4.3], "hide-spot": [1.3, 7.9],
        "meet-worker": [7.25, 7.0], "door-in": [14.0, 8.0], "door-out": [14.0, 9.9],
        "shopper-talk": [9.45, 7.3], "hug-grownup": [8.95, 7.05], "speaker": [8.5, 1.0, 2.15],
    },
}
json.dump(room, open(ROOM_OUT, "w", newline="\n"), indent=1)
print("wrote", len(sprites), "sprites and", ROOM_OUT)
