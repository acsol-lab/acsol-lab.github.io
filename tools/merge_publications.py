#!/usr/bin/env python3
"""One-time safe migration of ACSoL v11 imports into the single publications.json.
Preserves existing CMS edits, keeping imported English titles when matching translated legacy titles.
Usage: python tools/merge_publications.py [--check]
"""
import argparse
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
DATA=ROOT/'data'

def read_list(path):
    if not path.exists():return []
    value=json.loads(path.read_text(encoding='utf-8-sig'))
    if not isinstance(value,list):raise ValueError(f'{path}: expected JSON list')
    if any(not isinstance(x,dict) for x in value):raise ValueError(f'{path}: all items must be objects')
    return value

def canonical(item):
    doi=str(item.get('doi') or '').strip().lower()
    doi=re.sub(r'^https?://(?:dx\.)?doi\.org/', '',doi).strip()
    if doi:return 'doi:'+doi
    title=str(item.get('title') or '').lower()
    title=''.join(c for c in title if c.isalnum())
    return 'title:'+title if title else None

def combine(saved,imported):
    # Start with Wix originals; locally edited CMS records may override those fields
    result=[];positions={}
    for item in imported:
        key=canonical(item)
        if key and key in positions:continue
        if key:positions[key]=len(result)
        result.append(dict(item))
    for item in saved:
        key=canonical(item)
        if key and key in positions:
            idx=positions[key]
            previous=result[idx]
            combined={**previous,**{k:v for k,v in item.items() if v not in ('',None)}}
            # Older v1 entries used translated Korean titles; preserve imported English original.
            old_title=str(item.get('title') or '')
            new_title=str(previous.get('title') or '')
            if re.search('[가-힣]',old_title) and new_title and not re.search('[가-힣]',new_title):
                combined['title']=new_title
                if str(item.get('authors') or '').count('·') or re.search('[가-힣]',str(item.get('authors') or '')):
                    combined['authors']=previous.get('authors','')
            result[idx]=combined
        else:
            if key:positions[key]=len(result)
            result.append(dict(item))
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args()
    pub=DATA/'publications.json';old=DATA/'publications-import.json'
    saved=read_list(pub);imported=read_list(old)
    if not imported:
        print(f'No pending imported publications; {len(saved)} already in Publications CMS.')
        return
    combined=combine(saved,imported)
    print(f'Merge: saved={len(saved)}, imported={len(imported)}, consolidated={len(combined)}')
    if args.check:return
    # Make a local JSON backup; do not commit it (public repo privacy and file noise).
    backup=ROOT.parent/(ROOT.name+'-publications-before-merge.backup.json')
    if not backup.exists():backup.write_text(json.dumps(saved,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    pub.write_text(json.dumps(combined,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    # Preserve the import path as an empty JSON array for older client versions.
    # Git history still contains the full import; don't delete that history.
    old.write_text('[]\n',encoding='utf-8')
    print('OK: Publications now has one editable source. Import file cleared to [].')

if __name__=='__main__':main()
