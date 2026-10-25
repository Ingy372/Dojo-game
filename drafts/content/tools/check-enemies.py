#!/usr/bin/env python3
"""Check drafted enemy files (C13-1+) against the content/enemies/*.json shape and the content word limits.
Usage: python3 drafts/content/tools/check-enemies.py [files...]  (default: every drafted enemy with a 'tier' field)"""
import json, re, sys, glob, os
CORE = ["id","name","notes","color","maxHealth","power","guard","radius","moveSpeedTilesPerSecond","sightRange","attack","parSeconds"]
ATTACK = ["name","strength","startRange","reach","areaRadius","telegraphTicks","recoverTicks"]
STATS = ["maxHealth","power","guard","radius","moveSpeedTilesPerSecond","sightRange","parSeconds"]
TIERS = {"white","yellow","orange","green","blue","purple","red","brown","redblack","black"}
LIMITS = {"name":3,"tell":12,"senseiLine":12,"description":20,"tip":15,"lore":30}
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
        if dz.get("shape") not in ("lane","arc","ring-with-gap"): e.append("dashOnlyAttack.shape must be lane, arc or ring-with-gap (never colour alone)")
        tk=dz.get("telegraphTicks"); lo=26 if t in ("white","yellow","orange") else 20
        if not isinstance(tk,int) or not (lo<=tk<=(30 if lo==26 else 999)): e.append(f"dashOnlyAttack.telegraphTicks must be {lo}-30 in tiers 1-3 (>=20 later)")
        if t in ("white","yellow","orange") and dz.get("noOverlapWithRedCircle") is not True: e.append("tiers 1-3: noOverlapWithRedCircle must be true")
        if "DASH" not in d.get("senseiLine","")+d["bestiary"].get("tip",""): e.append("dash-only enemies must say DASH in the line or tip")
    return e
files=sys.argv[1:] or [p for p in sorted(glob.glob("drafts/content/enemies/*.json")) if "tier" in json.load(open(p))]
bad=0
for p in files:
    for m in check(p): print(f"{p}: {m}"); bad+=1
print(f"{len(files)} files, {bad} problems"); sys.exit(1 if bad else 0)
