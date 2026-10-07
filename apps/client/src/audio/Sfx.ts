/**
 * Simple sounds made in code with the phone's built-in Web Audio, so there are no
 * sound files to download. Phones only allow sound after the first touch, so
 * `unlock()` is called from a touch handler.
 */
class SoundMaker {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      // Half a second of white noise, reused for hits and whooshes.
      const len = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) void this.ctx?.suspend();
        else void this.ctx?.resume();
      });
    }
    if (this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume();
  }

  /** A short punchy hit. */
  hit(): void {
    this.noise(0.07, 0.5, 1800);
    this.tone(170, 70, 0.09, 'square', 0.25);
  }

  /** The heavy Strike. */
  strike(): void {
    this.noise(0.14, 0.7, 1200);
    this.tone(150, 50, 0.18, 'sawtooth', 0.35);
  }

  /** Perfect Counter: a sharp snap and a bright chime. */
  perfect(): void {
    this.noise(0.06, 0.6, 4000);
    this.tone(880, 880, 0.35, 'sine', 0.3, 0.02);
    this.tone(1320, 1320, 0.45, 'sine', 0.22, 0.07);
    this.tone(1760, 1760, 0.5, 'triangle', 0.12, 0.12);
  }

  /** Block: a metal clank. */
  block(): void {
    this.tone(620, 560, 0.12, 'square', 0.18);
    this.tone(930, 900, 0.16, 'triangle', 0.15);
    this.noise(0.04, 0.3, 3000);
  }

  // ---- celebrations, from smallest to biggest (real achievements are always biggest)

  /** Dojo Blessing or Sensei's Seal: a warm two-note chime. */
  blessing(): void {
    this.tone(660, 660, 0.4, 'sine', 0.2);
    this.tone(990, 990, 0.6, 'sine', 0.16, 0.12);
  }

  /** A real sign-off: a rising three-note chime. */
  signOff(): void {
    [523, 659, 784].forEach((f, i) => this.tone(f, f, 0.45, 'triangle', 0.22, i * 0.11));
    this.tone(1046, 1046, 0.8, 'sine', 0.18, 0.33);
  }

  /** A character stripe: a fuller, brighter fanfare. */
  stripe(): void {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 0.5, 'triangle', 0.24, i * 0.12));
    [784, 1046, 1318].forEach((f) => this.tone(f, f, 1.2, 'sine', 0.14, 0.5));
  }

  /** A real promotion: the biggest sound in the game. */
  promotion(): void {
    this.noise(0.3, 0.3, 600);
    [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 0.5, 'sawtooth', 0.12, i * 0.14));
    [523, 659, 784, 1046, 1318].forEach((f) => this.tone(f, f, 2.2, 'triangle', 0.16, 0.75));
    this.tone(65, 65, 1.6, 'sine', 0.35, 0.75);
  }

  /** Belt tied / Gate opening: a deep gong. */
  gong(): void {
    this.tone(110, 98, 2.4, 'sine', 0.45);
    this.tone(220, 196, 1.8, 'triangle', 0.15);
    this.noise(0.15, 0.25, 500);
  }

  /** A game level up: small, so real achievements stay bigger. */
  levelUp(): void {
    this.tone(523, 784, 0.25, 'triangle', 0.18);
  }

  /** The player gets hit. */
  hurt(): void {
    this.noise(0.1, 0.5, 900);
    this.tone(260, 90, 0.25, 'sawtooth', 0.3);
  }

  /** The enemy winds up: a rising warning tone that lasts the whole telegraph. */
  windup(seconds: number): void {
    this.tone(180, 520, seconds, 'triangle', 0.22);
    this.tone(90, 260, seconds, 'square', 0.06);
  }

  /** The enemy swings and misses. */
  whoosh(): void {
    this.noise(0.18, 0.35, 700);
  }

  /** Counter pressed: a quick guard swish. */
  guard(): void {
    this.noise(0.05, 0.2, 2500);
  }

  /** Every enemy in the room is beaten. */
  roomClear(): void {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.16, 'triangle', 0.16, i * 0.07));
  }

  /** The room grade appears: brighter for better grades. */
  grade(grade: 'S' | 'A' | 'B'): void {
    const top = grade === 'S' ? 1319 : grade === 'A' ? 1047 : 784;
    this.tone(top / 2, top, 0.25, 'triangle', 0.18);
  }

  /** A chest opens. */
  chest(): void {
    this.noise(0.15, 0.3, 600);
    [392, 523, 659].forEach((f, i) => this.tone(f, f, 0.14, 'square', 0.08, 0.05 + i * 0.06));
  }

  /** An item drops: rarer items get a longer, higher chime. */
  loot(rank: number): void {
    const notes = [659, 784, 988, 1175, 1319].slice(0, 2 + rank);
    notes.forEach((f, i) => this.tone(f, f, 0.12 + rank * 0.03, 'sine', 0.12 + rank * 0.03, 0.1 + i * 0.06));
  }

  /** The rest shrine heals. */
  shrine(): void {
    [440, 554, 659, 880].forEach((f, i) => this.tone(f, f, 0.4, 'sine', 0.1, i * 0.1));
  }

  /** The doors open, or the player walks through one. */
  doors(): void {
    this.tone(110, 70, 0.35, 'sawtooth', 0.08);
    this.noise(0.25, 0.15, 400);
  }

  /** An Insight is chosen. */
  insight(): void {
    [784, 1047, 1319].forEach((f, i) => this.tone(f, f * 1.01, 0.2, 'sine', 0.12, i * 0.05));
  }

  /** The floor is cleared (kept smaller than real promotions will be). */
  floorClear(): void {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, f, 0.2, 'triangle', 0.16, i * 0.11));
  }

  /** A new wave of enemies arrives: a low drum and a rising horn. */
  wave(): void {
    this.noise(0.2, 0.35, 300);
    this.tone(220, 330, 0.35, 'sawtooth', 0.08, 0.05);
  }

  /** A brute runs out of breath: two heavy puffs. */
  winded(): void {
    this.noise(0.18, 0.25, 500);
    this.tone(200, 140, 0.18, 'sine', 0.08);
    this.tone(190, 130, 0.2, 'sine', 0.08, 0.35);
  }

  /** A basic attack bounces off a shield: a metal clank. */
  clank(): void {
    this.tone(1400, 1300, 0.08, 'square', 0.12);
    this.tone(2100, 1900, 0.06, 'triangle', 0.1);
  }

  /** A shield breaks. */
  shieldBreak(): void {
    this.noise(0.3, 0.5, 3000);
    this.tone(900, 300, 0.25, 'square', 0.15);
  }

  /** Dash: a fast airy swoosh. */
  dash(): void {
    this.noise(0.12, 0.3, 1800);
    this.tone(300, 700, 0.1, 'sine', 0.08);
  }

  /** Not enough Focus, or nothing in reach. */
  denied(): void {
    this.tone(140, 120, 0.12, 'square', 0.15);
  }

  /** The enemy is beaten. */
  enemyDown(): void {
    this.noise(0.25, 0.5, 800);
    [523, 659, 784].forEach((f, i) => this.tone(f, f, 0.18, 'triangle', 0.2, i * 0.08));
  }

  /** The player is defeated. */
  playerDown(): void {
    [392, 330, 262].forEach((f, i) => this.tone(f, f * 0.95, 0.25, 'triangle', 0.2, i * 0.15));
  }

  /** The enemy appears. */
  appear(): void {
    this.tone(200, 400, 0.25, 'sine', 0.12);
  }

  // ---- the Home Dojo

  /** The bow: a soft wooden clack and a low, calm bell. */
  bow(): void {
    this.tone(900, 700, 0.06, 'square', 0.1);
    this.tone(330, 328, 1.1, 'sine', 0.16, 0.25);
    this.tone(495, 492, 0.9, 'sine', 0.07, 0.27);
  }

  /** A sweep of the broom; `n` rises in pitch as a sweeping streak continues. */
  sweep(n: number): void {
    this.noise(0.12, 0.25, 2500);
    const f = 600 * Math.pow(1.06, Math.min(n, 12));
    this.tone(f, f * 1.02, 0.12, 'sine', 0.08, 0.03);
  }

  /** One wipe of a mat (a soft rub); the last wipe sparkles. */
  wipe(last: boolean): void {
    this.noise(0.1, 0.18, 1400);
    if (last) [1047, 1319, 1568].forEach((f, i) => this.tone(f, f, 0.25, 'sine', 0.1, 0.05 + i * 0.06));
  }

  /** A weapon set straight on the rack: a wooden knock. */
  straighten(last: boolean): void {
    this.tone(420, 380, 0.08, 'triangle', 0.2);
    this.tone(260, 240, 0.12, 'sine', 0.15, 0.02);
    if (last) [784, 988].forEach((f, i) => this.tone(f, f, 0.25, 'sine', 0.1, 0.1 + i * 0.07));
  }

  /** The dojo is clean: Calm Mind (kept smaller than the Blessing and real achievements). */
  calmMind(): void {
    [523, 659, 784].forEach((f, i) => this.tone(f, f, 0.5, 'sine', 0.1, i * 0.15));
  }

  /** Picking up or putting down a decoration. */
  place(down: boolean): void {
    this.tone(down ? 260 : 380, down ? 200 : 460, 0.08, 'triangle', 0.15);
  }

  private tone(from: number, to: number, seconds: number, type: OscillatorType, volume: number, delay = 0): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + seconds);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + seconds + 0.02);
  }

  private noise(seconds: number, volume: number, filterHz: number): void {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterHz;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(t);
    src.stop(t + seconds + 0.02);
  }
}

export const sfx = new SoundMaker();
