"""Post-render touch-up of a sheet JSON: the 'suggested' note (the blends were built before the wording changed)."""
import json, sys
for p in sys.argv[1:]:
    J = json.load(open(p)); J["suggested"]["note"] = "default look (approved by Jay); the game can set another belt (beltStyles) and gi colour"
    json.dump(J, open(p, "w"), indent=1)
