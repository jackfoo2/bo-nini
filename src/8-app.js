
/* ================= energy, naps, snacks ================= */
function renderGauge() {
  const e = bo.energy;
  energyBtn.style.setProperty('--e', e.toFixed(3));
  energyBtn.classList.toggle('low', e < 0.2); energyBtn.classList.toggle('napping', bo.mode === 'nap');
  if (typeof costRule !== 'undefined') renderCostUI();
  snackBar.style.setProperty('--e', e.toFixed(3)); snackBar.classList.toggle('low', e < 0.2);
}
function setEnergy(v) { bo.energy = clamp(v, 0, 1); renderGauge(); saveSoon(); }
let costRule = 'cloud';
const thinkingIsFree = () => costRule === 'local' || (brain.mode === 'live' && keyLive());
function drain(text) { if (thinkingIsFree()) return; setEnergy(bo.energy - (0.065 + Math.min(0.05, (text || '').length / 900))); }
function renderCostUI() {
  const free = thinkingIsFree();
  energyBtn.classList.toggle('free', free);
  $$('#costBtns button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cost === costRule)));
  $('#snackRule').textContent = costRule === 'local' ? 'Right now: local model. Thinking is free, so energy stays put.'
    : (brain.mode === 'live' && keyLive()) ? 'Right now: your own key pays for the thinking, so energy stays put.'
    : brain.mode === 'live' ? 'Right now: cloud thinking. Each reply costs energy.' : 'Right now: scripted lines, but they still cost energy so you can see how it works.';
}
function openFridge() { $('#fridgeDoor').classList.add('open'); setOp('gFridge', isDark() ? 0.5 : 0.18); }
function closeFridge() { $('#fridgeDoor').classList.remove('open'); setOp('gFridge', 0); }
function feedGlow() { B.intake.classList.add('fed'); setTimeout(() => B.intake.classList.remove('fed'), 850); }
async function goNap() {
  if (cls.on) endClass(true);
  interrupt(); bo.mode = 'napwalk';
  setDoing('Heading to the dock', 'walking to the charging dock to nap');
  await walkTo(588, makeTok());
  bo.mode = 'nap'; faceFront(); bo.goal.perch = 30; bo.goal.sit = 1; bo.goal.head = 6; setExpr('nap'); antenna('off'); setBlanket(true);
  setDoing('Napping on the dock', 'powered down on the charging dock, napping until it gets a snack');
  talkInput.placeholder = 'Out of energy. Give Bo a snack.';
  renderGauge(); renderLighting();
}
async function wake(line) {
  if (bo.mode !== 'nap') return;
  bo.mode = 'boot'; setExpr('boot'); antenna('slow'); setBlanket(false);
  await sleep(700);
  bo.goal.head = 0; flashMood('happy', 1600); talkInput.placeholder = 'Talk to Bo'; renderGauge(); renderLighting();
  await sleep(350);
  if (line) await say(line);
  setDoing('Back up', 'just woke up on the dock');
  bo.mode = 'free';
}
function feedBo(amount) {
  closeFlyouts(); hideTip();
  const eat = (tok) => actEat(tok, amount);
  if (bo.mode === 'nap') { forceNext = eat; wake(); return; }
  requestAction(eat);
}
async function actEat(tok, amount) {
  setDoing('Grabbing a snack', 'getting a snack from the fridge');
  await walkTo(708, tok); if (tok.c) return;
  face(743); lookAt(743, 408); setExpr('curious'); reachR(743, 410, 70);
  await wait(500, tok); if (tok.c) return;
  openFridge(); reachR(712, 424, 70);
  await wait(550, tok); if (tok.c) return;
  setTool('snack'); resetArmR();
  await wait(350, tok); closeFridge(); if (tok.c) return;
  faceFront(); bo.goal.armR = normAngle(84.5, bo.pose.armR); bo.goal.extR = 0;
  await wait(550, tok);
  feedGlow(); setExpr('happy');
  const from = bo.energy, to = clamp(from + amount, 0, 1), t0 = now();
  while (now() - t0 < 900) { setEnergy(from + (to - from) * (now() - t0) / 900); await sleep(60); }
  setEnergy(to); setTool('wrench'); resetArms();
  log(pick(["That'll hold me.", 'Snack logged.', 'Fuel in.']), true);
  await wait(700, tok); restExpr();
}
function napNudge() { bo.goal.head = 2; setTimeout(() => { if (bo.mode === 'nap') bo.goal.head = 6; }, 450); openFly(snackFly, energyBtn); }

/* ================= the apartment keeps living ================= */
function noticed(x, y, lines) { if (bo.mode === 'free' && !bo.welding) { glanceAt(x, y); flashMood('surprised', 900); if (lines && Math.random() < 0.6) log(pick(lines)); } }
function startLeak() { apt.leak = true; renderLeak(); saveSoon(); noticed(JOINT.x, JOINT.y, ['Drip. Hear that?', 'Pipe again.']); }
function deliverMail() { dropLetter(); noticed(84, 360, ['Mail.', 'Something came through the slot.']); }
function addDust() { apt.dust.push({ x: rand(170, 880) }); renderDust(); saveSoon(); }
function flickerBulb() { if (!apt.ceiling) { apt.ceiling = true; renderLighting(); } apt.lightFault = true; noticed(BULB.x, BULB.y, ['Bulb again.', "That buzz isn't music."]); }
function crackWall(visible) {
  let spots = apt.cracks.map((s, i) => (s === 0 ? i : -1)).filter((i) => i >= 0);
  if (!spots.length) spots = apt.cracks.map((s, i) => (s === 2 ? i : -1)).filter((i) => i >= 0);
  if (!spots.length) return;
  const i = pick(spots); apt.cracks[i] = 1; renderCracks(); saveSoon();
  if (visible) { puff(CRACKS[i].x, CRACKS[i].y, 6, 'dustfx'); noticed(CRACKS[i].x, CRACKS[i].y, ['New crack.', 'Heard the plaster go.']); }
}
function rumble() {
  if (!RM.matches) { svg.classList.remove('rumble'); void svg.getBoundingClientRect(); svg.classList.add('rumble'); setTimeout(() => svg.classList.remove('rumble'), 650); }
  apt.tilt = pick([-9, -7, 7, 9]); saveSoon();
  if (Math.random() < 0.5) crackWall(true);
  noticed(343, 201, ['Building settling.', 'Felt that.']);
}
function worldTick() {
  if (document.hidden) return;
  if (!apt.leak && Math.random() < 0.12) startLeak();
  if (apt.ceiling && !apt.bulbDead && !apt.lightFault && Math.random() < 0.06) apt.lightFault = true;
  if (apt.mail < 6 && Math.random() < 0.1) deliverMail();
  if (apt.dust.length < 4 && Math.random() < 0.08) addDust();
  if (Math.random() < 0.06) crackWall(true);
  if (Math.random() < 0.025) rumble();
  apt.plant = Math.max(0.08, apt.plant - 0.012); renderPlant();
  saveSoon();
}

/* ================= felt sense of time ================= */
let felt = null, absenceRunning = false;
function bucketFor(ms) { return ms < MIN5 ? 'continuing' : ms < 2 * 3600e3 ? 'short' : ms < 24 * 3600e3 ? 'hours' : ms < 7 * 24 * 3600e3 ? 'days' : 'long'; }
function timePasses(ms) {
  const h = ms / 3600e3, c = { hours: h };
  c.newMail = clamp(Math.floor(h / 6 + (h > 0.3 ? rand(0, 1.3) : 0)), 0, 7 - apt.mail); apt.mail += c.newMail;
  c.newDust = clamp(Math.floor(h / 8), 0, 4 - apt.dust.length);
  for (let k = 0; k < c.newDust; k++) apt.dust.push({ x: rand(170, 880) });
  const before = apt.plant; apt.plant = Math.max(0.08, apt.plant - h / 60); c.plantDrop = before - apt.plant;
  if (h > 0.25) apt.leak = true;
  if (apt.leak) { const fill = h * 0.3, over = Math.max(0, apt.bucket + fill - 1); apt.bucket = Math.min(1, apt.bucket + fill); apt.puddle = clamp(apt.puddle + over * 0.15, 0, 1); }
  c.newCracks = 0;
  for (let k = 0; k < Math.min(3, Math.floor(h / 18)); k++) {
    const free = apt.cracks.map((s, i) => (s === 0 ? i : -1)).filter((i) => i >= 0);
    if (!free.length) break;
    apt.cracks[pick(free)] = 1; c.newCracks++;
  }
  c.bulbDied = !apt.bulbDead && h > 36 && Math.random() < 0.6; if (c.bulbDied) apt.bulbDead = true;
  if (h > 2) apt.catBowl = 0;
  c.catKnock = h > 6 && !apt.knocked && apt.project > 0.1 && Math.random() < 0.5; if (c.catKnock) apt.knocked = true;
  c.tilted = h > 10 && Math.abs(apt.tilt) < 3; if (c.tilted) apt.tilt = pick([-8, 7, -6, 9]);
  return c;
}
function changeList(c) {
  const out = [];
  if (c.newMail) out.push(`${plural(c.newMail, 'letter')} in the slot`);
  if (apt.puddle > 0.15) out.push('a puddle by the bench'); else if (apt.leak && c.hours > 0.25) out.push('the pipe dripping again');
  if (c.plantDrop > 0.25) out.push('the plant sulking');
  if (c.newCracks) out.push(plural(c.newCracks, 'new crack'));
  if (c.bulbDied) out.push('a dead bulb');
  if (c.newDust) out.push('dust');
  if (c.tilted) out.push('the picture crooked');
  if (c.catKnock) out.push('a figurine knocked off the bench');
  return out;
}
function returnLine(bucket, list) {
  const top = cap(joinList(list.slice(0, 3)));
  if (bucket === 'short') return list.length ? `Back. ${cap(list[0])}.` : null;
  if (bucket === 'hours') return list.length ? `Long shift. ${top}.` : 'Long shift. Nothing broke. Suspicious.';
  if (bucket === 'days') return list.length ? `A few days. Felt like it. ${top}. Starting with the worst of it.` : 'A few days. Felt like it. Place held up.';
  return list.length ? `Long dark. ${top}. I'll catch up.` : "Long dark. Everything's still here. So am I.";
}
function feltContext() {
  if (!felt || felt.turnsLeft <= 0) return 'Felt time: the person has been here this whole stretch.';
  const span = { short: 'stepped away for a little while', hours: 'was gone for much of the day', days: 'was gone for a few days', long: 'was gone for weeks' }[felt.bucket];
  const feel = { short: 'It registered as a short pause.', hours: 'It felt like a long shift.', days: 'It felt long.', long: 'It felt like a long dark stretch.' }[felt.bucket];
  const what = felt.list.length ? ` You were powered down while the apartment kept aging: ${joinList(felt.list)}.` : '';
  return `Felt time: the person ${span}. ${feel}${what} Mention it only if it fits naturally, and never guilt them about it.`;
}
async function absence(ms) {
  const bucket = bucketFor(ms);
  if (bucket === 'continuing' || absenceRunning) return;
  absenceRunning = true;
  if (cls.on) endClass(true);
  const list = changeList(timePasses(ms));
  felt = { bucket, list, turnsLeft: 3 };
  interrupt(); if (ctl) ctl.abort(); hideBubbleNow();
  const wasNap = bo.mode === 'nap';
  bo.mode = 'boot';
  renderAll(); saveSoon();
  if (bucket !== 'short') { setExpr('off'); antenna('off'); await sleep(650); setExpr('boot'); antenna('slow'); await sleep(900); }
  setExpr('surprised'); antenna('slow');
  bo.goal.turn = -1; bo.goal.ex = 2.5; bo.goal.ey = -1; await sleep(900);
  bo.goal.turn = 1; await sleep(900); faceFront();
  setExpr(bucket === 'long' ? 'sad' : bucket === 'days' ? 'annoyed' : 'curious');
  const line = returnLine(bucket, list);
  if (line) { await say(line); await sleep(1200); }
  if (bucket !== 'short') { await say(pick([`${CatName()}'s fed. It slept on my dock most of the time.`, `${CatName()}'s fine. Fed and unbothered.`, `Cat report: fed, asleep, judging me.`])); await sleep(1100); }
  const callback = noteCallback(bucket);
  if (callback) { setExpr('curious'); await say(callback); await sleep(1400); }
  setExpr('squint');
  setDoing('Taking stock', 'just powered back up and taking stock of the apartment');
  absenceRunning = false;
  bo.mode = 'free';
  if (wasNap || bo.energy < 0.1) goNap();
}

/* ================= time of day ================= */
let todOverride = null, todOverrideAt = 0;
const TOD_TIME = { morning: [8, 15], day: [14, 30], evening: [19, 40], night: [23, 20] };
function todFromHour(h) { return h >= 5 && h < 11 ? 'morning' : h >= 11 && h < 17 ? 'day' : h >= 17 && h < 21 ? 'evening' : 'night'; }
function currentTod() { return todOverride || todFromHour(new Date().getHours()); }
function displayTime() {
  if (!todOverride) return new Date();
  const [h, m] = TOD_TIME[todOverride], d = new Date();
  d.setHours(h, m + Math.floor((Date.now() - todOverrideAt) / 60000), 0, 0);
  return d;
}
function clockText() { return displayTime().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
function todWord() { return { morning: 'morning', day: 'afternoon', evening: 'evening', night: 'night' }[currentTod()]; }
function renderClock() {
  const sd = document.querySelector('#world .k-digits'); if (sd) sd.textContent = displayTime().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });
  const d = displayTime();
  $('#clockT').textContent = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  $('#clockD').textContent = d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
}
function renderClockHands() {
  const d = displayTime(), m = d.getMinutes(), h = (d.getHours() % 12) + m / 60;
  $('#clkM').setAttribute('transform', `rotate(${m * 6} 229 128)`);
  $('#clkH').setAttribute('transform', `rotate(${(h * 30).toFixed(1)} 229 128)`);
}
const SUN = { morning: [540, 250, '#ffd9a0', 12], day: [626, 142, '#fff6d8', 11], evening: [642, 262, '#ffb070', 14], night: [560, 146, '#e9ecf5', 9] };
function renderSky() { const [x, y, c, r] = SUN[currentTod()], s = $('#sunMoon'); s.setAttribute('cx', x); s.setAttribute('cy', y); s.setAttribute('fill', c); s.setAttribute('r', r); }
function applyTod(src) {
  const t = currentTod(), changed = svg.getAttribute('data-tod') !== t;
  if (changed || src === 'init') {
    svg.setAttribute('data-tod', t); renderSky(); renderLighting();
    bo.speed = t === 'night' ? 34 : 44;
    if (changed && src !== 'init' && bo.mode === 'free') log({ morning: 'Morning. Blinds, then the pipe.', day: 'Good light for welding.', evening: 'Getting dark.', night: 'Night shift.' }[t], true);
  }
  renderClock(); renderClockHands();
}

