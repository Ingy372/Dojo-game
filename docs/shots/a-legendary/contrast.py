# A-LEGENDARY-wire: contrast of each rarity word's ink against the frame behind it (words hidden, 2x shot).
import json,glob,statistics
from PIL import Image
def L(c):
    f=lambda v:(v/255/12.92) if v/255<=0.03928 else ((v/255+0.055)/1.055)**2.4
    r,g,b=c[:3]; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    x,y=sorted([L(a),L(b)],reverse=True); return (x+0.05)/(y+0.05)
out={}
for rep in sorted(glob.glob('*/report-*.json')):
    r=json.load(open(rep)); im=Image.open(f"{rep.split('/')[0]}/{r['tag']}-gear-nowords.png").convert('RGB')
    for t in r['states']['gear']['legendTiles']:
        if t['rarity']!='legendary' or not t['wordBox']: continue
        b=t['wordBox']; ink=tuple(int(t['ink'][i:i+2],16) for i in (1,3,5))
        px=[im.getpixel((x,y)) for x in range(int(b['x']*2),int((b['x']+b['w'])*2)) for y in range(int(b['y']*2),int((b['y']+b['h'])*2))]
        cs=sorted(cr(ink,p) for p in px)
        avg=tuple(sum(p[i] for p in px)//len(px) for i in range(3))
        out.setdefault(r['tag'],[]).append(dict(uid=t['uid'],frame='legendary' if t['legendFrame'] else 'epic stand-in',ink=t['ink'],avgBg='#%02x%02x%02x'%avg,vsAvg=round(cr(ink,avg),2),median=round(statistics.median(cs),2),p5=round(cs[len(cs)//20],2),min=round(cs[0],2)))
json.dump(out,open('contrast.json','w'),indent=1)
for k,v in out.items(): print(k, [(d['uid'],d['frame'][:4],d['avgBg'],d['vsAvg'],d['median'],d['p5'],d['min']) for d in v])

# Under the glyphs only: pixels that change when the word is drawn (the word's own footprint).
print('--- under glyph pixels ---')
g={}
for rep in sorted(glob.glob('*/report-*.json')):
    r=json.load(open(rep)); d=rep.split('/')[0]
    a=Image.open(f"{d}/{r['tag']}-gear.png").convert('RGB'); n=Image.open(f"{d}/{r['tag']}-gear-nowords.png").convert('RGB')
    for t in r['states']['gear']['legendTiles']:
        if t['rarity']!='legendary' or not t['wordBox']: continue
        b=t['wordBox']; ink=tuple(int(t['ink'][i:i+2],16) for i in (1,3,5)); cs=[]
        for x in range(int(b['x']*2),int((b['x']+b['w'])*2)):
            for y in range(int(b['y']*2),int((b['y']+b['h'])*2)):
                p,q=a.getpixel((x,y)),n.getpixel((x,y))
                if sum(abs(p[i]-q[i]) for i in range(3))>60: cs.append(cr(ink,q))
        cs.sort(); g.setdefault(r['tag'],[]).append(dict(uid=t['uid'],n=len(cs),median=round(statistics.median(cs),2),p5=round(cs[len(cs)//20],2),min=round(cs[0],2)))
json.dump({'wordBox':out,'underGlyphs':g},open('contrast.json','w'),indent=1)
for k,v in g.items(): print(k, v[0])
