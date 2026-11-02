# DELIVERY NOTE: G2 Insight picker re-skin (SAMPLES)

**ITEM:** G2, the Insight picker, re-skinned in the warm Board kit (#412) with the catalog look (#422). Three samples for Jay, plus one bonus strip. SAMPLES only: no final sprites yet, no game code touched.

**WHAT:**
- `preview/01-picker-844x390`: the picker screen. Wood wall, title plaque, three paper cards with a family ribbon, icon, name and text, and the "held this run" tray under them.
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

**WHY:** Today the picker is plain panels over the live room, with the HUD showing through. Paper cards in the wood mood match the rest of the Board, and the ribbon makes the family clear without relying on colour alone (the word is on it).

**DECIDE:**
1. **Power ribbon colour.** The game's Power colour is orange, and orange is only for ENTER THE TOWER. I used a soft orchid (210,140,200). Rooted (blue), Flowing (green) and Virtue (gold) are unchanged. OK, or another colour?
2. **PLACEHOLDER: held-tray label.** "Your Insights this run" is my wording; the repo has none. Give me the words, or approve this.
3. **One tap or confirm.** The game picks on one tap (with a short guard against early taps). I kept it, and the stamp is the "confirmed" feedback. Do you want a Confirm button? I would not add one: it is slower for kids.
4. **Backdrop.** The samples use the wood wall under a warm wash. The alternative is the paused room dimmed. The wall is calmer and hides the HUD. Which?
5. **Name colour.** The game colours each name by family. On paper I use dark ink for names and let the ribbon carry the family. OK?
6. **The stamp has no word on it** (a check mark only). Add a word, or leave it?
7. **Per-Insight accent border.** The old card had one. I dropped it so the ribbon is the only colour. OK?

**NEXT:** after your answers: export text-free sprites (card, ribbons, stamp, burst, tray) with a layout JSON for the Programmer, as was done for #422, and the 3-frame pick shot from the real game.