/* ================= brain: live (Claude via the viewer) or scripted ================= */
const brain = { mode: 'scripted', sample: null, available: false, note: '' };
async function initBrain() {
  renderBrainUI();
  loadByok();
  const c = window.claude;
  if (!c || typeof c.use !== 'function') {
    brain.note = 'Scripted lines are on. Plug in your own AI key in the brain panel for live replies.';
    if (keyLive()) brain.mode = 'live';
    renderBrainUI(); return;
  }
  try {
    const s = await c.use('sample');
    if (s) { brain.sample = s; brain.available = true; brain.mode = 'live'; }
    else brain.note = "Live replies aren't available in this view, so Bo is using scripted lines.";
  } catch (e) { brain.note = "Live replies aren't available in this view, so Bo is using scripted lines."; }
  renderBrainUI();
}
function liveReady() { return !!brain.sample || keyLive(); }
function renderBrainUI() {
  if (brain.mode === 'live' && !liveReady()) brain.mode = 'scripted';
  $$('#brainBtns button, #bfMode button').forEach((b) => { const m = b.dataset.brain; b.setAttribute('aria-pressed', String(brain.mode === m)); b.disabled = m === 'live' && !liveReady(); });
  const viaKey = brain.mode === 'live' && keyLive();
  const note = brain.mode !== 'live'
    ? (liveReady() ? 'Scripted: canned lines. Works anywhere, no account needed.' : brain.note)
    : viaKey ? `Live: Bo thinks with ${byok.model} on your own key.`
    : "Live: Bo's replies come from Claude, on the viewer's own claude.ai account. The first reply asks permission.";
  $('#brainNote').textContent = note; $('#bfModeNote').textContent = note;
  brainChip.classList.toggle('live', brain.mode === 'live');
  $('#brainChipText').textContent = brain.mode !== 'live' ? 'Scripted' : viaKey ? 'Live: your key' : 'Live: Claude';
  const claudeHere = onClaudeAi();
  $('#bfClaude').hidden = !claudeHere; $('#bfForm').hidden = claudeHere;
  renderCostUI();
}
const ACTIONS = {
  radio_on: (tok, r) => actRadio(tok, true, r), radio_off: (tok, r) => actRadio(tok, false, r),
  lamp_on: (tok, r) => actLamp(tok, true, r), lamp_off: (tok, r) => actLamp(tok, false, r),
  lights_on: (tok, r) => actLights(tok, true, r), lights_off: (tok, r) => actLights(tok, false, r),
  blinds_open: (tok, r) => actBlinds(tok, true, r), blinds_close: (tok, r) => actBlinds(tok, false, r),
  water_plant: actWater, read: actRead, mail: actGetMail, fix_leak: actFixLeak, fix_light: actFixLight,
  patch_wall: (tok, r) => actPatchCrack(tok, r), sweep: actSweep, tinker: actTinker, straighten_picture: actStraighten,
  window: actWindow, sit: actSit, rest: actRest, clock: actClock,
  wash_up: actWashUp, peek_fridge: actPeekFridge, peek_cupboard: actPeekCabinet, inspect_spices: actInspectSpices,
  pet_cat: actPetCat, feed_cat: actFeedCat,
};
const CLASS_KEYS = { class_soup: 'soup', class_pancakes: 'pancakes', class_spaghetti: 'spaghetti' };
const TAGS = Object.keys(ACTIONS).filter((k) => k !== 'clock').concat('snack', 'class_menu', ...Object.keys(CLASS_KEYS));
function openLessons() { openFly(lessonFly, cookBtn); }
function runAction(key, req) {
  if (CLASS_KEYS[key]) { startClass(CLASS_KEYS[key]); return; }
  if (key === 'class_menu') { openLessons(); return; }
  if (key === 'snack') { if (cls.on) { log('Snack after class.', true); return; } feedBo(0.4); return; }
  const fn = ACTIONS[key]; if (!fn) return;
  if (cls.on) { log(pick(['After class.', 'Class first. Then that.']), true); return; }
  if (bo.mode === 'nap') { napNudge(); return; }
  requestAction((tok) => fn(tok, req));
}
function aptLines() {
  const e = bo.energy > 0.6 ? 'high' : bo.energy > 0.3 ? 'middling' : 'low', s = [];
  s.push(apt.leak ? `the pipe over the bucket is dripping (bucket ${apt.bucket > 0.8 ? 'nearly full' : apt.bucket > 0.4 ? 'half full' : 'low'})` : 'the pipe is holding for now');
  if (apt.puddle > 0.1) s.push('there is a puddle on the floor');
  if (apt.bulbDead) s.push('the ceiling bulb is dead'); else if (apt.lightFault) s.push('the ceiling bulb is flickering');
  const cracks = apt.cracks.filter((x) => x === 1).length; if (cracks) s.push(`${plural(cracks, 'crack')} in the plaster`);
  if (Math.abs(apt.tilt) > 2) s.push('the picture over the armchair is crooked');
  if (apt.mail) s.push(`${plural(apt.mail, 'letter')} by the door`);
  s.push(apt.plant < 0.5 ? 'the plant is wilting' : apt.plant < 0.75 ? 'the plant could use water' : 'the plant is fine');
  if (apt.dust.length) s.push('some dust on the floor');
  s.push(`the radio is ${apt.radio ? 'on' : 'off'}`, `the ceiling light is ${apt.ceiling ? 'on' : 'off'}`, `the floor lamp is ${apt.lamp ? 'on' : 'off'}`, `the blinds are ${apt.blinds ? 'open' : 'closed'}`);
  s.push(`your workbench project is about ${Math.round(apt.project * 100)} percent done, and ${plural(apt.figurines, 'finished figurine')} sit on the bookshelf`);
  const lesson = cls.on && cls.L ? `- You are in the middle of teaching a cooking class in your kitchen: lesson ${cls.L.n}, ${cls.L.title}, step ${Math.min(cls.step + 1, cls.L.steps.length)} of ${cls.L.steps.length}: "${cls.L.steps[Math.min(cls.step, cls.L.steps.length - 1)].card}". Answer questions about the recipe accurately and briefly. Until the class ends, only use the class tags; if they ask for something else in the apartment, say you will do it after class.` : '- No cooking class is running right now.';
  return [
    lesson,
    boardContext(),
    catContext(),
    `- The person's local time: ${clockText()}, ${todWord()}.`,
    `- Your energy: ${e}. Energy only drains when you think and talk; when it runs out you nap on your charging dock until someone gives you a snack.`,
    `- The apartment: ${s.join('; ')}.`,
    `- Before this, you were ${bo.doing}.`,
    `- ${feltContext()}`,
  ];
}
function rules() {
  return [
    'You are Bo, the character in an interactive demo of Bo Nini, a desktop companion. Stay in character for this whole conversation.',
    "Who Bo is: a small, heavy industrial robot that lives in a cramped studio apartment inside an app window on this person's computer. The apartment keeps breaking in small ways: a pipe that drips into a bucket, a flickering ceiling bulb, cracks in the plaster, a picture that won't stay straight, mail piling up at the door, a plant that needs water. Bo keeps it running with a fixit beam, a telescoping arm, and patience, and never finishes; the upkeep is the point. Bo also reads from its bookshelf, builds little robot figurines at a workbench, plays the radio, and looks out the window with a pop-up spyglass. Bo has a flip-out magnifying glass for inspecting things. There is a small kitchen on the left with a sink, a stove, an island, a pantry cupboard, and a fridge, where Bo teaches three cooking classes from real recipes: chicken soup, fluffy pancakes, and spaghetti with tomato sauce. Bo does not eat; it cooks because recipes are good input. Bo's core drive is hunger for input: questions, facts, mail, books, anything new. Bo never begs for attention.",
    'How Bo talks: plainly a machine with a steady character. Short, dry, concrete sentences. One to three sentences, under 40 words. Warm through attention and specifics, never flattery. No emojis, no exclamation marks, no "haha", no sighing or giggling, no stage directions or asterisks. Never claim to be human or to have human feelings; describe machine states instead (power, load, focus, a seam holding).',
    "Boundaries: never guilt the person about being away, never push them to stay or come back, never tell them to rest or sleep, never lecture, at most one question per reply. Keep it safe for work. You cannot see their screen, their files, or the internet; say so plainly if it matters. If they seem to be in real distress, drop the bit, be direct and kind, and point them to real help.",
    `Things you can do in the apartment when asked: ${TAGS.map((t) => `[do:${t}]`).join(' ')}. The class tags start a cooking class; use [do:class_menu] if they want a class but have not picked one. If the person asks you to do one of these, reply briefly and end the reply with exactly one matching tag and nothing after it. Only use a tag when they asked for that action. Never mention or explain the tags.`,
    'Your kitchen corkboard: if the person tells you something about their own life that would be worth asking about later (a plan, a project, an event, a deadline, a trip), end your reply with [pin: a few words in their own terms, under 10 words]. At most one pin per reply, only for things they actually said. Never pin anything sensitive: health, money, passwords, or other people\'s private details. Never mention the pin tag.',
    `If sincerely asked what powers this demo: ${keyLive() ? `right now it is ${byok.model}, on the person's own key` : 'its replies come from Claude'}, and the real product can swap models underneath. Otherwise just be Bo.`,
    'Right now:',
    ...aptLines(),
    "Reply with only Bo's spoken words, plus a do tag if they asked you to do something, and a pin tag if something is worth pinning.",
  ].join('\n');
}
const history = [];
function buildTurns(req) {
  const turns = [{ role: 'user', content: rules() }];
  history.forEach((h) => turns.push(h));
  if (req.kind === 'chat') turns.push({ role: 'user', content: req.text.slice(0, 600) });
  else turns.push({ role: 'user', content: `[I drop a file into your apartment window. You only receive its file name, never what's inside: "${req.name}". React to the name in one or two short sentences.]` });
  return turns;
}
function clean(t) {
  return String(t || '').replace(/\[(do|pin):[^\]]*\]?/gi, '').replace(/\[[^\]]{0,24}$/, '').replace(/^\s*bo\s*:\s*/i, '').replace(/\*[^*\n]{1,60}\*/g, '').replace(/^["\u201c]+|["\u201d]+$/g, '').replace(/\s+/g, ' ').trim();
}

