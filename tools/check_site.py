#!/usr/bin/env python3
"""Check the static site with Python's standard library only.
Run from any directory: python tools/check_site.py
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import sys


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.paths = []
        self.h1_count = 0
        self.current = 0

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'h1':
            self.h1_count += 1
        if tag == 'a' and attrs.get('aria-current') == 'page':
            self.current += 1
        key = 'src' if tag in ('img', 'script') else 'href' if tag in ('a', 'link') else None
        if key and attrs.get(key):
            self.paths.append(attrs[key])


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    errors = []
    pages = ['index', 'research', 'people', 'publications', 'news', 'gallery', 'contact']
    for name in pages:
        file = root / (name + '.html')
        if not file.is_file():
            errors.append(f'Missing page: {file.name}')
            continue
        parser = Page()
        parser.feed(file.read_text(encoding='utf-8'))
        if len(parser.ids) != len(set(parser.ids)):
            errors.append(f'{file.name}: duplicate id')
        if parser.h1_count != 1 or parser.current != 1:
            errors.append(f'{file.name}: expected one h1 and one current navigation link')
        for value in parser.paths:
            parts = urlsplit(value)
            if parts.scheme or parts.netloc or not parts.path:
                continue
            path = root / unquote(parts.path)
            if not path.is_file():
                errors.append(f'{file.name}: missing relative file {parts.path}')
    data = root / 'data'
    if data.is_dir():
        for file in data.glob('*.json'):
            try:
                value = json.loads(file.read_text(encoding='utf-8-sig'))
                expected = dict if file.stem in ('home', 'professor', 'site') else list
                if not isinstance(value, expected):
                    errors.append(f'{file.name}: expected {expected.__name__}')
            except (ValueError, OSError) as exc:
                errors.append(f'{file.name}: {exc}')
    else:
        print('INFO: data/ is not in this package. Keep the existing repository data/.')
    if errors:
        print('\n'.join('ERROR: ' + item for item in errors), file=sys.stderr)
        return 1
    print(f'PASS: {len(pages)} pages, local references, IDs, navigation, and available JSON files.')
    print('This check does not verify external DOI/map links, CMS login, or GitHub deployment.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
