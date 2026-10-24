# S10: How the A1 cosmetics are earned

Unlock rules for the A1 earned cosmetics in PR #78 (`incoming-art/cosmetics-a1/`):
- a headband (tintable)
- hand wraps in cloth, leather and tiger stripe
- a gi trim (tintable)
- a soft aura (tintable)

Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only; no game code or work-board edits. Numbers marked (guess) are mine. No learning-science claims; the Learning Designer reviews this. The colours are the Artist's suggestions from the A1 previews and are still open. Names are for **C6**.

## Rules

- **Real training is the main way to earn a look.** It comes through the existing feed (`rank.history`, `stripes`, sign-offs), S7's `classesCounted`, and S9's `weeksTrained`, all through the S6 achievement IDs.
- **In-game sources are second.** Each one either adds a different colour, or gives a second way to earn a look that real training also gives. No look is random-only.
- **Never:** purchases, loot boxes, timers, days-in-a-row rules, "last chance" or expiry. Once earned, a look is kept forever. It stays in `ownedLooks` (S2) even if gear is let go or a belt is re-tested.
- **Looks never change stats** (S2 look picker). The belt layer is never covered or recoloured, because the belt always shows the honest rank.
- The aura tints stay away from elite gold and blue (A1 note).
- Each unlock plays the existing reward moment. It is never taught in the same session as another new system (§13). If two arrive together, the second shows next session.

## Unlock table

**"Real"** means it's earned from real dojo training through the feed. **"Game"** means it's earned in play.

| Look ID | Cosmetic | Main rule (S6 ID) | Type | Also from (second way) | Rough timing (2 classes a week, guess) |
| --- | --- | --- | --- | --- | --- |
| `look.wraps.cloth` | Cloth wraps | First sign-off, `ach.dojo.signoffs.1` | Real | Owning `cloth-wraps` gear (S2) | White, weeks 1–4 |
| `look.headband.gold` | Headband, gold | 10 classes, `ach.dojo.classes.10` | Real | none | White, ~week 5 |
| `look.aura.warm` | Soft aura, warm white | 5 weeks trained, `ach.dojo.weeks.5` (this is the S9 streak aura's first step) | Real | none | White, ~week 5 |
| `look.headband.mint` | Headband, mint | 10 floors cleared, `ach.tower.floors.10` | Game | none | White, first weeks |
| `look.wraps.leather` | Leather wraps | 5 stripes, `ach.dojo.stripes.5` | Real | Owning `leather-wraps` gear | White to yellow (guess) |
| `look.headband.sky` | Headband, sky | 25 classes, `ach.dojo.classes.25` | Real | none | ~3 months, end of white |
| `look.wraps.tiger` | Tiger wraps | Promoted to yellow, `ach.dojo.promotion.yellow` | Real | Owning `tiger-wraps` gear | ~3 months |
| `look.trim.white` | Gi trim, white | Promoted to yellow, `ach.dojo.promotion.yellow` | Real | none | ~3 months |
| `look.trim.jade` | Gi trim, jade (new tint, guess) | 20 bow answers, `ach.bow.correct.20` (already a trim in S6) | Game | none | ~1–3 months |
| `look.trim.sky` | Gi trim, sky | Promoted to orange, `ach.dojo.promotion.orange` | Real | none | ~6 months |
| `look.aura.mint` | Soft aura, mint | 20 weeks trained, `ach.dojo.weeks.20` | Real | none | ~5 months |
| `look.trim.blue` | Gi trim, blue | Promoted to green, `ach.dojo.promotion.green` | Real | none | ~9 months |
| `look.trim.gold` | Gi trim, gold | Promoted to blue, `ach.dojo.promotion.blue` | Real | none | ~12 months |
| `look.headband.white` | Headband, white | 1 year of training, `ach.dojo.anniversary.1` | Real | none | ~12 months |
| `look.aura.lavender` | Soft aura, lavender | 50 weeks trained, `ach.dojo.weeks.50` | Real | none | ~1 year or more |
| `look.trim.silver` | Gi trim, Challenge silver (new tint, guess) | 10 Challenge floors, `ach.tower.challenge.10` (the S6 Challenge trim, `core-design.md` line 589) | Game | none | 4th belt and up |

**Notes:**

- **Wraps** are the same art as the hands gear icons. They unlock from either the real rule or owning the gear, whichever comes first. A kid who never gets the drop still earns every wrap through training.
- Later belts (red to black) get more trims or aura tints from their promotions. That needs more colours from the Artist (scope flag). The rule pattern stays "promotion = trim tint".

## Share from real training

| | Looks | Real main rule | Game only |
| --- | --- | --- | --- |
| Count | 16 | **13 (81%)** | 3 (mint headband, jade trim, silver trim) |

**Rough timing by belt (guess):**

| Belt | New looks (real + game) | Real share |
| --- | --- | --- |
| White (~3 months) | cloth wraps, gold headband, warm aura, sky headband, leather wraps (maybe), plus mint headband and jade trim | ~5 of 7 (71%) |
| Yellow | tiger wraps, white trim (at promotion) | 2 of 2 |
| Orange | sky trim, mint aura | 2 of 2 |
| Green | blue trim | 1 of 1 |
| Blue | gold trim, white headband, lavender aura | 3 of 3 |
| 4th belt and up (Challenge) | silver trim | Game (0 of 1) |

So a white belt sees about one new look every 2–3 weeks. After that, it's roughly one per promotion or season. That's slower than decorations, on purpose, so each look feels earned.

## Data

- **`content/cosmetics/looks.json`** holds `{ id, layer: 'headband'|'wraps'|'gi-trim'|'aura', tint, unlock: { achievement: <S6 id> }, alsoFrom?: { gear: <item id> } }`.
- **Unlocking:** when an S6 achievement is earned, any look tied to it is added to `ownedLooks`.
- **Meter:** the S7 "next piece" meter gets one more line type, "next look". It uses the same S9 closest-goal pick. For example: "3 more classes to a new headband!"

## For C6

C6 writes 16 look names (≤ 20 characters) and a one-line "how" for each (≤ 60). The "how" can reuse the S6 `how` text. Placeholder IDs are in the table above.

## Scope flags

- **Old saves:** look unlocks run once over S6 achievements already earned, using S7's `classesCounted` (seeded from `classesInRank`). Students who trained before their current rank undercount a little. There's no Nic total-classes field for now (Manager decision).
- **Art:** 2 new tints (jade, silver). Body B and the other animations are still to come (A1 NEXT). The Artist sizes the work.
- **New layer slots:** `profile.looks` gets `headband` and `aura` alongside S2's per-slot looks. The draw order is as A1 describes.
- Can everything be worn together? I suggest yes (the art allows it). This is the Artist's or Jay's decision from A1.

## Done-when

- Every look in `looks.json` names an S6 achievement. A loader test checks that at least 75% use a real (`ach.dojo.*`) achievement, and that none use a random drop as their only source.
- **Fixture tests:**
  - adding 10 classes unlocks `look.headband.gold`
  - a yellow promotion unlocks `look.wraps.tiger` and `look.trim.white`
  - a profile owning `tiger-wraps` gets the tiger look early, and nothing is doubled later
- A look is never removed. A test lets go of gear, rolls back the feed and re-tests a belt, and the look stays owned.
- No look code reads dates in a row, play time or a deadline (code check). No look screen shows a price or a countdown (word check).
- Wearing any look never changes stats, and the belt layer always draws unchanged (test).
- Two unlocks arriving in one session: one shows now and the other next session (test).
- C6 has names and "how" lines for all 16 IDs.