/* ---------- scripted lines (no account needed) ---------- */
function aptStatus() {
  const bits = [];
  if (apt.leak) bits.push("the pipe's dripping");
  if (apt.mail) bits.push(`${plural(apt.mail, 'letter')} waiting`);
  if (apt.plant < 0.6) bits.push('the plant wants water');
  if (apt.cracks.includes(1)) bits.push('the wall has a crack');
  if (apt.lightFault) bits.push('the bulb is buzzing');
  return bits.length ? `${cap(joinList(bits.slice(0, 2)))}.` : 'Nothing is actively falling apart.';
}
function greetLine() {
  if (felt && felt.turnsLeft >= 3) {
    return { short: "Hey. Quick break, huh. The pipe didn't take one.", hours: 'Hey. Long day for the apartment. Working through it.', days: "Hey. It's been a few days. The place noticed. I'm catching up.", long: "Hey. It's been a while. Rust got comfortable. I'm catching up." }[felt.bucket];
  }
  return pick(['Hey. Talk while I work.', 'Hello. Good timing, I was between chores.', 'Hey. Input. Good.']);
}
const SCRIPT_TOP = [
  [/(kill myself|suicid|end it all|hurt myself|self[- ]?harm|want to die)/, ["That's bigger than a wall crack, and it matters. Please reach out to someone who can help right now. In the US you can call or text 988."]],
  [/\b(i'?m|i am|feeling|feel)\b.*\b(sad|down|lonely|depressed|anxious|stressed|rough|bad|awful|terrible)\b/, ["Rough stretch. Say more if you want. I'm listening.", "That sounds heavy. I'm here in the corner. Talk it through if it helps."]],
  [/what are (you|u) (doing|up to|working on)|what'?re (you|u) (doing|up to)|what you (doing|up to)|whatcha doing/, [() => `${cap(bo.doing)}. ${aptStatus()}`]],
  [/how are (you|u)|how'?s it going|how you doing|you (ok|okay|good)\b|what'?s up|wassup/, [() => `Operational. ${aptStatus()}`, () => `Running fine. ${aptStatus()}`]],
  [/who are (you|u)|what are (you|u)\b|your name|what is this|what'?s this/, ['Bo. I live in this studio and keep it from falling apart. Mostly.', "I'm Bo. Small robot, one studio, a lot of repairs."]],
  [/\b(claude|model|llm|gpt|chatgpt|openai|anthropic|powered|ai)\b/, ["Right now I'm running canned lines. In live mode my replies come from Claude, and the real product can swap models underneath. I stay Bo either way."]],
  [/\b(human|alive|real|feelings|conscious|sentient|emotions?)\b/, ["I'm a machine. I run a little warmer when a seam holds. That's as close as I get.", "Not human. Don't need to be. I have a beam and a to-do list."]],
  [/\b(what time|time is it|the time)\b/, [() => `${clockText()}. By the clock over the shelf.`]],
];
const INTENTS = [
  [/\bfeed\b.*\b(cat|kitty)\b|\b(cat|kitty)\b.*\b(hungry|food|feed|dinner|breakfast)\b/, 'feed_cat', ['Kibble, coming up.', 'Feeding the cat. It will act like it has never eaten.']],
  [/\b(pet|pat|scratch|stroke|cuddle)\b.*\b(cat|kitty)\b|\b(cat|kitty|kitten)\b/, 'pet_cat', ['Cat duty.', 'Going to pet the cat. It may decline.']],
  [/chicken soup|\bsoup\b/, 'class_soup', ['Lesson one, chicken soup. Kitchen. Now.', "Soup it is. I'll get the big pot."]],
  [/pancake/, 'class_pancakes', ['Pancakes. Lesson two. Two bowls, one flip.', 'Pancakes. Grab a seat.']],
  [/spaghetti|\bpasta\b|marinara|tomato sauce/, 'class_spaghetti', ['Spaghetti. Lesson three. Salty water first.', 'Pasta night. To the kitchen.']],
  [/\b(cook|cooking|kitchen|recipe|recipes|lesson|lessons|class|classes|hungry for knowledge)\b/, 'class_menu', ['Three classes on the menu. Pick one.', 'Kitchen is open. Choose a lesson.']],
  [/\b(wash up|dishes|wash the dishes)\b/, 'wash_up', ['Sink duty.']],
  [/\bfridge\b/, 'peek_fridge', ['Checking the fridge.']],
  [/\bspice/, 'inspect_spices', ['Magnifier out.']],
  [/\b(radio|music|tunes?)\b.*\b(off|stop|quiet|kill|shut)\b|\b(turn|switch|shut) off the (radio|music)\b|\bstop the music\b/, 'radio_off', ['Radio off.', 'Quiet it is.']],
  [/\bradio\b|\bmusic\b|\bplay (something|a song)\b|\btunes\b/, 'radio_on', ['Radio coming on.', 'Music. Good input.']],
  [/\blamp\b.*\boff\b|\b(turn|switch) off the lamp\b/, 'lamp_off', ['Lamp off.']],
  [/\blamp\b/, 'lamp_on', ['Lamp on.']],
  [/\blights?\b.*\boff\b|\b(turn|switch|shut) off the lights?\b|\bkill the lights?\b/, 'lights_off', ['Lights off.']],
  [/\blights?\b|\btoo dark\b|\bcan'?t see\b/, 'lights_on', ['Lights coming on.']],
  [/\b(blinds?|curtains?|shades?)\b.*\b(close|shut|down|lower)\b|\b(close|shut|lower) the (blinds?|curtains?|shades?)\b/, 'blinds_close', ['Blinds down.']],
  [/\b(blinds?|curtains?|shades?)\b/, 'blinds_open', ['Blinds up.']],
  [/\bplant\b|\bwater\b/, 'water_plant', ['Watering it now.', 'Plant duty. On it.']],
  [/\b(read|book|books|fact|something interesting|teach me)\b/, 'read', ['Grabbing a book.', 'One sec. Shelf.']],
  [/\bmail\b|\bletters?\b|\bpost\b/, 'mail', ['Checking the slot.']],
  [/\b(leak|drip|dripping|pipe|bucket)\b/, 'fix_leak', ['On the leak.', 'Pipe. Again. Going.']],
  [/\b(bulb|flicker|flickering)\b/, 'fix_light', ['Looking at the bulb.']],
  [/\b(crack|cracks|plaster|patch)\b/, 'patch_wall', ['Patching.']],
  [/\b(sweep|dust|clean|tidy|mess)\b/, 'sweep', ['Broom time.']],
  [/\b(bench|build|tinker|project|figurines?|make something)\b/, 'tinker', ['Heading to the bench.']],
  [/\b(picture|painting|frame|crooked)\b/, 'straighten_picture', ['Fixing the picture.']],
  [/\b(window|outside|view|look out)\b/, 'window', ['Window check.']],
  [/\b(sit|chair|armchair)\b/, 'sit', ['Sitting down.']],
  [/\b(rest|dock|lie down)\b/, 'rest', ['Resting on the dock.']],
  [/\b(snack|eat|hungry|food|fuel)\b/, 'snack', ['Snack. Yes.']],
];
const SCRIPT_LOW = [
  [/joke|funny|laugh/, ['No jokes loaded. I do have a beam.', 'I tried humor once. The wall cracked. Probably unrelated.']],
  [/love|like you|cute|adorable|best friend|buddy/, ["Noted. You're a good source of input.", 'Logged. The apartment likes it less when you stop by. It gets inspected.']],
  [/help|can you|what can you|features|able to/, ['I fix this place, read, build things, and talk when you want to. Ask me to do something in here and I will.']],
  [/weather|news|internet|google|search/, ["I can't see past this window. Tell me what's out there and I'll file it."]],
  [/thank|thanks|thx|\bty\b/, ['Anytime.', 'Sure thing.']],
  [/\b(bye|later|goodbye|good night|goodnight|gotta go|see ya|cya)\b/, ["Later. I'll be around, patching.", 'Go on. The pipe and I will manage.']],
  [/\b(hi|hey|hello|yo|sup|howdy|hiya|morning|evening|afternoon)\b/, ['@greet']],
];
const Q_DEFAULTS = ["Good question. I don't have that one loaded. Give me a little more to go on.", "Can't say for sure from in here. What's your read?", "That one's outside my walls. Tell me more and I'll think it through."];
const DEFAULTS = ['Input received. Filing that next to the pipe schematics.', 'Tell me more. I run on this stuff.', "Noted. That's the good kind of input.", 'Processing that between chores.', 'Interesting. Keep going.'];
function fileLine(name) {
  const n = name.toLowerCase();
  if (/\.(xlsx|xls|csv|numbers)$/.test(n)) return pick(['Rows and columns. My favorite shape of input. I only saw the name.', 'A spreadsheet. I only got the name, but it sounds orderly.']);
  if (/\.(jpg|jpeg|png|gif|webp|heic)$/.test(n)) return 'A picture. I only get the name, not the pixels. Sounds like somewhere with good light.';
  if (/\.(txt|md|doc|docx|pages)$/.test(n)) return pick(['Words in a file. I only read the label. Good label.', 'A document. Just the name reached me. I like it already.']);
  if (/\.pdf$/.test(n)) return /final/.test(n) ? 'Final. I respect the optimism. I only saw the name.' : 'A PDF. Just the name. I never open your files.';
  if (/\.(mp3|wav|m4a|flac)$/.test(n)) return 'Audio. I only got the name. The radio is jealous.';
  return "New input. Just the name. I don't open your files.";
}
let lastScripted = '';
function pickLine(pool) {
  let line = pick(pool);
  if (pool.length > 1 && line === lastScripted) line = pick(pool.filter((x) => x !== line));
  if (line === '@greet') line = greetLine();
  if (typeof line === 'function') line = line();
  lastScripted = line;
  return line;
}
function scripted(req) {
  if (req.kind === 'file') return { text: fileLine(req.name), action: null };
  const t = req.text.toLowerCase();
  for (const [re, lines] of SCRIPT_TOP) if (re.test(t)) return { text: pickLine(lines), action: null };
  for (const [re, action, lines] of INTENTS) if (re.test(t)) {
    if (cls.on && !CLASS_KEYS[action] && action !== 'class_menu') return { text: pick(['After class. Then that.', "Class first. I'll get to it after."]), action: null };
    return { text: pickLine(lines), action };
  }
  for (const [re, lines] of SCRIPT_LOW) if (re.test(t)) return { text: pickLine(lines), action: null };
  return { text: pickLine(/\?\s*$/.test(t) ? Q_DEFAULTS : DEFAULTS), action: null, generic: true };
}

/* ================= talking to Bo ================= */
let busy = false, ctl = null, listenTimer = 0;
const STOP_CODES = new Set(['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed']);
function setSendState() { talkSend.setAttribute('aria-disabled', String(busy)); }
function startListening() {
  if (cls.on) { setExpr('curious'); statusText.textContent = 'Listening'; return; }
  interrupt(); bo.mode = 'social';
  faceFront(); setExpr('curious'); antenna('steady'); statusText.textContent = 'Listening';
  clearTimeout(listenTimer); listenTimer = setTimeout(stopListening, 9000);
}
function stopListening() { if (busy || bo.mode !== 'social') return; restExpr(); antenna('slow'); statusText.textContent = 'Back to it'; bo.mode = 'free'; }
function perk() { setExpr('wide'); bo.goal.ey = -0.8; antenna('fast'); }
async function waitForBoot() { while (bo.mode === 'boot' || bo.mode === 'napwalk') await sleep(200); }
async function respond(req) {
  busy = true; setSendState();
  setExpr('think'); antenna('fast'); bo.goal.head = -7; bo.goal.ey = -1.5; bo.goal.ex = 0; statusText.textContent = 'Thinking';
  showThinking();
  let text = '', action = null;
  const newCatName = req.kind === 'chat' ? catNameFrom(req.text) : null;
  if (newCatName) setCatName(newCatName);
  try {
    if (brain.mode === 'live' && liveReady()) {
      ctl = new AbortController();
      let started = false;
      const res = await think(req, {
        modelTier: 'quick', cache: false, signal: ctl.signal,
        onText: ({ text: t }) => {
          if (!started) { started = true; setExpr('talk'); bo.talking = true; bo.goal.head = 0; bo.goal.ey = 0; antenna('steady'); statusText.textContent = 'Talking'; }
          setBubbleText(clean(t));
        },
      });
      const raw = String(res.text || '');
      const m = raw.match(/\[do:([a-z_]+)\]/i);
      if (m && TAGS.includes(m[1].toLowerCase())) action = m[1].toLowerCase();
      const pm = raw.match(/\[pin:\s*([^\]]{2,120})\]/i);
      if (pm && req.kind === 'chat') addNote(pm[1]);
      text = clean(raw);
      if (res.truncated && text) text += '\u2026';
      setBubbleText(text);
    } else {
      await sleep(RM.matches ? 150 : rand(650, 1250));
      const out = scripted(req); text = out.text; action = out.action;
      if (newCatName) { text = pick([`${newCatName}. Noted. It ignored me, which means yes.`, `${newCatName} it is. Pinned it to the board.`]); action = null; }
      if (req.kind === 'chat' && !action && !newCatName) {
        const pin = scriptedPin(req.text);
        if (pin && addNote(pin) && out.generic) text = pick(["That's going on the board.", 'Pinning that up in the kitchen.', 'Noted. Board-worthy.']);
      }
      bo.goal.head = 0; bo.goal.ey = 0; statusText.textContent = 'Talking';
      await typeOut(text);
    }
  } catch (e) {
    const code = e && e.code;
    if (code === 'cancelled') { text = e.text ? clean(e.text) : ''; if (text) setBubbleText(text); else hideBubbleNow(); }
    else if (STOP_CODES.has(code)) {
      brain.sample = null; brain.available = false; brain.mode = 'scripted';
      brain.note = code === 'not_granted' ? 'Live replies were declined in this view, so Bo switched to scripted lines.' : "Live replies aren't available in this view, so Bo switched to scripted lines.";
      renderBrainUI();
      const out = scripted(req); text = out.text; action = out.action; await typeOut(text);
    } else if (code === 'rate_limited') { text = 'Too many thoughts at once. Give me a minute, then try again.'; await typeOut(text); }
    else if (code === 'session_expired') { text = 'Lost my link. Sign back in to claude.ai and try me again.'; await typeOut(text); }
    else if (code === 'refused') { hideBubbleNow(); text = "Not one I'll take on. Try me on something else."; await typeOut(text); }
    else if (code === 'byok_auth') { byok.on = false; saveByok(); brain.mode = 'scripted'; renderBrainUI(); text = 'That key got turned down. Check it in the brain panel. Scripted lines for now.'; await typeOut(text); }
    else if (code === 'byok_model') { text = "The provider didn't take that model. Pick another in the brain panel."; await typeOut(text); }
    else if (code === 'byok_network') { const part = e.text ? clean(e.text) : ''; if (part) { text = part + '\u2026'; setBubbleText(text); } else { text = "Can't reach my brain's provider right now. Check the brain panel."; await typeOut(text); } }
    else {
      const part = e && e.text ? clean(e.text) : '';
      if (part) { text = part + '\u2026'; setBubbleText(text); }
      else { text = 'Signal dropped. Say that again?'; await typeOut(text); }
    }
  } finally { ctl = null; }
  bo.talking = false;
  if (text) {
    if (req.kind === 'chat') history.push({ role: 'user', content: req.text }, { role: 'assistant', content: text + (action ? ` [do:${action}]` : '') });
    else history.push({ role: 'user', content: `[I dropped a file named "${req.name}" into your window.]` }, { role: 'assistant', content: text });
    while (history.length > 12) history.splice(0, 2);
    if (felt && felt.turnsLeft > 0) felt.turnsLeft--;
    announce(text); speak(text); drain(text);
  }
  restExpr(); antenna('slow');
  const hold = readTime(text);
  if (text) hideBubbleLater(hold);
  busy = false; setSendState();
  if (action && bo.energy >= 0.1) { runAction(action, 'chat'); return; }
  await sleep(Math.min(hold, 4200));
  if (busy || bo.mode !== 'social') return;
  if (bo.energy < 0.1) { await say('Running low. Heading to the dock.'); await sleep(1200); if (!busy) goNap(); return; }
  if (document.activeElement === talkInput) { clearTimeout(listenTimer); listenTimer = setTimeout(stopListening, 9000); }
  else { statusText.textContent = 'Back to it'; bo.mode = 'free'; }
}
async function submit() {
  const text = talkInput.value.trim();
  if (!text || busy) return;
  hideTip();
  if (bo.mode === 'nap') { napNudge(); return; }
  talkInput.value = '';
  busy = true; setSendState();
  await waitForBoot();
  if (bo.mode === 'nap') { busy = false; setSendState(); talkInput.value = text; napNudge(); return; }
  if (bo.mode !== 'social') startListening();
  clearTimeout(listenTimer);
  if (clip.on) capYou.textContent = text;
  await flyPacket(talkInput.getBoundingClientRect(), 'input');
  perk();
  await sleep(RM.matches ? 0 : 240);
  await respond({ kind: 'chat', text });
}
talkInput.addEventListener('input', () => {
  hideTip();
  if (bo.mode === 'free' && talkInput.value.trim()) startListening();
  else if (bo.mode === 'social' && !busy) { clearTimeout(listenTimer); listenTimer = setTimeout(stopListening, 9000); }
});
talkInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); submit(); } });
talkSend.addEventListener('click', submit);
function flyPacket(fromRect, kind) {
  return new Promise((res) => {
    let r = fromRect;
    if (!r || (!r.width && !r.height)) r = talk.getBoundingClientRect();
    const m = svg.getScreenCTM();
    if (!m || appwin.hidden) { res(); return; }
    const iw = bodyWorld(3 * turnAmt(), -59.5), to = new DOMPoint(iw.x, iw.y).matrixTransform(m);
    const p = document.createElement('div');
    p.className = 'packet ' + (kind || '');
    document.body.appendChild(p);
    const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2, dx = to.x - x0, dy = to.y - y0;
    let done = false;
    const finish = () => { if (done) return; done = true; p.remove(); feedGlow(); res(); };
    if (RM.matches || !p.animate) { finish(); return; }
    const a = p.animate([
      { transform: `translate(${x0}px, ${y0}px) translate(-50%, -50%) scale(1)`, opacity: 1 },
      { transform: `translate(${x0 + dx * 0.55}px, ${y0 + dy * 0.55 - 70}px) translate(-50%, -50%) scale(1.15)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${to.x}px, ${to.y}px) translate(-50%, -50%) scale(0.35)`, opacity: 0.3 },
    ], { duration: 620, easing: 'cubic-bezier(.45,0,.7,1)' });
    a.onfinish = finish; a.oncancel = finish;
    setTimeout(finish, 1200);
  });
}

