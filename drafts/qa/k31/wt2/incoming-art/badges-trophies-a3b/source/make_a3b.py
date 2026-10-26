"""Dojo Ascent - A3b: the full certified-trophy set (S6 Dojo families) on the layered stand + seal from A3 (#146),
and the medallion badge family for the other S6 groups.  Run from incoming-art/:  python3 badges-trophies-a3b/source/make_a3b.py
Same look as A3: PIL 4x supersampling, flat toon fill + one shade step + highlight + warm dark outline. No baked text or numbers.
Tiers read from metal (bronze -> silver -> gold -> gold+gem), star pips and extras (ribbons, rays). No red, except the belt band of a
promotion trophy, which is tinted with the real belt colour (existing beltStyles rule, same as the player belt)."""
import os, math, json
H=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(H,"..","..","badges-trophies-a3","source","make_a3.py")).read().split("# ---------------------------------------------------------------- 1. badges")[0]
exec(src); SKY=(64,150,235,255)
SP=os.path.join(H,"..","sprites"); PV=os.path.join(H,"..","preview"); A3L=os.path.join(H,"..","..","badges-trophies-a3","sprites","trophies","certified-layers")
TW,TH=104,166; SEAL_DEF=Image.open(os.path.join(A3L,"seal-backing-default.png")).convert("RGBA"); MARK_DEF=Image.open(os.path.join(A3L,"seal-mark-default-star.png")).convert("RGBA")
SEAL_AZ=Image.open(os.path.join(A3L,"seal-backing-actionzone.png")).convert("RGBA")
METAL={"bronze":((205,127,50,255),(140,84,30,255)),"silver":((196,206,220,255),(120,132,152,255)),"gold":((255,206,64,255),(196,128,16,255)),"wood":((176,122,74,255),(120,80,46,255))}
def tier_style(i,n):
    """index i of n tiers -> (metal, pips, ribbons, rays, gem). One-tier families are gold."""
    if n==1: return "gold",1,True,0,False
    seq=["bronze","silver","gold","gold","gold"] if n<=5 else ["bronze","bronze","silver","silver","gold","gold"]
    m=seq[min(i,len(seq)-1)] if n>=4 else ["bronze","silver","gold"][i]
    top=(i==n-1); return m,i+1,(m!="bronze"),(12 if m=="gold" else 0)+(4 if top and n>=4 else 0),top and n>=4
BELTS={"yellow":("#f5d22e",None),"orange":("#f08a24",None),"green":("#3aa655",None),"blue":("#2f6fd6",None),"red":("#d8352a",None),
       "red-black":("#d8352a","#111116"),"brown":("#7a4a26",None),"brown-black":("#7a4a26","#111116"),"black":("#26272f",None)}
def hx(h): h=h.lstrip("#"); return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)
# ---------------------------------------------------------------- stand layer (plinth + blank plate + pips), shared by every certified trophy
def stand(pips):
    im=L(TW,TH); b=toon_shape(lambda m:m.rounded_rectangle(S(22,124,82,156),4*SS,fill=255),im.size,(92,56,34,255)); d=ImageDraw.Draw(b)
    d.rounded_rectangle(S(26,134,62,148),3*SS,fill=CREAM)
    im.alpha_composite(outline(b,1.6)); d=ImageDraw.Draw(im)
    for k in range(pips): x=(29+k*6)*SS; star(d,x,130*SS,3.8*SS,INK); star(d,x,130*SS,2.7*SS,(255,236,150,255))
    return dn(im,TW,TH)
def halo_sparkle(gem):
    im=L(TW,TH); h=L(TW,TH); hd=ImageDraw.Draw(h); hd.ellipse(S(18,42,86,112),fill=(255,226,120,120)); im.alpha_composite(h.filter(ImageFilter.GaussianBlur(7*SS)))
    d=ImageDraw.Draw(im)
    for (x,y,r) in ((20,44,5),(86,36,4),(16,96,3.5))+(((84,98,3.5),) if gem else ()): star(d,x*SS,y*SS,r*SS,(255,245,190,255),ri=0.35,n=4)
    return dn(im,TW,TH)
