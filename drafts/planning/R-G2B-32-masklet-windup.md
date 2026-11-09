# R-G2B-32 — Masklet wind-up note

## Delivery Note

| | |
|---|---|
| **ITEM** | R-G2B-32 (from `drafts/planning/R-GREEN-TO-BLACK.md`; not on `docs/work-board.md`) |
| **WHAT** | Measure the Masklet's wind-up (and other swarm tells) against seal **#35 Catch the Hand**, which needs a quick attacker at **wind-up ≤ 12**. |
| **WHY** | If Masklets are the Red/Black swarm and they sit above 12, Catch the Hand never fires in that tier. |
| **DECIDE** | **Ask Jay to reword #35** (board Done when). Draft Masklet wind-up is **14 ticks**, above the 12-tick gate. Options for Jay: (A) reword #35 so it fits Masklet (e.g. ≤ 14, or "swarm bump"), (B) drop Masklet telegraph to 12 to match Swarmer/Spark Sprite, (C) point #35 at a different ≤12 attacker that still appears in Red/Black. |
| **NEXT** | Jay's call on #35. Then Content/Programmer keep `drafts/content/enemies/masklet.json` in step. Masklet is **not live** yet (R-G2B-35 art samples only). |

**Checkout:** `/workspace/dojo-qa` detached at `origin/main` **`f5c7c435`**. No numbers proposed → balance-check script not run. No live Playwright (Masklet not in `content/enemies/`).

**Board Done when:** *A short note. If it is above 12, ask Jay to reword #35.* → this file. The board does not name a path; saved as `/workspace/R-G2B-32-masklet-windup.md` for the Manager to place (likely `drafts/planning/`).

---

## Answer (one line)

**Masklet draft wind-up = 14 ticks (700 ms at 20 ticks/s) — above 12. Ask Jay to reword #35 Catch the Hand.**

---

## Numbers (source)

| Enemy | Where | `attack.telegraphTicks` | ms (÷20) | ≤12 for #35? |
|---|---|---|---|---|
| **Masklet** | `drafts/content/enemies/masklet.json` (draft only) | **14** | 700 | **No** |
| Swarmer | `content/enemies/swarmer.json` (live) | **12** | 600 | Yes |
| Spark Sprite | `content/enemies/spark-sprite.json` (live) | **12** | 600 | Yes |
| Buzz Bee / Coal Cub / Page Flutter / Pebble Pal | drafts (swarm-like) | **14** | 700 | No |
| Brute / Bopper | live | **16** | 800 | No (S4: #35 must never lock a Brute) |

- Field used by the sim as wind-up: `attack.telegraphTicks` (`packages/sim/src/world.ts` `telegraphTicks()`, `enemy.ts` min 10).
- Masklet tell in data: `"spin, then red circle"`; art (R-G2B-35 sample): one full spin on the spot (~7 frames over 14 ticks), then a quick bump; red circle is game-drawn.
- Difficulty scales the *played* fill+window (`guided` longer, `challenge` shorter, floor `MIN_WINDUP_TICKS` 10). Seal #35's gate in the plans is the **file** wind-up (S4: Swarmer 12 yes, Brute 16 no) — so Masklet's **14** is what matters for the gate.

Other Red/Black drafts for context: Hush Guard 18, Copycat Shade 20, Echo Bell 22 (dash-only) — none are ≤12.

---

## Kid-friendly judgement (from data + art notes; not playable live)

| Age | Readable? | Fair? |
|---|---|---|
| **6** | Spin + red circle is a clear two-step tell in the art note; friendly mask, no scary spikes. 700 ms is short but Swarmer's live 600 ms already ships for kids with Guided. | Fair *if* they Block/Counter the circle; crowds still need "little ones first." |
| **12** | Easy to read once; 14 ticks is in the same band as Shield (14), slower than Swarmer. | Fair. Not a cheap shot. |
| **Adult** | Tell is honest; the #35 design problem is the **number gate**, not readability. | — |

**Reduced motion:** Danger circle and wind-up fill still draw; pulse / hurt-shake drop out (`GameScene` / `hurtShakeScale`). The Masklet spin frames would still advance with the wind-up clock when the enemy is live — same pattern as other enemies. Nothing Masklet-specific is built in the client yet.

---

## Seal #35 today

- Plan: Block → `blockLock` 10 ticks on attackers with wind-up **≤ 12** (`R-G2B-seal-families-16-40.md`, `S4-self-defense-powers.md`).
- Kid text draft: *"A Block catches a quick attacker in a lock and leaves them Injured."* (`drafts/content/abilities/seals-31-40-text.json`, `effectRef`: `blockLock 10 (wind-up 12 or less)`).
- `blockLock` is **not** implemented in sim yet (no code hits). Tower brief already flagged: if Masklet > 12, #35 may never fire in Hall of Echoes (`hall-of-echoes-brief.md`).

---

## What's missing (not guessed)

- Masklet is **not** in `content/enemies/` → not in the live game → no `?room=` check.
- No Masklet-circle room live (R-G2B-26 / Hall of Echoes draft only).
- `blockLock` and Injured status are still plan/draft (Injured cut until after launch per board rules).
- Art samples exist under `incoming-art/bestiary-red-black/masklet/` but are not exported into the client.

---

## Bugs

None from play (enemy not live). Tracking item only:

| What | Happened | Expected | Severity |
|---|---|---|---|
| Compared Masklet draft wind-up to #35's ≤12 gate | Draft `telegraphTicks` is **14** | ≤12 if Masklet is meant to be #35's quick attacker | **Design gap** (not a ship bug) — **ask Jay to reword #35** (or retune Masklet to 12) |

No BLOCKS PLAY / ANNOYING / SMALL runtime bugs filed.
