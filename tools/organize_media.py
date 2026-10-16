#!/usr/bin/env python3
"""Safe media organization for ACSoL. plan/apply/cleanup; apply NEVER deletes old files."""
import argparse
from pathlib import Path
import hashlib
import json
import re
import shutil
import unicodedata
from urllib.parse import unquote, urlsplit, quote

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT/'.github/media-organizer-manifest.json'
CATEGORY = dict(students='student',research='research',gallery='gallery',banners='banner',
                news='news',equipment='equipment',professor='professor',alumni='alumni',home='home',site='home')
EXT = {'.jpg','.jpeg','.png','.webp','.avif','.gif','.bmp','.svg','.tif','.tiff'}
REPLACEMENT = re.compile(r'[\\/<>:"|?*\x00-\x1f\x7f]')

def clean(s,default='사진'):
    s = unicodedata.normalize('NFC',str(s or '')).strip()
    s=REPLACEMENT.sub('_',s)
    s=re.sub(r'\s+','_',s)
    return re.sub(r'_+','_',s).strip(' ._')[:65] or default

def media_path(raw):
    if not isinstance(raw,str):return None
    raw=raw.strip()
    if raw.startswith('https://'):
        u=urlsplit(raw)
        if u.netloc.lower() not in ('nawit-del.github.io','www.nawit-del.github.io'):return None
        raw=u.path
    raw=unquote(raw).lstrip('/')
    if not raw.startswith('media/') or '?' in raw or '#' in raw or '\\' in raw:return None
    p=Path(raw)
    if '..' in p.parts or p.suffix.lower() not in EXT:return None
    return p

def file_digest(path):
    h=hashlib.sha256()
    with path.open('rb') as fd:
        for chunk in iter(lambda:fd.read(1<<20),b''):h.update(chunk)
    return h.hexdigest()

def entries(doc):
    if isinstance(doc,list):return doc
    if isinstance(doc,dict):
        for name in ('items','students','photos'):
            if isinstance(doc.get(name),list):return doc[name]
        return [doc]
    return []

def label(row,idx,cat):
    name=row.get('name') or row.get('title') or row.get('professorName') or row.get('id') or row.get('date') or row.get('heroImageCaption') or f'{cat}_{idx+1}'
    if cat in ('student','alumni'):
        match=re.match(r'([가-힣]{1,2}\s?[가-힣]{1,3})(?=\s|\(|$)',str(name).strip())
        if match:name=match[1].replace(' ','')
    return clean(name)

def tag(cat,field,in_section=False):
    if cat=='student' and field=='photo':return '증명사진'
    if cat=='student' and field=='casualPhoto':return '일상사진'
    if cat=='research':
        return {'summaryImage':'요약사진','detailImage':'세부대표사진','image':'상세사진' if in_section else '대표사진'}.get(field,'연구사진')
    if cat=='professor':return '교수사진'
    if cat=='alumni':return '졸업사진'
    if cat=='gallery':return '갤러리사진'
    if cat=='banner':return '배너사진'
    if cat=='equipment':return '장비사진'
    if cat=='news':return '뉴스사진'
    if cat=='home':return '메인사진' if not in_section else '슬라이드사진'
    return '사진'

def references(obj,cat,main,index=0,in_section=False):
    if not isinstance(obj,dict):return
    for k,v in obj.items():
        if isinstance(v,str):
            p=media_path(v)
            if p:
                base=main
                if in_section and cat=='research' and k=='image':
                    base += '_'+clean(obj.get('heading') or str(index+1))
                if in_section and cat=='home' and k=='image':
                    base += '_'+str(index+1)
                yield obj,k,p,clean(base+'_'+tag(cat,k,in_section))
        elif isinstance(v,list):
            for i,sub in enumerate(v):
                if isinstance(sub,dict):
                    yield from references(sub,cat,main,i,k in ('detailSections','heroSlides','sections'))
        elif isinstance(v,dict):
            yield from references(v,cat,main,index,in_section)

