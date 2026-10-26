// M7-P8: volume steps and the screen-to-music map. Pure rules; the client plays the sound.

/** Volume goes from 0 (off) to 5 (full) in whole steps. */
export const VOLUME_STEPS = 5;

/** A saved volume (a string from storage, or anything else) as a step 0..5; bad values give the fallback. */
export function volumeStep(raw: unknown, fallback: number): number {
  const n = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : typeof raw === 'number' ? raw : NaN;
  if (!Number.isInteger(n)) return fallback;
  return Math.min(VOLUME_STEPS, Math.max(0, n));
}

/** One press of − or +. Stops at 0 and 5. */
export function nudgeVolume(step: number, delta: -1 | 1): number {
  return Math.min(VOLUME_STEPS, Math.max(0, step + delta));
}

/** The gain for a step, where `full` is the gain at step 5. */
export function stepGain(step: number, full: number): number {
  return (full * Math.min(VOLUME_STEPS, Math.max(0, step))) / VOLUME_STEPS;
}

export interface MusicTrack {
  id: string;
  name: string;
  file: string;
}

export interface AudioMap {
  tracks: Record<string, MusicTrack>;
  scenes: Record<string, string>;
  fadeSeconds: number;
}

/** Checks content/settings/audio.json: every screen must name a track that exists. */
export function parseAudioMap(raw: unknown): AudioMap {
  const r = raw as { tracks?: Record<string, { name?: unknown; file?: unknown }>; scenes?: Record<string, unknown>; fadeSeconds?: unknown };
  if (!r || typeof r !== 'object' || !r.tracks || !r.scenes) throw new Error('audio map: needs tracks and scenes');
  const tracks: Record<string, MusicTrack> = {};
  for (const [id, t] of Object.entries(r.tracks)) {
    if (typeof t?.name !== 'string' || typeof t.file !== 'string' || !t.file) throw new Error(`audio map: track ${id} needs a name and file`);
    tracks[id] = { id, name: t.name, file: t.file };
  }
  const scenes: Record<string, string> = {};
  for (const [scene, id] of Object.entries(r.scenes)) {
    if (typeof id !== 'string' || !tracks[id]) throw new Error(`audio map: screen ${scene} names unknown track ${String(id)}`);
    scenes[scene] = id;
  }
  const fade = typeof r.fadeSeconds === 'number' && r.fadeSeconds >= 0 ? r.fadeSeconds : 1;
  return { tracks, scenes, fadeSeconds: fade };
}

/** The track for a screen, or null for a screen with no music. */
export function trackFor(map: AudioMap, scene: string): MusicTrack | null {
  const id = map.scenes[scene];
  return id ? map.tracks[id] : null;
}
