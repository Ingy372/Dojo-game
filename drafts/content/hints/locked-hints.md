# L-PREMIUM-a: locked-item hints

Data: `locked-hints.json`. Checker: `python3 drafts/content/tools/check-locked-hints.py` (reads the ids from content/, so a new item fails until it gets a hint).

| Category | Items | Unlock source |
|---|---|---|
| Trophies (Trophy Case cubbies) | 17 (ready + 4 kata stances, 2 kick combos, 10 self-defense) | Teacher sign-offs (abilities.json) |
| Decorations | 38 (8 tower, 5 random, 13 class, 3 stickers, 3 keeper statues, 5 trophies, 1 screen) | earning.ts, decorations.json, named.json |
| Monster Journal cards | 8 (5 monster kinds, 3 named) | earning.ts journalKinds, named.json |

Not hinted, because they're never locked: the 3 starter decorations, Beginner's Stance, and Virtue stripes (shown only once earned).

Every hint states the real unlock rule (in `unlock`). Class-earned items point to real classes. Monster items say "Free", matching the story (no one is beaten up, they're freed).

## Programmer notes
- Trophy cubbies are keyed by the curriculum requirement id in code; these hints are keyed by the game ability id (stance/strike/seal). Map requirement → ability when building.
- Named Journal cards keep the name hidden ("?"), so their hint doesn't name the monster. Their stickers do name it (stickers already show the name).
- trophy-case.json `askSensei` ("Ask Sensei about this one") can stay as the status line; the hint is the tap line.

## Questions
1. abilities.json notes say belt N's kata unlocks stances[N], but stances[1] (Open Leg) has its own sign-off. Which kata unlocks Cat Stance? The hint ("your next kata") works either way.
2. Class pieces come in a fixed order. One shared hint for all 13 is fine for now; if L-PREMIUM-d ("2 more classes") is approved, the next piece could get a count.
