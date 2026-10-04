# Research basis

This pack was rebuilt from research rather than taste. Each finding below produced a design rule; the rule is cited by number elsewhere (for example "R3"). Sources are listed so a later reviewer can check them.

## R1. Why people play MMOs: achievement, social, immersion

Nick Yee's factor analysis of MMORPG player surveys found 10 motivation subcomponents grouped into three components: Achievement, Social, and Immersion. In a later breakdown of primary motivations, the top three (progress, immersion, exploration) showed no substantial gender difference, and exploration, immersion, and socializing had the highest average player age. In the survey of ~3,000 players, age correlated negatively with Competition (r = −.34).

Sources: Yee, "Motivations of Play in MMORPGs," DiGRA 2005 (https://dl.digra.org/index.php/dl/article/view/239); Yee, "Motivations for Play in Online Games," CyberPsychology & Behavior 2006; Yee, Daedalus Project "Primary Motivations" (https://nickyee.com/daedalus/archives/print/001612.php); summary at https://summit.sfu.ca/item/212.

Design rules:
- Serve all three components on every floor: a race and gear ladder (achievement), parties, raids, guilds and houses (social), and 12 hand-placed secrets plus lore (immersion/exploration).
- The Tibia OT audience is largely returning, older players. Competition alone will not hold them. PvP stays, but it is bounded (R3), and exploration gets as much content budget as the boss race.

## R2. What keeps players: social ties first

Debeauvais, Nardi, Schiano, Ducheneaut and Yee studied retention in a cross-cultural survey of 2,865 World of Warcraft players. A log-data study of a Taiwanese MMO found the number of friends was a good indicator of retention and stayed significant through all phases of a player's life in the game; an EverQuest II study likewise found peer social influence predicted retention better than other signals.

Sources: Debeauvais et al., "If you build it they might stay: retention mechanisms in World of Warcraft," FDG 2011 (https://www.artifex.org/~bonnie/WoW_retention_04_24_11.pdf); "Achievement and Friends: Key Factors of Player Retention Vary Across Player Levels in Online Multiplayer Games," WWW 2017 (https://arxiv.org/abs/1702.08005).

Design rules:
- Party play must beat solo play per hour (+10% XP per extra distinct path, cap +30%), without making solo unviable.
- Guilds exist from minute one; guild halls are status, not permission.
- Houses, monuments, strategy books, and the raid-of-20 floor boss create shared stories. These are retention systems, not decoration.
- Secrets deliberately create trust tests inside parties (owner intent). That is social content: it produces stories and reputation.

## R3. Unbounded PvP drives players away

Ultima Online launched with almost unrestricted player killing. Its producer described gangs roaming servers within four to five months. The developers eventually created a separate mirror world (Trammel) where only consensual PvP could happen, and almost all player activity moved there. Raph Koster has written that UO churned through more than twice as many quitting players as EverQuest had subscribers that year. Foo and Koivisto's work on grief play found griefers and achievers share a desire for power and control, and that unsolicited player killing is the most direct form of griefing.

Sources: Rich Vogel interview via Ultima Codex (https://ultimacodex.com/2011/03/gamasutra-replay-interviews-rich-vogel/); Koster, "The neverending griefing discussion" (https://www.raphkoster.com/?p=46381); Foo & Koivisto, "Defining grief play in MMORPGs," ACE 2004 (doi 10.1145/1067343.1067375); Yee, "Faces of Grief" (https://nickyee.com/daedalus/archives/print/000893.php).

Design rules:
- Open PvP outside protection zones (owner intent) with real costs for unjust kills: escalating skulls, corpse exposure, house lockout, and guard response.
- Protection level 20 in the open world so new players learn the game before they can be hunted.
- Consensual escalation paths for players who want more PvP: guild war contracts (no skulls), and the boss rooms where protection level does not apply.

## R4. Economies inflate unless sinks exist from day one

Lehdonvirta and Castronova (Virtual Economies, MIT Press) describe the faucet–sink model: when faucet inflow exceeds sink outflow, inflation follows; designers often fail by not implementing sinks early; because players dislike losing assets, the most effective sinks are often the least acceptable, so sinks should be disguised as gameplay, and desirable status sinks (cosmetics) beat punitive ones. Castronova's team observed EverQuest II prices inflate more than 50% in five months as players flooded in.

Sources: book summary at https://www.antoinebuteau.com/virtual-economies-book-summary/; NBC News on the EverQuest II study (https://www.nbcnews.com/news/amp/wbna33120802).

Design rules:
- Every faucet in `07_ECONOMY.md` has a matching sink in place before launch.
- Sinks are gameplay: consumables, teleport fees, upgrade fees, rent, cosmetics, copy fees. No durability tax.
- The server measures money supply daily and the tuning order is fixed: cut mob col first, never add punitive taxes, add a cosmetic sink if needed.
- Materials, not coins, are the real economy; boss materials gate power.

## R5. Botting follows boredom and is an industry

De Paoli and Kerr's case study of Tibia describes cheating software as a business that innovates in response to anti-cheat breakdowns ("we will always be one step ahead"). OT community estimates (anecdotal, not measured) range from 20–30% botting on 7.4 servers to most players on 8.6 and 10.x servers. Long-time OT developers repeat one theme: players bot what is boring and repetitive; custom clients and custom content reduce, but never eliminate, botting.

Sources: De Paoli & Kerr, Journal of Virtual Worlds Research 2(4), 2010 (https://mural.maynoothuniversity.ie/id/eprint/2418/); OTLand threads https://otland.net/threads/about-bots.211280/ and https://otland.net/goto/post?id=2068511.

Design rules:
- Custom client required, no built-in bot module, custom opcodes for skills.
- Content that rewards attention: telegraphed boss mechanics, puzzle secrets, rotating tasks. Daily caps on the most farmable faucets.
- Detection logs, manual review, no automatic ban waves in v1.

## R6. The OT market in numbers

A monitoring site tracking ~500 OT servers reported about 28,000 average concurrent players across the whole scene in mid-2025, with daily peaks of 34,000–39,000. Client 8.60 led (179–185 servers), then 13.40 (~45), 7.72 (39), and 10.98 (33). Brazil hosted 224 servers and the United States 94. In August 2025, 120 servers joined and 129 shut down.

Source: otservers.online monthly summaries, posted at https://otland.net/threads/otservers-crafting-the-ultimate-open-tibia-experience.292559/page-2.

Design rules:
- 500 concurrent would put Spirebound near the top of the whole scene. Engineer for 500 (owner intent) but make every system work and feel alive at 60–150, which is where most servers live.
- Server churn is extreme. Stability, uptime, and a clear identity matter more than feature count at launch.
- US East hosting serves North and South America.

## R7. What OT players say they want (qualitative, forum)

Recurring themes on OTLand, 2010–2026: pay-to-win visible on a website drives new players away immediately; a server must be clearly different from dozens of similar launches; players want to see other players (one compact hub beats a sprawling map); staff presence and stability matter; custom clients are accepted when the content is custom, though some players fear trojans; low experience rates are popular with veterans. A September 2026 thread asking why a new server could not keep players drew answers on pay-to-win popups, lack of uniqueness, and an oversized map.

Sources: https://otland.net/threads/looking-for-honest-feedback-about-varones-ot-why-arent-new-players-staying.305389/ ; https://otland.net/goto/post?id=2539004 ; https://otland.net/goto/post?id=143857 ; poll (n=23, weak) https://otland.net/threads/what-kind-of-server-would-you-want-to-play.303594/.

Design rules:
- No shop at launch. The website front page says "No pay-to-win. Ever." A cosmetic shop may follow beta.
- Hearthgate is the single social hub: monuments, market, Vesper's main board, and the teleport plaza. Later floor towns are small.
- Signed Windows client, published hashes, open-source client fork link on the website (trust).
- XP pace is slow-to-moderate and set by hours, not a "rate" (see `data/economy_check.md`).

## R8. Competitors with the same theme

At least two Sword Art Online–themed OT servers have run publicly: one on client 12.85 that gates floors by killing the current floor boss and advertised 47+ floors, and one on 13.11 with a No-PvP ruleset. Both use standard Tibia graphics.

Sources: https://otland.net/threads/sweden-12-85-sword-art-online-saot-live-now.282270/ ; https://otland.net/threads/germany-13-11-sword-art-online-aincrad-custom-server.291306/

Design rules (differentiation):
- World-first race with a shared, PvP-contested boss room and a monument — not just per-floor gating.
- Original art and names (also a legal safety margin).
- The secret broker economy and the growing Underkeep.
- Real skull PvP with protection zones, rather than No-PvP.

## Evidence quality note

R1–R4 are peer-reviewed or published research. R5 mixes one peer-reviewed study with forum estimates. R6 is site telemetry. R7 and R8 are forum evidence and should be treated as signals, not measurements. Beta telemetry (16_SCALE_OPS_ANTICHEAT) replaces assumptions with Spirebound's own data.
