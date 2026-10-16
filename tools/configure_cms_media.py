#!/usr/bin/env python3
"""Update only Pages CMS image-field folders without replacing user settings.
Requires ruamel.yaml (preserves ordering, comments, anchors and unknown settings).
"""
from pathlib import Path
from ruamel.yaml import YAML

CATEGORIES = {
    'students': 'student', 'research': 'research', 'gallery': 'gallery',
    'banners': 'banner', 'news': 'news', 'equipment': 'equipment',
    'professor': 'professor', 'alumni': 'alumni',
    'home': 'home', 'site': 'home',
}
CSS_LINE = '  <link rel="stylesheet" href="research-detail-white.css?v=16.1-media-1">\n'

def recurse_fields(fields, category):
    changed = 0
    for field in fields or []:
        if not isinstance(field, dict):
            continue
        if field.get('type') == 'image':
            if field.get('options') is None:
                field['options'] = {}
            opts = field['options']
            # Important: options.path is relative to the root media.input directory.
            if opts.get('path') != category:
                opts['path'] = category; changed += 1
            if opts.get('rename') is not False:
                opts['rename'] = False; changed += 1
        if field.get('fields'):
            changed += recurse_fields(field['fields'], category)
    return changed

def recurse_content(nodes):
    count=0
    for group in nodes or []:
        if group.get('type') == 'group':
            count += recurse_content(group.get('items', []))
        else:
            key = group.get('name')
            cat = CATEGORIES.get(key)
            if not cat:
                # Fallback to a known data path, regardless of CMS menu name.
                cat = CATEGORIES.get(Path(group.get('path','')).stem)
            if cat:
                count += recurse_fields(group.get('fields'),cat)
    return count

def main():
    path=Path('.pages.yml')
    if not path.exists(): raise SystemExit('ERROR: .pages.yml not found')
    yaml=YAML(); yaml.preserve_quotes=True; yaml.width=10000
    with path.open(encoding='utf-8') as f: config=yaml.load(f)
    if not isinstance(config,dict): raise SystemExit('ERROR: unexpected Pages CMS configuration')
    media=config.get('media')
    if isinstance(media,str) and media.strip()!='media':
        raise SystemExit('ERROR: media root is not media/. Check settings manually.')
    if isinstance(media,dict) and media.get('input')!='media':
        raise SystemExit('ERROR: media.input is not media/. Check settings manually.')
    if isinstance(media,list):
        raise SystemExit('ERROR: multiple CMS media sources found. Adjust field options manually.')
    changed=recurse_content(config.get('content'))
    if changed:
        with path.open('w',encoding='utf-8') as f: yaml.dump(config,f)
    print(f'CMS image field updates: {changed}')
    html=Path('research-detail.html')
    if html.exists():
        s=html.read_text(encoding='utf-8')
        if 'research-detail-white.css' not in s:
            if '</head>' not in s:raise SystemExit('ERROR: research-detail.html missing </head>')
            html.write_text(s.replace('</head>',CSS_LINE+'</head>',1),encoding='utf-8')
            print('Added white research image CSS link')
        else: print('Research CSS link already present')
    else: print('WARNING: research-detail.html not found')

if __name__=='__main__':main()
