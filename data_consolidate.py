#!/usr/bin/env python3
"""Compare data.json and data.csv, then build a reconciled JSON file."""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import tempfile
from collections.abc import Callable
from pathlib import Path
from typing import Any, IO


ID_FIELD = "HKU_HKSLLEX_ID.id"


def scalar_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (dict, list)):
        raise ValueError(f"Expected a scalar value, received {type(value).__name__}")
    return str(value)


def flatten_json(value: Any, parts: tuple[str, ...] = ()) -> dict[str, str]:
    flattened: dict[str, str] = {}
    if isinstance(value, dict):
        for key, child in value.items():
            flattened.update(flatten_json(child, (*parts, str(key))))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            flattened.update(flatten_json(child, (*parts, str(index))))
    elif parts:
        flattened[".".join(parts)] = scalar_text(value)
    return flattened


def entry_id(entry: dict[str, Any], source: str) -> str:
    try:
        value = entry["HKU_HKSLLEX_ID"]["id"]
    except (KeyError, TypeError):
        raise ValueError(f"{source} entry is missing HKU_HKSLLEX_ID.id") from None
    if not isinstance(value, str) or not value:
        raise ValueError(f"{source} entry has an empty or non-string HKU_HKSLLEX_ID.id")
    return value


def index_json(entries: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(entries, list):
        raise ValueError("JSON root must be an array of entries")
    indexed: dict[str, dict[str, Any]] = {}
    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError("Every JSON entry must be an object")
        key = entry_id(entry, "JSON")
        if key in indexed:
            raise ValueError(f"Duplicate ID in JSON: {key}")
        indexed[key] = entry
    return indexed


def index_csv(path: Path) -> tuple[dict[str, dict[str, str]], list[str]]:
    indexed: dict[str, dict[str, str]] = {}
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        headers = list(reader.fieldnames or [])
        if ID_FIELD not in headers:
            raise ValueError(f"CSV must contain the {ID_FIELD!r} column")
        if len(headers) != len(set(headers)):
            raise ValueError("CSV contains duplicate column names")
        for line_number, row in enumerate(reader, start=2):
            if None in row:
                raise ValueError(f"CSV row {line_number} has more values than headers")
            key = row.get(ID_FIELD, "")
            if not key:
                raise ValueError(f"CSV row {line_number} has an empty ID")
            if key in indexed:
                raise ValueError(f"Duplicate ID in CSV: {key}")
            indexed[key] = {name: value or "" for name, value in row.items()}
    return indexed, headers


def compare_entries(
    json_entry: dict[str, Any], csv_entry: dict[str, str]
) -> dict[str, tuple[str, str]]:
    json_flat = flatten_json(json_entry)
    differences: dict[str, tuple[str, str]] = {}
    for field in sorted(json_flat.keys() | csv_entry.keys()):
        json_value = json_flat.get(field, "")
        csv_value = csv_entry.get(field, "")
        if json_value != csv_value:
            differences[field] = (json_value, csv_value)
    return differences


def display_value(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def show_differences(
    json_rows: dict[str, dict[str, Any]],
    csv_rows: dict[str, dict[str, str]],
    differences: dict[str, dict[str, tuple[str, str]]],
    ids: list[str],
) -> None:
    for key in ids:
        if key not in json_rows:
            print(f"\n[CSV-only] {key} (no matching JSON entry; kept automatically)")
        elif key not in csv_rows:
            print(f"\n[JSON-only] {key} (no matching CSV entry; kept automatically)")
        elif not differences.get(key):
            continue
        else:
            print(f"\n[DIFF] {key}")
            for field, (json_value, csv_value) in differences[key].items():
                print(
                    f"  {field}: JSON={display_value(json_value)} "
                    f"| CSV={display_value(csv_value)}"
                )


def set_path(root: dict[str, Any], path: str, value: Any) -> None:
    parts = path.split(".")
    current: Any = root
    for position, part in enumerate(parts[:-1]):
        next_is_index = parts[position + 1].isdigit()
        if isinstance(current, list):
            if not part.isdigit():
                raise ValueError(f"Invalid array path in CSV column: {path}")
            index = int(part)
            while len(current) <= index:
                current.append(None)
            if current[index] is None:
                current[index] = [] if next_is_index else {}
            current = current[index]
        elif isinstance(current, dict):
            child = current.get(part)
            if child is None:
                child = [] if next_is_index else {}
                current[part] = child
            current = child
        else:
            raise ValueError(f"Conflicting CSV column paths at: {path}")

    final = parts[-1]
    if isinstance(current, list):
        if not final.isdigit():
            raise ValueError(f"Invalid array path in CSV column: {path}")
        index = int(final)
        while len(current) <= index:
            current.append(None)
        current[index] = value
    elif isinstance(current, dict):
        current[final] = value
    else:
        raise ValueError(f"Conflicting CSV column paths at: {path}")


def is_empty_container(value: Any) -> bool:
    if isinstance(value, dict):
        return all(
            child is None
            or child == ""
            or isinstance(child, (dict, list))
            and is_empty_container(child)
            for child in value.values()
        )
    if isinstance(value, list):
        return not value or all(
            child is None
            or child == ""
            or isinstance(child, (dict, list))
            and is_empty_container(child)
            for child in value
        )
    return False


def prune_empty_list_items(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: prune_empty_list_items(child) for key, child in value.items()}
    if isinstance(value, list):
        items = [prune_empty_list_items(child) for child in value]
        while items and (
            items[-1] is None
            or items[-1] == ""
            or isinstance(items[-1], (dict, list))
            and is_empty_container(items[-1])
        ):
            items.pop()
        return ["" if item is None else item for item in items]
    return value


def json_row_from_csv(csv_entry: dict[str, str]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    fields = set(csv_entry)
    skipped_fields: set[str] = set()
    skipped_descendants: set[str] = set()
    for field, value in csv_entry.items():
        descendants = {
            candidate
            for candidate in fields
            if candidate.startswith(field + ".")
        }
        if not descendants:
            continue
        has_nonempty_descendant = any(csv_entry[candidate] for candidate in descendants)
        if value and has_nonempty_descendant:
            raise ValueError(f"Conflicting CSV values at {field!r} and its nested columns")
        if value or not has_nonempty_descendant:
            set_path(result, field, value)
            skipped_descendants.update(
                candidate
                for candidate in fields
                if candidate.startswith(field + ".")
            )
        else:
            skipped_fields.add(field)

    for field, value in csv_entry.items():
        if field not in skipped_fields and field not in skipped_descendants:
            set_path(result, field, value)
    return prune_empty_list_items(result)


def prompt_choice(prompt: str, allowed: set[str]) -> str:
    while True:
        try:
            answer = input(prompt).strip().lower()
        except EOFError:
            raise ValueError("No interactive input; use --prefer json or --prefer csv") from None
        if answer in allowed:
            return answer
        print(f"Enter one of: {', '.join(sorted(allowed))}")


def parse_args() -> argparse.Namespace:
    base = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(
        description="Compare data.json and data.csv, then export only conflicting rows."
    )
    parser.add_argument("--json", dest="json_path", type=Path, default=base / "data.json")
    parser.add_argument("--csv", dest="csv_path", type=Path, default=base / "data.csv")
    parser.add_argument(
        "--output", type=Path, default=base / "data_consolidated",
        help="output filename stem; .csv and/or .json is added (existing files are not overwritten)",
    )
    parser.add_argument(
        "--prefer", choices=("json", "csv"),
        help="keep this version for every conflicting row instead of prompting",
    )
    parser.add_argument(
        "--overwrite",
        choices=("json", "csv"),
        help="overwrite the selected source file's conflicting rows using the other file; requires typed confirmation",
    )
    return parser.parse_args()


def output_path(stem: Path, extension: str) -> Path:
    return stem.with_suffix(f".{extension}")


def require_overwrite_confirmation(path: Path) -> None:
    confirmation = f"OVERWRITE {path.name}"
    print(
        f"WARNING: this will permanently replace conflicting entries in "
        f"{path} using the other source. Back up the file first."
    )
    try:
        answer = input(f"Type {confirmation!r} to continue: ").strip()
    except EOFError:
        raise ValueError("Overwrite not confirmed; no changes made") from None
    if answer != confirmation:
        raise ValueError("Overwrite not confirmed; no changes made")


def write_json(path: Path, entries: list[dict[str, Any]], *, overwrite: bool) -> None:
    if overwrite:
        def write_entries(file: Any) -> None:
            json.dump(entries, file, ensure_ascii=False, indent=2)
            file.write("\n")

        atomic_write(path, write_entries)
        return
    with path.open("x", encoding="utf-8", newline="\n") as file:
        json.dump(entries, file, ensure_ascii=False, indent=2)
        file.write("\n")


def write_csv(
    path: Path,
    headers: list[str],
    rows: list[dict[str, str]],
    *,
    overwrite: bool,
) -> None:
    if overwrite:
        atomic_write(
            path,
            lambda file: write_csv_rows(file, headers, rows),
            encoding="utf-8-sig",
            newline="",
        )
        return
    with path.open("x", encoding="utf-8-sig", newline="") as file:
        write_csv_rows(file, headers, rows)


def write_csv_rows(
    file: Any, headers: list[str], rows: list[dict[str, str]]
) -> None:
    writer = csv.DictWriter(file, fieldnames=headers, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)


def atomic_write(
    path: Path,
    write_contents: Callable[[IO[str]], None],
    *,
    encoding: str = "utf-8",
    newline: str | None = "\n",
) -> None:
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding=encoding,
            newline=newline,
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as file:
            temporary_path = Path(file.name)
            write_contents(file.file)
            file.flush()
            os.fsync(file.fileno())
        os.replace(temporary_path, path)
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


def replace_json_entries(
    entries: list[dict[str, Any]],
    replacements: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    return [
        replacements.get(entry_id(entry, "JSON"), entry)
        for entry in entries
    ]


def replace_csv_entries(
    rows: dict[str, dict[str, str]],
    headers: list[str],
    replacements: dict[str, dict[str, Any]],
) -> list[dict[str, str]]:
    updated = {key: row.copy() for key, row in rows.items()}
    for key, entry in replacements.items():
        flattened = flatten_json(entry)
        updated[key] = {header: flattened.get(header, "") for header in headers}
    return list(updated.values())


def csv_row_from_json(
    entry: dict[str, Any], headers: list[str]
) -> dict[str, str]:
    flattened = flatten_json(entry)
    return {header: flattened.get(header, "") for header in headers}


def main() -> int:
    args = parse_args()
    try:
        if args.prefer is not None and args.overwrite is not None:
            raise ValueError("--prefer cannot be combined with --overwrite")

        with args.json_path.open("r", encoding="utf-8") as file:
            json_entries = json.load(file)
        json_rows = index_json(json_entries)
        csv_rows, csv_headers = index_csv(args.csv_path)

        all_ids = list(json_rows)
        all_ids.extend(key for key in csv_rows if key not in json_rows)
        differences = {
            key: compare_entries(json_rows[key], csv_rows[key])
            for key in json_rows.keys() & csv_rows.keys()
        }
        conflicting_ids = [key for key in all_ids if differences.get(key)]
        print(
            f"JSON entries: {len(json_rows)}; CSV entries: {len(csv_rows)}; "
            f"conflicting rows: {len(conflicting_ids)}"
        )
        show_differences(json_rows, csv_rows, differences, all_ids)

        mode: str | None = None
        if conflicting_ids and args.prefer is None and args.overwrite is None:
            mode = prompt_choice(
                "\nChoose [p]er row, [j]son for all, [c]sv for all, "
                "[o]verwrite an input file, or [q]uit: ",
                {"p", "j", "c", "o", "q"},
            )
            if mode == "q":
                print("Cancelled; no output written.")
                return 1
            if mode == "o":
                target_choice = prompt_choice(
                    "Overwrite [j]son using CSV or [c]sv using JSON? ",
                    {"j", "c"},
                )
                args.overwrite = "json" if target_choice == "j" else "csv"

        if args.overwrite is not None:
            if not conflicting_ids:
                print("No conflicting entries; nothing to overwrite.")
                return 0
            target = args.json_path if args.overwrite == "json" else args.csv_path
            require_overwrite_confirmation(target)
            if args.overwrite == "json":
                replacements = {
                    key: json_row_from_csv(csv_rows[key])
                    for key in conflicting_ids
                }
                write_json(
                    target,
                    replace_json_entries(json_entries, replacements),
                    overwrite=True,
                )
            else:
                replacements = {
                    key: json_rows[key]
                    for key in conflicting_ids
                }
                write_csv(
                    target,
                    csv_headers,
                    replace_csv_entries(csv_rows, csv_headers, replacements),
                    overwrite=True,
                )
            print(f"Overwrote conflicting entries in: {target}")
            return 0

        choices: dict[str, str] = {}
        if conflicting_ids:
            if args.prefer is not None:
                choices = {key: args.prefer for key in conflicting_ids}
            else:
                if mode == "p":
                    for key in conflicting_ids:
                        answer = prompt_choice(
                            f"Keep [j]son or [c]sv for {key}? ",
                            {"j", "c"},
                        )
                        choices[key] = "json" if answer == "j" else "csv"
                else:
                    selected_source = "json" if mode == "j" else "csv"
                    choices = {key: selected_source for key in conflicting_ids}

        csv_corrections = [
            csv_row_from_json(json_rows[key], csv_headers)
            for key in conflicting_ids
            if choices[key] == "json"
        ]
        json_corrections = [
            json_row_from_csv(csv_rows[key])
            for key in conflicting_ids
            if choices[key] == "csv"
        ]
        outputs: list[tuple[Path, str, Any]] = []
        if csv_corrections:
            outputs.append(
                (output_path(args.output, "csv"), "csv", csv_corrections)
            )
        if json_corrections:
            outputs.append(
                (output_path(args.output, "json"), "json", json_corrections)
            )
        existing = [str(path) for path, _, _ in outputs if path.exists()]
        if existing:
            raise FileExistsError(
                f"Refusing to overwrite existing output: {', '.join(existing)}"
            )
        for path, kind, rows in outputs:
            if kind == "csv":
                write_csv(path, csv_headers, rows, overwrite=False)
            else:
                write_json(path, rows, overwrite=False)
    except (OSError, csv.Error, json.JSONDecodeError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    if not outputs:
        print("No conflicting rows; no output written.")
    else:
        print("Correction rows written to:")
        for path, _, _ in outputs:
            print(f"  {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
