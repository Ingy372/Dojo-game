/// <reference types="vite/client" />
// GUARD-SCALE-01 (from Jay): Guardians (boss enemies) draw 1.5x bigger, and the Stone Giant and Lost Lightbearer up to 1.75x.
// The hitbox and attack reach scale to match, there is room to dodge at 667x375, the camera pulls back briefly
// when a boss appears (never with Reduced motion), and every factor lives in content/settings/guardian-scale.json.
import { describe, expect, it } from 'vitest';
import { attackBox, loadContent, loadEnemy, loadGuardianScale, scaleEnemyDef, MOVEMENT, COMBAT, type EnemyAttackDef, type EnemyDef, type RawContent } from '../src';
import { testContent } from './load-content';
import guardianScaleRaw from '../../../content/settings/guardian-scale.json';
import { bossZoomPlan, viewTiles } from '../../../apps/client/src/game/cameraView';
import gameSceneRaw from '../../../apps/client/src/scenes/GameScene.ts?raw';
import guardScaleSrc from '../src/guardScale.ts?raw';
import contentSrc from '../src/content.ts?raw';
import enemySrc from '../src/enemy.ts?raw';
import clientContentRaw from '../../../apps/client/src/game/content.ts?raw';

const content = testContent();
const rawEnemies = Object.values(import.meta.glob('../../../content/enemies/*.json', { eager: true, import: 'default' })) as Record<string, unknown>[];
const raw = (id: string) => rawEnemies.find((r) => r.id === id)!;
const rawDef = (id: string): EnemyDef => loadEnemy(raw(id));
const guardians = () => Object.values(content.enemies).filter((d) => d.boss);
const allAttacks = (d: EnemyDef): EnemyAttackDef[] => [...d.attacks, ...(d.challenge?.attacks ?? [])];
const G = guardianScaleRaw.guardianScale;

describe('GUARD-SCALE-01: the factors are content data', () => {
  it('the file says 1.5 for Guardians and 1.75 for the Stone Giant and Lost Lightbearer', () => {
    expect(G).toBe(1.5);
    expect(guardianScaleRaw.bigGuardians).toEqual({ 'stone-giant': 1.75, 'lost-lightbearer': 1.75 });
    expect(content.guardianScale).toEqual(loadGuardianScale(guardianScaleRaw));
  });

  it('every real Guardian is scaled by the data, and nothing else is', () => {
    expect(guardians().map((d) => d.id).sort()).toEqual(['floor-keeper', 'hearth-cook']);
    for (const d of Object.values(content.enemies)) {
      const base = rawDef(d.id);
      if (d.boss) {
        expect(d.scale, d.id).toBe(G);
        expect(d.radius, d.id).toBeCloseTo(base.radius * G, 10);
      } else {
        expect(d.scale, d.id).toBe(1);
        expect(d, d.id).toEqual(base);
      }
    }
  });

  it('a different number in the data moves the Guardian, a named entry beats the Guardian scale, and no code holds the numbers', () => {
    const files = { ...testRaw(), guardianScale: { ...guardianScaleRaw, guardianScale: 1.2, bigGuardians: { 'floor-keeper': 1.75 } } };
    const c = loadContent(files);
    expect(c.enemies['floor-keeper'].radius).toBeCloseTo(0.85 * 1.75, 10);
    expect(c.enemies['hearth-cook'].radius).toBeCloseTo(0.85 * 1.2, 10);
    expect(loadContent({ ...testRaw(), guardianScale: undefined }).enemies['floor-keeper']).toEqual(rawDef('floor-keeper'));
    // The numbers appear in the JSON only (not in the loader, the scene or the client's content file).
    for (const src of [guardScaleSrc, contentSrc, enemySrc]) expect(src).not.toMatch(/\b1\.(5|75)\b/);
    expect(gameSceneRaw).toMatch(/CONTENT\.guardianScale\.bossZoom/);
    expect(clientContentRaw).toMatch(/guardian-scale\.json/);
  });

  it('bad numbers are refused with a message that names the field', () => {
    const bad = (patch: Record<string, unknown>) => () => loadGuardianScale({ ...guardianScaleRaw, ...patch });
    expect(bad({ guardianScale: 0.9 })).toThrow(/guardianScale/);
    expect(bad({ guardianScale: 2.5 })).toThrow(/guardianScale/);
    expect(bad({ bigGuardians: { 'stone-giant': 'big' } })).toThrow(/stone-giant/);
    expect(bad({ bossZoom: { ...guardianScaleRaw.bossZoom, zoomTo: 1.4 } })).toThrow(/zoomTo/);
    expect(bad({ bossZoom: { ...guardianScaleRaw.bossZoom, outMs: 0 } })).toThrow(/outMs/);
    expect(() => loadGuardianScale(null)).toThrow();
  });

  function testRaw(): RawContent {
    const keys = Object.keys(guardianScaleRaw);
    expect(keys).toContain('guardianScale');
    // testContent() builds from the same files; rebuild the raw bundle by loading with the helper's inputs.
    return rawBundle();
  }
});

