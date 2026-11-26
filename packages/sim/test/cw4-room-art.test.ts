// CW-4 (Nov 25): a Tower room loads only the monster art it can show (apps/client/src/art/tiers.ts).
import { describe, expect, it } from 'vitest';
import { testContent } from './load-content';
import { ENEMY_ART_PACKS, enemyArt, enemyArtPacksFor } from '../../../apps/client/src/art/enemyPacks';

const content = testContent();
const defs = Object.values(content.enemies);
const packsFor = (roomId: string) => {
  const room = content.rooms.find((r) => r.id === roomId)!;
  return enemyArtPacksFor(room.enemySpawns.map((s) => s.enemy), defs).sort();
};

describe('room monster art', () => {
  it("a White belt Guardian room loads the Floor Keeper's second form, and no Orange belt art", () => {
    expect(packsFor('w-keepers-hall')).toEqual(['enemy-floor-keeper-f2']);
  });

  it("the Orange belt Guardian room loads all three Hearth Cook forms and the sparks it calls in", () => {
    expect(packsFor('great-hearth')).toEqual(['enemy-hearth-cook-p1', 'enemy-hearth-cook-p2', 'enemy-hearth-cook-p3', 'enemy-spark-sprite']);
  });

  it('follows splits: a Dough Blob brings its Doughlings', () => {
    expect(enemyArtPacksFor(['dough-blob'], defs).sort()).toEqual(['enemy-dough-blob', 'enemy-doughling']);
  });

  it('every room has the art for every monster it can show, at every health', () => {
    for (const room of content.rooms) {
      const packs = new Set(enemyArtPacksFor(room.enemySpawns.map((s) => s.enemy), defs));
      const shown = new Set(room.enemySpawns.map((s) => s.enemy));
      for (const id of [...shown]) {
        const d = content.enemies[id];
        if (d?.summon) shown.add(d.summon.enemy);
        if (d?.split) shown.add(d.split.into);
      }
      for (const id of shown) {
        for (const h of [1, 0.6, 0.4, 0.1]) {
          const art = enemyArt(id, h);
          if (art) expect(packs.has(art.pack), `${room.id}: ${id} at ${h}`).toBe(true);
        }
      }
      for (const p of packs) expect(ENEMY_ART_PACKS).toContain(p);
    }
  });
});
