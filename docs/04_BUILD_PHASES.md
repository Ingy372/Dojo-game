# Build phases

Each phase lists tasks, docs to read, and a gate. A phase is DONE only when every gate test has been run and its result written to `STATUS.md` (command used, observed result). Files existing is not done.

Owner touchpoints are marked OWNER. Handoffs to Grok or humans are marked HANDOFF (see 20_HANDOFF).

---

## Phase 0 — Toolchain and empty world

Read: 03, 18.

Tasks
1. Repo per 03. Pin and record commits.
2. Build TFS 1.4.2 on Ubuntu 24.04; MariaDB schema; config.lua from `ops/config.lua.tpl`.
3. Build OTClient (mehah) for Windows x64 (cross-compile or CI runner) and Linux x64.
4. P1 (spire_ids.h). List of hardcoded IDs.
5. tools/placeholder_art.py, tools/procedural_tiles.py (grass, dirt, stone, water, wall), tools/build_assets.py.
6. tools/compile_map.py + tools/render_map.py with a 40x40 test town: temple, depot, one house, one NPC, one spawn.
7. tools/check_names.py with banned list (`tools/banned_names.txt`: canon SAO names, CipSoft monster/NPC/city names).

Gate
- A second machine on the LAN logs in with our client and sees our placeholder town (no CipSoft art loaded anywhere: client data/things contains only our files).
- Server boot log has zero missing-item warnings.
- build_assets round-trip test passes.
- OWNER: logs in once and confirms they can walk around.

## Phase 1 — Core rules

Read: 05, 06.

Tasks
1. Patches P2, P3, P4, P5, P7, P9, P10.
2. Five paths as vocations. Stats (STR/DEX/VIT/AGI/MND), 3 points per level, 40% cap rule, allocation via client window.
3. Resources: Stamina and Focus on the mana bar (client relabels), arrows.
4. Proficiency per weapon group; skills table; skill bar cast via opcode; cooldowns; telegraph helper (effect + 600 ms delay).
5. Starter and proficiency-10 skills for all paths. Proficiency 25/40 rows exist but are world-gated.
6. Party cap 4, shared XP rules, path-diversity bonus.
7. XP debt, death item rules.
8. Core details from 22 (capacity, speed, regen, logout, idle, saves, chat, names, P11–P13).
9. Skulls, protection zones, protection level, PZ lock (TFS default 60 s), guards, PvP zone tiers (Guarded/Open/Contested/Deadzone), Blood Marks, PvP crowd-control rules.
10. Party XP and col formula and Mentor sharing (05); quest perks framework (06).

Gate (each as a scripted GM test + one manual check)
- Each path can kill a test monster using only its starter skill and basic attack.
- A proficiency-25 skill cannot be equipped while world floor = 1.
- A level-40 test character on world floor 1 still gains XP (no cap), and its damage with the same weapon is within +35% of a level-20 character with the same weapon, proficiency, and stat split (level must not be a hidden damage multiplier).
- Death: debt = 5% of next-level XP; three deaths cap at 15%; priest clears it for 0.5 col/point.
- Unjust kill -> orange; 3 in 24 h -> red; red player's whole backpack drops; red cannot enter own house.
- Level-15 player cannot be attacked in the open world but can be in a tile flagged spire_bossroom.

## Phase 2 — Floor 1 world

Read: 09, 10, 11, 12, 13.

Tasks
1. Map floor 1 per 11 (Hearthgate, Millcross, 14 camps, pass, labyrinth 3 levels, boss room, Underkeep wing 1 shell).
2. Monsters from data/monsters.csv (floor 1 rows, wing-1 rows), loot via server/data/spire/loot.lua.
3. NPCs and shops for Hearthgate and Millcross (12). Task board.
4. World state: table `world_floors`; field boss Gate Hound; labyrinth door; Axe-Lord; credit; last hit; broadcast + bell; monument; teleport gate lights.
5. Echo system (instanced room copies) for Axe-Lord.
6. Arrival Yard onboarding and Starter Fields (22); Reward Chest at the monument; population mode and tower weakening (23).
7. Floor-1 quests (13) with quest log entries; floor-1 apex spawn (Old Watchtower, four layers); world event scheduler; Recruitment Hall.

Gate
- Killing Gate Hound (GM-spawned party of bots or GM chars) opens the labyrinth door for a character who was not present; restart does not reseal.
- Killing Axe-Lord opens floor 2 stair for a character not present; monument lists credited names; Last Blow Shard goes to the killing-blow owner; credit ranks by contribution; boss resets after 60 s with no damage.
- Enrage scaling: with 1 player in the room the Axe-Lord enrages at 60:00; with 8 or more at 8:00; a GM solo test at level 45 with Hearth +4 gear and 40 salves can kill the Axe-Lord before enrage (record time).
- Echo opens 6 h after first kill (GM time-skip allowed); lockout 20 h; drops match data/echoes.csv.
- An unjust kill in a Guarded zone gives red immediately; a kill in the Contested apex zone gives no skull and one Blood Mark; the same pair cannot earn a second mark within 30 min.
- A scripted 4-path party at Boar Camp earns at least 1.3× solo XP per person per hour.
- Every floor-1 quest step shows a quest-log entry.
- A new character finishes the Arrival Yard in under 10 minutes and reaches level 8 in the Starter Fields in 35–60 minutes (scripted bot).
- Killing the server process right after a first kill: on restart the floor is open and the Reward Chest holds every credited player's rewards.
- compile_map.py rejects a secret trigger visible from a road or plaza.
- render_map PNGs of floor 1 attached to STATUS.md.
- OWNER: plays floor 1 for one hour and writes notes in STATUS.md.

