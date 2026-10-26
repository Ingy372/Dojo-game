// M7-P8: the Music and Sound volumes (0..5), saved on this device.
import { volumeStep } from '@dojo/sim';
import AUDIO from '../../../../content/settings/audio.json';

export const AUDIO_TEXT = AUDIO;
export type Channel = 'music' | 'sound';
const KEYS: Record<Channel, string> = { music: 'dojo.musicVol', sound: 'dojo.sfxVol' };

export function loadVolume(ch: Channel): number {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEYS[ch]);
  } catch {
    // No storage (private mode): use the default.
  }
  return volumeStep(raw, AUDIO[ch].default);
}

export function saveVolume(ch: Channel, step: number): void {
  try {
    localStorage.setItem(KEYS[ch], String(step));
  } catch {
    // Not saved; it still works until the game closes.
  }
}
