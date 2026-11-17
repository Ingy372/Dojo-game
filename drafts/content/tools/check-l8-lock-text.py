#!/usr/bin/env python3
"""L8-C1: check drafts/content/abilities/L8-lock-text.json.
Kid lines: 8 words or fewer, one sentence for card/rank lines, no digits outside placeholders, no body-target,
injury, weapon or pressure words, COUNTER/DASH/STRIKE in capitals (or 'Great Counter'). Structure: ranks match
L8-SPEC section 3 (A: 17, 28, 31, 36; B: 32, 33, 35, 39), group names are marked placeholders, no rank text
promises a dropped number (time, push, Focus). Usage: python3 drafts/content/tools/check-l8-lock-text.py [file]"""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
F = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R / "drafts/content/abilities/L8-lock-text.json"
BAN = re.compile(r"\b(perfect\w*|must|have to|never|only|missing|lost|fail\w*|wrong|hurry|kill|dead|die|blood|evil|hate|stupid|timer|buy|purchase|injured)\b", re.I)
INJ = re.compile(r"\b(injur\w*|hurt|pain|wound\w*|bone|crack\w*|broken|break|breaks|hyperextension)\b", re.I)
BODY = re.compile(r"\b(throat|eyes?|groin|nose|neck|elbows?|joints?|head|face|knees?|legs?|shoulders?|wrists?|arms?)\b", re.I)
WEAPON = re.compile(r"\b(blade|sword|knife|knives|gun)\b", re.I)
DROPPED = re.compile(r"\b(longer|push\w*|focus|knock\w*)\b", re.I)
SPEC = {"lock-arm": [17, 28, 31, 36], "lock-wrist": [32, 33, 35, 39]}
e = []
d = json.load(open(F))
def kid(where, t, sentence=True, names_ok=()):
    if not isinstance(t, str) or not t: e.append(f"{where}: missing text"); return
    s = t
    for n in names_ok: s = s.replace(n, "")
    s = re.sub(r"\{[a-z]+\}", "x", s)
    if len(re.findall(r"[A-Za-z']+", re.sub(r"\{[a-z]+\}", "x", t))) > 8: e.append(f"{where}: over 8 words: {t}")
    if re.search(r"\d", s): e.append(f"{where}: digit: {t}")
    for rx, label in ((BAN, "banned/pressure"), (INJ, "injury"), (BODY, "body target"), (WEAPON, "weapon")):
        m = rx.search(s)
        if m: e.append(f"{where}: {label} word '{m.group()}': {t}")
    if re.search(r"\b(strike|dash|counter)\b", s): e.append(f"{where}: write STRIKE, DASH or COUNTER in capitals")
    if sentence and (not t.endswith((".", "!")) or len(re.findall(r"[.!?]", t)) != 1): e.append(f"{where}: one sentence: {t}")
fams = {f["id"]: f for f in d["families"]}
if set(fams) != set(SPEC): e.append(f"families {sorted(fams)} != {sorted(SPEC)}")
for fid, want in SPEC.items():
    f = fams.get(fid, {})
    if not f.get("namePlaceholder") or f.get("name") not in d.get("placeholders", []): e.append(f"{fid}: name must be a marked placeholder")
    kid(f"{fid} text", f.get("text"))
    got = [r["technique"] for r in f.get("ranks", [])]
    if got != want: e.append(f"{fid}: ranks {got} != {want}")
    for r in f.get("ranks", []):
        kid(f"#{r['technique']} text", r["text"])
        if DROPPED.search(r["text"]): e.append(f"#{r['technique']}: promises a dropped effect: {r['text']}")
        if not (1 <= len(r["name"].split()) <= 4): e.append(f"#{r['technique']}: name 1-4 words")
        if r["callout"] != f"Self-Defense #{r['technique']}": e.append(f"#{r['technique']}: callout")
kid("bothGroups", d.get("bothGroups"))
ev = d["evolution"]
for k in ("title", "line", "legacyTitle"): kid(f"evolution {k}", ev[k], names_ok=("Lock (arm)", "Lock (wrist)"))
for k in ("button", "legacyRow", "stageLabel", "callout"): kid(f"evolution {k}", ev[k], sentence=False)
assert not e, "\n".join(e)
print("ok L8-lock-text: 2 groups, 8 ranks, evolution card")
