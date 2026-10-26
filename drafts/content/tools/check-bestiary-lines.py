#!/usr/bin/env python3
"""C-STORY-g check: Bestiary kid/older lines (word counts, sentences, banned words, coverage). Run from repo root."""
import json, re, sys
P = "drafts/content/enemies/"
d = json.load(open(P + "bestiary-tiers-1-3.json"))
BANNED = ["perfect", "only", "missing", "lost"]
ALLOW = ["Lost Lightbearer"]
errs = []
def words(s): return len(re.findall(r"[A-Za-z0-9']+", s))
for e in d["entries"]:
    k, o = e["kidLine"], e["olderReaderLine"]
    if not 8 <= words(k) <= 12: errs.append(f"{e['id']}: kidLine {words(k)} words (8-12)")
    if len(re.findall(r"[.!?](\s|$)", o)) > 2: errs.append(f"{e['id']}: olderReaderLine over 2 sentences")
    if words(o) > 30: errs.append(f"{e['id']}: olderReaderLine {words(o)} words (>30, not short)")
    for s in (k, o):
        t = s
        for a in ALLOW: t = t.replace(a, "")
        for b in BANNED:
            if re.search(rf"\b{b}\w*", t, re.I): errs.append(f"{e['id']}: banned word '{b}' in: {s}")
ids = {e["id"] for e in d["entries"]}
plan = json.load(open(P + "bestiary-plan.json"))
want = {x["id"] for t in plan["tiers"] if t["tier"] in ("white","yellow","orange") for x in t["enemies"]}
want |= {m["id"] for m in json.load(open(P + "named-monsters.json"))["monsters"] if m["tier"] <= 3}
for m in sorted(want - ids): errs.append(f"no entry for {m}")
for m in sorted(ids - want): errs.append(f"unknown id {m}")
for x in errs: print("FAIL", x)
print(f"check-bestiary-lines: {len(d['entries'])} entries, {len(errs)} problems")
sys.exit(1 if errs else 0)
