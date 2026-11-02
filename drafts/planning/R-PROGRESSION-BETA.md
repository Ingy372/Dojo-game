# R-PROGRESSION-BETA: the buildable beta plan for slots, loadout, Seal families and kata powers

**For:** Jay and the Manager. **From:** Researcher & Planner. **Written:** Nov 1, 2026. **Updated Nov 1 (night)** with the Manager's PB-12 calls (section 1a). Docs only. No game code, no work-board edit.
**Source of truth:** `drafts/planning/power-and-progression-redesign.md` (Jay's Oct 30 doc with his answers; it lands in the repo with the Green-to-Black phase-2 PR). Where this plan says "the Redesign", it means that file.
**Labels:** **[FACT]** is from the repo or the Redesign. **[GUESS]** is my estimate. **[DECIDE]** needs Jay.
**Target:** the Dec 15, 2026 beta (5-10 tester families, White to Orange only). **Freeze: Fri Dec 4. Build to testers: Mon Dec 7** (`BETA-DEC15-plan.md`).

## 1. Plain words for Jay

- Today every Seal and Strike you earn is on all the time, and the Fighting Style screen only has two picks (Stance and Virtue). The Redesign turns that into **five slots**: Stance, Virtue, Strike, Kata, Seals.
- A kid still earns everything at the dojo. Nothing is lost. The game just asks, "Which ones do you bring into the tower today?"
- **What you approved (Nov 1):** the slot change, the 6 Seal families, Jumping Spins at #2 and Butterfly Flow at #3, Seal slots of 2 (White, Yellow) and 3 (Orange), and kata powers in the beta (passive only).
- **What I need from you:** the 3 beta kata powers (Basic Form 1, Basic Form 2, Keon). I did not pick or tune them. The build uses empty placeholder slots until your list arrives. **Please send it by Fri Nov 13; the last safe day is Fri Nov 20** (section 9).
- **Good news:** no new numbers are proposed here. The only number rules are the ones already set: a kata power is at most **PE 12**, and stance plus kata stays inside the **+12% damage cap**. Every other number waits for the balance test (item PB-09).

## 1a. The Manager's PB-12 calls (Nov 1) [FACT, now recorded here]

| Call | What it changed in this plan |
|---|---|
| **PB-01, PB-02 and PB-03 come before R-G2B-01.** | R-G2B-01 (Jumping Spins data, Butterfly Flow to #3) waits on PB-01 to PB-03. Order table and critical path say so. |
| **R-G2B-03 becomes the 5 family medallions and is merged into PB-07.** | PB-07 is the one art item for the medallions. R-G2B-03 is closed as a separate item. |
| **Steady Breath goes in Counter, Strong Block in Guard** (as in Jay's doc). | Section 4.4 family map updated. No open question left. |
| **Retire both always-on Strike upgrades** (Spin Kick Finish extra hit, Butterfly Flow's -8 Focus), under "equip, don't stack". | Section 7 item 3 and PB-03 updated. |
| **White's 2 slots and 2 families are approved.** | Risk row and question removed. |
| **"Power coming soon" is OK** as the placeholder for a late kata power. | Section 5 item 5 and the kata risk row updated. |
| **Unlock screen and Sensei's Trial get owners.** | New items **PB-13** (Programmer), **PB-14** (Content Designer), **PB-15** (Artist). |
| PB-12 itself | **Done.** |

## 2. What is in the game today [FACT]

| Thing | Today (checked in the repo, Nov 1) |
|---|---|
| Loadout | `Loadout = { stance, virtue }` in `packages/sim/src/profile.ts`. Saved as `profile.loadout`. Read by `readLoadout`. |
| Strikes | One Strike, hard-wired in `COMBAT.strike` (`config.ts`: Focus cost 30, strength 2.5, reach 1.4, lunge 0.7, recovery 8 ticks). `tryStrike` in `world.ts` reads it. |
| Strike "unlocks" | `abilities.json` `strikes` has 2 entries that are small upgrades, not shapes: Spin Kick Finish (`strikeExtraHit` 0.5) and Butterfly Flow (`strikeCost` 8). Kick combo n unlocks `strikes[n]`, always on (`training.ts`, "in curriculum order"). |
| Seals | `abilities.json` `seals` has 10 placeholders. Self-defense technique n unlocks `seals[n]`, always on. Seals #11-15 do not exist yet. |
| What is on in a fight | `characterSetup` (`progression.ts`) puts **every unlocked Seal and Strike effect** in `effects`. No cap. |
| Katas | `content/katas/` has `basic-form-1`, `basic-form-2`, `keon`, `david-and-goliath`. Sign-off unlocks nothing in a fight today. |
| Fighting Style screen | `apps/client/src/ui/fightingStyle.ts` (`buildStyle`, `equipPick`) and the panel in `HomeScene.ts` (`styleModel`, `pickSlot`, `equipStyle`). Strikes and Seals show only in the "Always with you" row. Words are in `content/abilities/fighting-style.json` and show no numbers (D6). |
| Save | `Profile.version` is 1. `loadProfile` reads each field on its own, so adding a field is safe. |
| Balance sim | Strikes and Seals are **not** in the sim (`createRunWorld(..., [], ...)`). So the slot counts cannot move any measured number today. |

## 3. The design, in one page [FACT from the Redesign]

| Slot | Holds | How many | Unlocked by | Beta |
|---|---|---|---|---|
| Stance | one of the 5 stances | 1 | stance sign-off | Built |
| Virtue | one Virtue | 1 | stripes | Built |
| **Strike** | one Strike per kick combo | 1 | kick combo sign-off | Change |
| **Kata** | one power per kata | 1 | kata sign-off | New. Passive only. |
| **Seals** | one **family** Seal | 2 White, 2 Yellow, 3 Orange (Red and up: 4, after the beta) | self-defense sign-offs | Change |

Seven Redesign rules that every item here follows: unlocks give choices, stats carry growth; equip, don't stack; sidegrades not upgrades; the real technique comes first; nothing ships outside its band; reuse before inventing; never punish missing class.

## 4. Data and code spec (the Programmer builds from this, no guessing)

### 4.1 Types (`packages/sim/src/profile.ts` and `abilities.ts`)

```ts
// Loadout grows from 2 fields to 5. Every new field is optional on disk.
export interface Loadout {
  stance: string | null;
  virtue: string | null;
  strike: string | null;   // StrikeDef id. null = Spin Kick (the default).
  kata: string | null;     // KataPowerDef id. null = no kata power this run.
  seals: string[];         // SealFamilyDef ids. At most sealSlots(belt). No repeats.
}

export type SealFamilyId = 'counter' | 'guard' | 'escape' | 'disarm' | 'throw' | 'lock';

export interface SealRankDef {
  technique: number;       // the self-defense number, e.g. 11
  name: string;            // the real technique name shown on the rank ("Outside Reap")
  effects: Effect[];       // existing Effect types only, unless the item says "new"
  text: string;            // kid words, no numbers
}
export interface SealFamilyDef {
  id: SealFamilyId;
  name: string;
  text: string;
  icon: string;            // path under incoming-art/ (placeholder allowed)
  ranks: SealRankDef[];    // in technique order
}

export interface StrikeDef {
  id: string;              // 'spin-kick' | 'jumping-spins' | 'butterfly-flow'
  name: string;
  text: string;
  combo: number;           // the kick combo number that unlocks it (1, 2, 3)
  focusCost: number;       // 30 for every Strike (Redesign)
  hits: { strength: number; delayTicks: number }[]; // Spin Kick: one hit, strength 2.5
  reach: number; lungeTiles: number; recoveryTicks: number;
}

export interface KataPowerDef {
  id: string;              // e.g. 'basic-form-1-power'
  kata: string;            // content/katas id
  name: string;            // from Jay's list
  text: string;            // from Jay's list, kid words
  status: 'placeholder' | 'final';
  effects: Effect[];       // passive only. [] while status is 'placeholder'.
}
```

### 4.2 Data files (all data, no numbers in code)

| File | Holds | Who fills it |
|---|---|---|
| `content/abilities/seal-families.json` (new) | 6 `SealFamilyDef`. Beta fills ranks for #1-15. `lock` exists with no ranks (locked, "Coming later"). | Content Designer (words) and Programmer (effects) |
| `content/abilities/strikes.json` (new) | 3 `StrikeDef`. Spin Kick copies `COMBAT.strike` exactly. Jumping Spins and Butterfly Flow start from the placeholder numbers in `S4-kick-combos.md`. | Programmer, tuned by PB-09 |
| `content/katas/powers.json` (new) | 3 `KataPowerDef` (Basic Form 1, Basic Form 2, Keon), all `placeholder` until Jay's list. | Jay's list, then Content Designer |
| `content/abilities/fighting-style.json` | New slot names, hints, empty-slot lines, the one-time note. | Content Designer |

The old `abilities.json` `strikes` and `seals` arrays are kept for one release as the migration source, then removed (PB-02, PB-03).

### 4.3 Rules in code

1. **Slots by belt.** `sealSlots(belt)`: White 2, Yellow 2, Orange 3, Green and Blue 3, Red and up 4 (Green and up are in the Redesign table, not in the beta). One function, one table, in data. **[FACT]**
2. **A Seal is a family.** The family unlocks at its first signed-off technique. **Rank = number of signed-off techniques in that family.** The effects of a rank are the effects of every signed-off technique in the family (set, not order, so a catch-up sign-off works). The family shows the real name of the newest rank ("Throw Seal, Rank 2: Reap and Finish").
3. **Equip rules.** `equipSeal(loadout, family)` adds the family if there is a free slot, it is unlocked, and it is not already in. If full, the UI asks which one to swap (no silent swap). Removing is always allowed. A family can never be in two slots.
4. **Strike.** The Strike button reads the equipped `StrikeDef` (default Spin Kick). `tryStrike` loops `hits`. Spin Kick must give **byte-for-byte today's result** (a test checks it). Today's two upgrade effects are removed from the always-on list (section 7, item 3).
5. **Kata power.** One equipped. Its `effects` join `characterSetup.effects`. **Passive only:** the type allows only effect types already marked passive. The stance + kata damage cap (+12%) is checked at setup: if `stance powerScale + kata damage` is above 0.12, the data test fails (it never clips silently in game).
6. **Unearned picks are dropped, never an error.** `normalizeLoadout` is extended: any pick that is not earned goes to the default for its slot. Extra Seals beyond the slot count are dropped from the end.
7. **Setup.** `characterSetup` builds `effects` from: gear, equipped Seal ranks, kata power. It stops using "all unlocked Seals and Strikes". `PlayerSetup` gets `strike: StrikeSetup`.

### 4.4 Beta Seal families for #1-15 (my mapping, from `S4-self-defense-powers.md` rows 1-15)

**Jay said his #1-15 template is done and the Redesign says Jay decides each family. I could not find a family column for #1-15 in the repo, so this is my mapping from the S4 categories. It is data, so swapping a row is a one-line edit.** The effects are the S4 effects, kept as **placeholders** until PB-09.

| Family | Techniques (belt) | Effect types already in `effects.ts` | New mechanic |
|---|---|---|---|
| Escape | #1 Off the Line (W), #2 Other Side (W), #4 Drive Back (W), #15 Slip and Double (O) | `dashOnBlock`, `counterWindow` | `counterHits`, `counterPush` (small) |
| Counter | #3 Spin Back Fist (W), #5 Spin Elbow (W), #6 Arm Wrap (Y), #7 Palm Heel (Y), #10 Grab and Strike (Y) | `rippleCounter`, `staggerTicks`, `counterStrength`, `staggerBonus` | none |
| Guard | #8 Block and Strike (Y), #9 High Block Strike (Y) | `blockReflect` | `reflectStaggers` (small flag) |
| Throw | #11 Outside Reap (O), #12 Reap and Finish (O) | none | `counterThrow` + thrown state, `downBonus` (R-G2B-04) |
| Disarm | #13 Kick the Weapon (O), #14 Kick and Spin (O) | `disarm` | `disarmAttacks` (small) |
| Lock | none in the beta (#17 is the first) | none | later |

How the old 10 placeholder Seals land (the Redesign says each becomes a rank effect, none are thrown away). Eight match a #1-15 row by effect type: Off-Balance (`staggerTicks`) is #6, Escape Step (`dashOnBlock`) is #2, Sweep (`rippleCounter`) is #3, Create Distance (`blockReflect`) is #8, Disarm is #13, Throw (`counterStrength`) is #7, Follow Through (`staggerBonus`) is #10, Sharp Eyes (`counterWindow`) is #15.

**Settled by the Manager (Nov 1, per Jay's doc): the last two get a home.**

| Old Seal | Family | Where in the family | Notes |
|---|---|---|---|
| **Steady Breath** (heal on a Great Counter) | **Counter** | Rides on the last beta Counter rank (#10 Grab and Strike, rank 5) | Placeholder amount until PB-09. |
| **Strong Block** | **Guard** | Rides on the last beta Guard rank (#9 High Block Strike, rank 2) | Placeholder amount until PB-09. |

Both are data rows in `seal-families.json`. The Content Designer (PB-06) can move one to another rank in the same family with a one-line edit if Jay's template reads differently. A student who had either old Seal keeps its effect when they equip that family at that rank, so nobody's earned power disappears. PB-02 builds both and PB-09 sets the amounts.

## 5. UI flow: picking and equipping

Built on the Fighting Style screen that exists (`buildStyle`, `equipPick`, `styleModel`, `pickSlot`, `equipStyle`). Same pattern: **tap a card, then tap a pick.** No new screen.

1. **Home -> Fighting Style.** The slot cards now read: **Stance, Virtue, Strike, Kata, Seal 1, Seal 2 (and Seal 3 at Orange).** Seal cards that are not open yet show a quiet lock ("Orange belt"), never an error. Phone landscape: the cards wrap to two rows; the tray stays the existing paged tray (`trayPaging`, 3 per page).
2. **Tap a card -> the tray shows the picks for that slot.** Earned picks are bright and tappable. Not-yet-earned picks are dim with "Learn this at the dojo" (existing `notYet` wording). The Lock family shows "Coming later".
3. **Tap a pick -> it equips and the card fills with its picture and name.** The right side shows one kid line (no numbers, D6). For Seals the line shows the real technique name of the newest rank.
4. **Seals full?** Tapping a third Seal asks "Swap with which one?" and highlights the 2-3 cards. Cancel is one tap. Never silent.
5. **Kata card.** Shows the equipped kata power. A white belt sees one pick (Basic Form 1). An orange belt sees up to 3. While Jay's powers are placeholders (or one is late), the card shows the kata name and **"Power coming soon"** in a friendly tone, never grey-failure. **The Manager approved this wording on Nov 1.** The game plays normally.
6. **One-time note after an update** (only for saves that had Seals on): "Your Seals now go in slots. We picked your first ones. Change them any time!" One tap to dismiss. Nothing was lost (section 7).
7. **No pressure rules.** No timers, no red badges, no "you are missing power". A new unlock gets a soft "New" dot until opened. Reduced-motion: no tray slide, no pulse.
8. **Always works.** If no slot is filled, the game plays with Spin Kick and no Seals (today's default feel for a new player).

## 6. Content needed, and what waits on Jay's list

| Content | Who | Waits on |
|---|---|---|
| Family name and one-line text for the 5 beta families (Counter, Guard, Escape, Disarm, Throw) and the Lock "Coming later" line | Content Designer | Jay OKs the names (he approved the 6 families on Nov 1) |
| Rank text for #1-15 (kid words, real technique name, no numbers, no injury words) | Content Designer | Family map for #1-15 confirmed (4.4). Builds on R-G2B-02. |
| Strike names and lines for Jumping Spins and Butterfly Flow | Content Designer | nothing |
| **3 kata powers (Basic Form 1, Basic Form 2, Keon): name, one sentence, what it does on screen** | **Jay** | **Jay's power list.** Toni's kata descriptions help but are not needed for passive powers. |
| Kata power kid text | Content Designer | Jay's list |
| Slot art: 5 family medallions (+ Lock), Strike glyph, Kata glyph, empty-slot art | Artist | nothing (code-drawn placeholders are allowed first, as in B-POLISH-2) |
| Words for the one-time note and empty-slot lines | Content Designer | nothing |

**R-G2B-03 (decided by the Manager, Nov 1):** it is now the 5 family medallions and is merged into **PB-07**. There is no separate per-technique icon item.

| Content (added Nov 1) | Who | Waits on |
|---|---|---|
| Unlock screen lines (kid words, real technique name, no stat dump) and the Sensei's Trial room lines | Content Designer (PB-14) | PB-06 (the same word rules and rank names), PB-13 for the screen layout |
| Unlock screen art and Sensei's Trial room art | Artist (PB-15) | PB-13 for sizes |

## 7. Save and migration (old saves keep working)

**Rule: stats never change, nothing is lost, nothing is deleted.** Power, Health, levels and sign-offs are untouched. Only the choice of which option-powers are on moves into slots, as you approved.

1. **Additive fields.** `Loadout` gets `strike`, `kata`, `seals`. `readLoadout` reads each on its own: missing or wrong shape gives `null`, `null`, `[]`. A save with only `{stance, virtue}` still loads. `Profile.version` stays 1.
2. **One-time seed (`migrateLoadoutV2`, like `migrateReadyStance`).** Runs once, guarded by `loadoutV2: boolean` (new profiles start true, so it never runs for them; running it twice changes nothing).
   - `strike`: null (Spin Kick). If the student had earned a higher Strike, pick the **newest earned** one so they are not set back.
   - `seals`: fill up to `sealSlots(belt)` with the families the student **earned first** (oldest unlock first).
   - `kata`: null.
   - Set a `showSlotNote: true` flag so the friendly note shows once.
3. **Old Strike upgrades retired (decided Nov 1).** Today's `follow-up-kick` (Spin Kick Finish extra hit) and `quick-combo` (Butterfly Flow, -8 Focus) stop being always-on, under "equip, don't stack". Spin Kick stays the same as today's base Strike. This is a small drop in always-on power for a student who earned them, so the friendly one-time note covers it, and Power and Health are unchanged. Their ideas live on in the new shapes: Jumping Spins (several hits) and Butterfly Flow (a harder, slower hit).
4. **Old Seal ids.** The 10 placeholder ids map to family ranks (4.4). An unknown id in a save is ignored, never an error (the `LOADOUT_ID` check already drops odd ids).
5. **Beta context.** Every tester starts fresh or from the grown-up belt entry (B-BELT), so the migration matters most for Jay's and staff's phones and the QA saves. It is still tested, because Rule 7 says never punish.
6. **Wipe data** (B-SAFE) already clears the loadout. No change.

## 8. Tests (Vitest, in the style of `p-menu2-d-loadout` and `r-stance-*`)

| Test file (new) | Checks |
|---|---|
| `p-prog-a-loadout-save.test.ts` | Round trip of the 5 fields. Old `{stance, virtue}` and old `{form}` saves load. Odd ids dropped. Running the seed twice gives the same save. |
| `p-prog-b-seal-slots.test.ts` | Slots are 2/2/3 by belt. Equip fills, full asks for swap, no repeats, remove works, unearned dropped, extras trimmed. |
| `p-prog-c-seal-ranks.test.ts` | Rank = signed-off techniques in the family. Out-of-order sign-offs give the same effects. Lock is locked in the beta. The old 10 Seals each land in one family. |
| `p-prog-d-strike.test.ts` | Spin Kick equals today's Strike (damage, Focus, recovery). Jumping Spins and Butterfly Flow cost 30 Focus. Equip needs the combo sign-off. |
| `p-prog-e-kata-power.test.ts` | One power at most. Placeholder power adds no effect. Stance + kata damage is at most 0.12 for every pair. Passive-only type check. |
| `p-prog-f-migration.test.ts` | A fully-loaded old save (all 10 Seals on) gets the first N families, keeps Power and Health unchanged, shows the note once. |
| `p-prog-g-style-screen.test.ts` | Slot cards and trays for a White, Yellow and Orange profile. Lock text. Swap prompt. No numbers on screen (D6). Touch targets are at least 44 pt. |
| `p-prog-h-no-pressure-words.test.ts` | Wording check: no timers, no "missing", no purchase or pressure words in the new strings. |
| `p-prog-i-unlock-trial.test.ts` | A new sign-off shows the unlock screen once, with the real technique name and no numbers. A seen unlock never shows again. The Trial room auto-equips the new move only for that room and restores the loadout after. The reward is given once. Reduced motion and no-pressure wording hold. (PB-13) |
| Balance: `test/balance/prog-*.test.ts` (BALANCE=1) | PB-09 below. |

## 9. Balance check (follows `balance-check`: every belt, every difficulty)

**What this section proves, and what it does not.**
- **Seals and Strikes are not in the sim.** So slot counts (2/2/3) cannot change any measured result today. I did not invent a number for them. PB-09 adds them to the harness and measures them.
- **The one number that exists is the kata reserve: PE 12** (R-INSIGHT-BAL). I re-measured it with the same method on every belt and difficulty. A stand-in "+12% Power" is the PE 12 yardstick. Bots: kid (novice, 12% random presses, 100 seeds), newer and careful (50 seeds). Noise is about **+/-5 PE** (R-INSIGHT-BAL).
- **Target (this plan):** PE 12 +/- 5 for the kid bot. Newer and careful win 100% almost everywhere, so they are **info only** (health lost and ticks). Flag: any tier outside the target, and any jump between neighbouring belts of more than about 2x.

**Table 1: kid bot (100 seeds), +12% Power stand-in = PE 12. One row per belt and difficulty.** Net PE = PE with the stand-in minus PE of the same bot with nothing (the harness reading is noisy, so the net is what I judge). **Target: net PE 7 to 17** (12 +/- 5). Win % is base -> with stand-in.

| Belt | Difficulty | Inputs | Win % | Health lost | PE with / without | Net PE | Target | Result |
|---|---|---|---|---|---|---|---|---|
| 1 | Guided | kid, +12%, 100 seeds | 37 -> 39 | 32.1 -> 31.3 | 11.3 / 8.2 | 3.0 | 7-17 | **FAIL (low)** |
| 2 | Guided | kid, +12%, 100 seeds | 44 -> 44 | 32.5 -> 29.2 | 17.2 / 6.4 | 10.8 | 7-17 | pass |
| 3 | Guided | kid, +12%, 100 seeds | 76 -> 86 | 28.9 -> 24.8 | 25.3 / 16.1 | 9.3 | 7-17 | pass |
| 4 | Guided | kid, +12%, 100 seeds | 42 -> 61 | 32.8 -> 30.0 | 18.1 / 5.2 | 12.9 | 7-17 | pass |
| 5 | Guided | kid, +12%, 100 seeds | 36 -> 48 | 33.4 -> 30.6 | 13.1 / 3.3 | 9.8 | 7-17 | pass |
| 6 | Guided | kid, +12%, 100 seeds | 39 -> 45 | 33.3 -> 30.3 | 13.4 / 3.1 | 10.3 | 7-17 | pass |
| 7 | Guided | kid, +12%, 100 seeds | 33 -> 52 | 33.6 -> 30.9 | 11.4 / 3.5 | 7.9 | 7-17 | pass |
| 8 | Guided | kid, +12%, 100 seeds | 39 -> 49 | 32.6 -> 29.9 | 12.8 / 3.0 | 9.8 | 7-17 | pass |
| 9 | Guided | kid, +12%, 100 seeds | 43 -> 49 | 32.7 -> 29.7 | 13.4 / 3.0 | 10.4 | 7-17 | pass |
| 10 | Guided | kid, +12%, 100 seeds | 43 -> 48 | 32.3 -> 29.8 | 13.1 / 3.3 | 9.8 | 7-17 | pass |
| 1 | Standard | kid, +12%, 100 seeds | 1 -> 6 | 43.9 -> 42.4 | 21.4 / 14.6 | 6.8 | 7-17 | **FAIL (low)** |
| 2 | Standard | kid, +12%, 100 seeds | 7 -> 7 | 45.8 -> 43.4 | 13.3 / 5.6 | 7.7 | 7-17 | pass |
| 3 | Standard | kid, +12%, 100 seeds | 23 -> 39 | 43.1 -> 38.1 | 22.7 / 10.5 | 12.1 | 7-17 | pass |
| 4 | Standard | kid, +12%, 100 seeds | 2 -> 5 | 46.5 -> 43.2 | 17.0 / 5.7 | 11.2 | 7-17 | pass |
| 5 | Standard | kid, +12%, 100 seeds | 2 -> 7 | 46.5 -> 43.7 | 16.3 / 4.8 | 11.5 | 7-17 | pass |
| 6 | Standard | kid, +12%, 100 seeds | 2 -> 6 | 46.8 -> 42.9 | 18.0 / 4.5 | 13.5 | 7-17 | pass |
| 7 | Standard | kid, +12%, 100 seeds | 2 -> 11 | 46.4 -> 44.0 | 13.2 / 4.5 | 8.7 | 7-17 | pass |
| 8 | Standard | kid, +12%, 100 seeds | 3 -> 10 | 45.6 -> 43.5 | 14.1 / 5.0 | 9.1 | 7-17 | pass |
| 9 | Standard | kid, +12%, 100 seeds | 0 -> 8 | 45.0 -> 43.0 | 13.5 / 6.0 | 7.5 | 7-17 | pass |
| 10 | Standard | kid, +12%, 100 seeds | 3 -> 10 | 45.7 -> 43.4 | 13.9 / 4.9 | 9.0 | 7-17 | pass |
| 1 | Challenge | kid, +12%, 100 seeds | 0 -> 0 | 51.9 -> 50.5 | 15.5 / 13.6 | 1.9 | 7-17 | **FAIL (low)** |
| 2 | Challenge | kid, +12%, 100 seeds | 0 -> 1 | 52.9 -> 50.9 | 14.1 / 12.1 | 2.0 | 7-17 | **FAIL (low)** |
| 3 | Challenge | kid, +12%, 100 seeds | 6 -> 7 | 52.6 -> 46.8 | 14.5 / 2.0 | 12.5 | 7-17 | pass |
| 4 | Challenge | kid, +12%, 100 seeds | 2 -> 1 | 51.7 -> 50.3 | 14.5 / 7.3 | 7.2 | 7-17 | pass |
| 5 | Challenge | kid, +12%, 100 seeds | 3 -> 2 | 50.1 -> 48.2 | 16.2 / 9.2 | 7.1 | 7-17 | pass |
| 6 | Challenge | kid, +12%, 100 seeds | 0 -> 6 | 50.3 -> 48.3 | 16.6 / 9.1 | 7.5 | 7-17 | pass |
| 7 | Challenge | kid, +12%, 100 seeds | 2 -> 5 | 51.0 -> 48.6 | 11.7 / 1.2 | 10.6 | 7-17 | pass |
| 8 | Challenge | kid, +12%, 100 seeds | 3 -> 3 | 50.2 -> 48.3 | 12.4 / 4.9 | 7.5 | 7-17 | pass |
| 9 | Challenge | kid, +12%, 100 seeds | 2 -> 3 | 49.9 -> 47.9 | 13.4 / 4.7 | 8.7 | 7-17 | pass |
| 10 | Challenge | kid, +12%, 100 seeds | 3 -> 3 | 50.6 -> 48.5 | 12.4 / 3.2 | 9.3 | 7-17 | pass |

**Table 2: newer and careful bots (50 seeds each). Info only.** They win 100% in every cell, with and without the stand-in, so PE cannot be read (the ruler saturates). The honest numbers are health lost and fight length (ticks).

| Bot | Difficulty | Win % (all belts) | Health lost, base -> stand-in (belt 1 to 10) | Fight length change (ticks), belts 1-10 | Result |
|---|---|---|---|---|---|
| newer | Guided | 100 -> 100 | 0.6-0.8 -> 0.5-0.8 | -7% to -2% | info |
| newer | Standard | 100 -> 100 | 3.6-5.1 -> 3.0-4.8 | -8% to -2% | info |
| newer | Challenge | 100 -> 100 | 7.0-9.4 -> 6.2-8.0 | -8% to -3% | info |
| careful | Guided | 100 -> 100 | 0.2-0.4 -> 0.3-0.4 | -6% to -2% | info |
| careful | Standard | 100 -> 100 | 1.2-1.8 -> 1.3-1.8 | -4% to -2% | info |
| careful | Challenge | 100 -> 100 | 5.3-7.0 -> 4.7-7.5 | -7% to 6% | info |

**What the tables say:**

- **Pass:** 26 of 30 kid cells are inside net PE 7 to 17. The +12% reserve is a fair "PE 12" at belts 2 to 10 on all three settings, including all three beta belts on Guided and Standard (belt 3 Standard: 12.1).
- **Flag, 4 cells low:** belt 1 Guided (3.0), belt 1 Standard (6.8, one tenth under the line, inside the +/-5 noise), belt 1 Challenge (1.9) and belt 2 Challenge (2.0). In the Challenge cells the kid wins 0 or 1 of 100 with or without the power, so win rate cannot move and PE cannot be read. **Challenge is built for belts 4 and up** (R-CHALLENGE), so belts 1 to 3 on Challenge are info only for the beta. Belt 1 Guided and Standard are real, and they say a kata power at White may feel smaller than 12. That is safe (under the ceiling), not a failure to fix.
- **Flag, neighbour jump over 2x:** the kid **win-rate swing** at **belt 3 (Orange)** on Standard is +16 points (23 -> 39), against +0 at belt 2 and +3 at belt 4. Belt 3 Guided is +10 against +0 at belt 2. The PE at belt 3 is on target (12.1), so the cause is where Orange's base win rate sits on the curve (23%, the steep part), not a bigger power. **For the beta this means a kata power will be felt most at Orange.** PB-09 must check Orange first.
- **Newer and careful bots:** wins stay 100%. Fights get about 2% to 8% shorter (one cell, careful on Challenge, is 6% longer, which is noise-sized) and health lost moves by a few tenths. No sign of the +12% reserve breaking the tower for skilled players.
- **Seeds and method:** stand-in is the same as R-INSIGHT-BAL's PE 12 yardstick, run by `packages/sim/test/balance/insight-sim.ts` (`play`, `read`, `buildRuler`, `pe`). The one-off script used for these tables was not committed.


**Seal slots vs choices (a count from the data, no sim needed):**

| Belt | Slots | Families the student has (my 4.4 mapping) | Real choice? |
|---|---|---|---|
| White (#1-5) | 2 | Escape, Counter (2) | **No choice yet.** Both fit. Approved by the Manager (Nov 1): it teaches the screen. |
| Yellow (#6-10) | 2 | Escape, Counter, Guard (3) | Yes, 3 for 2. |
| Orange (#11-15) | 3 | Escape, Counter, Guard, Throw, Disarm (5) | Yes, 5 for 3. |

**Proposal: no new tuning numbers.** Only these two ceilings stay, and every tier passes them by the table above: a kata power is **at most PE 12**, and **stance + kata damage is at most +12%**. All Seal, Strike and kata amounts stay **placeholders** until PB-09 shows a table where every belt and difficulty passes.

**PB-09 test matrix (from the Redesign's four tests and R-INSIGHT-BAL section 7).** One power at a time. Cells: {no cards, random pool, top 5 pairs, 4 routes, best-pick bot} x {kid, newer, careful}, Standard, **plus** Guided and Challenge for the table above. 1) PE within 15% of the slot target. 2) Win rate within 5 points of the slot average. 3) The newest option ranks top 2 for a best-pick bot on its own belt's floors. 4) A typical student's Power Rating still hits belt pacing. Passive powers that touch Focus, speed or guard need a stand-in effect in the harness.

## 10. Board items

Owners: **Programmer, Content Designer, Artist, Tester, Jay** (Manager for PB-12). One owner per item. Size is my **[GUESS]** in working days.

| ID | Owner | What | Done when | Waits on | Size |
|---|---|---|---|---|---|
| **PB-01** | Programmer | Loadout v2: the types in 4.1, `readLoadout` for 5 fields, `normalizeLoadout`, `sealSlots(belt)`, the migration seed in section 7. No UI, no engine change. | `p-prog-a`, `p-prog-b` (slot math), `p-prog-f` pass. An old `{stance, virtue}` save loads and gets the first families. A new test shows Power and Health are unchanged. | nothing | 3 |
| **PB-02** | Programmer | Seal families: `seal-families.json`, rank rules, `characterSetup` uses only equipped Seals. The 10 placeholder Seals move into ranks. Beta families Escape, Counter, Guard, Disarm work. Throw ranks wired but off until R-G2B-04. | `p-prog-c` passes. A White profile with 2 equipped families has only those effects in a test fight. The Lock family shows locked. | PB-01. Throw effects: R-G2B-04. | 5 |
| **PB-03** | Programmer | Strike slot: `strikes.json`, `tryStrike` reads the equipped Strike, Spin Kick as data, equip by combo sign-off. Retires the two old always-on Strike upgrades (decided Nov 1). | `p-prog-d` passes. Spin Kick gives today's exact damage in a test. A Yellow profile can equip Jumping Spins. **R-G2B-01 (Jumping Spins data, Butterfly Flow to #3) comes after PB-01 to PB-03 and lands on this slot (Manager, Nov 1).** | PB-01 | 4 |
| **PB-04** | Programmer | Kata power slot: `powers.json` with 3 placeholder powers, equip, passive-only effects, the +12% cap data test. One kata power per run. | `p-prog-e` passes. A White profile can equip Basic Form 1's placeholder and play. A final power added by data only (no code) changes the fight. | PB-01. Real powers: PB-11. | 3 |
| **PB-05** | Programmer | Fighting Style screen: 5 slot cards, Seal swap prompt, Lock "Coming later", Kata card, the one-time note, "New" dots, reduced motion. | `p-prog-g` and `p-prog-h` pass. On a phone-size preview a White, Yellow and Orange profile each equip every slot in at most 3 taps per slot. Touch targets 44 pt. | PB-01 (can start with fixtures). Final text: PB-06. | 6 |
| **PB-06** | Content Designer | Words: families, ranks #1-15, Strikes, empty slots, the one-time note, kata power lines when they arrive. Confirm the #1-15 family map against Jay's template. | New `drafts/content/abilities/seal-families-text.json`. Word check passes (no "break" outside Break Free, no injury words, no numbers). A list of any families that differ from 4.4 is in the Delivery Note. | Family map (Jay's #1-15 template). Kata lines: PB-11. | 3 |
| **PB-07** | Artist | Slot art: 5 family medallions (this is **R-G2B-03, merged in**: it replaces per-technique Orange Seal icons #11-15) plus a Lock silhouette, Strike glyph (with the Jumping Spins icon), Kata glyph, empty-slot art, in the approved icon families. | Files in `incoming-art/icons-slots/` with README, 128 x 128, transparent, phone-size preview Jay can OK at a glance. R-G2B-03 is closed on the board when this merges. | nothing | 3 |
| **PB-08** | Content Designer | Fighting Style first-use help: one Sensei line per screen, one new idea per session (slots first, swap later). | Note with at most 3 lines, kid words, no pressure. Reviewed by the Learning & Engagement Designer. | PB-06 | 1 |
| **PB-09** | Programmer | Balance harness: put Strikes, Seals and kata powers into the sim and run the four tests of section 9 on belts 1-10 x Guided, Standard, Challenge x 3 bots. Fill the Seal and Strike rank numbers. | A table in the PR: every belt and difficulty passes, or a flagged list sent back for number changes. No tier is more than 2x its neighbour without a note. | PB-02, PB-03. Kata rows: PB-04 and PB-11. | 6 |
| **PB-10** | Tester | Beta test plan and run for the loadout: old saves, slot caps, swap, Lock text, Strike equip, kata placeholder, Guided/Standard/Challenge, reduced motion, wipe data. | `drafts/planning/R-PROGRESSION-test-plan.md` with at least 20 numbered cases, each with steps and a pass line. Run on a phone-size window after PB-05 merges, results logged. | Writing: nothing. Running: PB-05. | 3 |
| **PB-11** | **Jay** | Send the 3 kata powers: name, one sentence, what you see on screen. Passive only. | A list of 3 in any form. | nothing. **Target Fri Nov 13, latest Fri Nov 20.** | n/a |
| **PB-12** | Manager | **DONE (Nov 1).** (a) R-G2B-01 comes after PB-01 to PB-03. (b) R-G2B-03 is the 5 family medallions, merged into PB-07. (c) Owners for the unlock screen and Sensei's Trial: PB-13, PB-14, PB-15. | Board updated. | done | n/a |
| **PB-13** | Programmer | **Unlock screen and Sensei's Trial room** (Redesign, "Making new moves exciting", items 1 and 2). (1) Unlock screen: when a sign-off syncs, the next time the student opens the game one short screen names the real technique and the new Strike, Seal rank or kata power, in kid words from PB-14, with one tap to dismiss. A `seenUnlocks` list in the save (additive, per-field reader) makes it show once. (2) Sensei's Trial: the first run after an unlock opens with **one short room from one template**, the new move auto-equipped for that room only (the real loadout is restored after), and a **small one-time reward** from an existing decoration or XP source. No new currency. The reward size is a placeholder until the Manager and PB-09 set it. | `p-prog-i` passes. In a test, a new sign-off shows the screen once and a second open does not. The Trial room loads for a Strike, a Seal rank and a kata power (placeholder is fine), restores the loadout after, and gives the reward once. A tester can clear the room on a phone-size window in under a minute, with no timer, no fail screen and no pressure words. Reduced motion respected. | PB-01 (save fields). PB-02, PB-03, PB-04 for the three unlock kinds. Final words: PB-14. Final art: PB-15 (placeholders first). | 5 |
| **PB-14** | Content Designer | **Unlock screen and Sensei's Trial words.** One kid-word unlock line per kind (Strike, Seal rank, kata power) that uses the real technique name ("Your throws now knock enemies down longer"), the Trial room intro and clear lines, the reward line, and the "Power coming soon" unlock line for a late kata power. Words only. Art is PB-15. | New `drafts/content/abilities/unlock-text.json` with lines for Strikes 1-3, the 15 rank names from PB-06, and the 3 kata powers. Word check passes (no numbers, no injury words, no pressure or purchase words). Reviewed by the Learning & Engagement Designer against the real technique. | PB-06 (same family map and rank names). Kata lines: PB-11. | 2 |
| **PB-15** | Artist | **Unlock screen art and Sensei's Trial room art.** One unlock card frame with a spot for the technique picture, and one Trial room backdrop and prop set that reads as "a short training room". Uses PB-07's medallions for the Seal kind. | Files in `incoming-art/unlock-trial/` with README, phone-size preview Jay can OK at a glance, in the approved style, no text baked in. Code-drawn placeholders are allowed first. | PB-13 (sizes and layout). PB-07 (medallions). | 3 |

## 11. Order, critical path and scope risks

### Order [GUESS]

| Week | Work |
|---|---|
| Nov 2-6 | **PB-01** (everything else needs it). PB-06, PB-07, PB-10 (writing) start. R-G2B-04 (thrown state) in parallel. |
| Nov 9-13 | PB-02, PB-03, PB-04 in parallel. **Jay sends kata powers (target Nov 13).** PB-14 words start when PB-06 has rank names. **R-G2B-01 starts only after PB-03 (Manager call).** |
| Nov 16-20 | PB-13 (unlock screen, Sensei's Trial) with placeholders; PB-15 art. PB-05 on real data. PB-09 first runs (Seals, Strikes). Kata power data goes in (latest day: Nov 20). Tier 3 art deadline Nov 20 (existing). |
| Nov 23-29 | Thanksgiving week, light load. PB-09 tuning loop. PB-05 polish. |
| Nov 30-Dec 3 | PB-10 run. Fix. All numbers must pass PB-09. |
| **Dec 4** | **Freeze.** Fixes only. |
| Dec 7 | Build to testers. Dec 8-14 buffer. |

### Critical path

**PB-01 -> PB-02, PB-03 -> PB-09 (first tuning) -> PB-05 -> PB-10 -> freeze Dec 4.**
**Unlock path:** PB-01 -> PB-02, PB-03, PB-04 -> PB-13 (with PB-14 words and PB-15 art) -> PB-10 -> freeze. It runs next to the main path and must land before the Nov 30 test run.
**Kata path:** Jay's list (PB-11) -> PB-04 final data -> PB-09 kata rows -> freeze. It is the only path where a person outside the team can stall the date.

### Scope risks

| Risk | Tag | Why | Fallback |
|---|---|---|---|
| Jay's kata list arrives after Nov 20 | **HIGH** | Kata powers must ship in the beta. The test needs about a week and the tuning loop hits Thanksgiving. | Ship the slot and the 3 katas with "Power coming soon" (approved by the Manager, Nov 1) and send the real powers as a data-only update before Dec 15. |
| Seal and Strike numbers are untested | **HIGH** | They are not in the sim. PB-09 builds the harness first. | Use the S4 numbers at a smaller size (about half) and re-check. Never ship an unchecked tier. |
| Counter holds 5 of 15 techniques, Escape 4 | MED | Jay decides families. A big family ranks up fast and gets strong. | PB-09 sets rank amounts so the family total fits the Seal budget. A family map change is a data edit. |
| Orange (belt 3) has the biggest kid win-rate swing | MED | The +12% stand-in moves the kid win rate +16 points at Orange on Standard, against +0 and +3 next door (PE itself is on target). Orange is a beta belt. | Keep kata powers at PE 12 or less and re-check Orange first in PB-09. |
| Throw needs the thrown state | MED | R-G2B-04 builds it. If it runs long, Throw stays dark. | Cut line: Orange has 4 families (no Throw) and slots stay 3. Say so in the build note. |
| Unlock screen and Sensei's Trial run long | MED | Now owned (PB-13, PB-14, PB-15) but it needs the three unlock kinds to exist, so it starts late. | Cut line: the unlock screen ships, and the Trial room ships for Strikes and Seals only. Say so in the build note. |
| **Orange grabber or brute enemy behaviour for Throw** | MED | In the Redesign beta table ("Enemy tuning") and needed for the newest-option test (Test 3) on Orange, but **no item and no owner yet**. It was not part of PB-12. | **Manager: assign an owner** (it needs R-G2B-04 first). Without it, Throw is not the easy answer on Orange floors and Test 3 may fail for it. |
| Art for slots, unlock screen and Trial room | LOW | Code-drawn placeholders are enough for the beta. | Ship placeholders if art is late. |
| Power taken from saves that had everything on | LOW | Old Strike upgrades and extra Seals move out. | Section 7: stats unchanged, friendly note, first families seeded. |

### Open for Jay (the Manager's calls are in section 1a, so this is all that is left)

1. **Kata powers (PB-11):** please send the 3 powers (Basic Form 1, Basic Form 2, Keon) by Fri Nov 13, latest Nov 20. If one is late the card says "Power coming soon" (approved).
2. **Families for #1-15:** is my mapping in 4.4 the same as your filled template? If not, tell the Content Designer the rows that differ. (Steady Breath in Counter and Strong Block in Guard are settled.)

**For the Manager (not a Jay question):** assign an owner for the Orange grabber or brute behaviour (see the risk table).

## Delivery Note

- **ITEM:** R-PROGRESSION-BETA (updated Nov 1 with the Manager's PB-12 calls)
- **WHAT:** The buildable beta plan for slots, loadout, 6 Seal families and passive kata powers: types and data files, UI flow, content list, save migration, tests, a balance table for belts 1-10 x 3 difficulties, 15 board items (PB-01 to PB-15) with owners, "Done when" and waits-on, and the order to Dec 15. New since the first version: PB-12 marked done; PB-13 (Programmer, unlock screen and Sensei's Trial room), PB-14 (Content Designer, words), PB-15 (Artist, art); R-G2B-03 merged into PB-07; Steady Breath in Counter and Strong Block in Guard; both old Strike upgrades retired; White's 2 slots approved; "Power coming soon" approved. Docs only. No game code, no work-board edit, no new tuning numbers.
- **WHY:** Jay approved the slot change on Nov 1 and wants kata powers in the beta. The Programmer can build without guessing; the only outside wait is Jay's kata list.
- **DECIDE:** (1) Jay sends the 3 kata powers by Nov 13 (latest Nov 20). (2) Jay confirms or fixes the #1-15 family map in 4.4. Manager: give the Orange grabber or brute enemy work an owner.
- **NEXT:** The Manager puts PB-01 to PB-15 on the board, with R-G2B-01 after PB-03 and R-G2B-03 closed into PB-07. The Programmer starts PB-01.
