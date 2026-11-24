// The phone's own built-in voice (speechSynthesis), shared by Street Smarts and kata practice. No library and no
// network: if the device has no voice, nothing is said and the game carries on.

/** Says `text` aloud, cutting off anything still being said. */
export function speak(text: string, rate = 0.95): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    synth.speak(u);
  } catch {
    // No voice on this device: the words are still on screen.
  }
}

/** Stops anything being said. */
export function hush(): void {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // Nothing to stop.
  }
}
