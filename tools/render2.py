import numpy as np, soundfile as sf, subprocess, sys, pyworld as pw
from kokoro_onnx import Kokoro
from scipy.signal import butter, sosfilt, resample_poly
k = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin')
def tts(text, voice='am_michael', speed=0.93):
    a, sr = k.create(text, voice=k.get_voice_style(voice), speed=speed, lang='en-us'); return a.astype(np.float64), sr
def speaker(a, sr, amount=0.6):  # C's small built-in speaker, lighter: band-limit + soft drive
    b = sosfilt(butter(3, [220, 5200], btype='band', fs=sr, output='sos'), a)
    y = np.tanh(1.6 * b) / np.tanh(1.6); return (1 - amount) * a + amount * y
def comb(a, sr, ms, fb):
    d = int(sr * ms / 1000); y = a.copy()
    for i in range(d, len(y)): y[i] += fb * y[i - d]
    return y
def norm(a): return (a / (np.max(np.abs(a)) + 1e-9) * 0.89).astype(np.float32)
def world(a, sr, f0_fn, formant=1.0):
    f0, t = pw.harvest(a, sr, f0_floor=60, f0_ceil=400, frame_period=5.0)
    sp = pw.cheaptrick(a, f0, t, sr); ap = pw.d4c(a, f0, t, sr)
    if formant != 1.0:  # shift the voice's resonances (body size) toward the middle
        n = sp.shape[1]; idx = np.clip(np.arange(n) / formant, 0, n - 1)
        sp = np.array([np.interp(idx, np.arange(n), row) for row in sp])
    voiced = f0 > 0
    nf = f0_fn(f0, voiced)
    ap = np.where(voiced[:, None], np.minimum(ap, 0.25), ap)   # a cleaner, more electronic buzz on voiced sounds
    return pw.synthesize(nf, sp, ap, sr, 5.0)
def flat(f0, voiced, hz=150.0):  # one steady pitch between typical male and female voices
    return np.where(voiced, hz, 0.0)
def stepped(f0, voiced, base=150.0, steps=(0, 3, 5, 7)):  # quantize the melody to a few fixed notes
    semis = 12 * np.log2(np.maximum(f0, 1) / np.median(f0[voiced])) if voiced.any() else f0 * 0
    q = np.array([min(steps, key=lambda s: abs(s - x)) for x in np.clip(semis, -2, 9)])
    return np.where(voiced, base * 2 ** (q / 12), 0.0)
def vocoder(a, sr, carrier_hz=150.0, bands=28):
    t = np.arange(len(a)) / sr
    car = 2 * (t * carrier_hz % 1) - 1 + 0.08 * np.random.default_rng(0).standard_normal(len(a))  # buzz + a little breath
    edges = np.geomspace(120, 7000, bands + 1); out = np.zeros_like(a)
    env_lp = butter(2, 40, fs=sr, output='sos')
    for lo, hi in zip(edges[:-1], edges[1:]):
        sos = butter(2, [lo, hi], btype='band', fs=sr, output='sos')
        env = sosfilt(env_lp, np.abs(sosfilt(sos, a)))
        out += sosfilt(sos, car) * env
    out = out / (np.max(np.abs(out)) + 1e-9)
    return 0.82 * out + 0.18 * a / (np.max(np.abs(a)) + 1e-9)   # a touch of the real voice keeps words clear
VERSIONS = {
  'D-vocoder':  lambda a, sr: norm(speaker(vocoder(a, sr), sr, 0.4)),
  'E-flat':     lambda a, sr: norm(speaker(comb(world(a, sr, flat, formant=1.06), sr, 2.2, 0.18), sr)),
  'F-stepped':  lambda a, sr: norm(speaker(comb(world(a, sr, stepped, formant=1.06), sr, 2.2, 0.18), sr)),
}
def save(a, sr, name):
    sf.write(f'/tmp/{name}.wav', a, sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'/tmp/{name}.wav', '-ac', '1', '-b:a', '64k', f'{name}.mp3'], check=True)
if __name__ == '__main__':
    line = sys.argv[1]; a, sr = tts(line)
    for n, fx in VERSIONS.items(): save(fx(a, sr), sr, f'sample-{n}')
    print('ok', round(len(a) / sr, 2), 's')
