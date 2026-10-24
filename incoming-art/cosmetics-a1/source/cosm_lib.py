"""Shared stacking for the A1 cosmetic previews: the approved player layers (player-custom) + the cosmetic layers,
stacked the way the game will (multiply tint on tinted layers; aura back under everything, aura front on top)."""
import json, os, glob
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ART = os.path.normpath(os.path.join(HERE, "..", ".."))
BG = (0x2f, 0x2a, 0x3d)
def hexrgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)
class Sheets:
    def __init__(self, folder, js=None):
        self.dir = folder; self.c = {}
        self.J = json.load(open(os.path.join(folder, js) if js else sorted(glob.glob(os.path.join(folder, "player-*.json")))[0]))
    def frame(self, layer, anim, d, f):
        a = self.J["animations"].get(anim, {}); fn = a.get("sheets", {}).get(layer)
        if not fn: return None
        if fn not in self.c: self.c[fn] = np.asarray(Image.open(os.path.join(self.dir, fn)).convert("RGBA"), dtype=np.float32) / 255
        FW, FH = self.J["frameWidth"], self.J["frameHeight"]; r = self.J["directions"].index(d)
        return self.c[fn][r * FH:(r + 1) * FH, f * FW:(f + 1) * FW]
BASE = Sheets(os.path.join(ART, "player-custom", "sprites", "body-a"))
FW, FH = BASE.J["frameWidth"], BASE.J["frameHeight"]
def over(out, px):
    a = px[..., 3:4]; out[..., :3] = px[..., :3] * a + out[..., :3] * (1 - a); out[..., 3:4] = a + out[..., 3:4] * (1 - a)
def compose(ch, anim, d, f, cos=None, extra=(), aura=None):
    """ch: skin, hair, gi, face, hairStyle, belt. extra: [(layer, tint hex or None)] from `cos` (a Sheets).
    aura: (Sheets, tint hex, frame) or None"""
    out = np.zeros((FH, FW, 4), dtype=np.float32)
    if aura:
        px = aura[0].frame("aura-back", anim, d, aura[2]).copy(); px[..., :3] *= hexrgb(aura[1]); over(out, px)
    belt = BASE.J["beltStyles"][ch.get("belt", "White")]
    tints = {"skin": ch["skin"], "gi": ch["gi"], ch["hairStyle"]: ch["hair"], **belt}
    for L in sorted(BASE.J["layers"], key=lambda l: l["order"]):
        n = L["name"]
        if L.get("group") and n not in (ch["face"], ch["hairStyle"]): continue
        if n.startswith("belt") and n != "belt" and n not in belt: continue
        if n.startswith("prop-"): continue
        px = BASE.frame(n, anim, d, f)
        if px is None: continue
        px = px.copy()
        if L["tint"] and n in tints: px[..., :3] *= hexrgb(tints[n])
        over(out, px)
    for n, t in extra:
        px = cos.frame(n, anim, d, f).copy()
        if t: px[..., :3] *= hexrgb(t)
        over(out, px)
    if aura:
        px = aura[0].frame("aura-front", anim, d, aura[2])
        if px is not None: px = px.copy(); px[..., :3] *= hexrgb(aura[1]); over(out, px)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGBA")
def on_bg(im, scale=1, bg=BG):
    b = Image.new("RGBA", im.size, bg + (255,)); b.alpha_composite(im)
    return b.resize((im.width * scale, im.height * scale), Image.NEAREST) if scale != 1 else b
