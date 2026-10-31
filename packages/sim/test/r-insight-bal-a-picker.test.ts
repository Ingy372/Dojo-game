// R-INSIGHT-BAL-a (QA): the Insight picker's cards follow their text instead of a fixed 175 px.
// The live check (every card, both phone sizes) is the verify-ui-shots run in /workspace/shots/r-insight-bal-a/.
import { describe, expect, it } from 'vitest';
import { CARD_PAD, PICKER_BODY_SIZES, fitCards } from '../../../apps/client/src/ui/insightLayout';

describe('R-INSIGHT-BAL-a: Insight picker card height', () => {
  it('is the tallest text plus the padding, so the text is never outside the card', () => {
    const { cardH, bodySize } = fitCards((size) => 100 + size * 7, 400);
    expect(bodySize).toBe(PICKER_BODY_SIZES[0]);
    expect(cardH).toBeGreaterThanOrEqual(100 + bodySize * 7 + CARD_PAD);
  });

  it('keeps at least 8 px under the last line for any text height', () => {
    for (let low = 120; low < 260; low += 3.3) {
      const { cardH } = fitCards(() => low, 1000);
      expect(cardH - low).toBeGreaterThanOrEqual(CARD_PAD);
    }
  });

  it('steps the body text down one size at a time until the cards fit, and no further than the smallest readable size', () => {
    const tall = (size: number) => 100 + size * 10; // 260, 250, 240
    expect(fitCards(tall, 1000).bodySize).toBe(16);
    expect(fitCards(tall, 262 + CARD_PAD + 2).bodySize).toBe(16);
    expect(fitCards(tall, 260 + CARD_PAD).bodySize).toBe(15);
    expect(fitCards(tall, 250 + CARD_PAD).bodySize).toBe(14);
    expect(fitCards(tall, 10).bodySize).toBe(14); // never below TYPE.body
    expect(Math.min(...PICKER_BODY_SIZES)).toBe(14);
  });
});
