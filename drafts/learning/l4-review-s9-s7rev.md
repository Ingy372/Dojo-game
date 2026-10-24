# L4 review: S9 (goal line, count-up streak, first Mission) and S7-rev (decoration sources)

## Delivery Note

- **ITEM:** L4, review of S9 (PR #74, `drafts/planning/S9-goal-line-streak-first-mission.md`) and S7-rev (PR #73, `drafts/planning/S7-decoration-sources.md`). Both are merged as drafts.
- **WHAT:** An ethics, pressure and overwhelm check of both, with a verdict and ranked fixes.
- **WHY:** Both shape why a white belt comes back each week. Their wording and pacing need to be right before the Programmer builds them.
- **DECIDE:** (1) Does the first Mission appear in session 1, or the first time it's earned, as §13 says? (2) Should the streak XP bonus exist at all, or should the aura be enough? (3) Should the sure share of new pieces at belts 1–5 go up from about half to at least 60%?
- **NEXT:** The Researcher & Planner applies the must-fixes. I review the streak rule spec when it lands.

## Verdicts

| Proposal | Verdict |
| --- | --- |
| **S7-rev** | **Pass.** All three must-fixes from PR #71 are applied, and all three should-fixes too. Two small should-fixes below. |
| **S9** | **Pass with changes.** The streak rules are exactly right. Two must-fixes on overwhelm and Counter difficulty at white belt. |

## S7-rev: checking my PR #71 fixes

| Fix | Applied? | Where |
| --- | --- | --- |
| Must 1: sure class pieces at the Blessing, never days in a row, never taken away | Yes | Class pieces, `classesCounted` only goes up, done-when bans in-a-row rules |
| Must 2: sure sources are the main path, a "next piece" meter, random a small bonus | Mostly | Meter fills only; random rates cut. But sure is only ~50% of new pieces at belts 1–5 (see S7-S1) |
| Must 3: odds off the kid's screen | Yes | Parent or teacher view only; word check for odds, "rare", "duplicate" |
| Should: no word "duplicate" | Yes | |
| Should: no counts or rankings on visits | Yes | Owner's favourite piece only |
| Should: two sources at white belt | Yes | First clears and Journal; class pieces at the first Blessing |

Ethics: no purchases, no timers, nothing lost on a loss, event pieces return. Training is the only source that keeps growing. Good.

### S7-rev fixes

- **Should S7-S1: raise the sure share at belts 1–5.** At belts 1–3 the table has ~16 sure and ~16 random. Half of what a young kid gets is still chance, which is more surprise than "small bonus". Suggest the done-when target goes from 45% to 60%, by cutting the treasure chest rate a little or adding a class piece every 2 classes at white belt only.
- **Should S7-S2: the class-piece moment must not stack with other new lessons.** The first class piece is taught at the first Blessing. If that session also teaches a Mission or a Form, hold one for the next session (§13: one new system per session).
- **Nice S7-N1:** "A surprise!" is good. Keep it as the only kid-facing word for random drops.

## S9 findings

What's right: weeks count only real class, game sessions never count, the number only goes up, missed weeks just pause, no red, no warnings, no push. The goal line shows one line, picks the real step on ties, and bans "only", "hurry" and "lose". "Not yet" from Sensei is private and warm. The Mission has no deadline.

### S9 fixes

- **Must S9-M1: don't open everything at once for a new white belt.** As written, a brand-new white belt's Home Dojo shows the goal line, the "Weeks trained" banner and "This week's Mission" on top of the first-session list in §13. §13 says Missions unlock "the first time it's earned" and "never more than one new system per session". Fix: show the Mission card from session 2 at the earliest (or after the first class arrives in the feed), and hide the weeks banner until there is at least 1 training week.
- **Must S9-M2: Mission step 2 shouldn't ask for Perfect Counters at white belt.** "3 Perfect Counters" needs exact timing, the same thing I flagged in PR #46. Use "3 Counters" for white belt; Perfect can be the step for later belts.
- **Should S9-S1: rename "This week's Mission" to "Your Mission".** A 6-year-old can read "this week" as a deadline, and an unfinished card still saying "this week" weeks later reads like a miss.
- **Should S9-S2: keep the streak XP bonus small, or drop it.** It is tied to real class, so it doesn't break "training is the power source". But power for weeks trained can make a long break feel costly to a kid who has to miss class (illness, family). My preference: aura only, no XP. If kept, keep the cap at +10% or lower.
- **Should S9-S3: no weeks count when classmates visit.** Visitors can see the aura, but not the number, so it never becomes a ranking (same rule as S7-rev visits).
- **Nice S9-N1: seeding old saves.** `streak.weeks` is DojoForge's in-a-row count, so a long-time student who just had a break starts low. If the feed has class history, seed from total weeks with a class instead.
- **Nice S9-N2:** the "Best" goal line ("1 more Perfect to beat your best!") is self-comparison only, which is good. Keep it that way; never compare with classmates.

## Pacing check (a few times a week, no daily pressure)

With 2 classes a week, a white belt gets a class piece about every 1.5 weeks, a Mission that moves forward in play, and one hopeful goal line every run. That is a real reason to come back 2–3 times a week, and nothing happens if they don't. Pass.

## Evidence

| Claim | Source | Rating |
| --- | --- | --- |
| Expected, tangible rewards can lower interest in an activity; unexpected and informational feedback does less harm | Deci, Koestner & Ryan (1999), meta-analysis, *Psychological Bulletin* 125(6). From memory, please check | STRONG |
| People speed up as a visible goal gets closer (supports one "next piece" meter) | Kivetz, Urminsky & Zheng (2006), *Journal of Marketing Research* 43(1). From memory, please check | MODERATE (adults, coffee cards) |
| Loot box spending is linked to problem gambling in players (supports keeping chance small and odds away from kids) | Zendle & Cairns (2018), *PLoS ONE* 13(11). From memory, please check | MODERATE (correlational, older players) |
| One new thing at a time lowers load for young readers | Sweller's cognitive load theory; Mayer, *Multimedia Learning*. From memory, please check | MODERATE |

No new studies are claimed beyond these.
