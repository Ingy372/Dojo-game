# A-LEGENDARY-wire round 2: word clearance and contrast on Legendary tiles, from the DPR 2 shots.
# Glyph pixels = what changes when the word is drawn. Rim = the gold-orange rim (R-B > 150) or its dark outline.
import json,glob,statistics,sys
from PIL import Image
def L(c):
    f=lambda v:(v/255/12.92) if v/255<=0.03928 else ((v/255+0.055)/1.055)**2.4
    return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2])
def cr(a,b): x,y=sorted([L(a),L(b)],reverse=True); return (x+0.05)/(y+0.05)
rim=lambda p: p[0]-p[2]>150 or sum(p)<330
res={}
for rep in sorted(glob.glob('after/report-*.json')):
    r=json.load(open(rep))
    for st in ('gear','gear-picked'):
        a=Image.open(f"after/{r['tag']}-{st}.png").convert('RGB'); n=Image.open(f"after/{r['tag']}-{st}-nowords.png").convert('RGB')
        for t in r['states'][st]['legendTiles']:
            if t['rarity']!='legendary' or (st=='gear-picked' and not t.get('selHl')): continue
            b=t['wordBox']; ink=tuple(int(t['ink'][i:i+2],16) for i in (1,3,5)); g=[]
            for x in range(int(b['x']*2)-4,int((b['x']+b['w'])*2)+4):
                for y in range(int(b['y']*2)-4,int((b['y']+b['h'])*2)+4):
                    p,q=a.getpixel((x,y)),n.getpixel((x,y))
                    if sum(abs(p[i]-q[i]) for i in range(3))>60: g.append((x,y,cr(ink,q)))
            gx0=min(p[0] for p in g); gx1=max(p[0] for p in g); gy0=min(p[1] for p in g); gy1=max(p[1] for p in g)
            # below: from each glyph column's lowest pixel straight down to the rim
            below=[]
            for x in range(gx0,gx1+1):
                ys=[p[1] for p in g if p[0]==x]
                if not ys: continue
                y=max(ys)+1
                while not rim(n.getpixel((x,y))): y+=1
                below.append((y-max(ys)-1)/2)
            left=[];right=[]
            for y in range(gy0,gy1+1):
                xs=[p[0] for p in g if p[1]==y]
                if not xs: continue
                x=min(xs)-1
                while not rim(n.getpixel((x,y))): x-=1
                left.append((min(xs)-1-x)/2)
                x=max(xs)+1
                while not rim(n.getpixel((x,y))): x+=1
                right.append((x-max(xs)-1)/2)
            cs=sorted(p[2] for p in g)
            res.setdefault(r['tag'],[]).append(dict(state=st,uid=t['uid'],sel=t.get('selHl'),tile=[round(t['tileBox']['w']),round(t['tileBox']['h'])],below=min(below),left=min(left),right=min(right),contrastMedian=round(statistics.median(cs),2),contrastP5=round(cs[len(cs)//20],2),contrastMin=round(cs[0],2)))
json.dump(res,open('clearance.json','w'),indent=1)
for k,v in res.items():
    for d in v: print(k,d)
