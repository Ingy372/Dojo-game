// Pure (no Phaser) so it can be unit-tested.

/**
 * Q-BOW-OVER-MENU: whether a due bow prompt may appear now. While a menu, panel, card or the
 * arrival sequence (Welcome back cards, the "Welcome home" celebrations, Sensei) is up it waits
 * ('hold'); once everything is closed it shows ('show'), and only once ('idle' after that).
 *
 * `arriving` is its own input on purpose: the arrival splash is not a card() and is not always
 * reflected in the scene mode, so the gate must be told about it directly.
 */
export function bowGate(s: { due: boolean; menuOpen: boolean; arriving?: boolean; shown: boolean }): 'idle' | 'hold' | 'show' {
  if (!s.due || s.shown) return 'idle';
  return s.menuOpen || s.arriving ? 'hold' : 'show';
}
