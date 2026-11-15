// PB-05: the new Fighting Style words. No timers, no "missing", no purchase or pressure words.
import { describe, expect, it } from 'vitest';
import words from '../../../content/abilities/fighting-style.json';
import help from '../../../content/abilities/fighting-style-help.json';
import sealText from '../../../content/abilities/seal-families-text.json';

const BANNED = /timer|countdown|hurry|missing|purchase|\bbuy\b|\bshop\b|\$|don't miss|only \w+ left|\blose\b|\bfail\b|\blocked\b|🔒/i;

function check(label: string, text: string): void {
  expect(text, label).not.toMatch(BANNED);
  expect(text, label).not.toMatch(/\d/);
}

describe('PB-05 no pressure words', () => {
  it('keeps the new screen lines free of pressure, timers, prices and digits', () => {
    const screen = [
      words.emptyStrike, words.emptyKata, words.emptySeal, words.comingLater, words.swapPrompt,
      words.swapCancel, words.takeOut, words.gotIt, words.slotNote, words.sealRank, words.newWord,
      words.hint, words.notYet, words.askSensei,
      ...Object.values(words.slots), ...Object.values(words.choose),
    ];
    screen.forEach((line, i) => check(`screen ${i}`, line));
    for (const row of help.help) check(row.id, row.line);
    check('swap', sealText.ui.swapPrompt);
    check('note', sealText.ui.slotNote);
    check('soon', sealText.ui.emptySlots.kata);
    check('later', sealText.families.find((f) => f.id === 'lock')?.comingLater ?? '');
  });
});
