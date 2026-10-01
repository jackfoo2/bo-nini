
/* ================= the kitchen + Bo's cooking classes ================= */
const kit = { pot: null, pan: null, burners: [false, false], low: [false, false], board: [], bowl: null, jug: false, plate: null, serve: null, items: [], faucet: false, hood: false, carry: null, fridgeOpen: false, cabOpen: false };
function resetKitchen() {
  Object.assign(kit, { pot: null, pan: null, burners: [false, false], low: [false, false], board: [], bowl: null, jug: false, plate: null, serve: null, items: [], faucet: false, hood: false, carry: null, fridgeOpen: false, cabOpen: false });
  renderKitchen();
}
const LIQ = { water: '#a9cfe0', broth: '#d9a441', pasta: '#c5dbe4' };
const n1 = (v) => (+v).toFixed(1);
function legSVG(x, y, ang, cooked) {
  const meat = cooked ? '#c98a4b' : '#e7ad96', meat2 = cooked ? '#dca06a' : '#f0c3b0', edge = cooked ? '#8a5a2a' : '#b97a66';
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${ang})"><ellipse cx="0" cy="6" rx="8.5" ry="13" fill="${meat}" stroke="${edge}" stroke-width="1"/><ellipse cx="-2.5" cy="2" rx="3.4" ry="6" fill="${meat2}"/><rect x="-2.4" y="-24" width="4.8" height="20" rx="2.4" fill="#f4ecd8" stroke="#a8977a" stroke-width="1"/><circle cx="-3" cy="-25" r="3.6" fill="#f4ecd8" stroke="#a8977a" stroke-width="1"/><circle cx="3" cy="-25" r="3.6" fill="#f4ecd8" stroke="#a8977a" stroke-width="1"/><rect x="-1.6" y="-24" width="3.2" height="6" fill="#f4ecd8"/></g>`;
}
function bits(cx, y, colors, r = 2.2) {
  return colors.map((c, k) => `<circle cx="${n1(cx - 14 + k * 7 + (k % 2) * 2)}" cy="${n1(y - (k % 2) * 1.2)}" r="${r}" fill="${c}"/>`).join('');
}
function potSVG(cx, by, p) {
  const w = 66, h = 56, x = cx - w / 2, y = by - h, cooked = p.liquid === 'broth';
  let s = '<g>';
  if (p.legs) [[-14, -18], [3, 6], [16, 24]].slice(0, p.legs).forEach(([dx, a]) => { s += legSVG(cx + dx, y + 4, a, cooked); });
  if (p.spaghetti === 'dry') for (let k = 0; k < 14; k++) { const x0 = cx - 12 + k * 1.9, a = (-20 + k * 2.8) * Math.PI / 180; s += `<line x1="${n1(x0)}" y1="${y + 12}" x2="${n1(x0 + Math.sin(a) * 50)}" y2="${n1(y + 12 - Math.cos(a) * 50)}" stroke="#d9b75a" stroke-width="1.8" stroke-linecap="round"/>`; }
  if (p.herbs) s += `<path d="M${cx + 16} ${y + 4}l6-14M${cx + 19} ${y + 4}l2-12" stroke="#6f8f4a" stroke-width="1.6" stroke-linecap="round"/>`;
  s += `<rect x="${x - 5}" y="${y + 12}" width="7" height="5" rx="2" class="k-pot2"/><rect x="${x + w - 2}" y="${y + 12}" width="7" height="5" rx="2" class="k-pot2"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="k-pot"/><rect x="${x}" y="${y}" width="${w}" height="4" rx="2" class="k-pot2"/><rect x="${x + 6}" y="${y + 10}" width="3" height="${h - 16}" rx="1.5" fill="rgba(255,255,255,.25)"/>`;
  if (p.water > 0.35) s += `<ellipse cx="${cx}" cy="${y + 2.5}" rx="${w / 2 - 3}" ry="2.6" fill="${LIQ[p.liquid || 'water']}"/>`;
  if (p.foam) for (let k = 0; k < 6; k++) s += `<circle cx="${cx - 18 + k * 7}" cy="${y + 1}" r="${2.4 + (k % 2)}" fill="#e7e2d6"/>`;
  if (p.veg) s += bits(cx, y + 1.5, ['#f2a25c', '#7dbb5a', '#e9dcc2', '#f2a25c', '#7dbb5a']);
  if (p.veg2) s += bits(cx + 4, y + 1.2, ['#f08a2c', '#8cc86a', '#f08a2c', '#8cc86a'], 1.9);
  if (p.noodles) s += `<path d="M${cx - 16} ${y + 1}q3-3 6 0t6 0t6 0t6 0t6 0" fill="none" stroke="#f0d27a" stroke-width="1.6"/>`;
  if (p.chicken) s += bits(cx - 6, y + 1, ['#e9c9a0', '#dcb58a', '#e9c9a0']);
  if (p.parsley) s += bits(cx + 2, y + 0.5, ['#4f8a3a', '#4f8a3a', '#4f8a3a'], 1.2);
  if (p.spaghetti === 'soft' && p.water > 0.35) s += `<path d="M${cx - 18} ${y + 1}q4-4 8 0t8 0t8 0t8 0" fill="none" stroke="#f0d27a" stroke-width="1.8"/>`;
  return s + '</g>';
}
function panSVG(cx, by, p) {
  let s = '<g>';
  if (p.kind === 'sauce') {
    s += `<rect x="${cx + 20}" y="${by - 17}" width="30" height="4" rx="2" fill="#3b3128"/><rect x="${cx - 22}" y="${by - 22}" width="44" height="22" rx="3" class="k-pot"/><rect x="${cx - 22}" y="${by - 22}" width="44" height="3" rx="1.5" class="k-pot2"/>`;
    if (p.oil && !p.sauce) s += `<ellipse cx="${cx}" cy="${by - 21}" rx="19" ry="2" fill="#e8c95a"/>`;
    if (p.onion && !p.sauce) s += bits(cx + 2, by - 22, ['#efe3c4', '#e9d9b0', '#efe3c4', '#e9d9b0'], 1.8);
    if (p.garlic && !p.sauce) s += bits(cx + 6, by - 22.6, ['#fbf7ea', '#fbf7ea'], 1.4);
    if (p.sauce) s += `<ellipse cx="${cx}" cy="${by - 21}" rx="19.5" ry="2.6" fill="#b8402c"/>`;
    if (p.pasta) s += `<path d="M${cx - 15} ${by - 23}q3-3 6 0t6 0t6 0t6 0t6 0" fill="none" stroke="#f0d27a" stroke-width="1.8"/>`;
  } else {
    s += `<rect x="${cx + 20}" y="${by - 9}" width="32" height="4" rx="2" fill="#3b3128"/><path d="M${cx - 24} ${by - 9}H${cx + 24}L${cx + 20} ${by}H${cx - 20}Z" class="k-pot2"/>`;
    if (p.butter) s += `<ellipse cx="${cx}" cy="${by - 9}" rx="18" ry="1.6" fill="#f0d36a" opacity=".8"/>`;
    if (p.cake) {
      s += `<ellipse cx="${cx}" cy="${by - 11}" rx="16" ry="3.6" fill="${p.cake >= 3 ? '#c98b45' : '#ecd49a'}"/>`;
      if (p.cake === 2) for (let k = 0; k < 6; k++) s += `<circle cx="${cx - 10 + k * 4}" cy="${by - 11.5 + (k % 2)}" r=".9" fill="#b89560"/>`;
    }
  }
  return s + '</g>';
}
const CUTCOL = { carrot: '#f08a2c', celery: '#8cc86a', onion: '#efe3c4', garlic: '#fbf7ea' };
function boardSVG(cx, by, items) {
  let s = `<g><rect x="${cx - 34}" y="${by - 6}" width="68" height="6" rx="2" class="k-board"/><rect x="${cx - 34}" y="${by - 2}" width="68" height="2" class="k-board2"/>`;
  items.forEach((it, k) => {
    const x = cx - 22 + k * 15, y = by - 6, cut = it.cut || 0;
    if (cut < 1) {
      if (it.kind === 'carrot') s += `<path d="M${n1(x - 10 + cut * 10)} ${y - 3}L${x + 12} ${y - 1.5}L${x + 12} ${y - 4.5}Z" fill="#f08a2c"/><path d="M${x + 12} ${y - 3}l5-3M${x + 12} ${y - 3}l5 1" stroke="#5e9a3c" stroke-width="1.4"/>`;
      else if (it.kind === 'celery') s += `<rect x="${n1(x - 12 + cut * 12)}" y="${y - 4}" width="${n1(24 - cut * 12)}" height="3.4" rx="1.6" fill="#8cc86a"/><path d="M${x + 12} ${y - 3}l4-4M${x + 12} ${y - 3}h5" stroke="#6aa44a" stroke-width="1.4"/>`;
      else if (it.kind === 'onion') s += `<circle cx="${x}" cy="${y - 6}" r="${n1(6.5 * (1 - cut * 0.5))}" fill="#b46a4a"/><path d="M${x} ${y - 12.5}v-2.5" stroke="#8a5a3a" stroke-width="1.2"/>`;
      else if (it.kind === 'garlic') s += `<ellipse cx="${x}" cy="${y - 3.5}" rx="${n1(4 * (1 - cut * 0.5))}" ry="3.5" fill="#f4efe2" stroke="#d9cfbd" stroke-width=".6"/>`;
    }
    const n = Math.round(cut * 8);
    for (let j = 0; j < n; j++) s += `<circle cx="${n1(x - 12 + (j % 4) * 5.5 + (j > 3 ? 2.5 : 0))}" cy="${n1(y - 1.6 - (j > 3 ? 2.4 : 0))}" r="2" fill="${CUTCOL[it.kind]}"/>`;
  });
  return s + '</g>';
}
function bowlSVG(cx, by, kind) {
  const col = { dry: '#f4f1ea', batter: '#e9cf93' }[kind] || '#e9cf93';
  return `<g><path d="M${cx - 18} ${by - 16}H${cx + 18}C${cx + 18} ${by - 4} ${cx + 10} ${by} ${cx} ${by}C${cx - 10} ${by} ${cx - 18} ${by - 4} ${cx - 18} ${by - 16}Z" fill="#dfe6ea"/><ellipse cx="${cx}" cy="${by - 16}" rx="18" ry="3" fill="${col}"/></g>`;
}
function jugSVG(cx, by) {
  return `<g><path d="M${cx - 8} ${by - 20}H${cx + 8}V${by}H${cx - 8}Z" fill="#e8eef2" opacity=".9"/><rect x="${cx - 8}" y="${by - 12}" width="16" height="12" fill="#fbf8ef"/><path d="M${cx + 8} ${by - 17}C${cx + 14} ${by - 16} ${cx + 14} ${by - 7} ${cx + 8} ${by - 6}" fill="none" stroke="#c9d2d8" stroke-width="1.6"/></g>`;
}
function plateSVG(cx, by, kind, n) {
  if (kind === 'soup') return `<g><path d="M${cx - 16} ${by - 13}H${cx + 16}C${cx + 16} ${by - 3} ${cx + 8} ${by} ${cx} ${by}C${cx - 8} ${by} ${cx - 16} ${by - 3} ${cx - 16} ${by - 13}Z" fill="#f4f1ea" stroke="#d9d3c4" stroke-width=".8"/><ellipse cx="${cx}" cy="${by - 13}" rx="16" ry="2.8" fill="#d9a441"/>${bits(cx + 4, by - 13.5, ['#f08a2c', '#8cc86a', '#e9c9a0', '#4f8a3a'], 1.6)}<path d="M${cx - 8} ${by - 13}q3-2 6 0t6 0" fill="none" stroke="#f0d27a" stroke-width="1.4"/></g>`;
  let s = `<g><ellipse cx="${cx}" cy="${by - 1.5}" rx="21" ry="3" fill="#f4f1ea" stroke="#d9d3c4" stroke-width=".8"/>`;
  if (kind === 'legs') s += legSVG(cx - 9, by - 8, 72, true) + legSVG(cx + 9, by - 9, 108, true) + legSVG(cx, by - 12, 88, true);
  if (kind === 'shredded') s += bits(cx + 2, by - 4, ['#e9c9a0', '#dcb58a', '#e9c9a0', '#dcb58a', '#e9c9a0']) + `<path d="M${cx + 12} ${by - 4}l9-5M${cx + 13} ${by - 2.5}l8-2" stroke="#f1e7d0" stroke-width="2.4" stroke-linecap="round"/>`;
  if (kind === 'pancakes') {
    for (let k = 0; k < n; k++) s += `<ellipse cx="${cx}" cy="${n1(by - 4 - k * 3.4)}" rx="16" ry="3.2" fill="#c98b45" stroke="#b07a3c" stroke-width=".6"/>`;
    if (n >= 3) s += `<rect x="${cx - 4}" y="${n1(by - 9 - n * 3.4)}" width="8" height="4" rx="1" fill="#f7df7a"/><path d="M${cx + 12} ${n1(by - 4 - (n - 1) * 3.4)}q2 5 0 9" stroke="#8a4a1a" stroke-width="2" fill="none"/>`;
  }
  if (kind === 'spaghetti') s += `<path d="M${cx - 14} ${by - 4}q3-6 6 0t6 0t6 0t6 0" fill="none" stroke="#f0d27a" stroke-width="2.6"/><path d="M${cx - 10} ${by - 7}q3-5 6 0t6 0t6 0" fill="none" stroke="#f0d27a" stroke-width="2.4"/><ellipse cx="${cx}" cy="${by - 9}" rx="9" ry="3" fill="#b8402c"/><path d="M${cx - 3} ${by - 12}l3-3 3 3z" fill="#4f8a3a"/><circle cx="${cx + 5}" cy="${by - 10}" r="1" fill="#fbf7ea"/><circle cx="${cx - 5}" cy="${by - 9}" r="1" fill="#fbf7ea"/>`;
  return s + '</g>';
}
function itemSVG(kind, cx, by) {
  switch (kind) {
    case 'chicken': return `<g><rect x="${cx - 16}" y="${by - 7}" width="32" height="7" rx="2" fill="#f7f4ec" stroke="#d9cfbd"/><ellipse cx="${cx - 5}" cy="${by - 8}" rx="8" ry="4" fill="#e6a9a0"/><ellipse cx="${cx + 7}" cy="${by - 8}" rx="7" ry="3.6" fill="#dd9d93"/></g>`;
    case 'veg': return `<g><path d="M${cx - 14} ${by - 3}L${cx + 8} ${by - 1.5}L${cx + 8} ${by - 4.5}Z" fill="#f08a2c"/><rect x="${cx - 12}" y="${by - 9}" width="22" height="3.2" rx="1.6" fill="#8cc86a"/><circle cx="${cx + 13}" cy="${by - 6}" r="6" fill="#b46a4a"/></g>`;
    case 'flour': return `<g><path d="M${cx - 9} ${by}V${by - 22}L${cx - 6} ${by - 26}H${cx + 6}L${cx + 9} ${by - 22}V${by}Z" fill="#f4f1ea" stroke="#d9cfbd"/><rect x="${cx - 7}" y="${by - 16}" width="14" height="6" fill="#c9a25a"/></g>`;
    case 'milk': return `<g><path d="M${cx - 6} ${by}V${by - 18}L${cx} ${by - 24}L${cx + 6} ${by - 18}V${by}Z" fill="#fbfaf5" stroke="#cfd6db"/><rect x="${cx - 6}" y="${by - 14}" width="12" height="6" fill="#6aa0c8"/></g>`;
    case 'egg': return `<ellipse cx="${cx}" cy="${by - 5}" rx="4" ry="5.2" fill="#f7efe0" stroke="#d9cfbd" stroke-width=".6"/>`;
    case 'butter': return `<rect x="${cx - 8}" y="${by - 6}" width="16" height="6" rx="1" fill="#f7df7a" stroke="#d9bd52" stroke-width=".6"/>`;
    case 'can': return `<g><rect x="${cx - 7}" y="${by - 16}" width="14" height="16" rx="2" fill="#b8402c"/><rect x="${cx - 7}" y="${by - 11}" width="14" height="6" fill="#f4efe2"/></g>`;
    case 'pasta': return `<g><rect x="${cx - 5}" y="${by - 26}" width="10" height="26" rx="1" fill="#3f6fa8"/><rect x="${cx - 5}" y="${by - 18}" width="10" height="8" fill="#f0d27a"/></g>`;
    case 'noodles': return `<g><rect x="${cx - 9}" y="${by - 12}" width="18" height="12" rx="2" fill="#f4efe2" stroke="#d9cfbd"/><path d="M${cx - 6} ${by - 6}q2-2 4 0t4 0t4 0" fill="none" stroke="#e8c85a" stroke-width="1.4"/></g>`;
    case 'herbs': return `<g><path d="M${cx - 6} ${by}l2-12M${cx} ${by}v-14M${cx + 6} ${by}l-2-12" stroke="#4f8a3a" stroke-width="1.6"/><circle cx="${cx - 4}" cy="${by - 11}" r="2.4" fill="#5f9a46"/><circle cx="${cx}" cy="${by - 14}" r="2.6" fill="#5f9a46"/><circle cx="${cx + 4}" cy="${by - 11}" r="2.4" fill="#5f9a46"/></g>`;
    case 'lemon': return `<path d="M${cx - 6} ${by}A6 6 0 0 1 ${cx + 6} ${by}Z" fill="#f2d33a" stroke="#d8b82a" stroke-width=".6"/>`;
    case 'catfood': return `<g><path d="M${cx - 8} ${by}V${by - 18}L${cx - 6} ${by - 22}H${cx + 6}L${cx + 8} ${by - 18}V${by}Z" fill="#3f6fa8"/><rect x="${cx - 6}" y="${by - 14}" width="12" height="7" rx="1.5" fill="#f4efe2"/><path d="M${cx - 4} ${by - 10.5}q2-2.4 5 0q-3 2.4-5 0zM${cx + 1} ${by - 10.5}l2.4-1.6v3.2z" fill="#e07a2e"/></g>`;
    case 'pot': return potSVG(cx, by, kit.pot || { water: 0 });
    case 'board': return boardSVG(cx, by, kit.board);
    case 'pan': return panSVG(cx, by, kit.pan || { kind: 'fry' });
    case 'bowl': return bowlSVG(cx, by, (kit.bowl && kit.bowl.kind) || 'batter');
    case 'jug': return jugSVG(cx, by);
    case 'plate': return plateSVG(cx, by, (kit.plate && kit.plate.kind) || 'legs', (kit.plate && kit.plate.n) || 0);
    default: return '';
  }
}
function flameSVG(cx, by, low) {
  return `<g transform="translate(${cx} ${by}) scale(${low ? 0.6 : 1})"><path class="flame" d="M-14 0C-14-6-10-9-9-13C-7-8-5-7-5 0Z" fill="#4f8ff0"/><path class="flame" d="M-4 0C-4-7 0-10 1-15C3-9 5-7 5 0Z" fill="#6aa8ff"/><path class="flame" d="M6 0C6-6 9-9 10-13C12-8 14-6 14 0Z" fill="#4f8ff0"/><path class="flame" d="M-3 0C-3-4 0-6 1-9C2-5 3-4 3 0Z" fill="#ffc66a"/></g>`;
}
const carryG = el('g', { 'pointer-events': 'none' }, fxLayer);
const CARRY_DY = { pot: 50, board: 8, plate: 6, bowl: 18, jug: 22, pan: 10 };
function renderKitchen() {
  let s = '';
  if (kit.burners[0]) s += flameSVG(-334, 368, kit.low[0]);
  if (kit.burners[1]) s += flameSVG(-288, 368, kit.low[1]);
  if (kit.pot && kit.pot.at === 'stove') s += potSVG(-334, 367, kit.pot);
  if (kit.pot && kit.pot.at === 'sink') s += `<g clip-path="url(#sinkClip)">${potSVG(-438, 398, kit.pot)}</g>`;
  if (kit.pan && kit.pan.at === 'stove') s += panSVG(-288, 367, kit.pan);
  if (kit.faucet) s += `<path d="M-408 327V${kit.pot && kit.pot.at === 'sink' ? 343 : 378}" stroke="#9fd0ea" stroke-width="3" stroke-linecap="round" opacity=".85"/>`;
  if (kit.carry !== 'board') s += boardSVG(-182, 394, kit.board);
  if (kit.bowl && kit.carry !== 'bowl') s += bowlSVG(-124, 394, kit.bowl.kind);
  if (kit.jug && kit.carry !== 'jug') s += jugSVG(-100, 394);
  kit.items.forEach((it, k) => { s += itemSVG(it, -126 + k * 13, 394); });
  if (kit.plate && kit.carry !== 'plate') s += plateSVG(-108, 394, kit.plate.kind, kit.plate.n || 0);
  if (kit.serve) s += plateSVG(-126, 394, kit.serve, 4);
  $('#kitDyn').innerHTML = s;
  $('#hoodLight').classList.toggle('on', kit.hood);
  setOp('gHood', kit.hood ? (isDark() ? 0.9 : 0.35) : 0);
  setOp('gFlame0', kit.burners[0] ? 0.9 : 0); setOp('gFlame1', kit.burners[1] ? 0.8 : 0);
  $('#kCabDoor').classList.toggle('open', kit.cabOpen); $('#kFridgeDoor').classList.toggle('open', kit.fridgeOpen);
  setOp('gKFridge', kit.fridgeOpen ? (isDark() ? 0.5 : 0.2) : 0);
  carryG.innerHTML = kit.carry ? itemSVG(kit.carry, 0, 0) : '';
  if (kit.carry) positionCarry();
}
function holdFront() {
  const hi = { pot: 416, board: 404, plate: 404, pan: 404, jug: 410, bowl: 410 }[kit.carry] || 414;
  reachR(bo.x + mirrorGoal() * 38, hi, 60);
}
function positionCarry() {
  const t = toolTip(34), m = mirrorNow(), dx = kit.carry === 'pot' ? 30 * m : kit.carry === 'board' ? 22 * m : 0;
  carryG.setAttribute('transform', `translate(${n1(t.x + dx)} ${n1(t.y + (CARRY_DY[kit.carry] || 10))})`);
}
let steamT = 0;
function kitchenTick(dt) {
  if (kit.carry) positionCarry();
  steamT -= dt;
  if (steamT > 0 || RM.matches) return;
  steamT = 0.22;
  if (kit.pot && kit.pot.at === 'stove' && kit.burners[0] && kit.pot.water > 0.3) steamPuff(-334 + rand(-16, 16), 314, 1);
  if (kit.pan && kit.pan.at === 'stove' && kit.burners[1] && (kit.pan.sauce || kit.pan.onion || kit.pan.cake)) steamPuff(-288 + rand(-12, 12), 344, 0.6);
  if (kit.serve && Math.random() < 0.5) steamPuff(-126 + rand(-6, 6), 378, 0.5);
}
function steamPuff(x, y, s) { parts.push({ kind: 'dot', x, y, vx: rand(-4, 4), vy: -rand(14, 24), g: -4, life: rand(1.2, 2), age: 0, op: 0.45, node: el('circle', { class: 'steam', r: n1(rand(3, 5.5) * s) }, fxLayer) }); }
function tossBits(x0, y0, x1, y1, colors, n) {
  if (RM.matches) return;
  for (let k = 0; k < n; k++) {
    const T = rand(0.4, 0.62), vx = (x1 + rand(-8, 8) - x0) / T, vy = (y1 - y0) / T - 0.5 * 420 * T;
    parts.push({ kind: 'dot', x: x0 + rand(-3, 3), y: y0, vx, vy, g: 420, life: T, age: 0, node: el('circle', { r: n1(rand(1.4, 2.4)), fill: pick(colors) }, fxLayer) });
  }
}
function streamDrop(x0, y0, x1, y1, cls) {
  const T = 0.32, vx = (x1 - x0) / T, vy = (y1 - y0) / T - 0.5 * 420 * T;
  parts.push({ kind: 'dot', x: x0 + rand(-1, 1), y: y0, vx, vy, g: 420, life: T, age: 0, node: el('circle', { class: 'pourfx ' + (cls || ''), r: 1.9 }, fxLayer) });
}

