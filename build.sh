#!/bin/sh
# Joins the parts in src/ into one self-contained index.html.
# You only need this if you edit something in src/. index.html is already built.
cd "$(dirname "$0")" || exit 1
cat src/1-head.html src/2-scene.html src/3-core.js src/3-sound.js src/4-bo.js src/5-kitchen.js src/6-memory-brain.js src/7-cat.js src/7-tour.js src/8-app.js src/9-end.html > index.html
echo "Built index.html"
