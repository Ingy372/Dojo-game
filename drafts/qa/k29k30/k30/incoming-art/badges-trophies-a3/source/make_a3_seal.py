"""Dojo Ascent - A3 seal follow-up: the certified trophy split into swappable layers.
Run from incoming-art/:  python3 badges-trophies-a3/source/make_a3_seal.py
Layers (all 104x166, same anchor [52,156], stack bottom->top):
  1 trophy-base        cup + stand + plinth + blank date plate + halo + sparkles (one layer)
  2 seal-backing-*     rosette scallop + inner face + ribbon tails, in a palette (default gold/sky, or a school palette)
  3 seal-mark-*        the school mark, centred in the seal face (default = the A3 star; school = their own logo)
Helpers are reused from make_a3.py (lines before the badge section)."""
import os, math, json
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"make_a3.py")).read().split("# ---------------------------------------------------------------- 1. badges")[0]
exec(src); SKY=(64,150,235,255)
TW,TH=104,166; OUT=os.path.join(SP,"trophies","certified-layers"); os.makedirs(OUT,exist_ok=True)
SX,SY=76,130            # seal centre (1x)
FACE_R=10               # inner face radius (1x) = mark slot
MARK_SAFE_R=8           # mark must fit inside this circle (1x)
def hexc(h): h=h.lstrip("#"); return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)
PALETTES={
 "default":   {"scallop":(214,140,20,255),"face":(255,211,77,255),"faceRing":(255,245,190,255),"tail":SKY,
               "source":"A3 house palette (generic fallback, unchanged from PR #138)"},
 # values copied exactly from the CSS custom properties on https://actionzonecma.com/ (fetched 24 Oct 2026); see SOURCES.md
 "actionzone":{"scallop":hexc("#191a3e"),"face":hexc("#efeadc"),"faceRing":hexc("#c9a227"),"tail":hexc("#c9a227"),
               "source":"actionzonecma.com CSS: --color-indigo #191a3e, --color-paper-warm #efeadc, --color-gold #c9a227"},
}
def base(belt=(255,146,30)):
    im=L(TW,TH); c=TW/2*SS
    halo=L(TW,TH); hd=ImageDraw.Draw(halo); hd.ellipse(S(18,42,86,112),fill=(255,226,120,120)); halo=halo.filter(ImageFilter.GaussianBlur(7*SS)); im.alpha_composite(halo)
    body=L(TW,TH)
    body.alpha_composite(toon_shape(lambda m:m.rounded_rectangle(S(22,124,82,156),4*SS,fill=255),body.size,(92,56,34,255)))
    body.alpha_composite(toon_shape(lambda m:m.rounded_rectangle(S(36,112,68,126),3*SS,fill=255),body.size,(255,206,64,255)))
    body.alpha_composite(toon_shape(lambda m:m.rectangle(S(47,92,57,114),fill=255),body.size,(255,206,64,255)))
    body.alpha_composite(toon_shape(lambda m:(m.pieslice(S(26,40,78,100),0,180,fill=255),m.rectangle(S(26,62,78,70),fill=255)),body.size,(255,206,64,255)))
    hd=ImageDraw.Draw(body)
    for sx in (-1,1):
        bx=c+sx*29*SS; hd.arc((bx-9*SS,66*SS,bx+9*SS,86*SS),-90 if sx>0 else 90,90 if sx>0 else 270,fill=(214,150,30,255),width=4*SS)
    hd.rectangle(S(27,72,77,79),fill=belt+(255,)); hd.rectangle(S(27,77,77,79),fill=shade(belt,0.78))
    hd.polygon(S(48,72,56,72,59,90,52,86,45,90),fill=shade(belt,0.9))
    hd.rounded_rectangle(S(26,134,62,148),3*SS,fill=CREAM)
    im.alpha_composite(outline(body,1.6)); d=ImageDraw.Draw(im)
    for (x,y,r) in ((20,44,5),(86,36,4),(16,96,3.5)): star(d,x*SS,y*SS,r*SS,(255,245,190,255),ri=0.35,n=4)
    return dn(im,TW,TH)