/* ---------- Bo's head gadgets ---------- */
function gadget(name, on) { bo.gadGoal[name] = on ? 1 : 0; }
async function useLens(tok, ms, x, y) {
  face(x); lookAt(x, y); setExpr('curious'); gadget('lens', true);
  await wait(ms, tok); gadget('lens', false);
}

/* ---------- kitchen moves ---------- */
async function kGo(x, faceX, tok, mood) { await walkTo(x, tok); if (tok.c) return false; face(faceX); if (mood) setExpr(mood); await wait(220, tok); return !tok.c; }
async function kFromFridge(tok, what) {
  if (!(await kGo(-112, -30, tok, 'curious'))) return false;
  reachR(-24, 346, 120); await wait(420, tok); if (tok.c) return false;
  kit.fridgeOpen = true; renderKitchen(); reachR(-50, 384, 120);
  await wait(520, tok); if (tok.c) { kit.fridgeOpen = false; renderKitchen(); return false; }
  kit.carry = what; renderKitchen(); holdFront();
  await wait(260, tok); kit.fridgeOpen = false; renderKitchen();
  return !tok.c;
}
async function kFromCabinet(tok, what) {
  if (!(await kGo(-470, -434, tok, 'lookup'))) return false;
  reachR(-436, 206, 210); await wait(480, tok); if (tok.c) return false;
  kit.cabOpen = true; renderKitchen(); reachR(-452, 176, 210);
  await wait(460, tok); if (tok.c) { kit.cabOpen = false; renderKitchen(); return false; }
  kit.carry = what; renderKitchen(); holdFront();
  await wait(260, tok); kit.cabOpen = false; renderKitchen();
  return !tok.c;
}
async function kToIsland(tok, place) {
  if (!(await kGo(-258, -170, tok))) return false;
  reachR(-150, 388, 120); await wait(460, tok); if (tok.c) return false;
  kit.carry = null; place(); renderKitchen(); resetArmR();
  await wait(200, tok); return !tok.c;
}
async function kChop(tok, idxs, fine) {
  if (!(await kGo(-258, -176, tok, 'squint'))) return false;
  setTool('knife');
  for (const i of idxs) {
    const it = kit.board[i]; if (!it) continue;
    const x = -182 - 22 + i * 15, hits = fine ? 7 : 3;
    for (let k = 0; k < hits && !tok.c; k++) {
      reachR(x + 4, 366, 120); await wait(140, tok); if (tok.c) break;
      reachR(x + 4, 386, 120); await wait(120, tok); if (tok.c) break;
      it.cut = Math.min(1, (it.cut || 0) + 1 / hits); renderKitchen();
      tossBits(x + 2, 386, x + 6 + rand(-8, 8), 389, [CUTCOL[it.kind]], 2);
    }
    if (tok.c) break;
  }
  resetArms(); return !tok.c;
}
async function kBoardTo(tok, target) {
  if (!(await kGo(-258, -176, tok))) return false;
  reachR(-182, 390, 120); await wait(420, tok); if (tok.c) return false;
  const cols = kit.board.map((b) => CUTCOL[b.kind]);
  kit.carry = 'board'; renderKitchen(); holdFront();
  if (!(await kGo(-392, -334, tok))) { kit.carry = null; renderKitchen(); return false; }
  const tx = target === 'pan' ? -288 : -334, ty = target === 'pan' ? 344 : 314;
  reachR(tx - 12, ty - 14, 150); await wait(520, tok); if (tok.c) { kit.carry = null; renderKitchen(); return false; }
  const t = toolTip(34); tossBits(t.x + 14 * mirrorNow(), t.y + 6, tx, ty, cols.length ? cols : ['#f08a2c'], 12);
  await wait(300, tok);
  kit.board = []; kit.carry = null; renderKitchen(); resetArmR();
  await wait(300, tok); return !tok.c;
}
async function kStir(tok, where, ms, tool) {
  const tx = where === 'pan' ? -288 : -334, ty = where === 'pan' ? 348 : 318;
  if (!(await kGo(-392, tx, tok, 'content'))) return false;
  setTool(tool || 'ladle');
  const t0 = now();
  while (now() - t0 < ms && !tok.c) { const a = (now() - t0) / 240; reachR(tx + Math.cos(a) * 9, ty - 4 + Math.sin(a) * 3, 150); await wait(80, tok); }
  resetArms(); return !tok.c;
}
async function kBurner(tok, i, on, low) {
  if (!(await kGo(-392, i ? -288 : -350, tok))) return false;
  reachR(i ? -288 : -350, 359, 120); await wait(420, tok); if (tok.c) return false;
  kit.burners[i] = on; kit.low[i] = !!low; kit.hood = kit.burners[0] || kit.burners[1]; renderKitchen(); resetArmR();
  await wait(250, tok); return !tok.c;
}
async function kFill(tok, level) {
  if (!(await kGo(-470, -438, tok, 'curious'))) return false;
  kit.pot.at = 'sink'; renderKitchen();
  reachR(-452, 370, 60); await wait(380, tok); if (tok.c) return false;
  kit.faucet = true; renderKitchen();
  while (kit.pot.water < level && !tok.c) { kit.pot.water = Math.min(level, kit.pot.water + 0.05); if (Math.random() < 0.5) splashAt(-410 + rand(-6, 6), 342); renderKitchen(); await wait(90, tok); }
  kit.faucet = false; renderKitchen(); resetArmR(); return !tok.c;
}
async function kPotToStove(tok) {
  if (!(await kGo(-470, -438, tok))) return false;
  reachR(-468, 352, 60); await wait(380, tok); if (tok.c) return false;
  kit.pot.at = 'hand'; kit.carry = 'pot'; renderKitchen(); holdFront();
  if (!(await kGo(-392, -334, tok))) return false;
  reachR(-356, 330, 120); await wait(420, tok);
  kit.pot.at = 'stove'; kit.carry = null; renderKitchen(); resetArmR();
  return !tok.c;
}
async function kSpices(tok, cls, tx, ty, n) {
  if (!(await kGo(-470, -448, tok, 'lookup'))) return false;
  reachR(-448, 250, 160); await wait(420, tok); if (tok.c) return false;
  resetArmR();
  if (!(await kGo(-392, tx, tok))) return false;
  return kSprinkle(tok, tx, ty, cls, n);
}
async function kSprinkle(tok, tx, ty, cls, n) {
  reachR(tx - 6, ty - 26, 150); await wait(350, tok);
  const col = { g: '#5f9a46', w: '#f7f4ec', r: '#b8402c', d: '#3b3128' }[cls] || '#5f9a46';
  for (let k = 0; k < n && !tok.c; k++) { const t = toolTip(34); tossBits(t.x, t.y, tx + rand(-10, 10), ty, [col], 1); bo.goal.armR += k % 2 ? 7 : -7; await wait(70, tok); }
  resetArmR(); return !tok.c;
}
async function kPour(tok, tx, ty, cls, ms) {
  const t0 = now();
  while (now() - t0 < ms && !tok.c) { const t = toolTip(36); streamDrop(t.x + 6 * mirrorNow(), t.y, tx + rand(-4, 4), ty, cls); await wait(40, tok); }
  return !tok.c;
}
async function kWash(tok, ms) {
  if (!(await kGo(-470, -438, tok, 'content'))) return false;
  kit.faucet = true; renderKitchen();
  const t0 = now();
  while (now() - t0 < ms && !tok.c) {
    reachR(-430 + rand(-4, 4), 368, 60); reachL(-426 + rand(-4, 4), 370, 60);
    if (Math.random() < 0.6) puff(-430 + rand(-8, 8), 368, 1, 'steam');
    await wait(160, tok);
  }
  kit.faucet = false; renderKitchen(); resetArms(); return !tok.c;
}
async function kSkip(tok, text, apply) {
  const card = $('#skipCard'); $('#skipText').textContent = text; card.hidden = false;
  const a = stageXY(-300, 150);
  if (a && !clip.on) { card.style.left = clamp(a.x, card.offsetWidth / 2 + 8, a.w - card.offsetWidth / 2 - 8) + 'px'; card.style.top = clamp(a.y, card.offsetHeight / 2 + 8, a.h - card.offsetHeight / 2 - 8) + 'px'; }
  else { card.style.left = '50%'; card.style.top = '42%'; }
  await wait(1500, tok);
  if (apply) { apply(); renderKitchen(); }
  await wait(700, tok);
  $('#skipCard').hidden = true;
  return !tok.c;
}
async function flipCake(tok) {
  kit.pan.cake = 0; renderKitchen();
  const node = el('ellipse', { rx: 16, ry: 3.6, fill: '#ecd49a', cx: -288 }, fxLayer), t0 = now(), T = 700;
  while (now() - t0 < T && !tok.c) {
    const u = (now() - t0) / T;
    node.setAttribute('cy', n1(356 - Math.sin(u * Math.PI) * 62));
    node.setAttribute('ry', n1(Math.max(0.4, 3.6 * Math.abs(Math.cos(u * Math.PI * 2)))));
    node.setAttribute('fill', u > 0.5 ? '#c98b45' : '#ecd49a');
    await wait(30, tok);
  }
  node.remove(); kit.pan.cake = 3; renderKitchen();
}

