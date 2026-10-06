
/* ================= the 90-second tour: one click, Bo shows the whole idea ================= */
const tour = { on: false, run: 0, step: 0, tok: null, noteId: null, allowClass: false, typing: false, lockNext: false };
const TOUR_NOTE = 'Pitching investors this week', TOUR_SPEED = 180;
const TOUR_LINES = [
  'This is Bo. It lives here and keeps its own routine. Nobody asked it to fix that crack.',
  'Talk to it. Tell Bo something about your life, and it pins it to the board.',
  'It teaches real cooking classes, step by step, from real recipes.',
  'Now leave for three weeks. Bo feels the time pass, the place ages, and it remembers what you said.',
  'Energy is thinking. Replies cost a little, chores are free. When it runs dry, Bo naps until it gets a snack.',
  "And there's a cat. Bo feeds it and looks after it. It's never your job.",
];
const tourCard = $('#tourCard'), tourText = $('#tourText'), tourStepEl = $('#tourStep'), tourNext = $('#tourNext'), tourEnd = $('#tourEnd'), tourWait = $('#tourWaitlist'), tourBtn = $('#tourBtn');
function tourCaption(i) {
  tour.step = i;
  tourStepEl.textContent = `${i} of ${TOUR_LINES.length}`;
  tourText.textContent = TOUR_LINES[i - 1];
  tourCard.classList.remove('done'); tourWait.hidden = true; tourNext.hidden = false; tourEnd.textContent = 'End tour';
  tourCard.hidden = clip.on;
  tourNext.disabled = tour.lockNext;
}
async function tourHold(ms, tok) { const end = now() + ms; while (now() < end && !tok.c) await sleep(80); return !tok.c; }
function tourSkipCard(text, ms) {
  const card = $('#skipCard'); $('#skipText').textContent = text; card.hidden = false;
  card.style.left = '50%'; card.style.top = '46%';
  return sleep(ms).then(() => { card.hidden = true; });
}
function tourSettle() {
  stopWeld(); resetArms(); gadget('lens', false); gadget('scope', false); holdItem(null);
  if (bo.mode === 'nap' || bo.mode === 'napwalk') { setBlanket(false); bo.goal.perch = 0; bo.goal.sit = 0; }
  bo.mode = 'tour'; faceFront(); restExpr(); antenna('slow'); renderGauge(); renderLighting();
}

/* ---------- the six beats ---------- */
async function tourWork(tok) {
  tourCaption(1);
  let i = apt.cracks.findIndex((s) => s === 1);
  if (i < 0) { i = [0, 1, 2, 3, 4].find((k) => apt.cracks[k] === 0); if (i == null) i = 0; apt.cracks[i] = 1; renderCracks(); }
  await tourHold(900, tok); if (tok.c) return;
  await actPatchCrack(tok, false, i);
  await tourHold(900, tok);
}
async function tourTalk(tok) {
  tourCaption(2);
  faceFront(); setExpr('curious');
  await tourHold(1200, tok); if (tok.c) return;
  tour.typing = true;
  for (let k = 1; k <= TOUR_NOTE.length + 1 && !tok.c; k++) { talkInput.value = (TOUR_NOTE + '.').slice(0, k); await sleep(45); }
  tour.typing = false;
  if (tok.c) { talkInput.value = ''; return; }
  await sleep(350);
  const from = talkInput.getBoundingClientRect(); talkInput.value = '';
  await flyPacket(from, 'input'); perk();
  await say("Big week. That's going on the board.", 2600); if (tok.c) return;
  let n = addNote(TOUR_NOTE) || notesAll().find((x) => x.t === TOUR_NOTE);
  if (n) { n.at = Date.now() - 120000; n.asked = 0; tour.noteId = n.id; }
  if (n && !n.pinned) await actPin(tok);
  await tourHold(900, tok);
}
async function tourCook(tok) {
  tourCaption(3);
  tour.allowClass = true; startClass('soup'); tour.allowClass = false;
  await tourHold(18000, tok);
  if (cls.on) endClass(true);
}
async function tourAway(tok) {
  tour.lockNext = true; tourCaption(4);
  await tourHold(1800, tok);
  await tourSkipCard('Three weeks later', 1600);
  await absence(21 * 24 * 3600e3);
  tour.lockNext = false; tourNext.disabled = false;
  await tourHold(800, tok);
}
async function tourEnergy(tok) {
  tourCaption(5);
  bo.mode = 'tour';
  const from = bo.energy, t0 = now();
  while (now() - t0 < 1500 && !tok.c) { setEnergy(from + (0.04 - from) * (now() - t0) / 1500); await sleep(60); }
  setEnergy(0.04); if (tok.c) return;
  setDoing('Heading to the dock', 'out of energy, walking to the charging dock');
  setExpr('low');
  await walkTo(588, tok); if (tok.c) return;
  bo.mode = 'nap'; faceFront(); bo.goal.perch = 30; bo.goal.sit = 1; bo.goal.head = 6; setExpr('nap'); antenna('off'); setBlanket(true); renderGauge(); renderLighting();
  setDoing('Napping on the dock', 'out of energy, napping on the dock');
  await tourHold(2600, tok); if (tok.c) return;
  bo.mode = 'tour'; setExpr('boot'); antenna('slow'); setBlanket(false); bo.goal.perch = 0; bo.goal.sit = 0; bo.goal.head = 0; renderGauge(); renderLighting();
  await tourHold(800, tok); if (tok.c) return;
  await actEat(tok, 0.75);
  await tourHold(600, tok);
}
async function tourCat(tok) {
  tourCaption(6);
  catHoldStill(true);
  const side = cat.x < bo.x ? -1 : 1;
  await catGoFloor(clamp(bo.x + side * 48, CAT_MIN, CAT_MAX), { c: false }, 170);
  cat.dir = -side; catSay('mrrp');
  if (tok.c) { catHoldStill(false); return; }
  await actPetCat(tok, true);
  await tourHold(1200, tok);
}
const TOUR_BEATS = [tourWork, tourTalk, tourCook, tourAway, tourEnergy, tourCat];

