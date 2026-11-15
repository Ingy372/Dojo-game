# Delivery Note: LP-A1 Path screen layout mock

- **ITEM:** LP-A1 (L1 prep), one Path screen layout mock.
- **WHAT:** A mock of the one Path screen at 667x375 and 932x430, each also at @2x, plus the intro-card version at both sizes. The second pass follows the LP-L1 learning review in [#490](https://github.com/Ingy372/Dojo-game/pull/490). It replaces the Gate tab, the Path card, the goals card and the Tower map. The script is in `source/make_path_mock.py` and reuses the approved menu2 sprites and helpers. This is a layout mock only. It is not a sprite batch and nothing needs importing yet.
- **WHY:** The review's L1 says "one picture of the climb": where you are, the next real step and the next game step. The fixture is the Green-belt test student from the live Gate tab: Gate to Blue, 3 of 7 locks lit, 15 of 24 classes, Sensei's Seal not lit, next step Self-Defense #18.
- **DECIDE (Manager):** Does the layout pass the art gate, so it can go to Jay? Notes on scope:
  - The words are placeholders. I took them from the live game (`goals.ts`, the Gate tab). Content owns the final wording.
  - Following LP-L1, FAITH DOES is off the Path until L5 is approved, and a plain "My Path" title takes its place. The script still draws the banner with `SHOW_FAITH=1` (nine places, one lit per promotion).
  - LP-L1 order: the real class step is the biggest card, the game step comes second and is smaller, and the Tower shows where you are. Each card has a picture before its text, every kid line is 8 words or fewer, there are no percent numbers, and the level bar never goes down. The locks are pictures that light up.
  - The intro card is for existing players only, on their first visit. It dims everything except the class step and says "This is your Path." / "Your next step is here." with an OK button. New players never see it.
  - The Practice room button and the Last run, Gear and Abilities tabs are not part of this screen. They stay wherever the board puts them.
- **NEXT:** Revise after your gate. Once Jay approves, I'll export the real Tower-strip, lock, sundial and banner sprites for the Programmer, in a separate PR.

## What's on the screen (see `preview/key-numbered-932x430@2x.png`)

1. **Top bar.** A Dojo back button, the "My Path" title (the FAITH DOES banner goes here later, with L5) and the student chip (name, belt and stripe).
2. **The Tower.** One scrolling picture of the climb:
   - Cleared tiers have lit windows. Each tier's roof is its belt colour.
   - The student stands on the current tier, which has a soft glow and a "you are here" pin.
   - The next tier waits in mist, with a small door. Higher tiers are plain grey shapes, so no red tiers are in view.
   - Up and down buttons scroll the Tower.
3. **The Gate, beside the current tier.** A dotted gold path joins it to the student's tier.
   - Lit locks are gold with a check mark. The next lock is cream with a gold ring and a lantern. Locks still to come are faded.
   - The sundial (classes) and Sensei's Seal (師) sit at the right, after a divider.
4. **Your next class step.** The biggest, warmest card on the screen: "Show Sensei Self-Defense #18 in class", plus when the next class is. Its icon is the same glowing lock as on the Gate, so kids can see the connection.
5. **Next in the game.** A small Tower picture, the game goal (the level), the level bar and the main Enter the Tower button.

## Files

| File | What it is |
|---|---|
| `preview/path-screen-small-667x375.png` (+`@2x`) | Small phone mock |
| `preview/path-screen-large-932x430.png` (+`@2x`) | Large phone mock |
| `preview/path-screen-intro-small-667x375.png`, `preview/path-screen-intro-large-932x430.png` (+`@2x`) | The first-visit intro card, for existing players only |
| `preview/key-numbered-932x430@2x.png` | The large mock with the numbered areas above |
| `preview/before-after-gate-tab.png` | The live Gate tab (844x390 screenshot) next to the new screen |
| `source/make_path_mock.py` | Builds everything. Run it from the repo root. `OLD_GATE=<gate screenshot>` adds the before/after sheet. |

Checks: zero danger-red pixels in all eight mock files. No outside assets: everything is drawn by the script or comes from our own menu2 and player art. The belt on the player cut-out is recoloured to the fixture's rank, the same way the game recolours the belt layer.

## Fix 1 (Manager art gate on 117af550)
- Gate labels are now 11pt on small and 12pt on large. Locked labels use a darker brown ink instead of the soft grey-brown.
- The five Defense locks show just their number (#16 to #20), with "Defense" written once on a bracket underneath. This stops the labels touching at 1x. "David and Goliath" wraps to 3 lines on small.
- "3 of 7 lit" is now 12/13pt. "Classes 15 of 24", "Sensei's Seal" and "Level 12" are now 11/12pt and use the darker ink.
- Tower: each tier wears its belt colour as a sash under the roof and a band at the floor. Kai's tier is also washed in green, and the next tier reads as blue through lighter mist. Far tiers stay grey. The tower is a little narrower on small to make room for the gate row.
- The big card, the path and the banner are unchanged.
- Before/after crops at 1x: preview/fix1-before-after-1x.png (plus a 2x zoom copy).
