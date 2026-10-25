# Launch by December 15, 2026: the new plan

**For:** Jay and the Dojo-ascent Manager. **From:** Researcher & Planner. **Written:** Oct 25, 2026.
**What changed:** launch moves from early April 2027 to **before December 15, 2026**. That is about 7 weeks.
**Labels:** **[FACT]** comes from the repo or a linked source. **[GUESS]** is my estimate. **[DECIDE]** needs Jay.
No game code or work board was changed. No purchases, ads, chat or pressure anywhere in this plan.

---

## The short version

- **We can make Dec 15, but only with a smaller first version.**
  - The first version is **an app that works on the phone by itself**. It has the Tower, the dojo, gear, lessons and the Gate.
  - It does **not** have the live DojoForge link, accounts or anything shared between players. Those come in an update in January.
- **The hardest part is not the game. It is the two app stores.**
  - **Google** may make a new account run a **14-day test with 12 testers** before the app can go public.
  - **Apple and Google** both review kids' apps carefully.
- **This week's two jobs:**
  1. Find out if Tarnished Labs (DojoForge) already has Apple and Google developer accounts.
  2. Book the lawyer talk.

---

## 1. Where the game really is today (Oct 25)

From `docs/progress.md`, `docs/work-board.md` and PRs up to #228. **[FACT]**

