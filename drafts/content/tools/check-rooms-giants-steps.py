#!/usr/bin/env python3
"""R-G2B-07: check the drafted Tier 4 room set (drafts/content/rooms/giants-steps.json) against the content/rooms/ format and the floor plan.
Checks: keys and legend like content/rooms/*.json; minBeltTier 4; floorSet 'giants-steps'; ids unique and not used by content/rooms; every tile known,
all-wall edge, doors (D) only in the top wall and not in corners, exactly one P, chest/shrine by room kind; every floor tile reachable from P;
room sizes by kind (20x12 battle and challenge, 20x14 boss, 13x9 treasure and rest); the two middle columns of battle rooms stay clear of walls;
enemies stand on '.', away from P, waves count up from 1, wave and room sizes; no stat keys anywhere; the floor table agrees with the rooms
(enemies per floor, Boulder Roller only on floors 4-5 and only in rooms with a clear 3-tile lane); signs short and gentle.
Usage: python3 drafts/content/tools/check-rooms-giants-steps.py [file]"""
import json, re, sys, glob, pathlib, collections
R = pathlib.Path(__file__).resolve().parents[3]
path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else R / "drafts/content/rooms/giants-steps.json"
d = json.load(open(path)); e = []
LEGEND = "# = wall, . = floor, P = player start, D = door slot (in the outer wall), C = chest, S = rest shrine"
ENEMIES = {"pebble-pal", "cliff-goat", "stack-golem", "boulder-roller", "stone-giant"}
SIZE = {"battle": (20, 12), "challenge": (20, 12), "boss": (20, 14), "treasure": (13, 9), "rest": (13, 9)}
STATS = re.compile(r"^(maxHealth|health|hp|power|guard|speed|moveSpeed\w*|radius|damage|strength|attack|sightRange|parSeconds|telegraphTicks|recoverTicks)$")
BAN = re.compile(r"\b(perfect|must|never|only|hurry|fail\w*|lost|kill\w*|dead|die|blood|evil|hate|stupid|blade|sword|knife)\b", re.I)
def walk(o, where):
    if isinstance(o, dict):
        for k, v in o.items():
            if STATS.match(k): e.append(f"{where}: stat key '{k}' (no enemy stats in this item)")
            walk(v, where)
    elif isinstance(o, list):
        for v in o: walk(v, where)
walk(d, "file")
for k in ("notes", "tier", "place", "faithOverlayKey", "floors", "rooms"):
    if k not in d: e.append(f"missing top-level {k}")
if d.get("tier") != "green": e.append("tier must be 'green'")
used = set()
for f in glob.glob(str(R / "content/rooms/*.json")): used.add(json.load(open(f))["id"])
ids = [r.get("id") for r in d.get("rooms", [])]
byid = {r["id"]: r for r in d.get("rooms", [])}
kinds = collections.Counter(r.get("kind") for r in d.get("rooms", []))
if dict(kinds) != {"battle": 4, "challenge": 1, "treasure": 1, "rest": 1, "boss": 1}: e.append(f"expected 4 battle, 1 challenge, 1 treasure, 1 rest, 1 boss; got {dict(kinds)}")
seen_tiles = {}
def roller_lane_ok(tiles, c, r):
    for dr in (1, 2, 3):
        if tiles[r + dr][c] != ".": return False
        if tiles[r + dr][c - 1] == "#" and tiles[r + dr][c + 1] == "#": return False
    return True
