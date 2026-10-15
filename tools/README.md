# Bo's recorded voice

1. `node tools/find-lines.mjs` (needs `npm i acorn acorn-walk`) lists every fixed line Bo can say, using a real
   JavaScript parser over src/, and writes lines2.json.
2. `python3 tools/batch.py` records any line that has no recording yet (Kokoro text-to-speech via kokoro-onnx, then
   re-synthesized with WORLD at one steady 147 Hz pitch, resonances lowered 11%, a small built-in-speaker sound).
   It writes voice/<hash>.mp3 and voice/lines.json (line text -> file).
Model files: kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases.
Run both again after adding or changing any of Bo's fixed lines.