import insights from '../../../content/insights/insights.json';
import gear from '../../../content/loot/gear.json';
import drops from '../../../content/loot/drops.json';
import abilities from '../../../content/abilities/abilities.json';
import sealFamilies from '../../../content/abilities/seal-families.json';
import strikes from '../../../content/abilities/strikes.json';
import dojoRoom from '../../../content/dojo/home-dojo.json';
import decorations from '../../../content/dojo/decorations.json';
import twists from '../../../content/twists/twists.json';
import elites from '../../../content/elites/elites.json';
import named from '../../../content/named/named.json';
const rawRooms = import.meta.glob('../../../content/rooms/*.json', { eager: true, import: 'default' });
function rawBundle(): RawContent {
  const sorted = (files: Record<string, unknown>) => Object.keys(files).sort().map((k) => files[k]);
  return { rooms: sorted(rawRooms), enemies: rawEnemies, insights, gear, drops, abilities, sealFamilies, strikes, dojoRoom, decorations, twists, elites, named, guardianScale: guardianScaleRaw };
}

describe('GUARD-SCALE-01: hitbox and attack reach match the bigger body', () => {
  it('radius and danger circles scale; reach and start range keep the same gap from the body edge', () => {
    for (const d of guardians()) {
      const base = rawDef(d.id);
      const grow = base.radius * (G - 1);
      const pairs: [EnemyAttackDef, EnemyAttackDef][] = allAttacks(base).map((a, i) => [a, allAttacks(d)[i]]);
      expect(pairs.length, d.id).toBeGreaterThan(0);
      for (const [a, b] of pairs) {
        expect(b.areaRadius, `${d.id}/${a.name}`).toBeCloseTo(a.areaRadius * G, 10);
        expect(b.startRange - d.radius, `${d.id}/${a.name} start gap`).toBeCloseTo(a.startRange - base.radius, 10);
        expect(b.reach, `${d.id}/${a.name}`).toBeCloseTo(a.reach > 0 ? a.reach + grow : 0, 10);
        // Everything else about the attack is untouched: timing, strength, flags.
        expect({ ...b, startRange: 0, reach: 0, areaRadius: 0 }).toEqual({ ...a, startRange: 0, reach: 0, areaRadius: 0 });
      }
      // Speed, health and power are not scaled.
      expect(d.moveSpeedTilesPerSecond).toBe(base.moveSpeedTilesPerSecond);
      expect(d.maxHealth).toBe(base.maxHealth);
    }
  });

  it('a centred sweep stays centred on the Guardian, and the Floor Keeper numbers are the expected ones', () => {
    const k = content.enemies['floor-keeper'];
    const sweep = k.attacks.find((a) => a.name === 'sweep')!;
    expect(sweep.reach).toBe(0);
    expect(sweep.areaRadius).toBeCloseTo(3.15, 10);
    expect(k.radius).toBeCloseTo(1.275, 10);
    expect(k.attacks.find((a) => a.name === 'slam')!.reach).toBeCloseTo(1.1 + 0.425, 10);
  });

  it('scaling by 1 gives back the same object, and a Guardian scale reaches Challenge attacks too', () => {
    const base = rawDef('floor-keeper');
    expect(scaleEnemyDef(base, 1)).toBe(base);
    expect(content.enemies['floor-keeper'].challenge!.attacks[0].areaRadius).toBeCloseTo(base.challenge!.attacks[0].areaRadius * G, 10);
  });
});

/** The player-sized spot in the view nearest to `from` that is clear of the danger shape; the straight-line distance to it. */
function escapeDistance(from: { x: number; y: number }, view: { x0: number; y0: number; x1: number; y1: number }, danger: (p: { x: number; y: number }) => number): number {
  const margin = 0.5; // the character stays wholly on screen with room to spare
  const clear = MOVEMENT.playerRadius + 0.2;
  let best = Infinity;
  for (let x = view.x0 + margin; x <= view.x1 - margin; x += 0.05) {
    for (let y = view.y0 + margin; y <= view.y1 - margin; y += 0.05) {
      if (danger({ x, y }) >= clear) best = Math.min(best, Math.hypot(x - from.x, y - from.y));
    }
  }
  return best;
}

/** How far the player is from the nearest point of the danger shape: a disc, or a lane (a thick line from the Guardian). */
function dangerFn(center: { x: number; y: number }, facing: { x: number; y: number }, a: EnemyAttackDef): (p: { x: number; y: number }) => number {
  const c = { x: center.x + facing.x * a.reach, y: center.y + facing.y * a.reach };
  if (a.counterable === false) {
    return (p) => {
      const dx = c.x - center.x, dy = c.y - center.y;
      const t = Math.max(0, Math.min(1, ((p.x - center.x) * dx + (p.y - center.y) * dy) / (dx * dx + dy * dy)));
      return Math.hypot(p.x - (center.x + dx * t), p.y - (center.y + dy * t)) - a.areaRadius;
    };
  }
  return (p) => Math.hypot(p.x - c.x, p.y - c.y) - a.areaRadius;
}

