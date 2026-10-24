# S2: Item system

Work board S2: gear slots, rarity, stat ranges inside the power budget, drop sources by tier, breaking duplicates down into materials, keeping gear stats and cosmetic looks separate, and what's in launch versus later.
This spec unblocks **C6** (item names and text). The **"For C6"** section lists exactly what to write.
Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only; no game code or work-board edits. Numbers marked (guess) are mine. No learning-science claims.

## What exists (keep)

- **Slots:**
  - `hands` gives Power.
  - `gi` gives Health and Guard.
  - `charm` gives one small effect.
  - All are in `content/loot/gear.json`, which covers the white tier only: 3 hands, 3 gi, 3 charms (Jade +Power, Lotus start Focus, Crane heal on Perfect Counter).
- **Rarity:** common, uncommon, rare and epic. Drop weights are 70 / 22 / 7 / 1 (`LOOT` in `config.ts`). Legendary comes from Guardians only, later.
- **Bad-luck protection:** +3 Rare weight for each dry run, and a Rare is guaranteed on the 5th run. The Dojo Blessing adds 3 Rare weight (`BLESSING.rareWeight`).
- **Chests** (`content/loot/drops.json`): treasure 2 items, challenge 2 (3 and uncommon+ if cleared in time), boss 3.
- **Caps:** `GEAR_CAPS.white` is power 4, maxHealth 30, guard 8. Gear is 8% of the Power Rating (`POWER.shares.gear`).
- **Letting go of items:** `letGo` in `profile.ts` just deletes the item today.

## Stats by tier (inside the budget)

- **Tier cap** = white cap × tier number (guess). This follows the level growth: each tier's 10 levels add +30 Health and +4 Power (`decisions.md` line 193), so gear stays smaller than levels and real training.

| Tier (belt) | Power cap | Health cap | Guard cap |
| --- | --- | --- | --- |
| 1 white | 4 | 30 | 8 |
| 2 yellow | 8 | 60 | 16 |
| n | 4n | 30n | 8n |
| 10 black | 40 | 300 | 80 |

- **Rarity shares of the cap:** common 25%, uncommon 50%, rare 75%, epic 100%. This matches today's white hands [1, 2, 3, 4].
- **Standard floors:** epics roll 85–90% of the cap. **Challenge floors** can reach 100% (`core-design.md` line 588).
- **Gi:** keep today's split (Health about 93% of cap at epic, Guard about 88%), scaled by tier.
- **Charms:** keep today's `amounts` per rarity. Each tier adds **one new charm effect**, and older charms keep their amounts (effects are shares, so they don't need tier scaling).
- **Playing a lower floor:** gear drops at **the floor's tier**, so a high belt helping on a low floor gets low-tier gear.
- **Legendary (post-launch):** epic stats plus a set bonus. Guardians only, with a Guardian-win pity counter.

## Items per tier (launch)

| Slot | New per tier | Notes |
| --- | --- | --- |
| hands | 3 | Different looks; same stat table |
| gi | 3 | Different looks; same stat table |
| charm | 1 new effect (white has 3) | Effect types from `effects.ts`; no new types needed: tiers 2–10 reuse `focusGain`, `blockCut`, `attackSpeed`, `staggerBonus`, `comboSpeed`, `lowHealthFocus`, `strikeCost`, `counterWindow`, `dashOnBlock` (guess) |

- Items available at a tier = that tier's new items plus all lower tiers' items, rolled at the floor's tier.
- **Total:** white 9 (exists) + 9 tiers × 7 = **72 new items**.

## Duplicates and letting go → materials

- **Let go** now gives the item's tier material: common 1, uncommon 2, rare 4, epic 8 (guess). The words are "Let go", never "salvage" or "sell".
- Optional **auto-let-go** for repeats of the same item at the same or lower rarity, off by default.
- **One material per tier** (10 total). Draft names already exist (`drafts/content/loot/materials.json`): bamboo and stone (white), silk (yellow), jade (orange).
  - Proposal: **white = bamboo**. Stone moves to green or is dropped (C6 to choose).
  - C6 names materials for tiers 5–10.
- **At launch, materials only collect** in a "Workshop shelf" with "Saved for the workshop". Spending them comes with crafting after launch (`core-design.md` line 736).
  - Scope risk: a pile with no use yet. **Alternative:** at launch, every 20 of a material (guess) gives a sure decoration from the S7 pool. That's a small sink with no new UI.

## Stats and looks stay separate

- A new saved field, `profile.looks: Record<GearSlot, itemId | null>`, picks the look for each slot from **any gear ever owned**. Owned looks are kept in `ownedLooks` even after the item is let go.
- The stats always come from `equipped`. Looks change only the art.
- Gi colours and trims from achievements (S6) are also looks.
- **No look is ever bought** (`decisions.md` line 382).

## For C6: lists, IDs and text slots

Write these in `drafts/content/loot/gear.json` (same shape as now, plus a `tier` field per item) and in `materials.json`.

