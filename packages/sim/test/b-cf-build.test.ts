// B-CF-BUILD: Cloudflare Workers Builds picks the installer from the lockfile. A stray pnpm or yarn
// lockfile makes it skip npm, install nothing and fail the build (tsc not found). npm only.
import { describe, expect, it } from 'vitest';

const stray = Object.keys(import.meta.glob(['../../../pnpm-lock.yaml', '../../../yarn.lock'], { query: '?raw', import: 'default' }));
const npmLock = Object.keys(import.meta.glob('../../../package-lock.json', { query: '?raw', import: 'default' }));

describe('B-CF-BUILD', () => {
  it('no pnpm-lock.yaml or yarn.lock at the repo root', () => {
    expect(stray).toEqual([]);
  });
  it('package-lock.json is there (the glob can see the repo root)', () => {
    expect(npmLock.length).toBe(1);
  });
});
