# Request for Nic: a total-classes field in the DojoForge feed

From: Dojo-Ascent Researcher & Planner, 2026-10-24, via the Manager. Nic has said this can be added.

## The field

| | |
| --- | --- |
| Name | `attendance.classesTotal` |
| Type | integer ≥ 0; optional (it may be missing on older feeds) |
| Meaning | **Lifetime certified classes**: every class this student attended at the school, across all ranks, counted from DojoForge attendance records. It's the same set of classes `recentClasses` comes from, just with no time window. |
| Not counted | Game sessions, home practice minutes, classes later cancelled or deleted by staff (if any, guess) |
| Updates | Whenever attendance is recorded. It can arrive late; that's fine. |

Example: `"attendance": { "recentClasses": [...], "classDays": [...], "classesInRank": 7, "classesTotal": 143 }`

## How the game uses it

- **One number:** `classesLifetime = max(saved classesLifetime, feed classesTotal, classesCounted)`.
  - It never goes lower, even if the feed later sends a smaller number (staff corrections, a re-import).
  - If the field is missing, the game uses its own counter `classesCounted` (S7), which counts new class dates and on old saves starts from `classesInRank`.
- **First sync on an old save:** take the max. Milestones the student already earned for real (S6 `ach.dojo.classes.<n>`, S10 class looks) unlock together in one "Your training so far" moment. They keep their real dates where `rank.history` and attendance allow. Otherwise they're dated on the sync day (guess).
- **Class pieces (S7)** still come only from new class dates after install, plus at most 1 welcome piece. A big total never floods the dojo.
- **Weeks trained (S9)** isn't set from this field.

## Questions for Nic

1. Is `classesTotal` available for all students now, including history from before DojoForge (imported records)?
2. If staff delete a class, does the total go down? (The game ignores drops either way.)
3. Is the name `classesTotal` OK, or would you prefer another?

## Done-when (feed side)

- The fixture feeds in `fixtures/` include `classesTotal` on at least one profile and leave it out on one.
- Nic confirms the field meaning above in `docs/decisions.md` (the Manager records it).
