"""Proportion check for the kid icons (Guard, Counter, Jumping Spins; Strike and Disarm have no torso or arm, they are leg-only). All lengths are read from the SAME drawing
parameters the icons are built from (inspect.signature defaults), so the table cannot drift from the art. U = the 256 face; 'final' = U x the icon's own fit scale.
Definitions (Spins is the reference, Guard and Counter must land within about 10% of it):
  head r      the head radius
  T_belt      shoulder line to belt (jacket height)
  T_hip       shoulder line to the crotch / hip joint (jacket + pants)
  forearm+fist  elbow (or, for the extended Counter punch, the jacket edge) to the fist tip
  upper arm   shoulder to elbow (Spins and Guard; the Counter punch is straight, so its whole visible arm is the forearm+fist row)
  leg         hip joint to ankle, straight down
  python3 incoming-art/icons-slots/source/measure_proportions.py"""
import os, sys, math, inspect
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import seal_icons as si
d = lambda fn: {k: v.default for k, v in inspect.signature(fn).parameters.items()}
dist = lambda p, q: math.hypot(p[0] - q[0], p[1] - q[1])
FIST_TIP = .92      # forearm_block: tip of the fist = wrist + 8 + .42 s + .5 s
FIT = {}
orig = si.place_fit
def pf(*a, **k):
    f = orig(*a, **k); FIT['f'] = f; return f
si.place_fit = pf
def fit(name):
    FIT.clear(); si.ALL[name](); return FIT.get('f')
# ---- Jumping Spins (reference)
s = d(si.jumping_spins); hx = s['hx']; f_s = fit('jumping-spins')
sh = (hx - s['sw'] / 2, s['ttop'] + 6); el = (hx - s['sw'] / 2 - 12, s['belt'] - 2); wr = (hx - s['sw'] / 2 - 8, 96)
S = dict(f=f_s, head=s['hr'], Tb=s['belt'] - s['ttop'], Th=s['hip'] - s['ttop'], fist=24, sleeve=10,
         upper=dist(sh, el), fore=dist(el, wr) + 8 + FIST_TIP * 24, leg=s['sl'][2][1] - s['sl'][0][1])
# ---- Guard
g = d(si.guard); f_g = g['f']; shg = (128 - 39 + 10, 126 + 8); elg = (128 - g['eo'], g['ey']); wrg = (128 + g['wx'], g['wy'])
G = dict(f=f_g, head=28, Tb=g['belt'] - 126, Th=g['th'], fist=g['fs'], sleeve=g['r_el'],
         upper=dist(shg, elg), fore=dist(elg, wrg) + 8 + FIST_TIP * g['fs'], leg=None)
# ---- Counter
c = d(si.counter); f_c = fit('counter'); fe = c['wr'][0] + c['wrist_len'] + .88 * c['fs']; edge = c['hx'] + c['tw'] / 2
C = dict(f=f_c, head=c['hr'], Tb=c['belt'] - c['ty'], Th=c['th'], fist=c['fs'], sleeve=c['r_sh'],
         upper=None, fore=fe - edge, leg=(c['ank'] - 12) - (c['ty'] + c['th'] - 8) + 12)
def row(n, k, fmt='%.1f'):
    out = [n]
    for X in (S, G, C):
        v = X[k]; out.append('-' if v is None else fmt % v)
    return out
def pct(a, b): return '%+.0f%%' % (100 * (a / b - 1))
rows = []
print('%-34s %10s %10s %10s' % ('(own U; Spins = reference)', 'Spins', 'Guard', 'Counter'))
for n, k in (('fit scale f', 'f'), ('head r', 'head'), ('T_belt (shoulder to belt)', 'Tb'), ('T_hip (shoulder to hip)', 'Th'), ('fist size', 'fist'), ('sleeve r (elbow / shoulder)', 'sleeve'),
             ('upper arm (shoulder to elbow)', 'upper'), ('forearm + fist (to the fist tip)', 'fore'), ('leg (hip to ankle)', 'leg')):
    print('%-34s %10s %10s %10s' % tuple(row(n, k, '%.2f' if k == 'f' else '%.1f')))
print('\nratios (value / Spins value - 1 in brackets)')
def ratio(name, fn):
    vs = []
    for X in (S, G, C):
        try: vs.append(fn(X))
        except TypeError: vs.append(None)
    print('%-34s %10s %10s %10s' % ((name,) + tuple('-' if v is None else '%.2f' % v for v in vs)) + '   [' + ', '.join('-' if v is None or vs[0] is None else pct(v, vs[0]) for v in vs[1:]) + ']')
ratio('fist / head r', lambda X: X['fist'] / X['head'])
ratio('sleeve r / head r', lambda X: X['sleeve'] / X['head'])
ratio('T_belt / head r', lambda X: X['Tb'] / X['head'])
ratio('forearm+fist / T_belt', lambda X: X['fore'] / X['Tb'])
ratio('forearm+fist / T_hip', lambda X: X['fore'] / X['Th'])
ratio('forearm+fist / head r', lambda X: X['fore'] / X['head'])
ratio('upper arm / T_belt', lambda X: X['upper'] / X['Tb'])
ratio('whole arm (upper+fore) / T_belt', lambda X: (X['upper'] + X['fore']) / X['Tb'])
ratio('leg / T_hip', lambda X: X['leg'] / X['Th'])
print('\nfinal icon size (own U x fit scale)')
for n, k in (('head r', 'head'), ('fist', 'fist'), ('sleeve r', 'sleeve'), ('forearm + fist', 'fore')):
    print('%-34s %10.1f %10.1f %10.1f' % ((n,) + tuple(X[k] * X['f'] for X in (S, G, C))))
