"""After render_static: rename <name>_<name>.png to icon-<id>.png and record frames = 1 (brief: Batch 8 format).
    python3 icons/source/finalize_icons.py   (from incoming-art/)"""
import json, os
SP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sprites"); p = os.path.join(SP, "static.json")
J = json.load(open(p))
for k, s in J["sprites"].items():
    for l, f in list(s["files"].items()):
        if f != k + ".png" and os.path.exists(os.path.join(SP, f)): os.replace(os.path.join(SP, f), os.path.join(SP, k + ".png"))
        s["files"][l] = k + ".png"
    s["frames"] = 1; s["anchorNote"] = "anchor = centre of the 128 x 128 image"
json.dump(J, open(p, "w"), indent=2); print(sorted(os.listdir(SP)))
