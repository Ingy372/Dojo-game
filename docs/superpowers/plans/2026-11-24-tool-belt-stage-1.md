# Tool Belt, Stage 1 (white to orange) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Technique Seals with the Tool Belt for self-defense #1–15, add the Kata button with signature moves for Basic Form 1, Basic Form 2 and Keon, make kata sign-offs add pockets, and move damage from the auto attack to the Great Counter.

**Architecture:** Approach A from the spec: rebuild Seals in place. Tools and kata moves are data in `content/abilities/`; the rules live in `packages/sim` (`tools.ts`, plus fire points in `world.ts`); the existing loadout, Sensei's Pick and Fighting Style screen are reused with pockets instead of Seal slots. The client draws buttons, cooldown rings and callouts from sim events.

**Tech Stack:** TypeScript, Phaser 3, Vite, Vitest (`packages/sim`).

**Spec:** `docs/superpowers/specs/2026-11-24-tool-belt-design.md`

## Global Constraints

- Rules stay in `packages/sim`: deterministic, 20 ticks per second, no `Math.random()`/`Date.now()`; cooldowns are tick counts.
- Content is data in `content/`, validated when loaded; a bad file fails loudly at load.
- All numbers in `packages/sim/src/config.ts` or the content files, never inline.
- Player-facing words: plain, no numbers on cards, no Power Rating. The word "Seal" no longer appears anywhere players see.
- Callouts use the real number and a kid-safe subtitle: `#7 Palm Heel!`. Allowed outcomes only (`docs/self-defense.md`, "Rules for using these in the game"). No "Injured" in stage 1 (that is #31–40).
- Tools fire only from something the player does: triggers `greatCounter`, `block`, `strike`, `dash`, `crowded`, `hit`. No timed triggers.
- Pockets: `startPockets: 3`, +1 per signed-off kata, `maxPockets: 10`.
- Kata move recharges on a timer (about 20–30 s); no new meter.
- Damage: `COMBAT.basicAttack.strength` 0.6, `COMBAT.counter.perfectStrength` 3.5.
- Real achievements get the biggest celebration: the "New tool!" moment is smaller than the sign-off celebration.
- Touch first, works by touch alone; keyboard extra: Kata on `I`. Buttons inside the phone safe areas.
- Text files use Linux line endings. Commit after every working step. Work on branch `claude/tool-belt`; never merge to `main` without Jay's OK.
- New words and art need Jay's approval before they ship (Task 1 is that gate).

## Review Focus

1. **Old save with Seals equipped (Sensei's Pick on or off):** after loading, every signed-off technique #1–15 is an earned tool, pockets are filled, nothing earned is lost, no crash. Test in Task 5.
2. **More tools than pockets** (the legacy grant gives an existing orange belt 10–15 tools with only 3–5 pockets): newest fill the pockets, the rest show as ready, Fighting Style screen lists them all. Test in Task 5.
3. **Two tools fire on the same Great Counter:** both effects apply, both start cooldowns, events come out in technique order, the client shows one callout at a time. Test in Task 4.
4. **Kata pressed with no enemy near, while guarding, or while down:** pressing while down does nothing; otherwise the move plays, hits nobody, and the cooldown starts. Test in Task 6.
5. **A fight with no tools and no kata move** (a new white belt, the tutorial, the balance bots' default) behaves exactly as before except for the damage change. Test in Task 4 (golden fight file re-recorded once, in Task 2, for the damage change only).

---

### Task 1: Content draft for Jay (gate: nothing after this starts until Jay approves)

**Files:**
- Create: `drafts/content/tool-belt-stage-1.md`

- [ ] **Step 1: Draft one tool per technique #1–15** from `docs/self-defense.md`: number, name (kid-safe subtitle), one-line reminder of the real technique, trigger (from the six), what it does in plain words, and the effect it maps to. Use existing effect types where they fit (`counterHits`, `rippleCounter`, `counterPush`, `staggerTicks`, `counterStrength`, `staggerBonus`, `healOnPerfect`, `dashOnBlock`, `blockReflect`, `reflectStaggers`, `counterThrow`, `downBonus`, `disarm`, `disarmAttacks`, `counterLock`) plus the one new type `areaHit` (Task 3). Suggested cooldown per tool (6–15 s). Mirror pairs (#1/#2) are close cousins with a twist each.
- [ ] **Step 2: Draft three kata signature moves** (Basic Form 1, Basic Form 2, Keon): name, one line, and its numbers on the shared shape `radius`, `strength`, `knockTiles`, `staggerTicks`, `cooldownTicks`. Each clearly different (for example a stun ring, a wide knockback sweep, a heavy close blast); Keon the strongest.
- [ ] **Step 3: Draft the words**: two Sensei's Lessons (Tool Belt, Kata button; one sentence per screen), the "New tool!" card, and the Fighting Style screen's Tool Belt labels replacing the Seal ones in `content/abilities/fighting-style.json`.
- [ ] **Step 4: Commit the draft and stop.** Give Jay the file in plain words and ask for his OK or changes. Record his answers in `docs/decisions.md`.

```bash
git add drafts/content/tool-belt-stage-1.md
git commit -m "Draft: Tool Belt stage 1 tools, kata moves and words (for Jay)"
```

### Task 2: The damage change

**Files:**
- Modify: `packages/sim/src/config.ts:93-99` (`basicAttack.strength`), `:156-157` (`counter.perfectStrength`)
- Modify: `CLAUDE.md` ("Starting numbers": "counter hit for 3.5x Power")
- Test: `packages/sim/test/combat.test.ts`

- [ ] **Step 1: Write the failing test** `it('a Great Counter hits for 3.5x and a basic attack for 0.6x Power')`: on a guard-0 practice dummy, the first `playerAttack` event with `move: 'basic'` has `damage === damage(10, 0.6, 0, 0)` and the counter hit has `damage === damage(10, 3.5, 0, 0)` (use the existing `damage` helper and setup from this file).
- [ ] **Step 2: Run** `npx vitest run test/combat.test.ts` in `packages/sim`. Expected: FAIL on the two numbers.
- [ ] **Step 3: Set** `basicAttack.strength: 0.6` and `perfectStrength: 3.5`; update the comments ("3.5x Power").
- [ ] **Step 4: Run the whole sim suite** `npm test` in `packages/sim`. Re-record the golden fight file the way its test file says, and fix any test that pinned the old numbers by reading them from `COMBAT`, not by hard-coding new ones. Expected: PASS.
- [ ] **Step 5: Commit** with the CLAUDE.md line and a `docs/decisions.md` entry (Jay, Nov 24: auto 1.0→0.6, Great Counter 2×→3.5×; bot measurements: typical kid −8%, skilled +13%, masher −21%).

### Task 3: Tool and kata move data

**Files:**
- Create: `content/abilities/tools.json` (stage 1: #1–15, from Task 1 as approved), `content/abilities/kata-moves.json` (3 moves)
- Modify: `packages/sim/src/abilities.ts` (types, loaders, `AbilityContent`), `packages/sim/src/effects.ts` (`areaHit`), `packages/sim/src/config.ts` (`TOOL_BELT`), `packages/sim/src/content.ts` and `apps/client` content loading (wherever `seal-families.json` is loaded today, load the two new files next to it)
- Test: `packages/sim/test/tools-data.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type ToolTrigger = 'greatCounter' | 'block' | 'strike' | 'dash' | 'crowded' | 'hit';
  export interface ToolDef { technique: number; name: string; reminder: string; text: string; trigger: ToolTrigger; cooldownTicks: number; effects: Effect[]; anim: 'jab' | 'counter' | 'strike' | 'dash' | 'none'; }
  export interface KataMoveDef { id: string; kata: string; requirement: string; name: string; text: string; cooldownTicks: number; radius: number; strength: number; knockTiles: number; staggerTicks: number; anim: string; }
  // AbilityContent gains: tools: ToolDef[]; kataMoves: KataMoveDef[]
  export function loadTools(data: unknown): ToolDef[];
  export function loadKataMoves(data: unknown, katas: readonly { id: string; requirement: string }[]): KataMoveDef[];
  // effects.ts: EffectType gains 'areaHit' (amount = move strength, radius = tiles); PlayerMods gains areaHitStrength: number, areaHitRadius: number (largest radius wins)
  export function combineMods(a: PlayerMods, b: PlayerMods): PlayerMods; // numbers add, booleans OR, radii take the max, same as modsFrom's stacking
  // config.ts
  export const TOOL_BELT = { startPockets: 3, maxPockets: 10, crowdedCount: 3, crowdedRadius: 1.5, crowdedRecentHitTicks: 20 } as const;
  ```

- [ ] **Step 1: Write the failing tests:** `loadTools` accepts the real file and returns 15 tools numbered 1–15 with no repeats; rejects an unknown trigger, a repeated technique, a `cooldownTicks` under 20, and an effect type `loadEffect` rejects. `loadKataMoves` accepts the real file (3 moves) and rejects a `kata`/`requirement` pair that is not in `content/katas`. `combineMods(noMods(), modsFrom([{type:'counterHits',amount:0.3,hits:2}], 20))` equals `modsFrom` of the same effect; `modsFrom([{type:'areaHit',amount:1.2,radius:1.5}], 20)` gives `areaHitStrength 1.2`, `areaHitRadius 1.5`.
- [ ] **Step 2: Run** `npx vitest run test/tools-data.test.ts`. Expected: FAIL (not defined).
- [ ] **Step 3: Implement** the types, loaders (following `loadEffect`'s `fail` style), `areaHit` in `modsFrom`, `combineMods`, `TOOL_BELT`, the two content files and their loading.
- [ ] **Step 4: Run** `npm test` in `packages/sim`. Expected: PASS.
- [ ] **Step 5: Commit.**

### Task 4: Tools in a fight

**Files:**
- Create: `packages/sim/src/tools.ts`
- Modify: `packages/sim/src/world.ts` (PlayerSetup, PlayerState, tick, fire points, events), `packages/sim/src/index.ts` (exports)
- Test: `packages/sim/test/tools-fight.test.ts`

**Interfaces:**
- Consumes: `ToolDef`, `ToolTrigger`, `combineMods`, `modsFrom`, `TOOL_BELT` (Task 3).
- Produces:
  ```ts
  // tools.ts
  export interface ToolSetup { technique: number; trigger: ToolTrigger; cooldownTicks: number; mods: PlayerMods; }
  export function toolSetups(defs: readonly ToolDef[], equipped: readonly number[]): ToolSetup[]; // in equipped order, unknown numbers skipped
  // world.ts
  PlayerSetup.tools?: ToolSetup[];
  PlayerState.tools: { setup: ToolSetup; cooldown: number }[];
  function fireTools(world: WorldState, p: PlayerState, trigger: ToolTrigger, target?: EnemyState): PlayerMods;
  // WorldEvent gains { kind: 'toolFired'; playerId: PlayerId; technique: number }
  ```
- `fireTools`: every tool with this trigger and `cooldown === 0` fires, in technique order: cooldown set to `cooldownTicks`, a `toolFired` event pushed, and if its mods have `areaHitStrength > 0` it hits every present enemy within `areaHitRadius` of the player with `landHit(..., 'ripple', areaHitStrength, 0)`. Returns `combineMods` of the fired tools' mods (or `noMods()`).
- Fire points (each uses `const m = combineMods(p.mods, fireTools(...))` in place of `p.mods` for that one action): Great Counter (`world.ts` ~1480–1535), Block (~1538–1550), Strike press, Dash press, the player taking a Hit, and `crowded` checked once per tick: at least `crowdedCount` present enemies within `crowdedRadius` and the player landed a hit within the last `crowdedRecentHitTicks`.
- Cooldowns count down by 1 each tick, never below 0. Seal effects stop being applied to fights (Task 5 switches `characterSetup` to tools).

- [ ] **Step 1: Write the failing tests:**
  - `a greatCounter tool fires once, then waits its cooldown`: tool `{trigger:'greatCounter', cooldownTicks: 200, effects:[counterHits 0.3×2]}`; two Great Counters 100 ticks apart → exactly one `toolFired` and two extra counter hits after the first counter only.
  - `two tools on the same trigger both fire, in technique order` (Review Focus 3): techniques 7 and 3 → events `[3, 7]`, both effects applied.
  - `a tool does not fire while the player stands still` : 600 ticks of `{kind:'none'}` with tools of every trigger near a practice dummy that never attacks → no `toolFired`.
  - `crowded fires only while fighting`: 3 enemies within 1.5 tiles, no hit landed → no event; after a basic hit lands → one event.
  - `an areaHit tool hits every enemy in its radius and none outside`.
  - `no tools changes nothing` (Review Focus 5): the same seeded fight with `tools: []` and with `tools` omitted gives identical event lists.
- [ ] **Step 2: Run** `npx vitest run test/tools-fight.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `tools.ts` and the world changes above.
- [ ] **Step 4: Run** `npm test` in `packages/sim`. Expected: PASS (golden file unchanged from Task 2, since nothing equips tools yet).
- [ ] **Step 5: Commit.**

### Task 5: The Tool Belt loadout (pockets, Sensei's Pick, old saves)

**Files:**
- Modify: `packages/sim/src/profile.ts` (`Loadout.tools`, `Profile.toolBeltSeeded`, save read/write), `packages/sim/src/loadout.ts`, `packages/sim/src/tools.ts`, `packages/sim/src/progression.ts:125-146` (`characterSetup`: tools instead of seals), `packages/sim/src/sealFamilies.ts` (kept only for `signedOffTechniques` and conversion)
- Modify: `apps/client/src/game/student.ts` (`seedLoadout`: call `seedToolBelt` once)
- Test: `packages/sim/test/tool-belt.test.ts`

**Interfaces:**
- Consumes: `toolSetups`, `ToolDef`, `TOOL_BELT`, `signedOffTechniques`.
- Produces:
  ```ts
  // tools.ts
  export function earnedTools(training: TrainingState, defs: readonly ToolDef[]): number[]; // signed-off techniques that have a tool, oldest sign-off first (curriculum order)
  export function toolPockets(training: TrainingState): number; // min(maxPockets, startPockets + signed-off katas)
  // profile.ts
  Loadout.tools: number[]; Profile.toolBeltSeeded: boolean;
  // loadout.ts
  LoadoutEarned.tools: readonly number[];
  export function equipTool(loadout: Loadout, technique: number, earned: readonly number[], pockets: number): { loadout: Loadout; result: 'ok' | 'full' | 'notEarned' | 'already' };
  export function seedToolBelt(profile: Profile, earned: readonly number[], pockets: number): boolean; // once, guarded by toolBeltSeeded
  // senseiPick: PickLine.slot gains 'tool'; tools handled like seals were, with toolPockets instead of sealSlots
  ```
- `seedToolBelt` fills pockets with: first, tools of techniques in the old equipped Seal families (in family order), then the newest earned; stops at `pockets`. `normalizeSlots` drops unearned and repeated tools and trims to `pockets`. `sealSlots`/`SEAL_SLOTS_BY_TIER` are removed once nothing uses them.

- [ ] **Step 1: Write the failing tests:**
  - `toolPockets`: white with no kata → 3; three katas signed off → 6; ten katas → 10.
  - `earnedTools`: techniques 1, 3, 4 signed → `[1, 3, 4]`.
  - `old save with Seals converts` (Review Focus 1): profile with `loadout.seals = ['counter','escape']`, techniques 1–7 signed, 4 pockets → `tools` holds the Counter-family techniques first (3, 5, 6, 7 trimmed to 4), `toolBeltSeeded` true; running it again changes nothing.
  - `more tools than pockets` (Review Focus 2): 15 earned, 3 pockets, Sensei's Pick on → the 3 newest in pockets, 12 'ready' lines, no throw.
  - `Sensei's Pick off`: a new tool gives a 'ready' line and the pockets don't change.
  - `characterSetup` returns `tools` from the loadout and no Seal effects.
- [ ] **Step 2: Run** `npx vitest run test/tool-belt.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the interfaces above; update existing loadout tests that used Seal slots to the Tool Belt.
- [ ] **Step 4: Run** `npm test` in `packages/sim`, then `npm run typecheck` at the repo root (or the command `.github/workflows/checks.yml` uses). Expected: PASS.
- [ ] **Step 5: Commit.**

### Task 6: Kata signature moves and pockets in a fight

**Files:**
- Modify: `packages/sim/src/kataPowers.ts` (becomes kata moves: `earnedKataMoves`, `resolveKataMoveId`), `packages/sim/src/world.ts`, `packages/sim/src/progression.ts`
- Delete: `content/abilities/kata-powers.json` (after `resolveKataMoveId` maps old ids)
- Test: `packages/sim/test/kata-moves.test.ts`

**Interfaces:**
- Consumes: `KataMoveDef` (Task 3).
- Produces:
  ```ts
  export interface KataMoveSetup { id: string; cooldownTicks: number; radius: number; strength: number; knockTiles: number; staggerTicks: number; }
  PlayerSetup.kataMove?: KataMoveSetup | null; PlayerState.kataCooldown: number;
  PlayerAction gains 'kata';
  // WorldEvent gains { kind: 'kataMove'; playerId: PlayerId; id: string }
  export function earnedKataMoves(training: TrainingState, defs: readonly KataMoveDef[]): string[];
  export function resolveKataMoveId(defs: readonly KataMoveDef[], id: string | null): string | null; // kata id or old '<kata>-power' id → move id
  ```
- On `action: 'kata'` with a move, `kataCooldown === 0` and the player not down: every present enemy within `radius` takes `landHit(..., 'strike', strength, 0)`, is knocked `knockTiles` away (bosses stay put, walls stop it) and staggered `staggerTicks` (capped by `COMBAT.counter.holdCapTicks`); `kataMove` event; cooldown starts even if nothing was hit.

- [ ] **Step 1: Write the failing tests:** pressing Kata with two dummies inside and one outside the radius damages exactly two and starts the cooldown; pressing again before the cooldown ends does nothing; pressing while down does nothing (Review Focus 4); pressing with no enemies near emits `kataMove` and starts the cooldown; a boss is hit but not moved; `resolveKataMoveId(defs, 'basic-form-1-power')` and `'basic-form-1'` both give Basic Form 1's move.
- [ ] **Step 2: Run** `npx vitest run test/kata-moves.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement**; `characterSetup` puts the equipped (or, with Sensei's Pick, newest earned) kata move in `kataMove`.
- [ ] **Step 4: Run** `npm test` in `packages/sim`. Expected: PASS.
- [ ] **Step 5: Commit.**

### Task 7: On the phone: Kata button, tool rings, callouts, Tool Belt screen, lessons

**Files:**
- Modify: `apps/client/src/input/ActionButtons.ts` (Kata button, `has.kata`, key `I`), `apps/client/src/scenes/GameScene.ts` (send `'kata'`; play hero anims on `toolFired`/`kataMove`; callouts), `apps/client/src/ui/fightingStyle.ts` (Seal section → Tool Belt), `apps/client/src/ui/Celebrations.ts` (retire the Seal evolution card; add the small "New tool!" card), `content/abilities/fighting-style.json`, `content/tutorial/first-session-lessons.json` (two lessons from Task 1)
- Create: `apps/client/src/ui/toolRow.ts` (small row of tool icons with cooldown rings; one callout at a time, queued)
- Delete: `content/abilities/seal-evolution.json` once nothing reads it

- [ ] **Step 1: Kata button:** appears when the fight has a kata move; cooldown ring like Dash; placed with the other buttons inside the safe area; `I` key. Hero plays the move's `anim` (stand-in anims until Jay approves new art).
- [ ] **Step 2: Tool row and callouts:** one icon per equipped tool with a cooldown ring, away from the thumb buttons; on `toolFired`, the hero plays the tool's `anim` (if not busy) and a callout `#<n> <name>!` shows for about 1 s; further callouts wait their turn.
- [ ] **Step 3: Tool Belt screen:** pockets show earned tools; cards show name, reminder, trigger words and plain "what it does"; tap a card then a pocket (the screen's existing pattern); Sensei's Pick switch unchanged. The Kata slot lists earned kata moves (name and one line) instead of "Power coming soon". Then run `grep -rn "Seal" apps/client/src content` and change every player-facing "Seal" word.
- [ ] **Step 4: Lessons:** `lesson-tool-belt` (trigger: first fight with a tool in a pocket) and `lesson-kata-button` (first fight with a kata move), counting as the session's one new thing.
- [ ] **Step 5: Run** the checks (`npm test`, typecheck, both builds, as in `.github/workflows/checks.yml`), open the dev server preview at phone size (landscape), and check: Kata button, a tool callout after a Great Counter, the Tool Belt screen, no "Seal" words. Expected: no console errors.
- [ ] **Step 6: Commit.**

### Task 8: Balance and handoff

**Files:**
- Modify: `packages/sim/test/balance/bot.ts` (bot equips tools from its fixture and presses Kata when 2+ enemies are within the move's radius and it is ready), tuning numbers in `content/abilities/tools.json`, `kata-moves.json`, `config.ts`
- Modify: `docs/decisions.md`, `docs/progress.md`, `docs/work-board.md`

- [ ] **Step 1: Run** `BALANCE=1 npm run balance` in `packages/sim`. Targets: white belt Guided kid bot wins at least 75%; the existing balance tests pass; Power stays under each tier's cap (existing power tests). Adjust only content and config numbers; record what changed.
- [ ] **Step 2: Run** all checks. Expected: PASS.
- [ ] **Step 3: Update the logs:** decisions (Tool Belt replaces Seals; pockets 3 + kata; triggers; kata moves; numbers), progress (what's done, stage 2 next), work board.
- [ ] **Step 4: Commit, push `claude/tool-belt`,** confirm GitHub's checks are green, and give Jay the preview link with exactly what to try: a fight at white with a tool equipped (watch for the callout after a Great Counter), the Kata button after Basic Form 1 is signed off (testing panel), and the Tool Belt screen.