/* ---------- the lessons (real recipes) ---------- */
const LESSONS = [
  {
    id: 'soup', n: 1, title: 'Chicken soup', meta: 'Serves 6. About 2 hours, mostly simmering.',
    intro: "Welcome to Bo's Kitchen. Lesson one, chicken soup. It's a real recipe, the card has every amount.",
    outro: "That's chicken soup. Chicken is safe at 165 degrees Fahrenheit, and a simmer that long goes well past it. Class dismissed.",
    note: 'Chicken is done at 165°F (74°C). Wash your hands, boards, and knives after touching raw chicken.',
    ingredients: ['3 to 4 lb bone-in chicken pieces (legs, thighs, backs) or 1 whole chicken', '12 cups cold water', '1 large onion, halved', '4 carrots: 2 in big chunks, 2 sliced', '4 celery stalks: 2 in big chunks, 2 sliced', '3 garlic cloves, smashed', '1 bay leaf and 4 sprigs fresh thyme (or 1/2 tsp dried)', '1 tsp whole black peppercorns', '2 tsp salt, plus more to taste', '2 cups dried egg noodles (optional)', '2 tbsp chopped fresh parsley and a squeeze of lemon'],
    setup() { kit.pot = { at: 'sink', water: 0, liquid: 'water', legs: 0 }; },
    steps: [
      {
        card: 'Put the chicken in a large stockpot and cover it with the 12 cups of cold water.',
        say: 'Chicken goes in the big pot, twelve cups of cold water on top. Starting cold gives you a clearer broth.',
        async act(tok) {
          if (!(await kFromFridge(tok, 'chicken'))) return;
          if (!(await kGo(-470, -438, tok))) return;
          reachR(-438, 332, 90); await wait(450, tok); if (tok.c) return;
          kit.carry = null; kit.pot.legs = 3; renderKitchen(); resetArmR();
          if (!(await kFill(tok, 1))) return;
          await kPotToStove(tok);
        },
        apply() { kit.pot = { at: 'stove', water: 1, liquid: 'water', legs: 3 }; },
      },
      {
        card: 'Bring to a boil over medium-high heat, then lower to a gentle simmer. Skim off the gray foam that rises in the first 10 to 15 minutes.',
        say: "Boil it, then turn it down to a gentle simmer. Skim off the foam. It's harmless, just ugly.",
        async act(tok) {
          if (!(await kBurner(tok, 0, true))) return;
          if (!(await kSkip(tok, 'Ten minutes later', () => { kit.pot.foam = true; }))) return;
          await useLens(tok, 1300, -334, 316); if (tok.c) return;
          if (!(await kStir(tok, 'pot', 1700, 'ladle'))) return;
          kit.pot.foam = false; renderKitchen();
          await kBurner(tok, 0, true, true);
        },
        apply() { kit.burners[0] = true; kit.low[0] = true; kit.hood = true; kit.pot.foam = false; },
      },
      {
        card: 'Add the onion, the chunked carrots and celery, garlic, bay leaf, thyme, peppercorns, and 2 tsp salt. Simmer partly covered about 1 1/2 hours, until the meat falls off the bone.',
        say: 'Now the flavor crew. Onion, chunked carrot and celery, garlic, bay leaf, thyme, peppercorns, salt. Big pieces. Nobody sees them.',
        async act(tok) {
          if (!(await kFromFridge(tok, 'veg'))) return;
          if (!(await kToIsland(tok, () => { kit.board = [{ kind: 'onion' }, { kind: 'carrot' }, { kind: 'celery' }, { kind: 'garlic' }]; }))) return;
          if (!(await kChop(tok, [0, 1, 2, 3], false))) return;
          if (!(await kBoardTo(tok, 'pot'))) return;
          kit.pot.veg = true; renderKitchen();
          if (!(await kSpices(tok, 'g', -334, 316, 12))) return;
          kit.pot.herbs = true; renderKitchen();
        },
        apply() { kit.pot.veg = true; kit.pot.herbs = true; kit.board = []; },
      },
      {
        card: 'While it simmers, slice the other 2 carrots and 2 celery stalks into bite-size pieces. Wash your hands and anything that touched raw chicken.',
        say: 'While that goes, wash up and slice the fresh carrots and celery. Raw chicken gets on everything.',
        async act(tok) {
          if (!(await kWash(tok, 1500))) return;
          if (!(await kFromFridge(tok, 'veg'))) return;
          if (!(await kToIsland(tok, () => { kit.board = [{ kind: 'carrot' }, { kind: 'carrot' }, { kind: 'celery' }, { kind: 'celery' }]; }))) return;
          await kChop(tok, [0, 1, 2, 3], true);
        },
        apply() { kit.board = [{ kind: 'carrot', cut: 1 }, { kind: 'carrot', cut: 1 }, { kind: 'celery', cut: 1 }, { kind: 'celery', cut: 1 }]; },
      },
      {
        card: 'Lift the chicken out onto a plate to cool. Strain the broth into a clean pot and discard the spent vegetables and herbs.',
        say: 'An hour and a half later. Chicken comes out to cool, and the broth gets strained. Those vegetables gave everything they had.',
        async act(tok) {
          if (!(await kSkip(tok, 'An hour and a half later', () => { kit.pot.liquid = 'broth'; }))) return;
          if (!(await kGo(-392, -334, tok, 'curious'))) return;
          await useLens(tok, 1000, -334, 316); if (tok.c) return;
          setTool('ladle'); reachR(-334, 310, 150); await wait(450, tok); if (tok.c) return;
          kit.pot.legs = 0; kit.plate = { kind: 'legs' }; kit.carry = 'plate'; renderKitchen(); setTool('wrench'); holdFront();
          if (!(await kToIsland(tok, () => {}))) return;
          if (!(await kGo(-392, -334, tok, 'squint'))) return;
          setTool('ladle');
          for (let k = 0; k < 3 && !tok.c; k++) { reachR(-334, 312, 150); await wait(280, tok); reachR(-372, 290, 150); await wait(260, tok); const t = toolTip(56); tossBits(t.x, t.y, -438, 376, ['#c8a46a', '#b8a060', '#8a9a5a'], 5); }
          if (tok.c) return;
          kit.pot.veg = false; kit.pot.herbs = false; renderKitchen(); resetArms();
        },
        apply() { kit.pot.liquid = 'broth'; kit.pot.legs = 0; kit.pot.veg = false; kit.pot.herbs = false; kit.plate = { kind: 'legs' }; },
      },
      {
        card: 'Bring the broth back to a simmer, add the sliced carrots and celery, and cook 10 minutes. Add the noodles and cook until tender, about 7 to 8 minutes.',
        say: 'Broth back up to a simmer. Fresh carrots and celery go in for ten minutes, then the noodles for about eight.',
        async act(tok) {
          if (!(await kBurner(tok, 0, true, false))) return;
          if (!(await kBoardTo(tok, 'pot'))) return;
          kit.pot.veg2 = true; renderKitchen();
          if (!(await kFromCabinet(tok, 'noodles'))) return;
          if (!(await kGo(-392, -334, tok))) return;
          reachR(-346, 300, 150); await wait(380, tok); if (tok.c) return;
          await kPour(tok, -334, 316, 'batter', 700); if (tok.c) return;
          kit.carry = null; kit.pot.noodles = true; renderKitchen(); resetArmR();
          await kSkip(tok, 'Ten minutes later');
        },
        apply() { kit.burners[0] = true; kit.low[0] = false; kit.hood = true; kit.pot.veg2 = true; kit.pot.noodles = true; kit.board = []; },
      },
      {
        card: 'Pull the meat off the bones in bite-size pieces. Discard the skin and bones.',
        say: "Pull the meat off the bones. Skin and bones go. This part is weirdly satisfying.",
        async act(tok) {
          if (!(await kGo(-150, -108, tok, 'squint'))) return;
          for (let k = 0; k < 8 && !tok.c; k++) {
            reachR(-108 + rand(-6, 6), 384, 80); reachL(-112 + rand(-6, 6), 384, 80);
            await wait(170, tok); tossBits(-108, 386, -106 + rand(-10, 10), 390, ['#e9c9a0', '#dcb58a'], 2);
            if (k === 5) { kit.plate = { kind: 'shredded' }; renderKitchen(); }
          }
          resetArms();
        },
        apply() { kit.plate = { kind: 'shredded' }; },
      },
      {
        card: 'Stir the chicken back in. Season with salt and pepper, then finish with parsley and a squeeze of lemon.',
        say: 'Chicken back in. Taste it, then salt and pepper. Parsley and a squeeze of lemon to wake it up.',
        async act(tok) {
          if (!(await kGo(-150, -108, tok))) return;
          reachR(-108, 388, 100); await wait(400, tok); if (tok.c) return;
          kit.carry = 'plate'; renderKitchen(); holdFront();
          if (!(await kGo(-392, -334, tok))) return;
          reachR(-350, 300, 150); await wait(450, tok); if (tok.c) return;
          const t = toolTip(34); tossBits(t.x, t.y + 4, -334, 316, ['#e9c9a0', '#dcb58a'], 10);
          await wait(250, tok);
          kit.carry = null; kit.plate = null; kit.pot.chicken = true; renderKitchen(); resetArmR();
          if (!(await kSprinkle(tok, -334, 316, 'd', 8))) return;
          if (!(await kFromFridge(tok, 'herbs'))) return;
          if (!(await kGo(-392, -334, tok))) return;
          await kSprinkle(tok, -334, 316, 'g', 10); if (tok.c) return;
          kit.carry = 'lemon'; renderKitchen(); reachR(-340, 300, 150); await wait(300, tok);
          await kPour(tok, -334, 316, 'oil', 500); if (tok.c) return;
          kit.carry = null; kit.pot.parsley = true; renderKitchen(); resetArmR();
          setTool('ladle'); reachR(-334, 312, 150); await wait(400, tok); if (tok.c) return;
          if (!(await kGo(-170, -126, tok))) return;
          reachR(-126, 378, 100); await wait(300, tok);
          await kPour(tok, -126, 382, 'broth', 600); if (tok.c) return;
          kit.serve = 'soup'; renderKitchen(); resetArms();
        },
        apply() { kit.pot.chicken = true; kit.pot.parsley = true; kit.plate = null; kit.serve = 'soup'; kit.low[0] = true; },
      },
    ],
  },
  {
    id: 'pancakes', n: 2, title: 'Fluffy pancakes', meta: 'Makes about 8. 20 minutes.',
    intro: "Welcome to Bo's Kitchen. Lesson two, pancakes. Two bowls, one pan, one flip. The card has the amounts.",
    outro: "That's pancakes. Rest the batter, flip once, and never press them flat. Class dismissed.",
    note: "Don't press the pancakes flat with the spatula. It squeezes out the air that makes them fluffy.",
    ingredients: ['1 1/2 cups (190 g) all-purpose flour', '1 tbsp sugar', '3 1/2 tsp baking powder', '1/2 tsp salt', '1 1/4 cups (300 ml) milk', '1 large egg', '3 tbsp butter, melted and slightly cooled, plus a little for the pan'],
    setup() { kit.pan = null; },
    steps: [
      {
        card: 'Whisk the flour, sugar, baking powder, and salt in a large bowl.',
        say: 'Dry bowl first. Flour, sugar, baking powder, salt. Whisk so the baking powder spreads out evenly.',
        async act(tok) {
          if (!(await kFromCabinet(tok, 'flour'))) return;
          if (!(await kToIsland(tok, () => { kit.bowl = { kind: 'dry' }; kit.items = []; }))) return;
          await kPour(tok, -124, 378, 'milk', 700); if (tok.c) return;
          if (!(await kGo(-170, -124, tok, 'squint'))) return;
          setTool('whisk');
          for (let k = 0; k < 10 && !tok.c; k++) { reachR(-124 + (k % 2 ? 7 : -7), 374, 100); await wait(90, tok); }
          resetArms();
        },
        apply() { kit.bowl = { kind: 'dry' }; },
      },
      {
        card: 'In a second bowl or a jug, whisk the milk, egg, and melted butter.',
        say: "Wet stuff separate. Milk, one egg, three tablespoons of melted butter. Let the butter cool a little so it doesn't cook the egg.",
        async act(tok) {
          if (!(await kFromFridge(tok, 'milk'))) return;
          if (!(await kToIsland(tok, () => { kit.jug = true; }))) return;
          if (!(await kGo(-150, -100, tok, 'curious'))) return;
          reachR(-100, 368, 100); await wait(300, tok);
          await kPour(tok, -100, 376, 'milk', 600); if (tok.c) return;
          tossBits(-100, 362, -100, 376, ['#f7c948', '#fbf7ea'], 4);
          setTool('whisk');
          for (let k = 0; k < 8 && !tok.c; k++) { reachR(-100 + (k % 2 ? 4 : -4), 374, 100); await wait(90, tok); }
          resetArms();
        },
        apply() { kit.jug = true; },
      },
      {
        card: 'Pour the wet into the dry and stir just until no dry flour shows. Lumps are fine. Let the batter rest 5 minutes.',
        say: 'Wet into dry. Stir just until the flour disappears. Lumps are fine. Overmixing makes them tough.',
        async act(tok) {
          if (!(await kGo(-150, -100, tok))) return;
          reachR(-100, 380, 100); await wait(350, tok); if (tok.c) return;
          kit.carry = 'jug'; renderKitchen(); reachR(-116, 352, 100); await wait(350, tok);
          await kPour(tok, -124, 378, 'batter', 800); if (tok.c) return;
          kit.carry = null; kit.jug = false; kit.bowl = { kind: 'batter' }; renderKitchen();
          setTool('whisk');
          for (let k = 0; k < 4 && !tok.c; k++) { reachR(-124 + (k % 2 ? 6 : -6), 374, 100); await wait(200, tok); }
          resetArms(); if (tok.c) return;
          await kSkip(tok, 'Five minutes later');
        },
        apply() { kit.jug = false; kit.bowl = { kind: 'batter' }; },
      },
      {
        card: 'Heat a frying pan or griddle over medium heat and wipe it with a little butter.',
        say: "Pan on medium heat, a little butter. If it smokes, it's too hot.",
        async act(tok) {
          if (!(await kGo(-230, -196, tok))) return;
          bo.goal.sit = 0.6; reachR(-150, 432, 120); await wait(500, tok); if (tok.c) return;
          kit.pan = { kind: 'fry', at: 'hand' }; kit.carry = 'pan'; renderKitchen(); bo.goal.sit = 0; holdFront();
          if (!(await kGo(-392, -288, tok))) return;
          reachR(-300, 352, 150); await wait(420, tok);
          kit.pan.at = 'stove'; kit.carry = null; renderKitchen(); resetArmR();
          if (!(await kBurner(tok, 1, true))) return;
          await kSprinkle(tok, -288, 358, 'w', 4); if (tok.c) return;
          kit.pan.butter = true; renderKitchen();
        },
        apply() { kit.pan = { kind: 'fry', at: 'stove', butter: true }; kit.burners[1] = true; kit.hood = true; },
      },
      {
        card: 'Pour about 1/4 cup of batter per pancake.',
        say: 'About a quarter cup of batter per pancake. Pour it in one spot and let it spread on its own.',
        async act(tok) {
          if (!(await kGo(-170, -124, tok))) return;
          setTool('ladle'); reachR(-124, 378, 100); await wait(450, tok); if (tok.c) return;
          if (!(await kGo(-392, -288, tok))) return;
          setTool('ladle'); reachR(-290, 322, 150); await wait(400, tok);
          await kPour(tok, -288, 356, 'batter', 700); if (tok.c) return;
          kit.pan.cake = 1; renderKitchen(); resetArms();
        },
        apply() { kit.pan.cake = 1; },
      },
      {
        card: 'Flip when bubbles pop on the surface and the edges look set, about 2 minutes. Cook the second side about 1 minute, until golden.',
        say: 'Watch for bubbles popping on top and dry edges. That is the signal. Flip once. Only once.',
        async act(tok) {
          if (!(await kSkip(tok, 'Two minutes later', () => { kit.pan.cake = 2; }))) return;
          if (!(await kGo(-392, -288, tok))) return;
          await useLens(tok, 1300, -288, 356); if (tok.c) return;
          setTool('spatula'); reachR(-292, 362, 150); await wait(400, tok); if (tok.c) return;
          reachR(-292, 330, 150); await flipCake(tok);
          resetArms();
        },
        apply() { kit.pan.cake = 3; },
      },
      {
        card: 'Keep the finished ones warm in a low oven, about 200°F (95°C), while you cook the rest. Serve with butter and maple syrup.',
        say: "Keep them warm in a low oven while you cook the rest. Butter, maple syrup. That's breakfast.",
        async act(tok) {
          if (!(await kGo(-392, -288, tok))) return;
          setTool('spatula'); reachR(-292, 360, 150); await wait(400, tok); if (tok.c) return;
          kit.pan.cake = 0; kit.bowl = null; kit.plate = { kind: 'pancakes', n: 1 }; kit.carry = 'plate'; renderKitchen(); setTool('wrench'); holdFront();
          if (!(await kToIsland(tok, () => {}))) return;
          if (!(await kSkip(tok, 'A few pancakes later', () => { kit.plate = { kind: 'pancakes', n: 4 }; kit.burners[1] = false; kit.hood = false; }))) return;
          resetArms();
        },
        apply() { kit.pan.cake = 0; kit.bowl = null; kit.plate = { kind: 'pancakes', n: 4 }; kit.burners[1] = false; kit.hood = false; },
      },
    ],
  },
  {
    id: 'spaghetti', n: 3, title: 'Spaghetti with tomato sauce', meta: 'Serves 4. About 35 minutes.',
    intro: "Welcome to Bo's Kitchen. Lesson three, spaghetti with a real tomato sauce. We use every part of this kitchen.",
    outro: "That's spaghetti with tomato sauce. Salt the water, save some of it, and finish the pasta in the pan. Class dismissed.",
    note: "Salt the water well. It's your only chance to season the pasta itself.",
    ingredients: ['1 lb (450 g) spaghetti', '1 tbsp salt for the pasta water', '3 tbsp olive oil', '1 small onion, finely chopped', '3 garlic cloves, thinly sliced or minced', '1 can (28 oz / 800 g) whole peeled tomatoes', '1/2 tsp salt, plus more to taste', 'A pinch of red pepper flakes (optional)', 'A handful of fresh basil leaves', 'Grated Parmesan, to serve'],
    setup() { kit.pot = { at: 'sink', water: 0, liquid: 'pasta' }; },
    steps: [
      {
        card: 'Fill a big pot with about 4 quarts (4 liters) of water, add 1 tbsp salt, cover, and bring to a boil. It takes a while, so start here.',
        say: 'Pasta water first, because it takes the longest. Big pot, about four quarts, a tablespoon of salt.',
        async act(tok) {
          if (!(await kFill(tok, 1))) return;
          if (!(await kPotToStove(tok))) return;
          if (!(await kSpices(tok, 'w', -334, 316, 8))) return;
          await kBurner(tok, 0, true);
        },
        apply() { kit.pot = { at: 'stove', water: 1, liquid: 'pasta' }; kit.burners[0] = true; kit.hood = true; },
      },
      {
        card: 'Warm the olive oil in a saucepan over medium heat. Cook the onion, stirring now and then, until soft and translucent, about 6 to 8 minutes.',
        say: 'Olive oil in the saucepan. Chop one small onion fine and cook it until soft and see-through. No rush.',
        async act(tok) {
          if (!(await kFromFridge(tok, 'veg'))) return;
          if (!(await kToIsland(tok, () => { kit.board = [{ kind: 'onion' }]; kit.items = []; }))) return;
          if (!(await kChop(tok, [0], true))) return;
          if (!(await kGo(-230, -196, tok))) return;
          bo.goal.sit = 0.6; reachR(-150, 432, 120); await wait(450, tok); if (tok.c) return;
          kit.pan = { kind: 'sauce', at: 'hand' }; kit.carry = 'pan'; renderKitchen(); bo.goal.sit = 0; holdFront();
          if (!(await kGo(-392, -288, tok))) return;
          reachR(-300, 350, 150); await wait(400, tok);
          kit.pan.at = 'stove'; kit.pan.oil = true; kit.carry = null; renderKitchen(); resetArmR();
          if (!(await kBurner(tok, 1, true))) return;
          if (!(await kBoardTo(tok, 'pan'))) return;
          kit.pan.onion = true; renderKitchen();
          await kStir(tok, 'pan', 1400, 'spatula');
        },
        apply() { kit.pan = { kind: 'sauce', at: 'stove', oil: true, onion: true }; kit.board = []; kit.burners[1] = true; kit.hood = true; },
      },
      {
        card: "Add the garlic and a pinch of red pepper flakes and cook about 1 minute, just until fragrant. Don't let it brown.",
        say: 'Garlic and a pinch of pepper flakes. One minute. Burnt garlic turns bitter, so stay close.',
        async act(tok) {
          if (!(await kGo(-258, -176, tok))) return;
          kit.board = [{ kind: 'garlic' }, { kind: 'garlic' }]; renderKitchen();
          if (!(await kChop(tok, [0, 1], true))) return;
          if (!(await kBoardTo(tok, 'pan'))) return;
          kit.pan.garlic = true; renderKitchen();
          if (!(await kSpices(tok, 'r', -288, 346, 5))) return;
          await kStir(tok, 'pan', 900, 'spatula');
        },
        apply() { kit.pan.garlic = true; kit.board = []; },
      },
      {
        card: 'Add the tomatoes with their juice, crush them with a spoon, add 1/2 tsp salt, and simmer 15 to 20 minutes until slightly thickened.',
        say: 'Whole peeled tomatoes, juice and all. Crush them right in the pan, add a little salt, and let it simmer about fifteen minutes.',
        async act(tok) {
          if (!(await kFromCabinet(tok, 'can'))) return;
          if (!(await kGo(-392, -288, tok))) return;
          reachR(-300, 318, 150); await wait(380, tok);
          await kPour(tok, -288, 346, 'sauce', 900); if (tok.c) return;
          kit.carry = null; kit.pan.sauce = true; renderKitchen();
          setTool('ladle');
          for (let k = 0; k < 4 && !tok.c; k++) { reachR(-288, 330, 150); await wait(180, tok); reachR(-288, 346, 150); await wait(160, tok); tossBits(-288, 346, -288 + rand(-12, 12), 348, ['#b8402c'], 3); }
          resetArms(); if (tok.c) return;
          await kSkip(tok, 'Fifteen minutes later');
        },
        apply() { kit.pan.sauce = true; },
      },
      {
        card: "Drop the spaghetti into the boiling water, stir so it doesn't stick, and cook to the package time for al dente, usually 9 to 11 minutes.",
        say: "Spaghetti in. It sticks out at first. Give it a minute and it softens and slides under. Stir so it doesn't clump.",
        async act(tok) {
          if (!(await kFromCabinet(tok, 'pasta'))) return;
          if (!(await kGo(-392, -334, tok))) return;
          reachR(-340, 300, 150); await wait(420, tok); if (tok.c) return;
          kit.carry = null; kit.pot.spaghetti = 'dry'; renderKitchen(); resetArmR();
          setExpr('curious'); await wait(1600, tok); if (tok.c) return;
          if (!(await kSkip(tok, 'One minute later', () => { kit.pot.spaghetti = 'soft'; }))) return;
          if (!(await kStir(tok, 'pot', 1200, 'ladle'))) return;
          await kSkip(tok, 'Ten minutes later');
        },
        apply() { kit.pot.spaghetti = 'soft'; },
      },
      {
        card: 'Scoop out a cup of pasta water, then drain.',
        say: 'Save a cup of the cooking water. The starch helps the sauce cling. Then drain.',
        async act(tok) {
          if (!(await kGo(-392, -334, tok))) return;
          setTool('ladle'); reachR(-334, 312, 150); await wait(400, tok); if (tok.c) return;
          reachR(-300, 300, 150); await wait(300, tok);
          await kPour(tok, -288, 346, 'water', 500); if (tok.c) return;
          resetArms();
          if (!(await kBurner(tok, 0, false))) return;
          reachR(-356, 330, 120); await wait(380, tok); if (tok.c) return;
          kit.pot.at = 'hand'; kit.carry = 'pot'; renderKitchen(); holdFront();
          if (!(await kGo(-470, -438, tok))) return;
          reachR(-440, 340, 60); await wait(400, tok); if (tok.c) return;
          for (let k = 0; k < 10; k++) steamPuff(-438 + rand(-20, 20), 360, 1.2);
          kit.pot.water = 0; kit.pot.at = 'sink'; kit.carry = null; renderKitchen(); resetArmR();
          await wait(600, tok);
        },
        apply() { kit.pot.water = 0; kit.pot.at = 'sink'; kit.burners[0] = false; kit.hood = kit.burners[1]; },
      },
      {
        card: 'Toss the spaghetti in the sauce over low heat, adding splashes of pasta water until glossy. Tear in the basil and serve with Parmesan.',
        say: "Pasta into the sauce with a splash of that water. Toss until it's glossy. Basil, Parmesan, dinner.",
        async act(tok) {
          if (!(await kGo(-470, -438, tok))) return;
          setTool('ladle'); reachR(-438, 340, 60); await wait(350, tok); if (tok.c) return;
          if (!(await kGo(-392, -288, tok))) return;
          reachR(-300, 330, 150); await wait(350, tok);
          tossBits(toolTip(56).x, toolTip(56).y, -288, 346, ['#f0d27a', '#e8c85a'], 12); await wait(300, tok);
          kit.pot = null; kit.pan.pasta = true; kit.low[1] = true; renderKitchen();
          if (!(await kStir(tok, 'pan', 1300, 'spatula'))) return;
          if (!(await kFromFridge(tok, 'herbs'))) return;
          if (!(await kGo(-392, -288, tok))) return;
          await kSprinkle(tok, -288, 346, 'g', 6); if (tok.c) return;
          kit.carry = null; renderKitchen();
          if (!(await kGo(-170, -126, tok))) return;
          kit.serve = 'spaghetti'; renderKitchen();
          await kSprinkle(tok, -126, 384, 'w', 6);
        },
        apply() { kit.pot = null; kit.pan.pasta = true; kit.low[1] = true; kit.serve = 'spaghetti'; },
      },
    ],
  },
];

