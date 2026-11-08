# Delivery Note — J16 Ember Knight shifted form, draft B

**Draft. Not approved. Not for Jay yet. Do not import. Do not merge as final art.**

**ITEM:** J16 — draft B of the Ember Knight's shifted form. The shield centre glows.

**WHAT:** One developed look, from the existing Ember Knight model. The stable label is **Ember Knight — shifted form**. **Warm Shield** is still a placeholder name. Shown next to the phase-3 knight at the game's 48 px per tile, on the real Ember Kitchens floor, plus a large close-up. No sprite sheets. No game code. The 1 second glow is unchanged.

**WHY:** The three early ideas were not ready to show Jay. This pass develops B only: the same knight, readable at phone size, with the glow kept in the centre of the shield.

**DECIDE:**

1. Is this B ready to show Jay, or does it still need a change?
2. Is the placeholder name **Warm Shield** okay?
3. Is the Sensei line okay? "Look. The armor cooled."
4. The steady glow stays in the shield centre. Say if you also want a picture where the whole armor glows.

**NEXT:** Manager reviews these pictures. Nothing here is imported. Wiring the shift into the fight is a later item.

## What changed on B

- Eyes are the same ovals as the phase-3 knight (same size in the model), with a white shine and a dark rim so they read. The black visor stays off.
- A dark copper socket sits behind each eye. It is the same copper, not the old visor bar.
- Helm, shoulders and body stay one copper. A wider light-and-shade step, honey seams, and a thicker dark outline keep them from melting together.
- The shoulders are the same round plates as the phase-3 knight.
- The bar rests down, out to the side, on its own arm, with the honey ball at the bottom.
- The shield is lowered to the chest. Only the centre glows (`#ffd08a` around `#fff1b8`).

## Where the brief and the review ask for different things

Reported here instead of picking a new colour or bringing the visor back.

- The brief paints the helm, body, shoulders and bar with one copper, `#c9824a`. The review asked them not to look flat. This draft keeps that one hex. The plates use a wider cel step than the house kit (house shadow is 66% and the lit step starts at 0.47; these plates use a shadow around 0.36–0.46 and a later lit step). The outline on the body is 0.042. The house outline is 0.013, and the concept script draws it at 0.026.
- The brief removes the black visor. The phase-3 eyes read as large because that visor sits behind them. These eyes are the same mesh. At 48 px per tile they are only a few pixels tall. On the close-up they are clear ovals. On the phone-size floor they still read as two eyes, smaller than the phase-3 face.

## Phone-size check (second look at the real pixels)

At 48 px per tile, on the kitchen floor:

- Eyes: two light ovals with a dark rim. Small, and still two eyes.
- Shoulders: two round bumps, separate from the helm.
- Bar: a lowered stick off to the right, honey ball at the bottom, its own outline.
- Shield: the bright spot is the centre, not the whole disc, and not a circle on the floor.
- Danger-red pixels: 0. Old hot orange and draft red: 0. Nothing is cut off by the frame.

## Kept, not thrown away

- `superseded/pass-1/` — first try, honey lines were dots.
- `superseded/pass-2-three-way/` — the three-idea review (A, B, C).
- `superseded/pass-3-contrast/` — B after the outline pass, before the eye sockets.
- A and C Blender files and stills are still in `source/` and `renders/`.
