# J16: the final boss in three forms

Draft for Jay. Planning only. No game code, and the work board is not changed.

**The final boss is the Lost Lightbearer**, the Black-belt Guardian at the Summit (`drafts/content/bosses/lost-lightbearer.json`, lore in `drafts/content/lore/10-black.md`). J16 on the work board is the open question about Guardian form shifts (C14, PR #217): the names, whether the shift is at 33% or 66% health, and whether the boss can be hit during the glow. This paper answers that for the **final boss only**. The other Guardians stay as C14 wrote them until Jay answers the rest of J16.

The fight already has three health steps (100%, 66%, 33%) and one new look at the end (Cloud Lantern). This plan makes **each step its own form**, so the player sees the storm let go a little at a time. Same buttons as every other fight. Same health and hit strength already in the file. Measured below.

## What the player is doing

A tired traveler is holding the last piece of the Tower's light. A storm broke the light. No one is to blame. The player helps them finish, the way a class ends by setting the room right together. When the fight ends they are freed, not beaten. The words already in the file stay:

- Intro: "Someone is up here, holding the last light."
- Freed: "You came all this way to help? Now we can finish together."
- Sensei after: "Love brought the light home, and it brought them home too."

The light piece still rises only when the real belt opens the Gate (`drafts/content/lore/10-black.md`). A real promotion stays the biggest celebration.

Faith verses stay in the overlay Jay already approved (`faithOverlayKey: lost-lightbearer`). They are not spoken during the fight.

## No new button

A pass to keep the controls simple is under way. This fight does not add one.

| What you see | What you already press |
| --- | --- |
| Red circle | COUNTER (or step out with the stick) |
| Soft circles, one at a time | Step out with the stick |
| Striped ring with one gap | DASH through the gap, toward them |
| Striped lane (Challenge only, if Jay says yes) | DASH out of the stripe |

STRIKE still works in the rest between hits, the same as every other fight. It is not required. Stance and Virtue are not required. The bow at the door is the bow the player already does. Nothing new appears on the right-hand buttons.

## The three forms

Health steps are the ones already in the file: full, then 66%, then 33%. Each step uses the pause the Hearth Cook already uses. That pause was measured at **18 rules ticks, which is 1 real second** (`PHASE_HOLD_TICKS = realSecondsToTicks(1)` at the game's tempo). During it nothing moves and nothing is hurt. The picture is the white-gold glow already drawn for the form shifts.

Attack names, strengths, and the warning lengths in the enemy file are unchanged. The warning the player actually gets is worked out by the live `telegraphTicks()` rule. Measured:

| Attack | Strength in the file | Warning, Guided | Warning, Standard | Warning, Challenge |
| --- | ---: | ---: | ---: | ---: |
| cloud swirl | 1.0 | 22 ticks | 18 | 14 |
| tired glow | 0.8 | 24 | 20 | 15 |
| light lane | 1.2 | 26 | 22 | 17 |
| storm ring | 1.2 | 28 | 24 | 18 |

A tick is one step of the rules. Standard's 18 ticks of swirl is the 18 already written in the file. Guided holds the warning longer. Challenge shortens it and never goes under 10 ticks. Every Challenge warning above is 14 ticks or more. The rest after each hit stays the file number on every difficulty (swirl 22, glow 26, lane 30, ring 32). Guard does not change with the belt.

### Form 1 — Storm Wrap (full health down to 66%)

The look already on the concept sheet: a small hooded traveler, slumped, hugging a dim warm light, with soft storm clouds at the sides and back. Tired, not angry. No frown, no teeth.

**Attacks.** One move, on a loop: **cloud swirl**.

**Telegraph (three parts, so it still reads with the sound off or in grey):**

- Body: the clouds spin inward. The light stays dim.
- Floor: the red circle already used for "answer this" (areaRadius 1.3 in the file).
- Sound: a short soft tone, the same kind of rising note other wind-ups use. No roar, no scream.

**What the player does.** COUNTER the circle. Stepping out of it also works, with the stick.

**Story beat.** Sensei's line is already in the file: "They are not angry. Only tired." The cloud is heavy the way a student feels before they remember to bow and breathe. Each calm answer lets the light flicker a little brighter. The player is not punishing anyone. They are answering a partner.

**How it changes.** At 66% health the 1 second glow plays. They cannot be hit, and they do not attack. Then Form 2 is standing there.

### Form 2 — Bowing Cloud (66% down to 33%)

Working name for Jay. A rounded storm cloud bends forward, the way a class bows. A warm light sits in the middle. Two small light-eyes. No arms, no mouth, no person, no traveler. Loose cloud-puffs rest near the floor like a belt set down after class.

**Attacks.**

- **cloud swirl**, same red circle, same COUNTER.
- **tired glow**: the light pulses and soft red circles ripple out, **one at a time** (the note already in the file). Step out with the stick. Strength 0.8, so this hit is softer than the swirl.
- **Two Storm Wisps** join when this form starts. They are the same little clouds from the Summit rooms, and their only move is the crackle (a small red circle, COUNTER or step out). The file asks for them 2 seconds apart. The game loader does not read that. Helpers arrive together, the same way the Hearth Cook's sparks do. Only two attackers can swing at once (the rule already in the fight), so the room never becomes a crowd.

The striped lane is not in this form. A dash lane and a red circle at the same time is the overlap the Challenge rule already refuses, and that check does not run on Guided or Standard today. Form 2 keeps every answer as "circle on the floor."

**Telegraph.** Swirl and wisp crackle use the red circle plus their own pose and tone, so they are not the same picture. The tired glow uses a slower pulse, one circle, and a softer chime. The safe spot is outside the circle. The sound is not the only clue.

**Story beat.** Sensei (proposed): "Look. It is bowing." The storm is learning the first thing class teaches. The little wisps are the same ones the player already calmed on the way up. Calm them, then come back to the bow. Nobody is in trouble.

**How it changes.** At 33% health the same 1 second glow plays, again with no hits taken and no attack. Then Form 3.

### Form 3 — Cloud Lantern (33% to the end)

The name already waiting on Jay in J16. A tall swirling cloud shaped like a lantern. Warm gold light through the cracks. Two small light-eyes. No person, no face, no body. This is the concept already drawn (`incoming-art/guardian-concepts`, form shift).

**Attacks.**

- **tired glow**, same one-at-a-time circles, step out with the stick.
- **storm ring**: a striped ring with one gap. DASH through the gap, toward them. The file already says this cannot be Countered. Strength 1.2. The tell is the one already written: purple-and-white stripes, a '!!' mark, and a whoosh. The ring-with-a-gap picture is already in `incoming-art/dash-telegraph`.

The boss does one move at a time. If a Storm Wisp from Form 2 is still up, the ring waits while a red circle covers the player. That wait exists today on Challenge only. For this boss it should hold on Guided and Standard too, so a child is never asked to dash and counter in the same instant. The Hearth Cook's lane is left as it is.

**Challenge only (belt 10; Challenge itself opens at belt 4).** Add the **light lane** that is already in the file: a straight striped lane, DASH out of it, strength 1.2, its own warning (17 ticks on Challenge). It never starts while a red circle covers the player. Guided and Standard do not get this move, so the last form has one dash shape: the ring, which means "go to them."

**Story beat.** Sensei's line is already in the form-shift file: "The light is still there. Go to them." The cloud has pulled in tight, and the light was inside the whole time, like the lantern you can see at the end of a long class. The player dashes through the open gap and goes to them. The clouds thin. The traveler looks up, still holding the piece, and says the freed line. Together they set it on the empty stand. The town can see the lamp. The player's real belt is still the moment that matters most.

## Kept fair for ages 6+

- Every hit has a warning you can see and a warning you can hear, before it lands. Nothing is unavoidable.
- Form 1 teaches one answer. Form 2 adds "step out of the soft circle" and the wisps the player already met. Form 3 adds one dash, toward the boss. Challenge adds a second dash shape only for players who picked the hard setting.
- No teeth, no scream, no blame. Each form is calmer than the one before it.
- At most two attackers swing at once.
- The two glows are a rest, not a trick. A full second, and the boss cannot hurt the player during them.
- Knocking them out uses the same kind screen as any other loss. There is no "you failed" line.

## Balance

No new health, power, guard, strength, or timer. The numbers below were read from the repo and run through the live damage rule:

`damage = at least 1, rounded, of power × strength × 100 ÷ (100 + the target's guard)`

Re-run any time with `python3 drafts/planning/j16-boss-sim.py`.

**Where the fight happens.** Summit rooms open at belt 10 only, and a belt uses its own room set. There is no later belt in the game yet. So this boss is fought at **Black, and only at Black.**

**What a "hit" means here.** The Guardian band (R-BAL-12) is basic hits: the automatic hit, strength 1, into the boss's guard of 30. A Guardian takes **40 to 80** of those, and the player cannot be knocked out in fewer than **5** hits. STRIKE is still the heavier hit the player already has (strength 2.5 in `config.ts`). It is not part of the band, and this plan does not change it.

**The body the three bots share.** In the balance tests, kid, newer, and careful all wear the typical student's Health, Power, and Guard for that belt (`r-challenge-p5.test.ts`). They share one body and differ only in how fast they notice a warning. So the hit table is the same three times. The band rule also checks two other bodies (trains more, and plays only). Those are in the second table, because that is where the band is tightest.

At Black the file's base of 510 health and 16 power becomes **9547 health and 221 power** on Standard and on the live Challenge setting (Challenge does not raise health or power; it shortens warnings). Guided power is **166** (×0.75). Health stays 9547. Players never see these numbers.

### Kid, newer, and careful (typical body, Black)

| Bot | Setting | Basic hits to beat | Hits to KO on the soft glow (0.8) | Hits to KO on the swirl (1.0) | Hits to KO on the ring or lane (1.2) | In band? |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| kid | Guided | 50 | 16 | 13 | 11 | yes |
| kid | Standard | 50 | 12 | 10 | 8 | yes |
| kid | Challenge (live) | 50 | 12 | 10 | 8 | yes |
| kid | Strict check (×1.5) | 75 | 8 | 7 | 6 | yes |
| newer | Guided | 50 | 16 | 13 | 11 | yes |
| newer | Standard | 50 | 12 | 10 | 8 | yes |
| newer | Challenge (live) | 50 | 12 | 10 | 8 | yes |
| newer | Strict check (×1.5) | 75 | 8 | 7 | 6 | yes |
| careful | Guided | 50 | 16 | 13 | 11 | yes |
| careful | Standard | 50 | 12 | 10 | 8 | yes |
| careful | Challenge (live) | 50 | 12 | 10 | 8 | yes |
| careful | Strict check (×1.5) | 75 | 8 | 7 | 6 | yes |

"Hits to KO" means that many clean hits, with no block, knock the player out. The strict column is the R-BAL-12 test's extra Challenge check (health and power ×1.5). The live Challenge fight is the row above it.

### The three student bodies the band rule uses (Black)

| Student | Setting | Basic hits to beat | KO on 0.8 | KO on 1.0 | KO on 1.2 | In band? |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| typical | Guided | 50 | 16 | 13 | 11 | yes |
| typical | Standard | 50 | 12 | 10 | 8 | yes |
| typical | Challenge (live) | 50 | 12 | 10 | 8 | yes |
| typical | Strict check (×1.5) | 75 | 8 | 7 | 6 | yes |
| trains more | Guided | 54 | 18 | 14 | 12 | yes |
| trains more | Standard | 54 | 13 | 11 | 9 | yes |
| trains more | Challenge (live) | 54 | 13 | 11 | 9 | yes |
| trains more | Strict check (×1.5) | 80 | 9 | 7 | 6 | yes |
| plays only | Guided | 50 | 13 | 10 | 9 | yes |
| plays only | Standard | 50 | 10 | 8 | 7 | yes |
| plays only | Challenge (live) | 50 | 10 | 8 | 7 | yes |
| plays only | Strict check (×1.5) | 75 | 7 | 5 | 5 | yes |

Zero cells fell outside the band. The Storm Wisps, at Black, take 2 or 3 basic hits to beat (the small-enemy band is 2 to 4) and need at least 12 hits to knock a player out, including the strict check. That is their own line, and they are on it.

**The final boss stays a normal Guardian.** It does not get a bigger health bar or a harder hit than the band. Two edges are already touching the line, which is why:

- The "trains more" student on the strict check takes **exactly 80** basic hits. That is the top of the band.
- The "plays only" student on the strict check is knocked out in **exactly 5** hits by the ring or the lane (strength 1.2). That is the fewest the rule allows.

The live Hearth Cook's rolling pin is also strength 1.2, and on its own belt it also sits on 5 hits for that strict check. The Summit boss matches a Guardian the game already has. A longer last fight would push the trains-more student past 80 hits. Three forms change the picture and which move is used. They do not add health. The two one-second glows add a rest, not extra hits.

## Art the Artist still needs

Concept sheets exist for the traveler and for Cloud Lantern. They are concept only. Final sprites wait on Jay's OK, same as the other Guardian concepts. Large-creature size from the style guide (256 × 256). Nothing scary, nothing sharp, no red in the body art. Red circles and purple stripes stay the game's own warnings.

| Piece | What to draw | Already exists? |
| --- | --- | --- |
| Form 1, Storm Wrap | Idle, swirl wind-up, swirl, flinch, and the glow that becomes Form 2. Hooded traveler, dim light, soft clouds. | Concept sheet, phase 1. Not final sprites. |
| Form 2, Bowing Cloud | Idle bowed cloud, swirl, tired-glow pulse, flinch, and the glow that becomes Form 3. No person. | Not drawn. New. |
| Form 3, Cloud Lantern | Idle lantern cloud, tired-glow pulse, ring wind-up pose, flinch, freed (clouds thin, light bright). No person. | Concept form-shift sheet and a 1 second glow sample. Not final sprites. |
| Glow | White-gold, about 1 real second, soft chime, then the new form. | Sample already rendered for the four form shifts. |
| Floor warnings | Red circle, one-at-a-time ripple circles, striped ring with one gap. Lane stripes only if Challenge keeps the lane. | Circle and dash stripes exist. Ripple can reuse the circle, drawn one at a time. |
| Storm Wisp | The helper in Form 2. | Planned with the other Black enemies, not this paper's new ask. |
| Freed moment | Clouds thin, both look at the lamp, the piece is set on the stand. Short, hopeful, quieter than a real promotion. | Lines exist. Pictures do not. |

No new button art. No new icon.

## Board items

These are not on the work board yet. One owner each.

| ID | Owner | What | Done when | Waits on |
| --- | --- | --- | --- | --- |
| J16-1 | Content Designer | Write the three forms into the Lost Lightbearer draft: which attacks each form uses, the Sensei lines Jay picks, and the Challenge-only lane if Jay wants it. Leave health, power, guard, and strengths as they are. | The draft shows three forms, every attack name is one already in the file, and `python3 drafts/planning/j16-boss-sim.py` still ends with FAILS 0. | Jay's answers below |
| J16-2 | Dojo-Ascent Programmer | Build the three forms with the Hearth Cook's phase pause. On this boss, a dash move waits if a red circle is on the player, on Guided and Standard as well as Challenge. No new button. Leave the Hearth Cook's lane as it is. | A test shows a pause at 66% and at 33%, no damage during either pause, and the ring does not start on top of a red circle on Guided. The Guardian band test stays green. | J16-1, and Jay's yes |
| J16-3 | Art Director | The three forms and the two glows, in `incoming-art/`, concept until Jay's OK. Reuse the dash stripes and the ring-with-a-gap warning. | A delivery note, sheets, and a phone-size preview. Forms 2 and 3 show no person. No teeth, no red body colour. | Jay's names and look answers |
| J16-4 | QA & Playability Tester | On a phone-sized screen, play Guided at Black with the young-player bot in mind: each form, each warning, a loss, and the freed moment. | A short note naming the answer for each form, and whether any hit felt unavoidable. | J16-2, and J16-3 imported |
| J16-5 | Learning & Engagement Designer | Read the three story beats and the Sensei lines for ages 6+. | A short note: fine, or which line to soften. | This paper |

## Taste calls for Jay

1. **Middle name.** Bowing Cloud is a working name. Cloud Lantern is the last form, already in J16. Keep both, or rename the middle one?
2. **Both steps, this boss only.** A new look at 66% and again at 33%, so the Summit boss has three forms. The other Guardians stay on the single shift at 33% until you answer the rest of J16.
3. **The glow is a safe second.** You cannot be hit, and they do not attack. The Hearth Cook already pauses this way. Same for the Summit boss?
4. **One dash for most players.** Guided and Standard end on the ring ("go to them"). The straight lane is Challenge only. Or should every difficulty get the lane too?
5. **Who we see.** Form 1 keeps the small hooded traveler from the concept sheet. Forms 2 and 3 stay clouds, with no person, as the form-shift brief says.
6. **The rest of J16 stays open.** Pebble Heart, Bloom Gardener, Quiet Thunderhead, and whether Ember Knight gets a shift too, are not decided here.
7. **Older outline.** An earlier bestiary note described "shadow echoes of earlier Guardians" instead of these four moves. Those echoes have no measured strength or warning. This plan uses the four moves already in the boss file. Say if you want the echoes instead, and that will be a new measurement before any numbers are written.
