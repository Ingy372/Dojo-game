# J27: seal callouts use the real technique names (#1-10)

PROPOSAL for Jay and the Manager. Nothing is renamed in game files. Written Nov 8, 2026 (America/New_York) by the Content Writer.
Clash list: PR #402 (`seal-name-clashes-1-10.md`). Names come word for word from `docs/self-defense.md` ("What the student does" column), shown in title case. `docs/curriculum.md` has the belt ladder but no technique names for #1-10. Ids stay the same; the old name goes in `altName`.

| # | Id (unchanged) | Name now | Callout now (subtitle) | Proposed callout (subtitle) | Source | Status |
|---|---|---|---|---|---|---|
| 1 | `off-balance` | Off-Balance | Self-Defense #1! / Off-Balance | Self-Defense #1! / **Double Punch** | `docs/self-defense.md:11` | PROPOSED |
| 2 | `escape-step` | Escape Step | Self-Defense #2! / Escape Step | OPEN: Same moves as #1, other side, so no separate name. Candidate: reuse 'Double Punch' (line 12 says 'Same as #1'). | `docs/self-defense.md:12` | **OPEN** |
| 3 | `sweep` | Sweep | Self-Defense #3! / Sweep | Self-Defense #3! / **Back Fist** | `docs/self-defense.md:13` | PROPOSED |
| 4 | `steady-breath` | Steady Breath | Self-Defense #4! / Steady Breath | OPEN: Several real moves (outside block, double punch). Candidates: 'Outside Block' (line 14) or 'Double Punch' (line 14, also #1). | `docs/self-defense.md:14` | **OPEN** |
| 5 | `strong-block` | Strong Block | Self-Defense #5! / Strong Block | OPEN: Candidates: 'Back Fist' (line 15, also #3) or the elbow strike (line 15 says 'spin with an elbow', not a set name). | `docs/self-defense.md:15` | **OPEN** |
| 6 | `sharp-eyes` | Sharp Eyes | Self-Defense #6! / Sharp Eyes | OPEN: Candidate: 'Hook Punch' (line 16), but the attacker also throws a hook punch, which could confuse. | `docs/self-defense.md:16` | **OPEN** |
| 7 | `create-distance` | Create Distance | Self-Defense #7! / Create Distance | Self-Defense #7! / **Palm Heel** | `docs/self-defense.md:17` | PROPOSED |
| 8 | `disarm` | Disarm | Self-Defense #8! / Disarm | OPEN: Block-and-strike together (line 18) has no set name. Candidate: 'Outside Block' (also #4, #6, #7, #9). | `docs/self-defense.md:18` | **OPEN** |
| 9 | `throw` | Throw | Self-Defense #9! / Throw | OPEN: Same as #8, high (line 19). No set name. Candidate: 'Outside Block'. | `docs/self-defense.md:19` | **OPEN** |
| 10 | `follow-through` | Follow Through | Self-Defense #10! / Follow Through | Self-Defense #10! / **Double Knifehand Block** | `docs/self-defense.md:20` | PROPOSED |

## Short lines (8 words or fewer)
- #1 Double Punch: "Step aside, then punch two times fast."
- #3 Back Fist: "Spin around and strike with a back fist."
- #7 Palm Heel: "Trap the arm, then one strong palm strike."
- #10 Double Knifehand Block: "Block with both hands, then grab the arm."

## Notes
- **Repeats:** "back fist" is also in #5 and #10, and "double punch" is also in #4. I gave each name to the seal it best fits (the move the technique ends on or is known for), so no two seals share a name.
- **OPEN (6 of 10): #2, #4, #5, #6, #8, #9.** The docs describe these as a set of steps with no single name. The S4 names (Other Side, Drive Back, Spin Elbow, Arm Wrap, Block and Strike, High Block Strike) are game names, not real ones, so I did not use them. Jay can give the dojo's own name for each, or pick a candidate.
- **Effects are not changed.** The game text for some seals still describes the old placeholder power (for example #1's "off-balance" line). Moving effects is S4's job.
- **S4 and seal families:** `seal-families-text.json` (#407) and `S4-self-defense-powers.md` still use the S4 names. If Jay approves, they need the same change.
- Check: `python3 drafts/content/tools/check-j27-seal-names.py`.
