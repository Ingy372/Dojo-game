# The Loom Keeper: the Yellow Guardian (for Jay's OK)

Jay picked the Loom Keeper on Nov 25 (the three ideas are in `docs/yellow-guardian-ideas.md`) and OK'd this version the same day. **Built Nov 25** (steps 1–4 below; the Blender model is still to come). Changes made while building are marked **[Built]**.

## Where it lives

- **The Yellow floors keep their Sunrise Garden art** (already made). In the story the garden is the tailor's dye garden, where the flowers for dyeing gis and the cotton for blankets grow. That gives the floors and the boss one story.
- **The boss room is the weaving loft** at the top of the garden: wooden beams, a big loom, bolts of cloth, spools on the walls.

## How it looks (for the Blender model)

- A tall figure made of grey cloth, like a long coat with no one inside, with a giant wooden spool for its "hands" and loose threads trailing behind.
- Kid-friendly, never scary: no face, just two soft glowing eyes in the hood, like the other Shadows.
- **Two looks, like the Floor Keeper:** at one third of its health the grey coat tears away and the spool glows brighter (the transformation flash the other bosses already use). Only one model is needed.
- About the same size as the Floor Keeper (the usual Guardian 1.5x scale).

## The fight

A step above the Floor Keeper (three moves instead of two) and a step below the Hearth Cook (no helpers called in). Every move warns first, and only one move happens at a time.

| Part | When | Moves | What the player does |
|---|---|---|---|
| 1. Spool | From the start | Spool Drop | COUNTER |
| 2. Threads | From two thirds of its health | Spool Drop, Thread Line | COUNTER the spool, DASH across the threads |
| 3. The Big Cloth | From one third (the coat tears) | Thread Line, Big Cloth, Spool Drop | Stay in the bright half, DASH across threads |

**The three moves**

1. **Spool Drop:** it lifts the spool high and a red circle appears under the hero, then the spool slams down. COUNTER it. Same timing as the Floor Keeper's slam, so Yellow belts start on something they know.
2. **Thread Line (new kind of attack):** a dark thread stretches wall to wall across the room through where the hero stands, drawn as the purple-and-white stripes with "!!" and a twang. DASH off the line before it snaps. In part 3 the threads come both across and up-and-down, one at a time. It can't be countered, the same rule as the Hearth Cook's rolling pin.
3. **Big Cloth (new kind of attack):** a dark cloth slowly slides over the half of the room the hero is in. Its edge glows for a full 1.5 seconds before it lands (longer on Guided). Walk or DASH into the bright half. **[Built]** The cloth covers the hero's side and stops 1.8 tiles past the hero, so one Dash or a short walk always gets out (the game's rule for every Guardian attack). The warning is always drawn on top, so the cloth never hides another warning, and it never comes at the same time as a red circle.

**Starting numbers** (the balance test sets the final ones): health 520 (Floor Keeper 495, Hearth Cook 549), Power 17, Guard 30, good clear time 25 seconds. **[Built]** Health is 490: at 520 a strong Yellow belt needed 84 hits, over the 80-hit limit for bosses. Two small waves of Swarmers come into the loft, as in the other Guardian rooms, so the fight lasts about as long as theirs (about 12 seconds for a typical player). The Loom Keeper itself still calls no helpers.

## Every line (all 8 words or fewer)

| Who | When | Line |
|---|---|---|
| Sensei | At the boss room door | "Someone used to sew warm things here." |
| Sensei | Part 1 starts | "The spool goes up first. Ready." |
| Sensei | Part 2 starts | "Threads pull tight. DASH across!" |
| Sensei | Part 3 starts | "Watch the glowing edge. Stay bright." |
| Sensei | After the win | "Warm things are made to be shared." |
| The tailor (in town) | After her shop reopens | "Take a blanket. Someone out there's cold." |

**Monster Journal**
- Tip: "Spool, then threads, then the big cloth."
- About it: "Darkness settled on the tailor's loom and took her shape. It weaves grey cloth that warms no one."

**For Jay to decide**
- **The tailor's name.** She is a new townsperson. Claude suggests "Miss Ada" as a draft.
- **Faith tie-ins** stay out until you decide, as with the other Guardians.

## The story link

- Beating the Loom Keeper frees the Yellow belt's great piece of the light and reopens the tailor's shop in town.
- The blanket the hero gives Eli at the Yellow Gate comes from her shop (Availability lived out). That scene is part of the story chapters and is built with them, not here.

## What gets built, in order (after your OK)

1. **The two new attacks** (Thread Line and Big Cloth) in the game rules, with tests that check they always warn and are always avoidable.
2. **The Loom Keeper** and the weaving loft, using a simple code-drawn stand-in for now, so you can play the fight on your phone right away.
3. **The Yellow floors' own 7 rooms** using the Sunrise Garden art, then the switch that turns them on. Yellow belts stop meeting the Floor Keeper again.
4. **Balance:** the bots tune its health and damage so it sits between the two other bosses.
5. **The Blender model and animations,** for your OK, then they replace the stand-in.
6. A preview link with exactly what to try.

Steps 1–4 need nothing more from you after this OK. Step 5 needs your eye.
