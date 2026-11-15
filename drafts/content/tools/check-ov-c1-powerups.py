#!/usr/bin/env python3
"""OV-C1 check: 4 Power-ups named, ids match the plan, kid text <= 8 words, no numbers or pressure words, no name clashes."""
import json, re, sys
ROOT = __file__.rsplit('/drafts/', 1)[0]
plan = json.load(open(f'{ROOT}/drafts/planning/R-POWERUPS-15-data.json'))['insights']
mine = json.load(open(f'{ROOT}/drafts/content/insights/OV-C1-powerups.json'))['insights']
live = json.load(open(f'{ROOT}/content/insights/insights.json'))
live = live if isinstance(live, list) else live['insights']
bad = []
if sorted(i['id'] for i in plan) != sorted(i['id'] for i in mine): bad.append('ids differ from plan')
banned = re.compile(r'\d|%|\b(perfect|hurry|now|must|last chance|don\'t miss|only|before it|streak)\b', re.I)
names = [i['name'].lower() for i in live]
for i in mine:
    for f in ('name', 'text'):
        if banned.search(i[f]): bad.append(f"{i['id']} {f}: banned word or number")
    if len(i['text'].split()) > 8: bad.append(f"{i['id']} text over 8 words")
    if len(i['name'].split()) > 3: bad.append(f"{i['id']} name too long")
    if i['name'].lower() in names: bad.append(f"{i['id']} name clashes with live")
if len({i['name'] for i in mine}) != len(mine): bad.append('duplicate names')
print('\n'.join(bad) or 'OK: 4 Power-ups pass')
sys.exit(1 if bad else 0)
