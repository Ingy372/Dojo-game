#!/usr/bin/env python3
"""R-BAL-12 (option B): live enemies (content/enemies) x ENEMY_TRAINING_SCALE vs the trained Artist
of each student at every belt, Standard + Challenge x1.5. Prints the passing scale window per belt,
the chosen row, and the Artist table the Vitest test pins. Run: python3 drafts/planning/r-bal-12f-live-check.py"""
import importlib.util, json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("s12", os.path.join(HERE, "r-bal-12-sim.py"))
s = importlib.util.module_from_spec(spec); spec.loader.exec_module(s)
r9 = s.r9; ess = r9.ess
LIVE = os.path.join(HERE, "..", "..", "content", "enemies")
ENEMIES = {"swarmer": (1, ess.BANDS["small"]), "shield": (1, ess.BANDS["mid"]), "bopper": (2, ess.BANDS["mid"]),
           "brute": (1, ess.BANDS["heavy"]), "floor-keeper": (1, {"hits": (40, 80), "ko_min": 5})}
CUR = [(1.27,1.19),(1.57,1.51),(1.71,1.74),(1.9,1.92),(2.11,2.07),(2.24,2.18),(2.33,2.28),(2.45,2.36),(2.59,2.43),(2.68,2.47)]
def ok_all(t, hx, px, res, live, verbose=False):
    good = True; rows = []
    for eid, (minT, band) in ENEMIES.items():
        if t < minT: continue
        e = live[eid]; F = (round(e["maxHealth"] * hx), round(e["power"] * px), e["guard"])
        for st in s.STUDENTS:
            a = res[st][t][0]; c = r9.check(F, a, band); good &= c[4]; rows.append((eid, st, F, c))
    return (good, rows) if verbose else good
def main():
    lv, gear = s.typical_series(); s.fit_k(lv, gear)
    res = {}
    for sn, st in s.STUDENTS.items():
        rows = s.student_runs(lv, gear, st); res[sn] = {t: s.avg_artist(rows, t) for t in s.TIERS}
    live = {e: json.load(open(os.path.join(LIVE, e + ".json"))) for e in ENEMIES}
    chosen = []
    for t in s.TIERS:
        ch, cp = CUR[t-1]
        if ok_all(t, ch, cp, res, live): chosen.append((ch, cp)); continue
        grid = [(h/100, p/100) for h in range(50, 400) for p in range(50, 400)]
        cands = [(abs(h-ch)+abs(p-cp), h, p) for h, p in grid if ok_all(t, h, p, res, live)]
        if not cands: print("NO PASSING ROW at belt", t); chosen.append((ch, cp)); continue
        _, h, p = min(cands); chosen.append((h, p))
    print("ARTISTS = {")
    for st in s.STUDENTS:
        print(f"  {st!r}: [" + ", ".join(f"[{res[st][t][0]['power']:.2f}, {res[st][t][0]['health']:.2f}, {res[st][t][0]['guard']:.2f}]" for t in s.TIERS) + "],")
    print("}")
    for t in s.TIERS:
        for label, (h, p) in (("before", CUR[t-1]), ("after", chosen[t-1])):
            g, rows = ok_all(t, h, p, res, live, True)
            print(f"belt {t} {label} H x{h} P x{p} {'PASS' if g else 'OUT'}: " + "; ".join(f"{e}/{st[:5]} {c[0]}/{c[1]} KO{c[2]}/{c[3]}{'' if c[4] else ' OUT'}" for e, st, F, c in rows if st == 'typical' or not c[4]))
if __name__ == "__main__": main()
