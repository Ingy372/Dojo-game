#!/usr/bin/env python3
"""R-G2B-25/26/27: check the drafted Tier 5-10 room sets (Blue to Black) in drafts/content/rooms/.
One set per file: quiet-river (Blue), forge-of-courage (Red), hall-of-echoes (Red/Black), root-library (Brown), storm-stair (Brown/Black), summit (Black).
With no argument it checks every set that exists; with a path it checks that one file.
Checks: top-level keys, tier, place and faith overlay key; 8 rooms in the Ember order (4 battle, challenge, treasure, rest, boss); keys and legend like content/rooms/;
minBeltTier and floorSet; ids kebab-case and unique across all room files; tiles known, all-wall edge, doors only in the top wall (not corners), exactly one P,
chest or shrine by kind; every floor tile reachable; sizes by kind; middle columns clear; enemies on '.', at least 4 tiles from P, only this tier's enemies (plus the Padded-Staff
Bopper in Blue), waves count up from 1, at most 6 per wave and 13 per room, 2-4 waves; rooms 1-2 use first-band enemies only and no dash-only enemy; room 3 has one new-band
enemy kind and room 4 two or more; the challenge has 3 waves with every enemy kind; the boss room opens with the Guardian and has helpers from the first band only;
a dash-only enemy has a clear 3-tile lane, at most one per wave; no stat keys; signs 10 words or fewer; kid-safe word rules; no digits in kid text.
Usage: python3 drafts/content/tools/check-rooms-tier.py [file]"""
import json, re, sys, glob, pathlib, collections
R = pathlib.Path(__file__).resolve().parents[3]
LEGEND = "# = wall, . = floor, P = player start, D = door slot (in the outer wall), C = chest, S = rest shrine"
SETS = {
 "quiet-river": dict(tier="blue", belt=5, place="The Quiet River", guardian="river-watcher", f12=["puddle-frog", "mist-wisp"], f34=["side-crab", "splash-wave"], dash=["splash-wave"], extra=["bopper"]),
 "forge-of-courage": dict(tier="red", belt=6, place="The Forge of Courage", guardian="ember-knight", f12=["coal-cub", "anvil-imp"], f34=["bellows-puff", "forge-sweep"], dash=["forge-sweep"], extra=[]),
 "hall-of-echoes": dict(tier="red-black", belt=7, place="The Hall of Echoes", guardian="echo-mask", f12=["masklet"], f34=["copycat-shade", "hush-guard", "echo-bell"], dash=["echo-bell"], extra=[]),
 "root-library": dict(tier="brown", belt=8, place="The Root Library", guardian="root-keeper", f12=["page-flutter", "bookworm"], f34=["ink-blot", "root-snapper"], dash=["root-snapper"], extra=[]),
 "storm-stair": dict(tier="brown-black", belt=9, place="The Storm Stair", guardian="storm-herald", f12=["cloud-puff", "gust-sprite"], f34=["thunder-drum", "zap-kite"], dash=["zap-kite"], extra=[]),
 "summit": dict(tier="black", belt=10, place="The Summit", guardian="lost-lightbearer", f12=["storm-wisp", "rumble-brute"], f34=["echo-knight", "sky-sweeper"], dash=["sky-sweeper"], extra=[]),
}
KINDS = ["battle", "battle", "battle", "battle", "challenge", "treasure", "rest", "boss"]
EARLIEST = [1, 2, 3, 3, 4]
SIZE = {"battle": (20, 12), "challenge": (20, 12), "boss": (20, 14), "treasure": (13, 9), "rest": (13, 9)}
STATS = re.compile(r"^(maxHealth|health|hp|power|guard|speed|moveSpeed\w*|radius|damage|strength|attack|sightRange|parSeconds|telegraphTicks|recoverTicks)$")
BAN = re.compile(r"\b(perfect|perfectly|must|have to|never|only|missing|lost|fail|failed|wrong|hurry|kill|dead|die|blood|evil|hate|stupid|timer|buy|purchase|miss|mistake|late)\b", re.I)
INJ = re.compile(r"\b(injur\w*|hurt|pain|wound\w*|bone|crack\w*|broken|break|breaks)\b", re.I)
BODY = re.compile(r"\b(throat|eyes?|groin|nose|neck)\b", re.I)
WEAPON = re.compile(r"\b(blade|sword|knife|knives|gun)\b", re.I)
def bad_word(s): return BAN.search(s) or INJ.search(s) or BODY.search(s) or WEAPON.search(s)
def known_enemy(n): return any((R / p).exists() for p in (f"drafts/content/enemies/{n}.json", f"content/enemies/{n}.json", f"drafts/content/bosses/{n}.json"))
files = [pathlib.Path(sys.argv[1])] if len(sys.argv) > 1 else [R / f"drafts/content/rooms/{k}.json" for k in SETS if (R / f"drafts/content/rooms/{k}.json").exists()]
if not files: print("no tier room files found (nothing to check)"); sys.exit(0)
other_ids = collections.defaultdict(set)
for f in glob.glob(str(R / "content/rooms/*.json")) + glob.glob(str(R / "drafts/content/rooms/*.json")):
    try:
        for r in json.load(open(f)).get("rooms", [json.load(open(f))]): other_ids[pathlib.Path(f).resolve()].add(r.get("id"))
    except Exception: pass
