
/* ================= helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const NS = 'http://www.w3.org/2000/svg';
const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => performance.now();
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const num = (n) => WORDS[n] || String(n);
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const plural = (n, w, p) => `${num(n)} ${n === 1 ? w : (p || w + 's')}`;
function joinList(a) { if (a.length <= 1) return a.join(''); if (a.length === 2) return `${a[0]} and ${a[1]}`; return `${a.slice(0, -1).join(', ')}, and ${a[a.length - 1]}`; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function prng(seed) { let s = (seed * 2654435761) % 4294967296; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
function mixColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}
function setOp(id, v) { const n = document.getElementById(id); if (n) n.setAttribute('opacity', clamp(v, 0, 1).toFixed(3)); }

/* ================= elements ================= */
const desktop = $('#desktop'), appwin = $('#appwin'), stage = $('#stage'), svg = $('#world');
const bubble = $('#bubble'), bubbleText = $('#bubbleText'), logline = $('#logline'), srLive = $('#srLive');
const hoverLabel = $('#hoverLabel'), dropzone = $('#dropzone'), tip = $('#tip');
const statusBox = $('#status'), statusText = $('#statusText');
const talk = $('#talk'), talkInput = $('#talkInput'), talkSend = $('#talkSend');
const energyBtn = $('#energyBtn'), snackBar = $('#snackBar');
const dirBtn = $('#dirBtn'), startBtn = $('#startBtn'), tbApp = $('#tbApp'), trayBo = $('#trayBo');
const aboutFly = $('#aboutFly'), snackFly = $('#snackFly'), dirFly = $('#dirFly'), toast = $('#toast');
const capYou = $('#capYou'), capBo = $('#capBo'), capBoText = $('#capBoText');
const fxLayer = $('#fx'), nightShade = $('#nightShade');

/* ================= the apartment ================= */
const GROUND = 496, BS = 1;
const WX0 = -520, WX1 = 960, WW = WX1 - WX0;
const ROAM = [WX0 + 44, 904];
const CRACKS = [{ x: 96, y: 160 }, { x: 300, y: 92 }, { x: 462, y: 196 }, { x: 704, y: 204 }, { x: 884, y: 150 }];
const JOINT = { x: 776, y: 58 }, BULB = { x: 470, y: 98 };
const MIN5 = 5 * 60 * 1000, TEN_MIN = 10 * 60 * 1000;

function freshApt() {
  return {
    mail: 2, dust: [{ x: 620 }], plant: 0.55, leak: true, bucket: 0.35, puddle: 0,
    lightFault: false, bulbDead: false, cracks: [0, 0, 1, 0, 0], tilt: -6,
    radio: false, lamp: false, ceiling: false, blinds: true, desk: false,
    project: 0.3, figurines: 1, fixes: 0, notes: [], catName: null, catBowl: 1, catFedAt: 0, knocked: false,
  };
}
let apt = freshApt();
const override = { ceiling: 0, lamp: 0, blinds: 0, radio: 0 };
const canAuto = (k) => Date.now() > override[k];

