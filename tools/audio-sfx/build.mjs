// R-PREMIUM-b3: copies the wired sound files from incoming-art/audio/sfx/ into
// assets/audio/sfx/ (the game's served folder) and writes content/settings/sfx.json
// with each file's measured level and the gain that brings it to its group's target.
// Needs ffmpeg on the PATH (a dev tool only; the game never runs it).
// Run from the repo root: node tools/audio-sfx/build.mjs
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const SRC = 'incoming-art/audio/sfx/';
const OUT = 'assets/audio/sfx/';
const CEILING = -1; // dBFS: no file's peak goes above this after its gain.

// Each event: its files, and the mean level (dB) the group is balanced to.
// The 8-bit accents sit well under the main sound so they stay light. Targets were set by
// the loudness check (docs/shots/r-premium-b3/loudness.txt): every-hit sounds sit near the
// code-made combat sounds, small rewards under the real celebrations, the promotion biggest.
const EVENTS = {
  hit: { target: -26, files: ['kenney-impact/impactPunch_medium_000.ogg', 'kenney-impact/impactPunch_medium_001.ogg', 'kenney-impact/impactPunch_medium_002.ogg'] },
  strike: { target: -23, files: ['kenney-impact/impactPunch_heavy_000.ogg', 'kenney-impact/impactPunch_heavy_001.ogg'] },
  block: { target: -26, files: ['kenney-impact/impactWood_medium_000.ogg', 'kenney-impact/impactWood_medium_001.ogg'] },
  whoosh: { target: -26, files: ['kenney-rpg/cloth1.ogg', 'kenney-rpg/cloth2.ogg', 'kenney-rpg/cloth3.ogg'] },
  dash: { target: -27, files: ['kenney-rpg/cloth1.ogg', 'kenney-rpg/cloth2.ogg', 'kenney-rpg/cloth3.ogg'], accent: { target: -28, files: ['oga-512-8bit/sfx_movement_jump1.wav'] } },
  tap: { target: -30, files: ['kenney-interface/click_001.ogg'] },
  chest: { target: -24, files: ['kenney-jingles/jingles_PIZZI07.ogg'] },
  loot0: { target: -25, files: ['kenney-jingles/jingles_PIZZI00.ogg'], accent: { target: -26, files: ['oga-512-8bit/sfx_coin_single1.wav'] } },
  loot1: { target: -23, files: ['kenney-jingles/jingles_PIZZI01.ogg'], accent: { target: -26, files: ['oga-512-8bit/sfx_coin_single1.wav'] } },
  loot2: { target: -21, files: ['kenney-jingles/jingles_PIZZI07.ogg'], accent: { target: -26, files: ['oga-512-8bit/sfx_coin_double1.wav'] } },
  insight: { target: -24, files: ['oga-512-8bit/sfx_sounds_powerup2.wav'] },
  levelUp: { target: -24, files: ['kenney-jingles/jingles_STEEL00.ogg'] },
  promotion: { target: -15, files: ['kenney-jingles/jingles_STEEL04.ogg'] },
};

const levels = (file) => {
  const r = execFileSync('sh', ['-c', `ffmpeg -hide_banner -nostats -i "${SRC + file}" -af volumedetect -f null - 2>&1`], { encoding: 'utf8' });
  const mean = Number(/mean_volume: (-?[\d.]+) dB/.exec(r)[1]);
  const peak = Number(/max_volume: (-?[\d.]+) dB/.exec(r)[1]);
  return { mean, peak };
};
const round1 = (n) => Math.round(n * 10) / 10;
const entry = (target) => (file) => {
  const { mean, peak } = levels(file);
  const gainDb = round1(Math.min(target - mean, CEILING - peak));
  mkdirSync(dirname(OUT + file), { recursive: true });
  copyFileSync(SRC + file, OUT + file);
  return { file: `audio/sfx/${file}`, meanDb: mean, peakDb: peak, gainDb };
};

const events = {};
for (const [id, e] of Object.entries(EVENTS)) {
  events[id] = { target: e.target, variants: e.files.map(entry(e.target)) };
  if (e.accent) events[id].accent = { target: e.accent.target, variants: e.accent.files.map(entry(e.accent.target)) };
}
for (const pack of ['kenney-impact', 'kenney-interface', 'kenney-jingles', 'kenney-rpg']) copyFileSync(`${SRC}${pack}/License.txt`, `${OUT}${pack}/License.txt`);
copyFileSync(`${SRC}oga-512-8bit/INFO-license.txt`, `${OUT}oga-512-8bit/INFO-license.txt`);

const json = {
  _note: 'R-PREMIUM-b3. Sound files for game events (CC0 packs, see incoming-art/audio/sfx/README.md). Made by tools/audio-sfx/build.mjs: meanDb/peakDb are measured (ffmpeg volumedetect), gainDb brings the mean to the group target and never lets the peak pass -1 dBFS. Events not listed keep their sounds made in code. Paths are relative to the game (served from assets/).',
  ceilingDb: CEILING,
  events,
};
writeFileSync('content/settings/sfx.json', JSON.stringify(json, null, 2) + '\n');
console.log(Object.entries(events).map(([k, e]) => `${k}: ${e.variants.map((v) => `${v.file.split('/').pop()} ${v.gainDb}`).join(', ')}${e.accent ? ' + ' + e.accent.variants.map((v) => `${v.file.split('/').pop()} ${v.gainDb}`).join(', ') : ''}`).join('\n'));
