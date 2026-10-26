"""Dojo Ascent - A3 samples: bow-question award badges (5/10/20/50/100), a certified trophy, and a game trophy on a trophy wall.
Run from incoming-art/:  python3 badges-trophies-a3/source/make_a3.py
Drawn with PIL at 4x supersampling, then flat toon fill + one shade step + highlight + warm dark outline, the same look as icons/ (Seals) and decor-tier1-a6.
No red. No baked-in text (the tier reads from the rim material, the pips and the rays; the game writes names and the date)."""
import os, math, json
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageFont
H=os.path.dirname(os.path.abspath(__file__)); IA=os.path.join(H,"..",".."); SP=os.path.join(H,"..","sprites"); PV=os.path.join(H,"..","preview")
SS=4; INK=(58,42,34,255); CREAM=(250,240,214,255)
def L(w,h): return Image.new("RGBA",(w*SS,h*SS))
def S(*v): return [x*SS for x in v]
def shade(c,k): return tuple(max(0,min(255,int(v*k))) for v in c[:3])+(255,)
def outline(im,px=2):
    a=im.getchannel("A").point(lambda v:255 if v>8 else 0).filter(ImageFilter.MaxFilter(int(round(px*SS))*2+1)); o=Image.new("RGBA",im.size,INK); o.putalpha(a); o.alpha_composite(im); return o
