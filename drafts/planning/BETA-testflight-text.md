# TestFlight and Google Play test text (build 1)

> **DRAFT.** Fill in [brackets]. A **(D-B#)** tag marks text that depends on a decision Jay hasn't made yet. Assumes D-B1 = TestFlight **external** testers (needs Beta App Review).

## Field names (from Apple and Google)
- **Test Information** (TestFlight → Additional → Test Information): **Beta App Description** (required) and **Feedback Email** (also the reply-to address for invites) ([Apple: Provide test information](https://developer.apple.com/help/app-store-connect/test-a-beta-version/provide-test-information/)).
- **Beta App Review information** is required to share with external testers ([Apple TestFlight](https://developer.apple.com/testflight/)).
- **What to Test** is shown to testers in TestFlight before they install a build ([Apple Tech Talk](https://developer.apple.com/videos/play/tech-talks/110343/)).
- **Privacy Policy URL** is required for iOS apps at the app level ([App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/)). **I couldn't confirm** whether external TestFlight needs it before the first App Store submission. Have it ready anyway.

**Character limits:**
- **I couldn't find official limits** for Beta App Description, What to Test, or the TestFlight review notes in Apple's Help pages. Each text below is kept under 1,000 characters to be safe.
- The only official number I found: the App Store **App Review "Notes"** field allows **4,000 bytes** ([Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/)). That's for App Store review, not confirmed for TestFlight.

## Beta App Description
> Dojo Ascent is a martial-arts adventure for Action Zone students, ages 6 and up. Climb the Tower, beat friendly monsters, earn gear and build your own dojo. The game follows the belt your child is really working on in class.
>
> This is an early beta for a few Action Zone families. Some parts are unfinished. There are no ads, purchases, chat or accounts, and progress is saved only on this device.

## Feedback Email
> [feedback email, e.g. beta@…]

## What to Test (build 1)
> Thank you for testing! Please try:
> 1. A grown-up: open Settings, answer the grown-up question, and enter your child's belt and stripes.
> 2. Play the first Tower floor. Was anything confusing or too hard?
> 3. Visit the Home Dojo and add a decoration.
> 4. Close the app mid-climb and open it again. Did the climb come back?
>
> Send a screenshot from inside the game, or tap Send Beta Feedback in TestFlight. Please leave your child's name and face out of screenshots. (D-B2)

## Beta App Review information
- **Contact:** [first name], [last name], [phone with + country code], [email]
- **Sign-in required:** **No.** The app has no login.
- **Review notes:**
> Dojo Ascent is a game for children (ages 6+) at one martial-arts school, Action Zone. This build is for a small family beta.
> - No login, accounts, ads, in-app purchases, chat, analytics or third-party SDKs. All progress is stored on the device.
> - Grown-up gate: Settings is behind a math question that a young child is unlikely to answer (for example, a multiplication). Answer it to reach the play-time limit and belt entry.
> - To see higher content: after the gate, enter a belt (for example, Orange, 2 stripes). [Exact steps once B-BELT is built.]
> - Without a belt entered, the game starts at White belt with a short tutorial floor.
> - Read-aloud in the Street Smarts story uses the device's built-in voice.

## Google Play internal test: release notes
Limit: **500 characters per language**, between language tags ([Play Console: Prepare and roll out a release](https://support.google.com/googleplay/android-developer/answer/9859348)). The text below is 321 characters with the placeholder.
```
<en-US>
First beta for Action Zone families! Climb the Tower, earn gear, and build your dojo. A grown-up can enter your child's belt in Settings (behind a grown-up question). No ads, purchases, chat or accounts; progress stays on this phone. Feedback: [feedback email]. Please leave children's names and faces out of screenshots.
</en-US>
```