/* ---------- generated scene pieces ---------- */
const books = [];
function buildBooks() {
  const g = $('#books'), r = prng(3);
  const colors = ['#9e4a3c', '#3f6b8a', '#c49a3a', '#4d7a4f', '#6b4a7a', '#d4c3a3', '#8a5a3a', '#2f5d6b'];
  [262, 324, 386, 448].forEach((by, row) => {
    let x = 185;
    for (;;) {
      const w = 7 + Math.floor(r() * 6), h = 34 + Math.floor(r() * 18);
      if (x + w > 272) break;
      const color = colors[Math.floor(r() * colors.length)];
      const lean = r() < 0.1 && x + w + 7 < 272;
      const bg = el('g', lean ? { transform: `rotate(9 ${x + w} ${by})` } : {}, g);
      el('rect', { x, y: by - h, width: w, height: h, rx: 1, fill: color }, bg);
      if (r() < 0.55) el('rect', { x: x + 1, y: by - h + 5, width: w - 2, height: 2, fill: 'rgba(255,255,255,.28)' }, bg);
      books.push({ g: bg, x: x + w / 2, y: by - h / 2, color, row, out: false });
      x += w + (lean ? 7 : 1);
    }
  });
}
function buildPegholes() {
  let d = '';
  for (let y = 242; y < 330; y += 10) for (let x = 814; x < 924; x += 10) d += `M${x} ${y}h1.6v1.6h-1.6z`;
  el('path', { class: 'c-peghole', d }, $('#pegholes'));
}
function buildBlinds() {
  const g = $('#blinds');
  for (let k = 0; k < 15; k++) el('rect', { class: 'c-slat', x: 514, y: (114 + k * 11.9).toFixed(1), width: 144, height: 10.6, rx: 1 }, g);
  const rail = el('rect', { class: 'c-winframe', x: 510, y: 110, width: 152, height: 6, rx: 1 });
  g.parentNode.insertBefore(rail, g.nextSibling);
}
const crackEls = [];
function buildCracks() {
  const g = $('#cracks');
  CRACKS.forEach((c, i) => {
    const grp = el('g', { transform: `translate(${c.x} ${c.y})` }, g);
    const r = prng(i + 41);
    let x = 0, y = -16, d = `M0 ${y}`;
    for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 10; y += 5 + r() * 2; d += `L${x.toFixed(1)} ${y.toFixed(1)}`; }
    d += `M${(x * 0.4).toFixed(1)} -2L${(x * 0.4 + (r() > 0.5 ? 9 : -9)).toFixed(1)} 4`;
    const crack = el('path', { class: 'c-crack', d }, grp);
    const plate = el('g', { transform: `rotate(${((r() - 0.5) * 12).toFixed(1)})` }, grp);
    const rect = el('rect', { class: 'c-patch', x: -13, y: -18, width: 26, height: 36, rx: 2 }, plate);
    [[-9, -14], [9, -14], [-9, 14], [9, 14]].forEach(([px, py]) => el('circle', { class: 'c-rivet', cx: px, cy: py, r: 1.3 }, plate));
    crackEls.push({ crack, plate, rect });
  });
}
const leafEls = [];
const LEAVES = [{ a: -60, l: 30 }, { a: -32, l: 40 }, { a: -9, l: 46 }, { a: 14, l: 42 }, { a: 38, l: 36 }, { a: 62, l: 28 }];
function buildLeaves() {
  const g = $('#leaves');
  LEAVES.forEach((lf) => {
    const L = lf.l;
    const p = el('path', { d: `M0 0C${-L * 0.2} ${-L * 0.35} ${-L * 0.13} ${-L * 0.8} 0 ${-L}C${L * 0.15} ${-L * 0.8} ${L * 0.2} ${-L * 0.35} 0 0Z` }, g);
    leafEls.push({ p, lf });
  });
}

