"""Checks content/tutorial/tutorial-floor.json: every line < 12 words, advance/waitFor set, enemy names exist."""
import json, pathlib, re
R = pathlib.Path(__file__).resolve().parents[3]
d = json.loads((R / "content/tutorial/tutorial-floor.json").read_text())
names = {json.loads(p.read_text()).get("name") for p in (R / "content/enemies").glob("*.json")}
bad = []
for s in d["lessons"]:
    for line in s["screens"] + [s.get("success"), s.get("retry"), s.get("nudge")]:
        if line and len(line.split()) >= 12: bad.append((s["id"], line))
    if s.get("advance") not in ("tap", "move"): bad.append((s["id"], "advance"))
    if s["advance"] == "move" and not s.get("waitFor"): bad.append((s["id"], "waitFor"))
    for w in re.findall(r"\b(Swarmers?|Brutes?|Shield Guard|Bopper|Floor Keeper)\b", " ".join(s["screens"])):
        if w.rstrip("s") not in names and w not in names: bad.append((s["id"], w))
assert not bad, bad
print("ok", len(d["lessons"]), "steps")