def backing(p):
    sx,sy=SX*SS,SY*SS; s=L(TW,TH); sd=ImageDraw.Draw(s)
    for k in (-1,1): sd.polygon([(sx+k*3*SS-5*SS,sy),(sx+k*3*SS+5*SS,sy),(sx+k*9*SS+4*SS,sy+24*SS),(sx+k*7*SS,sy+19*SS),(sx+k*9*SS-4*SS,sy+24*SS)],fill=p["tail"])
    for k in range(14):
        a=k/14*2*math.pi; sd.ellipse((sx+math.cos(a)*13*SS-4*SS,sy+math.sin(a)*13*SS-4*SS,sx+math.cos(a)*13*SS+4*SS,sy+math.sin(a)*13*SS+4*SS),fill=p["scallop"])
    sd.ellipse((sx-14*SS,sy-14*SS,sx+14*SS,sy+14*SS),fill=p["scallop"])
    r=FACE_R*SS; sd.ellipse((sx-r,sy-r,sx+r,sy+r),fill=p["face"],outline=p["faceRing"],width=SS)
    return dn(outline(s,1.4),TW,TH)
def mark_default():
    s=L(TW,TH); sd=ImageDraw.Draw(s); star(sd,SX*SS,SY*SS,8*SS,(196,118,10,255)); star(sd,SX*SS,SY*SS,5.5*SS,(255,245,190,255)); return dn(s,TW,TH)
