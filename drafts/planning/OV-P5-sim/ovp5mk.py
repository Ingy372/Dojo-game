import json,sys
# usage: ovp5mk.py out.json 'id:field=val,...;id:family=power;-id'
base=json.load(open('/tmp/ovp5-c13.json'))['insights']
cards=[json.loads(json.dumps(c)) for c in base]
for tok in filter(None,sys.argv[2].split(';')):
  if tok.startswith('-'): cards=[c for c in cards if c['id']!=tok[1:]]; continue
  cid,rest=tok.split(':',1)
  c=next(c for c in cards if c['id']==cid)
  for kv in rest.split(','):
    k,v=kv.split('=')
    if k=='family': c['family']=v
    else: c['effect'][k]=float(v)
json.dump({'insights':cards},open(sys.argv[1],'w'))
