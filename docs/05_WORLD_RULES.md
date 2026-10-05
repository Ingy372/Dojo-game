# World rules

## World floors

Table `world_floors(floor_id PK, field_boss_dead_at, boss_dead_at, opened_at, first_clear_id)`. One row per floor. Not per player.

- Floor 1 is open at launch.
- Each floor's labyrinth sits behind the only pass. The pass is a walled arena on the road with the field boss. Until the field boss dies once, the labyrinth door is sealed for everyone. After that the pass is permanently open and the field boss never returns.
- The floor boss room is at the top of the labyrinth. Its first death:
  1. writes `boss_dead_at` and `floor_clears` (credit list, last hit, duration);
  2. opens the stair to floor N+1 and lights the floor N+1 teleport gate;
  3. unlocks any proficiency row tied to N+1 and the floor's gear in shops and recipes;
  4. opens Underkeep wing N+1;
  5. starts the house head-start hour for floor N+1;
  6. gold system message to all + bell sound + names of credited players;
  7. carves the monument in Hearthgate (and adds it to the website).
- A GM command `/spire floor N clear <names...>` exists for testing and is logged. It is removed from the production GM group before launch.

## Levels and what the tower still gates

There is no level cap (OWNER). Leveling past a floor's band is allowed and is the intended fallback when raid teams stall.

What stays tied to the highest open floor:

| Highest open floor | Proficiency rows usable | Gear available |
|---|---|---|
| 1 | Start, 10 | Hearth tier |
| 2 | + 25 | + Ridge tier |
| 3 | — | + Rootwood tier |
| 4 | + 40 | + Lakesteel tier |
| 5 | — (60 and 80 stay disabled in the proof) | + Ringforged tier |

Proficiency past an unlocked row keeps banking and applies the moment the row unlocks. Level never multiplies damage directly; it adds HP and stat points only (06).

## Boss rooms (field and floor)

- Entry: a door tile. Capacity 20 living characters inside. Dying or leaving frees a slot immediately. No level requirement. A sign at the door: "Beyond this door the tower's protection ends." Protection level does not apply inside (patch P4). PvP is on. Skulls still apply to unjust kills inside.
- Reset: if the boss takes no player damage for 60 seconds, or the room has no living players for 30 seconds, it heals to full, adds despawn, and phase resets.
- No lockout on world-first attempts.
- Enrage scales with headcount so the race favors full raids but a stalled server can still be unstuck by a small group or a solo player:
  - n = the highest number of living players inside the room at any moment during the first 60 seconds of the attempt.
  - Enrage time = min(60 minutes, 8 minutes × 8 / max(n, 1)). Examples: 1 player 60:00, 2 players 32:00, 4 players 16:00, 8+ players 8:00.
  - At enrage: boss damage +50% every 30 s.
  - Rivals who enter later do not change the timer.

## Credit

- A character is credited if, in the last 90 seconds of the fight, they dealt damage to the boss (or its adds) or healed a character who damaged the boss. Being dead at the moment of the kill does not remove credit earned in that window.
- If more than 20 qualify, rank by total contribution over the whole fight (damage + healing on qualifying targets) and take the top 20.
- Last hit: the owner of the killing damage, including damage from fields and bleeds (the field/bleed creator). Empty Colossus: the killing blow on the second body.
- Rewards (first kill only):
  - Everyone credited: monument line, bound title for that floor ("Gatebreaker", "Hornbreaker", "Rootbreaker", "Lakebreaker", "Ringbreaker"), bound cosmetic weapon glow, the head-start eligibility for that district, and the boss's first-kill loot row (data/monsters.csv).
  - Last hit only: title "Last Blow (Floor N)" and one Last Blow Shard (bound; counts as a Spire Scrap AND forces that upgrade to succeed). Not a weapon, not stats (OWNER).
- Field bosses credit the same way and give a monument line and their loot row, but no title and no house window.

## Echoes

- 6 hours after a floor boss's first kill, its Echo becomes available from a portal beside the stair.
- Instanced: the room is copied 30 times per floor at reserved coordinates. Party of exactly 1–4. No PvP inside.
- HP and XP from data/echoes.csv (tuned for 4 players, 4 minutes). Same mechanics as the first kill. Enrage 8:00.
- Lockout: one kill credit per character per floor per 20 hours.
- Drops: Tempered material and the Spire Scrap chance with per-character pity. Never titles, glow, Last Blow Shard, or house rights.

## PvP

Protection zones (no attacks, no fields, no skills on others): every town interior, house interiors, depots, the Hearthgate monument square, every teleport plaza, Vesper stalls, the strategy-board squares, Echo instances.

Open: everything else, including roads, camps, the labyrinth, the Underkeep, and boss rooms.

Protection level 20: below level 20 you cannot attack or be attacked by players, except inside boss rooms.

### Justified vs unjust

A kill is justified if the victim attacked you first (aggressor flag, TFS white skull for 15 min after attacking), the victim has an orange, red, or black skull, or your guilds are at war. Anything else is unjust.

