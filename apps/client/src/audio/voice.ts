// The phone's own built-in voice (speechSynthesis), shared by Street Smarts and kata practice. No library and no
// network: if the device has no voice, nothing is said and the game carries on.

export interface VoiceOptions {
  rate?: number;
  /** 0.5 (low) to 1.5 (high): lets one phone voice sound like different people (Sensei lower, a kid higher). */
  pitch?: number;
  /** Called once when the words have been said (or straight away when there is no voice). */
  onEnd?: () => void;
}

// Some browsers list their voices only after being asked once: ask early, so the first line can pick well.
try {
  window.speechSynthesis?.getVoices();
} catch {
  // No voices on this device.
}

/**
 * Nov 26 (Kids Category check): only a voice that runs on the device itself. Some browsers (Chrome on a computer)
 * offer online voices as the default, which send the words to another company's server: those are never used.
 * Undefined while the browser hasn't listed its voices yet (then the phone's default, which is on the device on
 * phones); null when every voice it has is an online one (then nothing is said and the words stay on screen).
 */
function deviceVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null | undefined {
  const all = synth.getVoices();
  if (all.length === 0) return undefined;
  const local = all.filter((v) => v.localService);
  const lang = (navigator.language || 'en').slice(0, 2).toLowerCase();
  const mine = local.filter((v) => v.lang.toLowerCase().startsWith(lang));
  return mine.find((v) => v.default) ?? mine[0] ?? local.find((v) => v.default) ?? local[0] ?? null;
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
    const voice = deviceVoice(synth);
    if (voice === null) return end();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
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
