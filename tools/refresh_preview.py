#!/usr/bin/env python3
"""Refresh the local file:// preview after editing data/ or media/.
Usage: python tools/refresh_preview.py
Python standard library only. The public site always reads live JSON.
"""
from pathlib import Path
import json
import sys


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    try:
        data = {path.stem: json.loads(path.read_text(encoding='utf-8-sig'))
                for path in sorted((root / 'data').glob('*.json'))}
        if not data:
            raise ValueError('No JSON files were found in data/.')
        media = sorted(path.relative_to(root).as_posix() for path in (root / 'media').rglob('*')
                       if path.is_file() and not path.name.startswith('.'))
        payload = '// Local preview snapshot only. Never used on an HTTP(S) website.\n'
        payload += '(() => { if (location.protocol !== "file:") return;\n'
        payload += 'window.ACSOL_PREVIEW_DATA = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
        payload += 'window.ACSOL_PREVIEW_MEDIA = ' + json.dumps(media, ensure_ascii=False) + ';\n})();\n'
        (root / 'preview-data.js').write_text(payload, encoding='utf-8')
        print(f'OK: preview-data.js ({len(data)} JSON files, {len(media)} media files)')
        print('Open index.html to preview. All live CMS data remains unchanged.')
        return 0
    except (OSError, ValueError) as exc:
        print(f'Preview refresh failed: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
