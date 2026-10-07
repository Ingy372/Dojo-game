// Loads and cross-checks all the game's content (rooms, enemies, Insights, loot, abilities, the Home Dojo),
// so a mistake in a data file shows a clear message right away.

import { loadAbilities, type AbilityContent } from './abilities';
import { loadDojoContent, type DojoContent } from './dojo';
import { loadEnemy, type EnemyDef } from './enemy';
import { loadInsights, type InsightDef } from './insight';
import { loadLootTables, type LootTables } from './loot';
import { loadRoom, type Room, type RoomKind } from './room';

export interface Content {
  rooms: Room[];
  enemies: Record<string, EnemyDef>;
  insights: InsightDef[];
  loot: LootTables;
  abilities: AbilityContent;
  dojo: DojoContent;
}

export interface RawContent {
  rooms: unknown[];
  enemies: unknown[];
  insights: unknown;
  gear: unknown;
  drops: unknown;
  abilities: unknown;
  dojoRoom: unknown;
  decorations: unknown;
}

export function loadContent(raw: RawContent): Content {
  const enemies: Record<string, EnemyDef> = {};
  for (const data of raw.enemies) {
    const e = loadEnemy(data);
    if (enemies[e.id]) throw new Error(`Two enemy files use the id "${e.id}"`);
    enemies[e.id] = e;
  }
  for (const e of Object.values(enemies)) {
    if (e.summon && !enemies[e.summon.enemy]) throw new Error(`Enemy "${e.id}" calls in "${e.summon.enemy}", which doesn't exist`);
  }
  const rooms = raw.rooms.map(loadRoom);
  const ids = new Set<string>();
  for (const r of rooms) {
    if (ids.has(r.id)) throw new Error(`Two room files use the id "${r.id}"`);
    ids.add(r.id);
    for (const s of r.enemySpawns) {
      if (!enemies[s.enemy]) throw new Error(`Room "${r.id}" uses enemy "${s.enemy}", which doesn't exist`);
    }
  }
  for (const kind of ['battle', 'challenge', 'treasure', 'rest', 'boss'] as RoomKind[]) {
    if (!rooms.some((r) => r.kind === kind)) throw new Error(`There is no ${kind} room`);
  }
  const loot = loadLootTables(raw.gear, raw.drops);
  for (const id of Object.keys(loot.enemyDropChance)) {
    if (!enemies[id]) throw new Error(`Loot drops list enemy "${id}", which doesn't exist`);
  }
  return {
    rooms,
    enemies,
    insights: loadInsights(raw.insights),
    loot,
    abilities: loadAbilities(raw.abilities),
    dojo: loadDojoContent(raw.dojoRoom, raw.decorations),
  };
}