/* ---------- running it ---------- */
async function startTour() {
  if (tour.on) return;
  closeFlyouts(); hideTip();
  const my = ++tour.run;
  tour.on = true; tour.noteId = null; tour.lockNext = false;
  tourBtn.setAttribute('aria-pressed', 'true');
  tourCard.hidden = clip.on; tourStepEl.textContent = 'Starting'; tourText.textContent = 'Getting Bo ready for the tour.'; tourNext.disabled = true; tourWait.hidden = true; tourNext.hidden = false;
  if (cls.on) endClass(true);
  while ((bo.mode === 'boot' || bo.mode === 'napwalk' || absenceRunning) && tour.run === my) await sleep(200);
  if (tour.run !== my) return;
  interrupt(); if (ctl) ctl.abort(); hideBubbleNow(); forceNext = null; busy = false; setSendState();
  tourSettle(); setEnergy(Math.max(bo.energy, 0.6));
  bo.speed = TOUR_SPEED;
  for (let i = 0; i < TOUR_BEATS.length; i++) {
    if (!tour.on || tour.run !== my) return;
    const tok = makeTok(); tour.tok = tok;
    try { await TOUR_BEATS[i](tok); } catch (err) { console.error(err); }
    if (!tour.on || tour.run !== my) return;
    tourSettle(); bo.speed = TOUR_SPEED;
    await sleep(400);
  }
  if (!tour.on || tour.run !== my) return;
  tourCard.classList.add('done');
  tourStepEl.textContent = 'Your turn';
  tourText.textContent = "That's Bo. Talk to it, click around, or take a full cooking class.";
  tourNext.hidden = true; tourWait.hidden = false; tourEnd.textContent = 'Look around';
  setExpr('happy'); say('Your turn.', 3000);
}
function endTour() {
  if (!tour.on) return;
  tour.on = false; tour.run++;
  if (tour.tok) tour.tok.cancel();
  if (tour.typing) { talkInput.value = ''; tour.typing = false; }
  if (cls.on) endClass(true);
  $('#skipCard').hidden = true; tourCard.hidden = true;
  tourBtn.setAttribute('aria-pressed', 'false');
  if (tour.noteId) { apt.notes = notesAll().filter((n) => n.id !== tour.noteId); tour.noteId = null; renderBoard(); renderBoardPanel(); saveSoon(); }
  if (bo.energy < 0.3) setEnergy(0.6);
  catHoldStill(false);
  if (bo.mode === 'tour' || bo.mode === 'nap') { tourSettle(); bo.mode = 'free'; }
  bo.speed = baseSpeed();
  setDoing('Back to it', 'going about the day');
}
tourBtn.addEventListener('click', () => { if (tour.on) endTour(); else startTour(); });
tourNext.addEventListener('click', () => { if (tour.on && !tour.lockNext && tour.tok) tour.tok.cancel(); });
tourEnd.addEventListener('click', () => endTour());
const wantTour = /(^|[?&#])tour\b/i.test(location.search.slice(1) + '&' + location.hash.slice(1));
