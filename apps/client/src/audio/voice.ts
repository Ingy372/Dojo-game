// The phone's own built-in voice (speechSynthesis), shared by Street Smarts and kata practice. No library and no
// network: if the device has no voice, nothing is said and the game carries on.

export interface VoiceOptions {
  rate?: number;
  /** 0.5 (low) to 1.5 (high): lets one phone voice sound like different people (Sensei lower, a kid higher). */
  pitch?: number;
  /** Called once when the words have been said (or straight away when there is no voice). */
  onEnd?: () => void;
}

/** Says `text` aloud, cutting off anything still being said. */
export function speak(text: string, rate: number | VoiceOptions = 0.95): void {
  const o: VoiceOptions = typeof rate === 'number' ? { rate } : rate;
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    o.onEnd?.();
  };
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) return end();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = o.rate ?? 0.95;
    if (o.pitch !== undefined) u.pitch = o.pitch;
    u.onend = end;
    u.onerror = end;
    synth.speak(u);
  } catch {
    // No voice on this device: the words are still on screen.
    end();
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
