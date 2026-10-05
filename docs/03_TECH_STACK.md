# Tech stack

## Choices and reasons

| Piece | Choice | Why |
|---|---|---|
| Server | The Forgotten Server 1.4.2 (github.com/otland/forgottenserver, tag v1.4.2) | Latest stable release for protocol 10.98. RevScriptSys Lua, extended opcodes, market, houses, guilds built in. 10.98 is a common, well-documented OT version (R6). |
| Protocol | 10.98 | Custom dat/spr/otb are simple binary formats with working open-source writers; 13.x uses protobuf appearances and is heavier to build from scratch. |
| Client | OTClient, mehah fork (github.com/mehah/otclient) | Supports 10.98, Lua module system for our UI, actively maintained. Ship our own build only. |
| Database | MariaDB 10.11 LTS | Standard for TFS. |
| Website | MyAAC (github.com/slawkens/myaac) | Supports TFS 1.4, plugin system for our pages. |
| Host OS | Ubuntu 24.04 LTS | |
| Language for tools | Python 3.12 | Every tool in this repo is a script the agent can run. No GUI tools. |

Rejected: Canary (13.x, built around the CipSoft map and assets we cannot use); TFS 1.6 (13.10, protobuf asset pipeline); 8.60 engines (older TFS lines without RevScriptSys).

## Repository layout

```
/server/                 forked TFS 1.4.2 source (git subtree), our patches in /server/patches
/server/data/            TFS datapack, rewritten (no CipSoft content)
/server/data/spire/      our tables as Lua, generated from /data/*.csv by tools/csv_to_lua.py
/client/                 forked OTClient (mehah) source + /client/modules/spire_* modules
/assets/png/items/<id>.png      32x32 (or 64x64 for large objects)
/assets/png/outfits/<lookType>/ dir_frame.png sheets
/assets/png/effects/<id>.png    horizontal strips
/assets/png/missiles/<id>.png
/assets/assets.csv       one row per client thing: id, category, flags, size, frames, png path
/assets/build/           OUTPUT: Spirebound.dat, Spirebound.spr, items.otb, items.xml (never edit)
/maps/src/floor_XX/*.txt ASCII layers (see 11_FLOORS_AND_MAPS)
/maps/src/legend.csv     char -> item id / zone / spawn
/maps/build/spirebound.otbm + spawns.xml + houses.xml (never edit)
/data/                   generated design tables (this pack)
/tools/                  all scripts
/website/                MyAAC + plugins
/sql/                    migrations, numbered
/ops/                    systemd units, backup scripts, config templates
STATUS.md CHANGELOG.md
```

## Tools the agent writes (all Python, all CLI)

| Tool | Job |
|---|---|
| tools/gen_tables.py | Already exists. Design tables + economy check. |
| tools/csv_to_lua.py | CSV -> server/data/spire/*.lua |
| tools/placeholder_art.py | Generates labeled placeholder PNGs for every row in assets.csv lacking art |
| tools/procedural_tiles.py | Generates grounds, borders, walls from palette rules (see 18_ART) |
| tools/build_assets.py | assets.csv + PNGs -> .dat, .spr, items.otb, items.xml. May port gesior/open-tibia-library (TypeScript) logic or write from the documented formats. Must round-trip: read back what it wrote and compare. |
| tools/compile_map.py | ASCII layers + legend -> OTBM, spawns.xml, houses.xml |
| tools/render_map.py | OTBM or ASCII -> PNG preview per floor and z-level, so the agent and owner can see the map |
| tools/simulate_loot.py | 10,000-kill Monte Carlo per monster vs monsters.csv expectations |
| tools/econ_report.py | Reads DB, prints money supply, faucet/sink totals per day |
| tools/loadbot/ | Headless 10.98 protocol client (login, walk, attack, say) for load tests |
| tools/check_names.py | Fails the build if any shipped string matches the banned-name list |

## Hardcoded item IDs (must handle in phase 0)

TFS 1.4.2 refers to certain item IDs directly in C++ (`src/const.h` and elsewhere): coins, depot and locker, inbox, mailbox, parcel and letter, house doors and beds behaviour, browse field, fields (fire, poison, energy, magic wall), corpses for players, and others. Because our items.otb is built from scratch:

1. Grep the source for every numeric item constant and enum in const.h; list them in `server/patches/hardcoded_ids.md`.
2. Create `src/spire_ids.h` with named constants; replace literal IDs with those names.
3. Reserve matching rows in assets.csv with our own sprites (our "coin", "depot box", "fire field", etc.).

Gate: server boots with zero "item not found" warnings.

## Source patches (C++), each its own commit and doc entry

| # | Patch | Reason |
|---|---|---|
| P1 | spire_ids.h | Above |
| P2 | Per-player attack speed from DEX | Classic TFS attack speed is per vocation |
| P3 | Global orange skull and Spirebound skull rules (05_WORLD_RULES) | TFS orange is a per-viewer revenge skull |
| P4 | Protection-level bypass in tiles flagged `spire_bossroom` | Boss rooms ignore protection level |
| P5 | Item-loss rules on death (02 Death) | Replace lossPercent logic |
| P6 | Dynamic respawn multiplier = clamp(250 / players_online, 0.6, 1.0), floor 30 s | Crowding at high population (R6) |
| P7 | Party size cap 4 (configurable) | Owner rule |
| P8 | Status protocol reports at most 4 players per IP | Server-list honesty rule |
| P9 | Remove magic level growth and hide it from protocol | No magic level |
| P10 | Hook for extended opcode 0x50 "skill cast" -> Lua | Skill bar |
| P11 | Account passwords hashed with a modern salted algorithm (argon2id or bcrypt) on both server and website, replacing TFS 1.4.2's SHA-1 | Account security |
| P12 | Spawn rules: no respawn while a player stands within 2 tiles of the spawn point (retry every 5 s); monsters more than 14 tiles from their spawn with no target for 5 s walk home and heal; monsters never enter protection zones | Spawn camping, luring trains into towns |
| P13 | Rate limits per connection on skill-cast opcodes (max 10/s) and chat | Packet spam |

Everything else is Lua (RevScriptSys): skills, stats, proficiency, resources, XP debt (onGainExperience), boss logic, credit, echoes, secrets, houses head start, guild war contract, telemetry.

## Client fork

- Remove or disable any bot/macro module in the fork before the first build.
- Our modules live in `client/modules/spire_*` (see 17_CLIENT_AND_UI).
- The client checks a server-provided asset hash at login and refuses mismatched assets.
- Build Windows x64 (required) and Linux x64 (nice to have). macOS is out of scope for the proof.

## Versions to pin

Record exact commit hashes of TFS, OTClient, MyAAC in `STATUS.md` on day one. Never upgrade mid-phase.
