"""Builds drafts/content/katas/*.json from /workspace/katas/*.md (school text copied exactly; only line breaks/extra spaces collapsed)."""
import json, re, sys, pathlib
SRC = pathlib.Path("/workspace/katas"); OUT = pathlib.Path(__file__).resolve().parent.parent / "katas"
def ws(s): return re.sub(r"\s+", " ", s).strip()
def parse(md):
    t = (SRC / md).read_text()
    steps, notes, finish = {}, {}, None
    body = re.split(r"\n(?=[ \t]*#\d+ )", t)
    for chunk in body[1:]:
        m = re.match(r"\s*#(\d+) (.*)", chunk, re.S); n = int(m.group(1)); txt = m.group(2)
        txt = txt.split("END FORM")[0]
        parts = re.split(r"\n\s*\n(?=\s*(?:\*\*R of|\*\*L of|Bring LF))", txt)
        steps[n] = ws(parts[0]).rstrip("-").strip()
        for p in parts[1:]:
            p = ws(p)
            if p.startswith("Bring LF"): finish = p.rstrip("-").strip()
            else: notes[n] = p
    if finish is None:
        m = re.search(r"(Bring LF[^\n]*)", steps[max(steps)])
        if m: steps[max(steps)] = ws(steps[max(steps)][:m.start()]); finish = ws(m.group(1)).rstrip("-").strip()
    for n in steps: steps[n] = steps[n].replace("cat stance (now facing forward, then", "cat stance (now facing forward), then")
    for n in notes: notes[n] = notes[n].replace("point-if-view", "point-of-view")
    return steps, notes, finish
