"""
Import medicine dataset from Kaggle (or local CSV) into PulseAI medicine knowledge schema.

Output JSON format matches app.knowledge.medicine_db MEDICINE_DATABASE entries.
"""

import argparse
import csv
import importlib
import json
import re
import tempfile
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


COLUMN_HINTS = {
    "name": ["name", "medicine", "brand", "product", "drug_name", "brand_name"],
    "generic": [
        "generic",
        "salt",
        "composition",
        "molecule",
        "active",
        "active_ingredient",
        "generic_name",
    ],
    "category": ["category", "type", "class", "therapeutic", "drug_class"],
    "uses": ["use", "uses", "indication", "indications", "condition", "therapy"],
    "side_effects": ["side_effect", "adverse", "effect", "sideeffects"],
    "warnings": ["warning", "precaution", "contra", "contraindication", "caution"],
    "max_dose": ["dose", "dosage", "strength", "max_dose", "recommended_dose"],
    "interactions": ["interaction", "drug_interaction"],
    "prescription": ["prescription", "rx", "otc", "schedule"],
    "safe_children": ["children_safe", "safe_children", "pediatric", "child"],
    "safe_pregnancy": ["pregnancy_safe", "safe_pregnancy", "pregnancy", "pregnant"],
}

DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "app" / "knowledge" / "generated_medicine_db.json"


def normalize_header(header: str) -> str:
    text = header.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    text = re.sub(r"_+", "_", text).strip("_")
    return text


def slugify_key(value: str) -> str:
    text = value.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    text = re.sub(r"_+", "_", text).strip("_")
    return text or "medicine"


def split_values(value: str) -> List[str]:
    if not value:
        return []

    text = value.strip()
    if not text:
        return []

    if "|" in text:
        parts = [p.strip() for p in text.split("|")]
    elif ";" in text:
        parts = [p.strip() for p in text.split(";")]
    elif "\n" in text:
        parts = [p.strip() for p in text.splitlines()]
    else:
        # Comma split as fallback
        parts = [p.strip() for p in text.split(",")]

    unique: List[str] = []
    seen = set()
    for part in parts:
        if not part:
            continue
        key = part.lower()
        if key in seen:
            continue
        seen.add(key)
        unique.append(part)

    return unique


def parse_bool(value: str, default: bool = False) -> bool:
    text = (value or "").strip().lower()
    if not text:
        return default

    if text in {"1", "true", "yes", "y", "safe", "recommended", "otc"}:
        return True
    if text in {"0", "false", "no", "n", "unsafe", "not recommended"}:
        return False

    return default


def parse_prescription(value: str) -> bool:
    text = (value or "").strip().lower()
    if not text:
        return True

    if "otc" in text or text in {"no", "false", "0"}:
        return False

    if "rx" in text or "prescription" in text or text in {"yes", "true", "1"}:
        return True

    return True


def dedupe_keep_order(items: Iterable[str]) -> List[str]:
    result: List[str] = []
    seen = set()
    for item in items:
        item_clean = str(item).strip()
        if not item_clean:
            continue
        key = item_clean.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(item_clean)
    return result


def find_best_column(normalized_headers: Dict[str, str], hints: List[str]) -> Optional[str]:
    best_column = None
    best_score = 0

    for raw_header, normalized in normalized_headers.items():
        score = 0
        for hint in hints:
            if normalized == hint:
                score += 10
            elif normalized.startswith(hint):
                score += 5
            elif hint in normalized:
                score += 3

        if score > best_score:
            best_score = score
            best_column = raw_header

    return best_column


def detect_column_mapping(headers: List[str], overrides: Dict[str, Optional[str]]) -> Dict[str, Optional[str]]:
    normalized_headers = {header: normalize_header(header) for header in headers}

    mapping: Dict[str, Optional[str]] = {}
    for schema_key, hints in COLUMN_HINTS.items():
        override = overrides.get(schema_key)
        if override:
            mapping[schema_key] = override
        else:
            mapping[schema_key] = find_best_column(normalized_headers, hints)

    if not mapping.get("name") and mapping.get("generic"):
        mapping["name"] = mapping["generic"]

    return mapping


