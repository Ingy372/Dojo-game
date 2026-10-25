# Elites on main (PR #59): in-game QA with the 4th-belt test profile

## Delivery Note
- **ITEM:** Elites on main (PR #59), checked with the new 4th-belt profile `4-green-belt` ("Kai M., Green Belt"). Main at 6df6a0a.
- **WHAT:** I read the code and content/elites/elites.json, ran the repo's elite tests (18 of 18 pass), and ran my own sim count over 2,000 seeds per case. I also rendered the game at 844x390 and 667x375 (3x) and took screenshots. Everything matches the spec, with one exception: a ghost copy of the Guarding line shows up on empty floor.
- **WHY:** The Manager asked for this check, to confirm the spec and the PR #52 Challenge decision before kids meet elites.
- **DECIDE:** (1) Fix the ghost Guarding line? I say yes. (2) Elites read difficulty only from the `?difficulty=` test link. When the real difficulty choice arrives (milestone 7), it has to be wired in, or Guided players would get Guarding elites.
- **NEXT:** Programmer fixes bug 1. Then Jay plays one green-belt floor on a real phone to judge the Swift timing by feel.

## How I tested
- **Live link:** it is deployed with elites. The live bundle contains `eliteFocus` and `4-green-belt`. The screenshots come from a local dev build of the same main, so I could use test links and read game state.
- **Sim:** scratch test in a separate worktree `/workspace/dojo-qa-e2`, nothing committed. Output is in `/workspace/qa/elites-ingame/sim.txt`.
- **Rendered game:** `/tmp/pw/elites.mjs`, `elites2.mjs` and `tether.mjs` (Playwright). Logs are `/workspace/qa/elites-ingame/log.json` and `log2.json`.

## Results against the spec
| Check | Spec | Found | OK? |
|---|---|---|---|
| Profile | 4th belt on testing screen | "Green Belt" button shown, tier 4 in game | yes |
| Below 4th belt | none | 0 elites in 2,000 floors × tiers 1–3 × 3 difficulties | yes |
| Spawn rate | 20% battle, 35% challenge, from room 3 | 19.7% / 35.6%, 0 in rooms 1–2, max 1 per room, max 2 per floor | yes |
| Elites per floor | about 1 | 0.94 | yes |
| Guarding limits | not on Guided, not on a belt's first floor, max 1 per floor | 0 Guarding in those cases; 683 per 2,000 floors otherwise (Brute or Shield Guard only) | yes |
| Health | x1.25 | Swarmer 40→50, Shield 90→113, Brute 180→225 (also live in game) | yes |
| Swift speed | x1.25 | 4→5, 2.4→3, 1.2→1.5 tiles/s | yes |
| Swift recovery | x0.85 | 16→14, 18→15 ticks | yes |
| Swift wind-up | x0.8 on Standard; none on Guided or Challenge (PR #52) | Standard 12→10, 14→11, 16→13; Guided and Challenge unchanged | yes |
| Guarding | x0.67 to the 2 closest within 3 tiles | enemies at 1 and 2 tiles protected; enemy at 3 tiles left out because the 2-enemy cap was already full; 5 tiles not protected. Repo test confirms damage is about 2/3 | yes |
| Reward | +15 Focus, 50% decoration, never gear | Focus bar jumps about 25–30 in game (hit + 15), with a gold sparkle but no readable "+15" in my frames; decoration on 51.6% of 2,000 seeds | yes |
| Auras | gold Swift, blue Guarding | both show in game at both sizes | yes |

## Bugs (most serious first)
1. **Ghost Guarding line on empty floor**
   - What I did: opened a Guarding room (`?elite=guarding&room=pillar-court&seed=4`, also shield-wall) as Green Belt.
   - What happened: the blue line and glow between the guard and the enemy it protects is drawn correctly. A second copy is also drawn lower down on empty floor, about 100 px right and 240 px down on 844x390. I logged the sprite positions to confirm no enemy is there. Screenshots: `/workspace/qa/elites-ingame/844x390-guarding-tether-check.png`, `/workspace/qa/elites-ingame/667x375-guarding-pillar-court-s4.png`.
   - What should have happened: one line, only between the guard and the enemy it protects. A kid will think the empty spot is something to hit. My guess is that a second camera (the screen-overlay camera) also draws the line layer.
   - Severity: **ANNOYING**
2. **Elites ignore the real difficulty (future risk)**
   - What I did: read `tower.ts`.
   - What happened: elite rules use only the `?difficulty=` link and otherwise default to Standard. Today that's fine, because the game has no difficulty choice yet.
   - What should have happened: once milestone 7 adds the choice, the run should pass it in. Otherwise "no Guarding on Guided" breaks.
   - Severity: **SMALL** (not live yet)
3. **Testing screen label is out of date**
   - What I did: opened the testing screen.
   - What happened: it says "same student, three points in time", but there are now 4 profiles. The green-belt welcome card also lists 35 sign-offs in two tight columns at 667x375, with lines nearly touching. Screenshot: `/workspace/qa/elites-ingame/667x375-testing-screen.png`.
   - What should have happened: "four points in time", and a shorter welcome list, for example "35 skills unlocked!" with a few examples.
   - Severity: **SMALL**

## Playability note
- **6-year-old:** the gold and blue auras stand out well from the floor and from normal enemies. The reward is a sparkle and a Focus bar jump, so it's easy to miss that an elite gave more. The ghost line would confuse them.
- **12-year-old:** the blue line makes it obvious who is being protected. It's a nice little puzzle ("hit the guard first"). The Swift Swarmer is visibly quicker.
- **Adult:** the numbers match the spec exactly, and the caps keep it gentle (about 1 elite per floor).
- **What a headless browser can't judge:** whether a child can react to the Swift wind-up on Standard (10 ticks, 0.5 s), how the auras look on a real screen in sunlight, and whether the reward feels rewarding.

Key screenshots:
- `/workspace/qa/elites-ingame/844x390-swift-pillar-court-s4.png` (gold Swift aura)
- `/workspace/qa/elites-ingame/844x390-guarding-shield-wall-b.png` (blue Guarding aura and line)
- `/workspace/qa/elites-ingame/844x390-guarding-tether-check.png` (bug 1, ghost line)
- `/workspace/qa/elites-ingame/844x390-swift-gauntlet-reward-2.png` (defeating an elite)
- `/workspace/qa/elites-ingame/667x375-testing-screen.png` (4th-belt profile, bug 3)
