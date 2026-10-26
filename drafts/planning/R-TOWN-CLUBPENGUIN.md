# R-TOWN-CLUBPENGUIN: Club Penguin as the model for the live town square

## Delivery Note
- **ITEM:** R-TOWN-CLUBPENGUIN (research, docs only).
- **WHAT:** how Club Penguin (2005–2017) kept a kids' online world safe, what went wrong, and what fits Dojo Ascent's live town square (core-design section 11, step 2).
- **WHY:** step 2 lets classmates see each other in real time. Club Penguin is the best-known kids' world that tried this at scale.
- **DECIDE:** see "Questions for Jay" at the end.
- **NEXT:** the Manager boards any recommendation Jay approves. None of it is in the Dec 15 beta or the launch list: the live town square is a post-launch feature (core-design section 13).

## What our design already says (section 11)
- Step 2: classmates online at the same time walk around the town, wave, bow and use preset emotes.
- No free-text chat, ever. Same school only. First name and last initial, or a school nickname.
- Parents can turn multiplayer off, make the dojo private, and hide any player.
- Jay's decision: a big preset phrase menu that kids build messages from, with phrases added over time (R-PHRASES, low priority).

## What Club Penguin did
All facts below come from the linked sources. Where a source is a fan wiki, I say so.

1. **Who it was for.** It was built for ages 6 to 14, but anyone could join. The founders (Lance Priebe, Lane Merrifield, Dave Krysko) wanted "something that had some social components but was safe, and not just marketed as safe" for their own kids. [Wikipedia][wp]
2. **Two chat modes.** [Wikipedia][wp], [CP Wiki: Ultimate Safe Chat][usc] (fan wiki)
   - **Ultimate Safe Chat:** kids could only pick staff-written phrases from a menu sorted by topic. They could not type.
   - **Standard Safe Chat:** kids could type, but a filter checked everything. It blocked swearing (even "creative" spellings), phone numbers, email addresses, and even harmless words like "mom".
   - Some servers allowed Ultimate Safe Chat only.
   - Staff changed the phrase list from time to time. During parties the menu got an extra category for that party.
