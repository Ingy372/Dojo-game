#!/usr/bin/env python3
"""PB-14: check drafts/content/abilities/unlock-text.json (unlock screen and Sensei's Trial words).
Rules for every 'line': 8 words or fewer, first-grade words (each word part 9 letters or fewer and 3 syllables or fewer), exactly one sentence, no digits,
no 'perfect', no pressure, guilt, injury, body-part or weapon-blade words; STRIKE/DASH/COUNTER in capitals (or 'Great Counter').
No overlap with the #404 equip tip: no line may say slot, equip, or 'helps you in fights'.
Structure: seal lines cover #1-15 once each; family, technique and title match seal-families-text.json (PB-06); carried Seals are Steady Breath (Counter) and Strong Block (Guard);
Strikes are spin-kick, jumping-spins, butterfly-flow; kata ids match content/katas; kata lines are placeholders until Jay's list.
Prints the Flesch-Kincaid grade per line as information only.
Usage: python3 drafts/content/tools/check-unlock-text.py [file]"""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
F = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R / "drafts/content/abilities/unlock-text.json"
BAN = re.compile(r"\b(perfect|perfectly|must|have to|never|only|missing|lost|fail|failed|wrong|hurry|kill|dead|die|blood|evil|hate|stupid|timer|buy|purchase|miss|mistake|late)\b", re.I)
INJ = re.compile(r"\b(injur\w*|hurt|pain|wound\w*|bone|crack\w*|broken|break|breaks)\b", re.I)
BODY = re.compile(r"\b(throat|eyes?|groin|nose|neck)\b", re.I)
WEAPON = re.compile(r"\b(blade|sword|knife|knives|gun)\b", re.I)
TIP = re.compile(r"\b(slots?|equip\w*)\b|helps? you in fights?", re.I)
def syl(w):
    w = w.lower(); n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and not w.endswith(("le", "ee")) and n > 1: n -= 1
    if w.endswith("es") and not w.endswith(("ses", "zes", "ces", "ges", "xes")) and n > 1: n -= 1
    if w.endswith("ed") and not w.endswith(("ted", "ded")) and n > 1: n -= 1
    return max(n, 1)
def fk(t):
    ws = re.findall(r"[A-Za-z']+", t); s = len(re.findall(r"[.!?]", t)) or 1
    return round(0.39 * len(ws) / s + 11.8 * sum(syl(w) for w in ws) / len(ws) - 15.59, 1)
e = []; grades = []
def line(where, t):
    if not isinstance(t, str) or not t: e.append(f"{where}: missing line"); return
    ws = t.split()
    if len(ws) > 8: e.append(f"{where}: {len(ws)} words (max 8)")
    if re.search(r"\d", t): e.append(f"{where}: no digits")
    if len(re.findall(r"[.!?]", t)) != 1 or not t.endswith(("!", ".")): e.append(f"{where}: must be exactly one sentence")
    for part in re.findall(r"[A-Za-z']+", t):
        if len(part) > 9 or syl(part) > 3: e.append(f"{where}: '{part}' is not a first-grade word")
    for rx, label in ((BAN, "a word not for ages 6-9 or one that pressures"), (BODY, "a body-part word"), (WEAPON, "a weapon word")):
        if rx.search(t): e.append(f"{where}: {label}: {rx.search(t).group()}")
    if INJ.search(t): e.append(f"{where}: injury or break word: {INJ.search(t).group()}")
    if TIP.search(t): e.append(f"{where}: repeats the #404 equip tip (slot, equip, helps you in fights)")
    if re.search(r"\b(strike|dash|counter)\b", t): e.append(f"{where}: write STRIKE, DASH or COUNTER in capitals (or 'Great Counter')")
    grades.append(fk(t))
d = json.load(open(F))
if not d.get("notes"): e.append("missing top-level notes")
fam = {f["id"]: f for f in json.load(open(R / "drafts/content/abilities/seal-families-text.json"))["families"]}
ref = {r["technique"]: (f, r) for f in fam.values() for r in f["ranks"]}
seen = []
for s in d.get("seals", []):
    n = s.get("technique"); seen.append(n); w = f"seal #{n}"
    line(w, s.get("line"))
    if n not in ref: e.append(f"{w}: not a PB-06 rank"); continue
    f, r = ref[n]
    if s.get("family") != f["id"]: e.append(f"{w}: family should be {f['id']} (PB-06)")
    if s.get("title") != r["name"]: e.append(f"{w}: title should be '{r['name']}' (PB-06)")
if sorted(seen) != list(range(1, 16)): e.append(f"seal lines must cover #1-15 once each, got {sorted(seen)}")
want = {"Steady Breath": ("counter", 10), "Strong Block": ("guard", 9)}
got = {c.get("name"): (c.get("family"), c.get("technique")) for c in d.get("sealCarries", [])}
if got != want: e.append(f"sealCarries must be {want}, got {got}")
for c in d.get("sealCarries", []): line("carries " + str(c.get("name")), c.get("line"))
if [s.get("id") for s in d.get("strikes", [])] != ["spin-kick", "jumping-spins", "butterfly-flow"]: e.append("strikes must be spin-kick, jumping-spins, butterfly-flow")
for s in d.get("strikes", []): line("strike " + str(s.get("id")), s.get("line"))
kat = [k for k in ("basic-form-1", "basic-form-2", "keon") if (R / "content/katas" / f"{k}.json").exists()]
if [k.get("kata") for k in d.get("kata", [])] != kat: e.append(f"kata entries must be {kat}")
for k in d.get("kata", []):
    line("kata " + str(k.get("id")), k.get("line"))
    if k.get("status") != "placeholder": e.append(f"{k.get('id')}: status must stay placeholder until Jay's list (PB-11)")
for k, v in d.get("trial", {}).items(): line("trial " + k, v)
for k in ("intro", "clear", "reward"):
    if k not in d.get("trial", {}): e.append(f"trial: missing {k}")
for k, v in d.get("headers", {}).items(): line("header " + k, v)
print(f"{F.name}: {len(d.get('seals', []))} seal lines, {len(d.get('strikes', []))} strikes, {len(d.get('kata', []))} kata; reading grade max {max(grades)} (info)")
for x in e: print("  FAIL", x)
print("OK: unlock text passes" if not e else f"{len(e)} problem(s)")
sys.exit(1 if e else 0)
