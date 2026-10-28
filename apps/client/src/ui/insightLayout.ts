/**
 * The Insight picker's card size follows its text (R-INSIGHT-BAL-a QA). A card used to be a fixed
 * 175 px high, so any text longer than the 3-line cards the first cards had spilled below the border.
 */

/** Body-text sizes the picker may use, largest first. The last is TYPE.body, the smallest readable size. */
export const PICKER_BODY_SIZES = [16, 15, 14] as const;

/** Space kept under the last line of the tallest card, (measured from the border's inner edge), and between the cards and the screen's bottom edge. */
export const CARD_PAD = 8;

/** The card border is 3 px, centred on the edge: its inner side is 1.5 px (rounded up to 2) inside the card height. */
const BORDER_IN = 2;

/**
 * Picks the largest body size whose cards (all as tall as the tallest) end on screen.
 * `contentBottom(size)` is how far below the card top the lowest text ends at that size.
 * If even the smallest size does not fit, it is still the one used.
 */
export function fitCards(
  contentBottom: (bodySize: number) => number,
  room: number,
  sizes: readonly number[] = PICKER_BODY_SIZES,
): { bodySize: number; cardH: number } {
  for (const bodySize of sizes) {
    const cardH = Math.ceil(contentBottom(bodySize)) + CARD_PAD + BORDER_IN;
    if (cardH <= room) return { bodySize, cardH };
  }
  const bodySize = sizes[sizes.length - 1];
  return { bodySize, cardH: Math.ceil(contentBottom(bodySize)) + CARD_PAD + BORDER_IN };
}
