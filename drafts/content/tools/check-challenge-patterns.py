#!/usr/bin/env python3
"""C1 (R-CHALLENGE-PATTERNS): every content/enemies/*.json "challenge" block has fromBelt 4-10,
fromRoom >= 1, and attacks that fit the smallest view (6.75 tiles tall): startRange and
reach + areaRadius (the farthest hit point from the enemy) are 4 tiles or less. The Challenge
wind-up must be >= 14 ticks. Names are 4 words or fewer; tell and senseiLine are 12 or fewer; no 'perfect'."""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
MAX_REACH = 4.0; BAN = re.compile(r"\bperfect\w*\b", re.I); e = []; n = 0
for f in sorted((R/"content/enemies").glob("*.json")):
    d = json.loads(f.read_text()); c = d.get("challenge")
    if c is None: continue
    i = d["id"]
    if not (isinstance(c.get("fromBelt"), int) and 4 <= c["fromBelt"] <= 10): e.append(f"{i}: fromBelt {c.get('fromBelt')} not 4-10")
    if not (isinstance(c.get("fromRoom", 1), int) and c.get("fromRoom", 1) >= 1): e.append(f"{i}: bad fromRoom")
    for a in c.get("attacks", []):
        n += 1; nm = a.get("name", "?"); far = a["reach"] + a["areaRadius"]
        if far > MAX_REACH: e.append(f"{i}/{nm}: reach+areaRadius {far} > {MAX_REACH}")
        if a["startRange"] > MAX_REACH: e.append(f"{i}/{nm}: startRange {a['startRange']} > {MAX_REACH}")
        w = max(10, round((a["telegraphTicks"] - 6) * 0.8) + 4)
        if w < 14: e.append(f"{i}/{nm}: Challenge wind-up {w} < 14")
        for k, lim in (("name", 4), ("tell", 12), ("senseiLine", 12)):
            t = a.get(k, "")
            if not t: e.append(f"{i}/{nm}: empty {k}")
            elif len(t.split()) > lim: e.append(f"{i}/{nm}: {k} has {len(t.split())} words (max {lim})")
            if BAN.search(t): e.append(f"{i}/{nm}: 'perfect' in {k}")
        print(f"{i}: {nm}  fromBelt {c['fromBelt']}  fromRoom {c.get('fromRoom',1)}  reach {far:.2f}  challenge wind-up {w}")
    for ph in c.get("phases") or []:
        s = ph.get("senseiLine") or ""
        if BAN.search(s) or len(s.split()) > 12: e.append(f"{i}: phase senseiLine {s!r}")
print("\n".join(e) if e else f"OK: {n} pattern attacks, fromBelt 4-10, reach <= {MAX_REACH} tiles")
sys.exit(1 if e else 0)
