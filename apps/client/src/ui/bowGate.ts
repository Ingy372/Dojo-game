// Pure (no Phaser) so it can be unit-tested.

/**
 * Q-BOW-OVER-MENU: whether a due bow prompt may appear now. While a menu or panel is open it
 * waits ('hold'); once the menu closes it shows ('show'), and only once ('idle' after that).
 */
export function bowGate(s: { due: boolean; menuOpen: boolean; shown: boolean }): 'idle' | 'hold' | 'show' {
  if (!s.due || s.shown) return 'idle';
  return s.menuOpen ? 'hold' : 'show';
}
