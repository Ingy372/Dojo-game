# J27: seal callouts use the real technique names (#1-10)

PROPOSAL for Jay and the Manager. Nothing is renamed in game files. Written Nov 8, 2026 (America/New_York) by the Content Writer.
Clash list: PR #402 (`seal-name-clashes-1-10.md`). Names come word for word from `docs/self-defense.md` ("What the student does" column), shown in title case. `docs/curriculum.md` has the belt ladder but no technique names for #1-10. Ids stay the same; the old name goes in `altName`.

| # | Id (unchanged) | Name now | Callout now (subtitle) | Proposed callout (subtitle) | Source | Status |
|---|---|---|---|---|---|---|
| 1 | `off-balance` | Off-Balance | Self-Defense #1! / Off-Balance | Self-Defense #1! / **Double Punch** | `docs/self-defense.md:11` | PROPOSED |
| 2 | `escape-step` | Escape Step | Self-Defense #2! / Escape Step | OPEN: Same moves as #1, other side, so no separate name. Candidate: reuse 'Double Punch' (line 12 says 'Same as #1'). | `docs/self-defense.md:12` | **OPEN** |
| 3 | `sweep` | Sweep | Self-Defense #3! / Sweep | Self-Defense #3! / **Back Fist** | `docs/self-defense.md:13` | PROPOSED |
| 4 | `steady-breath` | Steady Breath | Self-Defense #4! / Steady Breath | OPEN: no real name in the docs. **Family: Advancing** (Jay, Nov 8: "Self-defense #4 belongs to Advancing."). Push-back effect kept. Candidates: Outside Block / Double Punch (also #1). | `docs/self-defense.md:14` | **OPEN** |
| 5 | `strong-block` | Strong Block | Self-Defense #5! / Strong Block | OPEN: Candidates: 'Back Fist' (line 15, also #3) or the elbow strike (line 15 says 'spin with an elbow', not a set name). | `docs/self-defense.md:15` | **OPEN** |
| 6 | `sharp-eyes` | Sharp Eyes | Self-Defense #6! / Sharp Eyes | OPEN: Candidate: 'Hook Punch' (line 16), but the attacker also throws a hook punch, which could confuse. | `docs/self-defense.md:16` | **OPEN** |
| 7 | `create-distance` | Create Distance | Self-Defense #7! / Create Distance | Self-Defense #7! / **Palm Heel** | `docs/self-defense.md:17` | PROPOSED |
| 8 | `disarm` | Disarm | Self-Defense #8! / Disarm | OPEN: Block-and-strike together (line 18) has no set name. Candidate: 'Outside Block' (also #4, #6, #7, #9). | `docs/self-defense.md:18` | **OPEN** |
| 9 | `throw` | Throw | Self-Defense #9! / Throw | OPEN: Same as #8, high (line 19). No set name. Candidate: 'Outside Block'. | `docs/self-defense.md:19` | **OPEN** |
| 10 | `follow-through` | Follow Through | Self-Defense #10! / Follow Through | Self-Defense #10! / **Double Knifehand Block** | `docs/self-defense.md:20` | PROPOSED |

## Nov 8 rule: real dojo names only (Jay, via the Manager)

### Kick combo 5 Strike: Hook Kick
| Id (unchanged) | Name | altName (old) | Source |
|---|---|---|---|
| `hook-kick` | **Hook Kick** | Low-High Kicks | `docs/curriculum.md:50` ("step behind hook kick") |