/* ---------- rendering the state of things ---------- */
function renderCracks() {
  apt.cracks.forEach((s, i) => { crackEls[i].crack.style.display = s === 1 ? '' : 'none'; crackEls[i].plate.style.display = s === 2 ? '' : 'none'; });
  rebuildDynHits();
}
function freshPlate(i) { const r = crackEls[i].rect; r.classList.add('fresh'); setTimeout(() => r.classList.remove('fresh'), 1500); }
function renderPlant() {
  const h = clamp(apt.plant, 0, 1), droop = 1 - h, col = mixColor('#a39a55', '#5e8f4d', h);
  leafEls.forEach(({ p, lf }) => {
    const a = lf.a + (lf.a < 0 ? -1 : 1) * droop * 55;
    p.setAttribute('transform', `translate(718 342) rotate(${a.toFixed(1)}) scale(1 ${(0.72 + 0.28 * h).toFixed(2)})`);
    p.setAttribute('fill', col);
  });
}
function renderMail() {
  const g = $('#mailPile'); g.textContent = '';
  const r = prng(55);
  for (let k = 0; k < apt.mail; k++) {
    const x = 50 + r() * 58, y = 474 + (k % 3) * 3 + r() * 4, rot = (r() - 0.5) * 34;
    el('rect', { class: 'c-letter', x: x.toFixed(1), y: y.toFixed(1), width: 17, height: 11, rx: 1, transform: `rotate(${rot.toFixed(1)} ${(x + 8).toFixed(1)} ${(y + 5).toFixed(1)})` }, g);
  }
}
const dustY = (i) => 506 + (i % 2) * 9;
function renderDust() {
  const g = $('#dustLayer'); g.textContent = '';
  apt.dust.forEach((d, i) => {
    const grp = el('g', { transform: `translate(${d.x.toFixed(1)} ${dustY(i)})` }, g);
    el('ellipse', { class: 'c-dust', cx: 0, cy: 0, rx: 8, ry: 5 }, grp);
    el('ellipse', { class: 'c-dust2', cx: 3, cy: 1, rx: 4, ry: 3 }, grp);
    el('path', { d: 'M-8 0l-3-2M8-1l3-2M-4-4l-1-3M4-4l1-3', stroke: '#8d877b', 'stroke-width': 0.8, fill: 'none' }, grp);
  });
  rebuildDynHits();
}
function renderLeak() { $('#pipeJoint').classList.toggle('fixed', !apt.leak); }
function renderBucket() { const h = 23 * clamp(apt.bucket, 0, 1), w = $('#bucketWater'); w.setAttribute('y', (469 - h).toFixed(2)); w.setAttribute('height', h.toFixed(2)); }
function renderPuddle() { const p = $('#puddle'); p.setAttribute('rx', (apt.puddle * 66).toFixed(1)); p.setAttribute('ry', (apt.puddle * 7).toFixed(1)); }
function renderProject() {
  const g = $('#project'); g.textContent = '';
  if (apt.knocked) {
    const f = el('g', { transform: 'translate(884 494) rotate(-84)' }, g);
    el('rect', { class: 'c-figure', x: -7, y: -17, width: 14, height: 13, rx: 2 }, f);
    el('rect', { class: 'c-figure', x: -7, y: -27, width: 14, height: 10, rx: 2 }, f);
    el('rect', { fill: '#0e1215', x: -5, y: -25, width: 10, height: 6, rx: 1 }, f);
    return;
  }
  const p = apt.project, x = 866, y = 396;
  if (p > 0.02) el('rect', { class: 'c-figure', x: x - 12, y: y - 4, width: 24, height: 4, rx: 1 }, g);
  if (p > 0.25) el('rect', { class: 'c-figure', x: x - 7, y: y - 17, width: 14, height: 13, rx: 2 }, g);
  if (p > 0.5) { el('rect', { class: 'c-figure', x: x - 7, y: y - 27, width: 14, height: 10, rx: 2 }, g); el('rect', { fill: '#0e1215', x: x - 5, y: y - 25, width: 10, height: 6, rx: 1 }, g); }
  if (p > 0.75) {
    el('rect', { class: 'c-figure2', x: x - 7, y: y - 11, width: 14, height: 2.5 }, g);
    el('rect', { fill: '#ffc54f', x: x - 3.4, y: y - 24, width: 2, height: 3.4, rx: 0.6 }, g);
    el('rect', { fill: '#ffc54f', x: x + 1.4, y: y - 24, width: 2, height: 3.4, rx: 0.6 }, g);
    el('line', { x1: x + 3, y1: y - 27, x2: x + 3, y2: y - 32, stroke: '#2a3036', 'stroke-width': 1 }, g);
  }
}
function renderFigurines() {
  const g = $('#figurines'); g.textContent = '';
  const n = Math.min(4, apt.figurines);
  for (let k = 0; k < n; k++) {
    const x = 196 + k * 22, y = 200;
    el('rect', { class: 'c-figure', x: x - 8, y: y - 3, width: 16, height: 3, rx: 1 }, g);
    el('rect', { class: 'c-figure', x: x - 5, y: y - 12, width: 10, height: 9, rx: 1.5 }, g);
    el('rect', { class: 'c-figure2', x: x - 5, y: y - 7, width: 10, height: 2 }, g);
    el('rect', { class: 'c-figure', x: x - 5, y: y - 19, width: 10, height: 7, rx: 1.5 }, g);
    el('rect', { fill: '#0e1215', x: x - 3.5, y: y - 17.5, width: 7, height: 4, rx: 0.8 }, g);
    el('rect', { fill: '#ffc54f', x: x - 2.3, y: y - 16.8, width: 1.4, height: 2.4 }, g);
    el('rect', { fill: '#ffc54f', x: x + 0.9, y: y - 16.8, width: 1.4, height: 2.4 }, g);
  }
}
function renderToggles() {
  const b = $('#bulb');
  b.classList.toggle('dead', apt.bulbDead); b.classList.toggle('lit', apt.ceiling && !apt.bulbDead);
  $('#switchToggle').setAttribute('y', apt.ceiling ? '304' : '311');
  $('#lampShade').classList.toggle('lit', apt.lamp);
  $('#radioDial').classList.toggle('on', apt.radio);
  $('#blinds').classList.toggle('open', apt.blinds);
}
function renderAll() {
  renderCracks(); renderPlant(); renderMail(); renderDust(); renderLeak(); renderBucket(); renderPuddle();
  renderProject(); renderFigurines(); renderLighting(); renderSky(); renderClockHands();
}

