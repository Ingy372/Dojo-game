#!/usr/bin/env python3
"""Checks drafts/content/town/town-changes.json against town-changes.md (C-STORY-g).
Belt order matches docs/curriculum.md; every belt has a picture; the 14 clash resolutions are present;
Red to Black belts have 2-3 add-on options, all marked PROPOSAL; reward lines are short and kid-readable;
no "perfect"; no Bible references (faith content lives only in drafts/content/faith/); the md repeats every
reward line, option id and pictureId from the JSON."""
import json, re, sys, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
d = json.loads((R/"drafts/content/town/town-changes.json").read_text())
md = (R/"drafts/content/town/town-changes.md").read_text()
cur = (R/"docs/curriculum.md").read_text()
e = []
m = re.search(r"## The ranks, in order\s+(.+)", cur)
order = [x.strip() for x in m.group(1).split("→")]
order = [{"Red with a black stripe": "Red/Black", "Brown with a black stripe": "Brown/Black"}.get(x, x) for x in order]
names = [c["beltName"] for c in d["changes"]]
if names != order: e.append(f"belt order {names} != curriculum {order}")
if d.get("beltOrder") != order: e.append("beltOrder does not match the curriculum")
if [c["order"] for c in d["changes"]] != list(range(1, len(order) + 1)): e.append("order numbers must run 1..N")
ids = [c["pictureId"] for c in d["changes"]]
if len(set(ids)) != len(ids): e.append("pictureIds must be unique")
if sorted(x["n"] for x in d["clashResolutions"]) != list(range(1, 15)): e.append("need clash resolutions 1..14")
for x in d["clashResolutions"]:
    if not x["resolution"].strip(): e.append(f"clash {x['n']} has no resolution")
    if not re.search(rf"^\| {x['n']} \| ", md, re.M): e.append(f"md is missing clash row {x['n']}")
texts = []
def line(owner, s):
    if not s: e.append(f"{owner}: empty reward line"); return
    texts.append(s)
    if len(s) > 90: e.append(f"{owner}: reward line over 90 characters")
    if s not in md: e.append(f"{owner}: reward line not in the md")
for c in d["changes"]:
    b = c["beltName"]
    if c["pictureId"] not in md: e.append(f"{b}: pictureId not in the md")
    opts = c.get("addOnOptions")
    if c["rewardMessage"] is None and not opts: e.append(f"{b}: needs a reward line or options")
    if c["rewardMessage"] is not None: line(b, c["rewardMessage"])
    if opts:
        if not 2 <= len(opts) <= 3: e.append(f"{b}: needs 2-3 options, has {len(opts)}")
        if "PROPOSAL" not in c.get("addOnStatus", ""): e.append(f"{b}: addOnStatus must say PROPOSAL")
        for o in opts:
            if o.get("status") != "PROPOSAL": e.append(f"{o['id']}: must be marked PROPOSAL")
            if o["id"] not in md: e.append(f"{o['id']}: not in the md")
            line(o["id"], o["rewardMessage"])
    elif c["belt"] in ("red-black", "brown", "brown-black", "black"): e.append(f"{b}: needs add-on options")
red = next(c for c in d["changes"] if c["belt"] == "red")
if "gold flame" not in red["whatYouSee"] or "gold flame" not in red["rewardMessage"]: e.append("Red must keep the gold flame")
blob = json.dumps(d) + md
if re.search(r"perfect", blob, re.I): e.append('"perfect" is banned')
if re.search(r"\b(?:[1-3] )?(?:Gen|Exod|Ps|Prov|Isa|Matt|Mark|Luke|John|Rom|Heb|Josh|Phil|Cor|Eph|Col)[a-z]*\.? \d+:\d+", blob): e.append("Bible reference found; faith content belongs in drafts/content/faith/")
for t in texts:
    if re.search(r"\b(shame|failed|behind|ugly|broken)\b", t, re.I): e.append(f"reward line has a negative word: {t}")
for x in e: print("FAIL", x)
print(f"{len(d['changes'])} belts, {len(d['clashResolutions'])} clashes, {len(texts)} reward lines, {len(e)} problems")
sys.exit(1 if e else 0)
