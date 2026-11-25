# Street Smarts cut scene: implementation plan

> Executed natively by Claude in one session (Jay: "start building", Nov 24).

**Goal:** "Lost in the store" plays as a short cut scene in a Blender store with Blender people, pausing only for 3 choices and 1 tap.
**Spec:** `docs/superpowers/specs/2026-11-24-street-smarts-cutscene-design.md` (script round 2 is Jay-approved, Nov 24).

## Global constraints
- Rules stay in `packages/sim` (no Phaser, no time); content in `content/`; 2-4 choices per question; never frightening.
- Script words exactly as in the spec's round 2 (Jay's lines 6 and 7 verbatim).
- Art: hero v2 model and toon kit, camera 35 deg down, 80 px per tile; packs added to `tools/art-import/approved.json` marked "waiting on Jay's OK".

## Review focus
1. Sound off: lines must still move on (reading time from the word count).
2. A tap during a walk snaps actors to their marks; no actor is left mid-walk on a choice.
3. A retry goes back to the choice with actors where they were at that choice (stage positions are replayed from the script, not remembered).
4. Phone at 667 x 375: choice buttons and captions never cover the tap targets in the tap moment.
5. Mom or Dad: the grown-up actor follows the pick.

## Tasks
1. **Store room art.** `incoming-art/claude-store/source/build_store.py` (the house's kit) and `make_game_store.py` -> `incoming-art/claude-store/sprites/static.json` (pack `street-store`) and `content/street-smarts/store-room.json` (named marks in tiles).
2. **Store people.** `build_staff.py` gains civilian entries (mom, dad, worker, cashier, shopper, stranger): no belt, shirt and trousers colours, worker vest and name tag, cashier apron and name tag; actions npc_idle, npc_wave, npc_walk. `incoming-art/claude-store/source/render_people.sh` renders them; packs `people-<id>`.
3. **Script format (sim).** `ScenarioLine.stage?: StageCue[]` (`{do: 'place'|'walk'|'face'|'emote'|'hide'|'show', who, to?, dir?, emote?}`), `ScenarioLine.tap?: true` with `ScenarioChoice.target?: string`; `loadScenario` checks them (known `do`, tap choices all have targets). Tests in `packages/sim/test/streetSmarts.test.ts`. The store script rewritten to round 2 with stage cues.
4. **Cut-scene screen.** `StreetSmartsScene` draws the store room and the cast, replays stage cues from the scene start (so retries restore positions), captions with the speaker's name, Sensei's corner portrait with a chime and a different voice pitch, auto-advance after the voice (or reading time), a tap to finish the line, buttons over the bottom for choices, tap targets on people for the tap moment, Skip on replays.
5. **Ship.** Import the art, a preview sheet for Jay, tests, type checks, both builds, browser check at 844 x 390 and 667 x 375, logs, push for a preview link.
