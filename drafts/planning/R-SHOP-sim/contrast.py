"""Gi-dye contrast check (local, not game code). CIEDE2000 between a dye and every belt colour in the school list.
Usage: python3 contrast.py > contrast.md"""
import math
def lab(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
    r,g,b=f(r),f(g),f(b)
    X=(0.4124*r+0.3576*g+0.1805*b)/0.95047; Y=0.2126*r+0.7152*g+0.0722*b; Z=(0.0193*r+0.1192*g+0.9505*b)/1.08883
    t=lambda v: v**(1/3) if v>216/24389 else (24389/27*v+16)/116
    return 116*t(Y)-16,500*(t(X)-t(Y)),200*(t(Y)-t(Z))
def de00(c1,c2):
    L1,a1,b1=lab(c1);L2,a2,b2=lab(c2)
    C1=math.hypot(a1,b1);C2=math.hypot(a2,b2);Cb=(C1+C2)/2
    G=0.5*(1-math.sqrt(Cb**7/(Cb**7+25**7)))
    a1p,a2p=(1+G)*a1,(1+G)*a2
    C1p,C2p=math.hypot(a1p,b1),math.hypot(a2p,b2)
    h=lambda b,a: math.degrees(math.atan2(b,a))%360 if (a or b) else 0
    h1,h2=h(b1,a1p),h(b2,a2p)
    dL=L2-L1;dC=C2p-C1p
    if C1p*C2p==0: dh=0
    else:
        dh=h2-h1
        if dh>180: dh-=360
        elif dh<-180: dh+=360
    dH=2*math.sqrt(C1p*C2p)*math.sin(math.radians(dh/2))
    Lb=(L1+L2)/2;Cbp=(C1p+C2p)/2
    if C1p*C2p==0: hb=h1+h2
    elif abs(h1-h2)<=180: hb=(h1+h2)/2
    elif h1+h2<360: hb=(h1+h2+360)/2
    else: hb=(h1+h2-360)/2
    T=1-0.17*math.cos(math.radians(hb-30))+0.24*math.cos(math.radians(2*hb))+0.32*math.cos(math.radians(3*hb+6))-0.20*math.cos(math.radians(4*hb-63))
    dth=30*math.exp(-((hb-275)/25)**2)
    Rc=2*math.sqrt(Cbp**7/(Cbp**7+25**7))
    Sl=1+0.015*(Lb-50)**2/math.sqrt(20+(Lb-50)**2);Sc=1+0.045*Cbp;Sh=1+0.015*Cbp*T
    Rt=-math.sin(math.radians(2*dth))*Rc
    return math.sqrt((dL/Sl)**2+(dC/Sc)**2+(dH/Sh)**2+Rt*(dC/Sc)*(dH/Sh))
BELTS={'white':'#f4f1ea','yellow':'#f5d22e','orange':'#f08a24','green':'#3aa655','blue':'#2f6fd6','red':'#d8352a','brown':'#7a4a26','black':'#1a1a1a'}
FREE=['#f2f2f2','#4a4a55','#24345e','#3a6ea5','#b8322a','#8a8d99','#3f7a4a','#e9dfc9','#7fb2e0','#7a2a33']

BELT_MONTHS = [3, 3, 3, 3, 3, 6, 6, 9, 12, 24]   # typicalMonthsInRank, fixtures/4-green-belt.json
MIN_BELT, MIN_FREE = 15, 12                       # [PROPOSED] thresholds, set after looking at the numbers below
# 12 shipped dyes, then candidates that FAIL, kept to show the rule working
DYES = {'Rose': '#e8a0b4', 'Peach': '#f5c6a8', 'Mint': '#a8dcc4', 'Aqua': '#6fd0d8', 'Lilac': '#b9a2dc', 'Sage': '#9db59a',
        'Plum': '#6a3a7a', 'Teal': '#2e8c8c', 'Pine': '#2f5d48', 'Mauve': '#9b6b8a', 'Bubblegum': '#f08fc0', 'Lime': '#b6d94c'}
REJECTED = {'Coral': '#e86f5c', 'Gold': '#c9a227', 'Sunflower': '#f2e07a', 'Tangerine': '#f7a35c', 'Cocoa': '#5b4636', 'Navy grey': '#3c4a6b'}

def row(n, c, note=''):
    d = {b: de00(c, v) for b, v in BELTS.items()}
    m = min(d, key=d.get)
    fr = min(de00(c, f) for f in FREE)
    ok = d[m] >= MIN_BELT and fr >= MIN_FREE
    return f'| {n} | {c} | {d[m]:.1f} ({m}) | {fr:.1f} | {"PASS" if ok else "FAIL"}{note} |', ok

if __name__ == '__main__':
    print('## Gi dye contrast (CIEDE2000; bigger = easier to tell apart)\n')
    print(f'Rule [PROPOSED]: a dye must be at least {MIN_BELT} from every belt colour and at least {MIN_FREE} from every free gi swatch. Reference: the 8 belt colours of this school are at least {min(de00(BELTS[a], BELTS[b]) for a in BELTS for b in BELTS if a < b):.1f} apart from each other.\n')
    print('| Dye | Colour | Closest belt colour | Closest free swatch | Result |\n|---|---|---|---|---|')
    ok_all = True
    for n, c in DYES.items():
        r, ok = row(n, c); print(r); ok_all &= ok
    for n, c in REJECTED.items():
        r, ok = row(n, c, ' (not shipped)'); print(r)
    print(f'\nAll 12 shipped dyes pass: {ok_all}')
    print('\n## Free gi swatches against the belts (information only; the shop does not change them)\n')
    print('| Free swatch | Closest belt colour | Distance |\n|---|---|---|')
    for f in FREE:
        d = {b: de00(f, v) for b, v in BELTS.items()}; m = min(d, key=d.get); print(f'| {f} | {m} | {d[m]:.1f} |')
