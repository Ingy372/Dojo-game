#!/usr/bin/env python3
"""Checks drafts/content/town/town-changes.json against town-changes.md (C-STORY-g, v4).
Belt order matches docs/curriculum.md; town pictures stop at Blue (White to Blue have a pictureId, Red to Black have none
and show the Blue picture); no art add-on options remain and no gold flame anywhere; the 14 clash resolutions are present
and clash 3 is marked decided; Tuck is Red only (placeholder name marked, arrival, task, manners, dusk story, reward line,
Artist sprite note); Red/Black, Brown, Brown/Black and Black each have one PROPOSAL with pitch, sample lines, reward line,
why it is fun and a scope flag; every reward line is short, kid-readable and in the md; no "perfect"; no Bible references
(faith content lives only in drafts/content/faith/); the md repeats every pictureId from the JSON."""
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
        line(b, c.get("rewardMessage"))
        if b == "Red" and "DECIDED" not in c.get("mechanicStatus", ""): e.append("Red: Tuck must be marked DECIDED")
        if b != "Red" and "PROPOSAL" not in c.get("mechanicStatus", ""): e.append(f"{b}: its mechanic must be marked PROPOSAL")
if "goldFlame" in d: e.append("goldFlame was dropped; remove it from the JSON")
c3 = next(x for x in d["clashResolutions"] if x["n"] == 3)
if "DECIDED" not in c3["resolution"]: e.append("clash 3 must be marked DECIDED")
if not re.search(r"^\| 3 \|.*DECIDED", md, re.M): e.append("md clash row 3 must be marked DECIDED")
tk = d.get("tuck", {})
if "PLACEHOLDER" not in tk.get("nameStatus", ""): e.append("Tuck must be marked as a placeholder name")
if tk.get("belt") != "red": e.append("Tuck is the Red upgrade only")
for k in ("arrival", "task", "manners", "duskStory", "reward", "artist", "programmer", "why"):
    if not tk.get(k): e.append(f"tuck.{k} is missing")
if tk.get("reward") != next(c for c in d["changes"] if c["beltName"] == "Red")["rewardMessage"]: e.append("Tuck's reward line must be Red's reward line")
if '"Tuck" is a placeholder name' not in md: e.append("md must say Tuck is a placeholder name")
if "A Tuck sprite" not in md: e.append("md must tell the Artist a Tuck sprite is needed")
props = d.get("proposals", [])
if [p["belt"] for p in props] != ["red-black", "brown", "brown-black", "black"]: e.append("need one proposal each for Red/Black, Brown, Brown/Black and Black")
if len({p["id"] for p in props}) != len(props): e.append("each proposal must be a different idea")
for p in props:
    for k in ("name", "pitch", "growth", "lines", "reward", "why", "scope"):
        if not p.get(k): e.append(f"proposal {p.get('id')}: missing {k}")
    if "PROPOSAL" not in p.get("status", ""): e.append(f"proposal {p['id']}: must be marked PROPOSAL")
    if not re.match(r"(SMALL|MEDIUM|LARGE)", p.get("scope", "")): e.append(f"proposal {p['id']}: scope flag must start with SMALL, MEDIUM or LARGE")
    if not re.search(rf"^### \S+: {re.escape(p['name'])} \(PROPOSAL\)\s*$", md, re.M): e.append(f"proposal {p['id']}: md heading missing")
    for l in p["lines"]:
        if l not in md: e.append(f"proposal {p['id']}: sample line not in the md")
    if p["reward"] not in md: e.append(f"proposal {p['id']}: reward line not in the md")
    texts_p = [p["reward"]] + p["lines"]
    for l in texts_p:
        if re.search(r"\b(shame|failed|behind|ugly|broken)\b", l, re.I): e.append(f"proposal {p['id']}: negative word in {l}")
tm = (tk.get("task", {}).get("lines", {}) or {}).values()
for l in list(tm) + [tk.get("manners", {}).get("kinder", "")] + tk.get("duskStory", {}).get("lines", []):
    if l and l not in md: e.append(f"Tuck line not in the md: {l}")
for w in ("dummy", "brazier", "pennant", "wind chime", "rainbow"):
    if re.search(rf"\b{w}", json.dumps(d["changes"]), re.I): e.append(f"old art add-on word {w!r} still in the JSON")
blob = json.dumps(d) + md
if re.search(r"gold flame", blob, re.I): e.append("the gold flame is dropped; remove the mention")
if re.search(r"perfect", blob, re.I): e.append('"perfect" is banned')
if re.search(r"\b(?:[1-3] )?(?:Gen|Exod|Ps|Prov|Isa|Matt|Mark|Luke|John|Rom|Heb|Josh|Phil|Cor|Eph|Col)[a-z]*\.? \d+:\d+", blob): e.append("Bible reference found; faith content belongs in drafts/content/faith/")
for t in texts:
    if re.search(r"\b(shame|failed|behind|ugly|broken)\b", t, re.I): e.append(f"reward line has a negative word: {t}")
for x in e: print("FAIL", x)
print(f"{len(d['changes'])} belts, {len(d['clashResolutions'])} clashes, {len(texts)} reward lines, {len(e)} problems")
sys.exit(1 if e else 0)