# ---------------------------------------------------------------- toppers: one silhouette per category (they must read apart at phone size)
def T(fn,col): return lambda lay: lay.alpha_composite(toon_shape(fn,lay.size,col))
def topper(cat,metal,gem,tier=4):
    col,dk=METAL[metal]; lay=L(TW,TH); c=TW/2*SS; d=ImageDraw.Draw(lay)
    foot=lambda: T(lambda m:m.rounded_rectangle(S(36,112,68,126),3*SS,fill=255),col)(lay)
    if cat=="promotion":   # two-handled cup + belt band (band is a separate tint layer)
        foot(); T(lambda m:m.rectangle(S(47,92,57,114),fill=255),col)(lay)
        T(lambda m:(m.pieslice(S(26,40,78,100),0,180,fill=255),m.rectangle(S(26,62,78,70),fill=255)),col)(lay); d=ImageDraw.Draw(lay)
        for sx in (-1,1): bx=c+sx*29*SS; d.arc((bx-9*SS,66*SS,bx+9*SS,86*SS),-90 if sx>0 else 90,90 if sx>0 else 270,fill=dk,width=4*SS)
    elif cat=="stripes":   # a tall column with belt-tip tape bands = stripes
        foot(); T(lambda m:m.rounded_rectangle(S(40,40,64,114),4*SS,fill=255),col)(lay); d=ImageDraw.Draw(lay)
        d.rounded_rectangle(S(36,34,68,44),3*SS,fill=dk)
        for k in range(tier): d.rectangle(S(40,56+k*12,64,61+k*12),fill=(244,241,234,255))
    elif cat=="classes":   # a big star on a short post
        foot(); T(lambda m:m.rectangle(S(48,96,56,114),fill=255),col)(lay)
        T(lambda m:star(m,c,70*SS,32*SS,255,ri=0.5),col)(lay)
    elif cat=="weeks":     # a slim tall goblet, no handles, with a sun disc
        foot(); T(lambda m:m.rectangle(S(48,86,56,114),fill=255),col)(lay)
        T(lambda m:m.polygon(S(32,36,72,36,60,88,44,88),fill=255),col)(lay); d=ImageDraw.Draw(lay)
        d.ellipse(S(44,50,60,66),fill=(255,246,200,255),outline=dk,width=SS)
    elif cat=="anniversary": # a ring (wreath) standing on the foot, with a sky gem at its heart
        foot(); T(lambda m:(m.ellipse(S(24,36,80,108),fill=255),m.ellipse(S(36,48,68,96),fill=0)),col)(lay); d=ImageDraw.Draw(lay)
        for k in range(10):
            a=math.radians(200+k*14); x=c+math.cos(a)*24*SS; y=72*SS+math.sin(a)*30*SS; d.ellipse((x-3*SS,y-5*SS,x+3*SS,y+5*SS),fill=(60,200,150,255))
            a=math.radians(340-k*14); x=c+math.cos(a)*24*SS; y=72*SS+math.sin(a)*30*SS; d.ellipse((x-3*SS,y-5*SS,x+3*SS,y+5*SS),fill=(60,200,150,255))
        d.polygon(S(52,64,60,72,52,80,44,72),fill=SKY)
    elif cat=="signoffs":  # an open scroll held up by two posts (technique signed off)
        foot()
        for x in (38,62): T(lambda m,x=x:m.rectangle(S(x,90,x+4,114),fill=255),col)(lay)
        d=ImageDraw.Draw(lay); d.rounded_rectangle(S(28,48,76,90),3*SS,fill=(255,252,240,255))
        for k in range(3): d.line(S(36,60+k*9,68,60+k*9),fill=(214,196,160,255),width=2*SS)
        for x in (24,74): T(lambda m,x=x:m.rounded_rectangle(S(x,42,x+6,96),2*SS,fill=255),col)(lay)
        d=ImageDraw.Draw(lay); d.line(S(56,82,60,86,70,74),fill=SKY,width=3*SS)   # sky tick = signed off
    elif cat=="accolade":  # a shield plaque on a post, big star (template: the game writes the accolade name on the wall card)
        foot(); T(lambda m:m.rectangle(S(48,96,56,114),fill=255),col)(lay)
        T(lambda m:m.polygon(S(28,38,76,38,76,70,52,98,28,70),fill=255),col)(lay); d=ImageDraw.Draw(lay)
        d.polygon(S(34,44,70,44,70,68,52,90,34,68),fill=SKY); star(d,c,64*SS,13*SS,(255,236,150,255))
    if gem and cat not in ("anniversary",):
        gx,gy={"promotion":(c,52*SS),"stripes":(c,39*SS),"classes":(c,70*SS),"weeks":(c,42*SS),"signoffs":(c,46*SS),"accolade":(c,40*SS)}[cat]
        d=ImageDraw.Draw(lay); d.polygon([(gx,gy-6*SS),(gx+6*SS,gy),(gx,gy+6*SS),(gx-6*SS,gy)],fill=SKY)
    return dn(outline(lay,1.6),TW,TH)
