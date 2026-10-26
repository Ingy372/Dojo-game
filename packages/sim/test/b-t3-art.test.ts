// B-T3: every tier 3 art pack the client loads (apps/client/src/art/tiers.ts) is really in assets/art.
import { describe, expect, it } from 'vitest';
import { testContent } from './load-content';
import towerT1 from '../../../assets/art/tower-t1.json';
import towerT3 from '../../../assets/art/tower-t3.json';
import sparkSprite from '../../../assets/art/enemy-spark-sprite.json';
import ladleLobber from '../../../assets/art/enemy-ladle-lobber.json';
import doughBlob from '../../../assets/art/enemy-dough-blob.json';
import doughling from '../../../assets/art/enemy-doughling.json';
import rollingPin from '../../../assets/art/enemy-rolling-pin.json';
import hearthP1 from '../../../assets/art/enemy-hearth-cook-p1.json';
import hearthP2 from '../../../assets/art/enemy-hearth-cook-p2.json';
import hearthP3 from '../../../assets/art/enemy-hearth-cook-p3.json';
import lidIcon from '../../../assets/art/hearth-cook-lid-icon.json';
import { TICKS_PER_SECOND } from '../src/config';

type Pack = { pages: string[]; entries: Record<string, { sprites?: Record<string, unknown>; animations?: Record<string, unknown> }> };
const PACKS: Record<string, unknown> = {
  'tower-t1': towerT1,
  'tower-t3': towerT3,
  'enemy-spark-sprite': sparkSprite,
  'enemy-ladle-lobber': ladleLobber,
  'enemy-dough-blob': doughBlob,
  'enemy-doughling': doughling,
  'enemy-rolling-pin': rollingPin,
  'enemy-hearth-cook-p1': hearthP1,
  'enemy-hearth-cook-p2': hearthP2,
  'enemy-hearth-cook-p3': hearthP3,
};
const pack = (name: string): Pack => PACKS[name] as Pack;
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
  it('every tier 3 pack exists and names its pages', () => {
    for (const name of ['tower-t3', ...Object.values(ENEMIES), ...RIGS.map((r) => `enemy-${r}`)]) {
      expect(pack(name), name).toBeDefined();
      expect(pack(name).pages.length, name).toBeGreaterThan(0);
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

  // B-T3-TUNE-2b: the #299 art (Jay OK'd) replaces the borrowed wind-ups.
  type Anim = { frames: number; fps: number; telegraphTicks?: number; layers: Record<string, unknown> };
  const anim = (rig: string, name: string) => (pack(`enemy-${rig}`).entries[rig].animations as Record<string, Anim>)[name];

  it('each phase draws its own wind-up, and the wind-up lasts exactly the attack\'s warning', () => {
    const def = content.enemies['hearth-cook'];
    const ticks = (name: string) => def.attacks.find((a) => a.name === name)!.telegraphTicks;
    for (const [rig, a, name, want] of [
      ['hearth-cook-p1', 'pin', 'rolling pin lane', 26],
      ['hearth-cook-p2', 'pin', 'rolling pin lane', 26],
      ['hearth-cook-p3', 'bonk', 'ladle bonk', 20],
    ] as const) {
      const w = anim(rig, `windup_${a}`);
      expect(ticks(name), name).toBe(want);
      expect((w.frames / w.fps) * TICKS_PER_SECOND, `${rig} windup_${a}`).toBeCloseTo(want, 5);
      expect(w.telegraphTicks, `${rig} windup_${a}`).toBe(want);
      expect(anim(rig, a), `${rig} ${a}`).toBeDefined();
    }
  });

  it('the lid layer is in every phase 2 and 3 animation except the defeat', () => {
    for (const rig of ['hearth-cook-p2', 'hearth-cook-p3']) {
      const anims = pack(`enemy-${rig}`).entries[rig].animations as Record<string, Anim>;
      for (const [name, a] of Object.entries(anims)) if (name !== 'defeat') expect(Object.keys(a.layers), `${rig} ${name}`).toContain('lid');
    }
    expect(Object.keys(anim('hearth-cook-p1', 'pin').layers)).not.toContain('lid');
  });

  it('the boss-bar lid icon is imported', () => {
    const p = lidIcon as unknown as Pack;
    expect(p.pages.length).toBeGreaterThan(0);
    expect(p.entries['hearth-cook-lid-icon'].sprites?.['icon-lid']).toBeDefined();
  });
});