for r in d.get("rooms", []):
    i = r.get("id", "?"); k = r.get("kind")
    if ids.count(i) > 1: e.append(f"{i}: duplicate id")
    if i in used: e.append(f"{i}: id already used by a room in content/rooms/")
    if not re.fullmatch(r"[a-z]+(-[a-z]+)*", i): e.append(f"{i}: id must be kebab-case")
    need = ["id", "name", "kind", "minBeltTier", "floorSet", "legend", "tiles", "artProps", "signs"] + (["earliestRoom"] if k in ("battle", "challenge") else []) + (["waves_note", "enemies"] if k in ("battle", "challenge", "boss") else [])
    for x in need:
        if x not in r: e.append(f"{i}: missing {x}")
    if r.get("minBeltTier") != 4: e.append(f"{i}: minBeltTier must be 4")
    if r.get("floorSet") != "giants-steps": e.append(f"{i}: floorSet must be 'giants-steps'")
    if r.get("legend") != LEGEND: e.append(f"{i}: legend differs from content/rooms/")
    if k == "challenge" and set(r.get("challenge", {})) != {"seconds", "text", "inTimeText", "outOfTimeText", "outOfTimeShort"}: e.append(f"{i}: challenge block keys differ from supper-rush")
    t = r.get("tiles", []); h = len(t); w = len(t[0]) if t else 0
    if (w, h) != SIZE.get(k): e.append(f"{i}: size {w}x{h}, expected {SIZE.get(k)} for {k}")
    if any(len(x) != w for x in t): e.append(f"{i}: tiles not rectangular"); continue
    if set("".join(t)) - set("#.PDCS"): e.append(f"{i}: unknown tile letter {set(''.join(t)) - set('#.PDCS')}")
    for y, row in enumerate(t):
        for x, ch in enumerate(row):
            edge = y in (0, h - 1) or x in (0, w - 1)
            if edge and ch not in "#D": e.append(f"{i}: edge ({x},{y}) must be wall or door")
            if ch == "D" and (y != 0 or x in (0, w - 1)): e.append(f"{i}: door at ({x},{y}) must be in the top wall, not a corner")
    flat = "".join(t); cnt = collections.Counter(flat)
    if cnt["P"] != 1: e.append(f"{i}: needs exactly one P")
    if cnt["D"] < 1: e.append(f"{i}: needs a door")
    if cnt["C"] > 1 or cnt["S"] > 1: e.append(f"{i}: at most one C and one S")
    want_c = k in ("treasure", "boss", "challenge"); want_s = k == "rest"
    if (cnt["C"] == 1) != want_c: e.append(f"{i}: chest rule broken for kind {k}")
    if (cnt["S"] == 1) != want_s: e.append(f"{i}: shrine rule broken for kind {k}")
    if tuple(t) in seen_tiles: e.append(f"{i}: same layout as {seen_tiles[tuple(t)]}")
    seen_tiles[tuple(t)] = i
    if cnt["P"] != 1: continue
    py, px = next(((y, row.index("P")) for y, row in enumerate(t) if "P" in row), (0, 0))
    seen = {(px, py)}; q = [(px, py)]
    while q:
        x, y = q.pop()
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and t[ny][nx] != "#": seen.add((nx, ny)); q.append((nx, ny))
    for y, row in enumerate(t):
        for x, ch in enumerate(row):
            if ch in ".CS" and (x, y) not in seen: e.append(f"{i}: tile ({x},{y}) cannot be reached")
            if ch == "D" and (x, 1) not in seen: e.append(f"{i}: door at {x} is blocked")
    if k in ("battle", "challenge", "boss"):
        for y in range(1, h - 1):
            for x in (9, 10):
                if t[y][x] == "#": e.append(f"{i}: middle column {x} is blocked at row {y}")
    en = r.get("enemies", []); waves = collections.defaultdict(list)
    for m in en:
        c, ro, wv, name = m.get("column"), m.get("row"), m.get("wave"), m.get("enemy")
        if name not in ENEMIES: e.append(f"{i}: unknown enemy {name}")
        if not (0 < c < w - 1 and 0 < ro < h - 1) or t[ro][c] != ".": e.append(f"{i}: {name} at ({c},{ro}) is not on a floor tile")
        if abs(c - px) + abs(ro - py) < 4: e.append(f"{i}: {name} at ({c},{ro}) starts too close to P")
        if set(m) != {"enemy", "column", "row", "wave"}: e.append(f"{i}: enemy entry keys {sorted(m)}")
        waves[wv].append(m)
    if waves and sorted(waves) != list(range(1, max(waves) + 1)): e.append(f"{i}: waves must count up from 1")
    if k in ("battle", "challenge") and not (2 <= len(waves) <= 4): e.append(f"{i}: battle rooms have 2-4 waves")
    for wv, ms in waves.items():
        if len(ms) > 6: e.append(f"{i}: wave {wv} has {len(ms)} enemies (max 6)")
        rolls = [m for m in ms if m["enemy"] == "boulder-roller"]
        if len(rolls) > 1: e.append(f"{i}: wave {wv} has {len(rolls)} Boulder Rollers (max 1 per wave)")
    if len(en) > 13: e.append(f"{i}: {len(en)} enemies (max 13, like the Orange set)")
    if k == "boss" and [m["enemy"] for m in en if m["wave"] == 1][0] != "stone-giant": e.append(f"{i}: the Stone Giant must be first in wave 1")
    if k != "boss" and any(m["enemy"] == "stone-giant" for m in en): e.append(f"{i}: the Stone Giant belongs in the boss room only")
    for m in en:
        if m["enemy"] == "boulder-roller":
            if not roller_lane_ok(t, m["column"], m["row"]): e.append(f"{i}: Boulder Roller at ({m['column']},{m['row']}) has no clear 3-tile lane with room to dash aside")
            if r.get("earliestRoom", 0) < 3: e.append(f"{i}: Boulder Roller in a room before room 3")
    for s in r.get("signs", []):
        if len(s.split()) > 10 or BAN.search(s): e.append(f"{i}: sign {s!r} too long or has a banned word")
    if BAN.search(r.get("artProps", "")): e.append(f"{i}: artProps has a banned word")
