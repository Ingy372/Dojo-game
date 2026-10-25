"""C10 (PR #123) ids + names for the Tier 1 decor. Run after render_static.py: renames ids in sprites/static.json and the sprite files.
Build ids (decor-t1-*) stay inside the Blender scripts; the shipped ids are the C10 ones."""
import json, os, re, sys
D = os.path.join(os.path.dirname(__file__), "..", "sprites")
C10 = json.load(open(os.path.join(os.path.dirname(__file__), "../../../drafts/content/decorations/a6-decorations-text.json")))
M = {}
for old, new in zip(["sun-hills", "moon-clouds", "bamboo", "blossom", "waves", "peak", "koi"],
                    ["bow", "form1", "form2", "key-on", "kicks", "defense", "kindness"]):
    M[f"decor-t1-scroll-{old}"] = f"decor-a6-class-scroll-{new}"
for old, new in [("kick-pad", "kick-pad"), ("focus-mitts", "focus-mitt"), ("belt-rack", "belt-rack"), ("helmet", "sparring-helmet"),
                 ("water-bottle", "water-bottle"), ("bow-mat", "bow-mat")]:
    M[f"decor-t1-gear-{old}"] = f"decor-a6-{new}"
for old, new in [("fan", "fan-stand"), ("lantern", "lantern-small"), ("bonsai", "bonsai-small"), ("cushion", "cushion"), ("banner", "banner-small")]:
    M[f"decor-t1-{old}-tint"] = f"decor-a6-{new}-tint"; M[f"decor-t1-{old}"] = f"decor-a6-{new}"
M["decor-t1-folding-screen"] = "decor-a6-folding-screen"
PREFIX = [("decor-t1-statue-", "decor-a6-keeper-statue-"), ("decor-t1-trophy-", "decor-a6-journal-trophy-")]
def ren(s):
    for o in sorted(M, key=len, reverse=True):
        s = re.sub(re.escape(o) + r"(?![a-z0-9-])", M[o], s)
    for o, n in PREFIX: s = s.replace(o, n)
    return s
TEXT = {}
for e in C10["samples"] + C10["tier1Kinds"] + C10["classPieces"]["scrolls"] + C10["classPieces"]["gear"]: TEXT[e["id"]] = e
P = os.path.join(D, "static.json"); raw = open(P).read()
J = json.loads(ren(raw))
for k, v in J["sprites"].items():
    base = "decor-a6-keeper-statue" if "keeper-statue-floor" in k else "decor-a6-journal-trophy" if "journal-trophy-" in k else k
    t = TEXT.get(base)
    if t:
        v.setdefault("info", {}).update({"name": t["name"], "description": t["description"], "textFrom": "C10 PR #123" + (f" ({base}, shared by all variants)" if base != k else "")})
json.dump(J, open(P, "w"), indent=1)
for f in os.listdir(D):
    if f.endswith(".png") and ren(f) != f: os.rename(os.path.join(D, f), os.path.join(D, ren(f)))
if "--map" in sys.argv: print(json.dumps(M, indent=1))
