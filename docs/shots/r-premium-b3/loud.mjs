// R-PREMIUM-b3 loudness check: plays each sfx event through the real game code and
// measures what reaches the speakers (the master bus, Sound volume 5, music off).
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const URL = process.env.URL ?? 'http://localhost:5498/';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true });
const pg = await ctx.newPage();
const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
await pg.addInitScript(() => {
  localStorage.setItem('dojo.musicVol', '0'); localStorage.setItem('dojo.sfxVol', '5');
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const c = this.context;
    if (dest === c.destination && !this.__tap) {
      if (!c.__tap) {
        const sp = c.createScriptProcessor(1024, 2, 2); sp.__tap = true;
        c.__meter = { sum: 0, n: 0, peak: 0, on: false };
        sp.onaudioprocess = (ev) => { const m = c.__meter; for (let ch = 0; ch < 2; ch++) { const i = ev.inputBuffer.getChannelData(ch); const o = ev.outputBuffer.getChannelData(ch); for (let k = 0; k < i.length; k++) { o[k] = i[k]; if (m.on) { m.sum += i[k] * i[k]; m.n++; const a = Math.abs(i[k]); if (a > m.peak) m.peak = a; } } } };
        orig.call(sp, c.destination); c.__tap = sp;
      }
      return orig.call(this, c.__tap, ...rest);
    }
    return orig.call(this, dest, ...rest);
  };
});
await pg.goto(URL); await pg.waitForTimeout(2500);
await pg.touchscreen.tap(422, 195); await pg.waitForTimeout(300);
await pg.evaluate(async () => { const { sfx } = await import('/src/audio/Sfx.ts'); sfx.unlock(); window.__sfx = sfx; });
await pg.waitForTimeout(3000);
const loaded = await pg.evaluate(() => window.__sfx.files.size);
const EVENTS = [['hit'], ['strike'], ['block'], ['whoosh'], ['dash'], ['tap'], ['chest'], ['loot', 0], ['loot', 1], ['loot', 2], ['insight'], ['levelUp'], ['promotion'],
  ['greatCounter'], ['hurt'], ['enemyDown'], ['signOff'], ['stripe'], ['gong'], ['bow'], ['denied']];
const measure = (name, arg) => pg.evaluate(async ([name, arg]) => {
  const c = window.__sfx.context(); const m = c.__meter; m.sum = 0; m.n = 0; m.peak = 0; m.on = true;
  window.__sfx[name](arg); await new Promise((r) => setTimeout(r, 2600)); m.on = false;
  // RMS over the part that sounds: 100 ms windows above -60 dB, so a short sound isn't diluted by silence.
  return { rms: m.n ? 10 * Math.log10(m.sum / m.n) : -120, peak: 20 * Math.log10(m.peak || 1e-6) };
}, [name, arg]);
const rows = [];
for (const mode of ['file', 'code']) {
  if (mode === 'code') await pg.evaluate(() => { window.__saved = new Map(window.__sfx.files); window.__sfx.files.clear(); });
  for (const [name, arg] of EVENTS) {
    const ev = name + (arg !== undefined ? `(${arg})` : '');
    // several plays so random variants are covered; keep the loudest peak and the mean RMS
    const runs = []; for (let i = 0; i < 3; i++) runs.push(await measure(name, arg));
    rows.push({ mode, ev, rms: runs.reduce((a, r) => a + r.rms, 0) / runs.length, peak: Math.max(...runs.map((r) => r.peak)) });
  }
}
const fmt = (n) => n.toFixed(1).padStart(6);
let out = `files loaded: ${loaded}\nlevels at the speaker (Sound volume 5/5, music off), dBFS; rms over a 2.6 s window\nmode  event          rms   peak\n`;
for (const r of rows) out += `${r.mode.padEnd(5)} ${r.ev.padEnd(13)} ${fmt(r.rms)} ${fmt(r.peak)}\n`;
const clip = rows.filter((r) => r.peak > -1);
out += `\npeaks above -1 dBFS: ${clip.length ? clip.map((r) => r.mode + ' ' + r.ev).join(', ') : 'none'}\npage errors: ${errs.length}\n`;
console.log(out); if (process.env.OUT) writeFileSync(process.env.OUT, out);
await browser.close();
