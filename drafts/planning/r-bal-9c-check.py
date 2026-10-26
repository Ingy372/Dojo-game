#!/usr/bin/env python3
"""R-BAL-9c: check the LIVE enemy files (content/enemies/) against the #188 expected white Artist,
Standard and Challenge x1.5. Uses r-bal-9-sim.py's own Artist model and check().
Run: python3 drafts/planning/r-bal-9c-check.py"""
import importlib.util, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("rbal9", os.path.join(HERE, "r-bal-9-sim.py"))
m = importlib.util.module_from_spec(spec); sys.argv = [sys.argv[0]]; spec.loader.exec_module(m)
LIVE = os.path.join(HERE, "..", "..", "content", "enemies")
a1 = m.expected_artists()[1]
BANDS = {"swarmer": m.ess.BANDS["small"], "shield": m.ess.BANDS["mid"], "brute": m.ess.BANDS["heavy"], "floor-keeper": {"hits": (40, 80), "ko_min": 5}}
bad = 0
for eid, band in BANDS.items():
    e = json.load(open(os.path.join(LIVE, eid + ".json")))
    bs, bc, ks, kc, ok = m.check((e["maxHealth"], e["power"], e["guard"]), a1, band)[:5]
    bad += not ok
    print(f"{eid:>13}  H{e['maxHealth']} P{e['power']} G{e['guard']}  beat {bs}/{bc} (band {band['hits'][0]}-{band['hits'][1]})  KO {ks}/{kc} (min {band['ko_min']})  {'PASS' if ok else 'OUT'}")
print("ALL PASS" if not bad else f"{bad} OUT"); sys.exit(1 if bad else 0)