def unique_target(desired,src,assigned):
    if src==desired:return src
    # Already normalized collision suffix? Keep its stable name on subsequent runs.
    if (src.parent==desired.parent and src.suffix.lower()==desired.suffix.lower()
            and src.stem.startswith(desired.stem+'__')):
        return src
    hashsrc=file_digest(ROOT/src)
    def free(p):
        if p in assigned:return assigned[p]==hashsrc
        if (ROOT/p).exists():return file_digest(ROOT/p)==hashsrc
        return True
    if free(desired):return desired
    fingerprint=hashlib.sha1(str(src).encode()).hexdigest()[:8]
    for i in range(1,100):
        tail='__'+fingerprint+(('_'+str(i)) if i>1 else '')
        dst=desired.with_name(desired.stem+tail+desired.suffix)
        if free(dst):return dst
    raise RuntimeError('Filename collision exceeded: '+str(desired))

def proposed():
    acts=[];docs={};assigned={}
    for jf in sorted((ROOT/'data').rglob('*.json')):
        raw=jf.read_text(encoding='utf-8-sig')
        if not raw.strip():
            print('WARNING: empty JSON skipped:',jf.relative_to(ROOT));continue
        try:doc=json.loads(raw)
        except json.JSONDecodeError as exc:raise RuntimeError(f'Invalid JSON {jf}: {exc}') from exc
        cat=CATEGORY.get(jf.stem,'other')
        for i,record in enumerate(entries(doc)):
            if not isinstance(record,dict):continue
            person=label(record,i,cat)
            for owner,key,src,basename in references(record,cat,person):
                if not (ROOT/src).is_file():
                    print('WARNING: image missing, no changes:',src);continue
                dst=unique_target(Path('media')/cat/(basename+src.suffix.lower()),src,assigned)
                assigned[dst]=file_digest(ROOT/src)
                if dst!=src:acts.append((jf,owner,key,src,dst))
        docs[jf]=doc
    return acts,docs

def manifest_add(acts):
    MANIFEST.parent.mkdir(exist_ok=True)
    old={'copied':[],'originals':[]}
    if MANIFEST.exists():old=json.loads(MANIFEST.read_text(encoding='utf-8'))
    pairs={tuple(x) for x in old.get('copied',[])}
    pairs.update((str(src),str(dst)) for _,_,_,src,dst in acts)
    old['copied']=[list(x) for x in sorted(pairs)]
    old['originals']=sorted(set(old.get('originals',[])) | {str(a[3]) for a in acts})
    MANIFEST.write_text(json.dumps(old,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def cleanup():
    if not MANIFEST.exists():print('Nothing to clean');return
    data=json.loads(MANIFEST.read_text(encoding='utf-8'))
    # Fail-safe: never delete files referenced anywhere in the current website sources.
    texts=[]
    for p in ROOT.rglob('*'):
        if p.is_file() and p!=MANIFEST and '.git' not in p.parts and p.suffix.lower() in {'.html','.css','.js','.json','.yml','.yaml','.md'}:
            texts.append(p.read_text(encoding='utf-8',errors='replace'))
    body='\n'.join(texts)
    remaining=[];removed=0
    for item in data.get('originals',[]):
        p=ROOT/item
        encoded='/'.join(quote(part) for part in Path(item).parts)
        if not item.startswith('media/') or '..' in p.parts or item in body or encoded in body:
            remaining.append(item);continue
        if p.exists():p.unlink();removed+=1;print('Cleaned:',item)
    data['originals']=remaining
    MANIFEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Cleaned files:',removed,'retained:',len(remaining))

def main(mode):
    if mode=='cleanup':cleanup();return
    acts,docs=proposed()
    print(f'[{mode}] {len(acts)} images to organize')
    for jf,_,key,src,dst in acts[:100]:print(jf.relative_to(ROOT),key,src,'->',dst)
    if mode=='plan':return
    # Stage copies first, then atomically update individual JSON files.
    changed=set()
    for jf,owner,key,src,dst in acts:
        target=ROOT/dst
        target.parent.mkdir(parents=True,exist_ok=True)
        if not target.exists():shutil.copy2(ROOT/src,target)
        if file_digest(ROOT/src)!=file_digest(target):raise RuntimeError('Hash mismatch for '+str(dst))
        owner[key]='/'+dst.as_posix()
        changed.add(jf)
    for jf in changed:jf.write_text(json.dumps(docs[jf],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if acts:manifest_add(acts)
    print('JSON files changed:',len(changed),'Original files kept for compatibility.')

if __name__=='__main__':
    arg=argparse.ArgumentParser();arg.add_argument('--mode',choices=['plan','apply','cleanup'],default='plan')
    main(arg.parse_args().mode)