describe('GUARD-SCALE-01: there is room to dodge at 667x375 (and the other supported sizes)', () => {
  const FACINGS = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
  const view667 = viewTiles(667, 375);

  /** The camera follows the player, so the player is at the view's centre when the Guardian starts an attack. */
  function worstEscape(d: EnemyDef, viewSize: { width: number; height: number }): { dist: number; where: string } {
    let worst = { dist: 0, where: '' };
    for (const a of allAttacks(d)) {
      for (const f of FACINGS) {
        const player = { x: 0, y: 0 };
        // The Guardian winds up at its start range from the player, facing the player.
        const center = { x: -f.x * a.startRange, y: -f.y * a.startRange };
        const view = { x0: -viewSize.width / 2, y0: -viewSize.height / 2, x1: viewSize.width / 2, y1: viewSize.height / 2 };
        const dist = escapeDistance(player, view, dangerFn(center, f, a));
        if (dist > worst.dist) worst = { dist, where: `${a.name} (Guardian ${f.x ? (f.x > 0 ? 'west' : 'east') : f.y > 0 ? 'north' : 'south'})` };
      }
    }
    return worst;
  }

  it('from the start of any Guardian attack, a clear spot is within one Dash, inside the view, at 667x375', () => {
    for (const d of guardians()) {
      const before = worstEscape(rawDef(d.id), view667);
      const after = worstEscape(d, view667);
      // Measured (floor-keeper, hearth-cook): the farthest escape grows from about 1.2 to 1.8 tiles; a Dash is 2.5.
      expect(after.dist, d.id).toBeGreaterThanOrEqual(before.dist);
      expect(Number.isFinite(after.dist), d.id).toBe(true);
      expect(after.dist, `${d.id} ${after.where}`).toBeLessThanOrEqual(COMBAT.dash.distanceTiles);
    }
  });

  it('the largest danger circle fits the view, and leaves a Dash of floor on each side of it across the screen', () => {
    for (const d of guardians()) {
      const widest = Math.max(...allAttacks(d).map((a) => 2 * a.areaRadius));
      expect(widest, d.id).toBeLessThan(view667.height);
      // Centred on the Guardian, the strip beside the circle is at least a Dash wide (12 tiles across at 667x375).
      expect((view667.width - widest) / 2, d.id).toBeGreaterThanOrEqual(COMBAT.dash.distanceTiles);
      // The whole box (body and area) of every attack fits the zoomed-out intro view too.
      const zoomed = view667.height / content.guardianScale.bossZoom.zoomTo;
      for (const a of allAttacks(d)) {
        const b = attackBox({ x: 0, y: 0 }, d.radius, { x: 1, y: 0 }, a);
        expect(b.y1 - b.y0, `${d.id}/${a.name}`).toBeLessThan(zoomed);
      }
    }
  });

  it('every supported size keeps a clear spot within a Dash', () => {
    for (const [w, h] of [[667, 375], [667, 320], [844, 390], [932, 430], [1024, 768], [800, 290]]) {
      for (const d of guardians()) expect(worstEscape(d, viewTiles(w, h)).dist, `${d.id} ${w}x${h}`).toBeLessThanOrEqual(COMBAT.dash.distanceTiles);
    }
  });
});

describe('GUARD-SCALE-01: the boss zoom-out', () => {
  const z = guardianScaleRaw.bossZoom;
  it('pulls back in a boss room, and never with Reduced motion on', () => {
    expect(bossZoomPlan(false, true, z)).toEqual(z);
    expect(bossZoomPlan(true, true, z)).toBeNull();
    expect(bossZoomPlan(false, false, z)).toBeNull();
    expect(bossZoomPlan(false, true, { ...z, zoomTo: 1 })).toBeNull();
  });

  it('is short, and GameScene plays it from the room intro using the Reduced motion setting', () => {
    expect(z.outMs + z.holdMs + z.backMs).toBeLessThanOrEqual(2000);
    expect(gameSceneRaw).toMatch(/bossZoomPlan\(reducedMotion\(\), /);
    expect(gameSceneRaw).toMatch(/private introduceRoom\(\): void \{\s*if \(!this\.run\) return;\s*this\.bossIntroZoom\(\);/);
    // The zoom ends at exactly 1, is reset when the scene is made, and reaches the camera limits too.
    expect(gameSceneRaw).toMatch(/this\.bossZoom = 1;\s*this\.layout\(\);/);
    expect(gameSceneRaw).toMatch(/\* this\.bossZoom;/);
  });
});

describe('GUARD-SCALE-01: the art is drawn at the same scale', () => {
  it('the sprite, shadow and head height use def.scale, including the dissolve and the waiting pose', () => {
    expect(gameSceneRaw).toMatch(/sprite\.container\.setScale\(scale\)/);
    expect(gameSceneRaw).toMatch(/addShadow\(this, \(r \* 2\.2\) \/ scale\)/);
    expect(gameSceneRaw).toMatch(/characterTop\(this, art\) \* scale/);
    expect(gameSceneRaw).toMatch(/setScale\(e\.def\.scale \* \(1 \+ 0\.3/);
    expect(gameSceneRaw).toMatch(/s\.container\.setScale\(e\.def\.scale\)/);
  });
});
