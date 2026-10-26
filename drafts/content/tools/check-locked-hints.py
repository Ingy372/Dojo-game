#!/usr/bin/env python3
"""L-PREMIUM-a: every lockable Trophy, Decoration and Journal id (plus the kata cubby, C-STORY-TRY-rec) has exactly one hint of 7 words
or fewer, with no banned word. Ids come from content/ data, so new items fail until hinted."""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
L = lambda p: json.loads((R/p).read_text())
h = L("drafts/content/hints/locked-hints.json"); A = L("content/abilities/abilities.json")
D = L("content/dojo/decorations.json")["decorations"]; N = L("content/named/named.json")["monsters"]
want = {"trophies": [x["id"] for k in ("stances","strikes","seals") for x in A[k] if x["id"] != "beginners-stance"],
        "decorations": [d["id"] for d in D if d["source"] != "starter"],
        "journal": ["kind:"+d["monster"] for d in D if d["source"]=="trophy"] + ["named:"+n["id"] for n in N],
        "cubbies": ["kata-cubby"]}
BAN = re.compile(r"\b(only|missing|lost|perfect)\b", re.I); e = []
for cat, ids in want.items():
    got = [x["id"] for x in h.get(cat, [])]
    for i in ids:
        if got.count(i) != 1: e.append(f"{cat}: {i} has {got.count(i)} hints")
    for i in set(got) - set(ids): e.append(f"{cat}: {i} is not a lockable item")
    for x in h.get(cat, []):
        t = x.get("hint", "").strip(); n = len(t.split())
        if not t: e.append(f"{x['id']}: empty hint")
        if n > 7: e.append(f"{x['id']}: {n} words")
        if BAN.search(t): e.append(f"{x['id']}: banned word in {t!r}")
        if not x.get("unlock"): e.append(f"{x['id']}: needs its unlock rule")
    print(f"{cat}: {len(ids)} items")
print("\n".join(e) if e else "OK: all hints present, 7 words or fewer, no banned words")
sys.exit(1 if e else 0)