1. **Gear: 72 items**, 7 per tier, for tiers 2–10.
   - IDs: `<belt>-<slot>-<1..3>` as placeholders (for example `yellow-hands-1`). C6 may change the readable part, but keep the belt prefix.
   - Slots per item: `name` (≤ 22 characters), `description` (≤ 80, hopeful, ages 6+, no injury words).
   - Charms also need `text`, using the `{n}` or `{pct}` slot the same way the white charms do.
2. **Charm effect per tier (tiers 2–10)**, in this order (guess, for C6 to name):

   | Belt | Charm effect |
   | --- | --- |
   | yellow | `focusGain` |
   | orange | `blockCut` |
   | green | `attackSpeed` |
   | blue | `staggerBonus` |
   | red | `comboSpeed` |
   | red-black | `lowHealthFocus` |
   | brown | `strikeCost` |
   | brown-black | `counterWindow` |
   | black | `dashOnBlock` |

   **Charm amounts (all guesses; common / uncommon / rare / epic):** charms are shares, so they don't grow with the tier caps. Each epic stays at or under the Jade Charm's 12% Power, or the matching small step, so a charm is never bigger than a level-up or the Calm Mind blessing (`DOJO.calmMind.focusGain` 0.2) from real class.

   | Belt | Effect | `amounts` | What the kid sees (`{pct}`) | Notes |
   | --- | --- | --- | --- | --- |
   | yellow | `focusGain` | 0.05, 0.08, 0.12, 0.15 | 5% to 15% | Below Calm Mind's 20%. |
   | orange | `blockCut` | 0.03, 0.05, 0.07, 0.10 | 3% to 10% | Small, because blocks already soften hits. |
   | green | `attackSpeed` | 0.04, 0.06, 0.09, 0.12 | 4% to 12% | Code caps the total at 0.6. |
   | blue | `staggerBonus` | 0.08, 0.12, 0.18, 0.25 | 8% to 25% | Only hits staggered enemies, so it can be bigger. |
   | red | `comboSpeed` | 0.08, 0.12, 0.18, 0.25 | 8% to 25% walk speed | Uses the defaults: every 10 combo hits, for 3 seconds. |
   | red-black | `lowHealthFocus` | 1.10, 1.15, 1.25, 1.35 | 10% to 35% | This is a multiplier, so `{pct}` = amount − 1. Works below half health (default). |
   | brown | `strikeCost` | 3, 4, 6, 8 | 10% to 27% | **Text mismatch:** the code cuts flat Focus (Strike costs 30, minimum 10). `{pct}` should show cut ÷ 30, or C7 changes the text to "{n} less Focus". |
   | brown-black | `counterWindow` | 1, 1, 2, 2 ticks | about 17% to 33% on Standard | **Text mismatch:** the code adds ticks. `{pct}` depends on the difficulty window (Guided 10, Standard 6, Challenge 4). I suggest showing it against Standard's 6, or C7 changes the text to "A little more time to COUNTER". |
   | black | `dashOnBlock` | 0.25, 0.40, 0.60, 1.00 | 25% to 100% | **Code mismatch:** today `dashOnBlock` is an on/off switch (a full recharge). The C7 text says "by {pct}". Either the sim gets a partial charge (code change, Programmer) or the text drops `{pct}` and all rarities give a full recharge. Manager to pick. |

3. **Materials: 10**, one per tier. Slots: `id`, `name` (≤ 16), `description` (≤ 80).
4. **Rarity words: 5.** Common, Uncommon, Rare, Epic and Legendary exist. C6 may suggest kid-friendlier display names (≤ 10), but the IDs stay.
5. **UI lines (≤ 40 each):**
   - "Let go" confirm
   - "Saved for the workshop"
   - Look picker title
   - "Wearing the look of {item}"
6. **Legendary: 10**, one per Guardian. Post-launch, so names are optional now.

## Launch versus later

| Launch | Later |
| --- | --- |
| 3 slots, 4 rarities, caps per tier | Legendary gear and sets |
| 72 new items for tiers 2–10 (the 9 white items already exist) | Crafting and recipe scrolls |
| Letting go gives materials (they collect, or turn into decorations) | Spending materials |
| Look picker | Healing teas, relics as loot (`core-design.md` §5) |

## Scope flags

- 72 new item art pieces. Recolours of shared bases can cut this; the Artist should size it.
- `GEAR_CAPS` and `gear.json` both need a per-tier form; data validation follows.
- New saved fields: `looks`, `ownedLooks`, `materials`. Old saves need a migration.
- The materials sink decision (above).
- Healing teas and relics aren't covered here.

## Done-when

- `gear.json` holds items for all 10 tiers. A loader test checks that every stat stays within that tier's cap × rarity share.
- A seeded test of 10,000 drops per tier checks:
  - rarity shares are 70 / 22 / 7 / 1 (±1%)
  - no Standard epic is above 90% of the cap
  - the floor's tier decides the gear tier
- The balance player at each tier: maxed gear changes the Power Rating by no more than its 8% share.
- Letting go of an item adds the right material amount. Nothing else is lost, and a look that was worn stays available.
- Changing a look never changes stats (test). Changing gear never changes the chosen look.
- No screen shows prices, a shop or anything to buy (word check).
- C6's `gear.json` and `materials.json` cover every ID and fill every slot within the character limits.
