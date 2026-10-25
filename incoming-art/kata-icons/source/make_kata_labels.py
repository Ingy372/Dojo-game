"""Kata icon labels (Jay's feedback on #227): label table, labeled preview sheet, optional icon+label PNGs, choke-break close-up.
Names come from drafts/content/katas/moves.json (Content Designer, read only). ALL names are placeholders pending the
Content Designer; '!' = also missing or long (> 16 characters).
    python3 incoming-art/kata-icons/source/make_kata_labels.py"""
import os, json
from PIL import Image, ImageDraw, ImageFont
H = os.path.dirname(os.path.abspath(__file__)); SP = os.path.join(H, "..", "sprites"); OUT = os.path.join(H, "..", "preview")
ROOT = os.path.join(H, "..", "..", "..")
MOVES = json.load(open(os.path.join(ROOT, "drafts", "content", "katas", "moves.json")))["moves"]
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"   # preview font only; the game draws its own text
J = json.load(open(os.path.join(SP, "static.json")))["sprites"]
icons = [k for k in J if "-dir-" not in k]
JAY = {"kata-block-double-knife-hand": "Knife-hand block", "kata-kiai": "Kiai!"}  # DECIDED (Jay, Oct 25)
rows = []
for k in icons:
    mid = k[len("kata-"):]
    src = next((m for m in MOVES if m.replace(".", "-") == mid), None)
    if k in JAY: rows.append((k, src, JAY[k], "")); continue
    if src is None: rows.append((k, None, "Kiai!" if mid == "kiai" else mid, "missing from moves.json"))
    elif len(MOVES[src]) > 16: rows.append((k, src, MOVES[src], "long (%d chars)" % len(MOVES[src])))
    else: rows.append((k, src, MOVES[src], ""))
json.dump({"_note": "Names from drafts/content/katas/moves.json (placeholders pending the Content Designer), except Knife-hand block and Kiai! (DECIDED by Jay, Oct 25). The game draws the label as text under the icon.",
           "labels": {k: {"moveId": s, "name": n, "flag": f} for k, s, n, f in rows}}, open(os.path.join(SP, "labels.json"), "w"), indent=2)
BG = (47, 42, 61, 255)
def tile(k, name, flag, sz, fs):
    t = Image.new("RGBA", (sz + 40, sz + fs * 2 + 18), (0, 0, 0, 0)); d = ImageDraw.Draw(t); f = ImageFont.truetype(FONT, fs)
    t.alpha_composite(Image.open(os.path.join(SP, k + ".png")).convert("RGBA").resize((sz, sz), Image.LANCZOS), (20, 0))
    words = name.split(); lines = [name]
    if d.textlength(name, font=f) > sz + 36 and len(words) > 1:
        cut = max(range(1, len(words)), key=lambda i: -abs(d.textlength(" ".join(words[:i]), font=f) - d.textlength(" ".join(words[i:]), font=f)))
        lines = [" ".join(words[:cut]), " ".join(words[cut:])]
    for i, l in enumerate(lines):
        d.text(((sz + 40) / 2, sz + 4 + i * (fs + 2)), l, font=f, fill=(255, 205, 120, 255) if flag else (246, 239, 220, 255), anchor="ma", stroke_width=2, stroke_fill=(30, 26, 40, 255))
    return t
cols, sz = 7, 96; tiles = [tile(k, n, f, sz, 14) for k, s, n, f in rows]; tw, th = tiles[0].size
sh = Image.new("RGBA", (cols * tw + 20, ((len(tiles) + cols - 1) // cols) * th + 60), BG); d = ImageDraw.Draw(sh)
for i, t in enumerate(tiles): sh.alpha_composite(t, (10 + i % cols * tw, 40 + i // cols * th))
d.text((12, 10), "Labels from moves.json (Knife-hand block, Kiai!: decided by Jay). Game draws them as text.",
       font=ImageFont.truetype(FONT, 13), fill=(255, 220, 120, 255))
sh.save(os.path.join(OUT, "sheet-labeled.png"))
os.makedirs(os.path.join(SP, "labeled"), exist_ok=True)       # optional icon+label PNGs (preview font), not the main path
for k, s, n, f in rows: tile(k, n, "", 128, 18).save(os.path.join(SP, "labeled", k + "-labeled.png"))
# choke-break close-up: 512, 128 and 40 px (+ 40 px zoomed 4x) with its label
k = "kata-break-double-choke"; ic = Image.open(os.path.join(SP, k + ".png")).convert("RGBA")
cu = Image.new("RGBA", (512 + 128 + 160 + 80, 600), BG); d = ImageDraw.Draw(cu); f = ImageFont.truetype(FONT, 18)
cu.alpha_composite(ic.resize((512, 512), Image.LANCZOS), (20, 20)); cu.alpha_composite(ic, (552, 20))
small = ic.resize((40, 40), Image.LANCZOS); cu.alpha_composite(small, (552, 190)); cu.alpha_composite(small.resize((160, 160), Image.NEAREST), (552, 250))
for x, y, t in ((20, 545, "Choke break (placeholder name)  -  512 px"), (552, 150, "128 px"), (600, 200, "40 px"), (552, 420, "40 px, 4x zoom")):
    d.text((x, y), t, font=f, fill=(246, 239, 220, 255))
cu.save(os.path.join(OUT, "choke-break-closeup.png"))
for r in rows: print(r)
