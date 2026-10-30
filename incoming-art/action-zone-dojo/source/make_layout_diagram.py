"""Labelled top-down plan of the main floor, drawn from layout_main_floor.py (the same numbers the 3D scene uses).
Labels and flat colours only; no photos. Run: python3 make_layout_diagram.py  ->  ../samples/inside-main-floor-layout-diagram.png"""
import os
from PIL import Image, ImageDraw, ImageFont
import layout_main_floor as LM
HERE = os.path.dirname(os.path.abspath(__file__)); S = 56; PAD = 70; TOP = 270
Wp = int(LM.W * S + 2 * PAD); Hp = int((LM.R_FRONT - LM.R_N) * S + TOP + 100)
im = Image.new("RGB", (Wp, Hp), "#f7f4ec"); d = ImageDraw.Draw(im)
def F(sz, bold=True):
    for p in ("/usr/share/fonts/truetype/sand-box/google/Be Vietnam Pro/BeVietnamPro-%s.ttf" % ("Black" if bold else "Medium"), "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()
X = lambda x: PAD + x * S; Y = lambda r: TOP + (r - LM.R_N) * S
def box(x0, x1, r0, r1, fill, outline="#14121c", w=3): d.rectangle([X(x0), Y(r0), X(x1), Y(r1)], fill=fill, outline=outline, width=w)
def label(x, r, s, sz=22, col="#14121c", anchor="mm"):
    for i, line in enumerate(s.split("\n")): d.text((X(x), Y(r) + (i - (s.count("\n")) / 2) * (sz + 4)), line, font=F(sz), fill=col, anchor=anchor)
BLUE, RED, INK = "#2a5db0", "#d92b25", "#14121c"
box(0, LM.W, LM.R_N, LM.R_FRONT, "#e3d2b4")                                   # lobby tile (entry hall)
box(0, LM.W, LM.R_N, LM.R_MAT_S, BLUE)                                           # blue mats
box(*LM.REDSQ[:2], *LM.REDSQ[2:], RED)                                           # red square
label(sum(LM.REDSQ[:2]) / 2, (LM.REDSQ[2] + LM.REDSQ[3]) / 2, "SCHOOL LOGO\nin the middle of\nthe RED SQUARE", 24, "white")
label(2.5, 6.0, "BLUE MATS\nsurround the\nred square", 22, "white"); label(24.0, 8.5, "(mats continue\nbehind the wings)", 16, "#cfdcf5")
box(*LM.WEST_WING, LM.R_MAT_S - 0.6, LM.R_MAT_S, "#9ec3ee"); label(3.5, 9.65, "PRO SHOP (wall + counter)", 20)
box(*LM.EAST_WING, LM.R_MAT_S - 0.6, LM.R_MAT_S, "#f6f3ec"); label(23.2, 9.65, "", 18)
for a, b in (LM.DOOR_A, LM.DOOR_B): box(a, b, LM.R_MAT_S - 0.6, LM.R_MAT_S, "#ffffff", BLUE, 3); d.text((X((a + b) / 2), Y(LM.R_MAT_S - 0.3)), "+", font=F(26), fill=RED, anchor="mm")
box(LM.PRINTS[0], LM.PRINTS[1], LM.R_MAT_S - 0.6, LM.R_MAT_S, "#f6f3ec", "#f6f3ec", 1); label(sum(LM.PRINTS) / 2, LM.R_MAT_S - 0.3, "handprint wall", 14)
box(*LM.CUBBY[:2], *LM.CUBBY[2:], RED); label(sum(LM.CUBBY[:2]) / 2, sum(LM.CUBBY[2:]) / 2, "RED BOX: students' gear bags", 20, "white")
for g in (LM.GAP, LM.GAP_R):
    box(g[0], g[1], LM.R_MAT_S - 1.4, LM.R_MAT_S + 0.1, "#f7f4ec", "#c9a86a", 3); label(sum(g) / 2, LM.R_MAT_S - 0.7, "GAP", 20)
    d.line([X(sum(g) / 2), Y(LM.R_MAT_S + 1.3), X(sum(g) / 2), Y(LM.R_MAT_S - 1.3)], fill=INK, width=4); d.polygon([(X(sum(g) / 2) - 9, Y(LM.R_MAT_S - 1.1)), (X(sum(g) / 2) + 9, Y(LM.R_MAT_S - 1.1)), (X(sum(g) / 2), Y(LM.R_MAT_S - 1.6))], fill=INK)
    label(sum(g) / 2 + (0.9 if g is LM.GAP_R else 0), LM.R_MAT_S + 1.9, "students walk\nonto the mat", 16)
for rf, dp, zt in LM.TIERS: box(LM.SEATS[0], LM.SEATS[1], rf - dp, rf, "#4a5470", "#14121c", 2)
for rf, dp, zt in LM.TIERS:
    n = 8; p = (LM.SEATS[1] - LM.SEATS[0] - 0.6) / n
    for k in range(n): x = LM.SEATS[0] + 0.3 + p * k; d.rectangle([X(x + 0.06), Y(rf - dp + 0.3), X(x + p - 0.06), Y(rf - dp + 0.9)], fill=RED if (k + LM.TIERS.index((rf, dp, zt))) % 2 == 0 else BLUE)
label(sum(LM.SEATS) / 2, LM.TIERS[-1][0] + 0.5, "PARENT SEATING (straight ahead from the door; seats face the mat)", 20)
RW0 = LM.R_N - 0.7
def wallbox(a, b, fill, text, row, col="#14121c"):
    box(a, b, RW0, LM.R_N, fill, INK, 2); d.line([X((a + b) / 2), Y(RW0), X((a + b) / 2), Y(RW0) - 14 - 30 * row], fill="#666", width=2)
    d.text((X((a + b) / 2), Y(RW0) - 18 - 30 * row), text, font=F(17), fill=col, anchor="md")
box(0, LM.W, RW0, LM.R_N, "#efe9d6", INK, 2)
wallbox(*LM.TARGET, "#f5c82e", "YELLOW MEN (throwing-star target wall)", 0)
wallbox(*LM.MURAL, "#ffffff", "STYLES MURAL + LOGO ART", 1)
wallbox(*LM.BACK_DOOR, "#6b4a3a", "back doors", 0)
wallbox(*LM.FLAG, "#d9d4c4", "flag", 2); wallbox(*LM.CREED, "#ffffff", "Class Creed", 0); wallbox(*LM.BELTS, "#ffffff", "belt creed", 1)
d.text((X(LM.W) , Y(RW0) - 120), "NORTH WALL (art shown unfolded here)", font=F(16), fill="#444", anchor="rd")
for x, r, c in LM.BAGS: d.ellipse([X(x - 0.35), Y(r - 0.35), X(x + 0.35), Y(r + 0.35)], fill={"black": "#3a3a45", "blue": "#2f6fd6", "red": RED}[c], outline=INK, width=3)
label(24.0, 5.9, "PUNCHING BAGS\n(right side of the mat)", 20, "white")
a, b, ra, rb = LM.CRASH; box(a, b, ra, rb, "#6f9be0", INK, 2)
box(0.0, 0.0, 0, 0, None) if False else None
label(sum(LM.DOOR) / 2, LM.R_FRONT - 0.5, "", 10); box(*LM.DOOR, LM.R_FRONT - 0.15, LM.R_FRONT + 0.15, "#f7f4ec", "#f7f4ec", 1)
label(sum(LM.DOOR) / 2, LM.R_FRONT + 0.9, "ENTRY", 28)
ax = X(sum(LM.DOOR) / 2); d.line([ax, Y(LM.R_FRONT + 0.3) - 50, ax, Y(LM.R_FRONT - 1.5)], fill=INK, width=6); d.polygon([(ax - 14, Y(LM.R_FRONT - 1.5) + 4), (ax + 14, Y(LM.R_FRONT - 1.5) + 4), (ax, Y(LM.R_FRONT - 2.3))], fill=INK)
label(4.0, 15.0, "turn LEFT:  PRO SHOP", 20); box(2.0, 5.2, 11.0, 12.0, "#f4f1e8", INK, 2); label(3.6, 11.5, "pro-shop counter", 14); label(23.0, 13.8, "turn RIGHT:  TWO CROSS DOORS\nwith the HANDPRINT WALL between", 20)
label(13.5, 15.0 + 2.6, "", 10)
d.text((PAD, 24), "ACTION ZONE DOJO - MAIN FLOOR PLAN (top-down, labels only)", font=F(30), fill=INK)
d.text((PAD, 66), "Entry is at the bottom; the north wall (target wall, styles mural, creeds) is at the top. Wall art is shown unfolded onto the north wall.", font=F(18, False), fill="#444")
d.text((PAD, 92), "Drawn from layout_main_floor.py: the same numbers the 3D picture is built from.", font=F(18, False), fill="#444")
out = os.path.join(HERE, "..", "samples", "inside-main-floor-layout-diagram.png"); im.save(out); print(out, im.size)
