// The art the content names is really in the packed art (assets/art/), so nothing falls back by accident.
import { describe, expect, it } from 'vitest';
import { testContent } from './load-content';
import playerA from '../../../assets/art/player-a.json';
import playerB from '../../../assets/art/player-b.json';
import named from '../../../assets/art/named-monster.json';

type Pack = { entries: Record<string, { animations?: Record<string, { stance?: string }>; sprites?: Record<string, unknown> }> };
const content = testContent();

describe('art links', () => {
  // R-STANCE-d1 (Manager call): Horse uses the approved rooted idle; Cat, Front and Fighting use Ready's idle.
  it('Horse Stance has the one stance idle on both bodies; no other Stance is tagged', () => {
    const stances = content.abilities.stances.filter((f) => f.id === 'horse-stance');
    const others = content.abilities.stances.filter((f) => f.id !== 'horse-stance');
    expect(stances.length).toBeGreaterThan(0);
    for (const pack of [playerA, playerB] as Pack[]) {
      const tagged = Object.values(pack.entries.player.animations ?? {}).map((a) => a.stance).filter(Boolean);
      for (const f of stances) expect(tagged.filter((t) => t === f.id), f.id).toHaveLength(1);
      for (const f of others) expect(tagged.filter((t) => t === f.id), f.id).toHaveLength(0);
    }
  });

  it('every Journal trophy names a silhouette that is in the named-monster pack', () => {
    const sprites = Object.values((named as Pack).entries).flatMap((e) => Object.keys(e.sprites ?? {}));
    const trophies = content.dojo.decorations.filter((d) => d.source === 'trophy');
    expect(trophies.map((t) => t.monster)).toEqual(expect.arrayContaining(['floor-keeper', 'bopper']));
    for (const t of trophies) {
      expect(t.silhouette, t.id).toBeDefined();
      expect(sprites, t.id).toContain(t.silhouette);
    }
  });
});
