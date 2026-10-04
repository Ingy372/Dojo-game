# Classes and combat

Tile rules first. Nothing needs frame-perfect aim. Every heavy hit is telegraphed: magic effect on the target tiles, 600 ms, then resolve. Skills are cast from a 4-slot bar via extended opcode (patch P10), never by typing spell words.

## Creation

Name, sex, path. Start in Hearthgate temple at level 1 with: path starter weapon (Hearth tier, Common), 10 Travel Bread, 5 Minor Salve, 2 Minor Tonic, 100 col, and for Slinger 300 Basic Arrows. Arcanist picks Brand or Ward at level 20 from the Registrar (free the first time; 25,000 col to switch later).

## Hit points and resources

| Path | Base HP | HP per level | Pool | Pool per level | In-combat regen /s | Out-of-combat regen /s |
|---|---|---|---|---|---|---|
| Vanguard | 150 | 15 | Stamina 100 | +4 | 3 | 10 |
| Cleaver | 150 | 12 | Stamina 100 | +5 | 3 | 10 |
| Shade | 150 | 8 | Stamina 100 | +5 | 4 | 12 |
| Slinger | 150 | 10 | Stamina 80 | +3 | 3 | 10 |
| Arcanist | 150 | 8 | Focus 120 | +8 | 2.5 | 8 |

Stamina and Focus use the mana field (client relabels it per path). Food is required for out-of-combat regen above 2/s (Tibia-style hunger). Magic level does not exist (patch P9).

## Stats

3 points per level. Allocation window in the client. Rule: no stat may exceed 40% of points earned, except that the first 15 points earned are uncapped. One free full respec at the Registrar between levels 20 and 25; afterwards 2,000 col × highest open floor.

| Stat | Effect per point |
|---|---|
| STR | +0.8% melee and Shade damage |
| DEX | +0.4% attack speed (min interval 1.2 s), +0.15% crit chance (base 5%, crit ×1.5), +0.8% Slinger damage, +0.5% Shade flank bonus |
| VIT | +0.8% max HP, +0.1% block chance with a shield (base 10%) |
| AGI | +0.12% dodge (cap 20%), +0.5 movement speed, +0.3% Slinger accuracy at range > 3 |
| MND | +1% resource pool and regen, +0.8% Arcanist skill power, +0.8% healing done |

## Damage

```
basic = weaponAtk × (1 + prof×0.005) × (1 + statBonus) × rand(0.85, 1.15)
skill = basic × coef
taken = max(1, incoming − rand(armor×0.5, armor))      -- TFS armor model
```
Level is deliberately not in this formula. Level gives HP and stat points; weapons, upgrades, and proficiency give damage. That is what makes the no-cap rule safe.

Slinger weaponAtk = bow attack + arrow attack. Arcanist weaponAtk = focus attack; Arcanist basic attack is a free 4-range bolt.
Base attack interval: Vanguard 2.0 s, Cleaver 2.6 s, Shade 1.5 s, Slinger 2.0 s, Arcanist 2.0 s (patch P2 applies DEX).

## Proficiency

Per weapon group, 1–100. One point per landed basic hit or skill hit with that group. Points to reach P = 50 × P^1.75 (P10 ≈ 2,800, P25 ≈ 14,000, P40 ≈ 31,700 — roughly 3, 15, and 35 active hours). +0.5% damage per proficiency level. Skill rows unlock at 10, 25, 40 (60 and 80 are data-only, disabled). World gates: see 05.

## Skills (original names)

Costs in Stamina (melee/Slinger) or Focus (Arcanist). Cooldowns in seconds.

### Vanguard — sword and shield
| Skill | Row | Effect | Cost | CD |
|---|---|---|---|---|
| Crosscut | Start | 3-tile front cone, coef 1.3, threat ×3 | 20 | 4 |
| Shieldwall | 10 | Channel up to 4 s, cannot move, −50% damage taken, −90% from telegraphed hits | 25 | 15 |
| Sundering Arc | 25 | coef 1.1; target takes +15% damage from all sources for 6 s | 25 | 8 |
| Hold the Door | 40 | Taunt every monster within 3 tiles for 4 s | 30 | 20 |

