#!/bin/bash
# renders the 3 samples @2x (80 px per tile) and the 1x copies (40 px per tile), plus the overlay layers
cd "$(dirname "$0")"
python3 make_textures.py && python3 make_layout_diagram.py
for sc in outside inside seating; do blender -b -P build_action_zone_dojo.py -- --scene $sc --samples ${1:-24} | grep -E "Error|Traceback" ; done
python3 - <<'PY'
import glob, os
from PIL import Image
for f in glob.glob("../samples/*@2x.png") + glob.glob("../overlays/*@2x.png"):
    im = Image.open(f); im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(f.replace("@2x", ""))
PY
