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
CUBBY = (9.6, 17.4, 8.6, 9.95)           # red gear-bag box: x0, x1, r0, r1  (height 1.0); a gap at EACH end
GAP_L = (7.0, 9.6)                       # left gap into the mat (between the left wall block and the box)
GAP_R = (17.4, 20.0)                     # right gap, the mirror image of GAP_L about the box (same 2.6 width)
WEST_WING = (0.0, 7.0)                   # plain wall block, left of the left gap (its back faces the lobby at R_MAT_S)
EAST_WING = (20.0, 27.0)                 # plain wall block, right of the right gap
DOOR_A, DOOR_B, PRINTS = (19.9, 21.3), (24.9, 26.3), (21.6, 24.6)   # cross doors + handprints, in their SOURCE frame (art is drawn there, then folded out to the LEFT wall)
DOORS_SRC = (19.4, 27.0); PRO_SRC = (0.0, 7.0)   # source-frame extents of the cross-door wall and the pro-shop wall
SEATS = (9.5, 17.5)                      # stadium seats x0, x1 ; 3 tiers, facing the mat
TIERS = [(11.7, 1.5, 0.3), (13.2, 1.5, 0.6), (14.7, 1.5, 0.9)]   # (south edge row, depth, top z) north -> south
TARGET = (0.4, 6.6); MURAL = (8.0, 13.0); BACK_DOOR = (13.3, 15.5); FLAG = (15.9, 17.9); CREED = (18.1, 20.7); BELTS = (21.1, 24.1)
BAGS = [(22.8, 3.8, "black"), (24.0, 4.6, "blue"), (25.2, 3.8, "red")]
CRASH = (24.4, 26.7, 1.3, 2.7)

# ---- the SIDE WALLS, unfolded. The camera sees only south faces, so each side wall is folded out flat into a margin beside the room (hinged on the wall line).
# LEFT wall (x = 0): yellow star/target wall + styles/logo mural (mat end), then the two cross doors with the handprint wall between them (lobby end).
# RIGHT wall (x = 27): the pro shop (lobby end). Each panel is FOLD_W wide and stands with its face on the row FOLD_*_RF; along the wall it covers rows RF-3.2 .. RF.
FOLD_W = 7.6
FOLD_CX_L = -4.0; FOLD_CX_R = W + 4.0
FOLD_TARGET_RF, FOLD_MURAL_RF, FOLD_DOORS_RF = 4.6, 8.2, 14.2
FOLD_PRO_RF = 13.0
FRAME_COLS = 43.8                        # picture width in tiles: x -8.4 .. 35.4
