import re, json, glob
lits = []
for f in sorted(glob.glob('/home/claude/bo-nini/src/*.js')):
    s = open(f).read()
    # string literals: '...', "...", and `...` without ${}
    for m in re.finditer(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`([^`$]*)`", s):
        t = next(g for g in m.groups() if g is not None)
        t = t.replace("\\'", "'").replace('\\"', '"').strip()
        lits.append((f.split('/')[-1], t))
def spoken(t):
    if not (2 <= len(t) <= 220): return False
    if not re.match(r"^[A-Z0-9\"'(]", t): return False
    if not re.search(r"[.!?]$|\.\)$|\.\"$", t): return False
    if re.search(r"[<>{}=;\\]|https?:|#[0-9a-f]{3}|px\b|rgba?\(|\$\{|\.js|\.png|function|=>", t): return False
    if ' ' not in t and len(t) > 14: return False
    return True
lines = sorted({t for f, t in lits if spoken(t)})
json.dump(lines, open('/home/claude/voice/lines.json', 'w'), indent=0)
print(len(lines), 'candidate lines;', sum(len(l) for l in lines), 'characters')
import random; random.seed(3)
for l in random.sample(lines, 14): print('  ', l)
