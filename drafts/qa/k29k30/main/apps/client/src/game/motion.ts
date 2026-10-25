// Reduced motion (K12): one switch for this device. It starts on if the device asks for
// less motion (prefers-reduced-motion) and can be changed in the game (Title screen).
// When on: no screen shake, no sparkles, no dash trail and no flashes.

const KEY = 'dojo.reducedMotion';

function osPrefers(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Is reduced motion on? A saved choice wins; otherwise it follows the device setting. */
export function reducedMotion(): boolean {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'on') return true;
    if (v === 'off') return false;
  } catch {
    // No storage (private mode): follow the device.
  }
  return osPrefers();
}

export function setReducedMotion(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Not saved; it still follows the device next time.
  }
}
