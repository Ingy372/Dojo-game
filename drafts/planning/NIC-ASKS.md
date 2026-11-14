# NIC-ASKS: everything the game needs from Nic (DojoForge)

Status: running list (OV-P3). Jay presents it to Nic in one go. **No bot contacts Nic.** Bots add new asks here through a Planner PR.
Last updated: Nov 14, 2026.

How to read: **Must** = no launch without it (review L12). **Soon** = needed for a launch item, can follow L12. **Later** = after launch. Each line says where the need comes from, so Nic can check it.

## A. Must have for launch (L12: feed, login, saves)

| # | Ask | Why the game needs it | Source |
|---|---|---|---|
| A1 | **Confirm the plan fits DojoForge**: read-only feed into a Cloudflare Workers + D1 game server; the game never writes to DojoForge | Framework says Nic should confirm before building starts | `docs/framework.md` section 14 |
| A2 | **One read-only progress feed per student**, in the shape the game already reads (`packages/sim/src/feed.ts`, `feedVersion: 1`). The 6 test profiles in `fixtures/` are working examples | The whole training link reads this | framework 14; `feed.ts` |
| A3 | Feed extras beyond the framework list: full curriculum per belt (ids, types, names); per belt color, 2nd color, degree, typical months in rank, classes before testing; `classesInRank`; `testing.approved` and `testDate`; which belt each catch-up item belongs to | Legacy grant, the Gate, Sensei's Seal | `docs/decisions.md` "Feed shape (for Nic)" |
| A4 | **Classes in rank must count made-up classes**; lifetime class total if available (`classesTotal`, optional) | The Gate's class dial (24 / 50 / 76 / 102 classes) | decisions.md, Oct 7 rule |
| A5 | **Black belt time in rank = 24 months** (1st to 2nd degree) in DojoForge data | Pacing and the Gate | decisions.md J6; progress.md |
| A6 | **Belt history with dates, including ranks earned before DojoForge**, and training start date | Legacy grant for existing students; "Martial artist since [year]" | framework 14; core-design |
| A7 | **Stance sign-offs** as their own feed list (`stanceSignOffs`: id, signedOff, date, by) and the **real DojoForge ids** for 5 stances: Ready (Open Leg), Cat, Front, Fighting, Horse. Today the game uses `PLACEHOLDER-dojoforge-stance-*` | Jay kept stances as separate sign-offs (Q1 b, Nov 14), so DojoForge needs these 5 items | decisions.md R-STANCE-d2; `content/abilities/abilities.json` |
| A8 | **Student login with the DojoForge account**, and a way for the game server to check that login | No separate game sign-up | framework 14 and section 13 |
| A9 | **Parent consent runs through the parent's DojoForge account**: what DojoForge can tell the game (parent linked, consent given) | Kids Category / Families rules; privacy policy | core-design; review 8.4 |
| A10 | **A test feed with fake students only** (no real student data) that the team and Tester can hit before launch | Build and QA without real data | project rule: no real student data |
| A11 | **Age band** in the feed (6-9, 10-12, 13+ or Nic's bands) | 6-9 start on Guided (Jay, Q9) | framework 14; OV-B3 |
| A12 | **Cloudflare**: does DojoForge already pay for Workers Paid? Can the game use that account, or should it have its own? | Cost estimate and setup | core-design cost table |
| A13 | **App store accounts**: does Tarnished Labs already have Apple Developer and Google Play Console accounts the game can publish under? | Milestone 8 | `docs/MILESTONE_PROMPTS.md` |

## B. Soon (launch items that lean on DojoForge)

| # | Ask | Why | Source |
|---|---|---|---|
| B1 | **Video ids per requirement, plus a way to play the video inside the game** (not by opening the student app) | Kids apps need a parent gate before leaving the app; in-game play avoids it (L18) | review 8.4 #2, L18 |
| B2 | **"Ready to show Sensei" request endpoint** (one button for launch, no Missions) | Lets a kid flag a technique for review; only staff change records | core-design; review (Missions delayed) |
| B3 | **Planned absences** (vacation, illness) in the feed | Pauses the Home Dojo mess so kids are not punished | decisions.md; progress.md |
| B4 | **Stripes, accolades, streak weeks, approved home practice minutes, class goals** confirmed as fields DojoForge can send | Reward moments and Practice Heart | framework 14 |
| B5 | **Multi-school**: the same feed works for any DojoForge school with its own belts and names | Selling to other dojos | framework 14, rule 5 |

## C. Later (after launch, only if still wanted)

| # | Ask | Source |
|---|---|---|
| C1 | "Ready for review" staff queue (with Missions) | core-design; review: delay |
| C2 | Positive class-day notifications through DojoForge, school controlled, never guilt | framework |
| C3 | Demo floor booking into the DojoForge Leads pipeline; guest character carries over | framework |
| C4 | Staff view of each student's Power Rating | core-design |
| C5 | Consent flow for features where kids see other kids' names (visiting, echoes) | review 8.4 #3 |

## D. Questions only Nic can answer

1. Rough timeline for A2-A9, so the team can plan around it (review: L12 is the biggest date risk).
2. How fresh is the feed? Framework wants a Tuesday-night sign-off to show the same evening.
3. Any field above that DojoForge does not have today.

## Change log

- Nov 14, 2026: list started (OV-P3).
