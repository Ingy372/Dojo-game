#!/usr/bin/env python3
"""OV-C2: word and name check for Blessing-in-runs and belt-entry parent words.
Kid lines are 8 words or fewer. No hours or countdown. No banned words. Names used
are already in the game (Dojo Blessing, grown-up, Tower). Usage: check-ov-c2-words.py"""
import json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parents[3]
BANNED = ("perfect", "loot box", "buy", "purchase", "streak", "hour", "hours")
blessing = json.loads((R / "drafts/content/settings/blessing-in-runs.json").read_text())
belt = json.loads((R / "drafts/content/settings/belt-entry-parent.json").read_text())
bad = []

def words(s):
    return [w for w in re.findall(r"[A-Za-z0-9']+", s.replace("{n}", "n").replace("{belt}", "belt").replace("{entry}", "entry").replace("{xp}", "xp"))]

def check_kid(label, text):
    n = len(words(text))
    if n > 8:
        bad.append(f"{label}: {n} words (max 8): {text!r}")
    low = text.lower()
    for w in BANNED:
        if re.search(r"\b" + re.escape(w) + r"s?\b", low):
            bad.append(f"{label}: banned word {w!r} in {text!r}")
    if re.search(r"\b\d+\s*h\b|\bh left\b|48", low):
        bad.append(f"{label}: looks like a clock or hours line: {text!r}")

for k, v in blessing["kid"].items():
    check_kid(f"blessing kid.{k}", v)
for k, v in belt["kid"].items():
    check_kid(f"belt kid.{k}", v)
check_kid("fixPath.button", belt["fixPath"]["button"])
check_kid("fixPath.title", belt["fixPath"]["title"])
check_kid("fixPath.yes", belt["fixPath"]["yes"])
check_kid("fixPath.no", belt["fixPath"]["no"])
# parent notes may be longer, but still no banned words or hours
for label, text in [("parentNote", belt["parentNote"]), ("whoMayEnter", belt["whoMayEnter"]), ("help", belt["help"]), ("fixPath.help", belt["fixPath"]["help"]), ("fixPath.confirm", belt["fixPath"]["confirm"])]:
    low = text.lower()
    for w in ("perfect", "loot box", "buy", "purchase", "streak", "hour", "hours"):
        if re.search(r"\b" + re.escape(w) + r"s?\b", low):
            bad.append(f"{label}: banned word {w!r}")
if blessing.get("rules", {}).get("runsPerClass") != 5 or blessing.get("rules", {}).get("maxRuns") != 10:
    bad.append("rules: a class must add 5 runs, cap 10")
if "Dojo Blessing" not in blessing["kid"]["title"] + blessing["kid"]["celebration"]:
    bad.append("name check: keep the existing name Dojo Blessing")
if "grown-up" not in belt["whoMayEnter"].lower() or "student" not in belt["whoMayEnter"].lower():
    bad.append("belt: whoMayEnter must say a grown-up, not the student, sets the belt")
if "fix" not in belt["fixPath"]["button"].lower() and "mistake" not in belt["fixPath"]["button"].lower():
    bad.append("belt: fix path needs a clear Fix a mistake control")
if bad:
    print("PROBLEMS")
    [print(" -", b) for b in bad]
    raise SystemExit(1)
print(f"OK: OV-C2 words pass ({len(blessing['kid'])} blessing kid lines, belt-entry parent note and fix path)")