def choose_csv_file(root: Path, preferred_filename: Optional[str]) -> Path:
    if preferred_filename:
        candidate = root / preferred_filename
        if candidate.exists() and candidate.suffix.lower() == ".csv":
            return candidate

        matches = [
            file for file in root.rglob("*.csv")
            if file.name.lower() == preferred_filename.lower() or str(file).lower().endswith(preferred_filename.lower())
        ]
        if matches:
            return matches[0]

        raise FileNotFoundError(f"CSV file '{preferred_filename}' not found in downloaded dataset")

    csv_files = list(root.rglob("*.csv"))
    if not csv_files:
        raise FileNotFoundError("No CSV files found in dataset")

    # Prefer largest CSV since datasets often include small metadata files.
    csv_files.sort(key=lambda p: p.stat().st_size, reverse=True)
    return csv_files[0]


def read_csv_rows(path: Path) -> List[Dict[str, str]]:
    encodings = ["utf-8", "utf-8-sig", "latin-1"]

    for encoding in encodings:
        try:
            with path.open("r", encoding=encoding, newline="") as file:
                reader = csv.DictReader(file)
                rows = [dict(row) for row in reader]
                if not reader.fieldnames:
                    raise ValueError("CSV has no header row")
                return rows
        except UnicodeDecodeError:
            continue

    raise RuntimeError(f"Unable to decode CSV file: {path}")


