# Delivery Note: A2 Form stances (samples)

**ITEM:** A2 Form stances. These are stance idles for **Rooted Form** (Basic Form 1) and **Flowing Form** (Basic Form 2), the two Forms that already exist (`docs/decisions.md`, `content/abilities/abilities.json`).

**WHAT:** 3 looping stance idles on the approved player rig, for both bodies, in 8 directions with all 32 layers. The gi is still tinted and the belt is still its own neutral layer.
1. `stance_rooted`, Rooted Form option A: a low, wide fighting stance. The feet are about two shoulder-widths apart and a long step deep, the knees are out over the toes, the hips are sunk, the back is upright, the weight is 50/50 and the guard is compact. It breathes slowly (1.5 s loop).
2. `stance_rooted_back`, Rooted Form option B: a back stance (kokutsu-dachi). About 70% of the weight is on the bent back leg, the front foot points at the opponent, the back foot is turned out, the hips are side-on and there is a forward guard (1.5 s loop).
3. `stance_flowing`, Flowing Form: a shorter, more bladed stance on the balls of the feet. It makes two small springy bounces and a gentle rock forward and back, with a looser and lower guard (0.8 s loop).

Previews are in `preview/`. Start with `review-2-technique-3x.png`.

**WHY:**
- Rooted Form is about "feet planted": a strong, balanced stance with a better counter window and more Guard, but slower.
- A wide, low base and a calm breath show that it is hard to move. The back stance is the classic defensive stance for blocking and countering.
- Flowing Form is about "light on your feet": faster movement and attacks. A short stance, weight on the balls of the feet and a rhythmic bounce show that it is ready to move.
- I checked the technique from the front and the side: the knees track the toes, the back stays upright, the head is level and the eyes stay forward, and the feet never slide.
- The rig, gi and belt layers are unchanged.

**DECIDE:**
1. **Rooted Form: option A (wide fighting stance) or option B (back stance)?** (Jay.)
2. The animation ids `stance_rooted`, `stance_rooted_back` and `stance_flowing` are working ids, not names. Any player-facing names go to the Content Writer.
3. When to show a stance idle is the game's call. My suggestion is to use it in place of the guard idle while a Form is equipped, in fights and in the Tower. Whether it should also show in the dojo or home is for Jay and Claude Code.
4. Whether walk, strike and the others should get Form variants too. I haven't made any; the guard versions still work with every Form.

**NEXT:** Once Jay picks the Rooted option, I'll make the chosen pair final, drop the unused option, and add a short transition from the guard into the stance if wanted. Later Forms follow S3.