"Low-High" in `drafts/content/`: `strikes-4-7-text.json` (already only in `altName`), `seals-16-20-text.json` (#16, below), and the notes in `seal-name-clashes-1-10.md` and `check-strikes-4-7-text.py`. It is not in `seal-families-text.json` or anywhere in `content/`.

### Seal #16: OPEN
| Id (unchanged) | Name now | Real name | Description (not a name) | Kid line (8 words or fewer) | Source |
|---|---|---|---|---|---|
| `low-high-strike` | Low-High Strike | **OPEN**: neither `docs/self-defense.md` nor `docs/curriculum.md` names #16 | Hammer Fist, Back Fist | "Quick low hammer fist, then high back fist." | `docs/self-defense.md:26` (steps only) |

- Jay (Nov 8): #16 is a quick hammer fist low, then a back fist to the face.
- **Kid-text choice:** player text is "Quick low hammer fist, then high back fist." (8 words; Manager's decision, Nov 8). It never says where the low strike lands, so the groin is not mentioned for ages 6 and up. The face is left out as well (no body-part words, as in S4). The real details stay in the curriculum and the technique video.
- "Low-High Strike" stays only until Jay gives the real name.

## The 41 ready real names (drop-ins, Manager Nov 8)

Built in `J27-seal-renames.json` under `renames`. Ids stay the same, and the old name goes in `altName`. Live rows are for the Programmer; this PR edits no `content/` file.

| File | Entry | Old name (altName) | Real name | Source | Live |
|---|---|---|---|---|---|
| `content/abilities/abilities.json` | `seals[id=off-balance]` | Off-Balance | **Double Punch** | `docs/self-defense.md:11` | yes |
| `content/abilities/abilities.json` | `seals[id=sweep]` | Sweep | **Back Fist** | `docs/self-defense.md:13` | yes |
| `content/abilities/abilities.json` | `seals[id=create-distance]` | Create Distance | **Palm Heel** | `docs/self-defense.md:17` | yes |
| `content/abilities/abilities.json` | `seals[id=follow-through]` | Follow Through | **Double Knifehand Block** | `docs/self-defense.md:20` | yes |
| `content/abilities/abilities.json` | `strikes[id=quick-combo]` | Jumping Spins | **Jumping Spin Kicks** | `docs/curriculum.md:47` | yes |
| `content/abilities/strikes.json` | `strikes[id=jumping-spins]` | Jumping Spins | **Jumping Spin Kicks** | `docs/curriculum.md:47` | yes |
| `content/abilities/strikes.json` | `strikes[id=butterfly-flow]` | Butterfly Flow | **Butterfly Kick** | `docs/curriculum.md:48` | yes |
| `content/abilities/seal-families.json` | `families[id=escape].ranks[technique=1]` | Off the Line | **Double Punch** | `docs/self-defense.md:11` | yes |
| `content/abilities/seal-families.json` | `families[id=counter].ranks[technique=3]` | Spin Back Fist | **Back Fist** | `docs/self-defense.md:13` | yes |
| `content/abilities/seal-families.json` | `families[id=counter].ranks[technique=10]` | Grab and Strike | **Double Knifehand Block** | `docs/self-defense.md:20` | yes |
| `content/abilities/seal-families.json` | `families[id=throw].ranks[technique=11]` | Outside Reap | **Osotogari** | `docs/self-defense.md:21` | yes |
| `content/abilities/seal-families.json` | `families[id=disarm].ranks[technique=13]` | Kick the Weapon | **Inside Kick** | `docs/self-defense.md:23` | yes |
| `drafts/content/abilities/seal-families-text.json` | `families[id=escape].ranks[technique=1]` | Off the Line | **Double Punch** | `docs/self-defense.md:11` | drafts |
| `drafts/content/abilities/seal-families-text.json` | `families[id=counter].ranks[technique=3]` | Spin Back Fist | **Back Fist** | `docs/self-defense.md:13` | drafts |
| `drafts/content/abilities/seal-families-text.json` | `families[id=counter].ranks[technique=10]` | Grab and Strike | **Double Knifehand Block** | `docs/self-defense.md:20` | drafts |
| `drafts/content/abilities/seal-families-text.json` | `families[id=disarm].ranks[technique=13]` | Kick the Weapon | **Inside Kick** | `docs/self-defense.md:23` | drafts |
| `drafts/content/abilities/seal-families-text.json` | `families[id=throw].ranks[technique=11]` | Outside Reap | **Osotogari** | `docs/self-defense.md:21` | drafts |
| `drafts/content/abilities/seal-families-text.json` | `strikes[id=jumping-spins]` | Jumping Spins | **Jumping Spin Kicks** | `docs/curriculum.md:47` | drafts |
| `drafts/content/abilities/seal-families-text.json` | `strikes[id=butterfly-flow]` | Butterfly Flow | **Butterfly Kick** | `docs/curriculum.md:48` | drafts |
| `drafts/content/abilities/seals-11-15-text.json` | `seals[id=outside-reap]` | Outside Reap | **Osotogari** | `docs/self-defense.md:21` | drafts |
| `drafts/content/abilities/seals-11-15-text.json` | `seals[id=kick-the-weapon]` | Kick the Weapon | **Inside Kick** | `docs/self-defense.md:23` | drafts |
| `drafts/content/abilities/strikes-4-7-text.json` | `strikes[id=side-kick-drive]` | Side Kick Drive | **Side Kick** | `docs/curriculum.md:49` | drafts |
| `drafts/content/abilities/strikes-4-7-text.json` | `strikes[id=lunge]` | Lunge | **Jumping Front Kick** | `docs/curriculum.md:51` | drafts |
| `drafts/content/abilities/strikes-4-7-text.json` | `strikes[id=spinning-finisher]` | Spinning Finisher | **Spinning Hook Kick** | `docs/curriculum.md:52` | drafts |
| `drafts/content/abilities/technique-callouts.json` | `callouts[ability=rooted-form]` | Rooted Form | **Basic Form 1** | `docs/curriculum.md:19` | drafts |
| `drafts/content/abilities/technique-callouts.json` | `callouts[ability=flowing-form]` | Flowing Form | **Basic Form 2** | `docs/curriculum.md:20` | drafts |
| `drafts/content/abilities/technique-callouts.json` | `callouts[ability=follow-up-kick]` | Spin Kick Finish | **Spin Kick** | `docs/curriculum.md:46` | drafts |
| `drafts/content/abilities/technique-callouts.json` | `callouts[ability=quick-combo]` | Butterfly Flow | **Jumping Spin Kicks** | `docs/curriculum.md:47` | drafts |
| `drafts/content/abilities/technique-callouts.json` | `callouts[ability=off-balance]` | Off-Balance | **Double Punch** | `docs/self-defense.md:11` | drafts |
| `drafts/content/abilities/technique-callouts.json` | `callouts[ability=sweep]` | Sweep | **Back Fist** | `docs/self-defense.md:13` | drafts |
| `drafts/content/abilities/technique-callouts.json` | `callouts[ability=create-distance]` | Create Distance | **Palm Heel** | `docs/self-defense.md:17` | drafts |
| `drafts/content/abilities/technique-callouts.json` | `callouts[ability=follow-through]` | Follow Through | **Double Knifehand Block** | `docs/self-defense.md:20` | drafts |
| `drafts/content/abilities/unlock-text.json` | `strikes[id=jumping-spins]` | Jumping Spins | **Jumping Spin Kicks** | `docs/curriculum.md:47` | drafts |
| `drafts/content/abilities/unlock-text.json` | `strikes[id=butterfly-flow]` | Butterfly Flow | **Butterfly Kick** | `docs/curriculum.md:48` | drafts |
| `drafts/content/abilities/unlock-text.json` | `seals[technique=1]` | Off the Line | **Double Punch** | `docs/self-defense.md:11` | drafts |
| `drafts/content/abilities/unlock-text.json` | `seals[technique=3]` | Spin Back Fist | **Back Fist** | `docs/self-defense.md:13` | drafts |
| `drafts/content/abilities/unlock-text.json` | `seals[technique=10]` | Grab and Strike | **Double Knifehand Block** | `docs/self-defense.md:20` | drafts |
| `drafts/content/abilities/unlock-text.json` | `seals[technique=11]` | Outside Reap | **Osotogari** | `docs/self-defense.md:21` | drafts |
| `drafts/content/abilities/unlock-text.json` | `seals[technique=13]` | Kick the Weapon | **Inside Kick** | `docs/self-defense.md:23` | drafts |
| `drafts/content/katas/moves.json` | `moves.block.double-knife-hand` | Knife-hand block | **Double Knifehand Block** | `docs/self-defense.md:20` | drafts |
| `drafts/content/katas/moves.json` | `moves.strike.backfist` | Backfist | **Back Fist** | `docs/self-defense.md:13` | drafts |

## Short lines (8 words or fewer)
- #1 Double Punch: "Step aside, then punch two times fast."
- #3 Back Fist: "Spin around and strike with a back fist."
- #7 Palm Heel: "Trap the arm, then one strong palm strike."
- #10 Double Knifehand Block: "Block with both hands, then grab the arm."

## Notes
- **#4 (Manager's correction, Nov 8):** Jay said "Self-defense #4 belongs to Advancing." **Advancing is #4's family, not its name.** So #4 stays OPEN: it keeps its current name, with the old name also in `altName`. Its family is **Advancing** (not Escape, which J21 had in `drafts/planning/R-G2B-seal-families-16-40.md:11`), and it keeps the push-back effect. The 5 drop-ins that renamed #4 to "Advancing" are removed. One `familyMoves` entry files #4 under Advancing in `seal-families.json` (live), `seal-families-text.json` and `unlock-text.json`. **It is a future dependency: do not apply it** until the loader schema supports an `advancing` family id. The Tester found that adding the family throws today. Until then, #4 stays under escape in those files, with a `j27` note on the entry that says name OPEN, family Advancing.
- **Renames: 41.** The first 35, minus #4's name (5 entries) and #18 Parry (1 entry; Manager, Nov 8: #18 is OPEN, "parry is in many; no set name"), plus the 7 `unlock-text.json` titles the Manager confirmed.
- **Full audit** of every technique, move, Seal, Strike and family name: `J27-audit.md`.
- **Repeats:** "back fist" is also in #5 and #10, and "double punch" is also in #4. I gave each name to the seal it best fits (the move the technique ends on or is known for), so no two seals share a name.
- **OPEN (6 of 10): #2, #4, #5, #6, #8, #9.** The docs describe these as a set of steps with no single name. The S4 names (Other Side, Drive Back, Spin Elbow, Arm Wrap, Block and Strike, High Block Strike) are game names, not real ones, so I did not use them. Jay can give the dojo's own name for each, or pick a candidate.
- **Effects are not changed.** The game text for some seals still describes the old placeholder power (for example #1's "off-balance" line). Moving effects is S4's job.
- **S4 and seal families:** `seal-families-text.json` (#407) and `S4-self-defense-powers.md` still use the S4 names. If Jay approves, they need the same change.
- Check: `python3 drafts/content/tools/check-j27-seal-names.py`.
