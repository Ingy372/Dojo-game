# L17-C Street Smarts first drafts (for Jay to read and edit)

DRAFT. Jay gave the go-ahead on Nov 16 (t1031u): "i give you permission to do a first round draft on it all. ill read and edit anything i dont like."

There's one new location for each launch age band (core-design section 13: ages 6-9 and 10-13). The store scenario (6-9) is already in the game.

| File | Age | Place | What it teaches |
|---|---|---|---|
| `park-treat.json` | 6-9 | Park | Say "No thank you" to a treat from a grown-up you don't know, go straight to your grown-up, and tell them. |
| `busstop-ride.json` | 10-13 | Bus Stop | Wait where people can see you, keep away from the car, use a loud "NO", and tell the crossing guard or bus driver. |

Both scripts are calm and friendly. Nobody grabs, chases or threatens. The stranger or driver is an ordinary person and just leaves. Each script has 3 stars, a badge and a town light (looks only), and there's no power or fight bonus (your Nov 14 answer). Every line is 8 words or fewer. They follow your J11 answers: Mom or Dad, the family's secret word, and safe helpers in uniform.

## Questions for Jay
1. Is a treat at the park right for 6-9, or would you rather it be a lost puppy or a ride?
2. The 10-13 driver says "Mom asked me to pick you up." Is that okay at this age?
3. The 10-13 Sensei ends with "Awareness is your first defense." Does that match what you say in class?
4. Badge names are "Park Badge" and "Bus Stop Badge". Keep them simple, or name them?

## Notes for the Programmer (later, after Jay approves)
- `ui.json` `speakers` needs these new speakers: stranger (shown as "Grown-up"), driver, and guard (shown as "Crossing guard").
- `pickGrownup` says "at the store", so each location needs its own line, for example "Who are you at the park with?"
- New scene kinds `awareness` and `get-help` already load. `badge` and `townLight` are new fields.

Check: `node --experimental-strip-types drafts/content/tools/check-street-smarts.mjs` loads both scripts with the game's own loader and checks the 8-word limit and banned words.
