**ITEM.** PB-15 placeholders for the unlock card and Sensei's Trial room. Not final art. Not imported.

**WHAT.** Code-drawn shapes only. No letters in any picture. No Sensei figure. Sizes are stand-ins until PB-13 sets the real ones. There was no older unlock or Trial picture in the repo, so the left side of `preview/before-after.png` is empty.

| File | Size | How the Programmer would use it |
| --- | --- | --- |
| `sprites/unlock-card-frame.png` | 256 x 256, transparent | The unlock card. The round hole is where the technique picture sits. For a Seal, that picture is a PB-07 family medallion. The ring is one flat colour, `(196, 168, 120)`, so it can be tinted. |
| `sprites/unlock-card-frame@2x.png` | 512 x 512, transparent | The same card at double size. |
| `sprites/trial-backdrop.png` | 640 x 360 | A short calm training room: wall, a soft light, a wood floor. Stand-in size. |
| `sprites/prop-mat.png` | 280 x 140, transparent | A mat to lay on that floor. |
| `sprites/prop-pad.png` | 72 x 120, transparent | A small training pad. |
| `preview/before-after.png` | review sheet | Empty frames on the left (nothing existed). New pieces on the right. |
| `preview/sizes-30-36-40.png` | review strip | The card at true 40, 36, and 30 px. |
| `source/placeholders.py` | script | Draws every file above. |

**WHY.** PB-15 asks for one unlock card frame with a spot for the technique picture, and one Trial room backdrop and prop set that reads as a short training room. PB-13 has not set sizes or layout yet, so these are placeholders the Programmer can stand in.

**DECIDE.** Manager, are these the right three pieces to stand in until PB-13 sets sizes? The open choices are listed below. This note does not authorize import or merge.

**NEXT.** Wait for PB-13's sizes. Then replace these stand-ins. Do not import from this note.

Checks: 0 danger-red pixels on every file. The card's centre and its outer corners are transparent. The card's hole still reads at 30, 36, and 40 px. No person is drawn, so there are no fingers or toes to check. No words are painted.

Open questions (not guessed as final):

1. PB-13 has not set the card size, the room size, or the layout.
2. Is the empty spot always a circle, because Seals use the round PB-07 medallions, or does a Strike or a kata power need a different spot?
3. Should the Programmer tint only the ring, or the whole card, when the student's rank changes?

The review-sheet crop is fixed so the training pad shows in full, and PB-15 is on hold.