def belt_band(color,color2):
    """promotion only: band + knot, already tinted (and a neutral mask for runtime tinting)"""
    out=[]
    for tint in (True,False):
        lay=L(TW,TH); d=ImageDraw.Draw(lay); b=hx(color) if tint else (255,255,255,255)
        d.rectangle(S(27,72,77,79),fill=b); d.rectangle(S(27,77,77,79),fill=shade(b,0.78)); d.polygon(S(48,72,56,72,59,90,52,86,45,90),fill=shade(b,0.9))
        if tint and color2: d.rectangle(S(27,74,77,76),fill=hx(color2))
        if tint and color=="#26272f": d.line(S(27,73,77,73),fill=hx("#a2a6b6"),width=SS)
        out.append(dn(outline(lay,1.0),TW,TH))
    return out
# ---------------------------------------------------------------- the certified set (only IDs whose S6 reward is CT)
CT=[("promotion",b) for b in BELTS]+[("stripes",n) for n in (1,5,10,20)]+[("classes",n) for n in (10,25,50,100,250,500)]+\
   [("weeks",n) for n in (50,100)]+[("anniversary",n) for n in (1,2,3,5,10)]+[("signoffs",n) for n in (1,50)]+[("accolade","{slug}")]
FAM={}
for cat,key in CT: FAM.setdefault(cat,[]).append(key)
OUT=os.path.join(SP,"trophies"); os.makedirs(os.path.join(OUT,"layers"),exist_ok=True); M={"sprites":{},"layerOrder":["halo","stand","topper","beltBand(promotion only)","sealBacking (A3 #146, per school)","schoolMark (A3 #146, per school)"]}
CTIMG={}
for cat,key in CT:
    keys={"weeks":[5,10,20,50,100],"signoffs":[1,10,25,50]}.get(cat,FAM[cat]); i=keys.index(key); n=len(keys)   # tier = position in the whole S6 family
    if cat=="promotion": metal,pips,_,_,gem="gold",0,0,0,key=="black"
    else: metal,pips,_,_,gem=tier_style(i,n)
    if cat=="accolade": pips=0
    lid=f"ct-{cat}" if cat in ("promotion","accolade") else f"ct-{cat}-{key}"
    hs=halo_sparkle(gem); st=stand(pips); tp=topper(cat,metal,gem,i+1)
    files={}
    for nm,img in (("halo",hs),("stand",st),("topper",tp)):
        fn=f"layers/{lid}-{nm}.png" if nm=="topper" else f"layers/{nm}-pips{pips}{'-gem' if gem and nm=='halo' else ''}.png"
        img.save(os.path.join(OUT,fn)); files[nm]=fn
    full=Image.new("RGBA",(TW,TH)); full.alpha_composite(hs); full.alpha_composite(st); full.alpha_composite(tp)
    if cat=="promotion":
        bt,bm=belt_band(*BELTS[key]); bm.save(os.path.join(OUT,"layers","ct-promotion-beltband-TINT.png")); files["beltBandTint"]="layers/ct-promotion-beltband-TINT.png"
        bt.save(os.path.join(OUT,"layers",f"ct-promotion-beltband-{key}.png")); files["beltBand"]=f"layers/ct-promotion-beltband-{key}.png"; full.alpha_composite(bt)
    full.alpha_composite(SEAL_DEF); full.alpha_composite(MARK_DEF)
    sid=f"ct-{cat}-{key}".replace("{slug}","template"); full.save(os.path.join(OUT,f"{sid}.png")); CTIMG[(cat,key)]=full
    M["sprites"][sid]={"achievement":f"ach.dojo.{cat}.{key}","files":{"img":f"trophies/{sid}.png",**files,"sealBacking":"../badges-trophies-a3/sprites/trophies/certified-layers/seal-backing-<palette>.png","schoolMark":"../badges-trophies-a3/sprites/trophies/certified-layers/seal-mark-<school>.png"},
      "size":[TW,TH],"anchorPx":[52,156],"datePlate":[26,134,62,148],"dateTextColor":"#3a2a22","metal":metal,"pips":pips,"gem":gem,
      "note":"img = baked preview with the DEFAULT seal; in game stack the layers and the school's seal. Plate is blank (game writes 'Earned {date}')."+(" Belt band: beltStyles colour (or tint the TINT mask with belt.color / color2)." if cat=="promotion" else "")+(" Template: one model for every accolade; the name comes from the feed (C6)." if cat=="accolade" else "")}