def merge_entry(existing: Dict[str, Any], new_entry: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(existing)

    for list_field in ["aliases", "uses", "side_effects", "warnings", "interactions"]:
        merged[list_field] = dedupe_keep_order(existing.get(list_field, []) + new_entry.get(list_field, []))

    for scalar_field in ["category", "max_dose"]:
        existing_value = str(existing.get(scalar_field, "")).strip().lower()
        if existing_value in {"", "unknown", "n/a", "consult doctor", "medicine"}:
            candidate = str(new_entry.get(scalar_field, "")).strip()
            if candidate:
                merged[scalar_field] = candidate

    merged["safe_children"] = bool(existing.get("safe_children", False) or new_entry.get("safe_children", False))
    merged["safe_pregnancy"] = bool(existing.get("safe_pregnancy", False) or new_entry.get("safe_pregnancy", False))
    merged["prescription"] = bool(existing.get("prescription", True) or new_entry.get("prescription", True))

    return merged


def build_medicine_database(rows: List[Dict[str, str]], mapping: Dict[str, Optional[str]]) -> Dict[str, Dict[str, Any]]:
    db: Dict[str, Dict[str, Any]] = {}

    for row in rows:
        name = (row.get(mapping.get("name") or "", "") or "").strip()
        generic = (row.get(mapping.get("generic") or "", "") or "").strip()

        canonical = generic or name
        if not canonical:
            continue

        key = slugify_key(canonical)

        aliases = [name, generic, canonical]
        entry = {
            "aliases": dedupe_keep_order([a for a in aliases if a]),
            "category": (row.get(mapping.get("category") or "", "") or "").strip() or "Medicine",
            "uses": split_values((row.get(mapping.get("uses") or "", "") or "").strip()),
            "side_effects": split_values((row.get(mapping.get("side_effects") or "", "") or "").strip()),
            "warnings": split_values((row.get(mapping.get("warnings") or "", "") or "").strip()),
            "max_dose": (row.get(mapping.get("max_dose") or "", "") or "").strip() or "Consult doctor",
            "interactions": split_values((row.get(mapping.get("interactions") or "", "") or "").strip()),
            "safe_children": parse_bool((row.get(mapping.get("safe_children") or "", "") or ""), default=False),
            "safe_pregnancy": parse_bool((row.get(mapping.get("safe_pregnancy") or "", "") or ""), default=False),
            "prescription": parse_prescription((row.get(mapping.get("prescription") or "", "") or "")),
        }

        if key in db:
            db[key] = merge_entry(db[key], entry)
        else:
            db[key] = entry

    return db


def download_kaggle_dataset(dataset: str, target_dir: Path) -> None:
    try:
        kaggle_module = importlib.import_module("kaggle.api.kaggle_api_extended")
        KaggleApi = getattr(kaggle_module, "KaggleApi")
    except Exception as exc:
        raise RuntimeError(
            "Kaggle package is not installed. Install dependencies first: pip install -r requirements.txt"
        ) from exc

    api = KaggleApi()
    try:
        api.authenticate()
    except Exception as exc:
        raise RuntimeError(
            "Kaggle authentication failed. Configure ~/.kaggle/kaggle.json or KAGGLE_USERNAME/KAGGLE_KEY."
        ) from exc

    api.dataset_download_files(dataset=dataset, path=str(target_dir), unzip=True, quiet=False)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import medicine database from Kaggle or local CSV")

    source_group = parser.add_mutually_exclusive_group(required=True)
    source_group.add_argument("--dataset", help="Kaggle dataset slug in owner/dataset format")
    source_group.add_argument("--csv-file", help="Path to local CSV file")

    parser.add_argument("--file", help="Specific CSV filename inside Kaggle dataset")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Output JSON path")

    parser.add_argument("--name-col", help="Override name/brand column")
    parser.add_argument("--generic-col", help="Override generic/salt column")
    parser.add_argument("--category-col", help="Override category column")
    parser.add_argument("--uses-col", help="Override uses/indications column")
    parser.add_argument("--side-effects-col", help="Override side effects column")
    parser.add_argument("--warnings-col", help="Override warnings/precautions column")
    parser.add_argument("--max-dose-col", help="Override dose/dosage column")
    parser.add_argument("--interactions-col", help="Override interactions column")
    parser.add_argument("--prescription-col", help="Override prescription/OTC column")
    parser.add_argument("--safe-children-col", help="Override children safety boolean column")
    parser.add_argument("--safe-pregnancy-col", help="Override pregnancy safety boolean column")

    return parser.parse_args()


def main() -> None:
    args = parse_args()

    column_overrides = {
        "name": args.name_col,
        "generic": args.generic_col,
        "category": args.category_col,
        "uses": args.uses_col,
        "side_effects": args.side_effects_col,
        "warnings": args.warnings_col,
        "max_dose": args.max_dose_col,
        "interactions": args.interactions_col,
        "prescription": args.prescription_col,
        "safe_children": args.safe_children_col,
        "safe_pregnancy": args.safe_pregnancy_col,
    }

    if args.dataset:
        with tempfile.TemporaryDirectory(prefix="kaggle_med_db_") as temp_dir:
            temp_path = Path(temp_dir)
            print(f"Downloading Kaggle dataset: {args.dataset}")
            download_kaggle_dataset(args.dataset, temp_path)
            csv_path = choose_csv_file(temp_path, args.file)
            print(f"Using CSV: {csv_path}")
            rows = read_csv_rows(csv_path)
    else:
        csv_path = Path(args.csv_file).expanduser().resolve()
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV file not found: {csv_path}")
        print(f"Using local CSV: {csv_path}")
        rows = read_csv_rows(csv_path)

    if not rows:
        raise RuntimeError("No rows found in CSV")

    headers = list(rows[0].keys())
    mapping = detect_column_mapping(headers, column_overrides)

    print("Detected column mapping:")
    for key in sorted(mapping.keys()):
        print(f"  {key}: {mapping[key]}")

    db = build_medicine_database(rows, mapping)
    if not db:
        raise RuntimeError("No medicine entries could be built from CSV. Adjust --*-col mappings.")

    output_path = Path(args.output).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(db, file, indent=2, ensure_ascii=False, sort_keys=True)

    print(f"Imported {len(db)} medicines into: {output_path}")
    print("Restart backend to use the imported database.")


if __name__ == "__main__":
    main()
