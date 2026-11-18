"""
Before / after preview of the Home Dojo v2 (Claude Code, Nov 18).

    python incoming-art/claude-dojo-v2/source/make_preview.py

Left: the approved room (incoming-art/home-dojo) with the starter decorations. Right: the v2 floor with the
same decorations and the new training station at columns 2-3, rows 5-6 (1-based). 80 px per tile.
"""
import json, os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(HERE, "..", "..")
OLD = os.path.join(ART, "home-dojo", "sprites")
NEW = os.path.join(HERE, "..", "sprites")
OUT = os.path.join(HERE, "..", "preview")
PPT = 80


def load(folder):
    return json.load(open(os.path.join(folder, "static.json"), encoding="utf-8"))


def entry(meta, name):
    for k, v in meta.items():
        if k == name:
            return v
    for v in meta.get("sprites", {}).values() if isinstance(meta.get("sprites"), dict) else []:
        pass
    raise KeyError(name)


def find(meta, name):
    # static.json layouts differ a little between batches: look for the target by name anywhere.
    stack = [meta]
    while stack:
        m = stack.pop()
        if isinstance(m, dict):
            if m.get("name") == name or name in m and isinstance(m[name], dict) and "anchorPx" in m[name]:
                return m if m.get("name") == name else m[name]
            stack.extend(m.values())
        elif isinstance(m, list):
            stack.extend(m)
    raise KeyError(name)


def paste(canvas, folder, meta, name, layer, col, row, origin):
    t = find(meta, name)
    img = Image.open(os.path.join(folder, f"{name}_{layer}.png")).convert("RGBA")
    ax, ay = t["anchorPx"]
    x = int(origin[0] + col * PPT - ax)
    y = int(origin[1] + row * PPT - ay)
    canvas.alpha_composite(img, (x, y))


def room(folder, meta, deco_meta, deco_folder, with_station):
    t = find(meta, "room")
    w, h = t["size"]
    ax, ay = t["anchorPx"]
    canvas = Image.new("RGBA", (w, h), (20, 18, 28, 255))
    origin = (ax, ay)
    paste(canvas, folder, meta, "room", "floor", 0, 0, origin)
    paste(canvas, folder, meta, "room", "notice-board", 0, 0, origin)
    # starter decorations (anchor = bottom-centre of the footprint): mat at (6,3) 2x2, rack at (1,1) 2x1, banner wall col 4
    paste(canvas, deco_folder, deco_meta, "training-mat", "training-mat", 6 + 1, 3 + 2, origin)
    paste(canvas, deco_folder, deco_meta, "weapon-rack", "weapon-rack", 1 + 1, 1 + 1, origin)
    paste(canvas, deco_folder, deco_meta, "dojo-banner", "dojo-banner", 4 + 0.5, 1, origin)
    if with_station:
        paste(canvas, NEW, load(NEW), "training-station", "training-station", 1 + 1, 4 + 2, origin)
    paste(canvas, folder, meta, "room", "wall-front", 0, 0, origin)
    return canvas


def main():
    os.makedirs(OUT, exist_ok=True)
    old_meta, new_meta = load(OLD), load(NEW)
    before = room(OLD, old_meta, old_meta, OLD, False)
    after = room(NEW, new_meta, old_meta, OLD, True)
    gap = 40
    both = Image.new("RGBA", (before.width + after.width + gap, max(before.height, after.height) + 60), (20, 18, 28, 255))
    both.alpha_composite(before, (0, 60))
    both.alpha_composite(after, (before.width + gap, 60))
    d = ImageDraw.Draw(both)
    d.text((20, 20), "BEFORE (approved Batch 3)", fill=(242, 233, 216, 255))
    d.text((before.width + gap + 20, 20), "AFTER (v2: tatami floor + training station) - draft for Jay", fill=(255, 209, 102, 255))
    both.convert("RGB").save(os.path.join(OUT, "dojo-v2-before-after.png"))
    after.convert("RGB").save(os.path.join(OUT, "dojo-v2-room.png"))
    st = Image.open(os.path.join(NEW, "training-station_training-station.png")).convert("RGBA")
    big = Image.new("RGBA", (st.width * 2, st.height * 2), (40, 34, 52, 255))
    big.alpha_composite(st.resize((st.width * 2, st.height * 2), Image.LANCZOS))
    big.convert("RGB").save(os.path.join(OUT, "training-station-2x.png"))
    print("wrote previews to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