### Skulls (patch P3)

| Skull | Condition | Duration | Effects |
|---|---|---|---|
| none | clean | — | — |
| white (aggressor) | you attacked a clean player | 15 min after last attack | killing you is justified |
| orange (public) | 1–2 unjust kills in rolling 24 h | 30 min per unjust kill, cap 2 h | visible to all; killing you is justified |
| red | 3 unjust kills in rolling 24 h, or 5 in rolling 7 days | 24 h after the last unjust kill | whole backpack drops on death; corpse lootable by anyone; cannot enter your own house; can use depot |
| black | 6 unjust kills in 24 h, or 10 in 7 days | 72 h after the last unjust kill | red effects + town guards attack you at town gates (fixed 25% max HP per hit) + cannot use teleport gates |

War frags never count as unjust. PZ lock: 60 s after attacking a player (TFS default), no entering protection zones.

### Corpses

- Clean or white victim: killer may loot for 60 s, then only the victim.
- Orange: same as clean (orange marks the killer's past, not a loot license).
- Red or black victim: lootable by anyone immediately.

## Death

From 02: debt 5% of next-level XP per death (cap 15%), 50% of new XP pays debt, priest clears for 0.5 col/point, Debt Chip within 60 s. Backpack items 10% each (unbound only); red/black lose the whole backpack and 10% per unbound equipped item. Respawn at the temple of the town on the floor where you died if you have attuned it; otherwise Hearthgate.

## Party

Cap 4 (patch P7). Shared XP requires being on the same floor, within 30 tiles, and highest level ≤ 1.5 × lowest level.

Team hunting must pay better per person than solo (OWNER). A party of n members in range gets, per kill:

```
XP multiplier  M_xp  = 1 + 0.30 × (n − 1) + 0.10 × (distinct paths − 1)
col multiplier M_col = 1 + 0.15 × (n − 1)
each member receives  monster XP × M_xp / n   and   corpse col × M_col / n (auto-split to each member)
```

A party kills about 1.6× (duo) to 2.5× (four) as fast as a solo player. With those kill rates, per-person XP/h is about 1.1× solo for a duo and about 1.4× solo for a four-path party (data/economy_check.md checks this). Party col per person stays a little under solo on ordinary camps; apex spawns and labyrinths (group content) make up the difference.

Mentor sharing: if the level spread breaks the 1.5× rule, the party can still share if the leader turns on Mentor mode: members above 1.5× the lowest level receive 0 XP, and the others receive the normal share +10%. This lets clans bring new players along (OWNER: big clans treating new players as future firepower).

Inside a boss room all credited characters share XP as one group with the same formula (n capped at 8 for the multiplier).

## Strategy books

A read-only book with the seeded tell sits beside a player-writable book on each floor's strategy-board square. The writable book keeps the last 50 entries, each prefixed with the writer's name (append-only via NPC "Scribe" or book-use script). GMs can clear it.

## PvP zone tiers (OWNER)

Every non-PZ tile has one tier, set by zone_rect in the map source and shown in the client corner (icon + color).

| Tier | Where | Rule |
|---|---|---|
| Guarded | roads and fields within ~40 tiles of each town, the floor-1 starter fields | PvP allowed, but an unjust kill here counts as 3 unjust kills (straight to red), and the killer is marked for guards for 30 minutes |
| Open | most camps, labyrinths, the Underkeep wings 1–2 | Standard skull rules |
| Contested | one per floor: the apex spawn and its approach | Kills never count as unjust and never paint skulls. Each kill awards the killer one Blood Mark (bound; spent at the Quartermaster for supplies and at the Dye Merchant for a Contested cosmetic line). Victim's unbound backpack items drop at 25% each instead of 10%. Protection level still applies (under 20 cannot enter; the zone border blocks them) |
| Deadzone | Underkeep wings 4–5 and each floor's apex inner layer | Contested rules, plus protection level does not apply, plus deaths drop unbound equipped items at 10% each. Best XP and loot on the floor. A warning sign and a confirm dialog on first entry |

Blood Marks cannot be farmed between friends: kills of the same victim by the same killer award a mark at most once per 30 minutes, and never between guildmates, party members, or characters sharing an IP.

Anti-bullying: an unjust kill on a player 30+ levels lower than the killer counts double toward skulls everywhere except Contested and Deadzone.

## World events (something happening at all hours)

A scheduler runs every 3 hours, on the hour (00:00, 03:00, … ET). It picks one opened floor and one event:

| Event | Effect | Length |
|---|---|---|
| Frenzy | That floor's apex spawn: +50% respawn speed and +25% loot | 45 min |
| Incursion | Elite packs appear on two Open camps, extra Keen mats | 30 min |
| Tide of Coin | One Contested zone: Blood Marks doubled | 45 min |
| Wandering Champion | A roaming mini-boss walks a road between two camps (party content, Keen and Tempered mats) | until killed or 60 min |

Announced server-wide 10 minutes ahead and on the website and Discord. Events never touch world-first rooms.
