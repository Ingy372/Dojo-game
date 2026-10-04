# Monetization

Decision (owner to confirm): **a cosmetic-only Wardrobe sold at real-money prices, with new sets released when the world opens a floor, plus an optional cosmetic Supporter subscription. No premium account, no gear or power packs, no loot boxes.** Nothing is sold during closed beta. The store opens at public launch.

## Evidence

| Finding | Source | Consequence |
|---|---|---|
| Players' views of pay-to-win were negative before and after trying a game with it; pay-to-win can steer players away before they try the game | Turku thesis on pay-to-win loot boxes (utupub.fi/handle/11111/19767) | No power for sale, and nothing that looks like it on the website |
| Purchases of cosmetics are driven by enjoyment and satisfaction; players ask for fairness and transparency | Hoiles 2024, Univ. of Malta (um.edu.mt/library/oar/handle/123456789/127869); Zendle et al. on problematic microtransactions (eprints.whiterose.ac.uk/id/document/2473312) | Real-money prices shown directly (no premium currency that hides cost), no random rewards |
| A 10,000-response industry survey found 69% considered cosmetic microtransactions acceptable | Qutee survey via Windows Central (weak evidence: industry poll) | Cosmetics are the accepted lane |
| OT veterans: successful servers either sell premium OR boosters, never both; trust and the game itself drive success more than the model | OTLand "Business model OT servers," Apr 2026 (otland.net/threads/business-model-ot-servers.304328/) | Pick one clean lane and keep it |
| New-player feedback in 2026 called out pay-to-win popups as a reason not to try a server | OTLand thread on Varones OT (R7) | No store popups in game or on the front page |
| Fan projects: revenue was a sticking point when Atlus sued Imagine Online fan servers; Nintendo hit a fan game's Patreon | KitGuru on Atlus suit; Game Informer on fan-game takedowns | Legal review before charging; original names and art; never call the game SAO |
| Payment processors require "purchase," not "donation," when something is given in return | OTLand payment-provider thread | Use purchase language and real terms of sale |

## The four options considered

| Option | Verdict | Why |
|---|---|---|
| Strictly cosmetic | **Yes (core)** | Matches owner rule and the research; does not split a shared, world-locked raid game |
| Tiered unlocks by floor | **Yes, as cosmetics only** | Floor openings are the server's biggest moments; releasing a themed cosmetic set when a floor opens ties revenue to the shared race without selling access or power |
| Weapon or armor packs | **No** | Sells power; violates the owner rule; contradicts "power comes from boss materials" |
| Premium account (Tibia-style) | **No** | Gating areas, spells, or houses behind payment splits a world-locked raid server and reads as pay-to-win to new players; OT veterans warn against stacking it with other charges |

## What is sold

1. **Wardrobe (one-time purchases, account-bound, not tradeable):**
   - Outfit recolor sets and cloak overlays per path: $6–10.
   - Dye packs: $3.
   - House cosmetics (rugs, banners, lights; no stats, no storage): $2–5.
   - Name change: $8. Character transfer is not offered (single world).
2. **Floor Wardrobe drops:** when floor N opens for the world, a "Floor N" set (5 path outfits in that floor's theme) appears for everyone at the same moment: $12 for the set. Each floor also has an earnable in-game cosmetic (secrets, quests) so non-payers have status items too.
3. **Supporter, $4.99/month (optional):** website badge, Discord role, name on the Supporters page, one rotating monthly cosmetic that stays after cancelling, one extra saved-outfit slot. Nothing that touches combat, XP, loot, travel, houses, or queues.

## Never sold

XP or XP boosts, stats, gear, materials, col, Debt Chips, upgrade protection, house time or priority, login-queue priority, extra characters, boss entry, Echo resets, secret copies, spec change or respec, titles, monument names, first-clear glows. Earned prestige (titles, glows, monument) must look different from anything sold.

## Rules

- Prices are shown in real money. No premium currency.
- No loot boxes or randomized paid rewards.
- Shop items are account-bound and cannot be traded or converted to col (otherwise money buys col, and col buys power).
- No in-game store popups. The store lives on the website; the client has one "Wardrobe" button.
- A public "Server costs" line on the website: monthly hosting cost and the % covered this month.
- Refunds within 14 days if the item is unused; chargebacks lock the purchased items pending review.

## Payments (implementation, phase 10)

- Checkout on the website: Stripe (cards, Apple Pay, Google Pay) and PayPal. Optional later: Mercado Pago (Pix) for Brazilian players.
- Flow: checkout → processor webhook → MyAAC plugin writes `store_orders(order_id UNIQUE, account_id, sku, status, amount, currency, created_at)` → server Lua grants pending orders on login or every 60 s for online players → idempotent by order_id → logged.
- Processor keys live only in server environment files, never in git.
- Terms of Sale, Refund Policy, and Privacy Policy pages (owner reviews; legal review recommended).

## Owner decisions still needed

- Which legal entity receives the money (and tax handling — accountant).
- A lawyer's view on monetizing a fan-inspired game before the store turns on.
- Final prices.
