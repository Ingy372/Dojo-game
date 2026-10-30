"""Plan of the main floor, in game-grid tiles. ONE source of truth: build_action_zone_dojo.py (scene `inside`) builds from these numbers and
make_layout_diagram.py draws the labelled plan from the same numbers. x = columns (west -> east), r = ground rows (north wall = small, entry = large).
The camera looks NORTH, so the entry is at the bottom of the picture and the mat room at the top."""
W = 27.0                      # room width (x 0..27)
H = 3.4                       # drywall height (nothing is drawn above it)
R_N = 1.0                     # north wall face (target wall, mural, back doors, flag, creeds)
R_MAT_S = 9.95                # south edge of the mat platform = the face of the two entry wings (pro shop / cross doors)
R_FRONT = 18.4                # front (entry) wall line
DOOR = (12.3, 14.7)           # the entrance gap in the front wall
REDSQ = (9.4, 17.6, 2.0, 8.3)            # big red square: x0, x1, r0, r1
LOGO_C = (13.5, 5.2); LOGO_W = 4.6       # school logo centred in the red square (width in tiles)
CUBBY = (9.6, 19.4, 8.6, 9.95)           # red gear-bag box: x0, x1, r0, r1  (height 1.0)
GAP = (7.0, 9.6)                         # the gap that lets students walk onto the mat
WEST_WING = (0.0, 7.0)                   # pro shop alcove (its back wall faces south at R_MAT_S)
EAST_WING = (19.4, 27.0)                 # two cross doors + handprint wall
DOOR_A, DOOR_B, PRINTS = (19.9, 21.3), (24.9, 26.3), (21.6, 24.6)
SEATS = (9.5, 17.5)                      # stadium seats x0, x1 ; 3 tiers, facing the mat
TIERS = [(11.7, 1.5, 0.3), (13.2, 1.5, 0.6), (14.7, 1.5, 0.9)]   # (south edge row, depth, top z) north -> south
TARGET = (0.4, 6.6); MURAL = (8.0, 13.0); BACK_DOOR = (13.3, 15.5); FLAG = (15.9, 17.9); CREED = (18.1, 20.7); BELTS = (21.1, 24.1)
BAGS = [(22.8, 3.8, "black"), (24.0, 4.6, "blue"), (25.2, 3.8, "red")]
CRASH = (24.4, 26.7, 1.3, 2.7)
