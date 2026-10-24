# S11: A sight and sound warning for each enemy

Manager item S11 (Oct 24): every enemy gets its own warning you can see and hear (a "tell") before it attacks, so kids can learn to read each one.

Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only; no game code or work-board edits. Numbers marked (guess) are mine. No learning-science claims; the Learning Designer reviews the wording.

## What exists today

- **Timing (sim):** every attack already has a wind-up, `telegraphTicks` in each enemy file. The loader refuses anything under 10 ticks (0.5 s) on Standard (`packages/sim/src/enemy.ts` line 109). Difficulty changes only the counter window part (`world.ts` `telegraphTicks()`).
  - Swarmer jab 12 ticks, Shield bash 14, Brute 16, Floor Keeper slam 18 and sweep 22.
  - Elites: swift elites wind up at 0.8× on Standard, but never below `minWindupTicks` 10 (`content/elites/elites.json`).
- **Sight (client):** every enemy uses the **same** red tint (`TELEGRAPH_TINT` 0xff3b30 in `GameScene.ts`) and the same danger area that fills to "nearly full", then pulses for the counter window. Art can add a per-frame glow (`telegraphIntensity`).
- **Sound (client):** every enemy plays the **same** rising tone, `Sfx.windup(seconds)` (`apps/client/src/audio/Sfx.ts` line 106).
- **Named monsters** (draft, `drafts/content/enemies/named-monsters.json`) each have a unique extra tell, like Old Thumper's two stamps. These add to the normal warning.

So the timing is fair today, but all enemies look and sound the same when they warn.

## Rules

- **The sim does not change.** Tells are drawing and sound only. Wind-up lengths, danger areas and counter windows stay exactly as they are, so balance results stay valid.
- **Every tell has 3 parts:** a body pose, the danger shape on the floor, and a sound. A kid can read the attack from any one of them.
- **Never colour alone.** Each enemy's danger area also has its own pattern or edge, for colour-blind players (guess: shapes chosen with the Artist).
- **Never sound alone.** With the sound off, the pose and the floor shape still tell everything.
- **Same start, same end.** Each tell starts on the first wind-up tick and the "now!" cue lands at the start of the counter window, for every enemy and difficulty.
- **Never scary.** No screams or growls. Sounds are short, musical and friendly (guess: keep the synthesized tones in `Sfx.ts`, no audio files needed).
- **Red stays the "danger" colour** for every enemy. Each enemy changes the shape, pattern and sound, not the colour.

## Tell per enemy (guesses for the Artist and the Sound pass)

| Enemy | Attack | Wind-up (Std) | Body pose | Floor shape | Sound | Sensei tip (existing `bestiary.tip`) |
| --- | --- | --- | --- | --- | --- | --- |
| Swarmer | jab | 12 ticks (0.6 s) | Crouches small and shivers | Small dot that fills fast | Quick high "tik-tik" chirp that rises | "Swarmers move fast, but they always show their jab first." |
| Shield Guard | shield bash | 14 ticks (0.7 s) | Lifts the shield high, leans back | Wide half-moon in front, striped edge | Low metal "clang" tick, then a rising hum | "When the shield breaks, the guard is open. Be ready." |
| Brute | swing | 16 ticks (0.8 s) | Raises both arms over its head | Big circle with a thick cracked edge | Deep slow "whum…" that rises | "A winded Brute takes extra damage. Make it chase, then strike." |
| Floor Keeper | slam | 18 ticks (0.9 s) | Rears up tall | Circle in front, dotted edge | Two low drum taps, then a rise | "Watch the ground: a slam hits in front, a sweep hits all around." |
| Floor Keeper | sweep | 22 ticks (1.1 s) | Spins its arms out wide | Ring all around it, wavy edge | A long swirling "whoosh" rise | (same) |

**The two Floor Keeper attacks must look and sound different** from each other, because the safe answer is different (step behind for the slam, step out for the sweep).

## Elites

- **Swift elite:** its own enemy tell, plus a small speed-line flicker and a slightly higher pitch (guess: +3 semitones). Its wind-up is already shorter, so the tell gets shorter with it. Nothing else changes.
- **Guarding elite:** its own enemy tell, plus its existing aura look. No new sound.
- An elite never gets a brand new tell. Kids who know the enemy can still read the elite.

## Guardians (not built yet)

- Guardians (one per belt tier, `core-design.md` line 35) will need tells when they are designed. Same rules: 3 parts, never colour or sound alone, and the two-attack rule from the Floor Keeper.
- (Scope) This PR only fixes the rules for Guardians. Their tell table comes with the Guardian specs.

## Named monsters

- They keep their unique extra tell from the named-monster draft (for example, Old Thumper's two stamps). The extra tell plays **on top of** the base enemy's tell, never instead of it.

## Settings

- **Bigger warnings** (parent settings, guess): makes the floor shapes thicker and the poses stronger. It never changes timing.
- Sound volume for tells has its own slider (guess), so a parent can keep warnings on with music off.

## Done-when

- Each of the 5 attacks above has its own pose frames, floor shape and sound. A screenshot test shows 5 different floor shapes.
- With colour removed (greyscale screenshot), every floor shape can still be told apart (Artist check).
- With sound muted, the pose and floor shape still show; with the screen hidden, the 5 sounds can be told apart (playtest check, guess: 4 of 5 testers).
- The sim's `telegraphTicks`, danger areas and counter windows are unchanged (diff check: no `packages/sim` edits). Balance results don't move.
- The "now!" cue lands on the first counter-window tick on Guided, Standard and Challenge (test with the existing guide tick in `world.ts`).
- Swift elites keep their base tell, plus the speed flicker. Guarding elites keep their base tell, plus the aura.
- No tell sound is louder than the hit sound, and none uses screams or growls (sound check).
- The Learning Designer reads the Sensei tips.

## Scope flags

- **Art:** about 5 pose sets and 5 floor shapes (guess). The Artist sizes this. The client already supports per-frame glow.
- **Sound:** 5 new tone recipes in `Sfx.ts`. `Sfx.windup()` takes an enemy and attack ID instead of one shared tone.
- **Client only.** No sim, save or feed changes.
- Guardians are not covered beyond the rules.
- The "Bigger warnings" setting is new parent-settings UI.

## Decisions needed

1. Keep red as the shared danger colour, with shape and pattern changing per enemy?
2. Add the "Bigger warnings" parent setting at launch, or later?
3. Swift elites: is a higher pitch OK, or do they keep the exact base sound?
