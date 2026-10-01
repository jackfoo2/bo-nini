
/* ================= Bo's board: things you told Bo, pinned in the kitchen ================= */
const NOTE_COLORS = ['#fbf3d5', '#fde9a8', '#d9ecf7', '#f7dbe0', '#e3f1d6', '#fbe3c8'];
const PIN_COLORS = ['#d9453b', '#3f6fa8', '#4f8a3a', '#c9a25a', '#8a4fa8', '#e07a2e'];
const SLOTS = [[-199, 262], [-160, 262], [-121, 262], [-199, 303], [-160, 303], [-121, 303]];
const ROTS = [-4, 3, -2, 5, -3, 2];
const PIN_SKIP = /\b(password|passcode|passwd|ssn|social security|credit card|card number|cvv|bank|account number|routing|pin code|diagnos\w*|medication|prescription|pregnan\w*|therapy|therapist|suicid\w*|kill myself|self.?harm|overdose)\b/i;
const PIN_MARK = /\b(i'?m|i am|i'?ve|i have|i'?ll|i will|i need to|i want to|i plan|we'?re|we have|we'?ll|my|gonna|going to|tomorrow|tonight|this week|next week|this weekend|deadline|due|monday|tuesday|wednesday|thursday|friday|saturday|sunday|working on|trying to|starting|launch\w*|interview|trip|birthday|exam|test|move|moving|finish\w*|build\w*|writing)\b/i;
const PIN_NOT = /^(can|could|would|will|please|what|how|why|where|when|who|do|does|did|are|is|should|turn|switch|open|close|tell me|show me|teach me|make|fix|water|read|clean|sweep)\b/i;
function notesAll() { if (!Array.isArray(apt.notes)) apt.notes = []; return apt.notes; }
function tidyNote(s) {
  s = String(s || '').replace(/[[\]<>{}]/g, '').replace(/\s+/g, ' ').trim().replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, '').replace(/[.!,;:\s]+$/, '');
  if (s.length < 3 || PIN_SKIP.test(s)) return null;
  if (s.length > 80) s = s.slice(0, 78).replace(/\s+\S*$/, '') + '\u2026';
  return s;
}
function addNote(text) {
  const t = tidyNote(text); if (!t) return null;
  const list = notesAll();
  if (list.some((n) => n.t.toLowerCase() === t.toLowerCase())) return null;
  const n = { id: Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36), t, at: Date.now(), pinned: false, asked: 0, c: (list.length ? list[list.length - 1].c + 1 : 0) % 6 };
  list.push(n);
  while (list.length > 24) list.shift();
  saveSoon(); renderBoardPanel();
  return n;
}
// no key: pin the user's own words when they talk about their life, never questions or commands to Bo
function scriptedPin(text) {
  const t = String(text || '').trim();
  if (t.length < 12 || t.length > 300 || PIN_SKIP.test(t)) return null;
  const sents = t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const s0 = sents.find((s) => PIN_MARK.test(s) && !/\?$/.test(s) && !PIN_NOT.test(s.replace(/^(hey|hi|so|well|ok|okay|yeah|um|bo|also)[,!\s]+/i, '')));
  if (!s0) return null;
  let s = s0.replace(/^(hey|hi|so|well|ok|okay|yeah|um|bo|also)[,!\s]+/i, '').replace(/[.!]+$/, '');
  const words = s.split(/\s+/);
  if (words.length > 12) s = words.slice(0, 12).join(' ') + '\u2026';
  return s;
}
function renderBoard(popId) {
  const g = $('#boardNotes'); if (!g) return;
  const shown = notesAll().filter((n) => n.pinned).slice(-6);
  g.textContent = '';
  shown.forEach((n, i) => {
    const [x, y] = SLOTS[i];
    const outer = el('g', { transform: `translate(${x} ${y}) rotate(${ROTS[i]})` }, g);
    const inner = el('g', { class: n.id === popId ? 'note-pop' : '' }, outer);
    el('rect', { x: -15, y: -14, width: 30, height: 28, rx: 1.5, fill: NOTE_COLORS[n.c % 6] }, inner);
    const h = [...n.t].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const l1 = 12 + (h % 8), l2 = 8 + ((h >> 3) % 10), l3 = 5 + ((h >> 6) % 12);
    el('path', { d: `M-10 -4h${l1}M-10 1.5h${l2}M-10 7h${l3}`, stroke: '#8a8275', 'stroke-width': 1.3, 'stroke-linecap': 'round', fill: 'none' }, inner);
    el('circle', { cx: 0, cy: -11, r: 2.6, fill: PIN_COLORS[n.c % 6] }, inner);
    el('circle', { cx: -0.8, cy: -11.8, r: 0.8, fill: 'rgba(255,255,255,.7)' }, inner);
  });
}
function ago(ts) {
  const m = Math.max(0, (Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${Math.round(m)} min ago`;
  if (m < 60 * 24) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
}
const boardFly = $('#boardFly'), boardList = $('#boardList');
function renderBoardPanel() {
  if (!boardList) return;
  const list = notesAll().slice().reverse();
  boardList.textContent = '';
  list.forEach((n) => {
    const li = document.createElement('li');
    const q = document.createElement('span'); q.className = 'bq'; q.textContent = `\u201c${n.t}\u201d`;
    const meta = document.createElement('small'); meta.textContent = n.pinned ? ago(n.at) : `${ago(n.at)}, not pinned yet`;
    const x = document.createElement('button'); x.type = 'button'; x.className = 'bx'; x.setAttribute('aria-label', `Unpin ${n.t}`); x.textContent = '\u00d7';
    x.addEventListener('click', () => { apt.notes = notesAll().filter((m) => m.id !== n.id); saveSoon(); renderBoard(); renderBoardPanel(); });
    li.append(q, meta, x); boardList.appendChild(li);
  });
  $('#boardEmpty').hidden = list.length > 0;
  $('#boardClear').hidden = list.length === 0;
}
function openBoard() {
  renderBoardPanel();
  openFly(boardFly, null);
  const a = stageXY(-160, 336), r = stage.getBoundingClientRect();
  if (a && !clip.on) {
    boardFly.style.right = 'auto'; boardFly.style.bottom = 'auto';
    boardFly.style.left = clamp(r.left + a.x - boardFly.offsetWidth / 2, 8, window.innerWidth - boardFly.offsetWidth - 8) + 'px';
    boardFly.style.top = clamp(r.top + a.y + 6, 8, window.innerHeight - boardFly.offsetHeight - 8) + 'px';
  }
}
$('#boardClear').addEventListener('click', () => { apt.notes = []; saveSoon(); renderBoard(); renderBoardPanel(); log('Board cleared.', true); });
async function actPin(tok) {
  const n = notesAll().find((x) => !x.pinned); if (!n) return;
  bo.hurry = true;
  setDoing('Pinning a note', 'pinning something the person said on the kitchen board');
  if (!(await approach(-236, -150, 280, tok, 'curious'))) return;
  const slot = Math.min(5, notesAll().filter((x) => x.pinned).length);
  const [sx, sy] = SLOTS[slot];
  holdItem('letter'); reachR(sx, sy, 200);
  await wait(700, tok); if (tok.c) { holdItem(null); return; }
  n.pinned = true; holdItem(null); renderBoard(n.id); renderBoardPanel(); saveSoon();
  bo.goal.extR = Math.max(0, bo.goal.extR - 8);
  await wait(220, tok);
  resetArms(); flashMood('content', 1300);
  log(`Pinned: \u201c${n.t}\u201d`, true);
  await wait(500, tok);
}
// after a real absence Bo may ask about one thing you told it before you left; once per note, never as guilt
const PLANLIKE = /\b(tomorrow|tonight|today|this week|next week|weekend|deadline|due|monday|tuesday|wednesday|thursday|friday|saturday|sunday|launch\w*|interview|trip|birthday|exam|test|working on|trying to|going to|gonna|need to|have to|plan\w*|finish\w*|start\w*|mov(e|ing)|build\w*|writ(e|ing)|project|meeting|pitch\w*|ship\w*|appointment|party|game|class)\b/i;
function noteCallback(bucket) {
  if (bucket === 'short') return null;
  const n = notesAll().filter((x) => !x.asked && Date.now() - x.at > 20000 && PLANLIKE.test(x.t)).pop();
  if (!n) return null;
  n.asked = Date.now(); saveSoon();
  const q = `\u201c${n.t}\u201d`;
  return bucket === 'hours' ? `Earlier you said ${q}. How'd that go?` : pick([`Before you left, you told me ${q}. How'd it go?`, `Last time you said ${q}. How did that turn out?`]);
}
function boardContext() {
  const list = notesAll().slice(-6);
  if (!list.length) return '- Your kitchen board is empty so far.';
  return `- Pinned on your kitchen board from earlier chats (the person's own words, newest last): ${list.map((n) => `"${n.t}"`).join('; ')}. Bring one up only if it fits naturally, at most once, and never as guilt.`;
}

/* ================= Bo's brain: your own AI key ================= */
const PROVIDERS = {
  anthropic: { label: 'Anthropic (Claude)', kind: 'anthropic', url: 'https://api.anthropic.com/v1', model: 'claude-haiku-4-5-20251001', keyHint: 'sk-ant-...' },
  openai: { label: 'OpenAI', kind: 'openai', url: 'https://api.openai.com/v1', model: '', keyHint: 'sk-...' },
  openrouter: { label: 'OpenRouter (many models, one key)', kind: 'openai', url: 'https://openrouter.ai/api/v1', model: '', keyHint: 'sk-or-...' },
  venice: { label: 'Venice', kind: 'openai', url: 'https://api.venice.ai/api/v1', model: '', keyHint: 'Venice API key' },
  ollama: { label: 'Ollama on this computer', kind: 'openai', url: 'http://localhost:11434/v1', model: '', noKey: true, keyHint: 'No key needed' },
  custom: { label: 'Other (OpenAI-compatible)', kind: 'openai', url: '', model: '', editUrl: true, keyHint: 'API key' },
};
const BYOK_KEY = 'bonini-brain-v1';
const byok = { on: false, p: 'anthropic', url: '', model: '', key: '', remember: false };
const onClaudeAi = () => !!(window.claude && typeof window.claude.use === 'function');
function loadByok() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(BYOK_KEY) || sessionStorage.getItem(BYOK_KEY) || 'null'); } catch (e) { s = null; }
  if (s && PROVIDERS[s.p] && typeof s.model === 'string') {
    Object.assign(byok, { p: s.p, url: String(s.url || ''), model: s.model, key: String(s.key || ''), remember: !!s.remember, on: !!s.on });
  }
}
function saveByok() {
  const data = JSON.stringify({ p: byok.p, url: byok.url, model: byok.model, key: byok.key, remember: byok.remember, on: byok.on });
  try { localStorage.removeItem(BYOK_KEY); sessionStorage.removeItem(BYOK_KEY); } catch (e) { /* storage off */ }
  try { (byok.remember ? localStorage : sessionStorage).setItem(BYOK_KEY, data); } catch (e) { /* storage off */ }
}
function forgetByok() {
  try { localStorage.removeItem(BYOK_KEY); sessionStorage.removeItem(BYOK_KEY); } catch (e) { /* storage off */ }
  Object.assign(byok, { on: false, key: '', model: '', url: '', remember: false });
}
const keyLive = () => !onClaudeAi() && byok.on && !!byok.model && (!!byok.key || !!PROVIDERS[byok.p].noKey);
function codeErr(code, text, detail) { const e = new Error(code); e.code = code; e.text = text || ''; e.detail = detail || ''; return e; }
function byokBase() { return String(byok.url || PROVIDERS[byok.p].url || '').replace(/\/+$/, ''); }
function byokHeaders() {
  const P = PROVIDERS[byok.p];
  if (P.kind === 'anthropic') return { 'content-type': 'application/json', 'x-api-key': byok.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  const h = { 'content-type': 'application/json' };
  if (byok.key) h.authorization = 'Bearer ' + byok.key;
  if (byok.p === 'openrouter') { h['X-Title'] = 'Bo Nini demo'; if (/^https?:/.test(location.origin)) h['HTTP-Referer'] = location.origin; }
  return h;
}
async function byokFetch(path, init) {
  try { return await fetch(byokBase() + path, init); }
  catch (e) { throw codeErr(e && e.name === 'AbortError' ? 'cancelled' : 'byok_network', ''); }
}
async function failFrom(res, text) {
  let detail = '';
  try { detail = (await res.text()).slice(0, 400); } catch (e) { /* no body */ }
  let msg = detail;
  try { const j = JSON.parse(detail); msg = (j.error && (j.error.message || j.error)) || j.message || detail; } catch (e) { /* not json */ }
  const code = res.status === 401 || res.status === 403 ? 'byok_auth' : res.status === 429 ? 'rate_limited' : (res.status === 404 || /model/i.test(String(msg))) ? 'byok_model' : 'byok_http';
  return codeErr(code, text, String(msg).slice(0, 200));
}
async function byokChat(system, messages, opts) {
  const P = PROVIDERS[byok.p], signal = opts && opts.signal, onText = opts && opts.onText;
  const body = P.kind === 'anthropic'
    ? { model: byok.model, max_tokens: 400, system, messages, stream: true }
    : { model: byok.model, messages: [{ role: 'system', content: system }].concat(messages), stream: true };
  const res = await byokFetch(P.kind === 'anthropic' ? '/messages' : '/chat/completions', { method: 'POST', signal, headers: byokHeaders(), body: JSON.stringify(body) });
  if (!res.ok) throw await failFrom(res, '');
  let text = '';
  const handle = (data) => {
    if (!data || data === '[DONE]') return;
    let j; try { j = JSON.parse(data); } catch (e) { return; }
    if (j.error || j.type === 'error') throw codeErr('byok_http', text, String((j.error && (j.error.message || j.error)) || 'stream error'));
    let piece = '';
    if (P.kind === 'anthropic') { if (j.type === 'content_block_delta' && j.delta && j.delta.type === 'text_delta') piece = j.delta.text || ''; }
    else { const ch = j.choices && j.choices[0]; piece = (ch && ((ch.delta && ch.delta.content) || (ch.message && ch.message.content))) || ''; }
    if (piece) { text += piece; if (onText) onText({ text }); }
  };
  if (!res.body || !res.body.getReader) { const raw = await res.text(); raw.split('\n').forEach((l) => { if (l.startsWith('data:')) handle(l.slice(5).trim()); }); return { text }; }
  const reader = res.body.getReader(), dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (line.startsWith('data:')) handle(line.slice(5).trim()); }
    }
    if (buf.trim().startsWith('data:')) handle(buf.trim().slice(5).trim());
  } catch (e) {
    if (e && e.code) throw e;
    throw codeErr(e && e.name === 'AbortError' ? 'cancelled' : 'byok_network', text);
  }
  return { text };
}
async function byokModels() {
  const res = await byokFetch('/models', { headers: byokHeaders() });
  if (!res.ok) throw await failFrom(res, '');
  const j = await res.json();
  const arr = Array.isArray(j.data) ? j.data : Array.isArray(j.models) ? j.models : [];
  return arr.map((m) => (typeof m === 'string' ? m : m.id || m.name || m.model)).filter(Boolean);
}
const PREFER = /haiku|mini|flash|small|lite|8b|7b|nano/i;
// build the chat for any brain: claude.ai sample gets the rules as a first turn, API providers get a system prompt
function think(req, opts) {
  const last = req.kind === 'chat'
    ? { role: 'user', content: req.text.slice(0, 600) }
    : { role: 'user', content: `[I drop a file into your apartment window. You only receive its file name, never what's inside: "${req.name}". React to the name in one or two short sentences.]` };
  if (keyLive()) return byokChat(rules(), history.slice().concat(last), opts);
  return brain.sample([{ role: 'user', content: rules() }].concat(history, last), opts);
}

