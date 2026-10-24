# Elite auras (full set) - S1 #3
Rebuild from `incoming-art/`: `python3 elite-auras/source/make_auras.py`. Per-enemy sheets in `sprites/<enemy>/` match the enemy frame + anchor. Draw order: aura back -> enemy -> aura front. Nothing above the head. See DELIVERY_NOTE.md.

Guarding links: `python3 elite-auras/source/make_guard_links.py` (after make_auras.py): tether beam + caps, per-enemy foot glow, tether snap.

**PROPOSAL (not wired):** `sprites/aura-sparkle-gold_front.png`: the gold drifting sparkles taken out of Swift, kept as a reusable front layer (256 master, ground point 128,210, 8 frames @ 10 fps) for a possible future rare named monster.
