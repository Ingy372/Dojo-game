# R-OVERHAUL-LAUNCH: launch plan from the Fable review (OV-P2)

Status: proposal for the Manager. Docs only. No game code, content or work board changed.
Source: `docs/reviews/fable-progression-overhaul.md` section 10 (L1-L20). Jay's section 11 answers (Nov 14, board section 000, bot-manager a083162) are applied. Launch stays **early April 2027** (Jay, Q4).

## 1. What Jay's answers changed

| Review item | Jay's answer | What happens |
|---|---|---|
| L2 Belt Levels and Stars | Q2 (b): one level number to 100, no reset | **L2 dropped.** Beta fallback (OV-B2) stays. One small leftover is offered as L2b (section 4) |
| L6 Kata to Stance | Q1 (b): kata keeps its own powers, stances stay separate sign-offs | **L6 replaced** by the kata-power track (PB-04 slot, PB-11 powers), scope through Nahanchi |
| L8 Evolutions, split Lock | Q3 (a): split Lock into groups Jay names | Stays, waits on Jay's group names |
| L9 Review Trials | Q5 (a): self-defense stops at #40 | Review Trials fill Brown/Black |
| L17 Street Smarts | Q6 (a): badges, no fight bonus | Stays, no power |
| L5 Faith, L19 Voice | Q7 (a): all four pieces; AI voice if it sounds decent, Jay's voice if needed | Both stay |
| L13 Coin shop | Q8 (a): earned coins only, looks only, never paid | Stays |
| L16 Power report | Q10 (a): about 60% of strength from real training | Docs get one number |
| OV-B3 | Q9 (a): 6-9s start on Guided | Already on the board |

## 2. Order

Review's top five, minus what Jay dropped, then the two must-haves, then the rest by risk:

1. **L1** Path screen 2. **L5** Faith 3. **KP** Kata powers (replaces L6) 4. **L8** Evolutions and Lock split 5. **L11** Tiers 4-10 remixes (must-have) 6. **L12** DojoForge feed and saves (must-have) 7. L9, L4, L13, L7, L16, L20, L14, L17, L19, L10, L15, L18, L3.

## 3. Items