/* ---------- the brain panel ---------- */
const brainFly = $('#brainFly'), brainChip = $('#brainChip');
const bf = { provider: $('#bfProvider'), url: $('#bfUrl'), urlRow: $('#bfUrlRow'), key: $('#bfKey'), keyRow: $('#bfKeyRow'), model: $('#bfModel'), models: $('#bfModels'), remember: $('#bfRemember'), test: $('#bfTest'), forget: $('#bfForget'), status: $('#bfStatus') };
Object.entries(PROVIDERS).forEach(([id, P]) => { const o = document.createElement('option'); o.value = id; o.textContent = P.label; bf.provider.appendChild(o); });
function fillBrainForm() {
  const P = PROVIDERS[byok.p];
  bf.provider.value = byok.p;
  bf.urlRow.hidden = !P.editUrl && byok.p !== 'ollama';
  bf.url.value = byok.url || P.url;
  bf.keyRow.hidden = !!P.noKey;
  bf.key.value = byok.key; bf.key.placeholder = P.keyHint;
  bf.model.value = byok.model || P.model;
  bf.remember.checked = byok.remember;
  $('#bfOllamaNote').hidden = byok.p !== 'ollama';
}
function setBfStatus(text, kind) { bf.status.textContent = text; bf.status.dataset.kind = kind || ''; }
bf.provider.addEventListener('change', () => {
  byok.p = bf.provider.value; byok.url = ''; byok.model = ''; bf.models.textContent = '';
  fillBrainForm(); setBfStatus('');
});
async function connectByok() {
  const P = PROVIDERS[bf.provider.value];
  byok.p = bf.provider.value;
  byok.url = (P.editUrl || byok.p === 'ollama') ? bf.url.value.trim() : '';
  byok.key = P.noKey ? '' : bf.key.value.trim();
  byok.model = bf.model.value.trim();
  byok.remember = bf.remember.checked;
  if (!byokBase()) { setBfStatus('Add the address of the API first.', 'bad'); return; }
  if (!P.noKey && !byok.key) { setBfStatus('Paste your API key first.', 'bad'); return; }
  bf.test.disabled = true; setBfStatus('Checking...', '');
  try {
    let list = [];
    try { list = await byokModels(); } catch (e) { if (e.code === 'byok_auth') throw e; list = []; }
    if (list.length) {
      bf.models.textContent = '';
      list.slice(0, 300).forEach((id) => { const o = document.createElement('option'); o.value = id; bf.models.appendChild(o); });
      if (!byok.model || !list.includes(byok.model)) byok.model = (P.model && list.includes(P.model) && P.model) || list.find((id) => PREFER.test(id)) || list[0];
      bf.model.value = byok.model;
    }
    if (!byok.model) throw codeErr('byok_model', '', 'Type a model name from your provider.');
    const out = await byokChat('Reply with the single word OK.', [{ role: 'user', content: 'Say OK.' }], {});
    if (!out.text.trim()) throw codeErr('byok_http', '', 'The model answered with nothing. Try another model.');
    byok.on = true; saveByok();
    brain.mode = 'live'; renderBrainUI();
    setBfStatus(`Connected. Bo is thinking with ${byok.model}.`, 'good');
    log('New brain online.', true);
  } catch (e) {
    byok.on = false;
    const why = {
      byok_auth: 'That key was turned down. Check it and try again.',
      byok_network: byok.p === 'ollama' ? "Couldn't reach Ollama. Is it running, and does it allow this page? See the note below." : "Couldn't reach that provider from this page. The address may be wrong, or the provider may block calls from browsers.",
      byok_model: `That model didn't work. ${e.detail || 'Pick another one.'}`,
      rate_limited: 'The provider says slow down. Wait a minute and try again.',
    }[e.code] || `The provider sent back an error. ${e.detail || ''}`;
    setBfStatus(why.trim(), 'bad');
    renderBrainUI();
  } finally { bf.test.disabled = false; }
}
bf.test.addEventListener('click', connectByok);
bf.forget.addEventListener('click', () => {
  forgetByok(); fillBrainForm(); bf.models.textContent = '';
  if (brain.mode === 'live' && !brain.sample) brain.mode = 'scripted';
  renderBrainUI(); setBfStatus('Key removed from this browser.', '');
});
brainChip.addEventListener('click', () => { if (brainFly.hidden) { fillBrainForm(); openFly(brainFly, brainChip); } else closeFlyouts(); });
$$('#bfMode button').forEach((b) => b.addEventListener('click', () => {
  const m = b.dataset.brain;
  if (m === 'live' && !(brain.sample || keyLive())) { setBfStatus(onClaudeAi() ? "Live replies aren't available in this view." : 'Connect a key first.', 'bad'); return; }
  brain.mode = m; renderBrainUI();
}));
