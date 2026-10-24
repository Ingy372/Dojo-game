#!/usr/bin/env python3
"""C7 check: every S6 achievement and S2 item slot is filled and within its character limit.
Run from the repo root: python3 drafts/content/tools/check-c7.py"""
import json, re, sys
C = "drafts/content/"
errs = []
BANNED = re.compile(r"\b(only|hurry|don'?t miss|streak|in a row|login|log in|days?|buy|shop|price|sell|salvage|hurt|injur\w*|blood)\b", re.I)
def chk(where, field, val, lim, required=True):
    if val is None or val == "":
        if required: errs.append(f"{where}: missing {field}")
        return
    if len(val) > lim: errs.append(f"{where}: {field} is {len(val)} > {lim}: {val!r}")
    if BANNED.search(val): errs.append(f"{where}: {field} uses a banned word: {val!r}")
B = ["white","yellow","orange","green","blue","red","red-black","brown","brown-black","black"]
# expected S6 ids
exp = [f"ach.dojo.promotion.{b}" for b in B[1:]]
exp += [f"ach.dojo.stripes.{n}" for n in (1,5,10,20)] + [f"ach.dojo.classes.{n}" for n in (10,25,50,100,250,500)]
exp += [f"ach.dojo.weeks.{n}" for n in (5,10,20,50,100)] + [f"ach.dojo.anniversary.{n}" for n in (1,2,3,5,10)]
exp += [f"ach.dojo.signoffs.{n}" for n in (1,10,25,50)] + [f"ach.dojo.practice.{n}" for n in (1,5,10,25,50)] + ["ach.dojo.accolade.{slug}"]
exp += [f"ach.bow.correct.{n}" for n in (5,10,20,50,100)] + [f"ach.tower.guardian.{b}" for b in B]
exp += [f"ach.tower.floors.{n}" for n in (1,10,50,100,250)] + [f"ach.tower.perfects.{n}" for n in (10,100,500,1000,5000)]
exp += [f"ach.tower.combo.{n}" for n in (10,25,50)] + ["ach.tower.allS"] + [f"ach.tower.elites.{n}" for n in (1,25,100)] + [f"ach.tower.challenge.{n}" for n in (1,10,50)]
exp += [f"ach.journal.entries.{n}" for n in (5,10,25)] + [f"ach.journal.master.{e}" for e in ("swarmer","shield","brute","floor-keeper","old-thumper","zippy-zoom","captain-clank")]
exp += [f"ach.home.placed.{n}" for n in (5,15,30)] + [f"ach.home.tidy.{n}" for n in (5,20,50)]
exp += ["ach.smarts.location.store","ach.smarts.location.{place}"] + [f"ach.smarts.stars.{n}" for n in (10,25,50)] + [f"ach.life.quests.{n}" for n in (1,5,10)]
A = json.load(open(C+"achievements/achievements.json"))["achievements"]
ids = [a["id"] for a in A]
if len(ids) != len(set(ids)): errs.append("duplicate achievement ids")
for m in set(exp) - set(ids): errs.append(f"missing achievement {m}")
for x in set(ids) - set(exp): errs.append(f"unexpected achievement {x}")
for a in A:
    w, codes = a["id"], set(a["reward"].split("+"))
    if not codes <= {"T","CT","GT","D","C","B"}: errs.append(f"{w}: bad reward code {a['reward']}")
    chk(w,"name",a.get("name"),24); chk(w,"how",a.get("how"),60); chk(w,"done",a.get("done"),60)
    chk(w,"title",a.get("title"),20,"T" in codes)
    if "title" in a and "T" not in codes: errs.append(f"{w}: title without T")
    needT = bool(codes & {"CT","GT","D","B","C"})
    chk(w,"trophyName",a.get("trophyName"),24,needT); chk(w,"trophyText",a.get("trophyText"),80,needT)
    if "CT" in codes and not a.get("trophyText","").endswith("Earned {date}"): errs.append(f"{w}: certified trophyText must end 'Earned {{date}}'")
# S2 gear
g = json.load(open(C+"loot/gear.json"))["items"]
gid = {i["id"] for i in g}
for b in B[1:]:
    for s in ("hands","gi"):
        for k in (1,2,3):
            if f"{b}-{s}-{k}" not in gid: errs.append(f"missing gear {b}-{s}-{k}")
    if f"{b}-charm-1" not in gid: errs.append(f"missing charm {b}")
if len(g) != 72: errs.append(f"gear count {len(g)} != 72 (9 white + 63 new)")
EFF = dict(zip(B[1:],["focusGain","blockCut","attackSpeed","staggerBonus","comboSpeed","lowHealthFocus","strikeCost","counterWindow","dashOnBlock"]))
for i in g:
    w = i["id"]
    if i.get("tier") not in B: errs.append(f"{w}: bad tier")
    chk(w,"name",i.get("name"),22); chk(w,"description",i.get("description"),80)
    if i["slot"] == "charm":
        if not re.search(r"\{(n|pct)\}", i.get("text","")): errs.append(f"{w}: charm text needs {{n}} or {{pct}}")
        if i["tier"] in EFF and i["effect"]["type"] != EFF[i["tier"]]: errs.append(f"{w}: effect should be {EFF[i['tier']]}")
m = json.load(open(C+"loot/materials.json"))["materials"]
if sorted(x["tier"] for x in m) != sorted(B): errs.append("materials: need exactly one per tier")
for x in m: chk(x["id"],"name",x["name"],16); chk(x["id"],"description",x["description"],80)
t = json.load(open(C+"loot/item-text.json"))
if [r["id"] for r in t["rarity"]] != ["common","uncommon","rare","epic","legendary"]: errs.append("rarity ids changed")
for r in t["rarity"]: chk("rarity."+r["id"],"display",r["display"],10)
for k in ("letGoConfirm","savedForWorkshop","lookPickerTitle","wearingLook"): chk("ui",k,t["ui"].get(k),40)
for x in t["legendary"]: chk(x["id"],"name",x["name"],22); chk(x["id"],"description",x["description"],80)
print(f"achievements {len(A)}, gear {len(g)}, materials {len(m)}, legendary {len(t['legendary'])}")
print("\n".join(errs) if errs else "ALL SLOTS FILLED AND WITHIN LIMITS")
sys.exit(1 if errs else 0)
