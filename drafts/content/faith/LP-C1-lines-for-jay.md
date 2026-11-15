# LP-C1: faith pack lines for Jay

Every new line Jay approves in one go. Scripture, covenants and the creed are copied, not written, so they are listed only by reference. Data: `LP-C1-faith-pack.json`. Checker: `python3 drafts/content/tools/check-lp-c1-faith-pack.py --online`.

## One choice

Section 6.3 of `docs/faith-and-creed.md` says the game uses KJV where the wall differs. The full KJV differs from the wall wording on 9 of 10 verses (for example John 3:3 starts "Jesus answered and said unto him, Verily, verily"). The pack shows KJV (`showText: kjv`); switching any verse to the wall wording is one field.

## Creed Scroll
- description: "The words our class says together."
- found: "The Creed Scroll! Say it with your class."
- sensei: "Which line feels like yours today?"

## FAITH DOES Banner
- description: "A dojo banner. Each belt lights a letter."
- complete: "FAITH DOES! Every letter shines bright!"

| Letter | Word | Lights at | Meaning | When it lights |
|---|---|---|---|---|
| F | Forgiveness | yellow | Forgiving others, just like God forgives us. | F for Forgiveness now shines on your banner! |
| A | Acceptance | orange | Welcoming others just the way they are. | A for Acceptance now shines on your banner! |
| I | Integrity | green | Doing right, even when no one sees. | I for Integrity now shines on your banner! |
| T | Trust | blue | Leaning on God when things feel hard. | T for Trust now shines on your banner! |
| H | Honor | red | Treating others as truly special. | H for Honor now shines on your banner! |
| D | Discipline | red-black | Doing hard things one step at a time. | D for Discipline now shines on your banner! |
| O | Obedience | brown | Listening and following with a willing heart. | O for Obedience now shines on your banner! |
| E | Empathy | brown-black | Feeling with others when they hurt. | E for Empathy now shines on your banner! |
| S | Servanthood | black | Helping others, the way Jesus did. | S for Servanthood now shines on your banner! |

## Verse Scrolls (promotion ceremony)

| Scroll | Promotion | Verse | Covenant | Found line | Sensei |
|---|---|---|---|---|---|
| Love Scroll | white to yellow | John 3:16 | Unconditional Love | A new scroll! God loves the whole world. | Who could you show love to this week? |
| Together Scroll | yellow to orange | Romans 3:10 | Availability | A new scroll! Nobody climbs alone. | Who helps you when the climb is hard? |
| Helping Hand Scroll | orange to green | Romans 3:23 | Prayer | Everyone stumbles. God's light helps us up. | Who would you like to pray for? |
| Gift Scroll | green to blue | Romans 6:23 | Openness | A gift you never have to earn! | What is the best gift you ever got? |
| Heart Scroll | blue to red | Romans 5:8 | Honest | God loved us first, even in the dark. | When is it brave to tell the truth? |
| Fresh Start Scroll | red to red-black | 1 John 1:9 | Sensitivity | Saying sorry lets the light back in. | How does a fresh start feel? |
| Rescue Scroll | red-black to brown | John 3:17 | Confidentiality | The light came to save, not to scare. | Who could you help on a hard day? |
| Sunrise Scroll | brown to brown-black | John 3:3 | Accountability | Born again, like a brand new morning. | What has changed in you since white belt? |
| Wind Scroll | brown-black to black | John 3:5–8 | none | You can't see the wind, but it moves. | Who could you serve today? |
| Summit Scroll | black to black belt | John 6:40 | none | The light carried you all the way up. | Who will you help climb next? |

## Guardian restored lines

- every Guardian: "A piece of the light comes home!"

| Guardian | Tier | Line |
|---|---|---|
| The Lamp Keeper | white | The lanterns glow again. Light wins! |
| The Sun Gardener | yellow | The garden wakes up in the sunlight! |
| The Hearth Cook | orange | The hearth is warm again. Supper's ready! |
| The Stone Giant | green | The Giant is free! Small faith, big win. |
| The River Watcher | blue | The river runs calm and clear again. |
| The Ember Knight | red | The Knight's shield glows warm, not angry. |
| The Echo Mask | red-black | The echoes speak kind words now. |
| The Root Keeper | brown | The old roots drink the light again. |
| The Storm Herald | brown-black | Peace, be still. The storm is quiet. |
| The Lost Lightbearer | black | The Last Light is home. The Tower shines! |

## Where it shows (proposal)

- creedScroll: In the Book's Faith page from the first visit; Sensei shows it once after the first class check-in.
- faithDoesBanner: Hangs in the Home Dojo; one letter lights at each real promotion (ceremony screen).
- verseScrolls: Given on the promotion ceremony screen: found line, verse, covenant, then Sensei. Kept in the Book's Faith page.
- guardianRestored: One line when a Guardian is freed, before its relic scroll from guardian-faith-overlay.json.
