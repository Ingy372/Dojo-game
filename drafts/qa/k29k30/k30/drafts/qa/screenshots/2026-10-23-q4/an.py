import json,collections
D=json.load(open('raw.json'))
print("variant diff bot win% twistRooms/run deaths: none/lantern/slip/bell  deathrate-per-room-entered none/lantern/slip/bell  bells")
for c in D:
    rs=c['runs'];w=sum(r['won'] for r in rs)/len(rs)*100
    ent=collections.Counter();dead=collections.Counter()
    for r in rs:
        for rm in r['rooms']:
            k=rm['twist'] or 'none'
            ent[k]+=1
            if rm['died']: dead[k]+=1
    ks=['none','lantern-dark','slippery-floor','bell-room']
    tw=sum(ent[k] for k in ks[1:])/len(rs)
    print(c['variant'],c['d'],c['bot'],f"{w:.1f}",f"{tw:.2f}","/".join(str(dead[k]) for k in ks),"/".join(f"{100*dead[k]/ent[k]:.1f}" if ent[k] else '-' for k in ks), "slipEntered",ent['slippery-floor'])
