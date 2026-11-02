# insight-picker (G2): SAMPLES

Warm re-skin of the Insight picker over the paused room, dimmed, ("Choose an Insight") using the Board kit (#412) and the catalog style (#422). Art only.

- `preview/`: 01 picker screen 844x390, 02 card close-up, 03 picked state, 04 pick in three frames (bonus). Each at 1x and @2x.
- `source/build_insight_picker.py`: builds all previews. Reads words from `content/insights/insights.json` and icons from `incoming-art/icons/sprites/`. Uses `incoming-art/tools/board_ui_kit.py` read-only.
- `DELIVERY_NOTE.md`: ITEM / WHAT / WHY / DECIDE / NEXT. Open questions are under DECIDE.

Rules: kid-friendly, no red, no orange, text 12 px or more, tap targets 44 pt or more, every glow has a source (the stamp lights the star burst; the icons carry their own soft light).

Rebuild: `python3 incoming-art/insight-picker/source/build_insight_picker.py` from the repo root (Pillow needed).
