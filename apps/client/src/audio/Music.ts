// M7-P8: background music. It plays on the same audio context as the sound effects, so
// it starts only after the first touch (phones require that) and pauses with them when
// the app goes to the background. Each screen's track comes from content/settings/audio.json.
// A missing or unreadable track file just means silence: the game never stops for music.
import { parseAudioMap, stepGain, trackFor, type MusicTrack } from '@dojo/sim';
import { sfx } from './Sfx';
import { AUDIO_TEXT, loadVolume } from './volume';

const MAP = parseAudioMap(AUDIO_TEXT);

interface Playing {
  id: string;
  src: AudioBufferSourceNode;
  gain: GainNode;
}

class MusicPlayer {
  private wanted: MusicTrack | null = null;
  private playing: Playing | null = null;
  private pending: string | null = null;
  private bus: GainNode | null = null;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private seq = 0;

  constructor() {
    sfx.onUnlock(() => this.apply());
  }

  /** A screen has opened: fade to its track (or to silence). */
  setScene(scene: string): void {
    this.wanted = trackFor(MAP, scene);
    this.apply();
  }

  /** Music volume step 0..5 (Settings). */
  setVolume(step: number): void {
    if (this.bus) this.bus.gain.value = stepGain(step, AUDIO_TEXT.music.full);
  }

  private apply(): void {
    const ctx = sfx.context();
    if (!ctx) return; // Before the first touch: remember the track, start on unlock.
    if (!this.bus) {
      this.bus = ctx.createGain();
      this.bus.gain.value = stepGain(loadVolume('music'), AUDIO_TEXT.music.full);
      this.bus.connect(ctx.destination);
    }
    const want = this.wanted;
    if ((this.playing && this.playing.id === want?.id) || (this.pending && this.pending === want?.id)) return;
    const token = ++this.seq;
    this.fadeOut(ctx);
    this.pending = want?.id ?? null;
    if (!want) return;
    void this.load(ctx, want).then((buf) => {
      if (token !== this.seq) return;
      this.pending = null;
      if (!buf || !this.bus) return;
      try {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const gain = ctx.createGain();
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(1, t + MAP.fadeSeconds);
        src.connect(gain).connect(this.bus);
        src.start(t);
        this.playing = { id: want.id, src, gain };
      } catch {
        // Couldn't start this track: stay silent.
      }
    });
  }

  private fadeOut(ctx: AudioContext): void {
    const p = this.playing;
    this.playing = null;
    if (!p) return;
    try {
      const t = ctx.currentTime;
      p.gain.gain.cancelScheduledValues(t);
      p.gain.gain.setValueAtTime(p.gain.gain.value, t);
      p.gain.gain.linearRampToValueAtTime(0, t + MAP.fadeSeconds);
      p.src.stop(t + MAP.fadeSeconds + 0.05);
    } catch {
      // Already stopped.
    }
  }

  /** Fetches and decodes a track once; null if the file is missing or can't be read. */
  private load(ctx: AudioContext, track: MusicTrack): Promise<AudioBuffer | null> {
    let p = this.buffers.get(track.id);
    if (!p) {
      p = fetch(track.file)
        .then((r) => (r.ok ? r.arrayBuffer() : null))
        .then((data) => (data ? ctx.decodeAudioData(data) : null))
        .catch(() => null);
      this.buffers.set(track.id, p);
    }
    return p;
  }
}

export const music = new MusicPlayer();
