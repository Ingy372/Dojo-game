"""
Dojo Ascent - previews for static sprites (render_static.py output) (Art Director bot).

    python3 make_static_preview.py --sprites <folder> --out <folder> [--gallery gallery.png]
        [--scene room --place "training-mat@7,4;weapon-rack@2,2;dojo-banner@5,1" --scene-out room.png]
        [--player <player sprites folder>@col,row]
gallery: every sprite (all its layers stacked, sheets split into frames) at 1x on the floor colour, labelled.
scene: the scene sprite (e.g. the room) with sprites placed at grid cells (1-based column,row, top-left of
the footprint, like content/dojo), sorted by their bottom row; wall-front layers are drawn last.
Needs Python 3 with Pillow.
"""
import argparse, json, os
from PIL import Image, ImageDraw

FLOOR = (47, 42, 61, 255)

def layers_img(folder, e, frame=0):
    out = None
    for ln in e["layers"]:
        im = Image.open(os.path.join(folder, e["files"][ln])).convert("RGBA")
        if "frames" in e:
            fw = e["frameWidth"]; im = im.crop((frame * fw, 0, (frame + 1) * fw, im.height))
        out = im if out is None else Image.alpha_composite(out, im)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sprites", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--gallery", default=""); ap.add_argument("--scene", default=""); ap.add_argument("--place", default="")
    ap.add_argument("--scene-out", default=""); ap.add_argument("--only", default=""); ap.add_argument("--scale", type=int, default=1)
    ap.add_argument("--frame", default="", help="name=frame;... which frame of a sheet to place in the scene")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    meta = json.load(open(os.path.join(a.sprites, "static.json"))); S = meta["sprites"]; ppt = meta["pixelsPerTile"]
    if a.gallery:
        names = [n for n in S if (not a.only or n in a.only.split(",")) and n != a.scene]
        cells = []
        for n in names:
            e = S[n]
            for f in range(e.get("frames", 1)):
                cells.append((f"{n}" + (f" [{f}]" if e.get("frames", 1) > 1 else ""), layers_img(a.sprites, e, f)))
        cw = max(c[1].width for c in cells) + 16; ch = max(c[1].height for c in cells) + 28
        per = max(1, 1400 // cw); rows = (len(cells) + per - 1) // per
        g = Image.new("RGBA", (per * cw, rows * ch), (24, 22, 32, 255)); d = ImageDraw.Draw(g)
        for k, (lab, im) in enumerate(cells):
            x, y = (k % per) * cw, (k // per) * ch
            bg = Image.new("RGBA", (cw - 8, ch - 24), FLOOR); g.paste(bg, (x + 4, y + 20))
            g.alpha_composite(im, (x + 4 + (cw - 8 - im.width) // 2, y + 20 + (ch - 24 - im.height) // 2))
            d.text((x + 6, y + 4), lab, fill=(255, 220, 120, 255))
        g = g.resize((g.width * a.scale, g.height * a.scale), Image.NEAREST)
        g.save(os.path.join(a.out, a.gallery)); print("wrote", a.gallery)
    if a.scene:
        e = S[a.scene]; files = e["files"]
        ax, ay = e["anchorPx"]                      # the grid's (0,0) corner in the room image
        base = Image.new("RGBA", tuple(e["size"]), FLOOR)
        fronts = [l for l in e["layers"] if "front" in l]
        for ln in e["layers"]:
            if ln not in fronts: base.alpha_composite(Image.open(os.path.join(a.sprites, files[ln])).convert("RGBA"))
        frames = dict(kv.split("=") for kv in a.frame.split(";") if kv)
        items = []
        for spec in [s for s in a.place.split(";") if s]:
            n, pos = spec.split("@"); c, r = [float(v) for v in pos.split(",")]
            ei = S[n]; fw, fh = ei["footprint"] if "footprint" in ei else (1, 1)
            c0, r0 = c - 1, r - 1                   # 1-based cell -> grid corner
            if ei.get("place") == "wall":
                gx, gy = c0 + fw / 2, 1.0
            elif ei["anchorPx"][1] < ei["size"][1] - 1:     # centred spots (mess)
                gx, gy = c0 + 0.5, r0 + 0.5
            else:
                gx, gy = c0 + fw / 2, r0 + fh
            items.append((gy, n, gx, int(frames.get(n, 0))))
        for gy, n, gx, f in sorted(items, key=lambda t: (S[t[1]].get("place") != "wall", t[0])):
            ei = S[n]; im = layers_img(a.sprites, ei, f)
            px, py = ax + gx * ppt - ei["anchorPx"][0], ay + gy * ppt - ei["anchorPx"][1]
            base.alpha_composite(im, (int(round(px)), int(round(py))))
        for ln in fronts:
            base.alpha_composite(Image.open(os.path.join(a.sprites, files[ln])).convert("RGBA"))
        base = base.resize((base.width * a.scale, base.height * a.scale), Image.NEAREST)
        base.save(os.path.join(a.out, a.scene_out or f"{a.scene}.png")); print("wrote", a.scene_out)

main()
