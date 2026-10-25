# Dojo Ascent privacy policy: DRAFT

> **DRAFT. Needs legal review. This is not legal advice.**
> Written by the Researcher & Planner from what the code does on Oct 25, 2026 (repo `main`). Text in [brackets] is a placeholder. A **(D-B#)** tag marks text that depends on a decision Jay hasn't made yet. If the code changes (for example the DojoForge link or server saves), this page must change too.

**Who we are:** [Company name: Tarnished Labs? / Action Zone?], [address], [contact email]. Last updated: [date].

## The short version
Dojo Ascent is a martial-arts game for children who train at Action Zone.
- **We don't collect any personal information from the game.**
- There are no accounts, no ads, no purchases, no chat and no tracking tools.
- Your child's progress is saved **only on your device**.

## What the game stores on your device
The game saves these items in the device's local storage (browser `localStorage`). They never leave the device:

| What | Why |
|---|---|
| Game progress: belt-tier progress, gear, best scores, dojo decorations, Monster Journal, character look, lessons seen | To keep your child's game between plays |
| A Tower climb in progress | So closing the app doesn't lose a climb |
| Daily play-time clock and the grown-up's play-time limit | For the play-time limit |
| Settings: music and sound volume, reduced motion, read-aloud on or off, move style, which grown-up (Mom or Dad) appears in Street Smarts stories | To remember choices |
| Belt and sign-offs a grown-up enters **(planned, B-BELT)**. In early test builds, a choice of practice profile | So the game matches real class progress |

The game does **not** ask for or store your child's name, birthday, photo, location or contacts.

## What the game sends over the internet
- **From the game code: nothing about your child.** The only network request in the code loads the game's own music files from the game's own files.
- **Read-aloud:** Street Smarts stories can be read aloud using the device's built-in voice (the Web Speech API). **[UNKNOWN: on some devices the voice provider may process text online. The text is the story script, not anything about your child. Lawyer and Programmer to check.]**
- **Web version only:** when the game is played at the web link, our host, Cloudflare, receives normal web-request information such as IP address, as any website does. [Link to Cloudflare's privacy policy; lawyer to check.]

## The beta (TestFlight and Google Play testing)
Beta testers are **parents**, invited by their own email. Apple (TestFlight) and Google (Play testing) share with us:
- the tester's email
- the number of sessions
- crash reports
- any feedback or screenshots the parent chooses to send

This data is handled under Apple's and Google's own privacy policies: [links]. We use it only to fix the game, and delete it [when / how long?]. **(D-B2)** Please leave your child's name and face out of screenshots.

## Children's privacy
- The game is made for children ages 6+ and collects no personal information from them.
- A grown-up question guards settings such as the play-time limit and belt entry.
- To delete everything, delete the app (or clear site data for the web link). [In-app "wipe data" button, planned under B-SAFE.]

## Changes and contact
If we start collecting anything (for example, a future link to DojoForge accounts), we'll update this page and ask parents first. Questions: [contact email].

---

## Points for the lawyer to check (not part of the public page)
1. **COPPA** (amended rule; compliance required since Apr 22, 2026: [Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule)). With no personal info collected by the app, is a notice like this enough? Does the beta's parent-email collection (through Apple and Google) need anything more?
2. **Who is the "operator":** Tarnished Labs, Action Zone or Jay? That decides the name at the top.
3. **Apple:** iOS apps must have a Privacy Policy URL ([App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/)). **Kids Category** rules (guidelines 1.3 and 5.1.4, [guidelines](https://developer.apple.com/app-store/review/guidelines/)). Note that once an app marked "Made for Kids" is approved, Apple says **that choice can't be changed** (same App information page). (D8)
4. **Google Families** policy and the Data safety form ([Families](https://support.google.com/googleplay/android-developer/answer/9893335)). Internal tests are exempt from the Data safety section ([testing help](https://support.google.com/googleplay/android-developer/answer/9845334)), but the store launch isn't.
5. **Read-aloud voices** (see UNKNOWN above) and **Cloudflare logs** for the web link.
6. **The future DojoForge link** (accounts, server saves) needs a new review and parent consent through DojoForge.
