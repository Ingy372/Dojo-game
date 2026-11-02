#!/usr/bin/env python3
"""PB-06: check drafts/content/abilities/seal-families-text.json (Seal families, ranks #1-15, Strikes, slot words).
Rules: every kid line is ages 6-9 words, under 80 characters, no digits, no 'perfect', no pressure, injury, body-part or weapon words ('break' only in 'Break Free');
STRIKE, DASH and COUNTER in capitals (or 'Great Counter'); rank/strike/family lines are one sentence; ids are kebab-case.
Structure: ranks #1-15 each appear once; the family map matches R-PROGRESSION-BETA section 4.4; Steady Breath is in Counter and Strong Block in Guard
(as the Manager decided); the 10 placeholder Seals in content/abilities/abilities.json each land once; Lock has no ranks; ranks are in technique order.
Usage: python3 drafts/content/tools/check-seal-families-text.py [file]"""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
F = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R / "drafts/content/abilities/seal-families-text.json"
BAN = re.compile(r"\b(perfect|perfectly|must|have to|never|only|missing|lost|fail|failed|wrong|hurry|kill|dead|die|blood|evil|hate|stupid|timer|buy|purchase)\b", re.I)
INJ = re.compile(r"\b(injur\w*|hurt|pain|wound\w*|bone|crack\w*|broken|break|breaks)\b", re.I)
BODY = re.compile(r"\b(throat|eyes?|groin|nose|neck)\b", re.I)
WEAPON = re.compile(r"\b(blade|sword|knife|knives|gun)\b", re.I)
PLAN_MAP = {"escape": [1, 2, 4, 15], "counter": [3, 5, 6, 7, 10], "guard": [8, 9], "disarm": [13, 14], "throw": [11, 12], "lock": []}
e = []
d = json.load(open(F))
def line(where, t, sentence=True):
    if not isinstance(t, str) or not t: e.append(f"{where}: missing text"); return
    if len(t) >= 80: e.append(f"{where}: {len(t)} characters (max 79)")
    if re.search(r"\d", t): e.append(f"{where}: no digits in kid text")
    for rx, label in ((BAN, "a word not for ages 6-9 or one that pressures"), (BODY, "a body-part word"), (WEAPON, "a weapon word")):
        if rx.search(t): e.append(f"{where}: {label}: {rx.search(t).group()}")
    if INJ.search(t.replace("Break Free", "")): e.append(f"{where}: injury or break word: {INJ.search(t).group()}")
    if re.search(r"\b(strike|dash|counter)\b", t): e.append(f"{where}: write STRIKE, DASH or COUNTER in capitals (or 'Great Counter')")
    if sentence and (not t.endswith((".", "!")) or len(re.findall(r"[.!?]", t)) != 1): e.append(f"{where}: must be exactly one sentence")
def name(where, n):
    if not (1 <= len(n.split()) <= 4): e.append(f"{where}: name should be 1-4 words")
if not d.get("notes"): e.append("missing top-level notes")
fams = {f["id"]: f for f in d.get("families", [])}
if set(fams) != set(PLAN_MAP): e.append(f"families must be {sorted(PLAN_MAP)}")
seen = []; old = []
for fid, f in fams.items():
    if not re.fullmatch(r"[a-z]+(-[a-z]+)*", fid): e.append(f"{fid}: id must be kebab-case")
    name(fid, f.get("name", "")); line(f"family {fid}", f.get("text"))
    nums = [r.get("technique") for r in f.get("ranks", [])]
    if nums != sorted(nums): e.append(f"{fid}: ranks must be in technique order")
    if nums != PLAN_MAP.get(fid): e.append(f"{fid}: ranks {nums} differ from plan section 4.4 {PLAN_MAP.get(fid)}")
    for r in f.get("ranks", []):
        w = f"{fid} #{r.get('technique')}"
        for k in ("technique", "name", "text", "effectRef"):
            if k not in r: e.append(f"{w}: missing {k}")
        name(w, r.get("name", "")); line(w, r.get("text")); seen.append(r.get("technique"))
        if "oldSeal" in r: old.append(r["oldSeal"])
        c = r.get("carries")
        if c:
            old.append(c["oldSeal"]); name(w + " carries", c["name"]); line(w + " carries", c["text"])
if fams.get("lock") and (fams["lock"].get("ranks") or not fams["lock"].get("comingLater")): e.append("lock: no ranks and a comingLater line")
if sorted(seen) != list(range(1, 16)) or None in seen: e.append(f"ranks must cover #1-15 once each, got {sorted(x for x in seen if x)}")
carry = {fid: [r["carries"]["name"] for r in f.get("ranks", []) if r.get("carries")] for fid, f in fams.items()}
if carry.get("counter") != ["Steady Breath"] or carry.get("guard") != ["Strong Block"]: e.append("Steady Breath must ride in Counter and Strong Block in Guard")
ab = [s["id"] for s in json.load(open(R / "content/abilities/abilities.json"))["seals"]]
if sorted(old) != sorted(ab): e.append(f"old Seals must each land once: have {sorted(old)}, abilities.json has {sorted(ab)}")
ids = []
for s in d.get("strikes", []):
    ids.append(s.get("id")); name(s.get("id"), s.get("name", "")); line("strike " + str(s.get("id")), s.get("text"))
if ids != ["spin-kick", "jumping-spins", "butterfly-flow"]: e.append(f"strikes must be spin-kick, jumping-spins, butterfly-flow, got {ids}")
if [s.get("combo") for s in d.get("strikes", [])] != [1, 2, 3]: e.append("strike combos must be 1, 2, 3")
ui = d.get("ui", {})
for k, v in ui.get("emptySlots", {}).items(): line("ui emptySlots " + k, v, sentence=False)
for k in ("swapPrompt", "slotNote"): line("ui " + k, ui.get(k), sentence=False)
for k, v in list(ui.get("choose", {}).items()) + list(ui.get("slots", {}).items()): line("ui " + k, v, sentence=False)
print(f"{F.name}: {len(fams)} families, {len(seen)} ranks, {len(ids)} strikes")
for x in e: print("  FAIL", x)
print("OK: seal families text passes" if not e else f"{len(e)} problem(s)")
sys.exit(1 if e else 0)
