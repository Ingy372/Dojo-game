#!/usr/bin/env python3
"""Checks drafts/content/tutorial/dash-only-lesson.json (C13-4).
Lessons use the content/tutorial/first-session-lessons.json keys; floorSteps use the tutorial-floor.json keys.
Rules: one sentence per screen, under 12 words; advance/waitFor set; dash-only lines name the shape cue, not colour alone; no COUNTER advice for stripes."""
import json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parents[3]
d = json.loads((R / "drafts/content/tutorial/dash-only-lesson.json").read_text())
ref = json.loads((R / "content/tutorial/first-session-lessons.json").read_text())
LESSON_KEYS = set().union(*(l.keys() for l in ref["lessons"])) | {"triggerKey"}
bad = []
def line_ok(where, s):
    if len(s.split()) >= 12: bad.append((where, "12+ words", s))
    if len(re.findall(r"[.!?](\s|$)", s)) > 1 and where.endswith("screen"): bad.append((where, "one sentence per screen", s))
    if re.search(r"\b(stripes?|lane)\b", s, re.I) and re.search(r"\bCOUNTER\b", s) and not re.search(r"can't be COUNTER|circle", s): bad.append((where, "stripes are never COUNTERed", s))
    if re.search(r"\bpurple\b", s, re.I) and not re.search(r"\bstripes?\b", s, re.I): bad.append((where, "colour needs the shape cue", s))
for l in d["lessons"]:
    extra = set(l) - LESSON_KEYS
    if extra: bad.append((l["id"], "keys not in first-session format", sorted(extra)))
    for k in ("id","order","trigger","screens","practice","retry","earliestSession","ignoresSessionLimit","fadingFollowUp"):
        if k not in l: bad.append((l["id"], "missing", k))
    for s in l["screens"]: line_ok(l["id"]+" screen", s)
    for k in ("practice","success","retry","nudge"):
        if l.get(k): line_ok(f"{l['id']} {k}", l[k])
ids = {l["id"] for l in d["lessons"]}
for s in d["floorSteps"]:
    if s.get("advance") not in ("tap","move"): bad.append((s["id"], "advance"))
    if s["advance"] == "move" and not s.get("waitFor"): bad.append((s["id"], "waitFor"))
    if s["advance"] == "tap" and s.get("waitFor") is not None: bad.append((s["id"], "tap steps have waitFor null"))
    if s.get("usesLesson") and s["usesLesson"] not in ids: bad.append((s["id"], "unknown lesson", s["usesLesson"]))
    for x in s["screens"]: line_ok(s["id"]+" screen", x)
    for k in ("success","retry"):
        if s.get(k): line_ok(f"{s['id']} {k}", s[k])
allt = " ".join(" ".join(l["screens"]) for l in d["lessons"])
for need in ("striped lane", "double marks", "can't be COUNTERed", "DASH", "red circle"):
    if need.lower() not in allt.lower(): bad.append(("lessons", "must teach", need))
for b in bad: print(b)
print("ok" if not bad else "FAIL", len(d["lessons"]), "lessons,", len(d["floorSteps"]), "floor steps"); sys.exit(1 if bad else 0)
