# R-G2B-green-baseline

## Delivery Note

| | |
|---|---|
| **ITEM** | G2B-12 |
| **WHAT** | Green-belt baseline on today's `main`: what a Green student sees now on Guided / Steady / Challenge, what is still shared White content, and what is missing. |
| **WHY** | Batch 2 (Giant's Steps, Green seals, Lock) needs a honest "today" picture before new rooms and moves ship. |
| **DECIDE** | Nothing to decide for ship. Use this as the Batch 2 starting map: Green already has Challenge + elites; Green **rooms and enemies are not live yet**. |
| **NEXT** | R-G2B-07 / 08 / 10 land the Giant's Steps set and Green seals; re-run this baseline after those merge. |

**Source of the board item:** `drafts/planning/R-GREEN-TO-BLACK.md` (R-G2B-12). It is **not** listed in `docs/work-board.md` yet. Done when (board wins): *3 short play logs, a list of what is shared white-belt content, and any bugs found.* The Manager brief also asked for a Delivery Note, age-feel notes, design-rule checks, and shots; those extras are included and do not conflict with Done when.

**Checkout / live:** `/workspace/dojo-qa` detached at `origin/main` **`a8b5daa5`**. Live `https://dojo-ascent.jay-lindemuth.workers.dev/` **byte-matches** that build (timestamp-normalized `index-*.js`; live BUILD `2026-11-09T20:50:41.909Z` = **3:50 PM America/New_York**).

**Shots:** `/workspace/qa-g2b12-shots/` (844×390, touch, DPR 2).

---

## 1. Three short play logs (`4-green-belt`)

Profile: fake **Kai M.**, Green Belt · 1 stripe (`fixtures/4-green-belt.json`). Seeded via `localStorage` (`dojo-ascent-test-student=4-green-belt` + `dojo-ascent-profile-v1`). Viewport 844×390, `isMobile`+`hasTouch`, DPR 2.

**Labeling:** *Played* = headless Playwright on the live site (Room 1 only, light taps). *Simulated* = `playRun` in `packages/sim/test/balance/bot.ts` with `characterSetup` stats (Health 236 / Power 37 / Guard 3), style `smart`, skill `typical`, `tier: 4`, seed **7**.

### Guided — `?difficulty=guided&room=bamboo-hall&seed=7`

**URL:** `https://dojo-ascent.jay-lindemuth.workers.dev/?difficulty=guided&room=bamboo-hall&seed=7`

| | |
|---|---|
| **Played** | Entered Tower → Bamboo Hall (Room 1 of 8). Bow to begin. Sensei tip: *"Take your time. Tap the glowing COUNTER button!"* COUNTER glowed. Green belt visible. Light taps through Wave 1–3; combos climbed (~6→29). Shots: `guided-dojo.png`, `guided-board.png` (mid-fight), `guided-mid.png`. |
| **Simulated (full floor)** | Cleared in **~128 s**. Rooms: bamboo-hall → training-yard → gauntlet → bopper-yard → shield-wall → narrow-bridge → shield-escort → keepers-hall. Damage taken **67**, hits **1**, **not** knocked out. No elites this seed. |
| **How hard** | Soft. Guided slows and coaches Counter. Room 1 swarmers are the same White-tier shadows. |
| **Fun / boring** | **6yo:** glowing COUNTER + combo numbers = fun; Sensei tip is clear. Bow wait is a tiny pause. **12yo:** tip feels babyish but the fight still moves. **Adult:** Guided is the right on-ramp; content itself is still White Tower. |

### Standard (Steady) — `?difficulty=standard&room=bamboo-hall&seed=7`

**URL:** `https://dojo-ascent.jay-lindemuth.workers.dev/?difficulty=standard&room=bamboo-hall&seed=7`

| | |
|---|---|
| **Played** | Same Bamboo Hall start; **no** Sensei glow tip. Green belt, Beginner's Stance label, Virtue/Stance buttons present. Random/light taps → **lost in Room 1** (~344 ticks, defeated 1 swarmer). Shots: `standard-fight.png`, `standard-mid.png`. |
| **Simulated (full floor)** | Cleared in **~116 s**. Path includes rest `quiet-shrine` and a **swift elite** in `pillar-court`. Damage **316**, hits **4**, not KO'd. Boss: keepers-hall. |
| **How hard** | Medium. Elites can appear (4th-belt rule). Same rooms as White shared set. |
| **Fun / boring** | **6yo:** combo / ! marks fun; dying fast without Counter is frustrating. **12yo:** Steady feels "real"; elite in pillar-court is the spice. **Adult:** difficulty is fine; the boredom is the missing Green place (still Bamboo / Keeper). |

### Challenge — `?difficulty=challenge&room=bamboo-hall&seed=7`

**URL:** `https://dojo-ascent.jay-lindemuth.workers.dev/?difficulty=challenge&room=bamboo-hall&seed=7`

| | |
|---|---|
| **Played** | Bamboo Hall, Wave 2 crowded (4 swarmers). Lost Room 1 (~323 ticks). Challenge is **unlocked** at Green (core-design §13 / `difficulty.json` locked text). Shots: `challenge-fight.png`, `challenge-mid.png`. |
| **Simulated (full floor)** | Cleared in **~129 s**. Damage **322**, hits **4**, not KO'd. Rooms: bamboo-hall → training-yard → gauntlet → bopper-yard → shield-wall → pillar-court → shield-escort → keepers-hall. (Challenge patterns apply; this seed had no elite roll.) |
| **How hard** | Harder than Steady — more punish, grades on. Still the shared White floor layout. |
| **Fun / boring** | **6yo:** too many shadows at once = scary/overwhelming without Guided. **12yo:** Challenge is the interesting mode; wants new Green enemies. **Adult:** Challenge systems work; Green identity is still "White Tower + more tools." |

**Board peek (played):** Training Board shows **Kai M. / Green Belt · 1 stripe**, Gate to Blue (3 of 7 locks), next step Self-Defense #18, Character Stripe reward "Respect / Shield of Respect / +3 Guard". Shot: `green-board-clean.png`.

---

## 2. Shared White content vs new-for-Green

### Shared with White (what Green plays today)

| Kind | What | Source |
|---|---|---|
| **Rooms** | Shared Tower set (bamboo-hall, lantern-room, stone-garden, keepers-hall, gauntlet, …). Green has **no** live `floorSet` of its own yet. Engine note: *"tier keeps the shared rooms exactly as before (Green and up too, until their own sets arrive)."* | `content/rooms/*.json`, `packages/sim/src/run.ts` |
| **White copies** | `w-*` rooms exist for White ramp; Green resolves to the shared (non-`w-`) ids. | `content/rooms/w-*.json`, `apps/client/src/game/tower.ts` / `roomParam.ts` |
| **Enemies** | Live bestiary is still White/Orange kitchen set: brute, swarmer, shield, bopper, floor-keeper, dough-*, hearth-cook, … **No** pebble-pal / cliff-goat / stack-golem / boulder-roller / Stone Giant in `content/enemies/`. | `content/enemies/` |
| **Boss** | Floor Keeper in keepers-hall (not Stone Giant). | `content/rooms/keepers-hall.json`, `content/enemies/floor-keeper.json` |
| **Base moves** | Counter / Strike / Dash / Focus loop; Spin Kick default Strike family. | client combat + `content/abilities/strikes.json` |

### New or unlocked for Green (4th belt) today

| Kind | What | Source |
|---|---|---|
| **Challenge mode** | Unlocks at 4th belt. | `content/settings/difficulty.json` (`locked.challenge`), core-design §13 |
| **Elites** | Swift / Guarding from belt tier ≥ 4; Guided never gets Guarding. | `content/elites/elites.json` (`minBeltTier: 4`) |
| **Strikes earned** | Jumping Spins + Butterfly Flow (Spin Kick still available). | `fixtures/4-green-belt.json` + `earnedPicks` / `content/abilities/strikes.json` |
| **Seals / families** | Signed techniques **1–17**; live families escape/counter/advancing/guard/throw/disarm. **Lock family not live.** | `content/abilities/seal-families.json`, sim `familyRank` |
| **Throw (#11)** | Engine present (`counterThrow`); Green fixture has #11 signed. | G2B-04 / sim throw tests |
| **Virtues / stripes** | e.g. Shield of Respect at Green. | Board celebration shot; fixture stripes |
| **Systems already open** | Insights (2nd), Street Smarts (2nd), Journal, Sensei's Scroll, Welcome Week. | `content/settings/unlock-schedule.json`, core-design §13 |

### Missing for Green (Batch 2 / later board items)

- **Giant's Steps** room set — draft only: `drafts/content/rooms/giants-steps.json` (R-G2B-07).
- **Green enemies + Stone Giant** — drafts in `drafts/content/enemies/`; scale placeholders in `guardian-scale.json` (`bigGuardians`); art R-G2B-08.
- **Seals #16–20 kid text / Lock (#17)** — R-G2B-10 / R-G2B-09; Lock family `live: false`.
- **Green-only tower identity** — today Green is "shared White floors + Challenge/elites + more abilities."

---

## 3. Bugs

| # | What I did | What happened | Expected | Severity |
|---|---|---|---|---|
| 1 | Seeded `4-green-belt`, opened a Tower run, read Stance label | Fight HUD showed **"Beginner's Stance"** even though the profile has Open/Front/Fighting/Horse signed off | Equipped / earned stance name (or Ready Stance) once stances are signed | **ANNOYING** (loadout/stance seed or pick not applied on fake Green) |
| 2 | Watched Room 1 on Challenge/Standard with light random taps | Lost in Bamboo Hall in ~15–20 s | Fine for a masher; not a content bug. Noted so Simulated clears are not confused with the short live taps | — (not a product bug) |

No BLOCKS PLAY found on this pass. No crash, no soft-lock, Challenge correctly available.

---

## 4. Design-rule checks

| Rule | Result | Evidence |
|---|---|---|
| **No Power Rating outside the test screen** | **PASS** | HUD / Board / Dojo shots show belt, level, combo "+% power" buff, and training gains ("+N Power / Health / Guard") — not a Power Rating or Monster Rating readout. Hidden test screen not opened. |
| **Nothing for sale** | **PASS** | No shop, price, or buy CTA on Dojo, Board, or fight HUD. Class gift card is a free decoration ("A gift for training"). |
| **No chat** | **PASS** | No chat / friend message UI. |
| **No guilt** | **PASS** | Wording is hopeful ("Sensei is glad you train…", Guided tip). No "you missed" / streak shame on these screens. |
| **Real training matters most** | **PASS** | Gate / sign-offs / stripe / class gifts drive power; Tower is practice. Board next step is Self-Defense #18. |

---

## Quick summary for the Manager

Green on `main` **already** has Challenge, elites, Throw family progress, Jumping Spins + Butterfly, and Welcome Week systems — but still **climbs the shared White room set** against White-era enemies and the Floor Keeper. Giant's Steps + Green bestiary are drafts only. Three difficulty logs (live Room 1 + sim full floors) are above; shots in `/workspace/qa-g2b12-shots/`. File ready for `drafts/planning/R-G2B-green-baseline.md`.
