# Kids Category and Families rules check (Nov 26)

Apple's Kids Category and Google Play's Families rules, checked against the game's code on `main` (Nov 26) by Claude Code. This is a code check, not legal advice: the items at the end need Jay or the lawyer.

## What's fine

- **No outside servers.** The game loads only its own files. No web fonts (it uses the phone's own fonts), no files from other sites, no analytics, no ads, no crash reporters, no social logins. The only libraries are Phaser (the game engine) and Capacitor (the phone app wrapper), and neither sends anything anywhere.
- **No tracking.** No advertising ID, no cookies, no device fingerprinting. The save stays on the phone (the "Saved on this phone" note says so on first start).
- **Links that leave the game:** there are none right now. The one helper that could open an outside page (`openOutsideLink`) asks the grown-up question first, and nothing uses it yet. Any future link must go through it.
- **Grown-up question** (a sum to type) guards the grown-up settings and outside links.
- **No purchases, no chat, no free text** anywhere.
- **Android app:** asks only for the internet permission (needed later for DojoForge). No advertising ID permission.
- **The beta web link's offline helper** keeps copies of the game's own files only and never sends anything.

## Fixed today

- **Read-aloud voice (Street Smarts, kata practice).** Some browsers, mainly Chrome on a computer, use an online Google voice by default, which sends the words to Google. The game now only uses voices that run on the device. If a device has only online voices, the game stays quiet and the words stay on screen.

## For Jay

1. **Cloudflare Web Analytics must stay off** for the game's sites (live, previews and the beta link). It's a setting in the Cloudflare dashboard that the code can't see. Please check: Cloudflare → the `dojo-ascent` site → **Metrics/Analytics** → Web Analytics should say not enabled.
2. **Android backup:** the Android app lets the phone back up the save to the parent's Google account (`allowBackup`). That's good for families (progress survives a new phone), but it is a Google service holding the child's game save. Keep it, or switch it off?
3. **Store forms** (when the store builds are ready): Apple's privacy label "Data Not Collected", Google's Data safety "No data collected or shared", the age rating questions, and Google's target audience (under 13). The game qualifies for all of these as it is today.

## For the lawyer

1. **A privacy policy page.** Both stores require one, even for a game that collects nothing. It needs a web address (it can live on the school's site).
2. **DojoForge connection (later milestones).** Once the game reads a student's progress from DojoForge, the game handles a child's first name, last initial and rank. Check how parental consent (COPPA in the US) is covered: through the school's enrollment paperwork, or inside the game.
3. **Multiplayer (later).** Same-school visits and names (first name plus last initial) need the same review before they ship.

## For the app milestone (B-CI)

- **Apple privacy manifest:** the iOS app needs a `PrivacyInfo.xcprivacy` file saying "no tracking, no data collected". It has to be added through the Xcode project, so it belongs with the iOS build work (GitHub's macOS runner), not done here.
- **Unused Firebase hook in the Android build files:** Capacitor's starter files switch on Google's Firebase only if a `google-services.json` file is present. It isn't, so nothing runs, but removing those lines at the app milestone makes the Families review simpler.
