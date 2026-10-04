# What Claude Cowork cannot do (or should not do) for this project

Cowork can do most of the build: every design table, all Lua, the C++ patches, the Python toolchain (asset builder, map compiler and renderer, loot sim, economy report, load bot), procedural art, placeholder art, NPC dialogue, quests, secrets, the website pages, docs, and launch copy. The items below need someone else.

## Owner (you)

| Task | Why Cowork can't | When |
|---|---|---|
| Buy hosting (production VPS + staging), domain, DNS, DDoS protection, off-site backup storage | Requires payment and accounts | Before phase 8 (staging by phase 2) |
| Create and own the GitHub org/repo, Discord server, server-list accounts, email | Accounts in your name | Phase 0 |
| Give the build agent SSH access to staging/production (or run the deploy script yourself) | Credentials are yours to grant | Phase 2+ |
| Buy a Windows code-signing certificate and sign the installer | Identity verification | Phase 7 |
| Playtest at every OWNER gate and write notes in STATUS.md | Judgment of fun is the owner's | Phases 0, 2, 9 |
| Post launch text on OTLand / server lists / Discord; answer the community | Account-bound and human-facing | Phase 9 |
| Legal check of the fan-inspired SAO theme and the IP disclaimer | Legal advice | Before public beta |
| Recruit at least one human GM/moderator; make ban decisions | Human judgment, 24/7 presence | Phase 9 |
| Open Stripe and PayPal accounts, choose the legal entity that receives money, tax setup, lawyer review before charging | Identity, contracts, legal advice | Phase 10 |
| Fill in OWNER_INPUT.md as you have time | Your player experience is design input nobody else has | Any time |

## Grok (image generation) — or a human pixel artist

| Task | Notes |
|---|---|
| Player outfits (5 paths × 2 sexes, 4 directions, walk frames) | Animation consistency across directions is the hardest art problem. If Grok's output is inconsistent, commission a human pixel artist for outfits and bosses only |
| ~60 monster sheets, bosses at 64 × 64 | Batches from 18b_ART_PROMPTS.md |
| Item icons (~180), furniture/props (~120), nature (~90) | Cowork normalizes size and palette after |
| Logo, website hero image, Discord banner | |

Cowork can produce procedural grounds, borders, walls, effects, corpses, recolors, and placeholders, but not polished hand-drawn character art.

## Partially possible — plan for help

| Task | Limitation | Plan |
|---|---|---|
| Windows client build | Cowork works in a Linux environment; cross-compiling OTClient for Windows is fragile | Cowork writes a GitHub Actions workflow that builds on a Windows runner; owner provides the GitHub account |
| Keeping the server running 24/7, watching alerts | Cowork sessions are not a daemon | systemd + monitoring + Discord alerts (16); owner or GM responds |
| Real load at 500 humans | Only simulated with loadbots | Closed beta + launch week monitoring |
| Final map aesthetics | Cowork maps from ASCII and checks previews; layouts will be functional before they are beautiful | Owner reviews render_map PNGs; optional human mapper polish pass in beta |
| Anti-cheat arms race | Bot makers adapt (R5) | Logging + manual bans; revisit after launch |

## Better tool for the heavy coding

Claude Cowork can carry this project, but most phases are repository and compiler work (C++ patches, Lua, Python tools, CI). Claude Code is built for exactly that and handles long build/test loops better. A practical split: Claude Code for phases 0–8 (code), Cowork for docs, data tables, art batching, launch copy, and coordinating Grok handoffs.
