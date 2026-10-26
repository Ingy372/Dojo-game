#!/usr/bin/env python3
"""Checks drafts/content/faith/guardian-faith-overlay.json (C13-F): every faithOverlayKey used in
drafts/content/bosses/*.json and drafts/content/enemies/guardian-form-shifts.json has exactly one entry,
and every entry has a relic, at least one verse with a reference and text, and a single short Sensei line.
Also checks storyScreens (C-STORY-b): unique key, story file exists, screen n exists with the same speaker,
at least one verse with a valid reference and text, and the story screen text itself carries no verse reference."""
import json, re, sys, glob, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
keys = set()
for p in glob.glob(str(R/"drafts/content/bosses/*.json")):
    k = json.load(open(p)).get("faithOverlayKey")
    if k: keys.add(k)
fs = json.loads((R/"drafts/content/enemies/guardian-form-shifts.json").read_text())
def walk(o):
    if isinstance(o, dict):
        if "faithOverlayKey" in o: keys.add(o["faithOverlayKey"])
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
walk(fs)
d = json.loads((R/"drafts/content/faith/guardian-faith-overlay.json").read_text())
e = []
REF = re.compile(r"^(\d )?[A-Z][a-z]+ \d+:\d+(-\d+)?( \(part\))?$")
seen = {}
for g in d.get("guardians", []):
    k = g.get("faithOverlayKey"); seen[k] = seen.get(k, 0) + 1
    if not g.get("relic", {}).get("name"): e.append(f"{k}: needs a relic name")
    vs = g.get("verses") or []
    if not vs: e.append(f"{k}: needs at least one verse")
    for v in vs:
        if not REF.match(v.get("reference", "")): e.append(f"{k}: bad reference {v.get('reference')!r}")
        if v.get("reference","").endswith("(part)") != (v.get("partial") is True): e.append(f"{k}: '(part)' reference and partial: true go together")
        if not v.get("text"): e.append(f"{k}: verse {v.get('reference')} has no text")
    s = g.get("sensei")
    if not isinstance(s, str) or not s.strip(): e.append(f"{k}: needs one Sensei line (a string)")
    else:
        if len(re.findall(r"[.!?](\s|$)", s)) != 1: e.append(f"{k}: Sensei line must be one sentence")
        if len(s.split()) > 12: e.append(f"{k}: Sensei line over 12 words")
for k in sorted(keys - seen.keys()): e.append(f"missing entry for faithOverlayKey {k}")
for k in sorted(seen.keys() - keys): e.append(f"entry {k} matches no faithOverlayKey")
for k, n in seen.items():
    if n > 1: e.append(f"{k}: {n} entries")
ss = d.get("storyScreens")
if not isinstance(ss, list): e.append("storyScreens must be a list"); ss = []
sk = set()
for s in ss:
    k = s.get("faithOverlayKey")
    if not k: e.append("storyScreens entry needs faithOverlayKey"); continue
    if k in sk or k in seen: e.append(f"{k}: duplicate key")
    sk.add(k)
    sp = R/str(s.get("story", ""))
    if not s.get("story") or not sp.is_file(): e.append(f"{k}: story file {s.get('story')!r} not found"); continue
    scr = {x.get("n"): x for x in json.loads(sp.read_text()).get("screens", [])}
    t = scr.get(s.get("screen"))
    if t is None: e.append(f"{k}: screen {s.get('screen')!r} not in {s['story']}"); continue
    if s.get("speaker") and s["speaker"] != t.get("speaker"): e.append(f"{k}: speaker {s['speaker']!r} but screen has {t.get('speaker')!r}")
    if re.search(r"\b\d+:\d+\b|shineth|comprehended", t.get("text", "")): e.append(f"{k}: verse text belongs in the faith layer, not the story screen")
    vs = s.get("verses") or []
    if not vs: e.append(f"{k}: needs at least one verse")
    for v in vs:
        if not REF.match(v.get("reference", "")): e.append(f"{k}: bad reference {v.get('reference')!r}")
        if v.get("reference","").endswith("(part)") != (v.get("partial") is True): e.append(f"{k}: '(part)' reference and partial: true go together")
        if not v.get("text"): e.append(f"{k}: verse {v.get('reference')} has no text")
for x in e: print("FAIL", x)
print(f"{len(seen)} entries, {len(keys)} keys, {len(ss)} story screens, {len(e)} problems")
sys.exit(1 if e else 0)
