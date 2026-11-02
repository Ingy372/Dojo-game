#!/usr/bin/env python3
"""R-G2B-02/10: check drafted Technique Seal text files (drafts/content/abilities/seals-*-text.json).
Rules: ids unique and kebab-case; 'Self-Defense #n' technique numbers unique and in order; text is ONE sentence under 80 characters;
name is 1-4 words; no banned words ('perfect', guilt or pressure words, injury words unless causesInjured, body-part words, weapon words);
'Break' only in 'Break Free'; no digits in the text (numbers are guesses); STRIKE, DASH and COUNTER in capitals (or 'Great Counter'), never 'Perfect Counter'.
Usage: python3 drafts/content/tools/check-seals-text.py [files...]  (default: every seals-*-text.json)"""
import json, re, sys, glob, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
BAN = re.compile(r"\b(perfect|perfectly|must|have to|never|only|missing|lost|fail|failed|wrong|hurry|kill|dead|die|blood|evil|hate|stupid)\b", re.I)
INJ = re.compile(r"\b(injur\w*|hurt|pain|wound\w*|bone|crack\w*|broken|break|breaks)\b", re.I)
BODY = re.compile(r"\b(throat|eyes?|groin|nose|neck)\b", re.I)
WEAPON = re.compile(r"\b(blade|sword|knife|knives|gun)\b", re.I)
def words(s): return len(s.split())
def check(path):
    e = []; d = json.load(open(path)); seals = d.get("seals", []); nums = []
    if not d.get("notes"): e.append("missing top-level notes")
    ids = [s.get("id") for s in seals]
    for i in ids:
        if ids.count(i) > 1: e.append(f"duplicate id {i}")
    for s in seals:
        i = s.get("id", "?")
        for k in ("id", "technique", "name", "text", "causesInjured", "effectRef"):
            if k not in s: e.append(f"{i}: missing {k}")
        if not re.fullmatch(r"[a-z]+(-[a-z]+)*", i): e.append(f"{i}: id must be kebab-case")
        m = re.fullmatch(r"Self-Defense #(\d+)", s.get("technique", ""))
        if not m: e.append(f"{i}: technique must read 'Self-Defense #n'")
        else: nums.append(int(m.group(1)))
        t = s.get("text", ""); n = s.get("name", "")
        if not (1 <= words(n) <= 4): e.append(f"{i}: name should be 1-4 words")
        if len(t) >= 80: e.append(f"{i}: text is {len(t)} characters (max 79)")
        if not t.endswith(".") or len(re.findall(r"[.!?]", t)) != 1: e.append(f"{i}: text must be exactly one sentence ending in a full stop")
        if re.search(r"\d", t): e.append(f"{i}: no digits in kid text (numbers are guesses)")
        for rx, label in ((BAN, "a word not for ages 6-9 or one that pressures"), (BODY, "a body-part word"), (WEAPON, "a weapon word")):
            if rx.search(t): e.append(f"{i}: {label}: {rx.search(t).group()}")
        tt = t.replace("Break Free", "")
        if INJ.search(tt) and not s.get("causesInjured"): e.append(f"{i}: injury or break word without causesInjured: {INJ.search(tt).group()}")
        if re.search(r"\bperfect counter\b", t, re.I): e.append(f"{i}: say 'Great Counter'")
        if re.search(r"\b(strike|dash|counter)\b", t): e.append(f"{i}: write STRIKE, DASH or COUNTER in capitals (or 'Great Counter'), as in abilities.json")
    if nums != sorted(nums) or len(set(nums)) != len(nums): e.append("technique numbers must be unique and in order")
    if nums and nums != list(range(nums[0], nums[0] + len(nums))): e.append("technique numbers must be consecutive")
    return e, len(seals)
files = sys.argv[1:] or sorted(glob.glob(str(R / "drafts/content/abilities/seals-*-text.json")))
bad = 0
for f in files:
    e, n = check(f); name = pathlib.Path(f).name
    print(f"{name}: {n} seals")
    for x in e: print("  FAIL", x); bad += 1
print("OK: seal text files pass" if not bad else f"{bad} problem(s)")
sys.exit(1 if bad else 0)