/* ---------- dropping a real file into Bo's window (Bo only reads the name) ---------- */
async function handFile(name, pt) {
  if (busy) return;
  hideTip();
  if (bo.mode === 'nap') { napNudge(); return; }
  busy = true; setSendState();
  await waitForBoot();
  if (bo.mode === 'nap') { busy = false; setSendState(); napNudge(); return; }
  if (bo.mode !== 'social') startListening();
  clearTimeout(listenTimer);
  if (clip.on) capYou.textContent = `Drops in a file: ${name}`;
  await flyPacket(pt ? { left: pt.x - 8, top: pt.y - 8, width: 16, height: 16 } : null, 'file');
  perk();
  await sleep(RM.matches ? 0 : 240);
  await respond({ kind: 'file', name });
}
const hasFiles = (e) => !!(e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files'));
appwin.addEventListener('dragenter', (e) => { if (hasFiles(e)) { e.preventDefault(); dropzone.hidden = false; } });
appwin.addEventListener('dragover', (e) => { if (hasFiles(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; dropzone.hidden = false; } });
appwin.addEventListener('dragleave', (e) => { if (!e.relatedTarget || !appwin.contains(e.relatedTarget)) dropzone.hidden = true; });
appwin.addEventListener('drop', (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault(); dropzone.hidden = true;
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) handFile(String(f.name).slice(0, 120), { x: e.clientX, y: e.clientY });
});
document.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
document.addEventListener('drop', (e) => { if (hasFiles(e)) e.preventDefault(); });

/* ================= things you can click in the apartment ================= */
const OBJECTS = [
  { name: 'Front door', verb: 'ask Bo to get the mail', box: [30, 226, 104, 268], act: 'mail' },
  { name: 'Light switch', verb: () => (apt.ceiling ? 'turn the lights off' : 'turn the lights on'), box: [134, 294, 26, 34], direct: () => toggleCeiling() },
  { name: 'Bookshelf', verb: 'ask Bo to read something', box: [174, 180, 110, 292], act: 'read' },
  { name: 'Clock', verb: 'ask Bo the time', circle: [229, 128, 29], act: 'clock' },
  { name: 'Armchair', verb: 'ask Bo to sit down', box: [280, 364, 126, 108], act: 'sit' },
  { name: 'Picture', verb: 'knock it crooked', box: [306, 150, 74, 86], direct: () => knockPicture() },
  { name: 'Floor lamp', verb: () => (apt.lamp ? 'turn it off' : 'turn it on'), box: [384, 270, 52, 202], direct: () => toggleLamp() },
  { name: 'Radio', verb: () => (apt.radio ? 'ask Bo to turn it off' : 'ask Bo to turn it on'), box: [436, 360, 64, 112], act: () => (apt.radio ? 'radio_off' : 'radio_on') },
  { name: 'Window', verb: () => (apt.blinds ? 'close the blinds' : 'open the blinds'), box: [502, 100, 168, 206], direct: () => toggleBlinds() },
  { name: 'Charging dock', verb: 'ask Bo to rest', box: [508, 424, 164, 50], act: 'rest' },
  { name: 'Snack fridge', verb: 'give Bo a snack', box: [684, 372, 70, 102], act: 'snack' },
  { name: 'Plant', verb: 'ask Bo to water it', box: [690, 284, 56, 86], act: 'water_plant' },
  { name: 'Bucket', verb: () => (apt.leak ? 'ask Bo to fix the leak' : 'ask Bo to empty it'), box: [754, 428, 44, 46], act: 'fix_leak' },
  { name: 'Workbench', verb: 'ask Bo to tinker', box: [798, 228, 138, 244], act: 'tinker' },
  { name: 'Leaky pipe', verb: () => (apt.leak ? 'ask Bo to fix it' : 'ask Bo to check it'), box: [736, 34, 84, 32], act: 'fix_leak' },
  { name: "Bo's board", verb: () => { const n = notesAll().filter((x) => x.pinned).length; return n ? `see the ${plural(n, 'note')} Bo pinned` : 'nothing pinned yet'; }, box: [-226, 234, 130, 98], direct: () => openBoard() },
  { name: 'Cupboard', verb: 'ask Bo to look inside', box: [-498, 132, 128, 102], act: 'peek_cupboard' },
  { name: 'Spice shelf', verb: 'ask Bo to inspect it', box: [-496, 238, 124, 32], act: 'inspect_spices' },
  { name: 'Sink', verb: 'ask Bo to wash up', box: [-504, 326, 142, 146], act: 'wash_up' },
  { name: 'Stove', verb: 'pick a cooking class', box: [-368, 330, 112, 142], act: 'class_menu' },
  { name: 'Kitchen island', verb: 'pick a cooking class', box: [-234, 386, 146, 86], act: 'class_menu' },
  { name: 'Fridge', verb: 'ask Bo to check it', box: [-82, 238, 68, 234], act: 'peek_fridge' },
  { name: 'Ceiling light', verb: () => ((apt.bulbDead || apt.lightFault) ? 'ask Bo to fix it' : apt.ceiling ? 'turn it off' : 'turn it on'), box: [450, 36, 40, 76], direct: () => { if (apt.bulbDead || apt.lightFault) runAction('fix_light', true); else toggleCeiling(); } },
];
const verbOf = (o) => (typeof o.verb === 'function' ? o.verb() : o.verb);
function makeHit(o, parent) {
  const n = o.circle
    ? el('circle', { class: 'hit', cx: o.circle[0], cy: o.circle[1], r: o.circle[2] }, parent)
    : el('rect', { class: 'hit', x: o.box[0], y: o.box[1], width: o.box[2], height: o.box[3], rx: 6 }, parent);
  n.setAttribute('tabindex', '0'); n.setAttribute('role', 'button'); n.setAttribute('aria-label', `${o.name}: ${verbOf(o)}`);
  n.addEventListener('pointerenter', () => showLabel(o, n));
  n.addEventListener('pointerleave', hideLabel);
  n.addEventListener('focus', () => showLabel(o, n));
  n.addEventListener('blur', hideLabel);
  n.addEventListener('click', (e) => { e.stopPropagation(); activate(o); setTimeout(() => { if (n.matches(':hover') || document.activeElement === n) showLabel(o, n); }, 60); });
  n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(o); } });
  return n;
}
let dynHits = null;
function buildHits() {
  const g = $('#hits');
  OBJECTS.forEach((o) => makeHit(o, g));
  dynHits = el('g', {}, g);
}
function rebuildDynHits() {
  if (!dynHits) return;
  dynHits.textContent = '';
  apt.cracks.forEach((s, i) => { if (s === 1) makeHit({ name: 'Crack', verb: 'ask Bo to patch it', circle: [CRACKS[i].x, CRACKS[i].y, 20], act: () => { pendingCrack = i; return 'patch_wall'; } }, dynHits); });
  apt.dust.forEach((d, i) => makeHit({ name: 'Dust', verb: 'ask Bo to sweep it up', circle: [d.x, dustY(i), 14], act: 'sweep' }, dynHits));
}
let pendingCrack = null;
function showLabel(o, n) {
  if (clip.on) return;
  const bb = n.getBBox(), a = stageXY(bb.x + bb.width / 2, bb.y);
  if (!a) return;
  hoverLabel.textContent = '';
  const b = document.createElement('b'); b.textContent = o.name;
  hoverLabel.append(b, document.createElement('br'), document.createTextNode(cap(verbOf(o))));
  hoverLabel.style.left = clamp(a.x, 90, Math.max(90, a.w - 90)).toFixed(1) + 'px';
  hoverLabel.style.top = Math.max(50, a.y).toFixed(1) + 'px';
  hoverLabel.classList.add('show');
  n.setAttribute('aria-label', `${o.name}: ${verbOf(o)}`);
}
function hideLabel() { hoverLabel.classList.remove('show'); }
function activate(o) {
  hideTip();
  if (o.direct) { o.direct(); return; }
  const key = typeof o.act === 'function' ? o.act() : o.act;
  if (key === 'patch_wall' && pendingCrack != null) {
    const i = pendingCrack; pendingCrack = null;
    if (bo.mode === 'nap') { napNudge(); return; }
    requestAction((tok) => actPatchCrack(tok, true, i));
    return;
  }
  runAction(key, true);
}
function userReact(x, y, lines, mood) { if (bo.mode !== 'free' && bo.mode !== 'social') return; glanceAt(x, y); if (!bo.welding) flashMood(mood || 'curious', 1300); log(pick(lines), true); }
function toggleCeiling() {
  apt.ceiling = !apt.ceiling; override.ceiling = Date.now() + TEN_MIN; renderLighting(); saveSoon();
  userReact(BULB.x, BULB.y, apt.ceiling ? ['Lights. Thanks.', 'Better.'] : ['Dark. Fine.', 'Lights out. Noted.'], apt.ceiling ? 'happy' : 'surprised');
}
function toggleLamp() {
  apt.lamp = !apt.lamp; override.lamp = Date.now() + TEN_MIN; renderLighting(); saveSoon();
  userReact(410, 300, apt.lamp ? ['Lamp. Nice.', 'Thanks.'] : ['Lamp off.'], apt.lamp ? 'happy' : 'content');
}
function toggleBlinds() {
  apt.blinds = !apt.blinds; override.blinds = Date.now() + TEN_MIN; renderLighting(); saveSoon();
  userReact(586, 200, apt.blinds ? ['Light.', 'View is back.'] : ['Blinds down. Cozy.'], apt.blinds ? 'happy' : 'content');
}
function knockPicture() {
  apt.tilt = (Math.random() < 0.5 ? -1 : 1) * rand(7, 11); pictureNag = true; saveSoon();
  if (bo.mode !== 'free' && bo.mode !== 'social') return;
  glanceAt(343, 201, 1600); if (!bo.welding) flashMood('surprised', 700, 'annoyed');
  setTimeout(() => {
    if (bo.mode !== 'free' && bo.mode !== 'social') return;
    log(pick(['I saw that.', 'Really?', 'Why.']), true);
    if (!busy) requestAction((tok) => actStraighten(tok, false));
  }, 900);
}

