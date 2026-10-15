#!/usr/bin/env python3
"""Update Pages CMS student team choices from the live Research list."""
import json,yaml,pathlib,sys
p=pathlib.Path(__file__).resolve().parents[1]
research=json.loads((p/'data/research.json').read_text(encoding='utf8'))
areas=list(dict.fromkeys(row.get('title','').strip() for row in research if isinstance(row,dict) and row.get('title','').strip()))
if not areas:raise SystemExit('Cannot sync empty Research list')
y=p/'.pages.yml';cfg=yaml.safe_load(y.read_text(encoding='utf8'))
def walk(xs):
  for x in xs:
    yield x
    yield from walk(x.get('items',[]))
for entry in walk(cfg['content']):
  if entry.get('name')=='students':
    stu=next(f for f in entry['fields'] if f['name']=='students')
    team=next(f for f in stu['fields'] if f['name']=='team')
    team['options']={'values':[{'name':area,'label':area} for area in areas]}
    y.write_text(yaml.safe_dump(cfg,allow_unicode=True,sort_keys=False,width=130),encoding='utf8')
    print('Synced:',', '.join(areas));sys.exit(0)
raise SystemExit('Students CMS schema not found')
