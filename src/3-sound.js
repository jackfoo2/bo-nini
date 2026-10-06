
/* ================= sound: tiny synthesized effects, off until you turn them on ================= */
const sfx = (() => {
  const KEY = 'bonini-sound';
  let ctx = null, master = null, on = false, nbuf = null;
  const loops = {}, last = {};
  try { on = localStorage.getItem(KEY) === '1'; } catch (e) { on = false; }
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function noiseBuf() {
    if (nbuf) return nbuf;
    nbuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return nbuf;
  }
  function env(g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function tone(type, f0, f1, dur, vol, at) {
    const t = ctx.currentTime + (at || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.006, dur, vol); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, type, freq, q, at) {
    const t = ctx.currentTime + (at || 0), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
    env(g, t, 0.004, dur, vol); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    return f;
  }
  const S = {
    blip() { tone('square', 430 + Math.random() * 140, null, 0.04, 0.03); },
    drip() { tone('sine', 1500, 480, 0.1, 0.16); },
    chop() { noise(0.045, 0.3, 'highpass', 2400, 0.7); tone('triangle', 200, 90, 0.05, 0.12); },
    pin() { tone('triangle', 1000, 760, 0.05, 0.16); noise(0.025, 0.1, 'bandpass', 3200, 2); },
    meow() {
      const t = ctx.currentTime, o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(560, t); o.frequency.linearRampToValueAtTime(900, t + 0.1); o.frequency.linearRampToValueAtTime(620, t + 0.3);
      f.type = 'bandpass'; f.frequency.setValueAtTime(1100, t); f.frequency.linearRampToValueAtTime(1600, t + 0.12); f.Q.value = 1.2;
      env(g, t, 0.03, 0.3, 0.12); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + 0.4);
    },
    purr() {
      const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      s.buffer = noiseBuf(); s.loop = true; f.type = 'lowpass'; f.frequency.value = 260;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.25); g.gain.linearRampToValueAtTime(0.22, t + 1.3); g.gain.linearRampToValueAtTime(0.0001, t + 1.7);
      lfo.frequency.value = 24; lg.gain.value = 0.18; lfo.connect(lg); lg.connect(g.gain);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); lfo.start(t); s.stop(t + 1.8); lfo.stop(t + 1.8);
    },
    kibble() { for (let i = 0; i < 10; i++) noise(0.018, 0.22, 'bandpass', 2400 + Math.random() * 1600, 3, i * 0.06 + Math.random() * 0.02); },
    crunch() { for (let i = 0; i < 5; i++) noise(0.05, 0.26, 'bandpass', 1500 + Math.random() * 900, 1, 0.1 + i * 0.12); },
    whoosh() { const f = noise(0.7, 0.22, 'bandpass', 300, 1.2), t = ctx.currentTime; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.55); },
    chime() { tone('sine', 660, null, 0.3, 0.13); tone('sine', 990, null, 0.4, 0.1, 0.13); },
    ignite() { for (let i = 0; i < 3; i++) noise(0.02, 0.2, 'highpass', 4200, 1, i * 0.08); noise(0.45, 0.14, 'lowpass', 800, 0.7, 0.25); },
    plop() { tone('sine', 320, 110, 0.13, 0.18); },
    pour() { noise(0.7, 0.1, 'bandpass', 1300, 0.8); },
    send() { tone('sine', 700, 1300, 0.12, 0.08); },
    flip() { const f = noise(0.3, 0.12, 'bandpass', 800, 1.5); f.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.25); },
  };
  const LOOPS = {
    weld: { type: 'bandpass', freq: 2600, q: 1.4, vol: 0.12, crackle: true },
    water: { type: 'bandpass', freq: 950, q: 0.6, vol: 0.1 },
    simmer: { type: 'lowpass', freq: 520, q: 0.7, vol: 0.06 },
  };
  function loop(name) {
    if (!on || loops[name] || !ensure() || ctx.state !== 'running') return;
    const L = LOOPS[name], t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf(); s.loop = true; f.type = L.type; f.frequency.value = L.freq; f.Q.value = L.q;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(L.vol, t + 0.15);
    let lfo = null;
    if (L.crackle) { lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 13; const lg = ctx.createGain(); lg.gain.value = L.vol * 0.6; lfo.connect(lg); lg.connect(g.gain); lfo.start(t); }
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
    loops[name] = { s, g, lfo };
  }
  function stop(name) {
    const l = loops[name]; if (!l) return; delete loops[name];
    try { const t = ctx.currentTime; l.g.gain.cancelScheduledValues(t); l.g.gain.setValueAtTime(Math.max(0.0001, l.g.gain.value), t); l.g.gain.linearRampToValueAtTime(0.0001, t + 0.15); l.s.stop(t + 0.2); if (l.lfo) l.lfo.stop(t + 0.2); } catch (e) { /* already stopped */ }
  }
  function play(name, gap) {
    if (!on || !S[name]) return;
    if (gap) { const n = performance.now(); if (n - (last[name] || 0) < gap) return; last[name] = n; }
    if (!ensure() || ctx.state !== 'running') return;
    try { S[name](); } catch (e) { /* sound is optional */ }
  }
  function sync() {
    document.querySelectorAll('[data-sound-toggle]').forEach((b) => {
      b.setAttribute('aria-pressed', String(on)); b.classList.toggle('on', on);
      if (b.dataset.label) b.textContent = on ? 'Sound off' : 'Sound on';
    });
  }
  function set(v, quiet) {
    on = !!v;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* storage off */ }
    if (on) { ensure(); if (!quiet) setTimeout(() => play('chime'), 80); } else Object.keys(loops).forEach(stop);
    sync();
  }
  // a saved "on" still needs one click or key press before the browser lets sound play
  const unlock = () => { if (on) ensure(); window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); };
  window.addEventListener('pointerdown', unlock, true); window.addEventListener('keydown', unlock, true);
  return { play, loop, stop, set, sync, get on() { return on; } };
})();
