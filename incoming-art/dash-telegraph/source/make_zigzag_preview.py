"""
Dojo Ascent - Zap Kite zig-zag lane preview (the #438 follow-up). Run from the repo root after build_dash_telegraph.py.
Draws the baked dash-zigzag layers on the tower floor at the game's TILE = 48, at the 667x375 phone size, with the Zap Kite
wind-up (purple tell), the '!!', the player and a Brute with its red circle for contrast.
Writes preview/zigzag_scene_667x375.png (motion on, the settled frame), zigzag_scene_667x375_motion-off.png (Reduced motion:
no fade, no scroll, steady), zigzag_scene_667x375_grey.png and zigzag_anim.gif (the suggested fade, scroll and pulse).
Needs Python 3 with Pillow and numpy.
"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, os.path.dirname(__file__)); import make_dash_preview as D
sys.path.insert(0, os.path.join("incoming-art", "bestiary-brown-black", "source")); import make_bb_lineup as BB
B, T = D.B, D.T; W, H = 667, 375

def zigzag_decal(angle_deg, phase=0.0, alpha=1.0):
    """the baked layers (glow, fill, edge) rotated to the aim angle (screen degrees, 0 = east, clockwise = down)."""
    s = D.stripe_layers("zigzag", phase=phase, alpha=alpha)
    return s.rotate(-angle_deg, resample=Image.BICUBIC, expand=True)

def scene(phase=0.0, alpha=1.0, progress=0.7, windup_frame=-1):
    cols, rows = math.ceil(W / T), math.ceil(H / T); img = Image.new("RGBA", (cols * T, rows * T))
    fl = D.sc(D.L(os.path.join("..", "..", "tower-rooms", "sprites", "floor-big_floor-big.png")), T / 80)
    for y in range(rows):
        for x in range(cols): img.alpha_composite(fl, (x * T, y * T))
    f = BB.sprdir("zap-kite"); m = BB.meta(f); pl, pa = BB.player("W"); pl_s, pa_s = BB.player("N"); bang = D.sc(D.L("dash-bang.png"), D.K * 1.2)
    def kite_lane(kx, ky, angle, tag):          # kite at the lane's start; lane centre half its length along the aim
        L = 5.0; ax, ay = math.cos(math.radians(angle)), math.sin(math.radians(angle)); cx, cy = kx + ax * L / 2, ky + ay * L / 2
        dec = zigzag_decal(angle, phase, alpha); img.alpha_composite(dec, (round(cx * T - dec.width / 2), round(cy * T - dec.height / 2)))
        D.place(img, BB.frame(f, m, "windup", "E" if abs(angle) < 45 else "SE", windup_frame, BB.PURPLE), m["anchor"], kx, ky)
        img.alpha_composite(bang, (round(kx * T - bang.width / 2), round((ky - 1.4) * T)))
        ImageDraw.Draw(img).text(((kx + 0.45) * T, (ky - 1.15) * T), tag, fill=(255, 255, 255, 255), font=B.ImageFont.truetype(B.FONT, 11))
    kite_lane(1.6, 2.2, 0, "aimed east")                  # the player stands past the end, to the east: dash across or out
    D.place(img, pl, pa, 8.3, 2.3)
    kite_lane(2.2, 5.0, 25, "aimed 25 deg down")          # rotated lane
    D.place(img, pl, pa, 9.2, 7.0)
    br, ba = D.enemy("brute"); D.red_circle(img, 11.8, 4.3, 0.9, progress); D.place(img, br, ba, 11.8, 3.1)
    ImageDraw.Draw(img).text((10.2 * T, 5.6 * T), "red circle = COUNTER", fill=(255, 255, 255, 255), font=B.ImageFont.truetype(B.FONT, 11))
    return img.crop((0, 0, W, H))

def main():
    PV = B.PV; os.makedirs(PV, exist_ok=True)
    on = scene(phase=-0.4, alpha=0.93); on.save(os.path.join(PV, "zigzag_scene_667x375.png"))
    off = scene(); off.save(os.path.join(PV, "zigzag_scene_667x375_motion-off.png"))
    ImageOps.grayscale(on.convert("RGB")).save(os.path.join(PV, "zigzag_scene_667x375_grey.png"))
    fr = []
    for i in range(20):                       # fade in 0.2 s, stripes scroll 1 period / 0.5 s, 2 pulses per second
        t = i / 20; fr.append(scene(phase=-2 * t, alpha=min(1, 0.4 + t * 3) * (0.85 + 0.15 * math.sin(t * 4 * math.pi)), progress=0.3 + 0.7 * t).convert("RGB"))
    fr[0].save(os.path.join(PV, "zigzag_anim.gif"), save_all=True, append_images=fr[1:], duration=50, loop=0)
    print("zigzag previews written to", PV)

if __name__ == "__main__":
    main()
