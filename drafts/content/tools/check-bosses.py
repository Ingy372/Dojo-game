#!/usr/bin/env python3
"""Checks drafts/content/bosses/*.json (C13-5+): the content/enemies/floor-keeper.json shape plus phases,
the dash-only stripe rules, line word limits, ages-6+ wording, and that faith text stays out (faithOverlayKey only)."""
import json, re, sys, glob, pathlib
R = pathlib.Path(__file__).resolve().parents[3]
FK = json.loads((R/"content/enemies/floor-keeper.json").read_text())
CORE = [k for k in FK if k not in ("summon",)]
ATTACK = list(FK["attacks"][0].keys())
TIERS = ["white","yellow","orange","green","blue","red","red-black","brown","brown-black","black"]
EARLY = TIERS[:3]
LORE = {t["guardian"]["id"]: t["guardian"] for t in json.loads((R/"drafts/content/lore/guardians-and-relics.json").read_text())["tiers"]}
BANNED = re.compile(r"\b(kill|killed|dead|die|dies|blood|gore|destroy|destroyed|evil|hate|stupid)\b", re.I)
FAITH = re.compile(r"\b(God|Jesus|Lord|Christ|Bible|Scripture|verse|John|Romans|Psalm|Samuel)\b|\d+:\d+")
def num_or_todo(v): return v == "TODO" or (isinstance(v,(int,float)) and not isinstance(v,bool))
def words(s): return len(s.split())
def check(p):
    e=[]; d=json.load(open(p)); f=pathlib.Path(p).name
    for k in CORE + ["tier","band","signature","phases","lines","description","bestiary","faithOverlayKey","guardian"]:
        if k not in d: e.append(f"missing {k}")
    if d.get("id")+".json"!=f: e.append("id must match the file name")
    if d.get("boss") is not True or d.get("guardian") is not True: e.append("boss and guardian must be true")
    if d.get("tier") not in TIERS: e.append("bad tier")
    if d.get("band")!="F5": e.append("Guardians live on floor 5 (band F5)")
    for k in ("maxHealth","power","guard","radius","moveSpeedTilesPerSecond","sightRange","parSeconds"):
        if not num_or_todo(d.get(k)): e.append(f"{k} must be a number or 'TODO'")
    names={}
    for a in d.get("attacks",[]):
        names[a.get("name")]=a
        for k in ATTACK:
            if k not in a: e.append(f"attack {a.get('name')}: missing {k}")
            elif k!="name" and not num_or_todo(a[k]): e.append(f"attack {a['name']}: {k} must be a number or 'TODO'")
        tk=a.get("telegraphTicks")
        if isinstance(tk,int) and tk<10: e.append(f"attack {a['name']}: wind-up >= 10")
        if a.get("dashOnly"):
            early=d.get("tier") in EARLY; lo=26 if early else 20
            if a.get("counterable") is not False or a.get("answer")!="dash": e.append(f"{a['name']}: counterable false, answer dash")
            if a.get("shape") not in ("lane","arc","ring-with-gap","zigzag"): e.append(f"{a['name']}: needs a shape cue")
            if not isinstance(tk,int) or tk<lo or (early and tk>30): e.append(f"{a['name']}: wind-up must be " + ("26-30 in tiers 1-3" if early else ">= 20"))
            if a.get("overlapOnGuided") is not False: e.append(f"{a['name']}: overlapOnGuided must be false")
            if early and a.get("noOverlapWithRedCircle") is not True: e.append(f"{a['name']}: tiers 1-3 never overlap")
            if a.get("noOverlapWithRedCircle") is False and (a.get("overlapFromFloor")!=3 or a.get("minOffsetFromRedCircleTicks",0)<10): e.append(f"{a['name']}: overlap only from floor 3, offset >= 10")
            fu=a.get("followUp")
            if fu and (fu.get("neverSimultaneous") is not True or fu.get("gapAfterFirstTicks",0)<20 or fu.get("telegraphTicks",0)<lo): e.append(f"{a['name']}: followUp needs neverSimultaneous, gap >= 20, fair wind-up")
        z=a.get("zone")
        if z and (z.get("damage")!=0 or z.get("slowPercent",99)>30 or z.get("slowPercentGuided",99)>z.get("slowPercent",0)/2 or z.get("endsOnStepOut") is not True): e.append(f"{a['name']}: slow zone rules")
    if not any(a.get("dashOnly") for a in d.get("attacks",[])): e.append("needs at least one dash-only attack")
    ph=d.get("phases",[])
    if not 2<=len(ph)<=3: e.append("needs 2-3 phases")
    if ph and ph[0].get("atHealthFraction")!=1.0: e.append("first phase starts at 1.0")
    if [x.get("atHealthFraction") for x in ph]!=sorted([x.get("atHealthFraction") for x in ph],reverse=True): e.append("phases must go down in health")
    texts={}
    for x in ph:
        for k in ("tell","counterplay","senseiLine"):
            if not x.get(k): e.append(f"phase {x.get('id')}: missing {k}")
            else: texts[f"phase {x['id']} {k}"]=(x[k],12 if k=="senseiLine" else 15)
        for n in x.get("attacks",[]):
            if n not in names: e.append(f"phase {x.get('id')}: unknown attack {n}")
    if not any(a.get("dashOnly") for x in ph for a in [names.get(n,{}) for n in x.get("attacks",[])]): e.append("no phase uses the dash-only attack")
    L=d.get("lines",{}); g=LORE.get(d.get("id"))
    if not g: e.append("not an approved lore Guardian")
    else:
        if d.get("name")!=g["name"]: e.append("name must match the lore")
        if L.get("freed")!=g["freed"] or L.get("senseiAfter")!=g["senseiAfter"]: e.append("freed and senseiAfter must be copied from the lore")
    texts["intro"]=(L.get("intro",""),12); texts["description"]=(d.get("description",""),25)
    texts["tip"]=(d.get("bestiary",{}).get("tip",""),15)
    lore=d.get("bestiary",{}).get("lore",{})
    if d.get("tier") not in lore: e.append("lore needs its own tier")
    for t,v in lore.items():
        texts[f"lore {t}"]=(v,30)
        if not re.search(r"\b(free|freed|calm|calmed|home)\b",v,re.I): e.append("lore should say it's freed or calmed")
    for k,(v,lim) in texts.items():
        if not v: e.append(f"empty {k}"); continue
        if words(v)>lim: e.append(f"{k}: {words(v)} words (max {lim})")
        if BANNED.search(v): e.append(f"{k}: not for ages 6+: {BANNED.search(v).group()}")
        if FAITH.search(v): e.append(f"{k}: faith text belongs in the overlay, not here")
    if d.get("faithOverlayKey")!=d.get("id"): e.append("faithOverlayKey must equal the id")
    if "summon" in d and d["summon"].get("enemy") and not (R/f"drafts/content/enemies/{d['summon']['enemy']}.json").exists() and not (R/f"content/enemies/{d['summon']['enemy']}.json").exists(): e.append("summon names an unknown enemy")
    return e
files=sys.argv[1:] or sorted(glob.glob(str(R/"drafts/content/bosses/*.json")))
bad=0
for p in files:
    for m in check(p): print(f"{p}: {m}"); bad+=1
print(f"{len(files)} boss files, {bad} problems"); sys.exit(1 if bad else 0)