/* ---------- running a class ---------- */
const cls = { on: false, L: null, step: 0, paused: false, tok: null, jump: null, run: 0, want: 0, expanded: false, intro: false };
const recipe = $('#recipe');
function buildCard(L) {
  $('#rKicker').textContent = `Bo's Kitchen, lesson ${L.n}`;
  $('#rTitle').textContent = L.title;
  $('#rMeta').textContent = L.meta;
  const ul = $('#rIngr'); ul.textContent = '';
  L.ingredients.forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
  const ol = $('#rSteps'); ol.textContent = '';
  L.steps.forEach((s) => { const li = document.createElement('li'); li.textContent = s.card; ol.appendChild(li); });
  $('#rNote').textContent = L.note;
}
function renderCard() {
  const L = cls.L; if (!L) return;
  recipe.hidden = clip.on;
  $$('#rSteps li').forEach((li, i) => { li.classList.toggle('now', i === cls.step); li.classList.toggle('done', i < cls.step); });
  $('#rNow').textContent = cls.step < L.steps.length ? `Step ${cls.step + 1} of ${L.steps.length}: ${L.steps[cls.step].card}` : 'All done.';
  $('#rPause').textContent = cls.paused ? 'Play' : 'Pause';
  $('#rToggle').textContent = cls.expanded ? 'Less' : 'Recipe';
  const sw = stage.getBoundingClientRect().width, compact = sw < 720 && !cls.expanded;
  stage.classList.toggle('narrow', sw < 600);
  recipe.classList.toggle('compact', compact);
  if (sw < 600) stage.style.setProperty('--rh', recipe.offsetHeight + 'px');
  const cur = $$('#rSteps li')[cls.step];
  if (cur && !compact) { const body = $('#rBody'); body.scrollTop = Math.max(0, cur.offsetTop - body.clientHeight / 2); }
}
function showLowerThird(L) {
  $('#ltLesson').textContent = `Lesson ${L.n}: ${L.title}`;
  const lt = $('#lowerThird'); lt.hidden = false;
  clearTimeout(showLowerThird.t); showLowerThird.t = setTimeout(() => { lt.hidden = true; }, 4200);
}
function rebuildTo(L, j) { resetKitchen(); L.setup(); for (let k = 0; k < j; k++) L.steps[k].apply(); renderKitchen(); }
async function startClass(id) {
  const L = LESSONS.find((x) => x.id === id);
  if (!L) return;
  closeFlyouts(); hideTip();
  if (bo.mode === 'nap') { napNudge(); return; }
  if (cls.on) endClass(true);
  const want = ++cls.want;
  if (bo.mode === 'boot' || bo.mode === 'napwalk') { statusText.textContent = `Class next: ${L.title.toLowerCase()}`; while (bo.mode === 'boot' || bo.mode === 'napwalk') await sleep(200); }
  if (want !== cls.want || cls.on) return;
  interrupt(); hideBubbleNow(); forceNext = null;
  const my = ++cls.run;
  Object.assign(cls, { on: true, L, step: 0, paused: false, jump: null, intro: false });
  bo.mode = 'class'; bo.speed = 80; gadget('hat', true);
  resetKitchen(); L.setup(); renderKitchen(); buildCard(L); renderCard(); showLowerThird(L);
  setDoing(`Teaching ${L.title.toLowerCase()}`, `teaching a cooking class in the kitchen: ${L.title.toLowerCase()}`);
  const tok0 = makeTok(); cls.tok = tok0; activity = tok0;
  bo.speed = 120; cls.intro = true;
  const introSpeech = say(L.intro, readTime(L.intro) + 800);
  await walkTo(-300, tok0);
  bo.speed = 80;
  if (!cls.on || cls.run !== my) return;
  if (!tok0.c) { faceFront(); setExpr('happy'); await introSpeech; await wait(700, tok0); }
  cls.intro = false;
  if (!cls.on || cls.run !== my) return;
  if (cls.jump != null) { const j = cls.jump; cls.jump = null; rebuildTo(L, j); cls.step = j; }
  while (cls.on && cls.run === my && cls.step < L.steps.length) {
    const i = cls.step, st = L.steps[i];
    renderCard();
    const tok = makeTok(); cls.tok = tok; activity = tok;
    statusText.textContent = `Teaching ${L.title.toLowerCase()}, step ${i + 1} of ${L.steps.length}`;
    faceFront(); setExpr('content');
    const speech = say(st.say, readTime(st.say) + 2600);
    await wait(1300, tok);
    if (!tok.c) { try { await st.act(tok); } catch (err) { console.error(err); } }
    await speech;
    if (!cls.on || cls.run !== my) return;
    stopWeld(); resetArms(); gadget('lens', false); gadget('scope', false);
    if (tok.c && cls.jump != null) { const j = cls.jump; cls.jump = null; rebuildTo(L, j); cls.step = j; continue; }
    kit.carry = null; kit.fridgeOpen = false; kit.cabOpen = false; kit.faucet = false; st.apply(); renderKitchen();
    cls.step = i + 1; renderCard();
    const t1 = now();
    while ((cls.paused || now() - t1 < 900) && cls.on && cls.run === my && cls.jump == null) {
      if (cls.paused) statusText.textContent = cls.step < L.steps.length ? `Paused. Next up: step ${cls.step + 1} of ${L.steps.length}` : 'Paused before the wrap-up';
      await sleep(150);
    }
    if (cls.jump != null) { const j = cls.jump; cls.jump = null; rebuildTo(L, j); cls.step = j; }
  }
  if (!cls.on || cls.run !== my) return;
  const tokE = makeTok(); cls.tok = tokE; activity = tokE;
  await walkTo(-200, tokE);
  faceFront(); setExpr('happy');
  await say(L.outro, readTime(L.outro) + 1500);
  apt.lessons = (apt.lessons || 0) + 1; saveSoon();
  await sleep(2600);
  if (cls.run === my) endClass(false);
}
function endClass(quiet) {
  if (!cls.on) return;
  cls.on = false; cls.run++;
  if (cls.tok) cls.tok.cancel();
  stopWeld(); resetArms(); gadget('hat', false); gadget('lens', false); gadget('scope', false);
  bo.speed = currentTod() === 'night' ? 34 : 44;
  recipe.hidden = true; $('#lowerThird').hidden = true; $('#skipCard').hidden = true;
  kit.burners = [false, false]; kit.hood = false; kit.faucet = false; kit.carry = null; kit.fridgeOpen = false; kit.cabOpen = false;
  renderKitchen();
  clearTimeout(endClass.t); endClass.t = setTimeout(() => { if (!cls.on) resetKitchen(); }, 60000);
  if (bo.mode === 'class') { bo.mode = 'free'; restExpr(); statusText.textContent = 'Back to it'; }
  if (!quiet) log('Kitchen is open whenever you want another lesson.', true);
}
$('#rNext').addEventListener('click', () => { if (!cls.on) return; cls.jump = cls.intro ? 0 : Math.min(cls.L.steps.length, cls.step + 1); if (cls.tok) cls.tok.cancel(); });
$('#rBack').addEventListener('click', () => { if (!cls.on || cls.intro) return; cls.jump = Math.max(0, cls.step - 1); if (cls.tok) cls.tok.cancel(); });
$('#rPause').addEventListener('click', () => { if (!cls.on) return; cls.paused = !cls.paused; renderCard(); });
$('#rToggle').addEventListener('click', () => { cls.expanded = !cls.expanded; renderCard(); });
$('#rEnd').addEventListener('click', () => endClass(false));
$$('.lesson-btn').forEach((b) => b.addEventListener('click', () => startClass(b.dataset.lesson)));

