
/* ================= Bo ================= */
const B = {
  root: $('#bo'), flip: $('#boFlip'), body: $('#boBody'), legs: $('#boLegs'), legL: $('#legL'), legR: $('#legR'), shadow: $('#bo .bo-shadow'),
  backSlot: $('#armBackSlot'), frontSlot: $('#armFrontSlot'), chest: $('#chest'), torsoSide: $('#torsoSide'),
  armL: $('#armL'), armR: $('#armR'), foreL: $('#foreL'), foreR: $('#foreR'), pistonL: $('#pistonL'), pistonR: $('#pistonR'),
  holdR: $('#holdR'), itemBook: $('#itemBook'), itemLetter: $('#itemLetter'), bookCover: $('#bookCover'), blanket: $('#blanket'),
  neck: $('#neckPiston'), head: $('#boHead'), earL: $('#earL'), earR: $('#earR'), antStem: $('#antStem'), ant: $('#antLight'),
  headSide: $('#headSide'), face: $('#face'), eyes: $('#eyes'), eyeL: $('#eyeL'), eyeR: $('#eyeR'), glintL: $('#glintL'), glintR: $('#glintR'),
  lidL: $('#lidL'), lidR: $('#lidR'), lowL: $('#lowL'), lowR: $('#lowR'), mouth: $('#mouth'), mouthO: $('#mouthO'),
  cheekL: $('#cheekL'), cheekR: $('#cheekR'), gClosed: $('#gClosed'), gBoot: $('#gBoot'), intake: $('#intake'), hit: $('#boHit'),
  toolWrench: $('#toolWrench'), toolTorch: $('#toolTorch'), toolCan: $('#toolCan'), toolBroom: $('#toolBroom'), toolSnack: $('#toolSnack'),
  toolKnife: $('#toolKnife'), toolWhisk: $('#toolWhisk'), toolLadle: $('#toolLadle'), toolSpatula: $('#toolSpatula'),
  gHat: $('#gHat'), gHatInner: $('#gHatInner'), gScope: $('#gScope'), scope2: $('#scope2'), scope3: $('#scope3'), scopeGlass: $('#scopeGlass'),
  gLens: $('#gLens'), gLensArm: $('#gLensArm'), gLensHead: $('#gLensHead'),
};
const bo = {
  x: 588, targetX: null, onArrive: null, dir: 1, speed: 70, curSpeed: 0, claim: null,
  energy: 0.85, mode: 'boot', mood: 'off', doing: 'getting its bearings', item: null, tool: 'wrench', bookRef: null,
  pose: { armL: 8, armR: -8, extL: 0, extR: 0, head: 0, sit: 1, perch: 30, ex: 0, ey: 0, lean: 0, turn: 0 },
  goal: { armL: 8, armR: -8, extL: 0, extR: 0, head: 0, sit: 1, perch: 30, ex: 0, ey: 0, lean: 0, turn: 0 },
  m: { ew: 10, eh: 0.5, lid: 0.08, slope: 0, low: 0, ears: 20, ant: 14, neck: -4, cheeks: 0, asym: 0, tilt: 0 },
  look: { x: 0, y: 0 }, antA: 0, antV: 0, armBack: false, screen: '',
  walkPhase: 0, bobT: 0, bobY: 0, nextBlink: 0, blinkUntil: 0,
  glance: null, glanceCool: 0, welding: null, talking: false, walking: false,
  gad: { lens: 0, scope: 0, hat: 0 }, gadGoal: { lens: 0, scope: 0, hat: 0 },
};
/* Moods drive the whole face: eye size, lids (brows), lower lids (smile), mouth, ear fins, antenna, neck, head tilt. */
const MOOD_DEF = { ew: 10, eh: 14, lid: 0.08, slope: 0, low: 0, ears: 0, ant: 0, neck: 0, cheeks: 0, asym: 0, tilt: 0, mouth: 'none' };
const MOODS = {
  normal: {},
  happy: { ew: 10.5, lid: 0.02, low: 0.55, mouth: 'smile', ears: -18, ant: -6, neck: 2, cheeks: 1 },
  content: { lid: 0.3, low: 0.35, mouth: 'smile', ears: -6, ant: -2, cheeks: 0.6 },
  wide: { ew: 12, eh: 17, lid: 0, mouth: 'o', ears: -22, ant: -8, neck: 5 },
  surprised: { ew: 12.5, eh: 18, lid: 0, mouth: 'o', ears: -26, ant: -12, neck: 7 },
  curious: { ew: 10.5, eh: 15, lid: 0.04, mouth: 'none', ears: -12, ant: -5, neck: 3, asym: 0.16, tilt: 9 },
  squint: { ew: 11, eh: 13, lid: 0.42, slope: 0.2, low: 0.28, mouth: 'flat', ears: 6, ant: 2, neck: 1 },
  lookup: { ew: 10.5, eh: 15, lid: 0, ears: -8, ant: -3, neck: 5 },
  talk: { eh: 13.5, lid: 0.06, low: 0.12, mouth: 'talk', ears: -6, neck: 1 },
  half: { lid: 0.5, slope: -0.1, low: 0.18, ears: 12, ant: 6, neck: -2 },
  sad: { ew: 9.5, eh: 13, lid: 0.28, slope: -0.55, mouth: 'frown', ears: 32, ant: 16, neck: -3 },
  low: { ew: 9.5, eh: 12, lid: 0.45, slope: -0.3, ears: 24, ant: 12, neck: -3 },
  read: { eh: 13, lid: 0.32, low: 0.1, ears: 4, ant: 2, neck: -1 },
  think: { lid: 0.22, slope: 0.15, mouth: 'squiggle', ears: -4, neck: 2, asym: -0.12, tilt: -10 },
  annoyed: { ew: 10.5, eh: 12, lid: 0.55, slope: 0.15, low: 0.3, mouth: 'flat', ears: 18, ant: 4 },
  nap: { screen: 'closed', ears: 34, ant: 18, neck: -5 },
  boot: { screen: 'boot', ears: 10, ant: 8, neck: -2 },
  off: { screen: 'off', ears: 30, ant: 16, neck: -5 },
};
const MOOD_KEYS = ['ew', 'eh', 'lid', 'slope', 'low', 'ears', 'ant', 'neck', 'cheeks', 'asym', 'tilt'];
function setExpr(e) { bo.mood = MOODS[e] ? e : 'normal'; }
function restExpr() { setExpr('normal'); }
let moodTimer = 0;
function flashMood(m, ms, after) { setExpr(m); clearTimeout(moodTimer); moodTimer = setTimeout(() => { if (bo.mood === m) setExpr(after || 'normal'); }, ms); }
function antenna(m) { B.ant.setAttribute('class', 'ant-' + m); }
function setTool(t) { bo.tool = t; ['Wrench', 'Torch', 'Can', 'Broom', 'Snack', 'Knife', 'Whisk', 'Ladle', 'Spatula'].forEach((n) => { B['tool' + n].style.display = !bo.item && n.toLowerCase() === t ? '' : 'none'; }); }
function holdItem(name, color) {
  bo.item = name || null;
  B.itemBook.style.display = name === 'book' ? '' : 'none';
  B.itemLetter.style.display = name === 'letter' ? '' : 'none';
  if (color) B.bookCover.setAttribute('fill', color);
  setTool(bo.tool);
}
function setBlanket(on) { B.blanket.style.display = on ? '' : 'none'; $('#blanketFolded').style.display = on ? 'none' : ''; }
function normAngle(a, near) { while (a - near > 180) a -= 360; while (a - near < -180) a += 360; return a; }
function resetArmR() { bo.goal.armR = normAngle(-8, bo.pose.armR); bo.goal.extR = 0; }
function resetArmL() { bo.goal.armL = normAngle(8, bo.pose.armL); bo.goal.extL = 0; }
function resetArms() { resetArmR(); resetArmL(); setTool('wrench'); }
function faceFront() { bo.goal.turn = 0; bo.goal.ex = 0; bo.goal.ey = 0; bo.goal.head = 0; }
function face(x) { const dx = x - bo.x; bo.goal.turn = Math.abs(dx) < 6 ? 0 : Math.sign(dx); }