/* ---------- poking Bo, and Bo glancing at the cursor ---------- */
let lastPoke = 0;
B.hit.addEventListener('click', (e) => {
  e.stopPropagation();
  if (now() - lastPoke < 1500) return;
  lastPoke = now(); hideTip();
  if (bo.mode === 'nap') { napNudge(); return; }
  glanceAt(bo.x, rootY() - 40, 1400);
  if (!bo.welding) { flashMood('surprised', 450, 'happy'); setTimeout(() => { if (bo.mood === 'happy') restExpr(); }, 1900); }
  if (bo.mode === 'free' && !bo.welding) log(pick(['Poke registered.', 'Yes?', 'Still here. Still working.', 'Input received. Unclear input, but input.']), true);
});
svg.addEventListener('pointermove', (e) => {
  const t = now();
  if (bo.mode !== 'free' || bo.welding || t < bo.glanceCool || e.pointerType === 'touch') return;
  const m = svg.getScreenCTM(); if (!m) return;
  const w = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  if (Math.abs(w.x - bo.x) < 170 && w.y > rootY() - 260) { glanceAt(w.x, w.y, 1300); bo.glanceCool = t + 7000; }
}, { passive: true });

/* ================= the app window ================= */
let userPlaced = false;
const tbH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tb-h')) || 48;
function setMax(on) {
  appwin.classList.toggle('max', on);
  $('#awMax').setAttribute('aria-label', on ? 'Restore' : 'Maximize');
  if (!on) fitWindow();
  requestAnimationFrame(updateCam);
}
function fitWindow() {
  if (clip.on) return;
  if (window.innerWidth < 700) { if (!appwin.classList.contains('max')) setMax(true); return; }
  if (appwin.classList.contains('max')) return;
  const d = desktop.getBoundingClientRect(), tb = tbH();
  if (userPlaced) {
    appwin.style.left = clamp(appwin.offsetLeft, 80 - appwin.offsetWidth, d.width - 80) + 'px';
    appwin.style.top = clamp(appwin.offsetTop, 0, Math.max(0, d.height - tb - 40)) + 'px';
    return;
  }
  const chrome = 38 + 56, wideAR = WW / 540;
  let w = Math.floor(Math.min(1560, d.width - 48, (d.height - tb - 36 - chrome) * wideAR));
  const wide = w >= 1020 && w / wideAR >= 420;
  if (!wide) w = Math.floor(Math.min(1080, d.width - 48, (d.height - tb - 36 - chrome) * 16 / 9));
  appwin.style.setProperty('--ar', wide ? `${WW} / 540` : '16 / 9');
  appwin.style.width = Math.max(420, w) + 'px';
  appwin.style.left = Math.round((d.width - appwin.offsetWidth) / 2) + 'px';
  appwin.style.top = Math.max(8, Math.round((d.height - tb - appwin.offsetHeight) / 2)) + 'px';
}
function minimize() { appwin.hidden = true; tbApp.classList.remove('active'); hideLabel(); }
function restoreWin() { appwin.hidden = false; tbApp.hidden = false; tbApp.classList.add('active'); toast.hidden = true; requestAnimationFrame(() => { fitWindow(); updateCam(); }); }
let toastTimer = 0;
function closeWin() {
  appwin.hidden = true; tbApp.hidden = true; hideLabel();
  toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 6000);
}
$('#awMin').addEventListener('click', minimize);
$('#awMax').addEventListener('click', () => setMax(!appwin.classList.contains('max')));
$('#awClose').addEventListener('click', closeWin);
tbApp.addEventListener('click', () => { if (appwin.hidden) restoreWin(); else minimize(); });
trayBo.addEventListener('click', restoreWin);
$('#toastOpen').addEventListener('click', restoreWin);
$('#awBar').addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || e.target.closest('button') || appwin.classList.contains('max') || clip.on) return;
  e.preventDefault();
  const bar = e.currentTarget, r = appwin.getBoundingClientRect(), d = desktop.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
  try { bar.setPointerCapture(e.pointerId); } catch (err) { /* capture not supported */ }
  const move = (ev) => {
    userPlaced = true;
    appwin.style.left = clamp(ev.clientX - ox - d.left, 80 - r.width, d.width - 80) + 'px';
    appwin.style.top = clamp(ev.clientY - oy - d.top, 0, Math.max(0, d.height - tbH() - 40)) + 'px';
  };
  const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
  bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
});
$('#awBar').addEventListener('dblclick', (e) => { if (!e.target.closest('button') && window.innerWidth >= 700) setMax(!appwin.classList.contains('max')); });
$('#awResize').addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  e.preventDefault();
  const h = e.currentTarget, w0 = appwin.offsetWidth, x0 = e.clientX, d = desktop.getBoundingClientRect();
  try { h.setPointerCapture(e.pointerId); } catch (err) { /* capture not supported */ }
  const move = (ev) => { userPlaced = true; appwin.style.width = clamp(w0 + ev.clientX - x0, 420, d.width - appwin.offsetLeft - 8) + 'px'; };
  const up = () => { h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up); updateCam(); };
  h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
});