Effort: S = a day or two of bot work, M = about a week, L = several weeks (review's scale). "Jay" in the last column = needs Jay's input before it can finish.

| ID | Owner | What | Done when | Waits on | Effort | Jay |
|---|---|---|---|---|---|---|
| L1 | Programmer (+ Artist, Content Designer words) | One Path screen replaces Gate tab, Path card, goals card and Tower map: where you are, next real step, next game step | Home shows one Path screen; the 4 old screens are gone; a White and a Green fixture each show the right next class step and next game step; tests pass; Tester PASS at 667x375 and 932x430 | OV-B3 done; Artist layout mock approved by Manager | M | No |
| L5 | Content Designer (pack), Programmer (wiring) | FAITH DOES: belt letter banner, verse scrolls, creed scroll, Guardian-restored lines, words exactly from `docs/faith-and-creed.md` (KJV) | `content/faith/` pack loads; each belt promotion adds its letter; each line matches the source word for word (data test); Jay has approved every line | Jay line approval | S-M | Yes (approve lines) |
| KP | Programmer (PB-04), Planner (PB-11 numbers), Content Designer (text) | Kata power slot and real kata powers through Nahanchi (replaces L6) | One kata power per run; each kata through Nahanchi has a power; balance-check table passes (kata PE <= 12) | OV-B3 (board), Jay's kata power list and step sheets for Pinon 1-3 and Nahanchi | M | Yes (powers) |
| L8 | Planner (spec), Programmer, Artist (medallions) | Evolutions at Defense ranks 3/6/9; split Lock into Jay's groups; one hold mechanic | #31-40 rank at least 2 different groups; no rank adds to a capped number (data test); balance-check passes all belts | Jay names the Lock groups | M | Yes (group names) |
| L11 | Programmer, Content Designer (rooms), Planner (balance) | Tiers 4-10 as remixes of existing rooms and enemies, one Guardian each | Every tier 4-10 has rooms and a Guardian; R-BAL-12 (Guardian 40-80 hits, no knock-out under 5 hits) passes on every tier and difficulty | L8 (so late moves matter) | L | No |
| L12 | Programmer with Nic | DojoForge feed, login, server saves | A test student signs in, plays, and the save returns on a 2nd device; feed sign-offs arrive | Nic's API and timeline | L | Yes (Nic contact, data and privacy sign-off with lawyer, B-LAW) |
| L9 | Programmer (PB-13 template), Content Designer | Sensei's Trial for every sign-off; Review Trials for long belts (Brown/Black has no #41-45) | Each sign-off opens a Trial room; Brown/Black offers Review Trials; tests pass | KP and L8 data | M | No |
| L4 | Programmer, Artist, Content Designer | Class Chest every class (no end); best-streak aura that only grows, never shrinks or warns | 30 classes in a fixture give 30 chests; aura never goes down; no streak-loss text anywhere (word check) | — | S | No |
| L13 | Planner (prices), Programmer, Artist | Coin shop first stage: earned coins from runs and chests, looks only, never paid | Shop sells looks only; no real-money code path exists; balance note on coin rates | L4 | M | No (answered) |
| L7 | Programmer, Learning Designer review | Remove STANCE button from the fight; Virtue button shows only when full | Fight has at most 4 buttons for a White profile; lessons updated; Tester PASS | — | S | No |
| L16 | Programmer (report), Manager (docs) | Staff Power report down to five rows; docs say one training share: about 60% | Report has 5 rows; `CLAUDE.md`, core-design 12 and `config.ts` comment all say about 60% | — | S | No (answered) |
| L20 | Manager (or Planner on request) | Fix every 8.1 contradiction in the docs | Each 8.1 row is marked fixed with a commit | — | S | No |
| L14 | Planner, Programmer | Power-up pool past 13 (needs new effect types) and family rename | Post-launch unless scope allows; rename after Jay answers | Jay (rename words) | S | Yes (rename) |
| L17 | Content Designer, Programmer | Street Smarts: one location per age band, badges, town lights, no fight bonus | Each age band has 1 location; badges show in the Book; no power change (sim test); Jay approved each script | Jay script approval | M | Yes (scripts) |
| L19 | Programmer, Content Designer | Voice on cards for ages 6-9 (AI voice first) | Cards read aloud on tap for a 6-9 profile; Jay OKs the voice sample | Jay voice OK | S | Yes (voice sample) |
| L10 | Programmer, Artist | The Book: Moves, Monsters, Faith, Trophies in one place | Trophy Case, Journal and Lesson Scroll merged into one Book screen; tests pass | L5 | M | No |
| L15 | Programmer, Artist | Gear: rarity shows on the character, one perk line, auto-wear on Guided | A rare item looks different in a fight; Guided auto-wears the best item | — | M | No |
| L18 | Programmer | In-game technique videos behind the parent gate rules | Path screen plays a technique video from feed ids | L1, L12 | S-M | No |
| L3 | Planner (spec), Programmer | Five chapters per tier opened by Gate lights | Passing a Gate requirement opens a new chapter in that tier | L11 | M | No |

## 4. Proposals (not scope until approved)

- **L2b (Small, proposal):** with one level number kept, XP is still thrown away at the belt cap (`gainXp` sets xp to 0). Option: after the cap, XP fills Stars that give a looks-only chest, no power, nothing ever resets. Fits Jay's answer (work is never reset). Needs a Manager call; if it is a "new system" it goes to Jay.

## 5. Scope check against April 2027 [FLAG]

- Rough count: 2 Large (L11, L12), 10 Medium, 8 Small or S-M. About 4-5 months of work from mid-November with one Programmer, before testing.
- **L12 depends on Nic**, outside the team. It is the biggest date risk. Ask for Nic's timeline first.
- If time runs short, the review's own list says cut from the bottom: **L3, L18, L15, L10** first (none are must-haves). Keep L1, L5, KP, L8, L11, L12.
- Nothing here adds launch scope beyond the review; L2b and L14-past-13 are proposals only.

## 6. What needs Jay (collected)

1. Every faith line (L5). 2. Kata powers and step sheets through Nahanchi (KP). 3. Names for the Lock groups (L8). 4. Nic's contact and timeline; lawyer sign-off (L12). 5. Street Smarts scripts (L17). 6. AI voice sample OK (L19). 7. Rooted/Flowing rename words (L14). 8. L2b Stars, if the Manager sends it up.
