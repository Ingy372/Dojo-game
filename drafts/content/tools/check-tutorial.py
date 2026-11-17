"""Checks a tutorial lines file (default content/tutorial/tutorial-floor.json): every line < 12 words,
advance/waitFor set, enemy names exist. TUT-C1: pass a path to check a draft; --kid also checks
kid lines are 8 words or fewer with no banned words, plus opening cards, stumble line and faith swaps.
Usage: check-tutorial.py [path] [--kid]"""
import json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parents[3]
args = [a for a in sys.argv[1:] if not a.startswith("--")]
kid = "--kid" in sys.argv
p = pathlib.Path(args[0]) if args else R / "content/tutorial/tutorial-floor.json"
d = json.loads(p.read_text())
names = {json.loads(q.read_text()).get("name") for q in (R / "content/enemies").glob("*.json")}
BANNED = ("perfect", "loot box", "buy", "purchase", "streak", "hurry", "fail", "lose", "stupid")
bad = []
def wc(line): return len(re.findall(r"[A-Za-z0-9']+", line))
def check(label, line):
    if not line: return
    if len(line.split()) >= 12: bad.append((label, line))
    if kid:
        if wc(line) > 8: bad.append((label, f"{wc(line)} words (max 8)", line))
        for w in BANNED:
            if re.search(r"\b" + w + r"\b", line.lower()): bad.append((label, "banned: " + w, line))
for s in d["lessons"]:
    for line in s["screens"] + [s.get("success"), s.get("retry"), s.get("nudge")]: check(s["id"], line)
    if s.get("advance") not in ("tap", "move"): bad.append((s["id"], "advance"))
    if s["advance"] == "move" and not s.get("waitFor"): bad.append((s["id"], "waitFor"))
    for w in re.findall(r"\b(Swarmers?|Brutes?|Shield Guard|Bopper|Floor Keeper)\b", " ".join(s["screens"] + [s.get("retry") or ""])):
        if w.rstrip("s") not in names and w not in names: bad.append((s["id"], w))
op = d.get("opening")
if op:
    for c in op["cards"]: check(f"card {c['n']}", c["text"])
    check("opening sensei", op.get("sensei"))
check("stumble", d.get("stumble"))
if kid and p.name == "TUT-C1.json":
    f = R / "drafts/content/faith/TUT-C1-faith.json"
    if f.exists():
        for sw in json.loads(f.read_text())["swaps"]: check(f"faith card {sw['card']}", sw["faith"])
    beats = {s.get("beat") for s in d["lessons"]} | ({0} if op else set())
    missing = set(range(12)) - beats
    if missing: bad.append(("beats missing", sorted(missing)))
assert not bad, bad
print("ok", len(d["lessons"]), "steps", p.name)