# ---------------------------------------------------------------- badges: the other S6 groups, same medallion as the bow badges
def sym(name,d,c):
    I=INK; W=(255,252,240,255); G=(255,206,64,255); C=(150,92,50,255); MINT=(60,200,150,255)
    def P(pts,f): d.polygon([(c+x*SS,c+y*SS) for x,y in pts],fill=I); d.polygon([(c+x*0.82*SS,c+y*0.82*SS) for x,y in pts],fill=f)
    if name=="floors":      # stairs up
        for k in range(3): d.rectangle((c+(-18+k*12)*SS,c+(14-k*10)*SS,c+(18)*SS,c+(18-k*10+4)*SS),fill=W,outline=I,width=int(1.5*SS))
    elif name=="perfects":  # a round counter-swoop arrow + sparkle
        d.arc((c-16*SS,c-12*SS,c+16*SS,c+20*SS),200,340,fill=I,width=7*SS); d.arc((c-16*SS,c-12*SS,c+16*SS,c+20*SS),202,338,fill=SKY,width=4*SS)
        d.polygon([(c+16*SS,c-8*SS),(c+20*SS,c+4*SS),(c+8*SS,c+2*SS)],fill=I); star(d,c,c+6*SS,8*SS,I,ri=0.4,n=4); star(d,c,c+6*SS,6*SS,G,ri=0.4,n=4)
    elif name=="combo":     # three linked rings
        for k in (-1,0,1): d.ellipse((c+(k*11-8)*SS,c-8*SS,c+(k*11+8)*SS,c+8*SS),outline=I,width=4*SS); d.ellipse((c+(k*11-7)*SS,c-7*SS,c+(k*11+7)*SS,c+7*SS),outline=SKY,width=2*SS)
    elif name=="allS":      # a crown
        P([(-18,12),(-18,-8),(-9,2),(0,-14),(9,2),(18,-8),(18,12)],G)
    elif name=="elites":    # a faceted gem with an aura ring
        d.ellipse((c-20*SS,c-20*SS,c+20*SS,c+20*SS),outline=(150,210,255,255),width=2*SS); P([(0,-16),(14,-4),(0,16),(-14,-4)],SKY)
    elif name=="challenge": # a mountain with a flag
        P([(-20,14),(0,-14),(20,14)],(196,206,220,255)); d.line((c,c-14*SS,c,c-24*SS),fill=I,width=2*SS); d.polygon([(c,c-24*SS),(c+10*SS,c-20*SS),(c,c-16*SS)],fill=SKY)
    elif name=="guardian":  # a tower gate (arch); the gem above takes the tier belt colour (tint layer)
        d.rectangle((c-16*SS,c-12*SS,c+16*SS,c+16*SS),fill=(196,206,220,255),outline=I,width=int(1.5*SS)); d.pieslice((c-8*SS,c-6*SS,c+8*SS,c+12*SS),180,360,fill=(58,42,34,255)); d.rectangle((c-8*SS,c+3*SS,c+8*SS,c+16*SS),fill=(58,42,34,255))
        for k in (-12,-4,4,12): d.rectangle((c+(k-3)*SS,c-18*SS,c+(k+3)*SS,c-12*SS),fill=(196,206,220,255),outline=I,width=SS)
    elif name in ("entries","master"):  # an open book (+ magnifier for master)
        d.polygon([(c-20*SS,c-10*SS),(c,c-6*SS),(c+20*SS,c-10*SS),(c+20*SS,c+12*SS),(c,c+16*SS),(c-20*SS,c+12*SS)],fill=W,outline=I); d.line((c,c-6*SS,c,c+16*SS),fill=I,width=int(1.5*SS))
        for k in (0,6): d.line((c-15*SS,c+(k-2)*SS,c-4*SS,c+k*SS),fill=(214,196,160,255),width=SS*2); d.line((c+4*SS,c+k*SS,c+15*SS,c+(k-2)*SS),fill=(214,196,160,255),width=SS*2)
        if name=="master": d.ellipse((c+4*SS,c-20*SS,c+20*SS,c-4*SS),fill=(200,230,255,255),outline=I,width=2*SS); d.line((c+18*SS,c-6*SS,c+24*SS,c),fill=C,width=3*SS)
    elif name=="placed":    # a little house
        P([(-16,16),(-16,-2),(0,-16),(16,-2),(16,16)],W); d.rectangle((c-4*SS,c+4*SS,c+4*SS,c+13*SS),fill=C)
    elif name=="tidy":      # a broom + sparkle
        d.line((c+10*SS,c-18*SS,c-4*SS,c+4*SS),fill=C,width=4*SS); P([(-14,4),(2,4),(6,18),(-18,18)],G); star(d,c+12*SS,c+8*SS,6*SS,(200,230,255,255),ri=0.35,n=4)
    elif name=="location":  # a map pin
        d.ellipse((c-12*SS,c-18*SS,c+12*SS,c+6*SS),fill=I); d.polygon([(c-11*SS,c-2*SS),(c+11*SS,c-2*SS),(c,c+18*SS)],fill=I)
        d.ellipse((c-10*SS,c-16*SS,c+10*SS,c+4*SS),fill=SKY); d.polygon([(c-9*SS,c-2*SS),(c+9*SS,c-2*SS),(c,c+15*SS)],fill=SKY); d.ellipse((c-4*SS,c-10*SS,c+4*SS,c-2*SS),fill=W)
    elif name=="stars":     # a lightbulb with a star (Street Smarts stars)
        d.ellipse((c-13*SS,c-18*SS,c+13*SS,c+8*SS),fill=I); d.ellipse((c-11*SS,c-16*SS,c+11*SS,c+6*SS),fill=(255,240,170,255)); d.rectangle((c-6*SS,c+6*SS,c+6*SS,c+14*SS),fill=(196,206,220,255),outline=I,width=SS); star(d,c,c-5*SS,7*SS,G)
    elif name=="quests":    # a compass rose
        P([(0,-18),(5,-5),(18,0),(5,5),(0,18),(-5,5),(-18,0),(-5,-5)],MINT); d.ellipse((c-3*SS,c-3*SS,c+3*SS,c+3*SS),fill=W)
    elif name=="weeks":     # a sun over a mat (weeks trained)
        d.ellipse((c-10*SS,c-16*SS,c+10*SS,c+4*SS),fill=I); d.ellipse((c-8*SS,c-14*SS,c+8*SS,c+2*SS),fill=G); d.rounded_rectangle((c-18*SS,c+6*SS,c+18*SS,c+14*SS),2*SS,fill=SKY,outline=I,width=SS)
    elif name=="signoffs":  # a scroll with a tick
        d.rounded_rectangle((c-16*SS,c-12*SS,c+16*SS,c+12*SS),3*SS,fill=W,outline=I,width=int(1.5*SS)); d.line((c-7*SS,c,c-1*SS,c+6*SS,c+9*SS,c-6*SS),fill=SKY,width=3*SS)
    elif name=="practice":  # a kick target pad (home practice)
        d.ellipse((c-16*SS,c-16*SS,c+16*SS,c+16*SS),fill=I); d.ellipse((c-14*SS,c-14*SS,c+14*SS,c+14*SS),fill=W); d.ellipse((c-9*SS,c-9*SS,c+9*SS,c+9*SS),fill=SKY); d.ellipse((c-4*SS,c-4*SS,c+4*SS,c+4*SS),fill=W)
