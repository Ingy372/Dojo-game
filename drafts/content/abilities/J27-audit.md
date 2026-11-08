# J27 audit: technique names that are not real dojo names

A LIST for Jay and the Manager (Nov 8 rule: real dojo names only, everywhere). Nothing is renamed here, and no `content/` file was changed. Written Nov 8, 2026 (America/New_York) by the Content Writer.

**Scope:** every technique, move, Seal, Strike, Seal family and Form name in `content/abilities/` and `drafts/content/` (abilities, katas `moves.json`, callout subtitles, unlock text). Enemies, rooms, gear, Virtues and kata names (Basic Form 1, Keon, and so on, which are already real) are skipped. Names in long notes and room briefs (for example "Spinning Finisher" in `hall-of-echoes.json`) follow whatever is decided here.
**Real names** are matched word for word (case aside) against `docs/curriculum.md`, `docs/self-defense.md` and `docs/framework.md`. framework.md has no technique list, so every source is one of the other two. A candidate is the real term on that technique's own line in the docs. **OPEN** means the docs have no single clear name.
**Status:** Real = already the real name. Rename = a real name is ready (needs Jay's yes). OPEN = needs Jay. Skip = a motion word, not a technique.

**Totals:** 129 names. Live in `content/`: Real 5, Rename 12, OPEN 25. Drafts only: Real 9, Rename 23, OPEN 48, Skip 7.

| File | Id | Current name | Real-name candidate | Source line | Live or drafts | Status | Note |
|---|---|---|---|---|---|---|---|
| `content/abilities/abilities.json` | `off-balance` | Off-Balance | Double Punch | `docs/self-defense.md:11` | live | Rename |  |
| `content/abilities/abilities.json` | `escape-step` | Escape Step | OPEN | `docs/self-defense.md:12` | live | OPEN | same as #1, other side |
| `content/abilities/abilities.json` | `sweep` | Sweep | Back Fist | `docs/self-defense.md:13` | live | Rename | also #5, #10 |
| `content/abilities/abilities.json` | `steady-breath` | Steady Breath | OPEN | `docs/self-defense.md:14` | live | OPEN | candidates outside block / double punch |
| `content/abilities/abilities.json` | `strong-block` | Strong Block | OPEN | `docs/self-defense.md:15` | live | OPEN | candidates back fist (also #3) / elbow |
| `content/abilities/abilities.json` | `sharp-eyes` | Sharp Eyes | OPEN | `docs/self-defense.md:16` | live | OPEN | candidate hook punch (attacker also throws one) |
| `content/abilities/abilities.json` | `create-distance` | Create Distance | Palm Heel | `docs/self-defense.md:17` | live | Rename |  |
| `content/abilities/abilities.json` | `disarm` | Disarm | OPEN | `docs/self-defense.md:18` | live | OPEN | block-and-strike, no set name |
| `content/abilities/abilities.json` | `throw` | Throw | OPEN | `docs/self-defense.md:19` | live | OPEN | as #8, high |
| `content/abilities/abilities.json` | `follow-through` | Follow Through | Double Knifehand Block | `docs/self-defense.md:20` | live | Rename |  |
| `content/abilities/abilities.json` | `follow-up-kick` | Spin Kick | Spin Kick | `docs/curriculum.md:46` | live | Real |  |
| `content/abilities/abilities.json` | `quick-combo` | Jumping Spins | Jumping Spin Kicks | `docs/curriculum.md:47` | live | Rename | doc: "3 jumping spin kicks" (plural, word for word) |
| `content/abilities/abilities.json` | `beginners-stance` | Beginner's Stance | Beginner's Stance | `docs/curriculum.md:36` | live | Real |  |
| `content/abilities/abilities.json` | `ready-stance` | Open Leg Stance | OPEN | - | live | OPEN | Jay-approved stance (J1, drafts/content/katas/stances.json), but not in the 3 docs |
| `content/abilities/abilities.json` | `cat-stance` | Cat Stance | OPEN | - | live | OPEN | Jay-approved stance (J1, drafts/content/katas/stances.json), but not in the 3 docs |
| `content/abilities/abilities.json` | `front-stance` | Front Stance | OPEN | - | live | OPEN | Jay-approved stance (J1, drafts/content/katas/stances.json), but not in the 3 docs |
| `content/abilities/abilities.json` | `fighting-stance` | Fighting Stance | Fighting Stance | `docs/self-defense.md:23` | live | Real |  |
| `content/abilities/abilities.json` | `horse-stance` | Horse Stance | OPEN | - | live | OPEN | Jay-approved stance (J1, drafts/content/katas/stances.json), but not in the 3 docs |
| `content/abilities/strikes.json` | `spin-kick` | Spin Kick | Spin Kick | `docs/curriculum.md:46` | live | Real |  |
| `content/abilities/strikes.json` | `jumping-spins` | Jumping Spins | Jumping Spin Kicks | `docs/curriculum.md:47` | live | Rename | doc: "3 jumping spin kicks" (plural, word for word) |
| `content/abilities/strikes.json` | `butterfly-flow` | Butterfly Flow | Butterfly Kick | `docs/curriculum.md:48` | live | Rename | "tornado kick (we call it butterfly kick)" |
| `content/abilities/seal-families.json` | `escape` | Escape | OPEN | - | live | OPEN | family label (game group), not a technique |
| `content/abilities/seal-families.json` | `escape #1` | Off the Line | Double Punch | `docs/self-defense.md:11` | live | Rename |  |
| `content/abilities/seal-families.json` | `escape #2` | Other Side | OPEN | `docs/self-defense.md:12` | live | OPEN | same as #1, other side |
| `content/abilities/seal-families.json` | `escape #4` | Drive Back | OPEN | `docs/self-defense.md:14` | live | OPEN | candidates outside block / double punch |
| `content/abilities/seal-families.json` | `escape #15` | Slip and Double | OPEN | `docs/self-defense.md:25` | live | OPEN | candidate double punch (also #1) |
| `content/abilities/seal-families.json` | `counter` | Counter | OPEN | - | live | OPEN | family label (game group), not a technique |
| `content/abilities/seal-families.json` | `counter #3` | Spin Back Fist | Back Fist | `docs/self-defense.md:13` | live | Rename | also #5, #10 |
| `content/abilities/seal-families.json` | `counter #5` | Spin Elbow | OPEN | `docs/self-defense.md:15` | live | OPEN | candidates back fist (also #3) / elbow |
| `content/abilities/seal-families.json` | `counter #6` | Arm Wrap | OPEN | `docs/self-defense.md:16` | live | OPEN | candidate hook punch (attacker also throws one) |
| `content/abilities/seal-families.json` | `counter #7` | Palm Heel | Palm Heel | `docs/self-defense.md:17` | live | Real |  |
| `content/abilities/seal-families.json` | `counter #10` | Grab and Strike | Double Knifehand Block | `docs/self-defense.md:20` | live | Rename |  |
| `content/abilities/seal-families.json` | `guard` | Guard | OPEN | - | live | OPEN | family label (game group), not a technique |
| `content/abilities/seal-families.json` | `guard #8` | Block and Strike | OPEN | `docs/self-defense.md:18` | live | OPEN | block-and-strike, no set name |
| `content/abilities/seal-families.json` | `guard #9` | High Block Strike | OPEN | `docs/self-defense.md:19` | live | OPEN | as #8, high |
| `content/abilities/seal-families.json` | `throw` | Throw | OPEN | - | live | OPEN | family label (game group), not a technique |
| `content/abilities/seal-families.json` | `throw #11` | Outside Reap | Osotogari | `docs/self-defense.md:21` | live | Rename | Jay's spelling; S4 "Osoto Gari" |
| `content/abilities/seal-families.json` | `throw #12` | Reap and Finish | OPEN | `docs/self-defense.md:22` | live | OPEN | osotogari again (also #11) |
| `content/abilities/seal-families.json` | `disarm` | Disarm | OPEN | - | live | OPEN | family label (game group), not a technique |
| `content/abilities/seal-families.json` | `disarm #13` | Kick the Weapon | Inside Kick | `docs/self-defense.md:23` | live | Rename | also #14 |
| `content/abilities/seal-families.json` | `disarm #14` | Kick and Spin | OPEN | `docs/self-defense.md:24` | live | OPEN | candidate spin kick (clashes with Strike "Spin Kick") |
| `content/abilities/seal-families.json` | `lock` | Lock | OPEN | - | live | OPEN | family label (game group), not a technique |
| `drafts/content/abilities/seal-families-text.json` | `escape` | Escape | OPEN | - | drafts | OPEN | family label (game group), not a technique |
| `drafts/content/abilities/seal-families-text.json` | `escape #1` | Off the Line | Double Punch | `docs/self-defense.md:11` | drafts | Rename |  |
| `drafts/content/abilities/seal-families-text.json` | `escape #2` | Other Side | OPEN | `docs/self-defense.md:12` | drafts | OPEN | same as #1, other side |
| `drafts/content/abilities/seal-families-text.json` | `escape #4` | Drive Back | OPEN | `docs/self-defense.md:14` | drafts | OPEN | candidates outside block / double punch |
| `drafts/content/abilities/seal-families-text.json` | `escape #15` | Slip and Double | OPEN | `docs/self-defense.md:25` | drafts | OPEN | candidate double punch (also #1) |
| `drafts/content/abilities/seal-families-text.json` | `counter` | Counter | OPEN | - | drafts | OPEN | family label (game group), not a technique |
| `drafts/content/abilities/seal-families-text.json` | `counter #3` | Spin Back Fist | Back Fist | `docs/self-defense.md:13` | drafts | Rename | also #5, #10 |
| `drafts/content/abilities/seal-families-text.json` | `counter #5` | Spin Elbow | OPEN | `docs/self-defense.md:15` | drafts | OPEN | candidates back fist (also #3) / elbow |
| `drafts/content/abilities/seal-families-text.json` | `counter #6` | Arm Wrap | OPEN | `docs/self-defense.md:16` | drafts | OPEN | candidate hook punch (attacker also throws one) |
| `drafts/content/abilities/seal-families-text.json` | `counter #7` | Palm Heel | Palm Heel | `docs/self-defense.md:17` | drafts | Real |  |
| `drafts/content/abilities/seal-families-text.json` | `counter #10` | Grab and Strike | Double Knifehand Block | `docs/self-defense.md:20` | drafts | Rename |  |
| `drafts/content/abilities/seal-families-text.json` | `steady-breath` | Steady Breath | OPEN | - | drafts | OPEN | old placeholder Seal carried on a rank |
| `drafts/content/abilities/seal-families-text.json` | `guard` | Guard | OPEN | - | drafts | OPEN | family label (game group), not a technique |
| `drafts/content/abilities/seal-families-text.json` | `guard #8` | Block and Strike | OPEN | `docs/self-defense.md:18` | drafts | OPEN | block-and-strike, no set name |
| `drafts/content/abilities/seal-families-text.json` | `guard #9` | High Block Strike | OPEN | `docs/self-defense.md:19` | drafts | OPEN | as #8, high |
| `drafts/content/abilities/seal-families-text.json` | `strong-block` | Strong Block | OPEN | - | drafts | OPEN | old placeholder Seal carried on a rank |
| `drafts/content/abilities/seal-families-text.json` | `disarm` | Disarm | OPEN | - | drafts | OPEN | family label (game group), not a technique |
| `drafts/content/abilities/seal-families-text.json` | `disarm #13` | Kick the Weapon | Inside Kick | `docs/self-defense.md:23` | drafts | Rename | also #14 |
| `drafts/content/abilities/seal-families-text.json` | `disarm #14` | Kick and Spin | OPEN | `docs/self-defense.md:24` | drafts | OPEN | candidate spin kick (clashes with Strike "Spin Kick") |
| `drafts/content/abilities/seal-families-text.json` | `throw` | Throw | OPEN | - | drafts | OPEN | family label (game group), not a technique |
| `drafts/content/abilities/seal-families-text.json` | `throw #11` | Outside Reap | Osotogari | `docs/self-defense.md:21` | drafts | Rename | Jay's spelling; S4 "Osoto Gari" |
| `drafts/content/abilities/seal-families-text.json` | `throw #12` | Reap and Finish | OPEN | `docs/self-defense.md:22` | drafts | OPEN | osotogari again (also #11) |
| `drafts/content/abilities/seal-families-text.json` | `lock` | Lock | OPEN | - | drafts | OPEN | family label (game group), not a technique |
| `drafts/content/abilities/seal-families-text.json` | `spin-kick` | Spin Kick | Spin Kick | `docs/curriculum.md:46` | drafts | Real |  |
| `drafts/content/abilities/seal-families-text.json` | `jumping-spins` | Jumping Spins | Jumping Spin Kicks | `docs/curriculum.md:47` | drafts | Rename | doc: "3 jumping spin kicks" (plural, word for word) |
| `drafts/content/abilities/seal-families-text.json` | `butterfly-flow` | Butterfly Flow | Butterfly Kick | `docs/curriculum.md:48` | drafts | Rename | "tornado kick (we call it butterfly kick)" |
| `drafts/content/abilities/seals-11-15-text.json` | `outside-reap` | Outside Reap | Osotogari | `docs/self-defense.md:21` | drafts | Rename | Jay's spelling; S4 "Osoto Gari" |
| `drafts/content/abilities/seals-11-15-text.json` | `reap-and-finish` | Reap and Finish | OPEN | `docs/self-defense.md:22` | drafts | OPEN | osotogari again (also #11) |
| `drafts/content/abilities/seals-11-15-text.json` | `kick-the-weapon` | Kick the Weapon | Inside Kick | `docs/self-defense.md:23` | drafts | Rename | also #14 |
| `drafts/content/abilities/seals-11-15-text.json` | `kick-and-spin` | Kick and Spin | OPEN | `docs/self-defense.md:24` | drafts | OPEN | candidate spin kick (clashes with Strike "Spin Kick") |
| `drafts/content/abilities/seals-11-15-text.json` | `slip-and-double` | Slip and Double | OPEN | `docs/self-defense.md:25` | drafts | OPEN | candidate double punch (also #1) |
| `drafts/content/abilities/seals-16-20-text.json` | `low-high-strike` | Low-High Strike | OPEN | `docs/self-defense.md:26` | drafts | OPEN | Jay (Nov 8): low hammer fist, then back fist; no name in docs |
| `drafts/content/abilities/seals-16-20-text.json` | `arm-bar` | Arm Bar | Arm Bar | `docs/self-defense.md:27` | drafts | Real |  |
| `drafts/content/abilities/seals-16-20-text.json` | `slide-away` | Slide Away | Parry | `docs/self-defense.md:28` | drafts | Rename | parry is in many; no set name |
| `drafts/content/abilities/seals-16-20-text.json` | `wrist-lock` | Wrist Lock | Wrist Lock | `docs/self-defense.md:29` | drafts | Real |  |
| `drafts/content/abilities/seals-16-20-text.json` | `hold-and-combo` | Hold and Combo | OPEN | `docs/self-defense.md:30` | drafts | OPEN | grab and combo, no set name |
| `drafts/content/abilities/seals-31-40-text.json` | `arm-bar-release` | Arm Bar Release | OPEN | `docs/self-defense.md:41` | drafts | OPEN | candidate arm bar (also #17) |
| `drafts/content/abilities/seals-31-40-text.json` | `slide-to-the-wrist` | Slide to the Wrist | OPEN | `docs/self-defense.md:42` | drafts | OPEN | "slide to the wrist" is a step; candidate wrist lock (also #19) |
| `drafts/content/abilities/seals-31-40-text.json` | `party-flex` | Party Flex | Party Flex | `docs/self-defense.md:43` | drafts | Real |  |
| `drafts/content/abilities/seals-31-40-text.json` | `lock-and-drop` | Lock and Drop | OPEN | `docs/self-defense.md:44` | drafts | OPEN | no name ("same as 33 with a slam") |
| `drafts/content/abilities/seals-31-40-text.json` | `catch-the-hand` | Catch the Hand | OPEN | `docs/self-defense.md:45` | drafts | OPEN | candidate wrist lock (also #19) |
| `drafts/content/abilities/seals-31-40-text.json` | `wide-release` | Wide Release | OPEN | `docs/self-defense.md:46` | drafts | OPEN | not stated yet |
| `drafts/content/abilities/seals-31-40-text.json` | `steady-hold` | Steady Hold | OPEN | `docs/self-defense.md:47` | drafts | OPEN | not stated yet |
| `drafts/content/abilities/seals-31-40-text.json` | `lock-to-takedown` | Lock to Takedown | OPEN | `docs/self-defense.md:48` | drafts | OPEN | not stated yet |
| `drafts/content/abilities/seals-31-40-text.json` | `release-and-go` | Release and Go | OPEN | `docs/self-defense.md:49` | drafts | OPEN | not stated yet |
| `drafts/content/abilities/seals-31-40-text.json` | `master-hold` | Master Hold | OPEN | `docs/self-defense.md:50` | drafts | OPEN | not stated yet |
| `drafts/content/abilities/strikes-4-7-text.json` | `side-kick-drive` | Side Kick Drive | Side Kick | `docs/curriculum.md:49` | drafts | Rename | doc: "step behind side kick" |
| `drafts/content/abilities/strikes-4-7-text.json` | `hook-kick` | Hook Kick | Hook Kick | `docs/curriculum.md:50` | drafts | Real | Jay (Nov 8): the combo is Hook Kick |
| `drafts/content/abilities/strikes-4-7-text.json` | `lunge` | Lunge | Jumping Front Kick | `docs/curriculum.md:51` | drafts | Rename | doc: "chambered jumping front kick" |
| `drafts/content/abilities/strikes-4-7-text.json` | `spinning-finisher` | Spinning Finisher | Spinning Hook Kick | `docs/curriculum.md:52` | drafts | Rename |  |
| `drafts/content/abilities/technique-callouts.json` | `rooted-form (subtitle)` | Rooted Form | Basic Form 1 | `docs/curriculum.md:19` | drafts | Rename | kata name; the callout line already says it |
| `drafts/content/abilities/technique-callouts.json` | `flowing-form (subtitle)` | Flowing Form | Basic Form 2 | `docs/curriculum.md:20` | drafts | Rename | kata name; the callout line already says it |
| `drafts/content/abilities/technique-callouts.json` | `follow-up-kick (subtitle)` | Spin Kick Finish | Spin Kick | `docs/curriculum.md:46` | drafts | Rename |  |
| `drafts/content/abilities/technique-callouts.json` | `quick-combo (subtitle)` | Butterfly Flow | Jumping Spin Kicks | `docs/curriculum.md:47` | drafts | Rename | doc: "3 jumping spin kicks" (plural, word for word) |
| `drafts/content/abilities/technique-callouts.json` | `off-balance (subtitle)` | Off-Balance | Double Punch | `docs/self-defense.md:11` | drafts | Rename |  |
| `drafts/content/abilities/technique-callouts.json` | `escape-step (subtitle)` | Escape Step | OPEN | `docs/self-defense.md:12` | drafts | OPEN | same as #1, other side |
| `drafts/content/abilities/technique-callouts.json` | `sweep (subtitle)` | Sweep | Back Fist | `docs/self-defense.md:13` | drafts | Rename | also #5, #10 |
| `drafts/content/abilities/technique-callouts.json` | `steady-breath (subtitle)` | Steady Breath | OPEN | `docs/self-defense.md:14` | drafts | OPEN | candidates outside block / double punch |
| `drafts/content/abilities/technique-callouts.json` | `strong-block (subtitle)` | Strong Block | OPEN | `docs/self-defense.md:15` | drafts | OPEN | candidates back fist (also #3) / elbow |
| `drafts/content/abilities/technique-callouts.json` | `sharp-eyes (subtitle)` | Sharp Eyes | OPEN | `docs/self-defense.md:16` | drafts | OPEN | candidate hook punch (attacker also throws one) |
| `drafts/content/abilities/technique-callouts.json` | `create-distance (subtitle)` | Create Distance | Palm Heel | `docs/self-defense.md:17` | drafts | Rename |  |
| `drafts/content/abilities/technique-callouts.json` | `disarm (subtitle)` | Disarm | OPEN | `docs/self-defense.md:18` | drafts | OPEN | block-and-strike, no set name |
| `drafts/content/abilities/technique-callouts.json` | `throw (subtitle)` | Throw | OPEN | `docs/self-defense.md:19` | drafts | OPEN | as #8, high |
| `drafts/content/abilities/technique-callouts.json` | `follow-through (subtitle)` | Follow Through | Double Knifehand Block | `docs/self-defense.md:20` | drafts | Rename |  |
| `drafts/content/abilities/unlock-text.json` | `sealCarries 10` | Steady Breath | OPEN | - | drafts | OPEN | old placeholder Seal carried on a rank |
| `drafts/content/abilities/unlock-text.json` | `sealCarries 9` | Strong Block | OPEN | - | drafts | OPEN | old placeholder Seal carried on a rank |
| `drafts/content/katas/moves.json` | `pivot` | Pivot | - | - | drafts | Skip | motion word, not a technique |
| `drafts/content/katas/moves.json` | `turn.180` | Half turn | - | - | drafts | Skip | motion word |
| `drafts/content/katas/moves.json` | `turn` | Turn | - | - | drafts | Skip | motion word |
| `drafts/content/katas/moves.json` | `turn.big-special` | Big special turn | - | - | drafts | Skip | motion word |
| `drafts/content/katas/moves.json` | `stance.cat` | Cat stance | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |
| `drafts/content/katas/moves.json` | `stance.front` | Front stance | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |
| `drafts/content/katas/moves.json` | `stance.attention` | Attention | - | - | drafts | Skip | "attention" position, not a technique; docs match is unrelated |
| `drafts/content/katas/moves.json` | `block.downward` | Low block | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |
| `drafts/content/katas/moves.json` | `block.reverse-inside` | Inside block | Inside block | `docs/self-defense.md:13` | drafts | Real | kata move; file says wording is a guess |
| `drafts/content/katas/moves.json` | `block.overhead` | High block | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |
| `drafts/content/katas/moves.json` | `block.double-knife-hand` | Knife-hand block | Double Knifehand Block | `docs/self-defense.md:20` | drafts | Rename | docs spelling "knifehand" |
| `drafts/content/katas/moves.json` | `punch.straight` | Straight punch | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |
| `drafts/content/katas/moves.json` | `punch.reverse` | Reverse punch | Reverse punch | `docs/curriculum.md:51` | drafts | Real | kata move; file says wording is a guess |
| `drafts/content/katas/moves.json` | `strike.backfist` | Backfist | Back Fist | `docs/self-defense.md:13` | drafts | Rename | spelling: docs write "back fist" |
| `drafts/content/katas/moves.json` | `kick.reverse` | Reverse kick | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |
| `drafts/content/katas/moves.json` | `kick.straight` | Straight kick | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |
| `drafts/content/katas/moves.json` | `kick.front` | Front kick | Front kick | `docs/curriculum.md:46` | drafts | Real | kata move; file says wording is a guess |
| `drafts/content/katas/moves.json` | `chamber` | Chamber | - | - | drafts | Skip | motion word |
| `drafts/content/katas/moves.json` | `catch` | Catch | - | - | drafts | Skip | docs match is unrelated |
| `drafts/content/katas/moves.json` | `break.double-choke` | Choke break | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |
| `drafts/content/katas/moves.json` | `shout.kiai` | Kiai! | OPEN | - | drafts | OPEN | kata move; file says wording is a guess; not in the 3 docs (Jay's kata sheets may have it) |

## What this shows

- **Same name in several files:** each Seal appears in up to four places (`abilities.json`, `seal-families.json` or `seal-families-text.json`, the seal text file, `technique-callouts.json`). One decision per technique number fixes all of them.
- **Seal families** (Escape, Counter, Guard, Throw, Disarm, Lock) are game groups, not techniques. The docs only have a "Game category" column. Counter and Guard are also button names. Jay should say if groups count under the rule.
- **Stances** (Open Leg, Cat, Front, Horse): Jay approved these in J1 (`drafts/content/katas/stances.json`), but they are not in the three docs. Adding them to `docs/curriculum.md` would make them pass.
- **Repeats:** one real term can fit several techniques (double punch #1, #4, #15; back fist #3, #5, #10, #16; osotogari #11, #12; wrist lock #19, #32, #35; arm bar #17, #31). Each is given to one technique only; the rest stay OPEN.
- **#36-40** are "(not stated)" in the docs, so all are OPEN.
- Rows are in `J27-audit.json`. `python3 drafts/content/tools/j27-audit.py` (from the repo root) rebuilds the JSON.
