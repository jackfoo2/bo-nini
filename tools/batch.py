import json, re, hashlib, subprocess, os, sys, time
import soundfile as sf
from render2 import tts, world, flat, speaker, comb, norm
def flat_at(hz): return lambda f0, v: flat(f0, v, hz)
def spoken_form(t):  # what the voice says; the text on screen is unchanged
    s = t
    s = re.sub(r'(\d+)\s*°F\s*\((\d+)\s*°C\)', r'\1 degrees Fahrenheit', s)
    s = re.sub(r'(\d+)\s*°F', r'\1 degrees Fahrenheit', s)
    s = re.sub(r'(\d+) quarts \((\d+) liters\)', r'\1 quarts, about \2 liters', s)
    s = s.replace('1 1/2 hours', 'an hour and a half').replace('1/2 tsp', 'half a teaspoon of').replace('1/4 cup', 'a quarter cup')
    s = re.sub(r'\b1 tbsp\b', 'one tablespoon of', s); s = re.sub(r'\b(\d+) tbsp\b', r'\1 tablespoons of', s)
    s = re.sub(r'\b1 tsp\b', 'one teaspoon of', s); s = re.sub(r'\b(\d+) tsp\b', r'\1 teaspoons of', s)
    s = re.sub(r'\bAPI\b', 'A P I', s); s = re.sub(r'\bPDF\b', 'P D F', s); s = re.sub(r'\bAI\b', 'A I', s); s = re.sub(r'\bOK\b', 'okay', s)
    return s
lines = json.load(open('lines.json'))
os.makedirs('/home/claude/bo-nini/voice', exist_ok=True)
manifest = {}; t0 = time.time()
for i, t in enumerate(lines):
    name = 'v' + hashlib.sha1(t.encode()).hexdigest()[:10] + '.mp3'
    out = f'/home/claude/bo-nini/voice/{name}'
    if not os.path.exists(out):
        try:
            a, sr = tts(spoken_form(t), 'af_heart', 0.93)
            y = norm(speaker(comb(world(a, sr, flat_at(147), formant=0.89), sr, 2.2, 0.18), sr))   # E1b
            sf.write('/tmp/line.wav', y, sr)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', '/tmp/line.wav', '-ac', '1', '-b:a', '40k', out], check=True)
        except Exception as e:
            print('FAILED', repr(t[:60]), e, flush=True); continue
    manifest[t] = name
    if i % 20 == 0: print(f'{i}/{len(lines)}  {time.time() - t0:.0f}s', flush=True)
json.dump(manifest, open('/home/claude/bo-nini/voice/lines.json', 'w'), ensure_ascii=False, indent=0)
print('DONE', len(manifest), 'lines', f'{time.time() - t0:.0f}s', flush=True)