/* Geometry. Bo is drawn facing right; facing left mirrors the whole body, so the working arm is always the front one. */
const rootY = () => GROUND - bo.pose.perch;
const bodyY = () => bo.pose.sit * 9 + bo.bobY;
const mirrorNow = () => (bo.pose.turn < -0.001 ? -1 : 1);
const mirrorGoal = () => (bo.goal.turn < 0 ? -1 : bo.goal.turn > 0 ? 1 : mirrorNow());
const turnAmt = (goal) => Math.abs(goal ? bo.goal.turn : bo.pose.turn);
function shoulderLocal(front, goal) { const a = turnAmt(goal); return front ? { x: 26 - 2 * a, y: -62 } : { x: -26 + 12 * a, y: -62 }; }
function toLocal(wx, wy, goal) { const m = goal ? mirrorGoal() : mirrorNow(); return { x: ((wx - bo.x) / BS) * m, y: (wy - rootY()) / BS - bodyY() }; }
function bodyWorld(lx, ly) { return { x: bo.x + mirrorNow() * lx * BS, y: rootY() + (ly + bodyY()) * BS }; }
function aimLocal(front, wx, wy) { const t = toLocal(wx, wy, true), s = shoulderLocal(front, true); return { ang: Math.atan2(t.y - s.y, t.x - s.x) * 180 / Math.PI - 90, dist: Math.hypot(t.x - s.x, t.y - s.y) }; }
function reachR(tx, ty, maxExt = 150) { const a = aimLocal(true, tx, ty); bo.goal.armR = normAngle(a.ang, bo.pose.armR); bo.goal.extR = clamp(a.dist - 36, 0, maxExt); }
function reachL(tx, ty, maxExt = 150) { const a = aimLocal(false, tx, ty); bo.goal.armL = normAngle(a.ang, bo.pose.armL); bo.goal.extL = clamp(a.dist - 34, 0, maxExt); }
function aimBeam(tx, ty) { const a = aimLocal(true, tx, ty); bo.goal.armR = normAngle(a.ang, bo.pose.armR); bo.goal.extR = 8; }
function toolTip(localY = 38.5, localX = 0) {
  const s = shoulderLocal(true), th = bo.pose.armR * Math.PI / 180, ly = localY + bo.pose.extR;
  return bodyWorld(s.x + localX * Math.cos(th) - ly * Math.sin(th), s.y + localX * Math.sin(th) + ly * Math.cos(th));
}
function lookAt(tx, ty) { bo.goal.ex = clamp(((tx - bo.x) * mirrorGoal()) / 30, -4, 4); bo.goal.ey = clamp((ty - (rootY() - 100)) / 40, -3.5, 3.5); }
function glanceAt(tx, ty, ms = 1400) { bo.glance = { ex: clamp(((tx - bo.x) * mirrorNow()) / 30, -4, 4), ey: clamp((ty - (rootY() - 100)) / 40, -3.5, 3.5), until: now() + ms }; }

