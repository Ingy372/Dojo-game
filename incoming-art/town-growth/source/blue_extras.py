"""Shared positions for the v4 Blue extras (read by build_town_stage.py in Blender and by make_stages.py, so the glows sit exactly on their sources).
Tile units: (column, row, height). Screen position at @2x: x = col*80, y = row*80 + 76 - height*80*cos(35 deg)."""
import math
PPT, SHIFT, COSEL = 80, int(0.95 * 80), math.cos(math.radians(35))
def scr(c, r, z=0.0): return (c * PPT, r * PPT + SHIFT - z * PPT * COSEL)

# the cosy corner on the lawn between the training platform and the statue: a stone fire bowl and a crook post with two paper lanterns
FIRE = (6.3, 8.3)                       # centre of the stone fire bowl (the flames stand at height 0.5-0.85)
FIRE_FLAME_Z = 0.62
POST = (7.5, 7.7)                       # foot of the lantern post
POST_H = 1.95                            # top of the post
ARM = -0.95                              # the arm reaches this far to the LEFT (negative = left)
LANTERNS = ((POST[0] + ARM, POST[1], 1.30), (POST[0] - 0.40, POST[1], 1.56))     # (col, row, height of the lantern's middle); big one at the arm's end, small one near the post
LANTERN_R = (0.20, 0.14)                 # lantern radius (tiles): big, small

# Blue dusk fireflies (v3 had 6; v4 has 12). Rows stay clear of the walking-lane band (screen y 444-540).
FIREFLIES = ((14.4, 6.6), (17.0, 7.0), (15.5, 9.0), (16.9, 10.0), (13.6, 10.2), (18.2, 9.4),
             (20.6, 8.0), (18.8, 7.7), (21.7, 9.6), (3.8, 9.8), (8.2, 7.3), (12.6, 9.9))

# v5 Blue sakura: (col, row) of the trunk foot -> (scale, lean toward the town, seed). EVERY tree stands in the lower plaza, south of the walking lane
# (screen y 444-540 at @2x): the lowest point of a crown must stay below y=540 (checked by check_lanes.py on the 'trees' pass).
SAKURA = {(0.55, 8.4): (1.0, 1, 3), (22.55, 8.0): (1.0, -1, 4), (3.5, 9.6): (0.8, 1, 1), (19.9, 9.6): (0.8, -1, 5), (17.7, 8.0): (0.72, -1, 2)}