def mark_placeholder():
    """PLACEHOLDER, not a logo: grey/white checker disc inside a dashed ring = 'school mark goes here'."""
    s=L(TW,TH); sd=ImageDraw.Draw(s); R=MARK_SAFE_R*SS; cx,cy=SX*SS,SY*SS; q=2*SS
    for y in range(cy-R,cy+R,q):
        for x in range(cx-R,cx+R,q):
            if (x-cx+q/2)**2+(y-cy+q/2)**2<=R*R: sd.rectangle((x,y,x+q-1,y+q-1),fill=(200,200,205,255) if ((x-cx)//q+(y-cy)//q)%2 else (250,250,250,255))
    for k in range(12):
        a0=k*30; sd.arc((cx-R,cy-R,cx+R,cy+R),a0,a0+18,fill=(90,90,100,255),width=SS)
    return dn(s,TW,TH)
def mark_from_file(path):
    """How the game should place a school-supplied mark (spec): square PNG, scaled so its canvas = the safe circle diameter, centred on the seal."""
    m=Image.open(path).convert("RGBA"); d=MARK_SAFE_R*2; s=Image.new("RGBA",(TW,TH)); s.alpha_composite(m.resize((d,d),Image.LANCZOS),(SX-MARK_SAFE_R,SY-MARK_SAFE_R)); return s
B=base(); B.save(os.path.join(OUT,"trophy-base.png"))
BK={k:backing(p) for k,p in PALETTES.items()}
for k,v in BK.items(): v.save(os.path.join(OUT,f"seal-backing-{k}.png"))
MD=mark_default(); MD.save(os.path.join(OUT,"seal-mark-default-star.png"))
MP=mark_placeholder(); MP.save(os.path.join(OUT,"seal-mark-PLACEHOLDER-school.png"))
# spec template a dojo can draw on: 128x128, transparent, safe circle guide (guide is NOT part of the mark)
tp=Image.new("RGBA",(128,128)); td=ImageDraw.Draw(tp); td.ellipse((0,0,127,127),outline=(0,170,255,255),width=2); td.ellipse((8,8,119,119),outline=(255,170,0,255),width=1)
tp.save(os.path.join(OUT,"school-mark-TEMPLATE-128.png"))
def comp(*ls):
    im=Image.new("RGBA",(TW,TH))
    for l in ls: im.alpha_composite(l)
    return im
CT_DEF=comp(B,BK["default"],MD); CT_AZ=comp(B,BK["actionzone"],MP); CT_AZS=comp(B,BK["actionzone"],MD)
# check: composite of the default layers == the PR #138 sample (within resample rounding)
old=Image.open(os.path.join(SP,"trophies","certified-trophy-sample.png")).convert("RGBA")
diff=max(ImageChops.difference(old,CT_DEF).getextrema()[i][1] for i in range(4)); print("max diff vs #138 sample:",diff)
st=json.load(open(os.path.join(SP,"static.json")))
st["sprites"]["certified-trophy-layered"]={
 "size":[TW,TH],"anchorPx":[52,156],"datePlate":[26,134,62,148],"dateTextColor":"#3a2a22",
 "layers":[
  {"id":"base","files":{"img":"trophies/certified-layers/trophy-base.png"},"note":"cup + stand + plinth + blank date plate + halo + sparkles, one layer. Belt band orange in this sample."},
  {"id":"sealBacking","files":{"default":"trophies/certified-layers/seal-backing-default.png","actionzone":"trophies/certified-layers/seal-backing-actionzone.png"},"fallback":"default","note":"school palette picks the file; unknown school -> default (gold + sky)"},
  {"id":"schoolMark","files":{"default":"trophies/certified-layers/seal-mark-default-star.png","placeholder":"trophies/certified-layers/seal-mark-PLACEHOLDER-school.png"},"fallback":"default","note":"PLACEHOLDER is a stand-in only; never ship it. No school logo is in the repo yet."}],
 "schoolMarkSpec":{"centrePx":[SX,SY],"faceRadiusPx":FACE_R,"safeRadiusPx":MARK_SAFE_R,"onTrophyPx":[16,16],
   "supplyAs":"square PNG, 128x128 (min 64x64), RGBA with transparent background, sRGB, mark centred",
   "safeArea":"keep all of the mark inside the centred circle of diameter 112 px (8 px margin on a 128 canvas); outside that is clipped by the face ring",
   "rules":"no text smaller than the mark itself (it shows at 16 px); bold simple shapes; no red (house rule); test on the seal face colour of your palette",
   "palette":"backing colours: scallop, face, faceRing, tail (hex). Defaults: #d68c14 #ffd34d #fff5be #4096eb"},
 "palettes":{k:{kk:("#%02x%02x%02x"%vv[:3] if isinstance(vv,tuple) else vv) for kk,vv in p.items()} for k,p in PALETTES.items()}}
json.dump(st,open(os.path.join(SP,"static.json"),"w"),indent=2)
# previews: wall with default / AZ+placeholder / AZ+star, plus a zoomed seal strip, phone, greyscale
src2=src
def wall(w,h):
    im=Image.new("RGBA",(w,h),(236,214,174,255)); d=ImageDraw.Draw(im)
    for x in range(0,w,80): d.line((x,0,x,h),fill=(222,198,156,255),width=2)
    d.rectangle((0,0,w,10),fill=(120,74,42,255)); d.rectangle((0,h-24,w,h),fill=(150,96,54,255)); d.line((0,h-24,w,h-24),fill=INK,width=2); return im
def shelf(im,y):
    d=ImageDraw.Draw(im); d.rectangle((10,y,im.width-10,y+12),fill=(150,92,50,255),outline=INK,width=2); d.rectangle((14,y+12,im.width-14,y+16),fill=(196,166,124,255))
F=lambda n:ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",n)
W2,H2=520,250; wl=wall(W2,H2); shelf(wl,190); dd=ImageDraw.Draw(wl)
for im,x,lab in ((CT_DEF,60,"default (fallback)"),(CT_AZ,208,"AZ colours + PLACEHOLDER"),(CT_AZS,356,"AZ colours + star")):
    wl.alpha_composite(im,(x,190-im.getbbox()[3]+1)); dd.text((x+52,H2-12),lab,fill=(250,240,214),font=F(9),anchor="mm")
wl.save(os.path.join(PV,"review-4-seal-wall-default-vs-actionzone-1x.png")); wl.resize((W2*2,H2*2),Image.LANCZOS).save(os.path.join(PV,"review-4-seal-wall-default-vs-actionzone-2x.png"))
wl.resize((390,int(H2*390/W2)),Image.LANCZOS).save(os.path.join(PV,"review-5-seal-wall-phone-390px.png"))
wl.convert("L").convert("RGBA").save(os.path.join(PV,"greyscale-4-seal-wall.png"))
# layer breakdown: base | backing default | backing AZ | mark star | mark placeholder | composite, on a checker, at 2x
ls=[(B,"base"),(BK["default"],"backing default"),(BK["actionzone"],"backing AZ"),(MD,"mark: star"),(MP,"mark: PLACEHOLDER"),(CT_AZ,"stacked")]
lb=Image.new("RGBA",(len(ls)*220+20,380),(40,40,48,255)); ld=ImageDraw.Draw(lb)
for i,(l,n) in enumerate(ls):
    x=20+i*220; ld.rectangle((x,20,x+208,352),fill=(70,70,80,255)); lb.alpha_composite(l.resize((TW*2,TH*2),Image.NEAREST),(x,20)); ld.text((x+104,366),n,fill=(230,220,200),font=F(12),anchor="mm")
lb.save(os.path.join(PV,"review-6-seal-layers-2x.png"))
z=Image.new("RGBA",(3*160+20,180),(236,214,174,255)); zd=ImageDraw.Draw(z)
for i,ct in enumerate((CT_DEF,CT_AZ,CT_AZS)):
    z.alpha_composite(ct.crop((SX-24,SY-18,SX+24,SY+30)).resize((144,144),Image.NEAREST),(20+i*160,10))
z.save(os.path.join(PV,"review-7-seal-closeup-3x.png"))
print("ok")
