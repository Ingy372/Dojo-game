"""
Assemble every Green-to-Black room from the kit and the room data.

Layouts come only from drafts/content/rooms/*.json. Props come only from
each room's artProps line. Nothing here is imported into the game.

    python3 incoming-art/belt-rooms-g2b40-42/source/compose_rooms.py
"""
import json, os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
KIT = os.path.join(ROOT, "kit")
ROOMS = os.path.join(ROOT, "rooms")
PREVIEW = os.path.join(ROOT, "preview")
DATA = os.path.join(REPO, "drafts", "content", "rooms")
T = 80
ROOM_TOP = 1.2
SETS = [
    "giants-steps", "quiet-river", "forge-of-courage", "hall-of-echoes",
    "root-library", "storm-stair", "summit",
]

# Words in the room's own art line, and the kit piece they use.
# Pieces that are not in a room's line are not placed there.
WORDS = {
    "green": [
        ("jar", "green-jar"), ("blanket", "green-blanket"), ("lantern", "green-lantern"),
        ("fern", "green-fern"), ("grass", "green-fern"), ("stair", "green-stair"),
        ("step", "green-stone"), ("stone", "green-stone"), ("cairn", "green-stone"),
        ("ridge", "green-stair"), ("shelf", "green-stair"), ("road", "green-stone"),
        ("wheel", "green-stone"), ("gravel", "green-stone"),
    ],
    "blue": [
        ("reed", "blue-reed"), ("lily", "blue-lily"), ("ripple", "blue-ripple"),
        ("boat", "blue-boat"), ("oar", "blue-oar"), ("lantern", "blue-lantern"),
        ("cushion", "blue-cushion"), ("stone", "blue-stone"), ("shell", "blue-lily"),
        ("dock", "blue-boat"), ("pier", "blue-stone"), ("pool", "blue-ripple"),
    ],
    "red": [
        ("bellows", "red-bellows"), ("coal", "red-bin"), ("ember", "red-ember"),
        ("anvil", "red-anvil"), ("hammer", "red-tool"), ("rack", "red-tool"),
        ("bucket", "red-barrel"), ("water", "red-trough"), ("bench", "red-bench"),
        ("broom", "red-bench"), ("cushion", "red-cushion"), ("kettle", "red-barrel"),
        ("forge", "red-ember"), ("shield", "red-tool"), ("clock", "red-tool"),
    ],
    "redblack": [
        ("mirror", "redblack-mirror"), ("bell", "redblack-bell"), ("arch", "redblack-arch"),
        ("gate", "redblack-arch"), ("lamp", "redblack-lantern"), ("candle", "redblack-lantern"),
        ("rug", "redblack-rug"), ("cushion", "redblack-cushion"), ("ring", "redblack-ring"),
        ("ear", "redblack-arch"), ("frame", "redblack-mirror"), ("mask", "redblack-mirror"),
    ],
    "brown": [
        ("shelf", "brown-shelf"), ("book", "brown-shelf"), ("root", "brown-root"),
        ("page", "brown-rug"), ("ink", "brown-ink"), ("quill", "brown-ink"),
        ("lamp", "brown-lamp"), ("cushion", "brown-cushion"), ("armchair", "brown-seat"),
        ("rug", "brown-rug"),
    ],
    "brownblack": [
        ("puddle", "brownblack-puddle"), ("umbrella", "brownblack-umbrella"),
        ("drum", "brownblack-drum"), ("feather", "brownblack-feather"),
        ("rod", "brownblack-rod"), ("gate", "brownblack-rod"),
        ("cushion", "brownblack-cushion"), ("lamp", "brownblack-lantern"),
        ("flag", "brownblack-umbrella"), ("ribbon", "brownblack-feather"),
        ("leaf", "brownblack-feather"),
    ],
    "black": [
        ("statue", "black-statue"), ("lantern", "black-lantern"), ("light", "black-wisp"),
        ("wisp", "black-wisp"), ("glow", "black-wisp"), ("arch", "black-arch"),
        ("bell", "black-bell"), ("lamp", "black-lantern"), ("cushion", "black-cushion"),
        ("sash", "black-sash"), ("trunk", "black-chest"), ("grass", "black-wisp"),
    ],
}

