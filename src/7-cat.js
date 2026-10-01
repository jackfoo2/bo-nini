
/* ================= the cat: it lives here, it does what it wants, Bo looks after it ================= */
const CAT_FLOOR = 492, CAT_MIN = -462, CAT_MAX = 900, BOWL_X = -46;
const CAT_SPOTS = {
  chair: { x: 343, y: 430 },
  blanket: { x: 634, y: 431 },
  sill: { x: 590, y: 300, via: 'blanket' },
  bench: { x: 832, y: 396 },
  island: { x: -106, y: 394 },
};
const CC = { fur: '#e4903c', dark: '#c46f24', cream: '#f6d9b0', nose: '#d9706a', eye: '#2a2622', ear: '#f2b8a0' };
const cat = { x: 343, y: 430, dir: 1, pose: 'sleep', perch: 'chair', speed: 46, target: null, jump: null, phase: 0, blink: 2, swat: 0, purr: 0, eat: 0, hold: false, flee: false, called: false, counterDone: false, tok: null, hit: null };
let catG, catFlip, catParts;
function catHead(parent, sleeping) {
  const h = el('g', {}, parent);
  el('path', { d: 'M-6 -4L-4.5 -13L0.5 -6Z', fill: CC.fur }, h);
  el('path', { d: 'M1 -6L6 -13.5L7 -3.5Z', fill: CC.fur }, h);
  el('path', { d: 'M2.6 -6.2L5.6 -11.2L6.2 -5.4Z', fill: CC.ear }, h);
  el('circle', { cx: 0, cy: 0, r: 7.6, fill: CC.fur }, h);
  el('path', { d: 'M-5 -5q2 1.5 0 3M-2 -6.5q2 1.5 0 3', stroke: CC.dark, 'stroke-width': 1.3, fill: 'none' }, h);
  el('ellipse', { cx: 4, cy: 2.4, rx: 4.2, ry: 3, fill: CC.cream }, h);
  el('path', { d: 'M7.6 0.6l-2.2 1.5l-0.2-2.2z', fill: CC.nose }, h);
  const eye = sleeping
    ? el('path', { d: 'M1.2 -1.6q1.6 1.4 3.2 0', stroke: CC.eye, 'stroke-width': 1.1, fill: 'none', 'stroke-linecap': 'round' }, h)
    : el('ellipse', { cx: 2.8, cy: -1.6, rx: 1.3, ry: 1.7, fill: CC.eye }, h);
  el('path', { d: 'M6.8 2.6h7M6.8 3.8l6.5 1.8', stroke: '#fff7ea', 'stroke-width': 0.6, opacity: 0.85, fill: 'none' }, h);
  return { g: h, eye };
}
function catLeg(parent, x, color, paw) {
  const g = el('g', { transform: `translate(${x} -12)` }, parent);
  el('rect', { x: -1.9, y: 0, width: 3.8, height: 12, rx: 1.7, fill: color }, g);
  if (paw) el('ellipse', { cx: 0.3, cy: 11.6, rx: 2.5, ry: 1.5, fill: CC.cream }, g);
  return g;
}
function buildCat() {
  catG = el('g', { id: 'cat', 'pointer-events': 'none' }, $('#catLayer'));
  el('ellipse', { cx: 0, cy: 1, rx: 16, ry: 2.4, fill: 'rgba(0,0,0,.16)' }, catG);
  catFlip = el('g', {}, catG);
  const walk = el('g', {}, catFlip), sit = el('g', {}, catFlip), nap = el('g', {}, catFlip);
  // standing / walking
  const legsFar = [catLeg(walk, -10, CC.dark), catLeg(walk, 9, CC.dark)];
  const tail = el('g', { transform: 'translate(-15 -16)' }, walk);
  el('path', { d: 'M0 0C-9 -2 -13 -14 -8 -22', stroke: CC.fur, 'stroke-width': 4.4, 'stroke-linecap': 'round', fill: 'none' }, tail);
  el('path', { d: 'M-9.6 -16.6C-10 -19 -9.6 -21 -8 -22', stroke: CC.dark, 'stroke-width': 4.4, 'stroke-linecap': 'round', fill: 'none' }, tail);
  el('ellipse', { cx: 0, cy: -15, rx: 17, ry: 7.6, fill: CC.fur }, walk);
  el('ellipse', { cx: 2, cy: -11.4, rx: 11, ry: 3.4, fill: CC.cream }, walk);
  el('path', { d: 'M-9 -21.5q2.4 3.6 0 7M-3 -22.4q2.4 3.6 0 7M3 -22q2.4 3.4 0 6.4', stroke: CC.dark, 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' }, walk);
  const legsNear = [catLeg(walk, -13, CC.fur, true), catLeg(walk, 12, CC.fur, true)];
  const headWrap = el('g', { transform: 'translate(16 -21)' }, walk);
  const headW = catHead(headWrap);
  // sitting
  const tailS = el('path', { d: 'M-10 -2C-2 2 10 2 15 -1.5', stroke: CC.fur, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, sit);
  el('ellipse', { cx: -4, cy: -8, rx: 10.5, ry: 8.5, fill: CC.fur }, sit);
  el('ellipse', { cx: 3, cy: -17, rx: 7.6, ry: 11.5, fill: CC.fur, transform: 'rotate(12 3 -17)' }, sit);
  el('ellipse', { cx: 6, cy: -15, rx: 3.8, ry: 6.5, fill: CC.cream, transform: 'rotate(12 6 -15)' }, sit);
  el('path', { d: 'M-9 -12q3 2.6 0 5.6M-4 -14q3 2.6 0 5.6', stroke: CC.dark, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, sit);
  el('rect', { x: 3.6, y: -10, width: 3.6, height: 10, rx: 1.6, fill: CC.dark }, sit);
  const paw = el('g', { transform: 'translate(10 -10)' }, sit);
  el('rect', { x: -1.8, y: 0, width: 3.8, height: 10, rx: 1.7, fill: CC.fur }, paw);
  el('ellipse', { cx: 0.2, cy: 9.6, rx: 2.6, ry: 1.6, fill: CC.cream }, paw);
  const headS = catHead(el('g', { transform: 'translate(7 -31)' }, sit));
  // curled up asleep
  const body = el('g', {}, nap);
  el('ellipse', { cx: 0, cy: -9, rx: 17, ry: 9, fill: CC.fur }, body);
  el('path', { d: 'M-10 -16q3 3 0 7M-4 -17.5q3 3 0 7M2 -17q3 3 0 6.6', stroke: CC.dark, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, body);
  el('path', { d: 'M-15 -3C-9 3 8 3.6 15 -0.5', stroke: CC.fur, 'stroke-width': 4.2, 'stroke-linecap': 'round', fill: 'none' }, nap);
  el('path', { d: 'M10 -1.6C12.6 -0.8 14.4 -0.6 15 -0.5', stroke: CC.dark, 'stroke-width': 4.2, 'stroke-linecap': 'round', fill: 'none' }, nap);
  catHead(el('g', { transform: 'translate(12 -8) rotate(14) scale(.95)' }, nap), true);
  const z = el('text', { x: 16, y: -20, class: 'cat-z' }, nap); z.textContent = 'z';
  const purr = el('g', { class: 'cat-purr' }, catG);
  el('path', { d: 'M-20 -18q-3 4 0 8M-24 -20q-4 6 0 12M20 -18q3 4 0 8M24 -20q4 6 0 12', stroke: '#c9a25a', 'stroke-width': 1.1, fill: 'none', 'stroke-linecap': 'round' }, purr);
  catParts = { walk, sit, nap, legsFar, legsNear, tail, headWrap, headW, tailS, paw, headS, body, purr };
  renderCatNow(0);
}
function renderCatNow(t) {
  if (!catG) return;
  const P = catParts, c = cat, moving = !!(c.jump || (c.target != null && Math.abs(c.target - c.x) > 1.5));
  const pose = c.jump || moving || c.eat > 0 ? 'walk' : c.pose;
  P.walk.style.display = pose === 'walk' ? '' : 'none';
  P.sit.style.display = pose === 'sit' ? '' : 'none';
  P.nap.style.display = pose === 'sleep' ? '' : 'none';
  catG.setAttribute('transform', `translate(${n1(c.x)} ${n1(c.y)})`);
  catFlip.setAttribute('transform', `scale(${c.dir} 1)`);
  if (pose === 'walk') {
    const sw = c.jump ? 0 : moving ? Math.sin(c.phase) * 24 : 0;
    const stretch = c.jump ? (c.jump.u < 0.5 ? -28 : 22) : 0;
    P.legsNear[0].setAttribute('transform', `translate(-13 -12) rotate(${n1(sw + stretch)})`);
    P.legsFar[1].setAttribute('transform', `translate(9 -12) rotate(${n1(sw - stretch)})`);
    P.legsFar[0].setAttribute('transform', `translate(-10 -12) rotate(${n1(-sw + stretch)})`);
    P.legsNear[1].setAttribute('transform', `translate(12 -12) rotate(${n1(-sw - stretch)})`);
    P.tail.setAttribute('transform', `translate(-15 -16) rotate(${n1(Math.sin(t * 2.2) * 9 + (moving ? -6 : 0))})`);
    const bob = moving ? Math.abs(Math.sin(c.phase)) * 1.2 : 0;
    P.headWrap.setAttribute('transform', c.eat > 0 ? `translate(17 ${n1(-12 + Math.sin(t * 9) * 0.8)}) rotate(30)` : `translate(16 ${n1(-21 - bob)})`);
  } else if (pose === 'sit') {
    const f = Math.sin(t * 1.7) * 2.2;
    P.tailS.setAttribute('d', `M-10 -2C-2 2 10 2 ${n1(15 + f)} ${n1(-1.5 - f * 0.8)}`);
    P.paw.setAttribute('transform', `translate(10 -10) rotate(${n1(c.swat > 0 ? -70 * Math.sin(Math.min(1, c.swat / 0.28) * Math.PI) : 0)})`);
  } else {
    P.body.setAttribute('transform', `translate(0 -9) scale(1 ${n1(1 + Math.sin(t * 1.6) * 0.035)}) translate(0 9)`);
  }
  const blinking = c.blink < 0.12;
  [P.headW, P.headS].forEach((h) => h.eye.setAttribute('ry', blinking ? '0.25' : '1.7'));
  P.purr.style.display = c.purr > 0 ? '' : 'none';
  if (c.hit) {
    const tall = pose === 'sleep' ? 24 : pose === 'sit' ? 42 : 34;
    c.hit.setAttribute('x', n1(c.x - 24)); c.hit.setAttribute('y', n1(c.y - tall)); c.hit.setAttribute('height', n1(tall + 6));
  }
}
function catTick(dt) {
  if (!catG) return;
  const c = cat;
  c.blink -= dt; if (c.blink < 0) c.blink = rand(2.5, 6);
  c.swat = Math.max(0, c.swat - dt); c.purr = Math.max(0, c.purr - dt); c.eat = Math.max(0, c.eat - dt);
  if (c.jump) {
    const J = c.jump; J.u = Math.min(1, J.u + dt / J.T);
    c.x = J.x0 + (J.x1 - J.x0) * J.u;
    c.y = J.y0 + (J.y1 - J.y0) * J.u - Math.sin(J.u * Math.PI) * J.h;
    if (J.u >= 1) { c.x = J.x1; c.y = J.y1; c.jump = null; }
  } else if (c.target != null) {
    const d = c.target - c.x, step = c.speed * dt;
    if (Math.abs(d) <= step) { c.x = c.target; c.target = null; }
    else { c.x += Math.sign(d) * step; c.dir = Math.sign(d); c.phase += dt * 11 * (c.speed / 46); }
  }
  // the cat gets off Bo's dock when Bo comes to use it
  if (c.perch === 'blanket' && !c.jump && Math.abs(bo.x - 588) < 80 && !c.flee) { c.flee = true; if (c.tok) c.tok.cancel(); }
  renderCatNow(now() / 1000);
}
async function catWait(ms, tok) { const end = now() + ms; while (now() < end && !tok.c) await sleep(80); return !tok.c; }
async function catWalk(x, tok, speed) {
  cat.speed = speed || 46; cat.target = clamp(x, CAT_MIN, CAT_MAX);
  while (cat.target != null && !tok.c) await sleep(40);
  if (tok.c) cat.target = null;
  cat.pose = 'sit';
  return !tok.c;
}
async function catJump(x, y, tok) {
  cat.dir = x >= cat.x ? 1 : -1;
  cat.jump = { x0: cat.x, y0: cat.y, x1: x, y1: y, u: 0, T: 0.42 + Math.abs(y - cat.y) / 520, h: Math.max(18, cat.y - y + 22) };
  while (cat.jump && !tok.c) await sleep(30);
  if (cat.jump) { cat.x = x; cat.y = y; cat.jump = null; }
  cat.pose = 'sit';
  return !tok.c;
}
async function catDown(tok) {
  if (cat.y >= CAT_FLOOR - 1) { cat.y = CAT_FLOOR; cat.perch = null; return true; }
  const away = bo.x > cat.x ? -1 : 1;
  const ok = await catJump(clamp(cat.x + away * 30, CAT_MIN, CAT_MAX), CAT_FLOOR, { c: false });
  cat.perch = null;
  return ok && !tok.c;
}
async function catGoFloor(x, tok, speed) { if (!(await catDown(tok))) return false; return catWalk(x, tok, speed); }
async function catGoPerch(name, tok) {
  const s = CAT_SPOTS[name];
  if (cat.perch === name) return true;
  if (s.via) { if (!(await catGoPerch(s.via, tok))) return false; }
  else { const side = cat.x < s.x ? -1 : 1; if (!(await catGoFloor(s.x + side * 34, tok))) return false; }
  if (!(await catJump(s.x, s.y, tok))) return false;
  cat.perch = name; cat.pose = 'sit';
  return true;
}
async function catNap(ms, tok) { cat.pose = 'sleep'; const ok = await catWait(ms, tok); if (cat.pose === 'sleep') cat.pose = 'sit'; return ok; }
function catSay(text) {
  if (!catG || RM.matches) return;
  const t = el('text', { x: 0, y: cat.pose === 'sleep' ? -30 : -46, class: 'cat-say' }, catG); t.textContent = text;
  setTimeout(() => t.remove(), 1500);
}
function catName() { return apt.catName || 'the cat'; }
const CatName = () => apt.catName || 'The cat';

/* ---------- what the cat does on its own ---------- */
async function catEat(tok) {
  if (!(await catGoFloor(BOWL_X - 20, tok, 70))) return;
  cat.dir = 1; cat.eat = 5.5;
  for (let k = 0; k < 6 && !tok.c; k++) { await catWait(800, tok); }
  cat.eat = 0;
  if (tok.c) return;
  apt.catBowl = 0; renderBowl(); saveSoon();
  cat.called = false;
  cat.pose = 'sit'; await catWait(rand(2000, 3500), tok);
}
async function catCounter(tok) {
  cat.counterDone = true;
  if (!(await catGoPerch('island', tok))) return;
  await catWait(rand(3500, 5500), tok); if (tok.c) return;
  if (cls.on) { glanceAt(cat.x, cat.y - 20, 1600); flashMood('annoyed', 1400); log(pick(['Cat. Counter. No.', 'Off the counter.', 'Not a cooking assistant.', 'Paws off the prep area.']), true); }
  await catWait(700, tok);
  await catGoFloor(cat.x + 120, tok, 80);
}
async function catFlee(tok) {
  cat.flee = false;
  await catGoFloor(cat.x + (bo.x > cat.x ? -1 : 1) * rand(140, 220), tok, 90);
  await catWait(rand(1500, 3000), tok);
}
async function catBench(tok) {
  if (!(await catGoPerch('bench', tok))) return;
  if (!(await catWalk(850, tok, 30))) return;
  cat.dir = 1; await catWait(1200, tok); if (tok.c) return;
  if (!apt.knocked && apt.project > 0.1 && Math.random() < 0.6) {
    cat.swat = 0.3; await catWait(320, tok);
    cat.swat = 0.3; await catWait(400, tok); if (tok.c) return;
    apt.knocked = true; renderProject(); saveSoon();
    puff(884, 488, 3);
    await catWait(500, tok);
    await catGoFloor(cat.x - 200, tok, 150);
    return;
  }
  cat.pose = 'sleep'; await catWait(rand(8000, 14000), tok);
}
async function catDust(tok) {
  const i = apt.dust.findIndex(() => true); if (i < 0) return;
  const d = apt.dust[i], side = cat.x < d.x ? -1 : 1;
  if (!(await catGoFloor(d.x + side * 24, tok, 60))) return;
  cat.dir = -side;
  for (let k = 0; k < 3 && !tok.c; k++) {
    await catWait(rand(500, 900), tok); if (tok.c) return;
    cat.swat = 0.3;
    if (apt.dust[i]) { apt.dust[i].x = clamp(apt.dust[i].x - side * 7, 120, 900); renderDust(); }
  }
  await catWait(1200, tok);
}
async function catFollow(tok) {
  const side = bo.x > cat.x ? -1 : 1;
  if (!(await catGoFloor(bo.x + side * 46, tok))) return;
  cat.dir = -side; cat.pose = 'sit';
  await catWait(rand(5000, 9000), tok);
}
async function catZoomies(tok) {
  const far = cat.x < 200 ? rand(600, 860) : rand(-420, 0);
  if (!(await catGoFloor(far, tok, 190))) return;
  if (!(await catWalk(cat.x + (far > 200 ? -260 : 260), tok, 170))) return;
  cat.pose = 'sit'; await catWait(1500, tok);
}
async function catWander(tok) {
  if (!(await catGoFloor(clamp(cat.x + rand(-300, 300), CAT_MIN, CAT_MAX), tok))) return;
  await catWait(rand(3000, 7000), tok);
}
async function catSun(tok) { if (!(await catGoFloor(rand(600, 660), tok))) return; await catNap(rand(20000, 40000), tok); }
async function catChair(tok) { if (!(await catGoPerch('chair', tok))) return; await catNap(rand(20000, 45000), tok); }
async function catBlanket(tok) { if (Math.abs(bo.x - 588) < 120) return; if (!(await catGoPerch('blanket', tok))) return; await catNap(rand(18000, 36000), tok); }
async function catSill(tok) { if (Math.abs(bo.x - 588) < 120) return; if (!(await catGoPerch('sill', tok))) return; cat.dir = pick([1, -1]); await catWait(rand(9000, 18000), tok); if (!tok.c) await catDown(tok); }
async function catKitchen(tok) {
  if (!(await catGoFloor(BOWL_X - 30, tok))) return;
  cat.dir = 1; await catWait(1500, tok); if (!tok.c && Math.random() < 0.6) catSay('mrrp');
  await catWait(rand(3000, 6000), tok);
}
function catChoose() {
  const day = !isDark(), tod = currentTod();
  if (cat.flee) return catFlee;
  if (apt.catBowl > 0 && (cat.called || Math.random() < 0.5)) return catEat;
  if (cls.on && !cat.counterDone && Math.random() < 0.45) return catCounter;
  return weighted([
    [catChair, 3], [catBlanket, bo.mode === 'nap' || bo.mode === 'napwalk' ? 0 : 2.4], [catSun, day && apt.blinds ? 3 : 0], [catSill, day ? 1.4 : 0.6],
    [catWander, 2], [catFollow, cls.on ? 3 : 1.4], [catDust, apt.dust.length ? 1.8 : 0], [catBench, !apt.knocked && apt.project > 0.1 ? 0.9 : 0.2],
    [catKitchen, 0.8], [catZoomies, tod === 'evening' || tod === 'night' ? 0.7 : 0.15],
  ]);
}
async function catLoop() {
  for (;;) {
    if (cat.hold) { await sleep(200); continue; }
    if (!cls.on) cat.counterDone = false;
    const tok = makeTok(); cat.tok = tok;
    try { await catChoose()(tok); } catch (err) { console.error(err); }
    if (!cat.hold) await sleep(rand(500, 1300));
  }
}
function catHoldStill(on) { cat.hold = on; if (on && cat.tok) { cat.tok.cancel(); cat.target = null; } }

/* ---------- the bowl ---------- */
function renderBowl() { const f = $('#catFood'); if (f) f.style.display = apt.catBowl > 0 ? '' : 'none'; }

/* ---------- Bo's cat chores ---------- */
async function actFeedCat(tok, req) {
  setDoing('Feeding the cat', 'feeding the cat');
  if (!(await kFromCabinet(tok, 'catfood'))) return;
  if (!(await kGo(BOWL_X - 44, BOWL_X, tok, 'content'))) return;
  bo.goal.sit = 0.55; reachR(BOWL_X - 4, 470, 100);
  await wait(450, tok); if (tok.c) { bo.goal.sit = 0; return; }
  cat.called = true; if (cat.tok && !cat.hold) cat.tok.cancel();
  await kPour(tok, BOWL_X, 489, 'kibble', 900);
  kit.carry = null; renderKitchen(); bo.goal.sit = 0; resetArms();
  apt.catBowl = 1; apt.catFedAt = Date.now(); renderBowl(); saveSoon();
  if (tok.c) return;
  report(pick([isDark() ? 'Dinner is served.' : 'Breakfast is served.', 'Kibble deployed.', `${CatName()} heard the bag from three rooms away. There is one room.`]), req);
}
async function actPetCat(tok, req) {
  catHoldStill(true);
  try {
    setDoing('Petting the cat', 'petting the cat');
    const side = bo.x < cat.x ? -1 : 1, standX = clamp(cat.x + side * 40, ROAM[0], ROAM[1]);
    if (!(await approach(standX, cat.x, cat.y - 14, tok, 'content'))) return;
    face(cat.x);
    for (let k = 0; k < 3 && !tok.c; k++) {
      reachR(cat.x - 6, cat.y - (cat.pose === 'sleep' ? 16 : 22), 190); await wait(380, tok);
      reachR(cat.x + 6, cat.y - (cat.pose === 'sleep' ? 15 : 20), 190); await wait(380, tok);
      cat.purr = 2.4;
    }
    resetArms(); if (tok.c) return;
    flashMood('happy', 1400);
    report(pick(['Purring. Around 25 hertz.', 'It allowed this. For now.', 'Petting accepted.', `${CatName()} approves. Mostly.`]), req);
  } finally { catHoldStill(false); }
}
const CAT_FACTS = ['Sleeps up to 16 hours a day. Efficient.', "Can't taste sweet things. Missing the receptor.", 'Walks on its toes. Technically digitigrade.', 'Whiskers about as wide as its body. Built-in gap sensor.', 'Ears turn on their own. Two radar dishes.'];
async function actStudyCat(tok) {
  catHoldStill(true);
  try {
    setDoing('Studying the cat', 'studying the cat through its magnifier');
    const side = bo.x < cat.x ? -1 : 1;
    if (!(await approach(clamp(cat.x + side * 46, ROAM[0], ROAM[1]), cat.x, cat.y - 16, tok, 'curious'))) return;
    await useLens(tok, rand(1800, 2600), cat.x, cat.y - 16); if (tok.c) return;
    log(pick(CAT_FACTS), true); flashMood('content', 1200);
  } finally { catHoldStill(false); }
}
async function actPickupFigurine(tok) {
  setDoing('Picking up after the cat', 'picking up the figurine the cat knocked off the bench');
  if (!(await approach(856, 884, 490, tok, 'annoyed'))) return;
  bo.goal.sit = 0.6; reachR(884, 488, 100); await wait(600, tok); if (tok.c) { bo.goal.sit = 0; return; }
  apt.knocked = false; holdItem('letter'); bo.goal.sit = 0;
  reachR(866, 384, 120); await wait(600, tok);
  holdItem(null); renderProject(); saveSoon(); resetArms();
  if (tok.c) return;
  log(pick(['Figurine back on the bench. The cat has opinions about gravity.', 'Put it back. Again.', 'Knocked off. Put back. This is our system.']), true);
}
// naming the cat in chat: "the cat's name is Biscuit", "name the cat Biscuit", "call the cat Biscuit"
function catNameFrom(text) {
  const t = String(text || '');
  const m = t.match(/\bcat'?s name is\s+([A-Za-z][A-Za-z'-]{0,15})/i) || t.match(/\b(?:name|call)\s+(?:the|your|our)\s+cat\s+([A-Za-z][A-Za-z'-]{0,15})/i)
    || t.match(/\bcat (?:is )?(?:called|named)\s+([A-Za-z][A-Za-z'-]{0,15})/i) || (/\bcat\b/i.test(t) && t.match(/\b(?:name it|call it|call him|call her|name him|name her)\s+([A-Za-z][A-Za-z'-]{0,15})/i));
  if (!m) return null;
  const n = m[1].replace(/['-]+$/, '');
  if (/^(the|a|an|it|him|her|that|this|what|something|anything|nothing|cat)$/i.test(n)) return null;
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
}
function setCatName(n) { apt.catName = n; saveSoon(); const note = addNote(`the cat's name is ${n}`); return note; }
function catContext() {
  return `- You share the apartment with a ginger cat${apt.catName ? ` named ${apt.catName}` : ''}. It's your cat: you feed it and look after it, and it does whatever it wants. You find it fascinating in a dry way. It is always fine and fed; never make the person feel responsible for it.`;
}
function initCat() {
  buildCat(); renderBowl();
  const o = { get name() { return apt.catName || 'Cat'; }, verb: () => (cls.on ? 'pet it after class' : 'ask Bo to pet it'), box: [cat.x - 24, cat.y - 30, 48, 36], direct: () => {
    catSay(pick(['mrrp', 'mrow', 'prrt']));
    cat.purr = 1.4;
    if (cls.on || bo.mode === 'nap' || bo.mode === 'boot') return;
    requestAction((tok) => actPetCat(tok, true));
  } };
  cat.hit = makeHit(o, el('g', {}, $('#hits')));
  catLoop();
}
