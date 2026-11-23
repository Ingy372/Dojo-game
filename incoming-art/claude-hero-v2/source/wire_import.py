"""Points the hero's art packs at the v2 renders and adds one pack per skin and body (run once the renders are done).

    python incoming-art/claude-hero-v2/source/wire_import.py
"""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
P = os.path.join(ROOT, "tools", "art-import", "approved.json")
d = json.load(open(P, encoding="utf8"))
SWAP = {
    "incoming-art/player-custom/sprites/": "incoming-art/claude-hero-v2/sprites/",
    "incoming-art/claude-kata-moves/sprites/": "incoming-art/claude-hero-v2/sprites-kata/",
    "incoming-art/form-stances-a2/sprites/": "incoming-art/claude-hero-v2/sprites-stances/",
}


def swap(path):
    for a, b in SWAP.items():
        if path.startswith(a):
            return b + path[len(a):]
    return path


for name, pack in d["packs"].items():
    if not name.startswith("player-"):
        continue
    for src in pack["sources"]:
        src["json"] = swap(src["json"])
        if "mergeAnimations" in src:
            src["mergeAnimations"] = [swap(m) for m in src["mergeAnimations"]]
    if "v2" not in pack.get("note", ""):
        pack["note"] = pack.get("note", "") + " Hero v2 (Claude, Nov 22, waiting on Jay's OK)."
for body in "ab":
    meta = json.load(open(os.path.join(ROOT, f"incoming-art/claude-hero-v2/sprites-skins/body-{body}/player-{body}.json")))
    for layer in [l["name"] for l in meta["layers"]]:
        d["packs"][f"player-{body}-{layer}"] = {
            "note": f"Shop skin {layer} for body {body.upper()} (Claude, Nov 22, waiting on Jay's OK). Loaded only when worn or previewed.",
            "sources": [{"id": "player", "type": "character", "json": f"incoming-art/claude-hero-v2/sprites-skins/body-{body}/player-{body}.json",
                         "layers": [layer], "mergeAnimations": [f"incoming-art/claude-hero-v2/sprites-stances/body-{body}/player-{body}.json"]}],
        }
d["packs"]["shop-icons"] = {"note": "Shop card icons for the skins (Claude, Nov 22): the v2 hero wearing each one.",
                            "sources": [{"id": "shop-icons", "type": "static", "json": "incoming-art/claude-hero-v2/shop-icons/static.json"}]}
open(P, "w", encoding="utf8", newline="\n").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
print("wired")
