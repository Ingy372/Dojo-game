// Q-P4 QA: a test link to force one Challenge pattern attack, e.g. ?force=wide-bonk (the bopper's wide bonk).
// Only read from the URL test flags; normal play never calls it. Phaser-free so the sim tests can use it.
import type { Content, EnemyDef } from '@dojo/sim';

export interface ForcedAttack {
  /** The enemy that owns the attack. */
  id: string;
  /** That enemy with its Challenge pattern cut down to just the forced attack. */
  def: EnemyDef;
}

/** `wide-bonk` or `wide bonk` -> the enemy whose Challenge block has that attack, with a one-attack pattern. */
export function forceAttack(enemies: Record<string, EnemyDef>, asked: string | null): ForcedAttack | null {
  if (!asked) return null;
  const name = asked.replace(/-/g, ' ').trim().toLowerCase();
  for (const [id, def] of Object.entries(enemies)) {
    const c = def.challenge;
    if (!c) continue;
    const k = [...def.attacks, ...c.attacks].findIndex((a) => a.name.toLowerCase() === name);
    if (k < 0 || !c.attacks.some((a) => a.name.toLowerCase() === name)) continue;
    return { id, def: { ...def, challenge: { ...c, pattern: [k] } } };
  }
  return null;
}

/** The content with the forced enemy swapped in (unchanged when nothing is forced). */
export function withForced(content: Content, f: ForcedAttack | null): Content {
  return f ? { ...content, enemies: { ...content.enemies, [f.id]: f.def } } : content;
}
