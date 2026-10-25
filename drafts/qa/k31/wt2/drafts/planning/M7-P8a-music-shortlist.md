# M7-P8a: Music shortlist (3 free-licence packs)

> **Update (Oct 24, 2026):** WAFU replied; the pick, terms and open points are in `M7-P8a-music-decision.md`. The white-label question and the drafted WAFU email are resolved.

**For:** Jay · **Date:** 2026-10-24 · **Status:** Research only. Nothing is added to the game until you pick.

## What the game needs (from the docs)
- `docs/framework.md` §13: "A royalty-free music pack licensed for commercial use."
- `drafts/planning/next-plan-milestone-7.md` P8: one calm loop for the dojo, one for the Tower, plus volume sliders. Moods to cover: menus, dojo, exploring, battle, boss.
- Today all sounds are made in code, with no sound files (`docs/decisions.md`). Music will be the first audio files in the game.
- Rules I used: no "NonCommercial" (NC) licences; it must be OK in an app on the App Store and Google Play; check whether credit is needed.

I read each licence on its live page (2026-10-24). Quotes are copied word for word. **I'm not a lawyer.** Ask the lawyer about the final pick during the planned review before milestone 8.

---

## 1. WAFU Sound Works free volumes (Vol.35 Temple + Vol.29 Exploration + Vol.22 Bullet Hell) ⭐ my pick, with two checks

- **Links:**
  - Vol.35 The Mountain Temple: https://wafusoundworks.itch.io/wafu-vol35-japanese-temple-music-pack
  - Vol.22 Curtain of Fire: https://wafusoundworks.itch.io/wafu-vol22-japanese-bullet-hell-music-pack
  - Vol.29 The Long Road: listed as free on https://wafusoundworks.itch.io/wafu-free-sampler-japanese-game-music (store page: https://wafusoundworks.itch.io)
- **Licence:** WAFU's own "Royalty-Free" licence. It's not Creative Commons. The page says: "Full terms in LICENSE.txt. The license is identical to the paid packs."
- **Paid or sold app OK?** Yes: "✅ Unlimited commercial & non-commercial projects", "✅ Games, videos, streams, films".
- **Credit needed?** No: "✅ No credit required, no royalties, forever".
- **Redistribution:** "❌ No reselling/redistributing the audio itself; no streaming platform uploads; no AI training". Putting it inside our game is fine. Selling or sharing the music files on their own isn't.
- **Selling the game to other dojos (white-label):** **not stated on the page.** It must be checked in LICENSE.txt (inside the download) before we pick.
- **Tracks and loops:** each volume has "12 tracks + 8 cues, all looping" and "Full and Seamless Loop versions of every track". About 30 minutes per volume.
- **Formats:** "WAV (48kHz/16bit) and OGG, 64 files." OGG-only zips are offered too.
- **How it fits the moods:**
  - Temple: "The Great Hall" (hub) and "The Discipline" ("Training, practice, a skill screen") for the dojo and menus.
  - Exploration: road and forest music for the Tower.
  - Bullet Hell: "Stage", "Midboss" and "Boss" for battles and the boss. Its "Shop" track is "the only quiet track in the pack". Japanese instruments throughout.
- **⚠️ Risks:**
  - **Made with AI help.** The page says: "These tracks were composed with the assistance of generative AI (Suno, commercial plan)." In the US, music made mostly by AI may not get full copyright protection. That's a risk for the maker, but it can also mean we can't stop copycats using the same tracks. It's also a values question for you.
  - A custom licence means the full LICENSE.txt must be read. The bullet points aren't the whole licence.
  - The Bullet Hell tracks were written to feel "relentless" and "deliberately airless", so some may be too intense for ages 6+. Listen first.

## 2. BiteMe Games "Chinese Game Music" (CC0)

- **Link:** https://bitemegames.itch.io/chinese-game-music
- **Licence:** "Asset license: Creative Commons Zero v1.0 Universal" (CC0, public domain; deed: https://creativecommons.org/publicdomain/zero/1.0/).
- **Paid or sold app OK?** Yes: "You can use this asset for commercial projects, without attribution required."
- **Credit needed?** No (see the quote above).
- **Redistribution:** "You cannot resell this edit." That means don't sell the music files themselves. In-game use is fine.
- **Selling to other dojos:** CC0 itself doesn't limit this, and the page adds no extra rule about it.
- **Tracks and loops:** "2 pieces of music … Both songs are 60s long, and have a looping and non-looping version. One calm track (Lotus Pond) and one battle track (Dragon Dance)."
- **Formats:** not listed on the page (check the download).
- **AI:** "No generative AI was used."
- **⚠️ Risks:** only 2 one-minute tracks, so they'll repeat a lot. There's no boss or menu track. The pack is Chinese-styled (guzheng, flute, drums), while the Tower art leans Japanese (bamboo, paper screens).

## 3. OpenGameArt CC0 single tracks by Tozan (East-Asian style)

- **Links (each a CC0 page):**
  - "Asianoriental1" (koto, shakuhachi, strings): https://opengameart.org/content/asianoriental1
  - "RpJian" ("Strings with Koto, peaceful"): https://opengameart.org/content/rpjian
  - "Tyhosiasian": https://opengameart.org/content/tyhosiasian
- **Licence:** each page shows "License(s): CC0". RpJian also says "CC0 Attribution optional".
- **Paid or sold app OK?** Yes. CC0 gives up all rights (see the deed above).
- **Credit needed?** No.
- **Redistribution and selling to other dojos:** CC0 sets no limits.
- **Tracks and loops:** single tracks from one composer. The pages don't promise seamless loops. Formats are OGG (and MIDI for some).
- **AI:** not stated.
- **⚠️ Risks:**
  - Quality and loudness vary.
  - Not made as a set, and there's no clear battle or boss track.
  - We'd have to edit loop points ourselves.
  - OpenGameArt is user-uploaded, so the licence label is the uploader's own claim.

---

## Looked at, not shortlisted
- **Pixabay Music** (https://pixabay.com/service/license-summary/): free, with no credit needed. But its own summary says "only the full Content License is legally binding", and it bans selling content "on a Standalone basis". Tracks come from many different uploaders, with no matched loop set. More risk and more work for a kids' app.
- **Kevin MacLeod / incompetech** (https://incompetech.com/music/royalty-free/licenses/): the free option "Requires that you credit the music" (CC-BY). Credits are easy (one line on a credits screen), but this is a single-track library, not loops built for games.
- **NonCommercial (NC) licences:** not allowed for this game, so I skipped them.

## Ranking
1. **WAFU free volumes:** the only option that covers every mood (dojo, menus, exploring, battle, boss), with real seamless loops and no credit needed. Two checks first: AI-assisted, and white-label is unclear.
2. **BiteMe CC0:** the cleanest licence and made by a person, but only 2 short tracks.
3. **OpenGameArt CC0 (Tozan):** clean licence, but needs the most editing and lacks battle and boss music.

## My recommendation
**Pick WAFU**, as long as (a) you're OK with music made with AI help, and (b) LICENSE.txt allows selling the game to other dojos. If either answer is no, use **BiteMe CC0 for battle and dojo plus the Tozan CC0 tracks for calm screens**, and ask the Programmer to keep using the boss sound made in code.

## Decisions for you
1. Are you OK with AI-assisted music (WAFU)?
2. Will Dojo Ascent ever be sold or licensed to other dojos? If yes, the LICENSE.txt check is a must.
3. Should someone download WAFU and read LICENSE.txt? (Free download, nothing to buy. The Manager or Programmer can do it.)
