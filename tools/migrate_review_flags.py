"""One-time, idempotent normalization for historical publication status values.

For records that do not already have an explicit `underReview` boolean,
set it to True only when historical `status` is exactly `Under Review`.
Keep the historical `status`/`publicationType` fields unchanged for provenance.
Never remove records or overwrite manually edited underReview booleans.
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
for filename in ("publications.json", "publications-import.json"):
    path = ROOT / "data" / filename
    if not path.is_file():
        continue
    items = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(items, list):
        raise ValueError(f"Expected JSON list: {path}")
    updated = 0
    for item in items:
        if not isinstance(item, dict) or isinstance(item.get("underReview"), bool):
            continue
        item["underReview"] = str(item.get("status", "")).strip().lower() == "under review"
        updated += 1
    if updated:
        path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{filename}: {updated} entries normalized; {len(items)} total")
