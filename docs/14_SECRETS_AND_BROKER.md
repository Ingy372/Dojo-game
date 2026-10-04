# Secrets and the broker

Exploration is a second game next to the stair (R1). The proof ships 60 secrets, 12 per floor, listed with payouts in data/secrets.csv. They are places, NPCs, and fights. A book that only adds a tooltip is not a secret.

## Rules

1. **Trigger.** Each secret has one trigger (tile, use, door, NPC talk, timed event). Defined in secrets.csv.
2. **Discovery event.** When a trigger fires while the secret is unsold, every character on the same z-level within the client viewport of the triggering tile (8 tiles horizontal, 6 vertical) who does not already hold a packet for it receives a seller packet and the node (access). Message: "You found <name>. Vesper would pay for this."
3. **Repeat discovery.** Until the secret is sold, anyone who fires the trigger again creates a new discovery event. An unsold secret is a race, not a permanent monopoly.
4. **Sale.** Any packet holder may sell to Vesper in any town where Vesper is open. First sale wins: the seller is paid the lump sum; every other packet locks as "sold by <name>"; holders keep their access. A system message tells every holder who sold it.
5. **After sale.** The trigger grants nothing ("Vesper already sells word of this place."). Access is by copy: 15% of the lump sum, paid to Vesper (destroyed). A copy grants the node. Copies cannot be resold.
6. **Gates.** Every secret interior sits behind a physical gate (door, tile, curtain, rope spot, glade). Non-holders: "You don't know this place." No secret relies on per-player creature visibility.
7. **Nodes are account-bound.** Death does not clear them.
8. **Nothing required.** The stair, labyrinth puzzles, story quests, chain quest, and house sales never require a secret. No secret prop is reused by a labyrinth puzzle.
9. **Profile.** Character window and website show sold packets (name, floor, tier, seller). Unsold packets are visible only to their holder, never on the public website.
10. **Logs.** `secret_events(time, secret_id, event, player_ids)` for discovery, sale, copy.

Tables: `player_secrets(account_id, secret_id, source ENUM('found','copy'), found_at, packet_state ENUM('none','unsold','sold_by_me','locked'))`, `secrets(secret_id PK, sold_by, sold_at)`, `secret_copies(account_id, secret_id, paid, at)`.

## Vesper

Original NPC, a stall in every opened town, main board in Hearthgate. Services: buy a packet (sale), sell a copy, list sold secrets on the board by floor and tier (names only; holders see details), buy a hand-written boss tell from a strategy book for 200 col (once per boss per character; flavor faucet, logged).

## Payouts

Lump sum = floor base × tier multiplier. Bases: F1 1,500; F2 3,500; F3 6,000; F4 10,000; F5 16,000. Small ×1, Mid ×2, Large ×4. Copy = 15%. Total across 60 secrets ≈ 970,000 col, a one-time faucet. If explorers look rich, cut mob col first (07); do not cut payouts.

## Notes on specific secrets (changes from the original sketch)

- s3 and s44 were renamed/moved so no secret shares props with a labyrinth puzzle.
- s20 Wandering Stall moves once after the first packet holder buys from it; copies point to the new spot.
- s21 Fir Rumor sits inside a gated glade so non-holders never see the boss.
- s35 Weapon Master retiered to Mid (it is an NPC, not a fight) and teaches a Keen-tier recipe for your path.
- s45 Servant Passage leads to the outside of the labyrinth door and stays inactive until that floor's field boss is dead.
- s60 Kept Box opens only for a character holding an unsold packet from each of floors 1–4. It rewards people who kept a group's secret.

## The Underkeep (s1)

A black-stone dungeon under Hearthgate, reached through a drainage grate and a water channel. One map that gains rooms; never five separate dungeons. Rewards and monster tuning step up per wing (data/monsters.csv rows tuned to floors 2–5), not with the player's level. A level 8 in wing 5 should leave.

| Wing | Opens when | z / size | Content |
|---|---|---|---|
| 1 | found (for packet/copy holders) | z8, 70 × 50 | Columns, Mire Toads, Black Crawlers; daily common chest (Blackstone Shards) |
| 2 | world floor 2 open | z8 east, 60 × 40 | Vault Rats, Chain Ghouls, Drain Matron side room; daily keen chest |
| 3 | world floor 3 open | z9, 60 × 50 | Trap rooms: a chest that locks the door and spawns a wave; clearable; sold packet text names the trap |
| 4 | world floor 4 open | z9 west, 50 × 40 | Keep Warden packs; hidden smithy bench with one Keen recipe the towns do not sell |
| 5 | world floor 5 open | z10, 40 × 40 | White safe room behind the Vault Warden (lantern-and-shield, not a scythe); weekly chest: floor-5 materials and one bound Debt Chip |

Do not add wing 6 in the proof. Sealed wing doors read: "Sealed until the world opens floor N."
