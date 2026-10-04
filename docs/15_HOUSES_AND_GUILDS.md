# Houses and guilds

Houses are social space and storage, not a combat buff (R2). Purchase is a listed col price. Data: data/houses.csv (104 houses + 2 guild halls).

## Districts

| Floor | District | Count | On sale |
|---|---|---|---|
| 1 | Hearthgate cottages, inn rooms; Millcross cottages | 24 + 8 + 6 | from launch minute, no head start |
| 2 | Highrest | 20 | when floor 2 opens |
| 3 | Rootwell | 16 + guild hall | when floor 3 opens |
| 4 | Lakehold | 16 | when floor 4 opens |
| 5 | Ringhold | 12 + guild hall | when floor 5 opens |

## Buying

- At the house door: say "buy" to the door (TFS !buyhouse equivalent) or ask the Clerk. Payment from bank balance. First payment wins.
- One house per account. Owning a house blocks buying another until you leave it.
- Leaving: the house reverts at the next server save; items go to the owner's depot in that town.

## Head start (OWNER: 1 hour, listed price, then broadcast)

1. On first kill of floor boss N, credited characters get a 60-minute window on district N+1.
2. During the window only credited characters can buy, at listed prices, one house each, and at most ceil(district size / 2) houses sell in total. When the cap is reached, the window ends early.
3. A credited guild leader may instead buy that district's guild hall during the window (guild hall does not count toward the cap or the one-house rule).
4. At 60:00 (or cap), a server-wide broadcast: "The <district> district is open." Anyone can buy what is left, same prices, first payment wins.
5. Houses bought in the window cannot be transferred for 14 days.

## Rent

- Weekly, auto-debited from the owner's bank at server save on the purchase weekday.
- Insufficient funds: mail warning, 7-day grace; then the house reverts, items go to depot.
- Reverted houses are relisted at the next server save with a broadcast, never instantly (prevents bot sniping).

## Inside a house

Protection zone. Owner may invite (guests) and subowners. Furniture is decoration. Training dummies in houses may not exceed town dummies by more than 10% (s56 is the only place with the +10% dummy). Red and black skulls cannot enter their own house.

## Guilds

- Founded from day one at Guildwarden Sela (20,000 col, leader level 20+). Ranks: leader, vice, member (TFS).
- Guild halls (floors 3 and 5) require 10 members to buy; rent is paid from the leader's bank (or a guild bank if the agent adds TFS guild bank support — optional).
- Guild war: contract signed by both leaders at Sela; 10,000 col fee each (sink); break fee agreed at signing (10,000–500,000), paid to the other guild to end early; otherwise ends after 7 days. War frags never paint skulls. Both guilds' members see each other's names in a war color.
