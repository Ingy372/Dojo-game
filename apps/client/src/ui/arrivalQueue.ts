// Pure (no Phaser) so it can be unit-tested.

/**
 * G2B12-FIXES: the first Dojo visit used to chain up to five full-screen cards (Bow, Your Home Dojo,
 * the class gift, Welcome home, Sensei's new-system card). Each already waited for the one before, but
 * a child tapped through all of them. On the very first visit Welcome Week's new-system card now waits for
 * the next visit; the bow, the Home Dojo card, the gift and the celebrations still play, one at a time.
 *
 * Calling `systemForToday` saves that the system was introduced, so the caller must ask here first.
 */
export function systemMayShow(s: { firstVisit: boolean }): boolean {
  return !s.firstVisit;
}
