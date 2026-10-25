#!/usr/bin/env python3
"""Check drafted enemy files (C13-1+) against the content/enemies/*.json shape and the content word limits.
Usage: python3 drafts/content/tools/check-enemies.py [files...]  (default: every drafted enemy with a 'tier' field)"""
import json, re, sys, glob, os
CORE = ["id","name","notes","color","maxHealth","power","guard","radius","moveSpeedTilesPerSecond","sightRange","attack","parSeconds"]
ATTACK = ["name","strength","startRange","reach","areaRadius","telegraphTicks","recoverTicks"]
STATS = ["maxHealth","power","guard","radius","moveSpeedTilesPerSecond","sightRange","parSeconds"]
TIERS = {"white","yellow","orange","green","blue","red","red-black","brown","brown-black","black"}
LIMITS = {"insight":15,"name":3,"tell":12,"senseiLine":12,"description":20,"tip":15,"lore":30}
BANNED = re.compile(r"\b(kill|killed|dead|die|dies|blood|gore|destroy|destroyed|evil|hate|stupid)\b", re.I)
def words(s): return len(s.split())
def num_or_todo(v): return v == "TODO" or (isinstance(v,(int,float)) and not isinstance(v,bool))
def check(path):
    e=[]; d=json.load(open(path)); f=os.path.basename(path)
    for k in CORE:
        if k not in d: e.append(f"missing {k}")
    if d.get("id")+".json"!=f: e.append("id must match the file name")
    if not re.fullmatch(r"#[0-9a-f]{6}", d.get("color","")): e.append("color must be #rrggbb")
    for k in STATS:
        if k in d and not num_or_todo(d[k]): e.append(f"{k} must be a number or 'TODO'")
    a=d.get("attack",{})
    for k in ATTACK:
        if k not in a: e.append(f"attack.{k} missing")
        elif k!="name" and not num_or_todo(a[k]): e.append(f"attack.{k} must be a number or 'TODO'")
    if isinstance(a.get("telegraphTicks"),int) and a["telegraphTicks"]<10: e.append("wind-up must be >= 10 ticks")
    t=d.get("tier")
    if t not in TIERS: e.append("bad tier")
    if not d.get("band"): e.append("missing band")
    texts={"name":d.get("name",""),"tell":d.get("tell",""),"senseiLine":d.get("senseiLine",""),"description":d.get("description",""),"tip":d.get("bestiary",{}).get("tip","")}
    if "insight" in d.get("bestiary",{}): texts["insight"]=d["bestiary"]["insight"]
    lore=d.get("bestiary",{}).get("lore",{})
    if t not in lore: e.append("bestiary.lore needs an entry for its own tier")
    for lt,v in lore.items(): texts[f"lore.{lt}"]=v
    for k,v in texts.items():
        if not v: e.append(f"empty {k}"); continue
        lim=LIMITS["lore" if k.startswith("lore") else k]
        if words(v)>lim: e.append(f"{k} has {words(v)} words (max {lim})")
        if BANNED.search(v): e.append(f"{k} uses a word not for ages 6+: {BANNED.search(v).group()}")
    if not re.search(r"\b(calm|calmed|free|freed|wake|home|glow|rest|rests)\b", " ".join(lore.values()), re.I):
        e.append("lore should say how it's calmed or freed")
    dz=d.get("dashOnlyAttack")
    if dz is not None:
        if dz.get("counterable") is not False or dz.get("answer")!="dash": e.append("dashOnlyAttack must be counterable:false, answer:'dash'")
        if dz.get("shape") not in ("lane","arc","ring-with-gap","zigzag"): e.append("dashOnlyAttack.shape must be lane, arc, ring-with-gap or zigzag (never colour alone)")
        tk=dz.get("telegraphTicks"); lo=26 if t in ("white","yellow","orange") else 20
        if not isinstance(tk,int) or not (lo<=tk<=(30 if lo==26 else 999)): e.append("dashOnlyAttack.telegraphTicks must be 26-30 in tiers 1-3" if lo==26 else "dashOnlyAttack.telegraphTicks must be >= 20 from tier 4")
        if t in ("white","yellow","orange") and dz.get("noOverlapWithRedCircle") is not True: e.append("tiers 1-3: noOverlapWithRedCircle must be true")
        if dz.get("noOverlapWithRedCircle") is False:
            if not isinstance(dz.get("minOffsetFromRedCircleTicks"),int) or dz["minOffsetFromRedCircleTicks"]<10: e.append("overlap needs minOffsetFromRedCircleTicks >= 10")
            if dz.get("overlapOnGuided") is not False: e.append("overlapOnGuided must be false")
            if dz.get("overlapFromFloor")!=3: e.append("overlap needs overlapFromFloor: 3 (floors 1-2 never overlap)")
        fu=dz.get("followUp")
        if fu and (fu.get("neverSimultaneous") is not True or not isinstance(fu.get("telegraphTicks"),int) or fu["telegraphTicks"]<lo): e.append("followUp must be neverSimultaneous with a fair wind-up")
        if "DASH" not in d.get("senseiLine","")+d["bestiary"].get("tip",""): e.append("dash-only enemies must say DASH in the line or tip")
    z=d.get("zone")
    if z and z.get("effect")=="slow":
        if z.get("damage")!=0 or not (0<z.get("slowPercent",99)<=30) or not (0<z.get("slowPercentGuided",99)<=z["slowPercent"]/2) or z.get("endsOnStepOut") is not True: e.append("slow zone: 0 damage, slowPercent <= 30, Guided <= half, endsOnStepOut true")
    if d.get("id")=="copycat-shade" and (d.get("minFloor")!=3 or d.get("band")!="F3-4"): e.append("copycat-shade appears only from floor 3 (minFloor 3, band F3-4)")
    if isinstance(d.get("minFloor"),int) and d["band"].startswith("F1") and d["minFloor"]>=3: e.append("band contradicts minFloor")
    fu2=(d.get("dashOnlyAttack") or {}).get("followUp")
    if fu2 and (not isinstance(fu2.get("gapAfterFirstTicks"),int) or fu2["gapAfterFirstTicks"]<20): e.append("followUp needs gapAfterFirstTicks >= 20")
    if "push" in d and "ride" in d["bestiary"].get("tip","").lower(): e.append("push tip stays basic; 'ride the push' belongs in insight")
    if "push" in d and "insight" not in d.get("bestiary",{}): e.append("pushers need an advanced bestiary.insight hint")
    if "push" in d and (d["push"].get("damage")!=0 or d["push"].get("intoHazard") is not False): e.append("push must do 0 damage and never push into a hazard")
    for vid,v in d.get("variants",{}).items():
        for k in CORE[2:]:
            if k not in v: e.append(f"variants.{vid} missing {k}")
        for k in ATTACK:
            if k not in v.get("attack",{}): e.append(f"variants.{vid}.attack.{k} missing")
        for k,s_ in [("senseiLine",v.get("senseiLine","")),("tell",v.get("tell","")),("tip",v.get("bestiary",{}).get("tip",""))]+[("lore",x) for x in v.get("bestiary",{}).get("lore",{}).values()]:
            if not s_ or words(s_)>LIMITS[k] or BANNED.search(s_): e.append(f"variants.{vid}.{k} empty, too long or unsuitable")
    if "split" in d and d["split"].get("into") not in d.get("variants",{}): e.append("split.into must name a variant in this file")
    return e
files=sys.argv[1:] or [p for p in sorted(glob.glob("drafts/content/enemies/*.json")) if "tier" in json.load(open(p))]
bad=0
for p in files:
    for m in check(p): print(f"{p}: {m}"); bad+=1
print(f"{len(files)} files, {bad} problems"); sys.exit(1 if bad else 0)
