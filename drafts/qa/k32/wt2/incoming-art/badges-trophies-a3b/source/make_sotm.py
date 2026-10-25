"""Dojo Ascent - A3b follow-up: Student of the Month certified trophy (ach.dojo.accolade.student-of-the-month).
Run from incoming-art/:  python3 badges-trophies-a3b/source/make_sotm.py
Reuses the A3b stand/halo/helpers (make_a3b.py up to the certified-set section) and the A3 seal layers.
Top piece: a gold crescent moon (= the month) cradling a big star (= the student), on a short post, with a sky gem. No text, no red."""
import os, math, json
H=os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(H,"make_a3b.py")).read().split("# ---------------------------------------------------------------- the certified set")[0])
OUT=os.path.join(SP,"trophies"); A3L=os.path.join(H,"..","..","badges-trophies-a3","sprites","trophies","certified-layers")
def sotm_topper():
    col,dk=METAL["gold"]; lay=L(TW,TH); c=TW/2*SS
    T(lambda m:m.rounded_rectangle(S(36,112,68,126),3*SS,fill=255),col)(lay)
    T(lambda m:m.rectangle(S(47,88,57,114),fill=255),col)(lay)
    # crescent: big disc minus an offset disc, opening to the upper right
    T(lambda m:(m.ellipse(S(20,26,86,92),fill=255),m.ellipse(S(33,16,94,78),fill=0)),col)(lay)
    d=ImageDraw.Draw(lay)
    star(d,60*SS,48*SS,18*SS,INK,ri=0.48); star(d,60*SS,48*SS,15*SS,(255,236,150,255),ri=0.48); star(d,58*SS,46*SS,6*SS,(255,250,215,255),ri=0.48)
    d.polygon([(46*SS,98*SS),(52*SS,92*SS),(58*SS,98*SS),(52*SS,104*SS)],fill=SKY)
    return dn(outline(lay,1.6),TW,TH)
hs=halo_sparkle(True); st=stand(0); tp=sotm_topper()
sid="ct-accolade-student-of-the-month"
hs.save(os.path.join(OUT,"layers","halo-pips0-gem.png")); st.save(os.path.join(OUT,"layers","stand-pips0.png")); tp.save(os.path.join(OUT,"layers",f"{sid}-topper.png"))
AZ=Image.open(os.path.join(A3L,"seal-backing-actionzone.png")).convert("RGBA"); STAR=Image.open(os.path.join(A3L,"seal-mark-default-star.png")).convert("RGBA"); DEF=Image.open(os.path.join(A3L,"seal-backing-default.png")).convert("RGBA")
def comp(*ls):
    im=Image.new("RGBA",(TW,TH))
    for l in ls: im.alpha_composite(l)
    return im
full=comp(hs,st,tp,AZ,STAR); full.save(os.path.join(OUT,f"{sid}.png")); fdef=comp(hs,st,tp,DEF,STAR)
p=os.path.join(SP,"static.json"); M=json.load(open(p))
M["sprites"][sid]={"achievement":"ach.dojo.accolade.student-of-the-month","files":{"img":f"trophies/{sid}.png","halo":"layers/halo-pips0-gem.png","stand":"layers/stand-pips0.png","topper":f"layers/{sid}-topper.png",
  "sealBacking":"../badges-trophies-a3/sprites/trophies/certified-layers/seal-backing-<palette>.png","schoolMark":"../badges-trophies-a3/sprites/trophies/certified-layers/seal-mark-<school>.png"},
  "size":[TW,TH],"anchorPx":[52,156],"datePlate":[26,134,62,148],"dateTextColor":"#3a2a22","metal":"gold","pips":0,"gem":True,
  "note":"Student of the Month: own top piece (gold crescent moon + big star). img is baked with the Action Zone seal backing + the default star mark (until the AZ logo arrives). Use this instead of ct-accolade-template when the accolade slug is student-of-the-month; other accolades keep the shield template. Plate blank (game writes 'Earned {date}'). One trophy per accolade earned (count/stacking = DECIDE)."}
json.dump(M,open(p,"w"),indent=2)
# previews
F=lambda n:ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",n)
def wall(w,h):
    im=Image.new("RGBA",(w,h),(236,214,174,255)); d=ImageDraw.Draw(im)
    for x in range(0,w,80): d.line((x,0,x,h),fill=(222,198,156,255),width=2)
    return im
row=[("ct-dojo-promotion-blue" if False else "ct-promotion-blue","promotion"),("ct-stripes-20","stripes"),("ct-classes-100","classes"),("ct-weeks-50","weeks"),("ct-anniversary-5","anniversary"),("ct-signoffs-50","signoffs"),("ct-accolade-template","accolade (other)"),(sid,"Student of the Month")]
imgs=[]
for f,lab in row:
    im=full if f==sid else Image.open(os.path.join(OUT,f+".png")).convert("RGBA").copy()
    if f!=sid: im.alpha_composite(AZ); im.alpha_composite(STAR)
    imgs.append((im,lab))
W2=len(imgs)*112+20; wl=wall(W2,230); d=ImageDraw.Draw(wl); d.rectangle((10,190,W2-10,202),fill=(150,92,50,255),outline=INK,width=2)
for i,(im,lab) in enumerate(imgs):
    x=14+i*112; wl.alpha_composite(im,(x,190-im.getbbox()[3]+1)); d.text((x+52,215),lab,fill=(90,60,40),font=F(9),anchor="mm")
wl.save(os.path.join(PV,"review-5-sotm-vs-categories-1x.png")); wl.resize((W2*2,460),Image.LANCZOS).save(os.path.join(PV,"review-5-sotm-vs-categories-2x.png"))
ph=wall(len(imgs)*58+20,110)
for i,(im,_) in enumerate(imgs): ph.alpha_composite(im.resize((52,83),Image.LANCZOS),(12+i*58,12))
ph.save(os.path.join(PV,"review-6-sotm-phone-half-size.png")); ph.convert("L").convert("RGBA").save(os.path.join(PV,"greyscale-6-sotm-phone.png"))
cl=wall(3*230+20,360)
for i,im in enumerate((full,fdef,(lambda g:(g.putalpha(full.getchannel("A")),g)[1])(full.convert("L").convert("RGBA")))): cl.alpha_composite(im.resize((208,332),Image.NEAREST),(10+i*230,14))
cl.save(os.path.join(PV,"review-7-sotm-closeup-AZ-default-grey.png"))
print("ok")
