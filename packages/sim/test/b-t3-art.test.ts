// B-T3: every tier 3 art pack the client loads (apps/client/src/art/tiers.ts) is really in assets/art.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { testContent } from './load-content';

const ART = resolve(__dirname, '../../../assets/art');
type Pack = { pages: string[]; entries: Record<string, { sprites?: Record<string, unknown>; animations?: Record<string, unknown> }> };
const pack = (name: string): Pack => JSON.parse(readFileSync(resolve(ART, `${name}.json`), 'utf8'));
const content = testContent();

const ENEMIES: Record<string, string> = {
  'spark-sprite': 'enemy-spark-sprite',
  'ladle-lobber': 'enemy-ladle-lobber',
  'dough-blob': 'enemy-dough-blob',
  doughling: 'enemy-doughling',
  'rolling-pin': 'enemy-rolling-pin',
};
const RIGS = ['hearth-cook-p1', 'hearth-cook-p2', 'hearth-cook-p3'];
/** Must match ATTACK_ANIMS in apps/client/src/art/tiers.ts. */
const HEARTH_ANIMS: Record<string, string> = { 'ladle bonk': 'bonk', 'hot pot rush': 'rush', 'rolling pin lane': 'pin' };

describe('B-T3 art', () => {
  it('every tier 3 pack and its pages exist', () => {
    for (const name of ['tower-t3', ...Object.values(ENEMIES), ...RIGS.map((r) => `enemy-${r}`)]) {
      expect(existsSync(resolve(ART, `${name}.json`)), name).toBe(true);
      for (const page of pack(name).pages) expect(existsSync(resolve(ART, page)), page).toBe(true);
    }
  });

  it('tower-t3 has every room sprite the White belt kit has', () => {
    const t1 = Object.keys(pack('tower-t1').entries.tower.sprites ?? {});
    const t3 = Object.keys(pack('tower-t3').entries.tower.sprites ?? {});
    expect(t3).toEqual(expect.arrayContaining(t1));
  });

  it('every Orange enemy has its art with idle, move, windup and attack', () => {
    for (const [id, name] of Object.entries(ENEMIES)) {
      expect(content.enemies[id], id).toBeDefined();
      const anims = Object.keys(pack(name).entries[id]?.animations ?? {});
      expect(anims, id).toEqual(expect.arrayContaining(['idle', 'move', 'windup', 'attack']));
    }
  });

  it('every Hearth Cook attack has its animation in the rig of each phase that uses it', () => {
    const def = content.enemies['hearth-cook'];
    const rigFor = (share: number) => (share >= 0.66 ? RIGS[0] : share >= 0.33 ? RIGS[1] : RIGS[2]);
    for (const ph of def.phases ?? []) {
      const rig = rigFor(ph.atHealthFraction - 0.001); // just inside the phase
      const anims = Object.keys(pack(`enemy-${rig}`).entries[rig].animations ?? {});
      for (const i of ph.attacks) {
        const a = HEARTH_ANIMS[def.attacks[i].name ?? ''];
        expect(anims, `${rig} ${a}`).toContain(a);
        expect(anims, `${rig} windup_${a}`).toContain(`windup_${a}`);
      }
    }
  });
});
