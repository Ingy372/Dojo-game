// Green floors (Nov 26): a test link that switches on floor sets that are still off in the live game,
// so Jay can play a new belt's floors before they go live: ?floors=giants-steps (several: comma-separated).
// Test links are always off in a beta build (testFlags), so players never see it.

/** The floor-set switches with the ones a ?floors= test link names turned on. Unknown names are ignored. */
export function withTestFloorSets<T extends { sets: Record<string, boolean> }>(raw: T, param: string | null): T {
  if (!param) return raw;
  const asked = param.split(',').map((s) => s.trim()).filter((s) => s in raw.sets);
  if (asked.length === 0) return raw;
  return { ...raw, sets: { ...raw.sets, ...Object.fromEntries(asked.map((s) => [s, true])) } };
}