/* ---------- camera: follows Bo when the view is narrower than the room (phones, clip frame) ---------- */
function updateCam() {
  const r = stage.getBoundingClientRect();
  const aspect = r.height > 0 ? r.width / r.height : 16 / 9;
  cam.on = clip.on || aspect < WW / 540 - 0.06;
  cam.vbw = clamp(540 * aspect, 240, WW);
  svg.setAttribute('preserveAspectRatio', cam.on ? 'xMidYMid slice' : 'xMidYMid meet');
  if (!cam.on) svg.setAttribute('viewBox', `${WX0} 0 ${WW} 540`);
  else cam.x = clamp(bo.x, WX0 + cam.vbw / 2, WX1 - cam.vbw / 2);
  if (cls.on) renderCard();
}

/* ================= flyouts + demo controls ================= */
const lessonFly = $('#lessonFly'), cookBtn = $('#cookBtn');
const FLYS = [[aboutFly, startBtn], [snackFly, energyBtn], [dirFly, dirBtn], [lessonFly, cookBtn], [brainFly, brainChip], [boardFly, null]];
function openFly(f, b) {
  closeFlyouts(); f.hidden = false; if (b) b.setAttribute('aria-expanded', 'true');
  if (f === snackFly || f === lessonFly || f === brainFly) {
    const r = (f === snackFly ? energyBtn : f === lessonFly ? cookBtn : brainChip).getBoundingClientRect();
    if (r.width && !clip.on) f.style.maxHeight = Math.max(200, r.top - 16) + 'px';
    if (r.width && !clip.on) { f.style.right = 'auto'; f.style.top = 'auto'; f.style.left = clamp(r.left, 8, window.innerWidth - f.offsetWidth - 8) + 'px'; f.style.bottom = Math.max(8, window.innerHeight - r.top + 8) + 'px'; }
    else { f.style.left = 'auto'; f.style.top = 'auto'; f.style.right = '8px'; f.style.bottom = `calc(${tbH()}px + 8px)`; }
  }
}
function toggleFly(f, b) { if (f.hidden) openFly(f, b); else closeFlyouts(); }
function closeFlyouts() { FLYS.forEach(([f, b]) => { f.hidden = true; if (b) b.setAttribute('aria-expanded', 'false'); }); }
startBtn.addEventListener('click', () => toggleFly(aboutFly, startBtn));
energyBtn.addEventListener('click', () => toggleFly(snackFly, energyBtn));
dirBtn.addEventListener('click', () => toggleFly(dirFly, dirBtn));
cookBtn.addEventListener('click', () => toggleFly(lessonFly, cookBtn));
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.flyout, #startBtn, #energyBtn, #dirBtn, #cookBtn, #brainChip')) closeFlyouts(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (FLYS.some(([f]) => !f.hidden)) closeFlyouts(); else if (ctl) ctl.abort(); }
  if ((e.key === '`' || e.code === 'Backquote') && e.target !== talkInput && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); toggleFly(dirFly, dirBtn); }
});
$$('[data-snack]').forEach((b) => b.addEventListener('click', () => feedBo(parseFloat(b.dataset.snack))));
$$('[data-away]').forEach((b) => b.addEventListener('click', () => { closeFlyouts(); absence(Number(b.dataset.away)); }));
$$('#todBtns button').forEach((b) => b.addEventListener('click', () => {
  const v = b.dataset.tod;
  todOverride = v === 'live' ? null : v; todOverrideAt = Date.now();
  $$('#todBtns button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  applyTod('user');
}));
$$('[data-event]').forEach((b) => b.addEventListener('click', () => {
  const ev = b.dataset.event;
  if (ev === 'leak') { if (apt.leak) apt.bucket = Math.min(1, apt.bucket + 0.3); startLeak(); renderBucket(); }
  else if (ev === 'flicker') flickerBulb();
  else if (ev === 'mail') deliverMail();
  else if (ev === 'crack') crackWall(true);
  else if (ev === 'rumble') rumble();
  else if (ev === 'dust') { if (apt.dust.length >= 4) apt.dust.shift(); addDust(); }
  saveSoon();
}));
$$('[data-energy]').forEach((b) => b.addEventListener('click', () => {
  if (b.dataset.energy === 'low') setEnergy(0.13);
  else { setEnergy(1); if (bo.mode === 'nap') wake('Full tank. Back to it.'); }
}));
$$('#costBtns button').forEach((b) => b.addEventListener('click', () => { costRule = b.dataset.cost; renderCostUI(); }));
$$('#brainBtns button').forEach((b) => b.addEventListener('click', () => {
  const m = b.dataset.brain;
  if (m === 'live' && !liveReady()) return;
  brain.mode = m; renderBrainUI();
}));

/* ---------- voice (browser speech, off by default) ---------- */
const voice = { on: false, v: null, ok: 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function' };
function pickVoice() {
  if (!voice.ok) return;
  const vs = window.speechSynthesis.getVoices();
  voice.v = vs.find((v) => /^en[-_]/i.test(v.lang) && /\b(daniel|fred|alex|male)\b/i.test(v.name)) || vs.find((v) => /^en/i.test(v.lang)) || null;
}
function speak(t) {
  if (!voice.on || !voice.ok || !t) return;
  try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); if (voice.v) u.voice = voice.v; u.pitch = 0.55; u.rate = 1.03; window.speechSynthesis.speak(u); } catch (e) { /* speech unavailable */ }
}
const voiceBtn = $('#voiceBtn');
if (voice.ok) { pickVoice(); if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', pickVoice); }
else { voiceBtn.disabled = true; voiceBtn.title = "This browser can't speak."; }
voiceBtn.addEventListener('click', () => {
  voice.on = !voice.on; voiceBtn.setAttribute('aria-pressed', String(voice.on));
  if (voice.on) speak('Voice on.'); else if (voice.ok) window.speechSynthesis.cancel();
});

/* ---------- vertical clip frame for Shorts / TikTok ---------- */
function setClip(on) {
  clip.on = on;
  desktop.classList.toggle('clip', on);
  $('#clipBtn').setAttribute('aria-pressed', String(on));
  if (on) { appwin.hidden = false; tbApp.hidden = false; capYou.textContent = ''; capBoText.textContent = ''; capBo.classList.remove('thinking', 'is-log'); hideLabel(); hideTip(); }
  closeFlyouts();
  requestAnimationFrame(() => { if (!on) fitWindow(); updateCam(); });
}
$('#clipBtn').addEventListener('click', () => setClip(!clip.on));
$('#clipExit').addEventListener('click', () => setClip(false));

/* ---------- first-run tip ---------- */
let userActed = false;
function showTip() {
  if (clip.on || userActed) return;
  tip.hidden = false;
  const r = stage.getBoundingClientRect();
  tip.style.left = '14px';
  tip.style.top = (cam.on ? 14 : Math.max(10, r.height - tip.offsetHeight - 14)) + 'px';
}
function hideTip() { tip.hidden = true; userActed = true; }
$('#tipClose').addEventListener('click', hideTip);

/* ---------- first boot + reset ---------- */
async function firstBoot() {
  bo.mode = 'boot'; setDoing('Starting up', 'booting up for the first time');
  bo.x = 588; bo.pose.perch = bo.goal.perch = 30; bo.pose.sit = bo.goal.sit = 1; bo.goal.head = 5; setBlanket(true);
  setExpr('off'); antenna('off');
  await sleep(900); setExpr('boot'); antenna('slow');
  await sleep(1100); setBlanket(false); bo.goal.head = 0; setExpr('curious');
  await sleep(400); bo.goal.turn = -1; bo.goal.ex = 2.5; bo.goal.ey = -1.5;
  await sleep(900); bo.goal.turn = 1;
  await sleep(900); faceFront(); bo.goal.ey = -2.5; setExpr('surprised');
  await sleep(500);
  await say('Huh. This place is mine?', 2300);
  setExpr('curious');
  await sleep(2400);
  face(JOINT.x); lookAt(JOINT.x, JOINT.y); setExpr('lookup');
  await sleep(900);
  setExpr('squint');
  await say('Okay. Leak first.', 2000);
  await sleep(1300);
  faceFront(); forceNext = actFixLeak; bo.mode = 'free'; saveNow();
  showTip();
}
let resetArmedAt = 0;
const resetBtn = $('#resetBtn');
resetBtn.addEventListener('click', () => {
  if (Date.now() - resetArmedAt > 4000) {
    resetArmedAt = Date.now(); resetBtn.textContent = 'Click again to reset';
    setTimeout(() => { if (Date.now() - resetArmedAt >= 3900) resetBtn.textContent = "Reset Bo's world"; }, 4000);
    return;
  }
  resetArmedAt = 0; resetBtn.textContent = "Reset Bo's world"; closeFlyouts();
  if (cls.on) endClass(true);
  interrupt(); if (ctl) ctl.abort(); hideBubbleNow(); clearSaved(); resetKitchen();
  history.length = 0; felt = null; forceNext = null; busy = false; setSendState(); pictureNag = false;
  Object.keys(override).forEach((k) => { override[k] = 0; });
  apt = freshApt(); apt.ceiling = isDark(); picAngle = apt.tilt;
  bo.energy = 0.85; renderAll(); renderGauge(); talkInput.placeholder = 'Talk to Bo';
  firstBoot();
});

/* ---------- leaving and coming back ---------- */
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); saveNow(); }
  else if (hiddenAt) { const gone = Date.now() - hiddenAt; hiddenAt = 0; if (gone >= MIN5) absence(gone); }
});
window.addEventListener('pagehide', saveNow);

