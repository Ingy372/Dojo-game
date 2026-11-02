#!/usr/bin/env python3
"""Checks drafts/content/town/town-changes.json against town-changes.md (C-STORY-g, v3).
Belt order matches docs/curriculum.md; town pictures stop at Blue (White to Blue have a pictureId, Red to Black have none
and show the Blue picture); no art add-on options remain; the gold flame is marked superseded; the 14 clash resolutions
are present; the md has 2-3 mechanic proposals for Red up, each marked PROPOSAL with a pitch, per-belt growth, sample
lines and why it is fun; reward lines are short and kid-readable; no "perfect"; no Bible references (faith content
lives only in drafts/content/faith/); the md repeats every reward line and pictureId from the JSON."""
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
ids = [c["pictureId"] for c in d["changes"] if c["pictureId"]]
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
BLUE = "Blue"
cap = names.index(BLUE)
for i, c in enumerate(d["changes"]):
    b = c["beltName"]
    if "addOnOptions" in c: e.append(f"{b}: art add-on options are dropped (Blue cap)")
    if i <= cap:
        if not c.get("pictureId"): e.append(f"{b}: needs a pictureId")
        elif c["pictureId"] not in md: e.append(f"{b}: pictureId not in the md")
        line(b, c.get("rewardMessage"))
    else:
        if c.get("pictureId") is not None: e.append(f"{b}: no pictureId after Blue (town visuals stop at Blue)")
        if c.get("usesPicture") != d["changes"][cap]["pictureId"]: e.append(f"{b}: must use the Blue picture")
        if c.get("rewardMessage") is not None: e.append(f"{b}: reward line waits for Jay's mechanic pick")
gf = d.get("goldFlame", {})
if "superseded" not in gf.get("status", ""): e.append("goldFlame must be marked superseded by the Blue cap")
if "Gold flame for Red: superseded" not in md: e.append("md must note the gold flame is superseded")
sec = md.split("## From Red up", 1)
if len(sec) < 2: e.append("md needs a 'From Red up' section")
else:
    body = sec[1].split("\n## ", 1)[0]
    opts = re.findall(r"^### Option (\d): (.+?) \(PROPOSAL\)\s*$", body, re.M)
    if not 2 <= len(opts) <= 3: e.append(f"need 2-3 PROPOSAL mechanic options, found {len(opts)}")
    parts = re.split(r"^### ", body, flags=re.M)[1:]
    for part in parts:
        if not part.startswith("Option"): continue
        t = part.split("\n", 1)[0]
        if "**Pitch:**" not in part: e.append(f"{t}: needs a pitch")
        if "**Why it's fun:**" not in part: e.append(f"{t}: needs a why-it's-fun")
        if "Sample lines" not in part: e.append(f"{t}: needs sample lines")
        for belt in ("Red", "Red/Black", "Brown", "Brown/Black", "Black"):
            if not re.search(rf"^\| {re.escape(belt)} \|", part, re.M): e.append(f"{t}: needs a row for {belt}")
for w in ("dummy", "brazier", "pennant", "wind chime", "rainbow"):
    if re.search(rf"\b{w}", json.dumps(d["changes"]), re.I): e.append(f"old art add-on word {w!r} still in the JSON")
blob = json.dumps(d) + md
if re.search(r"perfect", blob, re.I): e.append('"perfect" is banned')
if re.search(r"\b(?:[1-3] )?(?:Gen|Exod|Ps|Prov|Isa|Matt|Mark|Luke|John|Rom|Heb|Josh|Phil|Cor|Eph|Col)[a-z]*\.? \d+:\d+", blob): e.append("Bible reference found; faith content belongs in drafts/content/faith/")
for t in texts:
    if re.search(r"\b(shame|failed|behind|ugly|broken)\b", t, re.I): e.append(f"reward line has a negative word: {t}")
for x in e: print("FAIL", x)
print(f"{len(d['changes'])} belts, {len(d['clashResolutions'])} clashes, {len(texts)} reward lines, {len(e)} problems")
sys.exit(1 if e else 0)
