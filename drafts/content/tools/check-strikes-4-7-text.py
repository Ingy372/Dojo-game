#!/usr/bin/env python3
"""R-G2B-16: check drafts/content/abilities/strikes-4-7-text.json (names and kid text for Strikes #4-7).
Names are never invented: 'name' must be one of the plan's shape names (R-G2B-strikes-4-7.md) and 'altName' one of the S4 names; neither may equal a Seal rank name
(no clash with seal #16 Low-High Strike or OPEN). 'text' 12 words or fewer; 'unlock' 8 words or fewer; 'inDojo' starts 'In the dojo:' and is 12 words or fewer.
Kid-text rules: one sentence, no digits, no 'perfect' or pressure words, no injury or body-part or blade words, STRIKE/DASH/COUNTER in capitals, first-grade words in text and unlock.
Usage: python3 drafts/content/tools/check-strikes-4-7-text.py [file]"""
import json, re, sys, pathlib, glob
R = pathlib.Path(__file__).resolve().parents[3]
F = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R / "drafts/content/abilities/strikes-4-7-text.json"
BAN = re.compile(r"\b(perfect|perfectly|must|have to|never|only|missing|lost|fail|failed|wrong|hurry|kill|dead|die|blood|evil|hate|stupid|timer|buy|purchase|miss|mistake|late|stronger|strongest|weaker)\b", re.I)
INJ = re.compile(r"\b(injur\w*|hurt|pain|wound\w*|bone|crack\w*|broken|break|breaks)\b", re.I)
BODY = re.compile(r"\b(throat|eyes?|groin|nose|neck)\b", re.I)
WEAPON = re.compile(r"\b(blade|sword|knife|knives|gun)\b", re.I)
PLAN = {"side-kick-drive": (4, "Side Kick Drive", "Both Sides"), "hook-kick": (5, "Hook Kick", "Low-High Kicks"),
        "lunge": (6, "Lunge", "Block, Punch, Lunge"), "spinning-finisher": (7, "Spinning Finisher", "Axe and Hook")}
def syl(w):
    w = w.lower(); n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and not w.endswith(("le", "ee")) and n > 1: n -= 1
    if w.endswith("es") and not w.endswith(("ses", "zes", "ces", "ges", "xes")) and n > 1: n -= 1
    if w.endswith("ed") and not w.endswith(("ted", "ded")) and n > 1: n -= 1
    return max(n, 1)
e = []
def line(where, t, maxw, end, easy=True, prefix=None):
    if not isinstance(t, str) or not t: e.append(f"{where}: missing"); return
    if prefix and not t.startswith(prefix): e.append(f"{where}: must start '{prefix}'")
    body = t[len(prefix):].strip() if prefix and t.startswith(prefix) else t
    n = len(t.split())
    if n > maxw: e.append(f"{where}: {n} words (max {maxw})")
    if re.search(r"\d", t): e.append(f"{where}: no digits")
    if not t.endswith(end) or len(re.findall(r"[.!?]", body)) != 1: e.append(f"{where}: exactly one sentence ending in '{end}'")
    if easy:
        for w in re.findall(r"[A-Za-z']+", t):
            if len(w) > 9 or syl(w) > 3: e.append(f"{where}: '{w}' is not a first-grade word")
    for rx, label in ((BAN, "banned or pressure word"), (BODY, "body-part word"), (WEAPON, "weapon word"), (INJ, "injury or break word")):
        if rx.search(t): e.append(f"{where}: {label}: {rx.search(t).group()}")
    if re.search(r"\b(strike|dash|counter)\b", t): e.append(f"{where}: write STRIKE, DASH or COUNTER in capitals")
d = json.load(open(F))
if not d.get("notes"): e.append("missing top-level notes")
ranks = {r["name"] for f in json.load(open(R / "drafts/content/abilities/seal-families-text.json"))["families"] for r in f["ranks"]}
for p in glob.glob(str(R / "drafts/content/abilities/seals-*-text.json")):
    try:
        for s in json.load(open(p)).get("seals", []): ranks.add(s.get("name"))
    except Exception: pass
ids = [s.get("id") for s in d.get("strikes", [])]
if ids != list(PLAN): e.append(f"strikes must be {list(PLAN)}")
for s in d.get("strikes", []):
    i = s.get("id"); w = f"strike {i}"
    if i not in PLAN: continue
    combo, name, alt = PLAN[i]
    if s.get("combo") != combo: e.append(f"{w}: combo should be {combo}")
    if s.get("name") != name: e.append(f"{w}: name must be '{name}' (the plan's shape name)")
    if s.get("altName") != alt: e.append(f"{w}: altName must be the S4 name '{alt}'")
    for nm in (s.get("name"), s.get("altName")):
        if nm in ranks: e.append(f"{w}: '{nm}' clashes with a Seal rank name")
    line(w + " text", s.get("text"), 12, ".")
    line(w + " unlock", s.get("unlock"), 8, "!")
    line(w + " inDojo", s.get("inDojo"), 12, ".", easy=False, prefix="In the dojo:")
    if not s.get("status"): e.append(f"{w}: missing status")
if next((s for s in d.get("strikes", []) if s.get("id") == "hook-kick"), {}).get("status", "").find("taste call 1") < 0:
    e.append("hook-kick status must say it waits on taste call 1")
print(f"{F.name}: {len(d.get('strikes', []))} strikes")
for x in e: print("  FAIL", x)
print("OK: strikes 4-7 text passes" if not e else f"{len(e)} problem(s)")
sys.exit(1 if e else 0)
