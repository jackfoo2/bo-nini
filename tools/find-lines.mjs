import fs from 'node:fs';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
const dir = '/home/claude/bo-nini/src', out = new Set();
// the parts are one script split across files: parse them joined, as the browser does
const src = ['3-core.js', '3-sound.js', '4-bo.js', '5-kitchen.js', '6-memory-brain.js', '7-cat.js', '7-tour.js', '8-app.js'].map((f) => fs.readFileSync(`${dir}/${f}`, 'utf8')).join('\n');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true });
walk.full(ast, (n) => {
  if (n.type === 'Literal' && typeof n.value === 'string') out.add(n.value.trim());
  if (n.type === 'TemplateLiteral' && n.expressions.length === 0) out.add(n.quasis[0].value.cooked.trim());
});
const spoken = (t) => t.length >= 2 && t.length <= 220 && /^[A-Z0-9"'(]/.test(t) && /([.!?]|\.\)|\.")$/.test(t)
  && !/[<>{}=;\\]|https?:|#[0-9a-f]{3}|px\b|rgba?\(|\$\{|\.js|\.png|function|=>/.test(t) && !(!t.includes(' ') && t.length > 14);
const lines = [...out].filter(spoken).sort();
fs.writeFileSync('/home/claude/voice/lines2.json', JSON.stringify(lines, null, 0));
const old = new Set(JSON.parse(fs.readFileSync('/home/claude/voice/lines.json', 'utf8')));
const missing = lines.filter((l) => !old.has(l));
console.log(`parser found ${lines.length} speakable lines; already recorded ${lines.length - missing.length}; missing ${missing.length}`);
for (const m of missing.slice(0, 12)) console.log('   ', m);
