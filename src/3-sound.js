
/* ================= sound: tiny synthesized effects, off until you turn them on ================= */
const sfx = (() => {
  const KEY = 'bonini-sound', VKEY = 'bonini-volume', BKEY = 'bonini-blips', MKEY = 'bonini-voice', AKEY = 'bonini-ambience', WKEY = 'bonini-words';
  let ctx = null, master = null, on = false, nbuf = null, bbuf = null, vol = 0.65, blips = true, voiceMode = 'spoken', ambOn = true, words = true, amb = null, city = 0.5;
  const loops = {}, last = {}, played = {};
  try {
    on = localStorage.getItem(KEY) === '1';
    const v = parseFloat(localStorage.getItem(VKEY)); if (Number.isFinite(v)) vol = Math.min(1, Math.max(0, v));
    blips = localStorage.getItem(BKEY) !== '0';
    const vm = localStorage.getItem(MKEY); if (vm === 'spoken' || vm === 'beeps' || vm === 'off') voiceMode = vm;
    ambOn = localStorage.getItem(AKEY) !== '0'; words = localStorage.getItem(WKEY) !== '0';
  } catch (e) { /* storage off */ }
  const gainFor = (v) => 0.75 * v * v;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      master = ctx.createGain(); master.gain.value = gainFor(vol); master.connect(ctx.destination);
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
  function brownBuf() {
    if (bbuf) return bbuf;
    bbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = bbuf.getChannelData(0); let lastV = 0;
    for (let i = 0; i < d.length; i++) { lastV = (lastV + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = lastV * 3.5; }
    return bbuf;
  }
  // background: a quiet room tone, plus faint city through the window that swells now and then
  function ambStart() {
    if (!on || !ambOn || amb || vol <= 0 || !ensure() || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const room = ctx.createBufferSource(), rf = ctx.createBiquadFilter(), rg = ctx.createGain();
    room.buffer = brownBuf(); room.loop = true; rf.type = 'lowpass'; rf.frequency.value = 420;
    rg.gain.setValueAtTime(0.0001, t); rg.gain.linearRampToValueAtTime(0.05, t + 2);
    room.connect(rf); rf.connect(rg); rg.connect(master); room.start(t);
    const street = ctx.createBufferSource(), cf = ctx.createBiquadFilter(), cg = ctx.createGain(), swell = ctx.createOscillator(), sg = ctx.createGain();
    street.buffer = noiseBuf(); street.loop = true; cf.type = 'bandpass'; cf.frequency.value = 650; cf.Q.value = 0.5;
    cg.gain.setValueAtTime(0.0001, t); swell.frequency.value = 0.07; sg.gain.value = 0.005; swell.connect(sg); sg.connect(cg.gain);
    street.connect(cf); cf.connect(cg); cg.connect(master); street.start(t); swell.start(t);
    amb = { room, rg, street, cg, swell };
    ambLevel();
  }
  function ambStop() {
    if (!amb) return; const a = amb; amb = null;
    try { const t = ctx.currentTime; [a.rg, a.cg].forEach((g) => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t); g.gain.linearRampToValueAtTime(0.0001, t + 0.6); }); a.room.stop(t + 0.7); a.street.stop(t + 0.7); a.swell.stop(t + 0.7); } catch (e) { /* already stopped */ }
  }
  function ambLevel() { if (amb) amb.cg.gain.setTargetAtTime(0.004 + 0.016 * city, ctx.currentTime, 1.5); }
  function scene(level) { city = Math.min(1, Math.max(0, level)); ambLevel(); }
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
    if (!on || !S[name] || vol <= 0) return;
    if (name === 'blip' && voiceMode !== 'beeps') return;
    if (gap) { const n = performance.now(); if (n - (last[name] || 0) < gap) return; last[name] = n; }
    if (!ensure() || ctx.state !== 'running') return;
    try { S[name](); played[name] = (played[name] || 0) + 1; } catch (e) { /* sound is optional */ }
  }
  function sync() {
    const audible = on && vol > 0;
    document.querySelectorAll('[data-sound-toggle], #soundBtn').forEach((b) => {
      b.setAttribute('aria-pressed', String(audible)); b.classList.toggle('on', audible);
      if (b.dataset.label) b.textContent = on ? 'Sound off' : 'Sound on';
    });
    const sb = document.getElementById('soundBtn'); if (sb) sb.setAttribute('aria-label', audible ? 'Sound on. Open sound settings' : 'Sound off. Open sound settings');
    const m = document.getElementById('sndMute'); if (m) { m.textContent = on ? 'Mute' : 'Turn sound on'; m.classList.toggle('muted', !on); }
    const r = document.getElementById('sndVol'); if (r && document.activeElement !== r) r.value = String(Math.round(vol * 100));
    const o = document.getElementById('sndVolOut'); if (o) o.textContent = Math.round(vol * 100) + '%';
    document.querySelectorAll('#sndVoice button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.voice === voiceMode)));
    const w = document.getElementById('sndWords'); if (w) { w.checked = words; w.disabled = !(audible && voiceMode === 'spoken'); }
    const a = document.getElementById('sndAmb'); if (a) a.checked = ambOn;
    const n = document.getElementById('sndWordsNote'); if (n) n.hidden = audible && voiceMode === 'spoken';
    if (typeof onSoundChange === 'function') onSoundChange();
  }
  function setVolume(v) {
    vol = Math.min(1, Math.max(0, v));
    try { localStorage.setItem(VKEY, String(vol)); } catch (e) { /* storage off */ }
    if (master) master.gain.setTargetAtTime(gainFor(vol), ctx.currentTime, 0.03);
    if (vol > 0 && !on) set(true, true);
    if (vol <= 0) ambStop(); else ambStart();
    play('pin', 120);
    sync();
  }
  function setBlips(v) { blips = !!v; try { localStorage.setItem(BKEY, blips ? '1' : '0'); } catch (e) { /* storage off */ } if (blips) play('blip'); sync(); }
  function setVoiceMode(m) { voiceMode = m; try { localStorage.setItem(MKEY, m); } catch (e) { /* storage off */ } if (m === 'beeps') play('blip'); sync(); }
  function setWords(v) { words = !!v; try { localStorage.setItem(WKEY, words ? '1' : '0'); } catch (e) { /* storage off */ } sync(); }
  function setAmbience(v) { ambOn = !!v; try { localStorage.setItem(AKEY, ambOn ? '1' : '0'); } catch (e) { /* storage off */ } if (ambOn) ambStart(); else ambStop(); sync(); }
  function set(v, quiet) {
    on = !!v;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* storage off */ }
    if (on) { ensure(); if (!quiet) setTimeout(() => play('chime'), 80); setTimeout(ambStart, 200); } else { Object.keys(loops).forEach(stop); ambStop(); }
    sync();
  }
  // a saved "on" still needs one click or key press before the browser lets sound play
  const unlock = () => { if (on) { ensure(); setTimeout(ambStart, 200); } window.removeEventListener('pointerdown', unlock, true); window.removeEventListener('keydown', unlock, true); };
  window.addEventListener('pointerdown', unlock, true); window.addEventListener('keydown', unlock, true);
  // a background tab goes quiet
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend().catch(() => {}); else if (on) ctx.resume().catch(() => {}); });
  return { play, loop, stop, set, sync, setVolume, setBlips, setVoiceMode, setWords, setAmbience, scene,
    get on() { return on; }, get volume() { return vol; }, get blips() { return blips; }, get voiceMode() { return voiceMode; }, get words() { return words; }, get ambience() { return !!amb; },
    get audible() { return on && vol > 0; }, get gain() { return master ? master.gain.value : null; }, played };
})();