3. **A quiet filter.** When a typed message was blocked, the sender still saw it, but nobody else did. The sender thought they were being ignored, so they had no reason to try to get around the filter. [Wikipedia][wp], citing AP (Jesdanun, 2007)
4. **People, not just code.** It used paid moderators. In May 2007, Merrifield estimated that about 70 of its 100 staff worked on policing the game. [Wikipedia][wp], citing the San Francisco Chronicle (Garofoli, 2007)
5. **Kids as helpers.** Players were asked to report bad behaviour and could become part of the "Penguin Secret Agency", so keeping the place safe felt like a shared job. [Wikipedia][wp]
6. **Bans.** Swearing often led to an automatic 24-hour ban. Moderators gave bans "from 24 hours to forever depending on the offense." [Archived CP help page "Breaking the Rules"][ban], [Wikipedia][wp]
7. **Usernames were checked,** so names couldn't be rude. [Wikipedia][wp], citing the Washington Post (2007)
8. **Parent Tools.** A parent account could switch chat modes, set a play-time timer, and see ban history and daily login time. [CP Wiki: Parent Tools][pt] (fan wiki), [archived Parents' Guide][pg]
9. **No ads.** Merrifield: "within two or three clicks, a kid could be on a gambling site or an adult dating site." [Wikipedia][wp]
10. **Emotes.** A menu of faces and symbols (happy, sad, laugh, pizza and so on) shown in speech bubbles, with one-key shortcuts. [CP Wiki: Emoticons][emo] (fan wiki)
11. **Shared rooms and parties.** The island was split into rooms, and each player had an igloo home. Almost every month there was a themed party: rooms were decorated, music changed, free items and quests appeared, and staff-run mascots visited. The parties grew from about 5 days in the early years to over a month by 2016. [Wikipedia][wp], [CP Wiki: Parties][par] (fan wiki)
12. **Coins for Change:** a December event where kids "donated" game coins to vote for real charity causes. [Wikipedia][wp]

## What went wrong or was criticized
1. **The filter leaked.** Some messages still got through. Bullying moved to angry emotes and nonstop snowball throwing. [Wikipedia][wp], citing Bauman & Tatum (2009)
2. **Talk moved off-site.** Fan forums outside the game were not filtered, and one writer said they could be "as bawdy as any other chat". [Wikipedia][wp]
3. **Strangers.** Its own comms director said "we cannot guarantee that every person who visits the site is a child." Caitlin Flanagan (The Atlantic) called it "certainly the safest way for unsupervised children to talk to potentially malevolent strangers—but why would you want them to do that in the first place?" [Wikipedia][wp]
4. **Memberships made a class system.** Most money came from paid memberships. The game was "full of advertisements" for membership, with items and game levels locked to members. Critics described a "caste system" between members and non-members, and said the game pushed shopping and status. [Wikipedia][wp]
5. **Ban speedruns.** In its last weeks, people raced to get banned by swearing. The fastest times were under 40 seconds. [Polygon][poly] (the link failed from my box, so I couldn't confirm it)
6. **Closure.** Club Penguin shut down on March 30, 2017, and its successor Club Penguin Island closed the next year. Kids lost their worlds. [TechCrunch][tc], [Wikipedia][wp]
7. **Private servers.** Unofficial copies spread with weaker safety:
   - Some had database leaks and attacks.
   - In May 2020, Disney sent copyright takedowns after reports of explicit chat and an alleged predator admin on "Club Penguin Online". [BBC][bbc], [The Verge][verge]
   - In 2022, London police seized "Club Penguin Rewritten". [Wikipedia][wp]

   The lesson: when the official safe space goes away, kids follow the brand to places with no safety at all.

## What fits Dojo Ascent

| Club Penguin idea | Fits us? | Why |
| --- | --- | --- |
| Ultimate Safe Chat menu | **Yes, and it is our only mode** | We never add Standard Safe Chat. This is R-PHRASES. |
| Party phrase category | **Yes** | It is a clean way to add phrases over time for events. |
| Emote menu | **Yes** | It is already step 2 (wave, bow, emotes). |
| Typed chat with a filter | **No** | It leaked and needed about 70% of staff. No free text, ever. |
| Paid moderators | **Mostly not needed** | With no free text, there is far less to moderate. We still need a way to report and hide. |
| Bans | **Changed** | Hiding a player and a grown-up review, not punishment for kids. |
| Kids as safety helpers | **Maybe** | A gentle "tell a grown-up" button, with no rewards for reporting. |
| Parent tools (mode, timer, history) | **Yes** | We already have a play-time limit and multiplayer off. |
| Monthly parties and mascots | **Yes, gently** | Matches our Open House events. They must not cause FOMO, so no missable-forever rewards. |
| Memberships and locked items | **No** | No purchases or memberships. Everything is earned. |
| Ads | **No** | Same as Club Penguin's own rule. |
| Strangers | **Already solved** | Same school only, and parent consent goes through DojoForge. |
| Off-site forums and private servers | **Watch** | We can't control them. Plan a kind ending so the official space never just vanishes. |

COPPA: Club Penguin's preset-chat approach is the same idea as ours: no way to share personal details. The rule itself is at [16 CFR Part 312][coppa]. This isn't legal advice; core-design section 11 already asks for a lawyer review.

## Recommendations (proposals, not launch scope)
None of these are for the Dec 15 beta or launch. The live town square comes after launch.
1. **Build the town square on R-PHRASES only:** a menu of phrase chunks sorted by topic (greet, praise, follow, thanks), with no keyboard anywhere. Scope: post-launch, step 2. R-PHRASES design work could start any time since it is low priority.
2. **Add a seasonal phrase category for each event** (as Club Penguin did for parties), so new phrases arrive with Open House days and holidays. Scope: post-launch.
3. **Replace bans with quiet tools:** any player can hide another (already in the design). A "tell a grown-up" button sends the case to the instructor or parent, with no public punishment and no reward for reporting. Scope: post-launch, and it needs a small instructor view in DojoForge.
4. **Run gentle monthly town events:** decorations, music, a Sensei visit. Any event item comes back later, so no one misses out forever. Scope: post-launch. It is cheap once the square exists.
5. **Plan a kind ending:** if the live square ever shuts down, give notice in-game and to parents, and keep each kid's dojo and trophies playable offline. Scope: a written policy before launch is enough.

## Questions for Jay
1. Reporting: should a "tell a grown-up" report go to the instructor, the parent, or both?
2. Should event items return every year (no FOMO), or be one-time keepsakes?

[wp]: https://en.wikipedia.org/wiki/Club_Penguin
[usc]: https://clubpenguin.fandom.com/wiki/Ultimate_Safe_Chat
[ban]: https://web.archive.org/web/20080723123728/http://support.clubpenguin.com/help/help/safety.htm
[pt]: https://clubpenguin.fandom.com/wiki/Parent_Tools
[pg]: https://web.archive.org/web/20080705192151/http://www.clubpenguin.com/parents/club_penguin_guide.htm
[emo]: https://clubpenguin.fandom.com/wiki/Emoticons
[par]: https://clubpenguin.fandom.com/wiki/Parties
[poly]: https://www.polygon.com/2017/2/22/14698354/club-penguin-ban-speedruns
[tc]: https://techcrunch.com/2017/01/31/club-penguin-is-shutting-down/
[bbc]: https://www.bbc.com/news/technology-52677039
[verge]: https://www.theverge.com/2020/5/15/21260122/club-penguin-dmca-disney-takedown-cponline-online
[coppa]: https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312
