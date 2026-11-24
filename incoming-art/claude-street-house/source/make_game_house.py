"""The Street Smarts House as game art. Post-processes the group renders of build_street_house.py into ../sprites/
(the room's four full-frame layers, the cropped y-sorted pieces, static.json) and writes the room file the game reads
(content/dojo/street-house/room.json: walk grid, door, spawn, the spots to walk up to).
    python make_game_house.py <groups-dir>"""
import os, sys, json, math
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "sprites")
ROOM_OUT = os.path.join(HERE, "..", "..", "..", "content", "dojo", "street-house", "room.json")
SRC = sys.argv[1]
os.makedirs(OUT, exist_ok=True); os.makedirs(os.path.dirname(ROOM_OUT), exist_ok=True)
F = json.load(open(os.path.join(SRC, "frame.json")))
PPT = F["ppt"]; OX, OY = F["originX"], F["originY"]; COS = math.cos(math.radians(35))
P = lambda c, r, z=0.0: (OX + c * PPT, OY + r * PPT - z * PPT * COS)

LAYERS = ["floor", "walls", "props", "foreground"]
# id -> (anchor tile, footprint [x0, x1, r0, r1], sortRow, note)
SPR = {
    "desk": ((3.3, 3.0), (1.95, 4.65, 2.3, 3.0), 3.0, "Michael's desk in front of the story board, with books and a lamp."),
    "bench-a": ((4.85, 7.2), (3.6, 6.1, 6.75, 7.2), 7.2, "bench facing the story board (west)."),
    "bench-b": ((8.15, 7.2), (6.9, 9.4, 6.75, 7.2), 7.2, "bench facing the story board (east)."),
    "bookshelf": ((12.2, 4.6), (11.6, 12.85, 3.0, 4.6), 4.6, "bookshelf against the east wall."),
    "plant-a": ((0.7, 8.55), (0.44, 0.96, 8.05, 8.55), 8.55, "potted plant, front west corner."),
    "plant-b": ((12.3, 8.55), (12.04, 12.56, 8.05, 8.55), 8.55, "potted plant, front east corner."),
}


def load(g):
    return Image.open(os.path.join(SRC, g + ".png")).convert("RGBA")


def bbox(im, pad=2):
    b = im.getchannel("A").getbbox()
    return (max(0, b[0] - pad), max(0, b[1] - pad), min(im.width, b[2] + pad), min(im.height, b[3] + pad))


sprites = {}
full = load("floor").size
for L in LAYERS:
    load(L).save(os.path.join(OUT, f"street-house-room_{L}.png"), optimize=True)
sprites["street-house-room"] = {
    "size": list(full), "layers": LAYERS, "files": {L: f"street-house-room_{L}.png" for L in LAYERS},
    "anchorPx": [OX, OY], "anchorNote": "the frame pixel of grid tile (0,0)'s top-left corner", "place": "room",
    "note": "The Street Smarts House (Nov 23). Draw floor, walls, props; then the y-sorted pieces and characters by sortRow; then foreground (the front wall) above everyone."}
for sid, ((ac, ar), fp, srow, note) in SPR.items():
    im = load(sid); b = bbox(im); crop = im.crop(b)
    fn = f"{sid}_{sid}.png"; crop.save(os.path.join(OUT, fn), optimize=True)
    px, py = P(ac, ar)
    sprites[sid] = {"size": list(crop.size), "layers": [sid], "files": {sid: fn}, "anchorPx": [round(px - b[0], 1), round(py - b[1], 1)],
                    "anchorTile": [ac, ar], "footprintRect": list(fp), "place": "prop", "sortRow": srow, "note": note}
json.dump({"pixelsPerTile": PPT, "camera": "orthographic, 35 deg down, looking north", "sprites": sprites}, open(os.path.join(OUT, "static.json"), "w"), indent=1)

# ---------------- the walk grid: 13 x 10. Row 0 the back wall, row 9 the front wall with the door (cells 5-7).
W, H = 13, 10
grid = [["." for _ in range(W)] for _ in range(H)]
grid[0] = ["#"] * W
grid[9] = ["#"] * W
for c in (5, 6, 7):
    grid[9][c] = "D"
def block(cells):
    for c, r in cells:
        grid[r][c] = "P"
block([(c, 2) for c in range(1, 5)])          # the desk
block([(c, 1) for c in range(2, 5)])          # behind the desk, where Michael stands
block([(c, 6) for c in range(3, 10)])         # the benches
block([(c, r) for c in (11, 12) for r in (3, 4)])   # the bookshelf
block([(0, 8), (12, 8)])                      # the plants
tiles = ["".join(r) for r in grid]
room = {
    "id": "street-house", "name": "Street Smarts House", "pixelsPerTile": PPT, "gridSize": [W, H],
    "tileLegend": {"#": "wall", "P": "blocked prop", ".": "floor", "D": "front door (exit)"}, "walkableChars": ".D", "tiles": tiles,
    "spawn": {"enter": [6, 8]}, "exit": {"cells": [[5, 9], [6, 9], [7, 9]], "rect": [5.1, 7.9, 9.3, 10.0], "to": "town"},
    "interactables": [
        {"id": "story-board", "kind": "lessons", "footprintRect": [1.95, 4.65, 2.3, 3.0], "approachTile": [3, 3], "approachFacing": "north"},
        {"id": "safety-poster", "kind": "tips", "footprintRect": [5.95, 7.35, 0.8, 1.0], "approachTile": [6, 1], "approachFacing": "north"},
        {"id": "badge-wall", "kind": "badges", "footprintRect": [7.9, 12.1, 0.8, 1.0], "approachTile": [10, 1], "approachFacing": "north"},
    ],
    "foregroundSprites": [],
    "michael": [3.3, 1.75],
}
json.dump(room, open(ROOM_OUT, "w"), indent=1)
print("wrote", len(sprites), "sprites and", ROOM_OUT)
