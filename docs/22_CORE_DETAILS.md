# Core details

Small rules that every OT player notices on day one. If a rule here conflicts with an earlier doc, the earlier doc's topic owner wins (00 authority order) and the conflict goes in STATUS.md known_gaps.

## Character basics

| Rule | Value |
|---|---|
| Characters per account | 1 at launch |
| Name | 3–20 letters, letters/spaces/apostrophe, max 3 words; banned-word lists in EN/PT/ES plus tools/banned_names.txt; no staff-like words (GM, CM, Admin, Tutor, Staff, God) |
| Capacity (oz) | 400 + per level: Vanguard 25, Cleaver 20, Shade 15, Slinger 20, Arcanist 10; +2 per VIT point |
| Item weights | Weapons 30–80 oz (greatswords heaviest), shields 50–90, heavy armor 60–120, light 30–60, robes 20–35, materials 0.5–2 each, salves 1.5, arrows 0.7, coins 0.1 |
| Base speed | 220 + 1 per level (level part capped at +130) + AGI (06) |
| HP regen | Fed and out of combat (no damage taken 5 s): 1% max HP every 3 s. Fed in combat: 0.3% every 3 s. Unfed: none |
| Food | Each food adds its listed duration; total fed time caps at 20 minutes |
| Backpack | Starter backpack 20 slots; bigger bags from shops (24 / 28 slots) |

## Onboarding (first 10 minutes)

1. New characters arrive in the Arrival Yard, a walled courtyard of Hearthgate (no PvP, no other monsters).
2. A five-step guided path: move, attack a training target, use your starter skill, drink a salve, open the quest log. Each step shows one line of text. Skippable at any time.
3. The path ends at Orm the Registrar, who explains PvP zone colors in two sentences and gives the first quest.
4. Starter Fields (05 Guarded tier): three fields around Hearthgate with Field Rats, Hopper Toads, and Sproutlings (data/monsters.csv). Target: level 8 in about 45 minutes. Big fields with fast respawn, sized for a launch crowd of ~150 new players.

## Logout, idle, saves

- Logout is blocked during a PZ lock or within 60 s of combat. Closing the client during that time leaves the character in the world until the lock ends.
- Idle kick: 15 minutes with no movement, attack, or speech outside protection zones; 30 minutes inside.
- Player save on logout and every 10 minutes (staggered so not everyone saves at once). Map and houses every 15 minutes. Full save at daily server save (05:00 ET).
- World-critical events write to the database immediately in one transaction: first kills and credit, secret discoveries and sales, house purchases and reverts, store grants, guild war contracts.
- First-clear rewards (titles, glow, loot row, Last Blow Shard) go to a Reward Chest at the Hearthgate monument, stored in the database, so a crash cannot lose them. Claim within 30 days.
- Crash policy: players roll back to their last save; world-critical events never roll back. Items of Tempered tier and above carry a unique serial; a daily job flags duplicate serials for review.

## Loot

- Corpse owner: the top-damage player or their party, for 10 s; then anyone.
- Party members can all open a party-owned corpse. Col is split automatically (05). Rare drops (Keen recipe scraps, Spire Scrap, Tempered mats) are announced in the party channel.
- Loot messages go to a Server Log channel so players can check what dropped.

## Depot, mail, trade

- One shared depot across all towns (every depot box opens the same storage, 2,000 items), plus an inbox for mail and market.
- Hearthgate has three depot halls (north, market, south) so a launch crowd doesn't jam one building. Every other town has one.
- Secure trade window between players; market with 8% seller fee; parcels and letters by mailbox.

## Chat

| Channel | Rules |
|---|---|
| World (English) | Level 10+, one message per 15 s |
| Mundo (Português/Español) | Level 10+, one message per 15 s |
| Trade | Level 10+, one message per 2 min |
| Help | Anyone; tutors answer |
| LFG | Raid calls and party finder (17) |
| Guild, Party, Private | Normal |

Spam auto-mute: 5 identical or near-identical messages in 60 s → 5-minute mute. Profanity filter is a player option.

## Accounts and security

- Email verification on registration; recovery key shown once.
- Patch P11 password hashing. Rate-limited login and registration; captcha on registration.
- Two-factor authentication if the website software supports it at build time; otherwise listed as a post-launch item.

## GM tools

- Production GM commands: teleport, kick, mute, jail, ban, view logs, reset a stuck boss to full HP (logged with reason), broadcast.
- Not available in production: create items, give col, change levels, mark floors cleared. These exist only on staging.
- Every GM command is written to `gm_log` and posted to the private staff Discord channel.

## Time

All schedules use US Eastern. Server save 05:00 ET. No world events from 04:30 to 05:30 ET.
