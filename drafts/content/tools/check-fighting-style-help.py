#!/usr/bin/env python3
"""PB-08: check drafts/content/abilities/fighting-style-help.json (first-use help for the Fighting Style screen).
Rules: at most 6 lines (3 Fighting Style plus 3 Kata card); each 'line' is ONE sentence (or a 2-word question then a short answer), 8 words or fewer, under 80 characters, no digits, no 'perfect', no pressure, guilt, injury,
body-part or weapon words; STRIKE/DASH/COUNTER in capitals; ids are kebab-case; sessions are 1..n with one idea each (slots first, swap last);
every line names a screen and a trigger; help-slots and help-seals must yield to the seal unlock equip tip (PR #404), help-kata-class to the kata power unlock screen. Usage: python3 drafts/content/tools/check-fighting-style-help.py [file]"""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
F = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R / "drafts/content/abilities/fighting-style-help.json"
BAN = re.compile(r"\b(perfect|perfectly|must|have to|never|only|missing|lost|fail|failed|wrong|hurry|kill|dead|die|blood|evil|hate|stupid|timer|buy|purchase|miss|mistake|late|now or)\b", re.I)
INJ = re.compile(r"\b(injur\w*|hurt|pain|wound\w*|bone|crack\w*|broken|break|breaks)\b", re.I)
BODY = re.compile(r"\b(throat|eyes?|groin|nose|neck)\b", re.I)
WEAPON = re.compile(r"\b(blade|sword|knife|knives|gun)\b", re.I)
e = []
d = json.load(open(F)); h = d.get("help", [])
if not d.get("notes"): e.append("missing top-level notes")
if not 1 <= len(h) <= 6: e.append(f"need 1 to 6 lines, got {len(h)}")
if [x.get("session") for x in h] != list(range(1, len(h) + 1)): e.append("sessions must be 1..n in order, one line each")
if len({x.get("id") for x in h}) != len(h): e.append("duplicate id")
for x in h:
    i = x.get("id", "?"); t = x.get("line", "")
    for k in ("id", "session", "screen", "trigger", "line"):
        if k not in x: e.append(f"{i}: missing {k}")
    if not re.fullmatch(r"[a-z]+(-[a-z]+)*", i): e.append(f"{i}: id must be kebab-case")
    if len(t) >= 80: e.append(f"{i}: {len(t)} characters (max 79)")
    if len(t.split()) > 8: e.append(f"{i}: {len(t.split())} words (max 8)")
    marks = re.findall(r"[.!?]", t)
    if not t.endswith((".", "!")) or len(marks) > 2 or (len(marks) == 2 and marks[0] != "?"): e.append(f"{i}: must be one sentence, or a short question then a short answer")
    if re.search(r"\d", t): e.append(f"{i}: no digits")
    for rx, label in ((BAN, "a word not for ages 6-9 or one that pressures"), (BODY, "a body-part word"), (WEAPON, "a weapon word")):
        if rx.search(t): e.append(f"{i}: {label}: {rx.search(t).group()}")
    if INJ.search(t): e.append(f"{i}: injury or break word: {INJ.search(t).group()}")
    if re.search(r"\b(strike|dash|counter)\b", t): e.append(f"{i}: write STRIKE, DASH or COUNTER in capitals")
if h and "swap" in h[0].get("line", "").lower(): e.append("the swap idea must not come first")
for x in h:
    Y = {"help-slots": "seal-unlock-equip-tip", "help-seals": "seal-unlock-equip-tip", "help-kata-class": "kata-power-unlock-screen"}
    if x.get("id") in Y and x.get("yieldsTo") != Y[x["id"]]: e.append(f"{x.get('id')}: needs yieldsTo {Y[x['id']]} (same idea as that unlock text)")
print(f"{F.name}: {len(h)} lines")
for x in e: print("  FAIL", x)
print("OK: fighting style help passes" if not e else f"{len(e)} problem(s)")
sys.exit(1 if e else 0)
