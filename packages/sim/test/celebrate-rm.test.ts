import { describe, expect, it } from 'vitest';

const src = Object.values(import.meta.glob('../../../apps/client/src/ui/Celebrations.ts', { query: '?raw', import: 'default', eager: true }))[0] as string;
const body = (name: string) => src.slice(src.indexOf(`private ${name}(`), src.indexOf('\n  }\n', src.indexOf(`private ${name}(`)));

describe('Celebrations with Reduced motion on', () => {
  it('shows no confetti', () => {
    expect(body('burst')).toMatch(/^\s*private burst\([^)]*\): void \{\s*if \(reducedMotion\(\)\) return;/);
  });
  it('keeps the rays still (the spin only runs when Reduced motion is off)', () => {
    expect(body('rays')).toMatch(/if \(!reducedMotion\(\)\) this\.scene\.tweens\.add\(\{ targets: g, angle: 360/);
    expect(body('rays').match(/angle: 360/g)).toHaveLength(1);
  });
});
