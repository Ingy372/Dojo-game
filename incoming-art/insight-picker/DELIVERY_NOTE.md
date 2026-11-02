# DELIVERY NOTE: G2 Insight picker re-skin (SAMPLES)

**ITEM:** G2, the Insight picker, re-skinned in the warm Board kit (#412) with the catalog look (#422). Three samples for Jay, plus one bonus strip. SAMPLES only: no final sprites yet, no game code touched.

**WHAT:**
- `preview/01-picker-844x390`: the picker screen. The paused room dimmed behind it (see v2), title plaque, three paper cards with a family ribbon, icon, name and text, and the "held this run" tray under them.
- `preview/02-card-close-up`: one card up close (Press the Advantage), with the four family ribbons and the size and text notes.
- `preview/03-picked-stamp-844x390`: the picked state. The tapped card lifts and gets a gold star burst with a stamp. The other cards dim and sit lower. The new Insight joins the held tray with a gold dot.
- `preview/04-pick-three-frames` (bonus): lift, stamp, close, and the reduced-motion rule (no slide, no lift, just a highlight).
- Each is saved at 1x and @2x. `source/build_insight_picker.py` rebuilds them (needs `incoming-art/tools/board_ui_kit.py` and the icons in `incoming-art/icons/sprites/`).
- Spec: `drafts/planning/R-BENCHMARK.md`, item 2 (`docs/work-board.md` has no G2 entry). Done-when: paper cards, family ribbon, held row after the first pick, 3-frame pick shot. All four are shown.

**Real words only** (nothing invented in the game text):
- Title "Choose an Insight" and line "It lasts for this run." come from `apps/client/src/ui/InsightPicker.ts`.
- Names, text and families come from `content/insights/insights.json`. The family label is the family name in capitals, as in the game.
- Insights used: Ripple Counter, Iron Skin, Wind Step (picked), Quick Hands and Heavy Hands (held), Press the Advantage (close-up).

**Rules met:** no red anywhere, no orange (the Double Strike icon is orange, so it is not shown). Smallest text is 12 px (the placeholder note). Card text is 16, names 20, ribbons 13. Each card is 232 x 215 pt, and all of it is the button (minimum 44 pt). Ribbon text is dark ink on all four colours (contrast 4.3 or better). One tap picks, as in the game. Held chips are display only.

**WHY:** Today the picker is plain panels over the live room, with the HUD showing through. Paper cards over the dimmed room match the rest of the Board, and the ribbon makes the family clear without relying on colour alone (the word is on it).

## v2 (calls on #426, no export)
- **Backdrop is now the paused room, dimmed** (Archero-style), instead of the wood wall. It is the real Tower room kit (`tower-rooms/sprites`: flagstones, wall, two doors, pillars) at the game's 48 pt tile, under a deep cool dim and a soft vignette. No HUD is drawn: the room is paused and the dim hides it. The wood wall is gone from all four previews.
- Re-rendered `01`, `02`, `03` and `04` (1x and @2x). Cards, ribbons, stamp and words are unchanged.
- Rules re-checked: red check on the four @2x previews is 0 pixels; no orange; smallest text still 12 px; tap targets still 44 pt or more. Only the gold treasure doors and grey stone are used from the room kit (no red battle door).
- Placeholder label stays marked: the preview still prints "The label on the left is a placeholder."

**DECIDE (answered by Jay on #426):**
1. DECIDED: orchid Power ribbon, OK (rgb 210,140,200). Rooted blue, Flowing green and Virtue gold are unchanged.
2. DECIDED: the held-tray label "Your Insights this run" is OK as a placeholder. It stays marked as a placeholder in the preview until the real words are given.
3. DECIDED: one tap picks, no Confirm button. The stamp is the "confirmed" feedback.
4. DECIDED: the backdrop is the paused room dimmed (done in v2).
5. DECIDED: names in dark ink; the ribbon carries the family.
6. DECIDED: the stamp is a check mark with no word.
7. DECIDED: the per-Insight accent border is dropped; the ribbon is the only colour.

**NEXT:** all seven calls are made. Waiting for the go-ahead to export (not done yet): text-free sprites (card, ribbons, stamp, burst, tray) with a layout JSON for the Programmer, as was done for #422, and the 3-frame pick shot from the real game.