def badge(sym_name,metal,pips,rib,rays,gem,gemcol=None):
    W=128; im=L(W,W); c=W/2*SS; rim,rimd=METAL[metal]
    if rays:
        g=L(W,W); gd=ImageDraw.Draw(g)
        for k in range(rays):
            a=math.radians(k*360/rays-90); a1=a-math.radians(180/rays*0.45); a2=a+math.radians(180/rays*0.45); R=(60 if gem else 54)*SS
            gd.polygon([(c,c),(c+math.cos(a1)*R,c+math.sin(a1)*R),(c+math.cos(a2)*R,c+math.sin(a2)*R)],fill=(255,236,160,255))
        g=g.filter(ImageFilter.GaussianBlur(1.5*SS)); g.putalpha(g.getchannel("A").point(lambda v:v*3//5)); im.alpha_composite(g)
    if rib:
        r=L(W,W); rd=ImageDraw.Draw(r)
        for sx in (-1,1): x0=c+sx*12*SS; rd.polygon([(x0-8*SS,c+20*SS),(x0+8*SS,c+20*SS),(x0+sx*14*SS,c+58*SS),(x0+sx*6*SS,c+51*SS),(x0-sx*2*SS,c+58*SS)],fill=SKY)
        im.alpha_composite(outline(r,1.5))
    R=42 if gem else 40
    med=toon_shape(lambda m:m.ellipse((c-R*SS,c-R*SS,c+R*SS,c+R*SS),fill=255),im.size,rim); fd=ImageDraw.Draw(med); fr=R-8
    fd.ellipse((c-fr*SS,c-fr*SS,c+fr*SS,c+fr*SS),fill=(250,240,214,255)); fd.ellipse((c-fr*SS,c-fr*SS,c+fr*SS,c+fr*SS),outline=rimd,width=2*SS)
    sym(sym_name,fd,c)
    for i in range(pips):
        a=math.radians(90+(i-(pips-1)/2)*22); x=c+math.cos(a)*(R-4)*SS; y=c+math.sin(a)*(R-4)*SS; star(fd,x,y,5.2*SS,INK); star(fd,x,y,3.8*SS,(255,246,190,255) if metal!="silver" else (255,255,255,255))
    if gem or gemcol:
        gc=gemcol or SKY; gx,gy=c,c-(R-3)*SS; fd.polygon([(gx,gy-7*SS),(gx+7*SS,gy),(gx,gy+7*SS),(gx-7*SS,gy)],fill=INK); fd.polygon([(gx,gy-5*SS),(gx+5*SS,gy),(gx,gy+5*SS),(gx-5*SS,gy)],fill=gc)
    im.alpha_composite(outline(med,2)); return dn(im,W,W)
BG=[("tower","floors",[1,10,50,100,250]),("tower","perfects",[10,100,500,1000,5000]),("tower","combo",[10,25,50]),("tower","allS",[None]),
    ("tower","elites",[1,25,100]),("tower","challenge",[1,10,50]),("journal","entries",[5,10,25]),("journal","master",["{enemyId}"]),
    ("home","placed",[5,15,30]),("home","tidy",[5,20,50]),("smarts","location",["{place}"]),("smarts","stars",[10,25,50]),("life","quests",[1,5,10]),
    ("dojo","weeks",[5,10,20]),("dojo","signoffs",[10,25]),("dojo","practice",[1,5,10,25,50])]
os.makedirs(os.path.join(SP,"badges"),exist_ok=True); BIMG={}
for grp,fam,ks in BG:
    full={"weeks":[5,10,20,50,100],"signoffs":[1,10,25,50]}.get(fam,ks) if grp=="dojo" else ks   # tier position counts the whole S6 family
    for k in ks:
        i=full.index(k); metal,pips,rib,rays,gem=tier_style(i,len(full))
        if len(ks)==1: pips=0
        aid=f"ach.{grp}.{fam}"+("" if k is None else f".{k}"); bid=f"badge-{grp}-{fam}"+("" if k is None or str(k).startswith("{") else f"-{k}")
        b=badge(fam,metal,pips,rib,rays,gem); b.save(os.path.join(SP,"badges",bid+".png")); BIMG[bid]=b
        M["sprites"][bid]={"achievement":aid,"files":{"img":f"badges/{bid}.png"},"size":[128,128],"anchorPx":[64,64],"metal":metal,"pips":pips,"ribbons":rib,"gem":gem,"note":"no text or numbers baked in; the game shows the name (C6)"+(" Template: one badge for every "+k+"." if isinstance(k,str) else "")}
# guardian: one badge per tier; the gem is the tier's belt colour (beltStyles). White uses the white-belt fallback tan #d2a878.
GB={"white":"#d2a878",**{k:v[0] for k,v in BELTS.items()}}
for k,colr in GB.items():
    bid=f"badge-tower-guardian-{k}"; b=badge("guardian","gold",0,True,12,False,gemcol=hx(colr)); b.save(os.path.join(SP,"badges",bid+".png")); BIMG[bid]=b
    M["sprites"][bid]={"achievement":f"ach.tower.guardian.{k}","files":{"img":f"badges/{bid}.png"},"size":[128,128],"anchorPx":[64,64],"metal":"gold","gemColour":colr,"note":"Guardian: all 10 tiers gold + rays; the top gem is the tier belt colour (beltStyles; white -> #d2a878 fallback)"}
json.dump(M,open(os.path.join(SP,"static.json"),"w"),indent=2)
# ---------------------------------------------------------------- previews
F=lambda n:ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",n)
def wall(w,h):
    im=Image.new("RGBA",(w,h),(236,214,174,255)); d=ImageDraw.Draw(im)
    for x in range(0,w,80): d.line((x,0,x,h),fill=(222,198,156,255),width=2)
    return im
rows=[list(FAM["promotion"]),["stripes","classes"],["weeks","anniversary","signoffs","accolade"]]
def row_items(r):
    if r==rows[0]: return [("promotion",k) for k in r]
    return [(c,k) for c in r for k in FAM[c]]
RI=[row_items(r) for r in rows]; cw=108; W=max(len(r) for r in RI)*cw+20; Hh=len(RI)*200+30
pv=wall(W,Hh); d=ImageDraw.Draw(pv)
for j,r in enumerate(RI):
    y=180+j*200; d.rectangle((10,y,W-10,y+12),fill=(150,92,50,255),outline=INK,width=2)
    for i,(c,k) in enumerate(r):
        im=CTIMG[(c,k)]; x=14+i*cw; pv.alpha_composite(im,(x,y-im.getbbox()[3]+1)); d.text((x+52,y+22),f"{c} {k}".replace("{slug}","(any)"),fill=(90,60,40),font=F(9),anchor="mm")
d.text((10,Hh-10),"labels are preview only. Seal = default (gold/sky). Plates blank (the game writes the date).",fill=(90,60,40),font=F(10))
pv.save(os.path.join(PV,"review-1-certified-set-1x.png")); pv.convert("L").convert("RGBA").save(os.path.join(PV,"greyscale-1-certified-set.png"))
# phone read test: one of each category at 1/2 size (a phone trophy wall), default and Action Zone seals
pick=[("promotion","blue"),("stripes",20),("classes",100),("weeks",50),("anniversary",5),("signoffs",50),("accolade","{slug}")]
ph=wall(7*58+20,2*100+20)
for j,seal in enumerate((None,SEAL_AZ)):
    for i,ck in enumerate(pick):
        im=CTIMG[ck].copy()
        if seal is not None: im.alpha_composite(seal); im.alpha_composite(MARK_DEF)
        s=im.resize((52,83),Image.LANCZOS); ph.alpha_composite(s,(12+i*58,10+j*100))
ph.save(os.path.join(PV,"review-2-categories-phone-half-size.png")); ph.convert("L").convert("RGBA").save(os.path.join(PV,"greyscale-2-categories-phone.png"))
# badges sheet
order=list(BIMG); cols=10; bw=96; sh=Image.new("RGBA",(cols*bw+20,((len(order)+cols-1)//cols)*(bw+18)+30),(33,29,46,255)); d=ImageDraw.Draw(sh)
for i,bid in enumerate(order):
    x=10+(i%cols)*bw; y=10+(i//cols)*(bw+18); sh.alpha_composite(dn(BIMG[bid],84,84),(x+6,y)); d.text((x+48,y+92),bid.replace("badge-",""),fill=(230,220,200),font=F(7),anchor="mm")
sh.save(os.path.join(PV,"review-3-badges-all.png")); sh.convert("L").convert("RGBA").save(os.path.join(PV,"greyscale-3-badges-all.png"))
ps=Image.new("RGBA",(len(order)*52+20,70),(33,29,46,255))
for i,bid in enumerate(order): ps.alpha_composite(dn(BIMG[bid],48,48),(10+i*52,11))
ps.save(os.path.join(PV,"review-4-badges-phone-48px.png"))
print("ok", len(CTIMG),"trophies", len(BIMG),"badges")