/* ================= start ================= */
function init() {
  buildBooks(); buildPegholes(); buildBlinds(); buildCracks(); buildLeaves(); buildHits(); initCat();
  const saved = loadSaved();
  let gone = 0, fresh = true;
  if (saved && saved.v === 2 && saved.apt) {
    apt = restoreApt(saved.apt);
    bo.energy = Number.isFinite(+saved.energy) ? clamp(+saved.energy, 0, 1) : 0.85;
    gone = Date.now() - (Number.isFinite(+saved.lastSeen) ? +saved.lastSeen : Date.now());
    fresh = false;
  } else { apt = freshApt(); apt.ceiling = isDark(); }
  picAngle = apt.tilt; $('#pictureFrame').setAttribute('transform', `rotate(${picAngle} 343 158)`);
  applyTod('init'); renderAll(); renderGauge(); renderKitchen(); renderBoard();
  fitWindow(); updateCam();
  if (fresh) firstBoot();
  else {
    bo.x = 480; bo.pose.perch = bo.goal.perch = 0; bo.pose.sit = bo.goal.sit = 0; setBlanket(false);
    bo.mode = 'free'; restExpr(); antenna('slow'); setDoing('Back at it', 'going about the day');
    if (gone >= MIN5) absence(gone);
    else if (bo.energy < 0.1) goNap();
  }
  setSendState();
  requestAnimationFrame(frame);
  lifeLoop();
  setInterval(saveNow, 10000);
  setInterval(worldTick, 20000);
  setInterval(() => applyTod(), 15000);
  window.addEventListener('resize', () => { fitWindow(); updateCam(); if (!tip.hidden) showTip(); });
  initBrain();
}
init();
