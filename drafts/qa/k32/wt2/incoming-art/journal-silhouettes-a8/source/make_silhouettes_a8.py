"""Dojo Ascent - A8 Monster Journal silhouettes for keeper + padded (Bouncy Bopper).
Same treatment as named-monster/source/make_named_b2.py (flat warm grey #786c5c + soft inner light, 116x120, fit 104x112, S-facing idle frame 0).
Run from incoming-art/:  python3 journal-silhouettes-a8/source/make_silhouettes_a8.py"""
import os, json
from PIL import Image, ImageFilter, ImageDraw, ImageFont
H=os.path.dirname(os.path.abspath(__file__)); IA=os.path.join(H,"..",".."); SP=os.path.join(H,"..","sprites"); PV=os.path.join(H,"..","preview")
SRC={"keeper":("enemies-tier1/keeper/sprites","keeper"),"padded":("enemy-padded-weapon/sprites","padded")}
LAYERS=("body","shield","light")  # second pass: "glow" dropped (keeper glow = dotted ring above head, padded glow = loose specks); body read is the same
def enemy(e):
    d,n=SRC[e]; J=json.load(open(os.path.join(IA,d,f"{n}.json"))); fw,fh=J["frameWidth"],J["frameHeight"]; row=J["directions"].index("S"); im=Image.new("RGBA",(fw,fh))
    for l in LAYERS:
        p=os.path.join(IA,d,f"{n}_{l}_idle.png")
        if os.path.exists(p): s=Image.open(p).convert("RGBA"); im.alpha_composite(s.crop((0,row*fh,fw,(row+1)*fh)))
    return im
def drop_specks(a, minpx=40):
    """second pass: drop loose islands < minpx (the keeper's sparkle-dot ring) so the shape reads; the crown, the body and the Bopper's padded stick stay"""
    import collections
    w,h=a.size; px=a.load(); seen=set(); keep=Image.new("L",a.size,0); kp=keep.load()
    for y in range(h):
        for x in range(w):
            if px[x,y]>40 and (x,y) not in seen:
                q=collections.deque([(x,y)]); seen.add((x,y)); comp=[]
                while q:
                    cx,cy=q.popleft(); comp.append((cx,cy))
                    for nx,ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1),(cx+1,cy+1),(cx-1,cy-1),(cx+1,cy-1),(cx-1,cy+1)):
                        if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and px[nx,ny]>40: seen.add((nx,ny)); q.append((nx,ny))
                if len(comp)>=minpx:
                    for c in comp: kp[c]=255
    return keep.filter(ImageFilter.MaxFilter(3))
def sil(im):
    im.putalpha(Image.composite(im.getchannel("A"),Image.new("L",im.size,0),drop_specks(im.getchannel("A"))))
    im=im.crop(im.getbbox()); sc=min(104/im.width,112/im.height); im=im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS)
    a=im.getchannel("A"); fill=Image.new("RGBA",im.size,(120,108,92,255)); fill.putalpha(a)
    inner=Image.new("RGBA",im.size,(150,138,120,255)); inner.putalpha(a.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(4)).point(lambda v:v//2)); fill.alpha_composite(inner)
    out=Image.new("RGBA",(116,120)); out.alpha_composite(fill,((116-im.width)//2,(120-im.height)//2)); return out
os.makedirs(os.path.join(SP,"journal"),exist_ok=True); M={"sprites":{}}; S={}
for e in SRC:
    S[e]=sil(enemy(e)); S[e].save(os.path.join(SP,"journal",f"silhouette-{e}.png"))
    M["sprites"][f"journal-silhouette-{e}"]={"files":{"img":f"journal/silhouette-{e}.png"},"size":[116,120],"note":"unmet treatment: flat warm grey #786c5c + soft inner light; place in the card's picture well (10,10)-(126,126)"}
json.dump(M,open(os.path.join(SP,"static.json"),"w"),indent=2)
# preview: all 5 kinds on unmet cards (existing 3 from named-monster for comparison)
NM=os.path.join(IA,"named-monster","sprites","journal"); card=Image.open(os.path.join(NM,"card-unmet.png")).convert("RGBA")
order=[("swarmer",None),("shield",None),("brute",None),("keeper",S["keeper"]),("padded",S["padded"])]
F=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",13)
W,Hh=card.width+20,card.height+30; pv=Image.new("RGBA",(W*len(order)//1 if False else W*3,Hh*2),(250,240,214,255)); d=ImageDraw.Draw(pv)
for i,(e,im) in enumerate(order):
    im=im or Image.open(os.path.join(NM,f"silhouette-{e}.png")).convert("RGBA"); c=card.copy(); c.alpha_composite(im,(10,10)) if im.height<=126 else None
    x,y=(i%3)*W+10,(i//3)*Hh+22; pv.alpha_composite(c,(x,y)); d.text((x,y-16),e+(" (NEW)" if e in SRC else " (existing)"),fill=(58,42,34),font=F)
pv.save(os.path.join(PV,"review-1-all-five-unmet-cards-1x.png")); pv.resize((pv.width*2,pv.height*2),Image.NEAREST).save(os.path.join(PV,"review-1-all-five-unmet-cards-2x.png"))
g=pv.convert("L").convert("RGBA"); g.save(os.path.join(PV,"greyscale-1-all-five.png"))
for e in SRC: print(e,S[e].getbbox())