/* ---------- per-frame animation ---------- */
let lastT = 0, dripT = 1, noteT = 0.5, grooveT = 0;
const clouds = $$('#clouds path').map((p, i) => ({ p, x: i ? 610 : 540, y: i ? 136 : 160 }));
const f2 = (v) => v.toFixed(2);
function frame(t) {
  const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016; lastT = t;
  let walking = false;
  if (bo.targetX != null) {
    // long walks speed up, short steps stay calm, and Bo eases off as it arrives
    const dx = bo.targetX - bo.x, rem = Math.abs(dx);
    const base = bo.hurry && bo.mode === 'free' ? Math.max(bo.speed, 110) : bo.speed;
    const far = bo.mode === 'free' ? clamp(1 + (rem - 120) / 240, 1, 2.8) : 1;
    const want = Math.min(280, base * far);
    bo.curSpeed = (bo.curSpeed || 0) + (want - (bo.curSpeed || 0)) * (1 - Math.pow(0.02, dt));
    const step = Math.max(bo.curSpeed, 18) * dt;
    if (rem <= step) { bo.x = bo.targetX; bo.targetX = null; bo.curSpeed = 0; const f = bo.onArrive; bo.onArrive = null; if (f) f(); }
    else { bo.x += Math.sign(dx) * step; bo.dir = Math.sign(dx); walking = true; }
  }
  bo.walking = walking;
  bo.goal.lean = walking ? 2.5 : 0;
  if (walking) { bo.walkPhase += dt * 9 * clamp((bo.curSpeed || bo.speed) / 44, 0.8, 4.2); bo.goal.turn = bo.dir; }
  const kFast = 1 - Math.pow(0.0008, dt), kSlow = 1 - Math.pow(0.03, dt), kTurn = 1 - Math.pow(0.00002, dt);
  for (const key in bo.goal) {
    const k = key === 'turn' ? kTurn : (key === 'armL' || key === 'armR' || key === 'extL' || key === 'extR') ? kFast : kSlow;
    bo.pose[key] += (bo.goal[key] - bo.pose[key]) * k;
  }
  bo.bobT += dt;
  const bob = RM.matches ? 0 : walking ? -Math.abs(Math.sin(bo.walkPhase)) * 2.2 : Math.sin(bo.bobT * 2.4) * 0.8 * (1 - bo.pose.sit);
  bo.bobY = bob;
  const grooving = apt.radio && !walking && !bo.welding && (bo.mode === 'free' || bo.mode === 'social') && !RM.matches;
  grooveT += dt;
  const vb = svg.viewBox.baseVal; sfx.radioTick(apt.radio && !document.hidden, bo.talking, vb && vb.width ? (478 - (vb.x + vb.width / 2)) / (vb.width / 2) : 0, currentTod());
  const beat = sfx.radioBeat(); if (beat != null) grooveT = beat * Math.PI / 6.2;
  const groove = grooving ? Math.sin(grooveT * 6.2) * 3 : 0;
  // mood params ease toward the current mood
  const mood = bo.mood === 'normal' && bo.energy < 0.2 ? 'low' : bo.mood;
  const MT = MOODS[mood] || MOODS.normal, km = 1 - Math.pow(0.002, dt);
  for (const k of MOOD_KEYS) { const tv = MT[k] != null ? MT[k] : MOOD_DEF[k]; bo.m[k] += (tv - bo.m[k]) * km; }
  const amt = Math.abs(bo.pose.turn), mirror = mirrorNow();
  const liftL = walking ? Math.max(0, Math.sin(bo.walkPhase)) * 5 : 0;
  const liftR = walking ? Math.max(0, -Math.sin(bo.walkPhase)) * 5 : 0;
  const sit = bo.pose.sit;
  B.root.setAttribute('transform', `translate(${f2(bo.x)} ${f2(rootY())}) scale(${BS}) rotate(${f2(bo.pose.lean * mirror)})`);
  B.flip.setAttribute('transform', `scale(${mirror} 1)`);
  B.shadow.setAttribute('opacity', bo.pose.perch > 4 ? '0' : '1');
  B.body.setAttribute('transform', `translate(0 ${f2(sit * 9 + bob)})`);
  B.legs.setAttribute('transform', `scale(1 ${(1 - sit * 0.36).toFixed(3)})`);
  B.legL.setAttribute('transform', `translate(${f2(-12 + 5 * amt)} ${f2(-liftL)})`);
  B.legR.setAttribute('transform', `translate(${f2(12 - 2 * amt)} ${f2(-liftR)})`);
  B.chest.setAttribute('transform', `translate(${f2(3 * amt)} 0)`);
  B.torsoSide.setAttribute('opacity', f2(amt));
  const back = amt > 0.35;
  if (back !== bo.armBack) { (back ? B.backSlot : B.frontSlot).appendChild(B.armL); bo.armBack = back; }
  const sL = shoulderLocal(false), sR = shoulderLocal(true);
  B.armL.setAttribute('transform', `translate(${f2(sL.x)} -62) rotate(${f2(bo.pose.armL)})`);
  B.armR.setAttribute('transform', `translate(${f2(sR.x)} -62) rotate(${f2(bo.pose.armR)})`);
  B.foreL.setAttribute('transform', `translate(0 ${f2(bo.pose.extL)})`);
  B.foreR.setAttribute('transform', `translate(0 ${f2(bo.pose.extR)})`);
  B.pistonL.setAttribute('height', f2(bo.pose.extL + 1));
  B.pistonR.setAttribute('height', f2(bo.pose.extR + 1));
  if (bo.item) B.holdR.setAttribute('transform', `rotate(${f2(-bo.pose.armR)} 0 ${f2(40)})`);
  // head: neck crane, tilt, turn, ear fins, springy antenna
  const neck = bo.m.neck + (bo.pose.ey < -1.5 ? 3 : 0) + 4;
  B.neck.setAttribute('y', f2(-78 - neck)); B.neck.setAttribute('height', f2(neck + 5));
  B.head.setAttribute('transform', `translate(0 ${f2(-78 - neck + 4)}) rotate(${f2(bo.pose.head + bo.m.tilt + groove)} 0 -3)`);
  B.face.setAttribute('transform', `translate(${f2(5 * amt)} 0)`);
  B.headSide.setAttribute('opacity', f2(amt));
  const ears = bo.m.ears + (grooving ? Math.sin(grooveT * 6.2 + 1) * 6 : 0);
  B.earL.setAttribute('transform', `translate(${f2(-29 + 5 * amt)} -21) scale(-1 1) rotate(${f2(ears)})`);
  B.earL.setAttribute('opacity', f2(1 - 0.75 * amt));
  B.earR.setAttribute('transform', `translate(${f2(29 - amt)} -21) rotate(${f2(ears)})`);
  const antTarget = bo.m.ant - bo.pose.lean * 2 + (walking ? Math.sin(bo.walkPhase * 2) * 7 : 0) + (grooving ? Math.sin(grooveT * 6.2) * 8 : 0);
  bo.antV += ((antTarget - bo.antA) * 150 - bo.antV * 10) * dt; bo.antA += bo.antV * dt;
  const kg = 1 - Math.pow(0.0006, dt);
  for (const g of ['lens', 'scope', 'hat']) bo.gad[g] += (bo.gadGoal[g] - bo.gad[g]) * kg;
  const HAT = bo.gad.hat, antLen = 15 * (1 - 0.85 * HAT);
  const ar = (bo.antA * Math.PI) / 180, ax = 2 * amt + Math.sin(-ar) * antLen, ay = -39 - Math.cos(ar) * antLen;
  B.antStem.setAttribute('x1', f2(2 * amt)); B.antStem.setAttribute('x2', f2(ax)); B.antStem.setAttribute('y2', f2(ay));
  B.ant.setAttribute('cx', f2(ax + Math.sin(-ar) * 1.5)); B.ant.setAttribute('cy', f2(ay - Math.cos(ar) * 1.5));
  B.ant.setAttribute('opacity', HAT > 0.6 ? '0' : '1');
  renderGadgets(amt);
  renderFace(t, dt, amt);
  if (bo.welding) updateWeld();
  kitchenTick(dt);
  catTick(dt);
  // things that move in the room
  if (apt.leak && !document.hidden) { dripT -= dt; if (dripT <= 0) { spawnDrip(); dripT = rand(2.3, 3.9); } }
  if (apt.radio && !RM.matches) { noteT -= dt; if (noteT <= 0) { spawnNote(); noteT = rand(1.1, 1.9); } }
  if (!RM.matches) clouds.forEach((c) => { c.x += dt * 3.2; if (c.x > 668) c.x = 470; c.p.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y})`); });
  if (Math.abs(apt.tilt - picAngle) > 0.02) { picAngle += (apt.tilt - picAngle) * (1 - Math.pow(0.02, dt)); $('#pictureFrame').setAttribute('transform', `rotate(${picAngle.toFixed(2)} 343 158)`); }
  if (apt.lightFault && apt.ceiling && !apt.bulbDead) {
    light.flickerT -= dt;
    if (light.flickerT <= 0) { light.flickerOff = !light.flickerOff && Math.random() < 0.7; light.flickerT = light.flickerOff ? rand(0.04, 0.14) : rand(0.08, 0.9); applyCeilingGlow(); }
  } else if (light.flickerOff) { light.flickerOff = false; applyCeilingGlow(); }
  updateParticles(dt);
  camTick(dt);
  placeOverlays();
  requestAnimationFrame(frame);
}
let picAngle = 0;
const smooth = (v) => { const x = clamp(v, 0, 1); return x * x * (3 - 2 * x); };
function renderGadgets(amt) {
  const L = smooth(bo.gad.lens), S = smooth(bo.gad.scope), H = smooth(bo.gad.hat);
  if (L > 0.01) {
    B.gLens.setAttribute('opacity', '1');
    const dx = 10.5 + 5 * amt, dy = -21.5, cx = 34 + (dx - 34) * L, cy = -47 + (dy + 47) * L, sc = 0.25 + 0.75 * L;
    B.gLensHead.setAttribute('transform', `translate(${f2(cx)} ${f2(cy)}) scale(${f2(sc)})`);
    B.gLensArm.setAttribute('x2', f2(cx + 7 * sc)); B.gLensArm.setAttribute('y2', f2(cy - 7 * sc));
  } else B.gLens.setAttribute('opacity', '0');
  if (S > 0.01) {
    B.gScope.setAttribute('opacity', '1');
    B.gScope.setAttribute('transform', `translate(${f2(10.5 + 5 * amt)} -21.5) rotate(-26) scale(${f2(0.5 + 0.5 * S)})`);
    B.scope2.setAttribute('x', f2(9 * S)); B.scope3.setAttribute('x', f2(18 * S)); B.scopeGlass.setAttribute('x', f2(18 * S + 10.5));
  } else B.gScope.setAttribute('opacity', '0');
  B.gHat.setAttribute('opacity', H > 0.02 ? '1' : '0');
  B.gHatInner.setAttribute('transform', `translate(-3 -40) scale(${f2(Math.max(0.01, H))})`);
}
function showScreen(s) {
  if (s === bo.screen) return;
  bo.screen = s;
  const eyesOn = s === 'eyes';
  [B.eyes, B.glintL, B.glintR, B.lidL, B.lidR, B.lowL, B.lowR, B.mouth, B.cheekL, B.cheekR].forEach((n) => { n.style.display = eyesOn ? '' : 'none'; });
  if (!eyesOn) B.mouthO.style.display = 'none';
  B.gClosed.style.display = s === 'closed' ? '' : 'none';
  B.gBoot.style.display = s === 'boot' ? '' : 'none';
}
function renderFace(t, dt, amt) {
  const mood = bo.mood === 'normal' && bo.energy < 0.2 ? 'low' : bo.mood;
  const T = MOODS[mood] || MOODS.normal, M = bo.m;
  showScreen(T.screen || 'eyes');
  if (bo.screen !== 'eyes') return;
  let blink = 1;
  if (t > bo.nextBlink) { bo.blinkUntil = t + 130; bo.nextBlink = t + rand(2400, 5600); }
  if (t < bo.blinkUntil) blink = 0.08;
  const g = bo.glance && t < bo.glance.until ? bo.glance : null;
  if (!g) bo.glance = null;
  const kl = 1 - Math.pow(0.002, dt);
  bo.look.x += ((g ? g.ex : bo.pose.ex) - bo.look.x) * kl;
  bo.look.y += ((g ? g.ey : bo.pose.ey) - bo.look.y) * kl;
  const lx = clamp(bo.look.x, -4, 4), ly = clamp(bo.look.y, -3.5, 3.5);
  [[-1, B.eyeL, B.glintL, B.lidL, B.lowL], [1, B.eyeR, B.glintR, B.lidR, B.lowR]].forEach(([side, eye, glint, lid, low]) => {
    const mag = side > 0 ? 1 + 0.45 * smooth(bo.gad.lens) : 1;
    const size = (1 - side * M.asym) * mag;
    let w = M.ew * size; const h = Math.max(0.6, M.eh * size * blink);
    if (side < 0) w *= 1 - 0.22 * amt;
    const cx = side * 10.5 + lx + (side < 0 ? 1.4 * amt : 0), cy = -21.5 + ly;
    eye.setAttribute('x', f2(cx - w / 2)); eye.setAttribute('y', f2(cy - h / 2));
    eye.setAttribute('width', f2(w)); eye.setAttribute('height', f2(h)); eye.setAttribute('rx', f2(Math.min(w, h) / 2.3));
    glint.setAttribute('cx', f2(cx - w * 0.2)); glint.setAttribute('cy', f2(cy - h * 0.24)); glint.setAttribute('r', h > 5 ? '1.6' : '0');
    const lidAmt = side < 0 ? Math.min(0.92, M.lid + 0.8 * smooth(bo.gad.scope)) : M.lid;
    const top = cy - h / 2 - 12, line = cy - h / 2 + lidAmt * h;
    lid.setAttribute('x', f2(cx - w)); lid.setAttribute('width', f2(w * 2)); lid.setAttribute('y', f2(top)); lid.setAttribute('height', f2(Math.max(0, line - top)));
    lid.setAttribute('transform', `rotate(${f2((side < 0 ? 1 : -1) * M.slope * 24)} ${f2(cx)} ${f2(cy - h / 2)})`);
    const ry = h * 0.55 + 0.5;
    low.setAttribute('cx', f2(cx)); low.setAttribute('rx', f2(w * 0.95)); low.setAttribute('ry', f2(ry));
    low.setAttribute('cy', f2(cy + h / 2 - M.low * h * 0.75 + ry));
  });
  const mx = lx * 0.5 + 1.2 * amt, my = -10.2 + ly * 0.3, shape = bo.talking ? 'talk' : (T.mouth || 'none');
  if (shape === 'talk' || shape === 'o') {
    B.mouth.style.display = 'none'; B.mouthO.style.display = '';
    B.mouthO.setAttribute('cx', f2(mx)); B.mouthO.setAttribute('cy', f2(my));
    if (shape === 'talk') { B.mouthO.setAttribute('class', 'mouth open'); B.mouthO.setAttribute('rx', '3.4'); B.mouthO.setAttribute('ry', f2(0.7 + 2.3 * Math.abs(Math.sin(t / 80) * Math.cos(t / 190)))); }
    else { B.mouthO.setAttribute('class', 'mouth'); B.mouthO.setAttribute('rx', '2.1'); B.mouthO.setAttribute('ry', '2.5'); }
  } else {
    B.mouthO.style.display = 'none';
    B.mouth.style.display = shape === 'none' ? 'none' : '';
    const d = {
      smile: `M${f2(mx - 5)} ${f2(my - 1.2)}Q${f2(mx)} ${f2(my + 3.4)} ${f2(mx + 5)} ${f2(my - 1.2)}`,
      frown: `M${f2(mx - 4.5)} ${f2(my + 1.6)}Q${f2(mx)} ${f2(my - 2.4)} ${f2(mx + 4.5)} ${f2(my + 1.6)}`,
      flat: `M${f2(mx - 4)} ${f2(my)}H${f2(mx + 4)}`,
      squiggle: `M${f2(mx - 5)} ${f2(my)}q1.7-1.6 3.3 0t3.3 0t3.3 0`,
    }[shape];
    if (d) B.mouth.setAttribute('d', d);
  }
  const co = f2(M.cheeks * 0.6);
  B.cheekL.setAttribute('opacity', co); B.cheekR.setAttribute('opacity', co);
  B.cheekL.setAttribute('x', f2(-20 + lx * 0.4 + 1.4 * amt)); B.cheekR.setAttribute('x', f2(15 + lx * 0.4));
}

/* ---------- the fixit beam, sparks, drips, notes ---------- */
const beam = el('line', { class: 'weld-beam', filter: 'url(#beamGlow)' }, fxLayer);
const weldGlow = el('circle', { r: 7, fill: 'url(#weldGrad)' }, fxLayer);
beam.style.display = 'none'; weldGlow.style.display = 'none';
const parts = [];
function startWeld(p, soft) {
  sfx.loop('weld');
  bo.welding = { x: p.x, y: p.y, soft: !!soft };
  beam.style.display = ''; beam.style.stroke = soft ? '#aee3ff' : ''; beam.style.strokeDasharray = soft ? '3 4' : '';
  weldGlow.style.display = soft ? 'none' : ''; weldGlow.setAttribute('cx', p.x); weldGlow.setAttribute('cy', p.y);
}
function stopWeld() { sfx.stop('weld'); bo.welding = null; beam.style.display = 'none'; weldGlow.style.display = 'none'; }
function updateWeld() {
  const tip = toolTip(), w = bo.welding;
  beam.setAttribute('x1', tip.x.toFixed(1)); beam.setAttribute('y1', tip.y.toFixed(1));
  beam.setAttribute('x2', w.x.toFixed(1)); beam.setAttribute('y2', w.y.toFixed(1));
  beam.setAttribute('opacity', RM.matches || w.soft ? '0.85' : rand(0.45, 1).toFixed(2));
  if (w.soft) return;
  weldGlow.setAttribute('r', (RM.matches ? 7 : rand(5, 9.5)).toFixed(1));
  if (!RM.matches) { spark(w.x + rand(-3, 3), w.y + rand(-3, 3)); if (Math.random() < 0.6) spark(w.x, w.y); }
}
function spark(x, y) {
  if (parts.length > 120) return;
  const a = rand(-Math.PI * 0.95, -Math.PI * 0.05), sp = rand(40, 130);
  parts.push({ kind: 'line', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 320, life: rand(0.25, 0.6), age: 0, floor: GROUND + 20, node: el('line', { class: 'spark' }, fxLayer) });
}
function puff(x, y, n, cls, floorY) {
  if (RM.matches) return;
  for (let k = 0; k < n; k++) {
    parts.push({ kind: 'dot', x: x + rand(-4, 4), y: y + rand(-3, 3), vx: rand(-22, 22), vy: rand(-26, 6), g: 90, life: rand(0.5, 1.1), age: 0, floor: floorY || GROUND + 20, node: el('circle', { class: cls || 'dustfx', r: rand(0.8, 1.8).toFixed(1) }, fxLayer) });
  }
}
function splashAt(x, y) { if (RM.matches) return; for (let k = 0; k < 3; k++) parts.push({ kind: 'dot', x, y, vx: rand(-30, 30), vy: rand(-45, -15), g: 260, life: rand(0.25, 0.45), age: 0, floor: y + 6, node: el('circle', { class: 'splash', r: rand(0.8, 1.4).toFixed(1) }, fxLayer) }); }
function pour(x, y) { parts.push({ kind: 'dot', x: x + rand(-1, 1), y, vx: rand(-6, 6), vy: rand(10, 30), g: 420, life: 1, age: 0, floor: 344, node: el('circle', { class: 'waterfx', r: rand(1, 1.6).toFixed(1) }, fxLayer) }); }
function spawnDrip() {
  parts.push({ kind: 'drip', x: JOINT.x + rand(-1, 1), y: JOINT.y + 2, vx: 0, vy: 30, g: 620, life: 4, age: 0, node: el('ellipse', { class: 'drip', rx: 1.6, ry: 2.5 }, fxLayer) });
}
function spawnNote() {
  const t = el('text', { class: 'c-note' }, fxLayer);
  t.textContent = Math.random() < 0.5 ? '\u266A' : '\u266B';
  parts.push({ kind: 'note', x: 462 + rand(-6, 8), y: 386, vx: rand(5, 14), vy: -rand(16, 26), g: 0, life: rand(1.8, 2.8), age: 0, wob: rand(0, 6), node: t });
}
function dropLetter() {
  parts.push({ kind: 'letter', x: 74, y: 352, vx: rand(4, 10), vy: 20, g: 280, life: 3, age: 0, rot: 0, node: el('rect', { class: 'c-letter', width: 16, height: 10, rx: 1 }, fxLayer) });
}
function updateParticles(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.age += dt;
    const px = p.x, py = p.y;
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.kind === 'drip') {
      const surface = 469 - 23 * clamp(apt.bucket, 0, 1);
      if (p.y >= surface) {
        p.node.remove(); parts.splice(i, 1);
        if (apt.bucket < 1) apt.bucket = Math.min(1, apt.bucket + 0.012);
        else { apt.puddle = Math.min(1, apt.puddle + 0.018); renderPuddle(); splashAt(777 + rand(-10, 10), 452); }
        renderBucket(); splashAt(p.x, surface); sfx.play('drip', 250);
        continue;
      }
      p.node.setAttribute('cx', p.x.toFixed(1)); p.node.setAttribute('cy', p.y.toFixed(1));
      continue;
    }
    if (p.kind === 'letter') {
      p.rot += dt * 260;
      if (p.y >= 478) { p.node.remove(); parts.splice(i, 1); apt.mail = Math.min(7, apt.mail + 1); renderMail(); saveSoon(); continue; }
      p.node.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)} 8 5)`);
      continue;
    }
    if (p.age >= p.life || (p.floor && p.y > p.floor)) { p.node.remove(); parts.splice(i, 1); continue; }
    const o = ((1 - p.age / p.life) * (p.op || 1)).toFixed(2);
    if (p.kind === 'line') { p.node.setAttribute('x1', px.toFixed(1)); p.node.setAttribute('y1', py.toFixed(1)); p.node.setAttribute('x2', p.x.toFixed(1)); p.node.setAttribute('y2', p.y.toFixed(1)); }
    else if (p.kind === 'note') { p.node.setAttribute('x', (p.x + Math.sin(p.age * 4 + p.wob) * 3).toFixed(1)); p.node.setAttribute('y', p.y.toFixed(1)); }
    else { p.node.setAttribute('cx', p.x.toFixed(1)); p.node.setAttribute('cy', p.y.toFixed(1)); }
    p.node.setAttribute('opacity', o);
  }
}

