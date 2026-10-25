# Dec 15 beta plan: Dojo Ascent in 5–10 testers' hands

**For:** Jay and the Dojo-ascent Manager. **From:** Researcher & Planner. **Written:** Oct 25, 2026.
**Replaces:** `LAUNCH-DEC15-replan.md` (PR #230), renamed here.
**Labels:** **[FACT]** comes from the repo or a linked source. **[GUESS]** is my estimate. **[DECIDE]** needs Jay.
No game code or work board was changed. No purchases, ads, chat or pressure.

## What changed (Jay, Oct 25)

- **Due by Dec 15:** a good chunk of the game, on the phones of **5–10 beta testers**. That means Action Zone families.
- **The full store launch date is now open.** Pick it after the beta (see D-B4).
- **Jay said "your picks are fine" to D1–D8.** They're recorded in section 2.

---

## 1. The simplest way to get 5–10 testers playing

### The three options

| | **iPhone: TestFlight** | **Android: Google Play testing** | **Web link (fallback)** |
|---|---|---|---|
| How a family gets it | Install Apple's free TestFlight app, tap the invite, install. | Tap an opt-in link, install from the Play Store. | Open the link in Safari or Chrome, tap "Add to Home Screen". |
| Needs | Apple Developer account, a cloud Mac build, a signed build | Google Play Console account, a signed Android build | Nothing new. **The game is already live** on Cloudflare (`main`). |
| Review before testers can play? | **Internal testers:** no. **External testers:** yes, Beta App Review on the first build. | **Internal testing:** usually no standard review. **Closed testing:** yes. | No |
| Feels like a real app? | Yes | Yes | Mostly. It runs in the browser. Background, sound and full-screen behave differently **[GUESS]**. |

### iPhone: TestFlight

**Internal testers [FACT]:**
- Up to **100** people on the App Store Connect team, with one of these roles: Account Holder, Admin, App Manager, Developer or Marketing ([Apple TestFlight](https://developer.apple.com/testflight/)).
- No review.
- **But** every parent would have to be added to the developer team. On a Tarnished Labs account, that gives families access to company settings. **Not a good fit for families.** It's good for Jay and staff.

**External testers [FACT]:**
- Up to **10,000** people, invited by email or a public link ([TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview)).
- "When you add the first build of your app to a group, the build gets sent to App Review… A review is required only for the first build. Subsequent builds may not require a full review." (same page)
- Apple also requires a beta app description and beta review information before external testers can get the build ([Apple TestFlight](https://developer.apple.com/testflight/)).
- **I couldn't find an official Beta App Review wait time.** Treat it as unknown, so send a first build early (Nov 20).

**Build lifetime [FACT]:** each build works for **90 days**, then stops (same overview page). A Dec 15 build would stop around mid-March, so the beta needs fresh builds after that.

**Recommendation:** use **external testers, with parents' email addresses.** Send a simple early build for Beta App Review by **Nov 20**. Later builds may skip a full review.

### Android: Google Play internal testing vs closed testing

**Internal testing [FACT]** ([Play Console Help](https://support.google.com/googleplay/android-developer/answer/9845334)):
- Up to **100** testers, added by email.
- Builds reach testers "within minutes".
- It works even before the store page is fully set up.
- Internal tests "might not be subject to standard Play policy or security reviews".

**Closed testing:** larger tester lists. It's also the track used for the 14-day rule.

**Does the 14-day / 12-tester rule matter for the beta? No.**
- The rule only has to be met before an app can go out to everyone, or use pre-registration ([testing rule](https://support.google.com/googleplay/android-developer/answer/14151465)).
- Internal testing works without it.
- **But** if we end up with a new **personal** Google account, start a 14-day closed test during the beta anyway. It's needed later for the store launch.

**Recommendation:** **internal testing** with the parents' Google account emails.

### Web link (the fallback)

- **[FACT]** The game is already served by Cloudflare from `main` (a Cloudflare **Worker** with static files, `wrangler.jsonc`; docs/decisions.md). Jay already plays it on his phone.
- No Cloudflare Pages project is needed. The current Worker is enough.
- Families "Add to Home Screen" for an icon. Making it a full PWA (offline play, an app icon file) is optional and small **[GUESS]**.
- **When to use it:** if a developer account isn't ready by **Nov 13**, or a store review isn't through by **Dec 8**.
- **Downside:** saves live in that browser, so they won't move to the app later **[GUESS: Programmer to confirm]**.
- Everyone can still play the same game.

### Kid privacy for a beta

- **The testers are the parents.** The TestFlight invite and the Google tester list use the **parent's** email or Google account. Children don't need accounts. The child plays on the family phone.
- **Apple shows us tester numbers** (sessions, crashes) and lets testers send screenshots and comments ([TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview)).
  - Tell parents this plainly.
  - Ask them **not to put the child's full name or face** in feedback screenshots **[GUESS: good practice]**.
- **The game itself collects nothing.** No accounts, no server, no analytics, no ads, no purchases, no chat. The child's name and progress stay on the phone.
- **Simple written parent OK.** One page: what the beta is, what we see (tester data from Apple and Google), how to stop.
  - The lawyer should glance at it, but the beta doesn't have to wait for the full launch legal review **[GUESS: lawyer to confirm]**.
- A privacy policy link is good to have for the beta and required for the store launch.
  - Apple requires a privacy policy for App Store apps ([App Review](https://developer.apple.com/distribute/app-review/)).
  - **I couldn't confirm** whether TestFlight external testing needs one. Have it ready by Nov 20 anyway.

---

## 2. In the beta and out of the beta

### Decided (Jay, Oct 25: "your picks are fine")

| # | Decision |
|---|---|
| D1 | A smaller first version. The full list comes in updates. |
| D2 | **A grown-up enters the belt, stripes and sign-offs** behind the existing grown-up gate. Nothing leaves the phone. |
| D3 | **White–Orange** if tier 3 art is in by **Nov 20**, otherwise **White–Yellow**. |
| D4 | Push the extras: S4c, S3 practice room, P-MENU taste extras, white-label, visiting dojos and Hall of Masters, the live DojoForge link. |
| D5 | No save code. |
| D6 | **iPhone first** if Android is late. Now: whichever platform is ready goes first, and the web link covers the other. |
| D7 | **Tarnished Labs organization accounts** if they exist. |
| D8 | Kids sections (Apple Kids Category, Google Families) **with the lawyer's OK.** That matters at store launch, not for the beta. |

### In the beta
- Phone app on iPhone (TestFlight) and Android (Play internal testing), with the web link as the fallback
- Tutorial floor, Tower runs, gear, Insights, elites, named monsters, Guardian(s) for the built tiers
- Tiers White–Yellow (art done), plus Orange if the art lands by Nov 20
- Home Dojo, the bow question, decorations, Journal
- Lessons, Lesson Scroll, Welcome Week, the Gate and Path card
- Music, the play-time limit, the Street Smarts sample
- Grown-up belt entry (D2), and a wipe-data button behind the gate
- A "saved on this phone" note
- P-MENU-a to e (big tap targets, press feedback)
- A simple way to send feedback: TestFlight screenshots, or an email address

### Out of the beta
- Tiers past Orange: higher belts see a kind "next floor opens soon" note
- S4c, S3 practice room, P-MENU taste extras
- The live DojoForge link, Missions, staff queue, server saves
- Visiting dojos, Hall of Masters, white-label
- More Street Smarts and quests, Guardian form shifts
- Store listings, screenshots, Data safety forms (all for launch)

---

## 3. Dates (working back from Dec 15)

| Date | Milestone |
|---|---|
| **Tue Dec 15** | **Testers playing.** Short check-in message to families. |
| Dec 8–14 | **Buffer.** Fix anything that blocks install or play. Switch any family to the web link if their platform isn't ready. |
| **Mon Dec 7** | **Beta build to testers** on both stores. Invites go out. |
| **Fri Dec 4** | **Beta freeze.** Only fixes after this. Tester signs off. |
| Nov 23–29 | Thanksgiving week: art import and fixes only, light load. |
| **Fri Nov 20** | First TestFlight build sent to **Beta App Review** (early, so review isn't on the critical path). Tier 3 art in, or tiers stay White–Yellow. Parent note and privacy page ready. |
| **Fri Nov 13** | **Accounts go/no-go.** No Apple or Google account by now means that platform uses the web link. Installs work on Jay's own phones (TestFlight internal, Play internal). |
| **Fri Nov 6** | Cloud builds for iPhone and Android work. |
| **Fri Oct 30** | Account answer from Nic. Lawyer booked. Android build on Jay's phone. |

---

## 4. Board items

Owners: Programmer, Artist, Content Designer, Tester, Jay, Manager, Researcher & Planner (me).

| ID | Owner | What | Done when (a tester can check) | Waits on |
|---|---|---|---|---|
| B-ACCT | Jay | Ask Nic if Tarnished Labs has Apple Developer and Google Play **organization** accounts. Get access, or enrol new ones. | Jay can sign in to App Store Connect and Play Console and see the team. | — |
| B-LAW | Jay | Book the lawyer. Show them the parent note and privacy page. | A meeting date is on Jay's calendar, and the lawyer's notes are in `jay/`. | B-DOCS |
| B-WRAP | Programmer | Capacitor 8 wrap (M8-a): landscape, safe areas, pause in background. | The Android build installs on Jay's phone, plays a full floor, and resumes after switching apps. | — |
| B-CI | Programmer | Cloud builds: GitHub Actions makes a signed iPhone build (macOS runner) and Android build. | A push makes both builds, and they show up in TestFlight and Play internal testing. | B-ACCT, B-WRAP |
| B-BELT | Programmer | Grown-up belt entry (D2), behind the grown-up gate. Plays the real reward moments. | A tester enters "Yellow, 2 stripes" after the gate question. The game shows Yellow, unlocks the right things, and still shows it after restarting. | — |
| B-SAFE | Programmer | Kid-safety items: outside links behind the gate, a wipe-data button, a "saved on this phone" note. | Every outside link asks the gate question first. Wipe returns to a fresh start. The note shows on first launch. | — |
| B-MENU | Programmer | P-MENU-a to e. | Every button is at least 44 pt, shows press feedback, and the grid doesn't jump (P-MENU checks). | PR #228 |
| B-ART3 | Artist | Tier 3 (Orange) room art, enemies and Guardian. | The art files are in `incoming-art/` and approved by Jay **by Nov 20**. | Jay's bestiary OKs (J15) |
| B-T3 | Programmer | Import tier 3, or set the "next floor opens soon" note. | An Orange-belt profile plays tier 3 to its Guardian, or sees the note if B-ART3 slipped. | B-ART3 |
| B-DOCS | Researcher & Planner | Parent beta note (one page), privacy page draft, TestFlight beta description, feedback email text. | All four drafts are in `drafts/planning/` for Jay and the lawyer. | — |
| B-TESTERS | Jay | Pick 5–10 families. Collect each parent's Apple email (iPhone) or Google email (Android), plus their OK. | A list with names, phone type, email and an OK for each family. | B-DOCS |
| B-BETAREV | Programmer | Send the first build to TestFlight external testing (Beta App Review). | App Store Connect shows the build "Approved" for external testing. | B-CI, B-DOCS |
| B-QA | Tester | Full beta pass on a small and a large phone, both platforms (or web). | A QA report says READY with no blocking bugs. | B-BELT, B-SAFE, B-T3 |
| B-SEND | Manager | Freeze Dec 4. Invite testers Dec 7. Fall back to the web link where needed. | Every tester family has the game installed and opened by Dec 15. | B-QA, B-TESTERS, B-BETAREV |
| B-FEEDBACK | Manager | Collect beta feedback into one place, weekly from Dec 15. | One feedback file with each note, its date and an owner. | B-SEND |

---

## 5. Left for Jay to decide

| # | Question | My recommendation |
|---|---|---|
| D-B1 | Families on iPhone: TestFlight external testers (one Apple review) or the web link? | **TestFlight external,** with the web link as backup. It feels like the real app and tests the real thing. |
| D-B2 | Who reads feedback screenshots? Is it OK that Apple and Google show us testers' emails and crash counts? | **Yes, with a plain note to parents** asking for no child names or faces in screenshots. |
| D-B3 | Does the lawyer need to see the parent note before Dec 7, or can that wait for the store launch? | **Have the lawyer glance at the one-page note before Dec 7.** The full review comes before the store launch. |
| D-B4 | When to set the store launch date? | **Pick it in mid-January,** after 3–4 weeks of beta feedback and Nic's date for the DojoForge link. |
| D-B5 | If Google's account turns out to be a new personal account, start the 14-day closed test during the beta? | **Yes.** It costs nothing extra and removes a store-launch blocker. Needs 12+ opted-in testers, so invite some staff too. |

## Sources (opened Oct 25, 2026)
- Apple TestFlight: https://developer.apple.com/testflight/
- TestFlight overview (90 days, first build review): https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview
- Apple App Review: https://developer.apple.com/distribute/app-review/
- Google Play test tracks (internal up to 100 testers): https://support.google.com/googleplay/android-developer/answer/9845334
- Google Play testing rule for new personal accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Capacitor support policy: https://capacitorjs.com/docs/main/reference/support-policy

**Numbers I could not find:** Beta App Review wait time, how long developer account sign-up takes today, and whether TestFlight external testing needs a privacy policy URL.
