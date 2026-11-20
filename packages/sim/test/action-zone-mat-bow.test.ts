// Nov 20 (Jay): bow facing the mat before stepping on, and turn back to it and bow again before stepping off.
import { describe, expect, it } from 'vitest';
import { bowAtMat, createWorld, holdAtMat, loadInsideRoom, matBowHere, newMatGate, stepWorld, type MatGate, type Vec2 } from '../src';
import insideJson from '../../../content/dojo/action-zone/inside-room.json';

const inside = loadInsideRoom(insideJson);
const { room } = inside;
const bow = inside.matBow!;

/** Walks the hero straight up (dy -1) or down (dy 1) from `from` for `ticks`, holding it at the mat's edge. */
function walk(from: Vec2, dy: number, ticks: number, gate: MatGate): { pos: Vec2; held: boolean } {
  const world = createWorld(room, ['p1']);
  world.players.p1.pos = { ...from };
  let held = false;
  for (let t = 0; t < ticks; t++) {
    stepWorld(world, room, { p1: { kind: 'stick', x: 0, y: dy } });
    held = holdAtMat(bow, gate, world.players.p1.pos) || held;
  }
  return { pos: world.players.p1.pos, held };
}

describe('Action Zone mat bow', () => {
  it('reads the mat edge and its two openings from the room file', () => {
    expect(bow.line).toBeGreaterThan(9);
    expect(bow.line).toBeLessThanOrEqual(10);
    expect(bow.gaps).toHaveLength(2);
  });

  it('holds a hero who has not bowed at the edge, then lets them on after the bow', () => {
    const gate = newMatGate();
    const gapX = (bow.gaps[0][0] + bow.gaps[0][1]) / 2;
    const first = walk({ x: gapX, y: 12.5 }, -1, 60, gate);
    expect(first.held).toBe(true);
    expect(first.pos.y).toBe(bow.line);
    expect(gate.onMat).toBe(false);
    expect(matBowHere(bow, gate, first.pos)).toBe('enter');

    bowAtMat(gate, 'enter');
    expect(matBowHere(bow, gate, first.pos)).toBeNull();
    const second = walk(first.pos, -1, 40, gate);
    expect(second.pos.y).toBeLessThan(bow.line - 1);
    expect(gate.onMat).toBe(true);
    expect(gate.mayEnter).toBe(false);
  });

  it('holds a hero on the mat at the edge until they turn and bow, then lets them off', () => {
    const gate = newMatGate(true);
    // The east opening is one tile wide on the lobby side (the seats take column 17).
    const gapX = bow.gaps[1][1] - 0.5;
    const out = walk({ x: gapX, y: 7.5 }, 1, 80, gate);
    expect(out.held).toBe(true);
    expect(out.pos.y).toBe(bow.line);
    expect(matBowHere(bow, gate, out.pos)).toBe('leave');

    bowAtMat(gate, 'leave');
    const off = walk(out.pos, 1, 40, gate);
    expect(off.pos.y).toBeGreaterThan(bow.line + 1);
    expect(gate.onMat).toBe(false);
    // Back at the edge, stepping on again needs a new bow.
    expect(walk(off.pos, -1, 60, gate).pos.y).toBe(bow.line);
  });

  it('offers no bow away from the openings or far from the edge', () => {
    const gate = newMatGate();
    expect(matBowHere(bow, gate, { x: 13, y: bow.line + 0.2 })).toBeNull();
    expect(matBowHere(bow, gate, { x: 8, y: bow.line + 2 })).toBeNull();
  });

  it('forgets a bow once the hero walks away from the edge without crossing', () => {
    const gate = newMatGate();
    bowAtMat(gate, 'enter');
    holdAtMat(bow, gate, { x: 8, y: bow.line + 3 });
    expect(gate.mayEnter).toBe(false);
  });

  it('has the two wall boards as Read spots with their pictures', () => {
    const reads = inside.spots.filter((s) => s.kind === 'read');
    expect(reads.map((s) => s.image)).toEqual(['class-creed', 'belt-creed']);
  });
});
