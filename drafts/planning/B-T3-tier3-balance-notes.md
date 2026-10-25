# B-T3 tier 3 (Ember Kitchens): balance notes

## Supper Rush challenge time limit
- **Number: 90 seconds.** Content: `"challenge": { "seconds": 90, "text": "Clear the room in 90 seconds for a better chest!" }` (the soup-cools flavour can stay in the sign/art).
- **Reason (one line):** Supper Rush has only 8 enemies in 3 waves (vs 13 in Shield Wall at 100 s and 19 in the Gauntlet at 120 s), so 90 s gives about 11 s per enemy, the most generous of the three, which leaves time for the Ladle Lobber's lobs and the Rolling Pin's lane, and missing it only means the normal chest.

### How it compares (from `content/rooms/*.json`)
| Room | Enemies | Waves | Seconds | Seconds per enemy |
|---|---|---|---|---|
| Gauntlet | 19 (14 Swarmer, 3 Shield, 2 Brute) | 4 | 120 | 6.3 |
| Shield Wall | 13 (7 Swarmer, 6 Shield) | 3 | 100 | 7.7 |
| **Supper Rush** | 8 (5 Spark Sprite, Dough Blob, Ladle Lobber, Rolling Pin) | 3 | **90** | **11.3** |

- The Programmer's 110 s placeholder would be 13.8 s per enemy. That's fine but makes the challenge barely a challenge. 90 s still feels like a "rush" while staying the easiest of the three, which fits a kitchen room arriving earlier than late-tier rooms.
- **Fair failure:** the timer only decides the better chest. The room still clears and the run goes on. Keep the challenge wording hopeful ("for a better chest!"), with no "too slow"/"failed" text (R-BAL-12 rule).
- **Check in playtest [GUESS]:** if testers at White–Orange miss it more than about 1 in 3 tries, raise it to 100 s. Don't go below 80 s.