e = []
def walk(o, where):
    if isinstance(o, dict):
        for k, v in o.items():
            if STATS.match(k): e.append(f"{where}: stat key '{k}' (no enemy stats in this item)")
            walk(v, where)
    elif isinstance(o, list):
        for v in o: walk(v, where)
total = 0
for path in files:
    key = path.stem
    if key not in SETS: e.append(f"{path.name}: not a known tier room set"); continue
    S = SETS[key]; d = json.load(open(path)); total += 1
    ALL = set(S["f12"]) | set(S["f34"]) | set(S["extra"]); GUARD = S["guardian"]
    walk(d, key)
    for k in ("notes", "tier", "place", "faithOverlayKey", "rooms"):
        if k not in d: e.append(f"{key}: missing top-level {k}")
    if set(d) - {"notes", "tier", "place", "faithOverlayKey", "rooms"}: e.append(f"{key}: extra top-level keys {sorted(set(d) - {'notes', 'tier', 'place', 'faithOverlayKey', 'rooms'})}")
    if d.get("tier") != S["tier"]: e.append(f"{key}: tier must be '{S['tier']}'")
    if d.get("place") != S["place"]: e.append(f"{key}: place must be '{S['place']}'")
    if d.get("faithOverlayKey") != GUARD: e.append(f"{key}: faithOverlayKey must be '{GUARD}'")
    for n in sorted(ALL | {GUARD}):
        if not known_enemy(n): e.append(f"{key}: no enemy or boss file for {n}")
    rooms = d.get("rooms", []); ids = [r.get("id") for r in rooms]
    if [r.get("kind") for r in rooms] != KINDS: e.append(f"{key}: room kinds must be {KINDS}")
    used = set().union(*[v for p, v in other_ids.items() if p != path.resolve()]) if other_ids else set()
    seen_tiles = {}
    for n, r in enumerate(rooms):
        i = r.get("id", "?"); k = r.get("kind"); where = f"{key}/{i}"
        if ids.count(i) > 1: e.append(f"{where}: duplicate id")
        if i in used: e.append(f"{where}: id already used by another room file")
        if not re.fullmatch(r"[a-z]+(-[a-z]+)*", str(i)): e.append(f"{where}: id must be kebab-case")
        need = ["id", "name", "kind", "minBeltTier", "floorSet", "legend", "tiles", "artProps", "signs"] + (["earliestRoom"] if k in ("battle", "challenge") else []) + (["waves_note", "enemies"] if k in ("battle", "challenge", "boss") else []) + (["challenge"] if k == "challenge" else [])
        for x in need:
            if x not in r: e.append(f"{where}: missing {x}")
        extra = set(r) - set(need)
        if extra: e.append(f"{where}: unexpected keys {sorted(extra)}")
        if r.get("minBeltTier") != S["belt"]: e.append(f"{where}: minBeltTier must be {S['belt']}")
        if r.get("floorSet") != key: e.append(f"{where}: floorSet must be '{key}'")
        if n < 5 and r.get("earliestRoom") != EARLIEST[n]: e.append(f"{where}: earliestRoom must be {EARLIEST[n]}")
        if r.get("legend") != LEGEND: e.append(f"{where}: legend differs from content/rooms/")
        if k == "challenge" and set(r.get("challenge", {})) != {"seconds", "text", "inTimeText", "outOfTimeText", "outOfTimeShort"}: e.append(f"{where}: challenge block keys differ from supper-rush")
        if k == "challenge":
            for kk, vv in r.get("challenge", {}).items():
                if kk != "seconds" and (bad_word(str(vv)) or re.search(r"\d", str(vv))): e.append(f"{where}: challenge {kk} has a banned word or a digit")
        if len(r.get("name", "").split()) > 5 or bad_word(r.get("name", "")) or re.search(r"\d", r.get("name", "")): e.append(f"{where}: name too long or has a banned word or digit")
        t = r.get("tiles", []); h = len(t); w = len(t[0]) if t else 0
        if (w, h) != SIZE.get(k): e.append(f"{where}: size {w}x{h}, expected {SIZE.get(k)} for {k}")
        if any(len(x) != w for x in t): e.append(f"{where}: tiles not rectangular"); continue
        if set("".join(t)) - set("#.PDCS"): e.append(f"{where}: unknown tile letter")
        for y, row in enumerate(t):
            for x, ch in enumerate(row):
                if (y in (0, h - 1) or x in (0, w - 1)) and ch not in "#D": e.append(f"{where}: edge ({x},{y}) must be wall or door")
                if ch == "D" and (y != 0 or x in (0, w - 1)): e.append(f"{where}: door at ({x},{y}) must be in the top wall, not a corner")
        cnt = collections.Counter("".join(t))
        if cnt["P"] != 1: e.append(f"{where}: needs exactly one P"); continue
        if cnt["D"] < 1: e.append(f"{where}: needs a door")
        if (cnt["C"] == 1) != (k in ("treasure", "boss", "challenge")) or cnt["C"] > 1: e.append(f"{where}: chest rule broken for kind {k}")
        if (cnt["S"] == 1) != (k == "rest") or cnt["S"] > 1: e.append(f"{where}: shrine rule broken for kind {k}")
        if tuple(t) in seen_tiles: e.append(f"{where}: same layout as {seen_tiles[tuple(t)]}")
        seen_tiles[tuple(t)] = i
        py, px = next((y, row.index("P")) for y, row in enumerate(t) if "P" in row)
        seen = {(px, py)}; q = [(px, py)]
        while q:
            x, y = q.pop()
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and t[ny][nx] != "#": seen.add((nx, ny)); q.append((nx, ny))
        for y, row in enumerate(t):
            for x, ch in enumerate(row):
                if ch in ".CS" and (x, y) not in seen: e.append(f"{where}: tile ({x},{y}) cannot be reached")
                if ch == "D" and (x, 1) not in seen: e.append(f"{where}: door at {x} is blocked")
        if k in ("battle", "challenge", "boss"):
            for y in range(1, h - 1):
                for x in (9, 10):
                    if t[y][x] == "#": e.append(f"{where}: middle column {x} is blocked at row {y}")
        en = r.get("enemies", []); waves = collections.defaultdict(list); spots = set()
        for m in en:
            if set(m) != {"enemy", "column", "row", "wave"}: e.append(f"{where}: enemy entry keys {sorted(m)}"); continue
            c, ro, wv, name = m["column"] - 1, m["row"] - 1, m["wave"], m["enemy"]
            if name not in ALL and not (k == "boss" and name == GUARD): e.append(f"{where}: enemy {name} does not belong to this tier")
            if (wv, c, ro) in spots: e.append(f"{where}: two enemies on column {c+1}, row {ro+1} in wave {wv}")
            spots.add((wv, c, ro))
            if not (0 < c < w - 1 and 0 < ro < h - 1) or t[ro][c] != ".": e.append(f"{where}: {name} at column {c+1}, row {ro+1} is not on a floor tile (counting from 1)"); continue
            if abs(c - px) + abs(ro - py) < 4: e.append(f"{where}: {name} at column {c+1}, row {ro+1} starts too close to P")
            if name in S["dash"]:
                ok = all(t[ro + dr][c] == "." and not (t[ro + dr][c - 1] == "#" and t[ro + dr][c + 1] == "#") for dr in (1, 2, 3))
                if not ok: e.append(f"{where}: {name} at ({m['column']},{m['row']}) has no clear 3-tile lane with room to dash aside")
            waves[wv].append(m)
        if waves and sorted(waves) != list(range(1, max(waves) + 1)): e.append(f"{where}: waves must count up from 1")
        if k in ("battle", "challenge") and not (2 <= len(waves) <= 4): e.append(f"{where}: 2-4 waves")
        if k == "challenge" and len(waves) != 3: e.append(f"{where}: the challenge has 3 waves")
        for wv, ms in waves.items():
            if len(ms) > 6: e.append(f"{where}: wave {wv} has {len(ms)} enemies (max 6)")
            if sum(m["enemy"] in S["dash"] for m in ms) > 1: e.append(f"{where}: wave {wv} has more than one dash-only enemy")
        if len(en) > 13: e.append(f"{where}: {len(en)} enemies (max 13)")
        names = collections.Counter(m["enemy"] for m in en)
        new_kinds = {x for x in names if x in S["f34"]}
        if n in (0, 1):
            if set(names) - set(S["f12"]): e.append(f"{where}: rooms 1-2 use first-band enemies only")
        if n == 1 and max(names.values(), default=0) < 2: e.append(f"{where}: room 2 needs 2 or 3 of one kind")
        if n == 2 and len(new_kinds) != 1: e.append(f"{where}: room 3 needs exactly one new-band enemy kind")
        if n == 3 and len(new_kinds) < 2: e.append(f"{where}: room 4 needs two or more new-band enemy kinds")
        if n == 4 and not (set(S["f12"]) | set(S["f34"])) <= set(names): e.append(f"{where}: the challenge must hold every enemy kind of the tier")
        for x in S["extra"]:
            if (n in (2, 3, 4)) != (x in names): e.append(f"{where}: {x} belongs in rooms 3, 4 and the challenge only")
        if k == "boss":
            first = [m["enemy"] for m in en if m["wave"] == 1]
            if not first or first[0] != GUARD: e.append(f"{where}: the Guardian must be first in wave 1")
            if names[GUARD] != 1: e.append(f"{where}: exactly one {GUARD}")
            if set(names) - {GUARD} - set(S["f12"]): e.append(f"{where}: boss helpers come from the first band only")
        elif GUARD in names: e.append(f"{where}: the Guardian belongs in the boss room only")
        if len(r.get("signs", [])) < 1: e.append(f"{where}: needs a sign")
        for s in r.get("signs", []):
            if len(s.split()) > 10 or bad_word(s) or re.search(r"\d", s): e.append(f"{where}: sign {s!r} too long or has a banned word or digit")
            if len(s.split()) <= 1: e.append(f"{where}: sign too short")
        if bad_word(r.get("artProps", "")): e.append(f"{where}: artProps has a banned word")
        # tier-specific teaching rooms
        if key == "forge-of-courage" and i in ("cub-crowd", "anvil-alley", "smiths-rush"):
            if not any(sum(m["enemy"] == "coal-cub" for m in ms) >= 3 for ms in waves.values()): e.append(f"{where}: crowd room needs a wave of 3 or more Coal Cubs (Break Free)")
        if key == "forge-of-courage" and i == "smiths-rush":
            if not any(sum(m["enemy"] == "coal-cub" for m in ms) >= 3 and any(m["enemy"] == "anvil-imp" for m in ms) for ms in waves.values()): e.append(f"{where}: needs a wave with 3 or more Coal Cubs and an Anvil Imp")
        if key == "hall-of-echoes" and i == "masklet-circle":
            w1 = [m for m in waves.get(1, []) if m["enemy"] == "masklet"]
            ring = [(m["column"] - 1 - px, m["row"] - 1 - py) for m in w1]
            if len(w1) < 6 or not all(4 <= abs(a) + abs(b) <= 6 for a, b in ring) or not (any(a < 0 for a, b in ring) and any(a > 0 for a, b in ring) and any(b < 0 for a, b in ring) and any(b > 0 for a, b in ring)):
                e.append(f"{where}: wave 1 needs six or more Masklets in a ring 4-6 tiles around P (Spinning Finisher)")
    if key == "hall-of-echoes" and "masklet-circle" not in {r.get("id") for r in rooms}: e.append(f"{key}: needs the masklet-circle room")
    if bad_word(d.get("place", "")): e.append(f"{key}: place has a banned word")
for x in e: print(x)
print("FAIL" if e else f"OK: {total} tier room set(s) pass")
sys.exit(1 if e else 0)