/* ---------- light ---------- */
const BASE_SHADE = { morning: 0.1, day: 0, evening: 0.36, night: 0.62 };
const light = { ceilingGlow: 0, flickerOff: false, flickerT: 0 };
const isDark = () => { const t = currentTod(); return t === 'evening' || t === 'night'; };
function renderLighting() {
  const tod = currentTod(), lit = apt.ceiling && !apt.bulbDead;
  try { sfx.scene(({ morning: 0.6, day: 1, evening: 0.7, night: 0.25 }[tod]) * (apt.blinds ? 1 : 0.4)); } catch (e) { /* sound not ready yet */ }
  let shade = BASE_SHADE[tod];
  if (lit) shade -= { morning: 0.06, day: 0, evening: 0.22, night: 0.36 }[tod];
  if (apt.lamp) shade -= { morning: 0.02, day: 0, evening: 0.07, night: 0.1 }[tod];
  if (!apt.blinds && (tod === 'day' || tod === 'morning')) shade += 0.14;
  shade = clamp(shade, 0, 0.72);
  nightShade.setAttribute('opacity', shade.toFixed(3));
  const k = { morning: 0.25, day: 0.1, evening: 0.8, night: 1 }[tod];
  light.ceilingGlow = lit ? k : 0;
  applyCeilingGlow();
  setOp('gLampHalo', apt.lamp ? 0.35 + 0.65 * k : 0);
  setOp('gLampPool', apt.lamp ? 0.2 + 0.8 * k : 0);
  setOp('gDesk', apt.desk ? 0.3 + 0.7 * k : 0);
  setOp('gRadio', apt.radio ? 0.5 + 0.5 * k : 0);
  setOp('gWin', apt.blinds ? { morning: 0.55, day: 0.7, evening: 0.22, night: 0 }[tod] : 0);
  setOp('gDock', bo.mode === 'nap' ? 0.9 : 0);
  setOp('gCone2', lit ? k * 0.85 : 0); setOp('gHalo2', lit ? 0.35 + 0.65 * k : 0);
  $('#bulb2').classList.toggle('lit', lit); $('#bulb2').classList.toggle('dead', false);
  if (typeof kit !== 'undefined') { setOp('gHood', kit.hood ? (tod === 'night' || tod === 'evening' ? 0.9 : 0.35) : 0); }
  $('#dockStrip').classList.toggle('on', bo.mode === 'nap');
  svg.setAttribute('data-light', shade > 0.42 ? 'dark' : shade > 0.18 ? 'dim' : 'lit');
  renderToggles();
}
function applyCeilingGlow() {
  const on = light.ceilingGlow > 0 && !light.flickerOff;
  setOp('gCone', on ? light.ceilingGlow * 0.9 : 0);
  setOp('gHalo', on ? 0.35 + 0.65 * light.ceilingGlow : 0);
  $('#bulb').classList.toggle('lit', apt.ceiling && !apt.bulbDead && !light.flickerOff);
}

/* ---------- saving (this viewer's browser only) ---------- */
const KEY = 'bonini-demo-v2';
function loadSaved() { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
function saveNow() {
  try { localStorage.setItem(KEY, JSON.stringify({ v: 2, apt, energy: +bo.energy.toFixed(3), lastSeen: Date.now() })); }
  catch (e) { /* storage unavailable: the demo still runs, it just won't remember between visits */ }
}
function clearSaved() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing stored */ } }
let saveTimer = 0;
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 1200); }
function restoreApt(s) {
  const d = freshApt(), a = Object.assign(d, s && typeof s === 'object' ? s : {});
  a.mail = clamp(a.mail | 0, 0, 7);
  a.dust = Array.isArray(a.dust) ? a.dust.filter((x) => x && Number.isFinite(+x.x)).slice(0, 4).map((x) => ({ x: clamp(+x.x, 160, 890) })) : [];
  a.cracks = Array.isArray(a.cracks) && a.cracks.length === CRACKS.length ? a.cracks.map((v) => clamp(v | 0, 0, 2)) : d.cracks;
  ['plant', 'bucket', 'puddle', 'project'].forEach((k) => { a[k] = clamp(Number.isFinite(+a[k]) ? +a[k] : freshApt()[k], 0, 1); });
  a.tilt = clamp(Number.isFinite(+a.tilt) ? +a.tilt : 0, -12, 12);
  a.figurines = clamp(a.figurines | 0, 0, 99); a.fixes = Math.max(0, a.fixes | 0); a.lessons = Math.max(0, a.lessons | 0);
  ['leak', 'lightFault', 'bulbDead', 'radio', 'lamp', 'ceiling', 'blinds'].forEach((k) => { a[k] = !!a[k]; });
  a.desk = false;
  a.catName = typeof a.catName === 'string' && /^[A-Za-z][A-Za-z'-]{0,15}$/.test(a.catName) ? a.catName : null;
  a.catBowl = a.catBowl ? 1 : 0; a.catFedAt = Number.isFinite(+a.catFedAt) ? +a.catFedAt : 0; a.knocked = !!a.knocked;
  a.notes = Array.isArray(a.notes) ? a.notes.filter((n) => n && typeof n.t === 'string' && n.t.length <= 90).slice(-24).map((n, i) => ({
    id: String(n.id || i).slice(0, 24), t: n.t, at: Number.isFinite(+n.at) ? +n.at : Date.now(), pinned: !!n.pinned, asked: Number.isFinite(+n.asked) ? +n.asked : 0, c: clamp(n.c | 0, 0, 5),
  })) : [];
  return a;
}
