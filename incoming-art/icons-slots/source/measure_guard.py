"""Measure Guard: the outermost x of each elbow against the torso edge, on the 256 U face (before the place() scale, which is the same for both) and in 1024 px of the final icon.
  python3 incoming-art/icons-slots/source/measure_guard.py"""
import os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import seal_icons as si
from seal_icons import *
def layer(draw):
    a = Art(); draw(a); bb = a.im.getchannel('A'); k = P(1); return bb, k
def band_x(bb, k, y0, y1):
    px = bb.crop((0, int(y0 * k), bb.width, int(y1 * k))); b = px.getbbox(); return (b[0] / k, b[2] / k) if b else None
def measure(eo=20, ey=204, f=.95, r_el=14.5):
    tors = layer(lambda a: gi_torso(a, 128, 126, 78, 110, belt_y=198))
    def arms(a):
        for el, wr, sd in (((128 - eo, ey), (128 + 14, 150), -1), ((128 + eo, ey), (128 - 14, 150), 1)):
            forearm_block(a, el, wr, 32, 0, sd, r_el=r_el, r_cuff=12.5)
    ar = layer(arms)
    rows = (ey - 6, ey + 6)
    t = band_x(*tors, *rows)
    # the elbow circle is the lowest part of each sleeve; take the leftmost / rightmost x of the arms in the elbow rows
    e = band_x(*ar, *rows)
    return t, e
if __name__ == '__main__':
    t, e = measure()
    print('torso edge x (U, incl. outline): left %.1f right %.1f' % t)
    print('elbow outer x (U, incl. outline): left %.1f right %.1f' % e)
    print('clearance inside the torso edge: left %.1f right %.1f U' % (e[0] - t[0], t[1] - e[1]))
    f = .95
    print('in the final 1024 icon (x4 of the 256 face, f=%.2f about the centre): torso %.0f..%.0f px, elbow %.0f..%.0f px' % ((f,) + tuple(1024 / 256 * (128 + f * (v - 128)) for v in (t[0], t[1], e[0], e[1]))))