/* ---------- small kitchen jobs Bo does on its own or when asked ---------- */
async function actWashUp(tok, req) {
  setDoing('Washing up', 'washing up at the kitchen sink');
  if (!(await kWash(tok, 2200))) return;
  if (kit.serve || kit.plate || kit.pot || kit.pan) { resetKitchen(); report('Dishes done. Leftovers are in the fridge.', req); }
  else report(pick(['Sink is clean.', 'Rinsed. Nothing was dirty. I rinsed it anyway.']), req);
  flashMood('content', 1400);
}
async function actPeekFridge(tok, req) {
  setDoing('Checking the fridge', 'looking in the kitchen fridge');
  if (!(await kGo(-112, -30, tok, 'curious'))) return;
  reachR(-24, 346, 120); await wait(420, tok); if (tok.c) return;
  kit.fridgeOpen = true; renderKitchen();
  await useLens(tok, 1600, -48, 380);
  kit.fridgeOpen = false; renderKitchen(); resetArmR(); if (tok.c) return;
  report(pick(['Carrots, celery, one onion, milk, eggs. Enough for a lesson.', 'Chicken, herbs, butter. The fridge is ready to teach.', 'One lemon. Very brave lemon.']), req);
}
async function actPeekCabinet(tok, req) {
  setDoing('Checking the cupboard', 'looking in the kitchen cupboard');
  if (!(await kGo(-470, -434, tok, 'lookup'))) return;
  reachR(-436, 206, 210); await wait(480, tok); if (tok.c) return;
  kit.cabOpen = true; renderKitchen(); resetArmR();
  await useLens(tok, 1500, -440, 180);
  kit.cabOpen = false; renderKitchen(); if (tok.c) return;
  report(pick(['Flour, spaghetti, canned tomatoes, noodles. The pantry is ready.', 'Everything in here is labeled. I labeled it.']), req);
}
async function actInspectSpices(tok, req) {
  setDoing('Inspecting the spices', 'inspecting the spice shelf with its magnifier');
  if (!(await kGo(-470, -448, tok, 'lookup'))) return;
  await useLens(tok, 1800, -448, 252); if (tok.c) return;
  report(pick(['Paprika. Also paprika. Someone likes paprika.', 'Thyme, pepper, salt, pepper flakes. All present.', "Oregano's low. Noted."]), req);
}
