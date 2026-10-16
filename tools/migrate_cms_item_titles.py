#!/usr/bin/env python3
"""One-time ACSoL Pages CMS display-name migration: top-level arrays -> {"items": [...]}.

Run via GitHub Actions. Safe to rerun. Keeps all values and array order intact.
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
NAMES = ["banners", "research", "professor-employment", "professor-awards", "alumni", "publications", "equipment", "news", "gallery"]

def upgrade(path):
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if isinstance(data, dict) and isinstance(data.get("items"), list):
        print(f"OK already converted: {path.name} ({len(data['items'])})")
        return False
    if not isinstance(data, list) or any(not isinstance(x, dict) for x in data):
        raise ValueError(f"Unexpected structure in {path}: expected array of objects or {{items:[...]}}")
    path.write_text(json.dumps({"items": data}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Converted: {path.name} ({len(data)} items)")
    return True

if __name__ == '__main__':
    changed = 0
    for filename in NAMES:
        path = ROOT / 'data' / (filename + '.json')
        if not path.exists():
            raise FileNotFoundError(f"Missing file: {path}")
        changed += upgrade(path)
    print(f"Done: converted {changed} files")