| Area | State |
|---|---|
| Milestones 0–7 (movement, combat, a full floor, training link with **fake** profiles, Home Dojo, Street Smarts sample, playtest-ready) | **Done.** The QA playtest check said READY (M7-P12). |
| Tutorial floor, Sensei's Lessons, Lesson Scroll, Welcome Week, unlock schedule, play-time limit, music and sound | **Done** (K15–K24, M7-P8, M7-P9). |
| Tower content in the game | 5 live enemy types, 21 rooms, room art for tiers 1–2 (White, Yellow), named monsters, elites, Insights, loot. |
| Tower content in drafts only | 40 bestiary enemies and 10 Guardians, with numbers (C13, R-BAL-13 #224) but **no art yet** (A-BEST waits on J15). |
| Saves | **On the phone only** (browser storage). A run in progress survives closing the app (M7-P11). |
| Milestone 8, the phone apps (Capacitor) | **Not started.** Capacitor isn't installed (progress, milestone 0). |
| Milestone 9, real DojoForge (login, server saves, Missions, staff queue) | **Not started.** Waits on Nic building the feed and request endpoint. |
| Milestones 10–12 (every belt tier, Street Smarts and quests, visiting dojos, Hall of Masters, parent controls, store release) | **Not started**, apart from pieces like Challenge rules and the Bestiary plan. |
| Open PRs | #228 P-MENU-a, #227 S3-A1 kata icons, #216 Q5 QA report, #214 charm icons, #211 Guardian concepts. |

**What is DojoForge?** **[FACT]** DojoForge is Action Zone's school system and student app, built by Nic at Tarnished Labs. It is outside this repo.
- It holds each student's real belt, sign-offs, classes and start date.
- The game reads that progress. It never changes DojoForge records (core-design §13).
- Consent is meant to go through the parent's DojoForge account (core-design §11).
- Staff are meant to see a "Ready for review" queue there.
- Today the game only uses **fake profiles** shaped like DojoForge's feed (`fixtures/`).

---

## 2. What must ship by December 15

**The first version (v1.0): "Dojo Ascent" for Action Zone families, on iPhone and Android.**

1. **Store-ready apps.** The game is wrapped with Capacitor for iPhone and Android and installs from the App Store and Google Play. It plays sideways, respects the notch, pauses in the background and copes with no internet.
2. **The game that already works,** polished:
   - Tutorial floor, Tower runs, gear, Insights, elites, named monsters
   - Home Dojo, bow question, decorations
   - Lessons, Welcome Week, the Gate and Path card
   - Music, the play-time limit, the Street Smarts sample
3. **Tower tiers that are fully playable** with real art and a Guardian (see section 3, cut C4).
4. **Progress without DojoForge (v1.0 only).**
   - Without a live feed, the game needs another way to know a child's belt and sign-offs. Section 6, D2 gives options.
   - My recommendation: **a grown-up enters the belt, stripes and sign-offs** behind the grown-up gate that already exists (M7-P9's math question). Each entry plays the real reward moment.
   - Nothing leaves the phone.
5. **Kid-safety basics for review:**
   - A privacy policy and a support link (Apple requires both for every app)
   - No outside links or settings unless a grown-up passes the gate
   - No ads, no purchases, no tracking tools
   - A way to wipe the child's data on the phone
6. **Store listings:** name, icon, screenshots, age rating, the privacy forms (Apple "privacy details", Google "Data safety") and the Google "Target audience" form.

**Not a launch blocker:** the live DojoForge link (v1.1, January, when Nic is ready).

---

## 3. What to cut or push past launch (proposals)

| # | Cut or push | Why | What we lose |
|---|---|---|---|
| C1 | **S4c Injured status** → after launch | Already marked "after launch" on the board. It needs the S4 break seals (#31–40), and Jay hasn't given all of those yet (J13). | A higher-belt extra. No one at White–Green sees it. |
| C2 | **S3 calm kata practice room** → after launch | Already "after launch" (S3-P2). It's a new room and new rules. Kata cards (S3-P1) already show katas. | A nice extra, not a core loop. |
| C3 | **P-MENU taste extras** → after launch. **Keep** P-MENU-a to e (tap sizes of at least 44 pt, press feedback, no jumping grid). | Big tap targets help review ("easy for children to use" is a Teacher Approved rating point) and help kids. Fonts and extra glow are taste calls. | A little shine. |
| C4 | **Tiers past what's playable** → updates | Real art exists for tiers 1–2. The 40 bestiary enemies have no art yet. Building all 10 tiers in 7 weeks with art, Guardians and QA is not realistic **[GUESS]**. **Proposal:** launch White to Orange (tiers 1–3) if the Artist can finish tier 3 art by Nov 20, otherwise White and Yellow. Higher belts play the highest built tier at their level cap, with a kind "Your next tower floor opens soon" note. | Brown and black belts get less new content at first. Their legacy grant and gear still work. |
| C5 | **White-label and selling to other dojos** → after launch | It needs swappable school layers, the WAFU written OK (J10 is still waiting) and per-school curriculum. None of that is needed for Action Zone. Keep writing data as data so it stays possible. | Nothing for Action Zone families. |
| C6 | **Live DojoForge link** (login, server saves, Missions, staff queue, legacy grant from real records) → v1.1 in January | It depends on Nic (outside this repo), and adding accounts and server data for kids makes the privacy review much bigger. | The automatic "Sensei signed you off tonight" link. In v1.0 a grown-up types it in. |
| C7 | **Visiting classmates' dojos, Hall of Masters, certified trophies** (milestone 12) → later | Anything shared between children needs accounts, a server and moderation thinking. That's a large COPPA scope. | Showing off to friends. |
| C8 | **More Street Smarts locations, quest stories, life-lesson quests** (milestone 11) → updates | Every script needs Jay's approval and illustrations. The one built sample stays. | Story depth. |
| C9 | **Guardian form shifts (C14)** and the full Bestiary pages → only if art lands by Nov 20 | Waiting on J16 and art. | A cool boss extra. |
| C10 | **Endless Ascent, co-op, town square, crafting, Path Perks, Scrolls, Visitor's Pass** | Already after launch in core-design §13. | — |

> Note: core-design §13 lists the Bestiary as launch scope (work board section 1, item 3) and the Tower "for every belt tier". Cuts C4 and C9 change that, so they need Jay's yes (D3).

---

## 4. Order of work and what waits on what

```
Week 1  Accounts check (Jay) ──► Developer accounts ready ──► Store app records created
        Lawyer booked (Jay)  ──► Privacy policy draft ─────► Store privacy forms
        M8-a Capacitor wrap ──► M8-b cloud builds (GitHub Actions; iOS on a Mac runner)
                                      │
Week 2                                ├─► Google internal test ──► Google CLOSED TEST (14 days, 12 testers)*
                                      └─► TestFlight build
        V1-a grown-up progress entry (if D2 = yes)
Weeks 2–4  Content: tier 3 art + Guardians (Artist) ─► import (Programmer) ─► QA
           P-MENU-a..e, kid-safety items (gate on links, data wipe)
Week 4  *Apply for Google production access (after 14 full days)
Week 5  Feature freeze (Dec 1) ──► Release candidate ──► Apple submit / Google production release
Weeks 6–7  Fix any rejections ──► Release both by Dec 15
```
\* Only if Google's new-personal-account rule applies (section 5, risk 2).

**Must happen first, in order:**
1. Developer accounts
2. Capacitor wrap and cloud builds
3. A Google test build (this starts the 14-day clock)
4. Content and polish, running alongside steps 1–3
5. Freeze
6. Store review

---

## 5. The riskiest items and how to cut the risk

### Risk 1: the Capacitor phone wrapper (milestone 8)

**Facts:**
- The current Capacitor is 8.5.3 (Oct 7, 2026). Capacitor 8 needs Node 22+, Xcode 26+ and Android Studio 2025.2.1+, and supports iOS 15+ and Android 7+ ([support policy](https://capacitorjs.com/docs/main/reference/support-policy), [releases](https://github.com/ionic-team/capacitor/releases)).
- Google Play needs **new apps to target Android 16 (API 36)** from Aug 31, 2026 ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/11926878)). Capacitor 8 projects use API 36 ([Capacitor 8 update guide](https://capacitorjs.com/docs/updating/8-0)).
- iOS builds need a Mac. Jay is on Windows, so the plan is GitHub Actions on a macOS runner (MILESTONE_PROMPTS, milestone 8).

**Why it's risky:**
- The game was built ready for this from day 1 (relative paths, `dist` output, landscape, safe areas). But nobody has tried a real phone build yet.
- Code signing for iPhone (certificates, profiles) is the usual place where days get lost **[GUESS]**.

**How to cut the risk:**
- Start **week 1**.
- Use Capacitor 8 (v7 support ends Dec 8, 2026).
- First goal is a blank wrap that installs, before any polish.
- Use no extra plugins beyond what's needed (status bar, screen orientation, app pause).
- Jay types all passwords and keys himself, as planned.
- **Plan B for Android:** if signing slows iOS, keep Android moving. Its clock (the 14-day test) is the longer one.

### Risk 2: store review times

**Apple:**
- Apple says App Review "typically review[s] at least 50% of submissions in less than 24 hours and 90% in less than 48 hours" ([Apple App Review](https://developer.apple.com/distribute/app-review/)).
- But apps with "**limited review history**" and "**complex or novel issues**" may take longer ([review status help](https://developer.apple.com/help/app-review/after-submitting-for-review/review-status/)). A first kids' app is both.
- Holiday slowdowns: in 2024 Apple warned reviews "may take longer to complete from December 20–26" ([Apple news](https://developer.apple.com/news/?id=iwvebnw2)). In 2025 developers quoted Dec 19–26 from App Store Connect ([Reddit thread, unofficial](https://www.reddit.com/r/iosdev/comments/1pt5sic/apple_office_on_leave_for_christmas/)). That's after Dec 15, but it means **no slack after the 15th**.
- An **expedited review** can be asked for in special cases, such as an event date ([same Apple page](https://developer.apple.com/distribute/app-review/)).
- Apple's most common problem is guideline 2.1, App Completeness: crashes, **placeholder content**, missing demo info ([same page](https://developer.apple.com/distribute/app-review/)). Placeholder art or "coming soon" screens are a real rejection risk.

**Google:**
- Google says some accounts get extra review time, "**up to seven days or longer** in exceptional cases" ([Publish your app](https://support.google.com/googleplay/android-developer/answer/9859751)).

**Google's closed-testing rule. Does it apply?**
- **[FACT]** Personal developer accounts **created after November 13, 2023** must run a **closed test with at least 12 testers, opted in for 14 days in a row**, before they can apply for production ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465)).
- After applying, "review usually takes seven days or less, but can occasionally take longer" (same page).
- Testers who drop out and rejoin restart their own 14 days (same page).
- **Does it apply to us?** It depends on the account, and I can't see that from the repo:
  - A **new personal** account → **yes**.
  - An **organization** account, or a personal account made before Nov 13, 2023 → the rule as written doesn't apply.
  - MILESTONE_PROMPTS says to use Tarnished Labs' accounts if they have them.

**How to cut the risk:**
- **Week 1:** Jay asks Nic whether Tarnished Labs has a Google Play **organization** account and an Apple account. Using them may avoid the 14-day rule and the identity checks.
- If we must use a new personal account: start the closed test by **Nov 9** with **15+ Action Zone families** (spares for drop-outs). Each family's grown-up opts in with their Google account. Apply for production about **Nov 24**.
- Apple: run TestFlight from week 2 and submit for real by **Dec 1**. That gives 2 weeks for one or two rejections.
- **Don't** submit with placeholder art, broken links or "coming soon" screens.
- **I couldn't find** an official current wait time for new developer account approval (Apple enrollment or Google identity checks). Treat it as unknown and start this week.

### Risk 3: kids' privacy reviews (App Store Kids Category, Google Play Families, Teacher Approved, COPPA)

**Apple:**
- Apps in the **Kids Category** must follow guideline 1.3 and 5.1.4 ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), [Apple Kids page](https://developer.apple.com/kids/)):
  - no third-party ads or analytics, with very narrow exceptions
  - parental gates before outside links and purchases

**Google:**
- Apps aimed at children must follow the **Families Policy** ([Families Policies](https://support.google.com/googleplay/android-developer/answer/9893335)):
  - truthful Target audience, Data safety and rating answers
  - no advertising ID or device IDs from children
  - no location
  - only child-approved SDKs
  - and the app must not be "merely a webview of a website"
- A Capacitor game with its files packed inside the app is a real app, not a website view **[GUESS, but in line with the policy text]**.

**Teacher Approved:**
- You **can't apply**. Apps that meet the Families rules go into a teacher review queue, and teachers rate them on design, appeal, enrichment, age-fit and ads/purchases ([Teacher Approved](https://play.google.com/console/about/programs/teacherapproved/), [Android blog 2020](https://android-developers.googleblog.com/2020/04/promoting-high-quality-teacher-approved.html)).
- Nice to have, never a launch gate.

**COPPA:**
- The FTC's updated COPPA Rule took effect June 23, 2025, and **compliance was required by April 22, 2026**. It is in force now ([Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule), [FTC FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)).

**How to cut the risk:**
- **v1.0 collects no personal information:**
  - no accounts, no server, no analytics, no ads, no purchases, no chat
  - the child's name, belt and progress stay on the phone
- That's the smallest COPPA footprint, and it makes the store privacy forms simple ("no data collected") **[GUESS: the lawyer must confirm]**.
- Keep text-to-speech and music on the device. Already true: the phone's built-in voice is used (J9).
- Put the privacy policy and support links behind the grown-up gate.
- **Lawyer:** book in week 1 and meet by week 2. Core-design §13 says to talk "before milestone 8 (the store apps)". That is now, not December.
- The DojoForge link in v1.1 brings data off the phone. It gets its own lawyer check and its own parent consent through DojoForge (core-design §11).

### Risk 4: logins and saves

**Facts:** saves live on the phone. There are no accounts. Server saves are milestone 9.

**Risks:**
- A child who deletes the app, or gets a new phone, loses progress.
- If the app's storage area changes when we move from a web page to the Capacitor app, saves from the web link won't carry over **[GUESS: Programmer to confirm]**.

**How to cut the risk:**
- v1.0 keeps phone saves (already tested, M7-P11) and adds no login.
- Tell families plainly in the store text and on first launch: "Your progress is saved on this phone."
- Add the save-version check the Programmer already uses, so a later v1.1 can move saves to the server.
- Optional (D5): a grown-up-only "Save code" export and import (copy text, paste on the new phone). It is small, but it is a new feature, so only if time allows.

### Risk 5: DojoForge

**Facts:** DojoForge is outside this repo. The real feed, the request endpoint and the staff queue are Nic's work (milestone 9). Today the game has only fake profiles.

**Risk:** if v1.0 waits for Nic, the whole launch depends on someone else's calendar, plus a bigger privacy review.

**How to cut the risk:**
- Launch without it (cut C6). Progress is entered by a grown-up (D2).
- Ask Nic now for the earliest date he could give a **read-only** feed, so v1.1 can be planned.
- Keep the fake-profile shape so swapping in the real feed later needs no redesign.

### Smaller risks
- **Art throughput.** Tier 3 art, Guardians and Bestiary art all wait on Jay's OKs (J15, J16). Fewer tiers means less art.
- **Thanksgiving week (Nov 23–29).** Fewer testers and less of Jay's time. The schedule keeps it light.
- **Playtest at the dojo.** It hasn't happened with real students yet. The closed test can double as the playtest (framework §16).

---

## 6. Week-by-week schedule (Oct 26 → Dec 15)

Owner in brackets: Jay, P = Programmer, A = Artist, Q = QA Tester, R = Researcher & Planner, C = Content Writer, M = Manager.

| Week | Dates | Goals | Done when |
|---|---|---|---|
| 1 | Oct 26 – Nov 1 | **[Jay]** ask Nic about Tarnished Labs' Apple and Google accounts. Otherwise start enrolment. **[Jay]** book the lawyer. **[M]** approve cuts (D1–D4). **[P]** M8-a: Capacitor 8 wrap, Android build on Jay's phone. **[R]** store-forms checklist plus privacy policy draft for the lawyer. **[A]** tier 3 art start (if D3 = 3 tiers). | The Android app installs from a file. Accounts are known or started. Lawyer date set. |
| 2 | Nov 2 – 8 | **[P]** M8-b: GitHub Actions builds for iPhone (macOS runner) and Android. First TestFlight build. Google internal test. **[P]** V1-a: grown-up progress entry. **[Jay]** create the app in both stores, fill content rating and target audience. **[Jay]** gather 15+ tester families (Google accounts). **[Jay]** lawyer talk. | The app installs on an iPhone (TestFlight) and an Android phone (internal test). |
| 3 | Nov 9 – 15 | **[P]** start the **Google closed test by Nov 9** (if the rule applies). **[P]** P-MENU-b to e. Kid-safety items: links behind the gate, wipe data on the phone, "saved on this phone" note. **[A]** tier 3 art. **[Q]** first test round on real phones. | 12+ testers opted in. Day 1 of 14 logged. |
| 4 | Nov 16 – 22 | **[P]** import tier 3 art and its Guardian (if ready by Nov 20), fix test notes. **[C]** store text (short and long description). **[A]** icon and screenshots. **[Q]** full pass, small and large phones, reduced motion. | Every screen has final art and words. No "coming soon" or placeholder art. |
| 5 | Nov 23 – 29 (Thanksgiving) | **[Jay]** about **Nov 24**: apply for Google production access (after 14 full days). **[P]** bug fixes only. **[Jay/R]** privacy forms (Apple privacy details, Google Data safety) using the lawyer's notes. | Google application sent. Privacy policy live at a public link. |
| 6 | Nov 30 – Dec 6 | **Feature freeze Dec 1.** **[P]** release candidate. **[Jay]** submit to **Apple by Dec 1**. **[Jay]** once Google approves, send the release to production. **[Q]** release-candidate check. | Both stores have the build in review. |
| 7 | Dec 7 – 13 | **Buffer for rejections.** Fix, resubmit, use Apple's expedite request only if truly needed. Families-at-the-dojo install guide (one page, no pressure). | Approved on both stores, or a fix resubmitted by Dec 10. |
| — | Dec 14 – 15 | **Release.** Turn on both stores. | Action Zone families can install it. |
| After | Jan 2027 | v1.1: real DojoForge read-only feed (with Nic), server saves, consent through DojoForge, legal check. Then tiers 4+, S3-P2, S4c, more Street Smarts. | — |

**If Google's closed test can't start by Nov 9,** Android likely misses Dec 15 **[GUESS based on 14 days + up to 7 days + review]**. iPhone could still launch, with Android a week or two later. That's D6.

---

## 7. DECIDE (Jay)

| # | Question | Options | My recommendation |
|---|---|---|---|
| D1 | Launch a smaller v1.0 by Dec 15 and add the rest in updates? | (a) yes, the smaller v1.0 · (b) keep the full §13 launch list and accept a later date | **(a)** It's the only way to make Dec 15 safely. |
| D2 | Without DojoForge, how does the game know a child's belt and sign-offs in v1.0? | (a) a grown-up enters them behind the grown-up gate · (b) Sensei enters them on the child's phone at class with a staff PIN · (c) wait for Nic (launch moves) | **(a)** Simple, no data leaves the phone. (b) is fine to add later. |
| D3 | How many Tower tiers at launch? | White–Yellow (art done) · White–Orange (if tier 3 art lands by Nov 20) · all 10 (not realistic) | **White–Orange if the art makes Nov 20, otherwise White–Yellow.** Higher belts get a kind "next floor opens soon" note. |
| D4 | OK to push S4c, the S3 practice room, P-MENU taste extras, white-label, visiting dojos and the live DojoForge link past launch? | yes / pick some to keep | **Yes to all.** |
| D5 | Add a grown-up "Save code" so progress can move to a new phone? | yes (small, if time) · no (wait for v1.1 server saves) | **No for v1.0.** Server saves arrive in v1.1. Revisit if week 4 has room. |
| D6 | If Android's 14-day test runs late, launch iPhone first? | yes · no, both together | **Yes.** Don't make iPhone families wait. |
| D7 | Which developer accounts? | Tarnished Labs' (DojoForge) accounts · new ones in Jay's name | **Tarnished Labs' organization accounts** if they exist. They may skip Google's 14-day rule, and the game can sit next to DojoForge. |
| D8 | Put it in Apple's **Kids Category** and Google's Families program? | yes · no (rated 4+ / Everyone but not in the kids sections) | **Yes.** v1.0 already follows the rules (no ads, no tracking, no purchases). Lawyer to confirm. |

## Sources (opened Oct 25, 2026)
- Google Play testing rule for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play review times: https://support.google.com/googleplay/android-developer/answer/9859751
- Google Play target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play Families policy: https://support.google.com/googleplay/android-developer/answer/9893335
- Teacher Approved: https://play.google.com/console/about/programs/teacherapproved/ and https://android-developers.googleblog.com/2020/04/promoting-high-quality-teacher-approved.html
- Apple App Review: https://developer.apple.com/distribute/app-review/ and https://developer.apple.com/help/app-review/after-submitting-for-review/review-status/
- Apple holiday notice (2024): https://developer.apple.com/news/?id=iwvebnw2
- Apple guidelines (1.3 Kids, 5.1.4): https://developer.apple.com/app-store/review/guidelines/ and https://developer.apple.com/kids/
- COPPA amended rule: https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule and https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- Capacitor: https://capacitorjs.com/docs/main/reference/support-policy and https://capacitorjs.com/docs/updating/8-0

**Numbers I could not find:** how long Apple Developer enrolment or Google identity checks take today, and Apple's exact 2026 holiday dates. Treat them as unknown and start early.
