# Q2: Character creation and art readability on phones

## Delivery Note
- **ITEM:** Q2, covering character creation and the Batch 4–7 art at phone sizes (main 6df6a0a).
- **WHAT:** I ran character creation at 844x390 and 667x375 (3x) with the new white-belt and green-belt profiles. I tried each option, ran an automatic check for text going off-screen (found none), then played tower rooms and the boss room. Batch 7 isn't in the game yet, so I judged it from its preview sheets, shrunk to game size. Creation fits and is safe. There's no name typing and no real data. The main issues are some text-only labels and one contrast case.
- **WHY:** The Manager's Q2 check, before more kids use creation.
- **DECIDE:** (1) Keep the body labels "Boy"/"Girl", or switch to neutral labels or pictures? (2) Give the eye and hair labels pictures, or leave the numbers?
- **NEXT:** Artist or Programmer: the small fixes below. Jay: one real-phone pass with a child.

## Bugs (most serious first)
1. **Boss health bar covers the Floor Keeper at the start**
   - What I did: opened the boss room (`?room=keepers-hall`, tier 1 and `?tower=t2`) at 667x375.
   - What happened: the Keeper stands at the top, and the purple health bar and "Floor Keeper" label sit right on top of it. You can't see the boss until it walks down. Screenshots: `/workspace/qa/q2/667x375-game-room_keepers-hall_seed_3.png`, `/workspace/qa/q2/667x375-game-tower_t2_room_keepers-hall_seed_3.png`.
   - What should have happened: the bar sits above the boss, or the boss starts lower, so a kid sees what they're fighting.
   - Severity: **ANNOYING**
2. **Darkest skin with dark eyes is hard to read**
   - What I did: picked the darkest skin swatch, then tried the faces.
   - What happened: the dark eyes and mouth nearly vanish into the skin at 667x375. Screenshot: `/workspace/qa/q2/667x375-1-white-belt-new-3-create-var.png`.
   - What should have happened: the face features stay readable on every skin. A light outline or highlight in the eyes would do it.
   - Severity: **SMALL** (it matters for fairness, so worth fixing)
3. **The "Eyes 3" / "Hairstyle 7" labels need reading**
   - What I did: tapped through the options as a non-reader would.
   - What happened: the arrows and live preview work fine without reading. The labels are only words and numbers, though, and the black hair swatch is hard to see on the dark panel.
   - What should have happened: a small picture, or no label. Give the dark swatches a light border.
   - Severity: **SMALL**
4. **The body choice is labelled "Boy"/"Girl"**
   - What happened: the only two bodies are named by gender.
   - What should have happened: a design call for Jay. Options are "A"/"B" or just pictures, so no kid feels they're picking the wrong one.
   - Severity: **SMALL**

## What passed
- **Steps:** title, then create, then "Let's go!", then the home dojo "Bow". Each screen has one big obvious button. "Bow as you enter your dojo" is clear. Screenshot: `/workspace/qa/q2/844x390-1-white-belt-new-6-after-create.png`.
- **Fit:** nothing goes off-screen or gets clipped at either size, for either profile, and there are no page errors.
- **Names and inputs:** there's no text box anywhere. Names come from fake test students ("Sam T.", "Kai M."). There's no real student data and nothing a kid can type.
- **Batch 4 tower rooms:** the floors are light and calm, and the dark navy enemies and red danger circle stand out well. Screenshot: `/workspace/qa/q2/667x375-game-room_bamboo-hall_seed_3.png`.
- **Batch 5 boss door:** I only saw it in the artist's preview (`/workspace/qa/q2/batch5-boss-door-room.png`). It wasn't on screen in my shots, so check it in a real floor run.
- **Batch 6 custom player:** the custom look (girl, red hair) carries into the game and reads clearly at small size.
- **Batch 7 dojo people** (preview only, not in game until milestone 6): at real size (`/workspace/qa/q2/batch7-lineup-phone-scale.png`) the belts and gi colours are easy to tell apart and the people are friendly and age-appropriate. The kohai is very small and has red hair like many custom players, so it could be mistaken for the player.

## Playability note
- **6-year-old:** can make a character by tapping arrows and watching it change, and "Let's go!" and "Bow" are easy. Can't read "Hairstyle 7", and that's fine. Would ask "where's the boss?" in the boss room.
- **12-year-old:** enough choice to feel like "mine". Might want more bodies or outfits.
- **Adult:** safe, with no typing and no real data. The open questions are the gender labels and the dark-skin contrast.
- **What a headless browser can't judge:** colour on real phone screens and in bright light, whether small fingers hit the arrows reliably, and how kids actually feel about the choices.

Key screenshots:
- `/workspace/qa/q2/667x375-4-green-belt-1-create.png`
- `/workspace/qa/q2/667x375-1-white-belt-new-3-create-var.png`
- `/workspace/qa/q2/844x390-1-white-belt-new-6-after-create.png`
- `/workspace/qa/q2/667x375-game-room_keepers-hall_seed_3.png`
- `/workspace/qa/q2/667x375-game-room_bamboo-hall_seed_3.png`
- `/workspace/qa/q2/batch7-lineup-phone-scale.png`
