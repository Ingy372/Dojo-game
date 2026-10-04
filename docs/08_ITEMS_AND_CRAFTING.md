# Items and crafting

Power comes from crafting. Bosses drop the rare input, never the finished weapon.

## Gear tiers

- Each floor has one base weapon per path, a Vanguard shield, and three armor families (heavy, light, robe) × four slots. Tables: data/weapons.csv, data/armor.csv.
- Base items are bought from the floor's smith (Common, +0) or crafted from that floor's common materials at 60% of the shop price in col plus 10 commons.
- A floor's gear does not exist (shop, recipes, drops) until that floor is open. Floor 3 crafts cannot appear while the world is on floor 2.

## Upgrade ladder (smithy)

Rarity is the upgrade level of a specific item.

| Step | Name after success | Attack/armor bonus | Materials (F = item floor) | Fee col | Base success |
|---|---|---|---|---|---|
| +1 | Keen | +2 atk / +1 arm | 2 Keen mat (F) + 10 common (F) | 200×F | 100% |
| +2 | Keen | +4 / +2 | 4 Keen (F) + 20 common (F) | 400×F | 90% |
| +3 | Tempered | +6 / +3 | 1 Tempered (F) + 4 Keen (F) | 1,000×F | 70% |
| +4 | Tempered | +8 / +4 | 2 Tempered (F) + 6 Keen (F) | 2,000×F | 55% |
| +5 | Spireforged | +10 / +5 | 2 Tempered (F) + 1 Tempered (F−1) + 1 Spire Scrap | 4,000×F | 40% |

Floor-1 exception for +5: replace the Tempered (F−1) with 10 Blackstone Shards from the Underkeep.

Failure consumes the materials and fee, never the item, and adds 1 pity point stored on the item (custom attribute). At 4 pity points the next attempt at that step succeeds. Pity resets on success. Pity never transfers between items. A Last Blow Shard used as the scrap forces success.

Because Common F+1 has about the attack of a +3/+4 item from floor F, a fresh floor's monsters are dangerous on day one (tuned above the previous floor's +2) and comfortable once players reach +3 on the new floor's base. That is the intended curve; do not add a global XP buff on clear.

## Binding

- Tempered (+3 and above) and Spireforged items bind to the account when first equipped. Before that, they trade freely.
- Last Blow Shard, Debt Chip, titles, glows, dyes from secrets: bound on pickup.
- With one character per account at launch, account-bound = character-bound in practice.

## Recipes

Recipes are learned (account-bound) from: shop NPCs (base items, basic arrows, bread), secret shops (s4 Hearth Stew, s16 herder food, s28 cleanse tonic, s40 better Broadhead yield, s52 F5 food), the Weapon Master (s35, one Keen-path recipe: a variant base weapon with the same attack and +5% crit), elite drops (Keen recipe scraps, 5 scraps = 1 recipe), and the floor-5 chain quest (cloak).

| Recipe | Inputs | Output |
|---|---|---|
| Broadhead ×20 | 20 Basic Arrow + 2 Boar Hide + 1 Cinderstone | 20 Broadhead (s40: 30) |
| Signal Arrow ×10 | 10 Basic Arrow + 1 Horn Shard + 1 Blightglass | 10 Signal Arrow |
| Hearth Stew ×5 | 5 Hearthroot + 2 Boar Hide + 50 col | 5 Hearth Stew |
| Tonic (crafted) | per tier: 3 common mats of tier floor + 20 col | 2 tonics (cheaper than shop; crafters have a market) |

## Cosmetics

Dyes (outfit color sets), cloaks (addon-style overlays), pennants, titles, weapon glows. Bought from the Dye Merchant (sink) or found in secrets. Never stats.
