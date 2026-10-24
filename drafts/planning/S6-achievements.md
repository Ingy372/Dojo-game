# S6: Achievements

Work board S6: the full list of achievements, with categories, thresholds and what each one awards (titles, trophies, decorations, cosmetics). It separates certified real-world trophies from game trophies and covers the bow-question awards (5/10/20/50/100). No achievement may reward daily logins or punish missed days.
This spec unblocks **C6** ("Names and text for achievements and items"). The **"For C6"** section lists exactly what to write.
Author: Dojo-Ascent Researcher & Planner, 2026-10-24. Plan only; no game code or work-board edits. Numbers marked (guess) are mine. No learning-science claims; the Learning Designer reviews this.

## Rules

- **Never counts logins, play days, days in a row or time played.** Counts are totals that only go up. Nothing is lost, reset or timed.
- **Real achievements are certified.** They come only from the DojoForge feed, carry a seal with the date earned, and can't be earned in the game (`core-design.md` line 488, `decisions.md` line 262).
- **Rewards are cosmetic** (titles, trophies, decorations, gi colours or trims, banners). The only exceptions are effects already set elsewhere: Street Smarts power (`core-design.md` §12) and the streak aura (S9).
- **All achievements are visible from the start** with a "how to earn" line. There are no hidden ones and no "% of players" stats. Visitors see trophies, never counts.
- **Unlock pacing:** the achievement list (the trophy wall's "Goals" page) opens after the first floor clear. Families for 4th-belt systems (elites, Challenge) show only from 4th belt (§13).
- **Lower belts aren't behind.** Thresholds are totals, so they never compare students.

## The list

**ID pattern:** `ach.<category>.<key>`. For families, `<n>` is the threshold, and `<belt>` uses the belt ids in `fixtures/3-yellow-belt.json` `school.belts`:

`white, yellow, orange, green, blue, red, red-black, brown, brown-black, black`

**Reward codes:**

- **T** = title
- **CT** = certified trophy (decoration with a seal and date)
- **GT** = game trophy (decoration)
- **D** = decoration
- **C** = cosmetic (gi colour, trim or aura)
- **B** = banner

### 1. Dojo (real, certified): source is the DojoForge feed (`packages/sim/src/feed.ts`)

| ID | Threshold | Feed source | Reward | Launch? |
| --- | --- | --- | --- | --- |
| `ach.dojo.promotion.<belt>` (9: yellow → black) | Promoted to that belt | `rank.history` | CT belt trophy | Yes |
| `ach.dojo.stripes.<n>` (1, 5, 10, 20) | Stripes earned, total | `stripes` | CT; T at 10 and 20 | Yes |
| `ach.dojo.classes.<n>` (10, 25, 50, 100, 250, 500) | Classes trained, total | **Needs a new feed field `classesTotal`** (scope flag); until then, S7's `classesCounted` | CT; T at 100, 250, 500 | Yes |
| `ach.dojo.weeks.<n>` (5, 10, 20, 50, 100) | Weeks trained (S9 `weeksTrained`) | `attendance` | Aura step (S9); CT at 50 and 100 | Yes |
| `ach.dojo.anniversary.<y>` (1, 2, 3, 5, 10) | Years since `rank.trainingStartDate` | `rank` | CT; T at 5 and 10 | Yes |
| `ach.dojo.signoffs.<n>` (1, 10, 25, 50) | Technique sign-offs, total | `requirements` + `catchUp` | CT at 1 and 50; GT otherwise | Yes |
| `ach.dojo.practice.<h>` (1, 5, 10, 25, 50 hours) | Approved home practice | `homePractice.approvedMinutes` | D (practice gear); T at 25 | Yes |
| `ach.dojo.accolade.<slug>` (template) | Any accolade, e.g. Student of the Month | `accolades` | CT using the accolade name; T "Student of the Month" | Yes |

### 2. Sensei's Questions (the bow recall): from `decisions.md` K1

| ID | Threshold | Reward | Launch? |
| --- | --- | --- | --- |
| `ach.bow.correct.<n>` (5, 10, 20, 50, 100) | Correct answers, all-time | 5: D (small scroll), 10: GT, 20: C gi trim, 50: T, 100: T + GT | Yes |

Wrong answers never count against you. At most one question a day already applies, and missing a day changes nothing.

### 3. Tower (game)

| ID | Threshold | Reward | Launch? |
| --- | --- | --- | --- |
| `ach.tower.guardian.<belt>` (10) | Defeat that tier's Guardian | GT + T "<Tier> Champion" (`framework.md` line 223) | Yes |
| `ach.tower.floors.<n>` (1, 10, 50, 100, 250) | Floors cleared, total (`profile.floorsCleared`) | 1: D, others GT; T at 250 | Yes |
| `ach.tower.perfects.<n>` (10, 100, 500, 1000, 5000) | Perfect Counters, total (new counter) | GT; C trim at 1000; T at 5000 | Yes |
| `ach.tower.combo.<n>` (10, 25, 50) | Longest combo (`bests.longestCombo`) | GT | Yes |
| `ach.tower.allS` | Every room on one floor graded S | GT + T | Yes |
| `ach.tower.elites.<n>` (1, 25, 100), 4th belt + | Elites defeated, total | GT; C aura trim at 100 | Yes |
| `ach.tower.challenge.<n>` (1, 10, 50), 4th belt + | Challenge floors cleared | GT; C Challenge gi trim at 10 (`core-design.md` line 589) | Yes |

### 4. Monster Journal (Bestiary, launch per `decisions.md` line 374)

| ID | Threshold | Reward | Launch? |
| --- | --- | --- | --- |
| `ach.journal.entries.<n>` (5, 10, 25) | Entries filled | GT (also counts toward S7's Journal meter) | Yes |
| `ach.journal.master.<enemyId>` (one per enemy: today swarmer, shield, brute, floor-keeper, plus named monsters) | Entry complete: seen, 10 defeats, 10 Perfect Counters on it (`core-design.md` line 223) | T "<Enemy> Expert" | Yes |

### 5. Home Dojo

| ID | Threshold | Reward | Launch? |
| --- | --- | --- | --- |
| `ach.home.placed.<n>` (5, 15, 30) | Decorations placed at once | D | Yes |
| `ach.home.tidy.<n>` (5, 20, 50) | Times the dojo was cleaned to sparkling, total (never days in a row) | Cleaning tool cosmetic; T at 50 | Yes |

No achievements for visitor bows (that would make it a popularity contest, `core-design.md` line 487).

### 6. Street Smarts (launch: 2–3 locations, `core-design.md` line 732)

| ID | Threshold | Reward | Launch? |
| --- | --- | --- | --- |
| `ach.smarts.location.<loc>` | Location set complete (badge already in §12) | B + T "<Place> Smart" | Yes, for launch locations |
| `ach.smarts.stars.<n>` (10, 25, 50) | Stars, total | D | Yes |

### 7. Real-life quests (post-launch, `core-design.md` line 736)

| ID | Threshold | Reward | Launch? |
| --- | --- | --- | --- |
| `ach.life.quests.<n>` (1, 5, 10) | Parent-approved quests | D, cleaning tool; T at 10 | Post-launch |

## Counts (for C6)

| Category | Achievements | With a title | Certified |
| --- | --- | --- | --- |
| Dojo | 9 + 4 + 6 + 5 + 5 + 4 + 5 + 1 template = **39** | 2 + 3 + 2 + 1 + 1 = **9** | 39 (all real) |
| Sensei's Questions | **5** | 2 | 0 |
| Tower | 10 + 5 + 5 + 3 + 1 + 3 + 3 = **30** | 10 + 1 + 1 + 1 = **13** | 0 |
| Monster Journal | 3 + 4 now (one more per new enemy) = **7+** | 4+ | 0 |
| Home Dojo | **6** | 1 | 0 |
| Street Smarts | 2–3 locations + 3 = **5–6** | 2–3 | 0 |
| Real-life quests | **3** (post-launch) | 1 | 0 |
| **Total** | **~95** (launch ~92) | **~32** | 39 |

## For C6: text slots

C6 writes one entry per achievement ID above, in a new draft file `drafts/content/achievements/achievements.json`:

```json
{
  "id": "ach.tower.guardian.white",
  "name": "Guardian of White",           // ≤ 24 characters, shown on the trophy wall
  "how": "Defeat the White tier Guardian.", // ≤ 60, shown before it's earned; plain, no "in a row", no deadlines
  "done": "You freed the White tier!",     // ≤ 60, the celebration line
  "title": "White Tier Champion",          // ≤ 20, only if the reward has T
  "trophyName": "Guardian Statue",         // ≤ 24, only if GT / CT / D / B / C
  "trophyText": "Cleared on your own two feet." // ≤ 80, story line on the piece (S7-rev)
}
```

- **Families:** write one template per family with `{n}`, `{belt}`, `{enemy}` or `{place}` slots, for example "Clear {n} floors". Write a separate name only where a nicer name helps (the 9 promotions, the 10 Guardians, the bow tiers).
- **Certified trophies:** `trophyText` ends with the date, which the game fills in ("Earned {date}").
- **Words:** ages 6+, hopeful. No "only", "hurry", "don't miss" or "streak".
- **IDs are final** once this PR is merged. Names can change at any time.

## Scope flags

- **New saved counters:** `perfectsTotal`, `elitesDefeated`, `challengeFloors`, `tidyCount`, `bowCorrect` (if it isn't already saved), `achievementsEarned`.
- **`classesTotal` feed field** from Nic (DojoForge). Until then, classes milestones use S7's `classesCounted` (seeded from `classesInRank`, so it undercounts earlier belts).
- **Art:** about 40 trophy or decoration pieces. Families share one model with a colour or number plate.
- **UI:** trophy-wall "Goals" page, title picker, and a "Certified" seal look.
- Real-life quests are post-launch.

## Done-when

- Every ID in the list is in `content/achievements/achievements.json`. A loader test checks for unique IDs, valid reward codes and text lengths.
- A table test gives each counter its threshold minus 1 and then its threshold. It's earned exactly once, at the threshold, and never taken away.
- A word and code check finds no achievement that reads logins, play days, days in a row or time played.
- Certified achievements unlock only from feed data (fake fixtures). No game action can unlock them. They show the seal and the earned date.
- The bow awards fire at 5, 10, 20, 50 and 100 correct answers. Wrong answers change nothing.
- The 4th-belt families stay hidden below 4th belt. The Goals page opens after the first floor clear.
- Visiting a dojo shows trophies but no counts.
- C6's `achievements.json` covers every ID with all required slots filled.