/* ================= speech bubble, status line, captions ================= */
const clip = { on: false };
const cam = { on: false, x: 480, vbw: 960, zoom: 1, zoomGoal: 1, focus: 'bo', fx: 220, fy: 270, zoomed: false };
// the camera: follows Bo on narrow screens, and can zoom in on a moment (the tour uses this)
function camZoom(z, focus) { cam.zoomGoal = Math.max(1, z || 1); cam.focus = focus || 'bo'; }
function camTick(dt) {
  cam.zoom += (cam.zoomGoal - cam.zoom) * (1 - Math.pow(0.18, dt));
  if (Math.abs(cam.zoom - cam.zoomGoal) < 0.002) cam.zoom = cam.zoomGoal;
  const zooming = cam.zoom > 1.002;
  if (!cam.on && !zooming) { if (cam.zoomed) { svg.setAttribute('viewBox', `${WX0} 0 ${WW} 540`); cam.zoomed = false; } return; }
  if (!cam.on && !cam.zoomed) { cam.fx = WX0 + WW / 2; cam.fy = 270; }
  const baseW = cam.on ? cam.vbw : WW, z = Math.min(cam.zoom, Math.max(1, baseW / 300));
  const w = baseW / z, h = 540 / z;
  const tx = cam.focus === 'bo' ? bo.x : cam.focus.x, ty = cam.focus === 'bo' ? rootY() - 78 : cam.focus.y;
  const k = 1 - Math.pow(0.12, dt);
  cam.fx += (tx - cam.fx) * k; cam.fy += (ty - cam.fy) * k; cam.x = cam.fx;
  const x0 = clamp(cam.fx - w / 2, WX0, WX1 - w), y0 = clamp(cam.fy - h / 2, 0, 540 - h);
  svg.setAttribute('viewBox', `${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
  cam.zoomed = zooming;
}
function stageXY(wx, wy) {
  const m = svg.getScreenCTM(); if (!m) return null;
  const p = new DOMPoint(wx, wy).matrixTransform(m), r = stage.getBoundingClientRect();
  return { x: p.x - r.left, y: p.y - r.top, w: r.width, h: r.height };
}
function placeOverlays() {
  if (clip.on || appwin.hidden) return;
  const showB = bubble.classList.contains('show'), showL = logline.classList.contains('show');
  if (!showB && !showL) return;
  const a = stageXY(bo.x, rootY() + (-148 + bo.pose.sit * 9) * BS);
  if (!a) return;
  if (showB && !bubbleHeld) placeAt(bubble, a, 8, 0.28);
  if (showL && !logHeld) placeAt(logline, a, 6, 0);
}
function placeAt(node, a, gap, lean) {
  const w = node.offsetWidth, h = node.offsetHeight;
  const left = clamp(a.x - w * lean, w / 2 + 8, Math.max(w / 2 + 8, a.w - w / 2 - 8));
  node.style.left = left.toFixed(1) + 'px';
  node.style.top = clamp(a.y - gap, h + 8, Math.max(h + 8, a.h - 8)).toFixed(1) + 'px';
  node.style.setProperty('--tail', clamp(a.x - (left - w / 2), 14, w - 14).toFixed(1) + 'px');
}
let bubbleTimer = 0, bubbleHeld = false, subHeld = false, logHeld = false, touchHold = null;
const classSub = $('#classSub'), classSubText = $('#classSubText');
const subMode = () => cls.on && !clip.on && !tour.on;
function showThinking() {
  clearTimeout(bubbleTimer);
  if (subMode()) { classSubText.textContent = ''; classSub.classList.add('thinking'); classSub.hidden = false; return; }
  bubbleText.textContent = ''; bubble.classList.add('show', 'thinking'); logline.classList.remove('show');
  if (clip.on) { capBoText.textContent = ''; capBo.classList.remove('is-log'); capBo.classList.add('thinking'); }
}
function setBubbleText(t) {
  clearTimeout(bubbleTimer);
  if (!wordsShown()) { bubble.classList.remove('show', 'thinking'); classSub.hidden = true; if (clip.on) capBoText.textContent = ''; return; }
  if (subMode()) { bubble.classList.remove('show', 'thinking'); classSub.classList.remove('thinking'); classSubText.textContent = t; classSub.hidden = false; return; }
  bubble.classList.remove('thinking'); bubble.classList.add('show'); bubbleText.textContent = t; logline.classList.remove('show');
  if (clip.on) { capBo.classList.remove('thinking', 'is-log'); capBoText.textContent = t; }
}
function hideBubbleLater(ms) { clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => { if (!bubbleHeld && !subHeld) hideBubbleNow(); }, ms); }
function hideBubbleNow() {
  clearTimeout(bubbleTimer); bubble.classList.remove('show', 'thinking', 'held'); capBo.classList.remove('thinking');
  classSub.hidden = true; classSub.classList.remove('thinking', 'held'); bubbleHeld = false; subHeld = false;
}
// resting the mouse on something Bo said keeps it open; moving off lets it close after a beat
const LET_GO = 1500;
function holdBubble(on) {
  bubbleHeld = on; bubble.classList.toggle('held', on);
  if (on) clearTimeout(bubbleTimer);
  else if (bubble.classList.contains('show') && !bubble.classList.contains('thinking') && !bo.talking) hideBubbleLater(LET_GO);
}
function holdSub(on) {
  subHeld = on; classSub.classList.toggle('held', on);
  if (on) clearTimeout(bubbleTimer);
  else if (!classSub.hidden && !classSub.classList.contains('thinking') && !bo.talking) hideBubbleLater(LET_GO);
}
function holdLog(on) {
  logHeld = on; logline.classList.toggle('held', on);
  if (on) clearTimeout(logTimer);
  else if (logline.classList.contains('show')) { clearTimeout(logTimer); logTimer = setTimeout(() => { if (!logHeld) logline.classList.remove('show'); }, LET_GO); }
}
[[bubble, holdBubble], [classSub, holdSub], [logline, holdLog]].forEach(([node, hold]) => {
  node.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hold(true); });
  node.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hold(false); });
  // on a touch screen, a tap holds it open until the next tap somewhere else
  node.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { hold(true); touchHold = [node, hold]; } });
});
document.addEventListener('pointerdown', (e) => {
  if (!touchHold || e.pointerType === 'mouse' || touchHold[0].contains(e.target)) return;
  const [, hold] = touchHold; touchHold = null; hold(false);
}, true);
const readTime = (t) => clamp(2200 + (t || '').length * 62, 3200, 11000);
const readPause = (t) => clamp(900 + (t || '').length * 32, 1600, 4200) * (tour.on ? 1.3 : 1);
function baseSpeed() { return currentTod() === 'night' ? 54 : 70; }
let logTimer = 0, lastLog = -1e9;
function log(text, force) {
  if (!text) return;
  if (!force && (bubble.classList.contains('show') || now() - lastLog < 7000)) return;
  if (force && bubble.classList.contains('show') && !bubble.classList.contains('thinking') && !bo.talking && !bubbleHeld) hideBubbleNow();
  lastLog = now();
  if (clip.on) {
    if (!bubble.classList.contains('show')) { capYou.textContent = ''; capBo.classList.remove('thinking'); capBo.classList.add('is-log'); capBoText.textContent = text; }
    return;
  }
  logline.textContent = text; logline.classList.add('show');
  clearTimeout(logTimer); logTimer = setTimeout(() => { if (!logHeld) logline.classList.remove('show'); }, clamp(2600 + text.length * 48, 3500, 7500));
}
function announce(t) { srLive.textContent = ''; setTimeout(() => { srLive.textContent = 'Bo: ' + t; }, 40); }
let sayGen = 0;
async function typeOut(text) {
  const prev = bo.mood, gen = ++sayGen;
  setExpr('talk'); bo.talking = true; antenna('steady');
  if (RM.matches) setBubbleText(text);
  else {
    setBubbleText('');
    const t0 = now(); let n = 0;
    while (n < text.length) { await sleep(28); if (gen !== sayGen) return prev; n = Math.min(text.length, Math.ceil((now() - t0) / 1000 * (tour.on ? 30 : 38))); setBubbleText(text.slice(0, n)); if (/[aeiouy]/i.test(text[n - 1] || '')) sfx.play('blip', 70); }
  }
  bo.talking = false;
  return prev;
}
async function say(text, hold) {
  if (!text) return;
  if (clip.on) capYou.textContent = '';
  const gen = sayGen + 1;
  const spoken = speak(text);
  const prev = await typeOut(text);
  if (gen !== sayGen) return;
  announce(text);
  if (voiceActive()) { setExpr('talk'); bo.talking = true; await spoken; bo.talking = false; if (gen !== sayGen) return; }
  setExpr(['talk', 'think', 'off', 'boot', 'wide', 'surprised'].includes(prev) ? 'normal' : prev); antenna('slow');
  hideBubbleLater((voiceActive() ? Math.min(hold || readTime(text), 2600) : (hold || readTime(text))) * (tour.on ? 1.4 : 1));
}
// what an activity says: out loud when you asked for it, as a quiet status line when Bo did it on its own
function report(line, req) { if (req === true) return say(line); log(line, !!req); return Promise.resolve(); }
function share(line, req) { if (req) return say(line); log(line); return Promise.resolve(); }
function setDoing(short, long) {
  bo.doing = long || short.toLowerCase();
  statusText.textContent = short;
  statusBox.classList.toggle('nap', bo.mode === 'nap');
}

/* ================= autonomous behavior ================= */
let activity = null, forceNext = null;
function makeTok() {
  const fns = new Set();
  return {
    c: false,
    on(f) { fns.add(f); return () => fns.delete(f); },
    cancel() { if (this.c) return; this.c = true; const list = Array.from(fns); fns.clear(); list.forEach((f) => f()); },
  };
}
function wait(ms, tok) {
  return new Promise((res) => {
    let off = null;
    const timer = setTimeout(done, ms);
    function done() { clearTimeout(timer); if (off) off(); res(); }
    if (tok) { if (tok.c) { done(); return; } off = tok.on(done); }
  });
}
async function walkTo(x, tok) {
  x = clamp(x, ROAM[0], ROAM[1]);
  if (tok && tok.c) return;
  if (bo.pose.perch > 3 || bo.pose.sit > 0.3) {
    bo.goal.perch = 0; bo.goal.sit = 0; setBlanket(false);
    await wait(420, tok); if (tok && tok.c) return;
  }
  if (Math.abs(x - bo.x) < 1.5) return;
  bo.goal.sit = 0; bo.goal.perch = 0; bo.dir = Math.sign(x - bo.x); bo.goal.turn = bo.dir; bo.goal.ex = 2.2; bo.goal.ey = 0; bo.goal.head = 0;
  await new Promise((res) => {
    let off = null;
    const done = () => { if (off) off(); res(); };
    bo.targetX = x; bo.onArrive = done;
    if (tok) off = tok.on(() => { if (bo.onArrive === done) { bo.targetX = null; bo.onArrive = null; } res(); });
  });
}
function interrupt() {
  bo.claim = null;
  if (activity) { const a = activity; activity = null; a.cancel(); }
  bo.targetX = null; bo.onArrive = null; stopWeld(); resetArms();
  if (bo.bookRef) { bo.bookRef.g.style.display = ''; bo.bookRef.out = false; bo.bookRef = null; }
  holdItem(null); closeFridge(); gadget('lens', false); gadget('scope', false);
  if (typeof kit !== 'undefined' && (kit.carry || kit.faucet || kit.fridgeOpen || kit.cabOpen)) { kit.carry = null; kit.faucet = false; kit.fridgeOpen = false; kit.cabOpen = false; renderKitchen(); }
  if (apt.desk) { apt.desk = false; renderLighting(); }
}
function weighted(list) {
  const items = list.filter((x) => x[1] > 0);
  const total = items.reduce((s, x) => s + x[1], 0);
  let r = Math.random() * total;
  for (const [f, w] of items) { r -= w; if (r <= 0) return f; }
  return items.length ? items[0][0] : actWander;
}
function needs() {
  const tod = currentTod(), dark = isDark(), list = [];
  if (apt.leak) list.push([actFixLeak, apt.bucket > 0.6 ? 9 : 5]);
  if (apt.puddle > 0.12) list.push([actMop, 5]);
  if (!apt.leak && apt.bucket > 0.55) list.push([actEmptyBucket, 3]);
  if (apt.bulbDead && dark) list.push([actFixLight, 7]);
  if (apt.lightFault && apt.ceiling && !apt.bulbDead) list.push([actFixLight, 6]);
  if (dark && !apt.ceiling && !apt.lamp && !apt.bulbDead && canAuto('ceiling')) list.push([(tok) => actLights(tok, true), 7]);
  if (Math.abs(apt.tilt) > 2) list.push([actStraighten, 5]);
  const cr = apt.cracks.findIndex((s) => s === 1);
  if (cr >= 0) list.push([(tok) => actPatchCrack(tok, false, cr), 4]);
  if (apt.mail > 0) list.push([actGetMail, 2 + apt.mail * 0.6]);
  if (apt.plant < 0.5) list.push([actWater, 4]); else if (apt.plant < 0.7) list.push([actWater, 1.5]);
  if (apt.dust.length) list.push([actSweep, 1.5 + apt.dust.length * 0.5]);
  if (apt.knocked) list.push([actPickupFigurine, 4]);
  if (apt.catBowl === 0 && Date.now() - (apt.catFedAt || 0) > 120000) list.push([actFeedCat, 3.5]);
  if (tod === 'morning' && !apt.blinds && canAuto('blinds')) list.push([(tok) => actBlinds(tok, true), 3]);
  if (tod === 'night' && apt.blinds && canAuto('blinds')) list.push([(tok) => actBlinds(tok, false), 1.2]);
  return list;
}
function chooseActivity() {
  if (forceNext) { const f = forceNext; forceNext = null; return f; }
  if (bo.energy < 0.1) return actRunDry;
  if (notesAll().some((n) => !n.pinned)) return actPin;
  const tod = currentTod(), late = isDark();
  const n = needs();
  if (n.length && Math.random() < { morning: 0.85, day: 0.72, evening: 0.55, night: 0.45 }[tod]) return weighted(n);
  return weighted([
    [actRead, late ? 5 : 3.5], [actTinker, late ? 1.5 : 3.5], [actWindow, 2], [actSit, late ? 2.5 : 1.2], [actInspect, 2.2],
    [actPeekFridge, 0.8], [actInspectSpices, 0.6], [actWashUp, kit.serve ? 2 : 0.3], [actPetCat, 1.1], [actStudyCat, 0.9],
    [(tok) => actRadio(tok, !apt.radio), canAuto('radio') ? 1.2 : 0], [actWander, 1.5], [actRest, tod === 'night' ? 1.5 : 0.4], [actClock, 0.4],
  ]);
}
async function lifeLoop() {
  for (;;) {
    if (bo.mode !== 'free' || tour.on) { await sleep(300); continue; }
    const tok = makeTok(); activity = tok;
    bo.hurry = !!forceNext;
    try { await chooseActivity()(tok); } catch (err) { console.error(err); }
    bo.hurry = false; bo.claim = null;
    if (activity === tok) activity = null;
    await sleep(tok.c ? 150 : rand(600, 1400));
  }
}
function requestAction(fn) {
  forceNext = fn;
  if (busy) return; // runs as soon as Bo finishes talking
  if (bo.mode === 'social') { clearTimeout(listenTimer); bo.mode = 'free'; restExpr(); antenna('slow'); }
  if (bo.mode === 'free') interrupt();
}

/* ---------- shared moves ---------- */
async function beamAt(tx, ty, dur, tok, soft) {
  face(tx); setTool('torch'); setExpr('squint'); aimBeam(tx, ty);
  await wait(420, tok); if (tok.c) return false;
  startWeld({ x: tx, y: ty }, soft);
  await wait(dur, tok); stopWeld();
  if (tok.c) return false;
  resetArms(); return true;
}
async function approach(standX, objX, objY, tok, mood) {
  await walkTo(standX, tok); if (tok.c) return false;
  face(objX); lookAt(objX, objY); if (mood) setExpr(mood);
  await wait(320, tok);
  return !tok.c;
}
const WALLSIDE = (x) => (x < 300 ? 'by the door' : x < 520 ? 'over the armchair' : x < 760 ? 'by the window' : 'over the bench');

/* ---------- repairs ---------- */
async function actFixLeak(tok, req) {
  setDoing('Fixing the leak', 'fixing the dripping pipe joint over the bucket');
  if (!(await approach(744, JOINT.x, JOINT.y, tok, 'lookup'))) return;
  await wait(250, tok); if (tok.c) return;
  if (!apt.leak) {
    if (apt.bucket > 0.3) { await emptyBucket(tok); return; }
    setExpr('content'); await report(pick(["Joint's holding. For now.", "It's dry. I checked twice."]), req); restExpr(); return;
  }
  if (!(await beamAt(JOINT.x, JOINT.y, rand(2400, 3200), tok))) return;
  apt.leak = false; apt.fixes++; renderLeak(); saveSoon();
  setExpr('happy'); report(pick(['Sealed. For now.', 'Leak stopped.', 'That joint again. Holding.']), req);
  await wait(1000, tok); if (tok.c) return;
  if (apt.bucket > 0.4) await emptyBucket(tok);
  if (!tok.c) restExpr();
}
async function emptyBucket(tok) {
  setDoing('Emptying the bucket', 'emptying the drip bucket');
  if (!(await approach(750, 777, 456, tok))) return;
  bo.goal.sit = 0.55; reachR(777, 452, 60);
  await wait(600, tok); if (tok.c) return;
  const from = apt.bucket, t0 = now();
  while (now() - t0 < 1100 && !tok.c) { apt.bucket = from * (1 - (now() - t0) / 1100); renderBucket(); if (Math.random() < 0.4) splashAt(777, 446); await wait(60, tok); }
  apt.bucket = 0; renderBucket(); resetArms(); bo.goal.sit = 0; saveSoon();
  if (!tok.c) { flashMood('content', 1200); log('Bucket emptied.'); }
}
const actEmptyBucket = (tok) => emptyBucket(tok);
async function actMop(tok) {
  setDoing('Mopping up', 'mopping up the puddle under the leak');
  if (!(await approach(736, 777, 488, tok))) return;
  setTool('broom'); setExpr('squint');
  for (let k = 0; k < 8 && !tok.c; k++) {
    bo.goal.armR = normAngle(-42 + (k % 2 ? 14 : -14), bo.pose.armR); bo.goal.extR = 6;
    await wait(230, tok);
    apt.puddle = Math.max(0, apt.puddle - 0.14); renderPuddle();
    if (k % 2) splashAt(762 + rand(0, 30), 486);
  }
  resetArms(); if (tok.c) return;
  apt.puddle = 0; renderPuddle(); saveSoon(); flashMood('happy', 1200); log("Floor's dry.");
}
async function actFixLight(tok, req) {
  const dead = apt.bulbDead;
  setDoing(dead ? 'Fixing the dead bulb' : 'Fixing the light', dead ? 'bringing the dead ceiling bulb back' : 'fixing the flickering ceiling bulb');
  if (!(await approach(440, BULB.x, BULB.y, tok, 'lookup'))) return;
  await wait(200, tok); if (tok.c) return;
  if (!apt.lightFault && !apt.bulbDead) { setExpr('content'); await report("Bulb's fine. It's just a bulb.", req); restExpr(); return; }
  if (!(await beamAt(BULB.x, BULB.y + 6, rand(1800, 2400), tok))) return;
  apt.lightFault = false; apt.bulbDead = false; apt.fixes++;
  if (isDark() && canAuto('ceiling')) apt.ceiling = true;
  renderLighting(); saveSoon(); setExpr('happy');
  report(pick(['Bulb sorted.', 'Steady light. Better.', 'Fixed. It hums less.']), req);
  await wait(900, tok); if (!tok.c) restExpr();
}
async function actPatchCrack(tok, req, idx) {
  const i = idx != null && apt.cracks[idx] === 1 ? idx : apt.cracks.findIndex((s) => s === 1);
  if (i < 0) { if (req) { faceFront(); setExpr('content'); await report('Walls are holding. Mostly plates at this point.', req); restExpr(); } return; }
  const c = CRACKS[i];
  setDoing('Patching the wall', `patching a crack in the plaster ${WALLSIDE(c.x)}`);
  if (!(await approach(c.x - 38, c.x, c.y, tok, 'curious'))) return;
  await useLens(tok, 1100, c.x, c.y); if (tok.c) return;
  if (!(await beamAt(c.x, c.y, rand(2000, 2800), tok))) return;
  apt.cracks[i] = 2; apt.fixes++; renderCracks(); freshPlate(i); saveSoon();
  setExpr('happy'); report(pick(['Patched.', 'Plate on. Holding.', 'That wall is more plate than plaster.']), req);
  await wait(900, tok); if (!tok.c) restExpr();
}
let pictureNag = false;
async function actStraighten(tok, req) {
  setDoing('Straightening the picture', 'straightening the crooked picture over the armchair');
  if (!(await approach(314, 343, 201, tok, pictureNag ? 'annoyed' : 'lookup'))) return;
  await wait(250, tok); if (tok.c) return;
  if (Math.abs(apt.tilt) < 1) { setExpr('content'); await report('Already straight. I check it a lot.', req); restExpr(); return; }
  face(364); setTool('torch'); aimBeam(364, 226);
  await wait(380, tok); if (tok.c) return;
  startWeld({ x: 364, y: 226 }, true);
  await wait(650, tok); apt.tilt = 0; saveSoon();
  await wait(700, tok); stopWeld(); resetArms(); if (tok.c) return;
  setExpr(pictureNag ? 'annoyed' : 'happy');
  report(pictureNag ? pick(['Level again. Please stop.', "There. Don't.", 'Straight. I saw who did it.']) : pick(['Better.', 'Level. I can rest now.', 'There. Straight.']), pictureNag ? 'chat' : req);
  pictureNag = false;
  await wait(1100, tok); if (!tok.c) restExpr();
}

/* ---------- chores ---------- */
const MAIL_LINES = [
  'Coupon: ten percent off lubricant. Filing that.',
  'Postcard from someone at a lake. Nobody I know. Nice lake.',
  'Notice from the building: the pipes are fine. The pipes are not fine.',
  'Seed catalog. The plant would have opinions.',
  'Pizza menu. Not my kind of fuel.',
  "Addressed to Current Resident. That's me.",
  "Electric bill. I'm most of it.",
  'Flyer for a lost cat. Keeping an eye out.',
];
async function actGetMail(tok, req) {
  if (!apt.mail) {
    if (req) { setDoing('Checking the mail', 'checking the mail slot'); if (!(await approach(108, 82, 353, tok, 'curious'))) return; await wait(400, tok); setExpr('sad'); await report('Nothing today. Not even coupons.', req); restExpr(); }
    return;
  }
  setDoing('Getting the mail', 'picking up the mail that came through the door slot');
  if (!(await approach(108, 84, 484, tok, 'curious'))) return;
  bo.goal.sit = 0.7; reachR(84, 484, 40); bo.goal.ey = 3;
  await wait(700, tok); if (tok.c) return;
  apt.mail = Math.max(0, apt.mail - 1); renderMail(); holdItem('letter'); saveSoon();
  bo.goal.sit = 0; faceFront();
  bo.goal.armR = normAngle(54, bo.pose.armR); bo.goal.extR = 0; bo.goal.armL = normAngle(-40, bo.pose.armL);
  bo.goal.ey = 2.2; setExpr('read'); gadget('lens', true);
  antenna('fast'); await wait(1300, tok); antenna('slow'); gadget('lens', false); if (tok.c) return;
  setExpr(pick(['curious', 'content', 'think']));
  await share(pick(MAIL_LINES), req);
  await wait(1500, tok); if (tok.c) return;
  resetArmL();
  if (!(await approach(120, 152, 424, tok))) return;
  reachR(152, 424, 40); await wait(450, tok);
  holdItem(null); resetArms(); restExpr();
}
async function actWater(tok, req) {
  setDoing('Watering the plant', 'watering the plant on top of the snack fridge');
  if (!(await approach(688, 718, 330, tok, 'curious'))) return;
  await useLens(tok, 900, 718, 320); if (tok.c) return;
  setTool('can'); reachR(712, 318, 120);
  await wait(700, tok); if (tok.c) return;
  setExpr('content');
  const t0 = now(), from = apt.plant;
  while (now() - t0 < 2200 && !tok.c) {
    const s = toolTip(26, 15); if (!RM.matches) { pour(s.x, s.y); pour(s.x, s.y); }
    apt.plant = from + (1 - from) * clamp((now() - t0) / 2200, 0, 1); renderPlant();
    await wait(90, tok);
  }
  resetArms(); if (tok.c) return;
  apt.plant = 1; renderPlant(); saveSoon();
  setExpr('happy'); report(pick(['Water in.', "That's better.", "Plant's happy. I'm told."]), req);
  await wait(900, tok); if (!tok.c) restExpr();
}
async function actSweep(tok, req) {
  if (!apt.dust.length) { if (req) { faceFront(); setExpr('content'); await report("Floor's clean. Suspiciously clean.", req); restExpr(); } return; }
  const d = apt.dust[0];
  setDoing('Sweeping', 'sweeping up dust');
  if (!(await approach(d.x - 34, d.x, 510, tok, 'annoyed'))) return;
  await useLens(tok, 800, d.x, 506); if (tok.c) return;
  setTool('broom'); setExpr('squint');
  for (let k = 0; k < 6 && !tok.c; k++) {
    bo.goal.armR = normAngle(-50 + (k % 2 ? 12 : -12), bo.pose.armR); bo.goal.extR = 4;
    await wait(220, tok);
    puff(d.x + rand(-6, 6), 506, 2, 'dustfx');
  }
  resetArms(); if (tok.c) return;
  apt.dust.shift(); renderDust(); saveSoon();
  flashMood('happy', 1200); report(pick(['Swept.', 'Dust relocated. Permanently.', 'Clean floor.']), req);
}
async function actLights(tok, on, req) {
  setDoing(on ? 'Turning on the lights' : 'Turning off the lights', on ? 'turning on the ceiling light' : 'turning off the ceiling light');
  if (!(await approach(172, 147, 311, tok, 'lookup'))) return;
  reachR(147, 311, 130);
  await wait(650, tok); if (tok.c) return;
  apt.ceiling = on; renderLighting(); saveSoon(); resetArms();
  if (req) override.ceiling = Date.now() + TEN_MIN;
  flashMood(on ? 'happy' : 'content', 1200);
  report(on ? pick(['Lights.', 'Better. I can see the cracks now.']) : pick(['Lights off.', 'Dark it is.']), req);
}
async function actLamp(tok, on, req) {
  setDoing(on ? 'Turning on the lamp' : 'Turning off the lamp', on ? 'turning on the floor lamp' : 'turning off the floor lamp');
  if (!(await approach(392, 419, 320, tok, 'lookup'))) return;
  reachR(419, 322, 130);
  await wait(600, tok); if (tok.c) return;
  apt.lamp = on; renderLighting(); saveSoon(); resetArms();
  if (req) override.lamp = Date.now() + TEN_MIN;
  flashMood('content', 1200);
  report(on ? 'Lamp on.' : 'Lamp off.', req);
}
async function actBlinds(tok, open, req) {
  setDoing(open ? 'Opening the blinds' : 'Closing the blinds', open ? 'opening the window blinds' : 'closing the window blinds');
  if (!(await approach(628, 652, 255, tok, 'lookup'))) return;
  reachR(652, 256, 150);
  await wait(650, tok); if (tok.c) return;
  bo.goal.extR = Math.max(0, bo.goal.extR - 10);
  apt.blinds = open; renderLighting(); saveSoon();
  await wait(300, tok); resetArms();
  if (req) override.blinds = Date.now() + TEN_MIN;
  flashMood(open ? 'happy' : 'content', 1200);
  report(open ? pick(['Blinds up.', 'Let the light in.']) : pick(['Blinds down.', 'Privacy.']), req);
}
async function actRadio(tok, on, req) {
  setDoing(on ? 'Turning on the radio' : 'Turning off the radio', on ? 'turning on the radio' : 'turning off the radio');
  if (!(await approach(510, 478, 404, tok, 'curious'))) return;
  reachR(481, 404, 60);
  await wait(600, tok); if (tok.c) return;
  apt.radio = on; renderLighting(); saveSoon(); resetArms();
  if (req) override.radio = Date.now() + TEN_MIN;
  flashMood(on ? 'happy' : 'content', 1400);
  report(on ? pick(['Radio on.', 'Music. Good input.']) : pick(['Quiet for a bit.', 'Radio off.']), req);
}

/* ---------- the rest of Bo's day ---------- */
const FACTS = [
  "Octopuses have three hearts. I have zero and I'm doing fine.",
  'A day on Venus lasts longer than its year.',
  "Bananas count as berries. Strawberries don't.",
  'Wombats leave cube-shaped droppings. Nature likes geometry too.',
  'Sharks are older than trees.',
  'Lightning runs about five times hotter than the surface of the sun.',
  'A group of flamingos is called a flamboyance.',
  'The Eiffel Tower grows a few inches in summer heat. Metal expands. I relate.',
  'Honey can keep for decades if it stays sealed.',
  "Sea otters sometimes hold hands while they sleep so they don't drift apart.",
  "Your brain runs on about a fifth of your body's energy.",
];
async function actRead(tok, req) {
  const cand = books.filter((b) => (b.row === 1 || b.row === 2) && !b.out);
  const bk = pick(cand); if (!bk) return;
  setDoing('Picking a book', 'picking a book off the shelf');
  if (!(await approach(bk.x - 40, bk.x, bk.y, tok, 'curious'))) return;
  if (req || Math.random() < 0.5) { await useLens(tok, 900, bk.x, bk.y); if (tok.c) return; }
  reachR(bk.x, bk.y, 140);
  await wait(750, tok); if (tok.c) return;
  bk.out = true; bk.g.style.display = 'none'; bo.bookRef = bk; holdItem('book', bk.color); resetArmR();
  flashMood('happy', 900);
  await wait(300, tok); if (tok.c) return;
  if (isDark() && !apt.lamp && canAuto('lamp')) {
    if (!(await approach(392, 419, 320, tok, 'lookup'))) return;
    reachL(419, 322, 130);
    await wait(550, tok); if (tok.c) return;
    apt.lamp = true; renderLighting(); resetArmL();
    await wait(250, tok); if (tok.c) return;
  }
  bo.claim = 'chair'; catMakeRoom();
  await walkTo(343, tok); if (tok.c) return;
  faceFront();
  bo.goal.perch = 50; bo.goal.sit = 1;
  bo.goal.armR = normAngle(54, bo.pose.armR); bo.goal.extR = 0; bo.goal.armL = normAngle(-40, bo.pose.armL); bo.goal.extL = 0;
  bo.goal.ey = 2.4; setExpr('read');
  setDoing('Reading in the armchair', 'reading a book in the armchair');
  const dur = (isDark() ? rand(9000, 14000) : rand(7000, 11000)) * (req ? 0.6 : 1);
  const t0 = now(); let told = false;
  while (now() - t0 < dur && !tok.c) {
    await wait(2200, tok); if (tok.c) break;
    bo.goal.ex = bo.goal.ex > 0 ? -1.5 : 1.5; antenna('fast'); setTimeout(() => { if (bo.mode !== 'nap') antenna('slow'); }, 400);
    if (Math.random() < 0.3) flashMood(pick(['curious', 'content', 'think']), 1400, 'read');
    if (!told && (req || Math.random() < 0.4) && now() - t0 > dur * 0.4) { told = true; setExpr('happy'); await share(pick(FACTS), req); setExpr('read'); }
  }
  if (tok.c) return;
  resetArmL();
  if (!(await approach(bk.x - 40, bk.x, bk.y, tok))) return;
  reachR(bk.x, bk.y, 140);
  await wait(650, tok);
  bk.out = false; bk.g.style.display = ''; bo.bookRef = null; holdItem(null); resetArms(); restExpr();
}
async function actTinker(tok, req) {
  setDoing('Tinkering at the bench', 'building a little figurine at the workbench');
  if (!(await approach(836, 866, 380, tok, 'curious'))) return;
  if (isDark()) { apt.desk = true; renderLighting(); }
  const rounds = req ? 5 : 3 + Math.floor(rand(0, 3));
  for (let k = 0; k < rounds && !tok.c; k++) {
    if (k % 2 === 0) {
      setTool('torch'); setExpr('squint'); aimBeam(866, 386);
      await wait(350, tok); if (tok.c) break;
      startWeld({ x: 866, y: 386 }); await wait(700, tok); stopWeld();
    } else {
      setTool('wrench'); setExpr(pick(['curious', 'think'])); reachR(862, 386, 60);
      for (let j = 0; j < 3 && !tok.c; j++) { bo.goal.armR += 10; await wait(160, tok); bo.goal.armR -= 10; await wait(160, tok); }
    }
    if (tok.c) break;
    apt.project = Math.min(1, apt.project + rand(0.05, 0.09)); renderProject();
    if (apt.project >= 1) break;
  }
  stopWeld(); resetArms(); if (apt.desk) { apt.desk = false; renderLighting(); }
  if (tok.c) return;
  if (apt.project >= 1) {
    faceFront(); setExpr('happy'); apt.figurines++; apt.project = 0; renderFigurines(); renderProject(); saveSoon();
    await say(pick(['Done. That one goes on the shelf.', 'Finished another. The shelf is filling up.']));
  } else if (req) { setExpr('content'); await say(pick(['Getting there. The little one needs a head.', 'Progress. Slow, honest progress.'])); }
  saveSoon(); restExpr();
}
async function actWindow(tok, req) {
  setDoing('Looking out the window', 'looking out the window through its spyglass');
  if (req && !apt.blinds) { await actBlinds(tok, true, false); if (tok.c) return; }
  await walkTo(540, tok); if (tok.c) return;
  face(620); bo.goal.ex = 3; bo.goal.ey = -3; bo.goal.head = -8; setExpr('lookup');
  await wait(500, tok); if (tok.c) return;
  gadget('scope', true); setExpr('curious');
  await wait(rand(2800, 4200), tok);
  gadget('scope', false); if (tok.c) return;
  const lines = !apt.blinds ? ["Blinds are shut. The spyglass is not that good."] : {
    morning: ['Pigeon on the ledge across the street. Busy pigeon.', "Street's waking up. Bakery's open."],
    day: ['Someone across the way is watering their balcony plants.', 'Clouds heading east. Slowly.'],
    evening: ["Sky's going orange. Lights coming on across the street.", 'Somebody over there is cooking. Good idea.'],
    night: ['Moon is up. Craters look fine.', "City's still on. Most windows, anyway."],
  }[currentTod()];
  setExpr('content');
  if (req || Math.random() < 0.6) await report(pick(lines), req ? true : false);
  faceFront(); restExpr();
}
async function actInspect(tok) {
  const spots = [
    { x: 229, y: 128, stand: 250, lines: ['Second hand is keeping up.', 'Clock is right. I checked it against itself.'] },
    { x: 478, y: 404, stand: 510, lines: ['Dust in the radio dial. Charming dust.', 'Antenna is bent a little. Adds character.'] },
    { x: 343, y: 201, stand: 314, lines: ['Nice brushwork on those hills.', 'Tiny sun. Very committed.'] },
    { x: 718, y: 330, stand: 688, lines: ['New leaf coming in.', 'Soil is fine. Plant is fine. Everyone is fine.'] },
    { x: 866, y: 380, stand: 836, lines: ['That little one needs a head.', 'Weld seam could be neater. I will allow it.'] },
    { x: -448, y: 252, stand: -470, lines: ['Paprika. Also paprika.', 'Spices are in alphabetical order. Mostly.'] },
  ];
  const s = pick(spots);
  setDoing('Inspecting things', 'inspecting things around the apartment with its magnifier');
  if (!(await approach(s.stand, s.x, s.y, tok, 'curious'))) return;
  await useLens(tok, rand(1600, 2400), s.x, s.y); if (tok.c) return;
  if (Math.random() < 0.7) log(pick(s.lines));
  flashMood('content', 1200);
}
async function actSit(tok, req) {
  setDoing('Sitting in the armchair', 'sitting in the armchair');
  bo.claim = 'chair'; catMakeRoom();
  await walkTo(343, tok); if (tok.c) return;
  faceFront(); bo.goal.perch = 50; bo.goal.sit = 1; bo.goal.head = 3; setExpr('content');
  if (req) report(pick(['Sitting. Good chair.', "Chair's still warm. From the lamp."]), true);
  await wait(req ? 7000 : rand(7000, 12000), tok); if (tok.c) return;
  bo.goal.ey = -2; setExpr('half'); await wait(1400, tok); if (tok.c) return;
  restExpr();
}
async function actRest(tok, req) {
  setDoing('Resting on the dock', 'resting on the charging dock');
  await walkTo(588, tok); if (tok.c) return;
  faceFront(); bo.goal.perch = 30; bo.goal.sit = 1; bo.goal.head = 4; setExpr('half');
  if (req) report('Resting. Not tired. Just resting.', true);
  await wait(req ? 7000 : rand(6000, 10000), tok); if (tok.c) return;
  restExpr();
}
async function actWander(tok) {
  setDoing('Walking around', 'walking the room, checking on things');
  await walkTo(rand(ROAM[0] + 40, ROAM[1] - 40), tok); if (tok.c) return;
  bo.goal.turn = -1; bo.goal.ex = 2; setExpr('curious'); await wait(900, tok); if (tok.c) return;
  bo.goal.turn = 1; await wait(900, tok); if (tok.c) return;
  faceFront(); restExpr();
}
async function actClock(tok, req) {
  setDoing('Checking the clock', 'checking the wall clock');
  await walkTo(250, tok); if (tok.c) return;
  face(229); lookAt(229, 128); setExpr('lookup');
  await wait(900, tok); if (tok.c) return;
  setExpr('content');
  await report(req ? `${clockText()}. By the clock, anyway.` : `${clockText()}.`, req);
  restExpr();
}
async function actRunDry(tok) {
  faceFront(); setExpr('sad');
  await say('Running low. Heading to the dock.');
  await wait(1200, tok); if (tok.c) return;
  goNap();
}
