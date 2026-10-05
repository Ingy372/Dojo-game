# Economy

Built on R4: every faucet has a sink before launch; sinks are gameplay; status sinks beat punitive ones; materials are the real economy; money supply is measured, not guessed. All prices are in `data/*.csv`; this doc gives the rules and targets.

## Currency

Col. Coins of 1 (col), 100 (silver col), 10,000 (gold col), auto-stacking and change-making like Tibia gold/platinum/crystal (use TFS money logic with our IDs). Bank in Hearthgate, Rootwell, Ringhold; deposits and withdrawals anywhere via any banker; TFS bank balance used for rent.

No premium currency in the proof.

## Income targets (verified by `data/economy_check.md`)

| Floor | XP/h solo | Net col/h solo |
|---|---|---|
| 1 | ~8,200 | ~1,140 |
| 2 | ~18,500 | ~2,480 |
| 3 | ~21,900 | ~3,570 |
| 4 | ~23,900 | ~4,510 |
| 5 | ~25,500 | ~5,830 |

Targets: a mid house costs 15–25 net hours on its floor; weekly rent costs 0.8–1.5 net hours; a Large secret pays 5–12 net hours. The generator fails if any falls outside.

## Faucets (money created)

| Faucet | Rule |
|---|---|
| Monster col | monsters.csv col_min/col_max; trash only within its floor band |
| NPC buyback | Only items with npc_buy_price > 0 (commons, salvage, old gear at 20%, Keen mats at a low floor price from materials.csv so a small population never holds dead inventory). Tempered mats and Spire Scrap: never bought by NPCs |
| Task board | 3 paid tasks per character per floor per day; pay = 25 trash-kill equivalents of col |
| Quests | Fixed one-time rewards (13) |
| Secrets | One-time lump sum per secret (data/secrets.csv); ~970,000 col across all 60 |
| Echo | col 40–70 × floor per kill, lockout 20 h |
| Vesper tells | 200 col, once per character per boss |

## Sinks (money destroyed)

| Sink | Rule | Why players accept it |
|---|---|---|
| Consumables | Food, salves, tonics, arrows (shops.csv). ~25–35% of gross | It's gameplay |
| Teleport gate | 30 + 20 × destination floor per use | Convenience |
| Smithy upgrade fees | +1: 200×F, +2: 400×F, +3: 1,000×F, +4: 2,000×F, +5: 4,000×F col, plus mats | Power |
| Market fee | 8% of sale price, paid by seller | Convenience |
| Houses | purchase + weekly rent (houses.csv) | Status, storage |
| Guild | creation 20,000; war contract 10,000 per side | Status |
| Death debt | priest 0.5 col per debt point (optional) | Choice |
| Spec change / respec | 25,000 / 2,000 × floor | Choice |
| Secret copies | 15% of lump sum, paid to Vesper (destroyed) | Access |
| Cosmetic vendors | Dyes 2,000–20,000; outfit recolors; monument plaque engraving 50,000 | Status (largest elastic sink) |

## Materials

Floor-tagged, tradeable (except bound items). Common mats drop from trash and sell to NPCs cheaply; Keen mats from elites and labyrinth chests; Tempered mats only from field/floor bosses and Echoes; Spire Scrap from Echoes (15% + pity) and optional bosses (10%). Upgrades consume mats (data/materials.csv, 08).

## Anti-inflation rules

- No monster drops col above its floor band.
- Task col capped (3/floor/day). Labyrinth chests: one material bundle per character per floor per day. Echo lockout 20 h.
- NPCs buy Keen materials only at the low floor price in materials.csv (about a quarter of their expected player value). NPCs never buy Tempered materials or Spire Scrap.
- GM money commands are logged and not available to the production GM group.

## Telemetry (phase 3)

Daily job writes `econ_daily(date, faucet_*, sink_*, money_supply, median_wealth_per_active_char, market_median_price_by_item)`.
- money_supply = sum of bank balances + coin items in player inventories, depots, houses, and market escrow.
- Weekly report via tools/econ_report.py.

## Tuning protocol (after beta day 7)

Alarm when money supply grows more than 8% week-over-week after week 3, or when median market price of the five most-traded commons rises more than 15% in two weeks.

Fix in this order, one step per week, via tools/gen_tables.py only:
1. Cut monster col by 10% on the floor with the highest faucet share.
2. Raise consumable prices 10%.
3. Add a cosmetic sink item.
Never: raise rent mid-week, add item durability, add a tax on bank balances, or remove existing rewards without notice.

Opposite alarm (deflation): money supply shrinks two weeks in a row → raise task pay 10%.

## Shop policy

See 21_MONETIZATION.md. Store items are account-bound, untradeable, and never convertible to col, so real money can never reach the in-game economy.
