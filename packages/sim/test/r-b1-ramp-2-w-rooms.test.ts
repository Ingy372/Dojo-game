// R-B1-RAMP-2: the 15 white-belt room copies (w-*, #359) draw and play like their originals.
// Room art comes from the room's tiles plus the belt's art pack (no art is keyed by room id), so a
// copy with the original's layout looks the same; the Monster Journal goes by enemy kind.
import { describe, expect, it } from 'vitest';
import { baseRoomId, beltRoomId, floorRooms, journalKinds } from '../src';
import { testContent } from './load-content';

const content = testContent();
const copies = content.rooms.filter((r) => r.id.startsWith('w-'));
const byId = new Map(content.rooms.map((r) => [r.id, r]));
// The only shown text a copy may change (Manager, 2026-10-26).
const ALLOWED: Record<string, Array<'name' | 'mix'>> = { 'w-brute-and-swarm': ['name', 'mix'], 'w-stone-garden': ['mix'] };
const raw = import.meta.glob('../../../content/rooms/*.json', { eager: true, import: 'default' }) as Record<string, Record<string, unknown>>;
const rawOf = (id: string) => Object.entries(raw).find(([k]) => k.endsWith(`/${id}.json`))![1];

describe('R-B1-RAMP-2: w- room copies', () => {
  it('there are 15 copies, each of a real original, all in the white belt set', () => {
    expect(copies).toHaveLength(15);
    for (const c of copies) expect(byId.get(baseRoomId(c.id)), c.id).toBeDefined();
    expect(floorRooms(content, 1).map((r) => r.id).sort()).toEqual(copies.map((r) => r.id).sort());
  });

  it('each copy keeps its original layout (so the same art), and only the 3 allowed texts differ', () => {
    for (const c of copies) {
      const o = byId.get(baseRoomId(c.id))!;
      for (const k of ['width', 'height', 'walls', 'playerStart', 'kind', 'doors', 'chest', 'shrine', 'parSeconds', 'challenge', 'earliestRoom', 'goal', 'tutorial'] as const) expect(c[k], `${c.id} ${k}`).toEqual(o[k]);
      const rc = rawOf(c.id), ro = rawOf(o.id);
      expect(rc.tiles, `${c.id} tiles`).toEqual(ro.tiles);
      expect(rc.legend, `${c.id} legend`).toEqual(ro.legend);
      const diff = (['name', 'mix'] as const).filter((k) => rc[k] !== ro[k]);
      expect(diff, c.id).toEqual(ALLOWED[c.id] ?? []);
    }
    expect(rawOf('w-brute-and-swarm').mix).toMatch(/^Shield \+ swarmers/);
  });

  it('every enemy in a copy is a shield or swarmer (or the Floor Keeper boss) with a Monster Journal entry', () => {
    const journal = new Set(journalKinds(content, []).map((k) => k.monster));
    for (const c of copies) for (const s of c.enemySpawns) {
      expect(c.kind === 'boss' ? ['shield', 'swarmer', 'floor-keeper'] : ['shield', 'swarmer'], c.id).toContain(s.enemy);
      expect(journal.has(s.enemy), `${c.id} ${s.enemy}`).toBe(true);
    }
  });

  it('?room=<original> gives the belt\'s own copy at belt 1, the original at belt 2, and w- ids as asked', () => {
    for (const c of copies) {
      const o = baseRoomId(c.id);
      expect(beltRoomId(content, o, 1)).toBe(c.id);
      expect(beltRoomId(content, o, 2)).toBe(o);
      expect(beltRoomId(content, c.id, 1)).toBe(c.id);
      expect(beltRoomId(content, c.id, 2)).toBe(c.id);
    }
    expect(beltRoomId(content, 'bopper-yard', 1)).toBe('bopper-yard');
    expect(beltRoomId(content, 'no-such-room', 1)).toBe('no-such-room');
  });
});