def toon_shape(draw_fn,size,col,light=(-1,-1)):
    """flat fill, darker lower-right shade band, small upper-left highlight (the house toon ramp)"""
    m=Image.new("L",size,0); draw_fn(ImageDraw.Draw(m)); base=Image.new("RGBA",size,col); base.putalpha(m)
    sh=ImageChops.subtract(m,ImageChops.offset(m,-5*SS,-5*SS)); s=Image.new("RGBA",size,shade(col,0.8)); s.putalpha(sh); base.alpha_composite(s)
    hl=ImageChops.subtract(m,ImageChops.offset(m,3*SS,3*SS)).filter(ImageFilter.GaussianBlur(SS)); h=Image.new("RGBA",size,shade(col,1.18)); h.putalpha(hl.point(lambda v:v*2//3)); base.alpha_composite(h)
    return base
def star(d,x,y,r,col,ri=0.45,n=5,rot=-90):
    pts=[]
    for k in range(n*2):
        rr=r if k%2==0 else r*ri; a=math.radians(rot+k*180/n); pts.append((x+math.cos(a)*rr,y+math.sin(a)*rr))
    d.polygon(pts,fill=col)
def dn(im,w,h): return im.resize((w,h),Image.LANCZOS)
# ---------------------------------------------------------------- 1. badges
# tier = rim material + number of pips + extra flourish. Same symbol on all 5: a lantern of learning? no -> keep it neutral: an open scroll with a soft sparkle (memory/recall), Seal-family medallion.
TIERS=[  # id, rim, rim-dark, face, pips, ribbons, rays, gem
 ("bow-5",  (176,122,74), (120,80,46), (250,240,214), 1, False, 0, None),            # wood
 ("bow-10", (205,127,50), (140,84,30), (250,240,214), 2, False, 0, None),            # bronze
 ("bow-20", (196,206,220),(120,132,152),(250,244,226), 3, True,  0, None),            # silver + sky ribbons
 ("bow-50", (255,206,64), (196,128,16), (255,246,210), 4, True, 12, None),            # gold + short rays
 ("bow-100",(255,214,72), (196,128,16), (255,248,220), 5, True, 16, (64,150,235)),    # gold + long rays + sky-blue gem + laurel
]
SKY=(64,150,235,255); SKYD=(40,104,176,255)
def scroll(d,cx,cy,w,col_paper=CREAM):
    pass
def badge(t):
    tid,rim,rimd,face,pips,rib,rays,gem=t; W=128; im=L(W,W); c=W/2*SS
    d=ImageDraw.Draw(im)
    if rays:  # soft gold sunburst behind (50 and 100)
        g=L(W,W); gd=ImageDraw.Draw(g)
        for k in range(rays):
            a=math.radians(k*360/rays-90); a1=a-math.radians(180/rays*0.45); a2=a+math.radians(180/rays*0.45); R=(60 if tid=="bow-100" else 54)*SS
            gd.polygon([(c,c),(c+math.cos(a1)*R,c+math.sin(a1)*R),(c+math.cos(a2)*R,c+math.sin(a2)*R)],fill=(255,236,160,255))
        g=g.filter(ImageFilter.GaussianBlur(1.5*SS)); g.putalpha(g.getchannel("A").point(lambda v:v*3//5)); im.alpha_composite(g)
    if rib:   # two ribbon tails under the medallion (sky blue, house accent)
        r=L(W,W); rd=ImageDraw.Draw(r)
        for sx in (-1,1):
            x0=c+sx*12*SS; rd.polygon([(x0-8*SS,c+20*SS),(x0+8*SS,c+20*SS),(x0+sx*14*SS+8*SS*sx*0,c+58*SS),(x0+sx*6*SS,c+51*SS),(x0-sx*2*SS,c+58*SS)],fill=SKY)
        im.alpha_composite(outline(r,1.5))
    R=40 if tid!="bow-100" else 42
    med=toon_shape(lambda m:m.ellipse((c-R*SS,c-R*SS,c+R*SS,c+R*SS),fill=255),im.size,rim+(255,))
    fd=ImageDraw.Draw(med); fr=R-8; fd.ellipse((c-fr*SS,c-fr*SS,c+fr*SS,c+fr*SS),fill=face+(255,))
    fd.ellipse((c-fr*SS,c-fr*SS,c+fr*SS,c+fr*SS),outline=rimd+(255,),width=2*SS)
    # symbol: an open scroll (two rods + paper) with a sparkle above = "remembered"
    py=c+6*SS; pw=20*SS; ph=13*SS
    fd.rounded_rectangle((c-pw,py-ph,c+pw,py+ph),3*SS,fill=(255,252,240,255),outline=INK,width=int(1.5*SS))
    for k in (-1,0,1): fd.line((c-pw+7*SS,py+k*6*SS,c+pw-7*SS,py+k*6*SS),fill=(214,196,160,255),width=int(1.6*SS))
    for sx in (-1,1): fd.rounded_rectangle((c+sx*pw-3*SS,py-ph-3*SS,c+sx*pw+3*SS,py+ph+3*SS),2*SS,fill=(150,92,50,255),outline=INK,width=SS)
    star(fd,c,py-ph-9*SS,8*SS,INK,ri=0.4,n=4,rot=-90); star(fd,c,py-ph-9*SS,6*SS,(255,206,64,255),ri=0.4,n=4,rot=-90)
    # pips around the bottom of the rim: 1..5 small stars = the tier count, readable without numbers
    for i in range(pips):
        a=math.radians(90+(i-(pips-1)/2)*22); x=c+math.cos(a)*(R-4)*SS; y=c+math.sin(a)*(R-4)*SS
        star(fd,x,y,5.2*SS,INK); star(fd,x,y,3.8*SS,(255,246,190,255) if rim[2]<150 else (255,255,255,255))
    if gem:  # 100: sky-blue gem at the top of the rim
        gx,gy=c,c-(R-3)*SS; fd.polygon([(gx,gy-7*SS),(gx+7*SS,gy),(gx,gy+7*SS),(gx-7*SS,gy)],fill=INK); fd.polygon([(gx,gy-5*SS),(gx+5*SS,gy),(gx,gy+5*SS),(gx-5*SS,gy)],fill=gem+(255,)); fd.polygon([(gx,gy-5*SS),(gx+2*SS,gy-1*SS),(gx-2*SS,gy-1*SS)],fill=(200,230,255,255))
    im.alpha_composite(outline(med,2))
    if False:  # (second pass: laurel removed, it hid behind the rays/rim)  # little laurel leaves on both sides (mint green, not red)
        lf=L(W,W); ld=ImageDraw.Draw(lf)
        for sx in (-1,1):
            for k in range(4):
                a=math.radians(150-k*28) if sx<0 else math.radians(30+k*28); x=c+math.cos(a)*(R+5)*SS*sx*sx; x=c-abs(math.cos(a))*(R+5)*SS if sx<0 else c+abs(math.cos(a))*(R+5)*SS; y=c+math.sin(a)*(R+5)*SS
                ld.ellipse((x-4*SS,y-7*SS,x+4*SS,y+7*SS),fill=(60,200,150,255))
        lf=outline(lf,1.2); lf.alpha_composite(im); im=lf
    return dn(im,W,W)
os.makedirs(os.path.join(SP,"badges"),exist_ok=True); BAD={}; M={"sprites":{}}
for t in TIERS:
    b=badge(t); BAD[t[0]]=b; b.save(os.path.join(SP,"badges",f"badge-{t[0]}.png"))
    n=t[0].split("-")[1]
    M["sprites"][f"badge-{t[0]}"]={"files":{"img":f"badges/badge-{t[0]}.png"},"size":[128,128],"anchorPx":[64,64],"achievement":f"ach.bow.correct.{n}","tier":TIERS.index(t)+1,"note":"no text baked in; tier = rim (wood, bronze, silver, gold, gold+gem) + 1-5 star pips; the game shows the achievement name (C7) beside it"}
# ---------------------------------------------------------------- 2/3. trophies (decor canvas 104x166, same as decor-tier1-a6, anchor bottom-centre of the stand)
TW,TH=104,166
def plinth(d,y0,col=(110,66,38,255)):
    d.rounded_rectangle(S(24,y0,80,y0+30),3*SS,fill=col)
def certified(belt=(255,146,30)):
    """CT: gold cup on a dark wood plinth, a blank cream date plate (the game writes 'Earned {date}'), a big gold seal rosette with sky ribbons, a soft halo."""
    im=L(TW,TH); c=TW/2*SS
    halo=L(TW,TH); hd=ImageDraw.Draw(halo); hd.ellipse(S(18,42,86,112),fill=(255,226,120,120)); halo=halo.filter(ImageFilter.GaussianBlur(7*SS)); im.alpha_composite(halo)
    body=L(TW,TH)
    body.alpha_composite(toon_shape(lambda m:m.rounded_rectangle(S(22,124,82,156),4*SS,fill=255),body.size,(92,56,34,255)))      # plinth
    body.alpha_composite(toon_shape(lambda m:m.rounded_rectangle(S(36,112,68,126),3*SS,fill=255),body.size,(255,206,64,255)))   # cup foot
    body.alpha_composite(toon_shape(lambda m:m.rectangle(S(47,92,57,114),fill=255),body.size,(255,206,64,255)))                 # stem
    body.alpha_composite(toon_shape(lambda m:(m.pieslice(S(26,40,78,100),0,180,fill=255),m.rectangle(S(26,62,78,70),fill=255)),body.size,(255,206,64,255)))  # bowl
    hd=ImageDraw.Draw(body)
    for sx in (-1,1): hd.arc((c+sx*26*SS-12*SS,64*SS,c+sx*26*SS+12*SS,88*SS),90 if sx>0 else 180-90+0 if False else 90,270 if sx<0 else 90,fill=(196,128,16,255),width=4*SS) if False else None
    for sx in (-1,1):  # handles
        bx=c+sx*29*SS; hd.arc((bx-9*SS,66*SS,bx+9*SS,86*SS),-90 if sx>0 else 90,90 if sx>0 else 270,fill=(214,150,30,255),width=4*SS)
    hd.rectangle(S(27,72,77,79),fill=belt+(255,)); hd.rectangle(S(27,77,77,79),fill=shade(belt,0.78))                           # belt band (belt colour; tint layer in a real set)
    hd.polygon(S(48,72,56,72,59,90,52,86,45,90),fill=shade(belt,0.9))                                                          # belt knot tails
    hd.rounded_rectangle(S(26,134,62,148),3*SS,fill=CREAM)                                                                      # date plate: BLANK
    body=outline(body,1.6); im.alpha_composite(body)
    # seal rosette, lower-right on the plinth (the Certified mark, the biggest cue)
    sx,sy=76*SS,130*SS; s=L(TW,TH); sd=ImageDraw.Draw(s)
    for k in (-1,1): sd.polygon([(sx+k*3*SS-5*SS,sy),(sx+k*3*SS+5*SS,sy),(sx+k*9*SS+4*SS,sy+24*SS),(sx+k*7*SS,sy+19*SS),(sx+k*9*SS-4*SS,sy+24*SS)],fill=SKY)
    for k in range(14):
        a=k/14*2*math.pi; sd.ellipse((sx+math.cos(a)*13*SS-4*SS,sy+math.sin(a)*13*SS-4*SS,sx+math.cos(a)*13*SS+4*SS,sy+math.sin(a)*13*SS+4*SS),fill=(214,140,20,255))
    sd.ellipse((sx-14*SS,sy-14*SS,sx+14*SS,sy+14*SS),fill=(214,140,20,255)); sd.ellipse((sx-10*SS,sy-10*SS,sx+10*SS,sy+10*SS),fill=(255,211,77,255),outline=(255,245,190,255),width=SS)
    star(sd,sx,sy,8*SS,(196,118,10,255)); star(sd,sx,sy,5.5*SS,(255,245,190,255))
    im.alpha_composite(outline(s,1.4))
    d=ImageDraw.Draw(im)
    for (x,y,r) in ((20,44,5),(86,36,4),(16,96,3.5)): star(d,x*SS,y*SS,r*SS,(255,245,190,255),ri=0.35,n=4)                        # sparkles (stay inside, beside the cup)
    return dn(im,TW,TH)
os.makedirs(os.path.join(SP,"trophies"),exist_ok=True)
CT=certified(); CT.save(os.path.join(SP,"trophies","certified-trophy-sample.png"))
M["sprites"]["certified-trophy-sample"]={"files":{"img":"trophies/certified-trophy-sample.png"},"size":[TW,TH],"anchorPx":[52,156],"datePlate":[26,134,62,148],"dateTextColor":"#3a2a22","note":"SAMPLE CT (belt promotion: band uses the belt colour, orange shown). Certified cues: gold cup, gold seal rosette with sky ribbons, warm halo, sparkles, cream date plate. BLANK plate: the game writes 'Earned {date}' (C7 trophyText)."}
# game trophy = the existing GT look (decor-tier1-a6 Journal trophy: plain wood stand + figure), no seal, no halo
GT=Image.new("RGBA",(TW,TH))
for f in ("decor-a6-journal-trophy-keeper_decor-a6-journal-trophy-stand.png","decor-a6-journal-trophy-keeper_decor-a6-journal-trophy-fig-keeper.png"):
    GT.alpha_composite(Image.open(os.path.join(IA,"decor-tier1-a6","sprites",f)).convert("RGBA"))
json.dump(M,open(os.path.join(SP,"static.json"),"w"),indent=2)
# ---------------------------------------------------------------- previews
F=lambda n:ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",n)
# review-1: badge row on the menu colour + light paper, at 128 and at phone sizes 64 / 48
pv=Image.new("RGBA",(5*150+20,128+40+80+40),(33,29,46,255)); d=ImageDraw.Draw(pv)
for i,t in enumerate(TIERS):
    x=20+i*150; pv.alpha_composite(BAD[t[0]],(x,20)); d.text((x+64,160),t[0].split("-")[1]+" right",fill=(230,220,200),font=F(13),anchor="mm")
    pv.alpha_composite(dn(BAD[t[0]],64,64),(x+10,190)); pv.alpha_composite(dn(BAD[t[0]],48,48),(x+84,198))
d.text((10,pv.height-14),"labels are preview only (not in the art). Bottom: 64 pt and 48 pt phone sizes",fill=(150,140,130),font=F(11))
pv.save(os.path.join(PV,"review-1-bow-badges-tiers-1x.png")); pv.resize((pv.width*2,pv.height*2),Image.LANCZOS).save(os.path.join(PV,"review-1-bow-badges-tiers-2x.png"))
pv.convert("L").convert("RGBA").save(os.path.join(PV,"greyscale-1-bow-badges.png"))
# review-2/3: a trophy wall (warm plaster wall, wood shelves, the same palette as home-dojo), certified + game side by side
def wall(w,h):
    im=Image.new("RGBA",(w,h),(236,214,174,255)); d=ImageDraw.Draw(im)
    for x in range(0,w,80): d.line((x,0,x,h),fill=(222,198,156,255),width=2)                                # 80 px wall tiles
    d.rectangle((0,0,w,10),fill=(120,74,42,255)); d.rectangle((0,h-24,w,h),fill=(150,96,54,255)); d.line((0,h-24,w,h-24),fill=INK,width=2)
    return im
def shelf(im,y):
    d=ImageDraw.Draw(im); d.rectangle((10,y,im.width-10,y+12),fill=(150,92,50,255),outline=INK,width=2); d.rectangle((14,y+12,im.width-14,y+16),fill=(196,166,124,255))
W2,H2=520,250; wl=wall(W2,H2); shelf(wl,190)
items=[(GT,"game"),(CT,"certified"),(GT,"game")]
xs=[60,208,356]
for (im,_),x in zip(items,xs): wl.alpha_composite(im,(x,190-im.getbbox()[3]+1))
dd=ImageDraw.Draw(wl); dd.text((W2//2,H2-12),"Earned 12 Oct 2026  <- sample of the game-written date (UI font), not baked in",fill=(250,240,214),font=F(10),anchor="mm")
# also write the sample date on the certified plate the way the game would (preview only)
dd.text((208+44,190-CT.getbbox()[3]+1+141),"12 Oct",fill=(58,42,34),font=F(8),anchor="mm")
wl.save(os.path.join(PV,"review-2-trophy-wall-certified-vs-game-1x.png")); wl.resize((W2*2,H2*2),Image.LANCZOS).save(os.path.join(PV,"review-2-trophy-wall-certified-vs-game-2x.png"))
wl.convert("L").convert("RGBA").save(os.path.join(PV,"greyscale-2-trophy-wall.png"))
ph=wl.resize((390,int(H2*390/W2)),Image.LANCZOS); ph.save(os.path.join(PV,"review-3-trophy-wall-phone-390px.png"))
print("ok")