# floor table against the rooms
fl = d.get("floors", [])
if [f.get("floor") for f in fl] != [1, 2, 3, 4, 5]: e.append("floors must list floors 1-5")
first_floor = {}
for f in fl:
    n = f.get("floor")
    for rid in f.get("rooms", []):
        if rid not in byid: e.append(f"floor {n}: unknown room {rid}"); continue
        first_floor.setdefault(rid, n)
        for m in byid[rid].get("enemies", []):
            if m["enemy"] not in f.get("enemies", []): e.append(f"floor {n}: room {rid} has {m['enemy']}, which is not on this floor's list")
        has_roller = any(m["enemy"] == "boulder-roller" for m in byid[rid].get("enemies", []))
        if has_roller and n < 4: e.append(f"floor {n}: Boulder Roller room {rid} on floor {n} (floors 1-3 have no stripes)")
        if has_roller and not f.get("boulderRoller"): e.append(f"floor {n}: table must say where the Boulder Roller is")
    if n in (1, 2, 3) and f.get("boulderRoller"): e.append(f"floor {n}: no Boulder Roller before floor 4")
    if n in (4, 5) and not f.get("boulderRoller"): e.append(f"floor {n}: missing boulderRoller entry")
    ne = f.get("newEnemy")
    if ne and ne not in f["enemies"]: e.append(f"floor {n}: newEnemy missing from its enemies")
for rid in byid:
    if rid not in first_floor and byid[rid]["kind"] != "boss": e.append(f"room {rid} is on no floor")
    r = byid[rid]
    if r["kind"] in ("battle", "challenge") and r.get("earliestRoom", 99) < 3 and any(m["enemy"] in ("stack-golem", "boulder-roller") for m in r.get("enemies", [])): e.append(f"{rid}: F3-4 enemies need earliestRoom 3+")
print(f"{path.name}: {len(byid)} rooms, {sum(len(r.get('enemies', [])) for r in byid.values())} enemy placements, {len(fl)} floors")
print("\n".join("FAIL " + x for x in e) if e else "OK: Giant's Steps rooms pass")
sys.exit(1 if e else 0)