K = {
 "basic-form-1": dict(md="basic-form-1.md", name="Basic Form 1", school="Basic Form One", form="rooted-form", belt="white-to-yellow",
  facing={1:["L"],2:["R"],3:["R"],4:["L"],5:["R"],6:["R"],7:["L"],8:["R"]}, q={}, jay={2:"Left-hand straight punch (Jay, Oct 24)."}, kiai=[3,6],
  moves={1:["pivot","block.downward","punch.straight"],2:["turn.big-special","block.downward","punch.straight"],3:["stance.cat","block.downward","punch.straight"],
   4:["turn.180","block.downward","punch.straight"],5:["turn.180","block.downward","punch.straight"],6:["stance.cat","block.downward","punch.straight"],
   7:["turn.180","block.downward","punch.straight"],8:["turn.180","block.downward","punch.straight"]}),
 "basic-form-2": dict(md="basic-form-2.md", name="Basic Form 2", school="Basic Form Two", form="flowing-form", belt="yellow-to-orange",
  facing={1:["L"],2:["R"],3:["R"],4:["L"],5:["R"],6:["R"],7:["L"],8:["R"]}, q={}, jay={3:"Same kick as reverse straight forward kick (Jay, Oct 24).",6:"Same kick as reverse straight forward kick (Jay, Oct 24).",4:"Correct as written: LF = left foot forward, RF = right foot in rear (Jay, Oct 24).",5:"Directions copy Basic Form 1 (Jay, Oct 24).",8:"Directions copy Basic Form 1 (Jay, Oct 24)."}, kiai=[3,6],
  moves={1:["pivot","block.downward","chamber","kick.reverse","punch.reverse","punch.straight"],
   2:["turn.180","block.downward","chamber","kick.reverse","punch.reverse","punch.straight"],
   3:["stance.cat","block.downward","chamber","catch","kick.reverse","punch.straight"],
   4:["turn.180","block.downward","chamber","kick.reverse","punch.reverse","punch.straight"],
   5:["turn.180","block.downward","chamber","kick.reverse","punch.reverse","punch.straight"],
   6:["stance.cat","block.downward","chamber","catch","kick.reverse","punch.straight"],
   7:["turn.180","block.downward","chamber","kick.reverse","punch.reverse","punch.straight"],
   8:["turn.180","block.downward","chamber","kick.reverse","punch.reverse","punch.straight"]}),
 "keon": dict(md="keon.md", name="Keon", school="Keon", form=None, belt="orange-to-green",
  facing={1:["L"],2:["R"],3:["R"],4:["R"],5:["L"],6:["F"],7:["L"],8:["R"],9:["B"]}, q={}, jay={2:"Left-hand straight punch (Jay, Oct 24).",4:"Same-side ear is correct (Jay, Oct 24).",5:"Same-side ear is correct (Jay, Oct 24)."}, kiai=[9],
  moves={1:["pivot","block.downward","punch.straight"],2:["turn.180","block.downward","punch.straight"],3:["stance.cat","stance.front","block.downward","punch.straight"],
   4:["block.reverse-inside","punch.reverse"],5:["turn.180","block.reverse-inside","punch.reverse"],6:["stance.cat","block.downward","punch.reverse"],
   7:["pivot","block.overhead","catch","kick.straight","punch.straight"],8:["turn.180","block.overhead","catch","kick.straight","punch.straight"],
   9:["pivot","stance.front","block.downward","punch.straight"]}),
 "david-and-goliath": dict(md="david-and-goliath.md", name="David and Goliath", school="David and Goliath", form=None, belt="green-to-blue",
  facing={1:["F"],2:["F"],3:["F"],4:["L"],5:["R"],6:["F"],7:["L"],8:["R"],9:["B"],10:["R"],11:["L"],12:["F"]}, q={}, jay={5:"Left-hand straight punch (Jay, Oct 24)."}, kiai=[3],
  moves={1:["stance.attention"],2:["block.double-knife-hand"],3:["strike.backfist","block.downward","punch.straight"],4:["pivot","block.downward","punch.straight"],
   5:["turn.big-special","block.downward","punch.straight"],6:["stance.cat","strike.backfist","punch.straight","punch.reverse"],7:["pivot","block.reverse-inside","punch.reverse"],
   8:["turn.180","block.reverse-inside","punch.reverse"],9:["pivot","strike.backfist","punch.straight","punch.reverse"],10:["pivot","block.overhead","catch","kick.front","punch.straight"],
   11:["turn.180","block.overhead","catch","kick.front","punch.straight"],12:["pivot","stance.attention","break.double-choke"]}),
}
MOVES = {"pivot":"Pivot","turn.180":"Half turn","turn.big-special":"Big special turn","stance.cat":"Cat stance","stance.front":"Front stance","stance.attention":"Attention",
 "block.downward":"Low block","block.reverse-inside":"Inside block","block.overhead":"High block","block.double-knife-hand":"Double knife-hand block",
 "punch.straight":"Straight punch","punch.reverse":"Reverse punch","strike.backfist":"Backfist","kick.reverse":"Reverse kick",
 "kick.straight":"Straight kick","kick.front":"Front kick","chamber":"Chamber","catch":"Catch","break.double-choke":"Choke break"}
OUT.mkdir(exist_ok=True)
for kid, k in K.items():
    steps, notes, finish = parse(k["md"])
    assert sorted(steps) == list(range(1, len(steps)+1)) == sorted(k["moves"]), kid
    out = {"id": kid, "name": k["name"], "schoolName": k["school"], "belt": k["belt"],
      "source": f"Toni Kennerson, school sheet ({k['school']}.docx via /workspace/katas/{k['md']})", "approvedBy": None, "form": k["form"],
      "senseiLine": "Practice your kata with your instructor.", "steps": []}
    for n in sorted(steps):
        qs = k["q"].get(n, [])
        assert not (qs and k["facing"].get(n)), (kid, n)
        s = {"n": n, "text": steps[n], "facing": k["facing"].get(n, []), "moves": k["moves"][n], "kiai": n in k["kiai"], "question": qs or None}
        for m in s["moves"]: assert m in MOVES, m
        if n in notes: s["schoolNote"] = notes[n]
        if n in k.get("jay", {}): s["jayNote"] = k["jay"][n]
        out["steps"].append(s)
    out["finish"] = finish
    if kid == "david-and-goliath" and not finish: out["finish"] = "Move to attention & bow out"; out["finishNote"] = "Not on the school sheet; Jay confirmed D&G ends with a bow (Oct 24)."
    (OUT / f"{kid}.json").write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
(OUT / "moves.json").write_text(json.dumps({"_note": "Kid-readable move names (wording is a guess; Jay/Learning Designer may change).", "moves": MOVES}, indent=2) + "\n")
print("ok")