# Roots only sit on the side-wall edge. Ember pools stay off the middle.
EDGE_ONLY = {"brown-root", "green-shade"}
FLAT = {
    "red-ember", "blue-lily", "blue-ripple", "redblack-ring", "brown-rug",
    "brownblack-puddle", "black-wisp", "green-stone", "green-fern", "green-stream",
    "blue-stone",
}
# The approved look of a whole tier, added at the edges on top of that room's own props.
TIER_LOOK = {
    "green": ["green-stone", "green-fern", "green-stream"],
    "red": ["red-ember"],
    "brown": ["brown-root"],
}


def load_kit():
    meta = json.load(open(os.path.join(KIT, "static.json")))
    images = {}
    for name, spec in meta["sprites"].items():
        fn = spec["files"][spec["layers"][0]]
        images[name] = Image.open(os.path.join(KIT, fn)).convert("RGBA")
    return meta["sprites"], images


def player_sprite():
    d = os.path.join(REPO, "incoming-art", "player-character", "sprites")
    J = json.load(open(os.path.join(d, "player.json")))
    fw, fh = J["frameWidth"], J["frameHeight"]
    row = J["directions"].index("S")
    im = Image.new("RGBA", (fw, fh))
    tint = {"gi": "#ffffff", "belt": "#f08a2a", "belt-rim": "#f08a2a"}
    for layer in ("body", "gi", "belt", "belt-rim"):
        fr = Image.open(os.path.join(d, f"player_{layer}_idle.png")).convert("RGBA").crop((0, row * fh, fw, (row + 1) * fh))
        if layer in tint:
            r, g, b = (int(tint[layer][i:i + 2], 16) for i in (1, 3, 5))
            px = fr.split()
            fr = Image.merge("RGBA", (
                px[0].point(lambda v, r=r: v * r // 255),
                px[1].point(lambda v, g=g: v * g // 255),
                px[2].point(lambda v, b=b: v * b // 255),
                px[3],
            ))
        im.alpha_composite(fr)
    return im, (J["anchor"]["x"], J["anchor"]["y"])


def paste(canvas, im, spec, col, row, dx=0):
    ax, ay = spec["anchorPx"]
    x = int(col * T - ax + dx)
    y = int((row + ROOM_TOP) * T - ay)
    canvas.alpha_composite(im, (x, y))

def span(spec):
    g = spec["groundRect"]
    return max(1, int(round(g["col1"] - g["col0"])))


# The approved sample rooms keep every prop from that sample, still off the middle.
ROOM_PACK = {
    "bellows-door": ["red-bellows", "red-anvil", "red-tool", "red-bin", "red-trough", "red-barrel", "red-ember"],
    "reading-nook": ["brown-shelf", "brown-rug", "brown-seat", "brown-cushion", "brown-lamp", "brown-root"],
}

def props_for(theme, text, room_id=""):
    low = text.lower()
    found = []
    for piece in ROOM_PACK.get(room_id, []):
        found.append(piece)
    for piece in TIER_LOOK.get(theme, []):
        if piece not in found:
            found.append(piece)
    for word, piece in WORDS[theme]:
        if word in low and piece not in found:
            found.append(piece)
    if theme == "red" and "red-ember" not in found:
        found.append("red-ember")
    # Two bellows, as the Bellows Door line says.
    if "red-bellows" in found:
        found.insert(found.index("red-bellows") + 1, "red-bellows")
    return found


def slots(tiles, kind, n):
    H, W = len(tiles), len(tiles[0])
    out = []
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if tiles[y][x] != ".":
                continue
            if y < 2 or y > H - 3:
                continue
            if abs(x - (W - 1) / 2) < 2.2:
                continue
            if kind == "edge":
                if x not in (1, 2, W - 3, W - 2):
                    continue
            elif x not in (2, 3, W - 4, W - 3):
                continue
            out.append((x, y))
    if not out:
        return []
    step = max(1, len(out) // n)
    return out[::step][:n]


def theme_of(data):
    return data["tier"].replace("-", "")


def open_cell(tiles, x, y, w=1):
    H, W = len(tiles), len(tiles[0])
    if y < 2 or y > H - 3:
        return False
    for dx in range(w):
        xx = x + dx
        if xx <= 0 or xx >= W - 1 or tiles[y][xx] != ".":
            return False
        if abs(xx - (W - 1) / 2) < 2.0:
            return False
    return True


def side_spots(tiles, w=1):
    H, W = len(tiles), len(tiles[0])
    spots = []
    for y in range(2, H - 2):
        for x in (2, 3, W - 3 - (w - 1), W - 2 - (w - 1)):
            if open_cell(tiles, x, y, w) and (x, y) not in spots:
                spots.append((x, y))
    return spots


def draw_room(data, room, specs, images, fighter):
    theme = theme_of(data)
    tiles = room["tiles"]
    H, W = len(tiles), len(tiles[0])
    canvas = Image.new("RGBA", (W * T, int((H + ROOM_TOP) * T)), (0, 0, 0, 0))
    floor = f"{theme}-floor"
    # Floors first, so every later piece sits on them and nearer rows paint over farther ones.
    for y, row in enumerate(tiles):
        for x, ch in enumerate(row):
            if ch == "#":
                continue
            paste(canvas, images[floor], specs[floor], x, y)
    layers = []
    for y, row in enumerate(tiles):
        for x, ch in enumerate(row):
            if ch == "#" and y == 0:
                layers.append((y, x, f"{theme}-wall", 0))
            elif ch == "#" and x in (0, W - 1):
                layers.append((y, x, f"{theme}-side", int(0.58 * T) if x == W - 1 else 0))
            elif ch == "#":
                layers.append((y, x, f"{theme}-block", 0))
            elif ch == "D":
                layers.append((y, x, f"{theme}-door", 0))
            elif ch == "C":
                layers.append((y, x, f"{theme}-chest", 0))
            elif ch == "S":
                layers.append((y, x, f"{theme}-shrine", 0))
    chosen = props_for(theme, room.get("artProps", ""), room["id"])
    if theme == "green" and "green-stream" not in chosen:
        chosen.append("green-stream")
    used = set()
    # A stream is a run of water tiles on the outer floor, not one speck.
    if "green-stream" in chosen:
        n = 0
        for y in range(2, H - 2):
            x = W - 2
            if tiles[y][x] == "." and n < 4:
                layers.append((y, x, "green-stream", 0))
                used.add((x, y))
                n += 1
        chosen = [p for p in chosen if p != "green-stream"]
    for piece in chosen:
        if piece not in images:
            continue
        w = span(specs[piece])
        copies = 3 if piece in FLAT or piece.endswith(("-stone", "-fern", "-ember", "-root")) else 1
        placed = 0
        pool = side_spots(tiles, w)
        if piece.endswith("-root"):
            pool = [(x, y) for x, y in pool if x in (1, 2, W - 3, W - 2)]
        for cell in pool:
            if any((cell[0] + d, cell[1]) in used for d in range(w)):
                continue
            layers.append((cell[1], cell[0], piece, 0))
            for d in range(w):
                used.add((cell[0] + d, cell[1]))
            placed += 1
            if placed >= copies:
                break
    # Nearer rows last, so a front prop covers the foot of the wall behind it.
    for y, x, piece, dx in sorted(layers, key=lambda t: (t[0], t[1])):
        paste(canvas, images[piece], specs[piece], x, y, dx)
    for y, row in enumerate(tiles):
        if "P" in row:
            x = row.index("P")
            im, (ax, ay) = fighter
            # Same placement as the approved kitchen preview: feet on the cell, sprite not scaled.
            canvas.alpha_composite(im, (int(x * T + T / 2 - ax), int((y + ROOM_TOP + 0.8) * T - ay)))
    return canvas


def danger(im):
    a = np.asarray(im)
    if a.shape[2] != 4:
        return 0
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    return int(((al > 20) & (r > 180) & (g < 70) & (b < 70)).sum())


def sheet(paths, title, out, scale):
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    thumbs = []
    for lab, p in paths:
        im = Image.open(p).convert("RGBA")
        thumbs.append((lab, im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.Resampling.LANCZOS)))
    cols = 2 if len(thumbs) > 4 else len(thumbs)
    rows = (len(thumbs) + cols - 1) // cols
    cw = max(t.width for _, t in thumbs) + 16
    rh = max(t.height for _, t in thumbs) + 36
    canvas = Image.new("RGB", (cols * cw + 16, rows * rh + 48), (20, 18, 28))
    d = ImageDraw.Draw(canvas)
    d.text((12, 12), title, fill=(244, 236, 220), font=font)
    for i, (lab, im) in enumerate(thumbs):
        x = 8 + (i % cols) * cw
        y = 40 + (i // cols) * rh
        bg = Image.new("RGBA", im.size, (20, 18, 28, 255))
        bg.alpha_composite(im)
        canvas.paste(bg.convert("RGB"), (x, y + 20))
        d.text((x, y), lab, fill=(196, 186, 168), font=font)
    canvas.save(out)
    print("sheet", out, canvas.size)


def main():
    os.makedirs(ROOMS, exist_ok=True)
    os.makedirs(PREVIEW, exist_ok=True)
    specs, images = load_kit()
    fighter = player_sprite()
    manifest = []
    reds = {}
    by_set = {s: [] for s in SETS}
    for name in SETS:
        data = json.load(open(os.path.join(DATA, name + ".json")))
        theme = theme_of(data)
        for room in data["rooms"]:
            im = draw_room(data, room, specs, images, fighter)
            path = os.path.join(ROOMS, room["id"] + ".png")
            im.save(path)
            nred = danger(im)
            reds[room["id"]] = nred
            H, W = len(room["tiles"]), len(room["tiles"][0])
            manifest.append({
                "id": room["id"],
                "name": room["name"],
                "set": name,
                "place": data.get("place"),
                "tier": data.get("tier"),
                "kind": room.get("kind"),
                "tiles": [W, H],
                "image": f"rooms/{room['id']}.png",
                "imagePx": [im.width, im.height],
                "pixelsPerTile": T,
                "wallTopTiles": ROOM_TOP,
                "anchor": "top-left of the picture. Tile (0,0) ground starts wallTopTiles below the top.",
                "player": "the approved kitchen fighter, standing on P, at 80 px per tile",
                "gamePixelsPerTile": 48,
                "notForImport": True,
                "artProps": room.get("artProps", ""),
                "dangerRed": nred,
            })
            by_set[name].append((room["id"], path))
            print(room["id"], im.size, "red", nred)
    json.dump({
        "notForImport": True,
        "note": "Green-to-Black room kit export. Ready for the Manager to review. Not imported.",
        "pixelsPerTile": T,
        "gamePixelsPerTile": 48,
        "camera": "orthographic, 35 degrees down, same as the approved samples",
        "rooms": manifest,
    }, open(os.path.join(ROOT, "manifest.json"), "w"), indent=2)
    for name, items in by_set.items():
        sheet(items, name + " at 48 px per tile, with the kitchen fighter", os.path.join(PREVIEW, name + "-48.png"), 48 / 80)
    # Same 80 px per tile on every picture. Seven tiles wide, so the fighter and props match the samples.
    pairs = [
        ("Green", "room-green_room-green.png", "pebble-path"),
        ("Blue", None, "ferry-landing"),
        ("Red", "room-red_room-red.png", "bellows-door"),
        ("Red-Black", None, "whisper-gate"),
        ("Brown", "room-brown_room-brown.png", "reading-nook"),
        ("Brown-Black", None, "rainy-landing"),
        ("Black", None, "summit-steps"),
    ]
    old_root = os.path.join(ROOT, "superseded", "pass-63fb0263", "rooms")
    cells = []
    for i, (lab, sample, rid) in enumerate(pairs):
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
        blocks = []
        new = Image.open(os.path.join(ROOMS, rid + ".png")).convert("RGBA")
        blocks.append(("Now, 80 px per tile", new))
        oldp = os.path.join(old_root, rid + ".png")
        if os.path.exists(oldp):
            blocks.append(("Before, same scale", Image.open(oldp).convert("RGBA")))
        if sample:
            blocks.append(("Approved sample, 80 px per tile", Image.open(os.path.join(ROOT, "sprites", sample)).convert("RGBA")))
        w = max(b.width for _, b in blocks)
        h = sum(b.height + 32 for _, b in blocks) + 16
        page = Image.new("RGB", (w + 24, h), (20, 18, 28))
        d = ImageDraw.Draw(page)
        y = 8
        for title, im in blocks:
            d.text((12, y), lab + " — " + title, fill=(244, 236, 220), font=font)
            bg = Image.new("RGBA", im.size, (20, 18, 28, 255))
            bg.alpha_composite(im)
            page.paste(bg.convert("RGB"), (12, y + 26))
            y += im.height + 32
        page.save(os.path.join(PREVIEW, "closeup-" + lab.lower().replace(" ", "-") + ".png"))
        cells.append((lab, new.crop((0, 0, min(new.width, 7 * T), min(new.height, int((5 + ROOM_TOP) * T))))))
    sheet([(c[0], _save_tmp(c[1], i)) for i, c in enumerate(cells)],
          "Equal scale, 80 px per tile. Before, now, and the approved sample where we have one.",
          os.path.join(PREVIEW, "compare-equal-scale.png"), 1)
    print("danger rooms", {k: v for k, v in reds.items() if v})
    print("rooms", len(manifest))


def _save_tmp(im, i):
    p = os.path.join(PREVIEW, f"_cmp{i}.png")
    im.save(p)
    return p


if __name__ == "__main__":
    main()
