# Delivery Note — J16 Ember Knight shifted form, draft B

**Draft. Not approved. Not for Jay yet. Do not import. Do not merge as final art.**

**ITEM:** J16 — draft B of the Ember Knight's shifted form, plus a review-only effects pass.

**WHAT:** The knight from the last draft (eyes, shoulders, lowered bar) with gentle effects on top. The stable label is **Ember Knight — shifted form**. **Warm Shield** is still a placeholder name. Effects are separate transparent layers. No sprite sheets. No game code. The white-gold glow still lasts 1 second. There is no flash after it.

**WHY:** Jay, through the Manager, asked for the calmer form to feel cooler. The earlier brief was a still picture and said no sparks, no flame, and no glow on the floor. This pass keeps those limits and adds only soft steam and light that come from the shield core. That is an extension of the still concept, asked for in this review. It is not a new attack and not a new timing number.

**DECIDE:**

1. Is this effects pass gentle enough to show Jay?
2. Is the placeholder name **Warm Shield** okay?
3. Is the Sensei line okay? "Look. The armor cooled."
4. Reduced Motion here is a still core glow and a soft crossfade. Is that the right amount of stillness?

**NEXT:** Manager reviews these pictures before Jay. Nothing here is imported.

## Effects (review only)

Look at `preview/review-b-vfx-strip.png` first. It is a still strip, so the frames can be checked without a video.

- **Shift, normal.** The old form, then 1.0 second of soft white-gold (`#fff4cf`, halo `#ffecaa`). Then the new form, and a small pale cloud rises off the shield core and fades. The cloud is honey and shield-centre colour, not hot orange, not sparks, not a flame, and it does not sit on the floor.
- **Idle, normal.** The shield core slowly brightens and eases back. The body does not move. No loose embers.
- **Reduced Motion.** The same 1.0 second, as a quieter gold and a crossfade. No steam drifting, no pulse. The idle frames are the same still, with a restrained core and rim glow.
- The older form-shift sample used a 0.15 second flash after the glow. This draft does not. Jay asked for gentle, and for no flashes.

Layers, all transparent, same camera as the knight: `layers/fx-core.png`, `layers/fx-rim.png`, `layers/fx-steam-00.png` through `fx-steam-05.png`. The Blender file is `source/ember-knight-shift-b-fx.blend`.

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

## Phone-size check (with the effects on)

At 48 px per tile, on the kitchen floor, and again on the strip:

- Eyes: still two light ovals. The steam stays on the shield, below them.
- Shoulders and the lowered bar: still separate. The effects do not cover them.
- Shield: the bright spot is still the centre. The steam is a soft pale puff that lifts off that centre. At 125 px it is small. The close-up and the strip show the rise.
- Reduced Motion idle is one still. Its two strip frames match.
- Danger-red pixels: 0 on the normal frames and the Reduced Motion frames. Nothing is cut off by the frame. The near-white pixels are the eye shine, already on the phase-3 knight.

## Kept, not thrown away

- `superseded/pass-1/` — first try, honey lines were dots.
- `superseded/pass-2-three-way/` — the three-idea review (A, B, C).
- `superseded/pass-3-contrast/` — B after the outline pass, before the eye sockets.
- `superseded/pass-4-static-b/` — the still B review, before steam and the core pulse. The knight in `renders/` is still that body.
- A and C Blender files and stills are still in `source/` and `renders/`.