### Cleaver — greatsword
| Skill | Row | Effect | Cost | CD |
|---|---|---|---|---|
| Breakline | Start | Line of 3, coef 1.6, self-slow 1 s | 25 | 5 |
| Shoulder | 10 | Single target coef 2.2 | 30 | 7 |
| Reap | 25 | 3 front tiles coef 1.4; +40% vs targets currently attacking an ally | 30 | 6 |
| Commit | 40 | Next Breakline costs double and hits twice | 0 | 20 |

### Shade — daggers
| Skill | Row | Effect | Cost | CD |
|---|---|---|---|---|
| Veilstep | Start | If an ally is adjacent to the target, step to the tile opposite that ally; next hit +30% | 15 | 6 |
| Kidney | 10 | coef 1.0 + 0.8 s stun if not on target's front tile (bosses: −20% attack speed 3 s instead) | 20 | 10 |
| Fade | 25 | Monsters drop you as target for 2 s; ends on attack | 25 | 18 |
| Vein | 40 | Bleed: 6 ticks over 6 s, total coef 1.8 | 20 | 8 |

### Slinger — bow (range 6)
| Skill | Row | Effect | Cost | CD |
|---|---|---|---|---|
| Snap | Start | coef 1.3, spends 1 arrow | 10 | 2 |
| Pinshot | 10 | coef 1.1 + 40% slow 3 s, spends 1 Broadhead | 15 | 8 |
| Volley | 25 | 3-tile arc, coef 0.9 each, spends 3 arrows | 25 | 6 |
| Mark | 40 | Target takes +15% damage from your party 6 s, spends 1 Signal Arrow | 20 | 20 |

Arrows: Basic arrows have a 70% chance to drop on the target's tile and can be picked up. No infinite ammo.

### Arcanist — Brand (damage)
| Skill | Row | Effect | Cost | CD |
|---|---|---|---|---|
| Spark | Start | Range 5, coef 1.4 | 20 | 2 |
| Cinder | 10 | 3×3 on target tile, coef 1.0 | 45 | 6 |
| Lance | 25 | Line of 4, coef 1.6 | 40 | 6 |
| Emberwake | 40 | 3×3 fire field 4 s, 4 ticks of coef 0.5 | 50 | 12 |

### Arcanist — Ward (support, +10% healing done)
| Skill | Row | Effect | Cost | CD |
|---|---|---|---|---|
| Mend | Start | Heal one ally (range 6): focusAtk × 3 × (1 + MND bonus) | 25 | 1.5 |
| Quiet | 10 | Remove one negative condition | 20 | 6 |
| Bramble | 25 | Root 3 s (bosses: 30% slow instead) | 30 | 12 |
| Circle | 40 | Allies within 2 tiles: 5 ticks of 3% max HP | 50 | 15 |

Before level 20 an Arcanist has Spark and Mend both (pre-spec kit). At spec, the other line's skills leave the bar.

Every path has: basic attack (no slot), Bandage (3 s channel, 20% HP, breaks on damage), salves (shared 2 s cooldown). Ward is the only strong healer. No path gets a full self-heal.

## Party

See 05: cap 4, shared XP rules, +10% per extra distinct path (cap +30%).

## Monster rules

- Heavy hits telegraph: effect 207 (marked tile) on affected tiles, 600 ms, then damage.
- Shieldwall and shields reduce telegraphed damage; Cleaver should not pull.
- Fields (fire, poison, slime, bramble) are the shared language of mages and bosses.
- No monster uses frame-perfect mechanics. No instant-kill without a telegraph.

## Not ported from Tibia

No rune system, no "SD with a new name", no spell words, no potions that out-heal Ward, no promotion that doubles regen, no magic level.
