# Locked decisions

Snapshot 2026-10-04. Lines marked OWNER are the owner's own words or direct decisions. Lines marked DEFAULT were chosen by the planner where the owner had not decided; the owner may change any DEFAULT by editing this file. The agent must not change either.

## Concept (OWNER)

- As close to Sword Art Online's floating tower as an OT server can be while staying true to Tibia: hunts, loot, skulls, houses, guilds, depots, a party, mages, and paladins.
- Floors are world-locked. When a raid kills the floor boss, the whole server advances. First clearers get unique rewards. Last hit gets an extra reward that is not a finished weapon and not permanent stats.
- Proof of concept is 5 floors, then beta, then expansion. Do not build floor 6.
- Plan for 500 concurrent.
- Original names only. No CipSoft map or client files. No canon character, boss, or place names in shipped content.
- A donate shop, if it ever exists, cannot sell power.

## Paths (OWNER)

Five paths. Rapier was cut on purpose.

| Path | Tibia seat | Weapon | Resource |
|---|---|---|---|
| Vanguard | Knight (tank) | Arming sword + shield | Stamina |
| Cleaver | Knight (damage) | Greatsword | Stamina |
| Shade | Flanker | Dagger pair | Stamina |
| Slinger | Paladin | Shortbow + arrows | Stamina + arrows |
| Arcanist | Sorcerer (Brand) or Druid (Ward), chosen at level 20 | Focus catalyst | Focus |

No second weapon in the proof (DEFAULT — the old pack's "second weapon after floor 4" had no rules and collapsed path identity).

## Houses (OWNER)

Floor clearers get a 1-hour head start to buy one house in the new district at a listed price. Then a broadcast opens the rest. Not an auction.

DEFAULT refinements: head-start purchases are capped at half the district (rounded up), so the broadcast always opens something. One house per account. Guild halls belong to guilds and do not count against a member's house. Head-start houses cannot be transferred for 14 days.

## PvP (OWNER)

PvP is part of the game. Towns and houses are safe. The world-first boss room is PvP.

DEFAULT refinements: protection level 20 everywhere except inside field-boss and floor-boss rooms, where it does not apply (a warning sign at the door). Full skull rules are in `05_WORLD_RULES.md`.

## Secrets (OWNER)

Secrets are hidden places. Everyone on screen when one is found can sell it. First sale gets the money. That is intentional: it rewards solo exploration and creates trust problems in a party.

DEFAULT refinement: until a secret is sold, anyone who independently finds it gets their own seller packet. An unsold secret is a race, not a permanent monopoly. Once sold, finding it again grants nothing; you buy a copy.

## Underkeep (OWNER)

Floor 1 has a growing dungeon, the Underkeep. It gets bigger, harder, and richer as world floors open. Required.

## Death (DEFAULT)

- Death outside a protection zone: an XP debt equal to 5% of the XP needed for your next level. Debt stacks to 15% (three deaths). While in debt, 50% of earned XP pays the debt. No level loss. The temple priest clears debt for 0.5 col per point (a sink). A Debt Chip clears one death's debt if used within 60 seconds.
- Items: equipped items never drop. Bound items never drop. Each unbound item in your backpack has a 10% chance to drop into the corpse. Red or black skull: the whole backpack drops, and each unbound equipped item has a 10% chance to drop.
- No blessings, no amulet of loss, no permadeath.

## Pace (DEFAULT)

- No level cap (OWNER, 2026-10-04). A player may keep leveling past any floor. Reason given: if raid teams stall, a determined small group or solo player must be able to out-level the problem and clear a boss with enough time.
- Why this is safe in our rules: level adds only HP and 3 stat points per level (≈ +0.8% damage per point in the main stat). Weapon attack, upgrades and proficiency rows are what scale damage, and those stay tied to open floors. The cubic XP curve is the natural soft cap: at level 60 a floor-1 hunt (~8,200 XP/h) needs ~21 hours per level.
- Hunting band targets (hours of active play to reach the top of each floor's band): level 22 ≈ 14 h, 34 ≈ 40 h, 46 ≈ 80 h, 58 ≈ 145 h, 70 ≈ 235 h. Verified in `data/economy_check.md`. Bands are hunt targets, not doors.
- Boss enrage scales with headcount so a small group or a solo player can win with time (05_WORLD_RULES).

## Economy (DEFAULT)

- Currency: col (coins of 1, 100, 10,000). OWNER-NOTE: "col" is the source's currency word; it is kept because the owner's brief used it and it is an ordinary word. If a legal review objects, rename it in one place (tools/gen_tables.py + item names). No premium currency in the proof.
- Every sink in `07_ECONOMY.md` ships before launch.
- House prices and rent from `data/houses.csv`.

## Engine and client (DEFAULT)

TFS 1.4.2 (protocol 10.98), OTClient (mehah fork), MariaDB, MyAAC, Linux host in US East. Custom dat/spr/otb built from original PNGs by our own scripts. Reasons in `03_TECH_STACK.md`.

## Scale (OWNER + DEFAULT)

Plan for 500 concurrent (OWNER). One character per account at launch, two clients per IP without manual allow (DEFAULT).

## Monetization (OWNER + DEFAULT)

No store during closed beta. At public launch: cosmetic-only Wardrobe at real-money prices, themed sets released when floors open, optional cosmetic Supporter subscription. No premium account, no power, no loot boxes. Full design and the research behind it: `21_MONETIZATION.md` (OWNER to confirm prices and the receiving legal entity).

## From OWNER_INPUT.md (2026-10-05)

The owner answered the questionnaire. Decisions below come from those answers. OWNER = their words or direct preference; DEFAULT = planner's implementation of it.

- PvP zone tiers (OWNER): some zones encourage PvP and reward it, some punish it harshly, some are extreme risk for great reward. Implemented as Guarded, Open, Contested, and Deadzone tiers (05).
- Apex spawns (OWNER, from his favorite hunt): each floor has one layered, over-tuned spawn that stays worth hunting long past its floor, sits in a Contested zone, and hides deeper layers behind a rope spot and a hidden side dungeon (11).
- Team hunting must beat solo per hour (OWNER: most servers got the team algorithm wrong). New party formula in 05 and 06, verified in data/economy_check.md.
- Quest guidance (OWNER hated long, unexplained puzzles): every quest has a quest-log entry with the next step; no required puzzle takes longer than about 15 minutes when understood; hints exist in game (13, 17).
- Quest-unlocked perks (OWNER loved custom unlock progression): each floor's story quests unlock one perk choice (06).
- Functional houses (OWNER): training room, house teleport anchor, trophy hall, private Echo shrine (guild halls and large houses), player dice tables with col only (15).
- Aggro-bounce boss (OWNER's most memorable fight): Knight of the Closed Helm phase 2 (10).
- Finding a clan is hard (OWNER): guild recruitment board, recruit flag, LFG/raid-call channel (12, 17, 19).
- Something happening at all hours (OWNER): rotating world events (05).
- Hearthgate is our echo of the source's starting city. Concept only; the literal source name is not used (OWNER: copy concepts, avoid infringement).
- Spells and skills must be captivating to watch (OWNER): effects get a larger art budget, especially Brand AoE (18).
- Owner tests about an hour a night and plans to use Grok's agent for beta testing; no human helpers at start. Operations are designed for a solo owner (16, 20).
- Languages and time zone chosen for player reach, not owner preference (OWNER): English, Portuguese (Brazil), Spanish at launch; US East hosting in Miami; launch times picked for Americas overlap (16, 19).
