// R-CHALLENGE P5: TEST-ONLY sample `challenge` blocks shaped like the plan's rows C1-C5
// (drafts/planning/R-CHALLENGE-PATTERNS.md section 1). Not content: the real blocks are the
// Content Designer's C1. Numbers are placeholders that pass the loader (Challenge wind-up >= 14).
import { loadEnemy, type Content } from '../../src';
import swarmer from '../../../../content/enemies/swarmer.json';
import shield from '../../../../content/enemies/shield.json';
import floorKeeper from '../../../../content/enemies/floor-keeper.json';
import brute from '../../../../content/enemies/brute.json';
import bopper from '../../../../content/enemies/bopper.json';

const SAMPLES: Array<[Record<string, unknown>, unknown]> = [
  // C1 hop-in jab: lands 1 tile closer, red circle at the landing spot.
  [swarmer, { fromBelt: 4, fromRoom: 2, attacks: [{ name: 'hop-in jab', strength: 1, startRange: 1.9, reach: 1.5, areaRadius: 0.6, telegraphTicks: 20, recoverTicks: 18, landing: true }], pattern: ['jab', 'hop-in jab'] }],
  // C2 shield rush: a 2-tile lane, counterable at the end.
  [shield, { fromBelt: 4, fromRoom: 2, attacks: [{ name: 'shield rush', strength: 1, startRange: 2.2, reach: 2, areaRadius: 0.7, telegraphTicks: 20, recoverTicks: 20 }], pattern: ['shield bash', 'shield rush'] }],
  // C3 Floor Keeper: Challenge phase at 50%, slam - sweep - slam plus a dash-only shockwave lane.
  [floorKeeper, { fromBelt: 4, fromRoom: 1, attacks: [{ name: 'shockwave', strength: 1, startRange: 2.5, reach: 3, areaRadius: 0.6, telegraphTicks: 26, recoverTicks: 26, dashOnly: true, noOverlapWithRedCircle: true }], phases: [{ atHealthFraction: 1, attacks: ['slam', 'sweep'] }, { atHealthFraction: 0.5, attacks: ['slam', 'sweep', 'slam', 'shockwave'], senseiLine: 'Watch the lane!' }] }],
  // C4 double slam: two slams, the 2nd at 0.6 with its own full tell.
  [brute, { fromBelt: 5, fromRoom: 2, attacks: [{ name: 'double slam', strength: 1, startRange: 1.3, reach: 0.9, areaRadius: 0.95, telegraphTicks: 20, recoverTicks: 18, followUp: { strength: 0.6, gapTicks: 20 } }], pattern: ['attack', 'double slam'] }],
  // C5 wide bonk: a big front circle.
  [bopper, { fromBelt: 6, fromRoom: 2, attacks: [{ name: 'wide bonk', strength: 1, startRange: 1.6, reach: 1, areaRadius: 1.3, telegraphTicks: 20, recoverTicks: 20 }], pattern: ['bonk', 'wide bonk'] }],
];

/** The content with the sample blocks added (a copy; `content` is not changed). */
export function withSamplePatterns(content: Content): Content {
  const enemies = { ...content.enemies };
  for (const [file, block] of SAMPLES) enemies[file.id as string] = loadEnemy({ ...file, challenge: block });
  return { ...content, enemies };
}