## Phase 3 — Economy, items, crafting

Read: 07, 08.

Tasks
1. Currency items; bank; market (TFS market) with 8% fee on sale; NPC buyback limited to items with npc_buy_price.
2. Smithy: upgrades +1..+5 per 08, per-item pity, mats and fees; recipes; arrow and food crafting.
3. Binding rules.
4. Teleport gate fees; spec change; debt clearing.
5. Telemetry tables and tools/econ_report.py.
6. tools/simulate_loot.py.

Gate
- Loot sim within ±10% of monsters.csv expectations for every floor-1 monster.
- A level-15 bot script hunting Boar Camp for 60 simulated minutes nets within ±25% of the Floor-1 net col/h in economy_check.md.
- A +4 failure increments the item's pity; 5th attempt forced success; pity does not transfer between items.
- econ_report prints faucets and sinks by category.

## Phase 4 — Houses, guilds, PvP contracts

Read: 15.

Tasks
1. House functions (training dummy, anchor, trophy stands, dice table; Echo shrine in eligible houses). Floor-1 houses from data/houses.csv; purchase at listed price; rent auto-debit from bank weekly; 7-day grace; relist at next server save with broadcast.
2. One house per account. Guild halls owned by guild.
3. Head-start window logic (used from floor 2 on; GM-testable now).
4. Guilds (TFS), guild war contract NPC, break fee.

Gate
- Buy, enter, invite, kick, rent debit, revert after grace, relist broadcast — all observed.
- GM marks floor 2 clear with a 20-name credit list: during the hour only credited characters can buy, at most ceil(20/2)=10 houses sell; the 11th credited buyer is refused; broadcast at 60:00 opens the rest.
- War contract: frags between warring guilds paint no skulls.

## Phase 5 — Secrets framework, Vesper, Underkeep wings 1–2

Read: 14.

Tasks
1. Tables player_secrets, secrets, secret_copies. Trigger and gate scripts generated from data/secrets.csv.
2. All 12 floor-1 secrets placed and working.
3. Vesper NPC + board.
4. Underkeep wing 1 open on discovery; wing 2 sealed until world floor 2.

Gate
- Two characters on screen when a trigger fires both get packets; either can sell; first sale pays only the seller; the other packet locks; a third character who later finds the unsold secret gets their own packet; after sale, finding it grants nothing.
- Non-holder at every floor-1 gate is refused with "You don't know this place."
- Copy purchase grants access and cannot be resold.
- Public website profile shows sold packets only.

## Phase 6 — Floors 2–5

Read: 09, 10, 11, 12, 13, 14.

Tasks: maps, monsters, NPCs, shops, quests, field and floor bosses, echoes, 48 secrets, Underkeep wings 3–5, districts, strategy books, teleport gates.

Gate
- GM can advance floors 1->5 in order; each step: labyrinth door, stair, gate, head-start hour, broadcast, proficiency unlocks at floors 2 and 4, Underkeep wing opens.
- Every boss mechanic in 10 observed at least once with a scripted party.
- All 60 secrets pass the phase-5 tests.
- render_map PNGs of floors 2–5.

## Phase 7 — Client UI and website

Read: 17, 19.

Gate: every module in 17 works on Windows build; website pages in 19 live on staging in English, Portuguese, and Spanish; check_names passes on client strings and website.

## Phase 8 — Art, scale, operations

Read: 16, 18.

Tasks: integrate HANDOFF sprite batches; production host; backups; monitoring; load test.

Gate
- No placeholder art remains in: player outfits, floor-1 monsters, floor-1 tiles, UI (other floors may still be placeholder for closed beta).
- Load test: 500 loadbot sessions (300 hunting floors 1–2, 200 idle in towns) for 60 minutes: average tick under 25 ms, p99 under 50 ms, no crash.
- Restore drill: restore last night's backup to a scratch DB and boot from it.
- Population tests from 23 (60-player and 500-player scenarios) pass.

## Phase 9 — Closed beta, tuning, wipe, launch kit

Tasks
1. OWNER + invited testers (HANDOFF: community) play 2–4 weeks.
2. Weekly econ_report and pacing report vs economy_check.md; adjust only via gen_tables.py.
3. Fix list from beta notes.
4. Wipe command (characters, houses, world_floors, secrets, market) tested on staging.
5. Launch kit: Discord text, website news, server-list entries (HANDOFF owner posts).

Gate: STATUS.md says LAUNCH CANDIDATE and the owner signs it.

## Phase 10 — Wardrobe store (after beta, before public launch)

Read: 21.

Tasks: Stripe + PayPal checkout on the website, webhook, store_orders table, Lua grant on login, Wardrobe button in client, Terms of Sale / Refund / Privacy pages, Supporter subscription handling (grant and expiry).

Gate
- Test-mode purchase grants the item exactly once even if the webhook fires twice.
- Refund marks the order refunded and removes an unused item.
- No store item changes any combat, XP, loot, or travel value (automated check over items.csv flags).
- OWNER: approves prices and legal pages.

## After launch (do not start)

Floor 6+ with the same template. Cosmetic shop only if the owner writes it into 02.
