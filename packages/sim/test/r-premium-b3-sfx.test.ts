import { describe, expect, it } from 'vitest';
import SFX from '../../../content/settings/sfx.json';

// Every file under assets/audio/sfx/ (keys only; nothing is loaded).
const shippedAll = Object.keys(import.meta.glob('../../../assets/audio/sfx/**/*')).map((k) => k.replace('../../../assets/', ''));
const sfxSrc = Object.values(import.meta.glob('../../../apps/client/src/audio/Sfx.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
const clientSrc = import.meta.glob('../../../apps/client/src/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
type V = { file: string; meanDb: number; peakDb: number; gainDb: number };
type E = { target: number; variants: V[]; accent?: { target: number; variants: V[] } };
const events = SFX.events as Record<string, E>;
const all = (e: E) => [...e.variants, ...(e.accent?.variants ?? [])];

describe('R-PREMIUM-b3 sound files', () => {
  it('every listed file is in assets/ (the served folder), and every shipped sound is listed', () => {
    const listed = new Set(Object.values(events).flatMap((e) => all(e).map((v) => v.file)));
    const shipped = shippedAll.filter((f) => /\.(ogg|wav)$/.test(f));
    for (const f of listed) expect(shipped, f).toContain(f);
    expect(new Set(shipped)).toEqual(listed);
  });

  it('each pack folder ships its licence', () => {
    const packs = new Set(shippedAll.map((f) => f.split('/')[2]));
    expect(packs.size).toBe(5);
    for (const d of packs) expect(shippedAll.some((f) => f.split('/')[2] === d && /licen[cs]e/i.test(f)), d).toBe(true);
  });

  it('no file peaks above the ceiling after its gain, and each gain aims at its group target', () => {
    for (const [id, e] of Object.entries(events)) {
      for (const v of all(e)) expect(v.peakDb + v.gainDb, `${id} ${v.file}`).toBeLessThanOrEqual(SFX.ceilingDb + 0.05);
      for (const v of e.variants) expect(v.meanDb + v.gainDb, `${id} ${v.file}`).toBeLessThanOrEqual(e.target + 0.05);
    }
  });

  it('the 8-bit sounds stay light accents, under the sound they go with', () => {
    for (const e of Object.values(events)) {
      if (!e.accent) continue;
      const main = Math.min(...e.variants.map((v) => v.meanDb + v.gainDb));
      for (const v of e.accent.variants) expect(v.meanDb + v.gainDb).toBeLessThan(main);
    }
    const hot = Object.values(events).flatMap(all).filter((v) => /powerup2|jump1/.test(v.file));
    expect(hot.length).toBeGreaterThan(0);
    for (const v of hot) expect(v.gainDb).toBeLessThanOrEqual(-8);
  });

  it('every event in sfx.json is played by Sfx.ts, and falls back to the sound made in code', () => {
    for (const id of Object.keys(events)) expect(sfxSrc, id).toContain(`'${id}'`);
    const plays = sfxSrc.match(/if \(this\.playFile\(.*\)\) return;/g) ?? [];
    expect(plays.length).toBe(11); // 13 entries: loot picks one of three
  });

  it('the picks: STEEL00 level up, STEEL04 promotion, click_001 tap, wood block, cloth whoosh, PIZZI by rank', () => {
    const f = (id: string) => events[id].variants.map((v) => v.file.split('/').pop());
    expect(f('levelUp')).toEqual(['jingles_STEEL00.ogg']);
    expect(f('promotion')).toEqual(['jingles_STEEL04.ogg']);
    expect(f('tap')).toEqual(['click_001.ogg']);
    expect(f('block').every((n) => /impactWood/.test(n!))).toBe(true);
    expect(f('whoosh')).toEqual(['cloth1.ogg', 'cloth2.ogg', 'cloth3.ogg']);
    expect([f('loot0'), f('loot1'), f('loot2')]).toEqual([['jingles_PIZZI00.ogg'], ['jingles_PIZZI01.ogg'], ['jingles_PIZZI07.ogg']]);
  });

  it("the counter layer is called Great Counter in code, and clank stays made in code", () => {
    expect(sfxSrc).toMatch(/greatCounter\(\): void/);
    for (const [p, s] of Object.entries(clientSrc)) expect(s, p).not.toMatch(/sfx\.perfect\(/);
    expect(events.clank).toBeUndefined();
    expect(events.greatCounter).toBeUndefined();
  });
});

import { LEVELUP_KEY, takeLevelUpSound, type KeyStore } from '../../../apps/client/src/ui/lastRun';

const homeSrc = Object.values(import.meta.glob('../../../apps/client/src/scenes/HomeScene.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
const mem = (): KeyStore & { m: Map<string, string> } => {
  const m = new Map<string, string>();
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};

describe('R-PREMIUM-b3 level-up sound on the Home levels-gained screen', () => {
  it('plays once per run that gained a level, and never for a run with no level gained', () => {
    const st = mem();
    expect(takeLevelUpSound(st, 'run-1', 0)).toBe(false);
    expect(takeLevelUpSound(st, 'run-1', 1)).toBe(true);
    expect(takeLevelUpSound(st, 'run-1', 1)).toBe(false); // reopening the screen stays quiet
    expect(takeLevelUpSound(st, 'run-2', 2)).toBe(true); // the next run's level-up plays
    expect(st.m.get(LEVELUP_KEY)).toBe('run-2');
  });

  it('is quiet with no id or no storage, and survives a storage that throws', () => {
    expect(takeLevelUpSound(null, 'run-1', 1)).toBe(false);
    expect(takeLevelUpSound(mem(), '', 1)).toBe(false);
    const bad: KeyStore = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); } };
    expect(takeLevelUpSound(bad, 'run-1', 1)).toBe(false);
  });

  it('Home calls sfx.levelUp() only through that gate, from one place', () => {
    const run = homeSrc.slice(homeSrc.indexOf('private renderRun('), homeSrc.indexOf('private turnFound('));
    expect(run).toContain('if (takeLevelUpSound(safeStore(), levelUpId, m.levelsGained)) sfx.levelUp();');
    expect(homeSrc.match(/sfx\.levelUp\(\)/g)).toHaveLength(1);
  });

  it('the sound is timed by the XP bar, not by a guessed delay: it fires on the fill tween\'s onComplete', () => {
    const run = homeSrc.slice(homeSrc.indexOf('private renderRun('), homeSrc.indexOf('private turnFound('));
    // The one tween that fills the bar calls the sound when it completes.
    const fill = run.slice(run.indexOf('if (count) {\n      drawBar(from);'));
    expect(fill).toMatch(/duration: LASTRUN_MOTION\.fillMs,[^\n]*onComplete: levelUpSound \}\);/);
    // Reduced motion (or a count-up already shown): the bar is drawn full at once, and the sound is at once.
    expect(fill).toMatch(/\} else \{\n      drawBar\(share\);\n      levelUpSound\(\);\n    \}/);
    // No timer anywhere near the sound.
    const decl = run.slice(run.indexOf('const levelUpSound'), run.indexOf('// Banner'));
    expect(decl).not.toMatch(/delayedCall|setTimeout|delay:/);
    expect(run).not.toMatch(/delayedCall\([^)]*levelUp/);
  });
});
