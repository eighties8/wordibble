#!/usr/bin/env python3
"""
Generate daily puzzle files from clues json.

Input files (in lib/data/):
  - clues5.json, clues6.json, clues7.json
    Format:
      {
        "yowls": "Caterwaul cry fest",
        "zoned": "Spaced out real nice",
        "zones": "Earth's timely dance."
      }

Output files (also in lib/data/):
  - puzzles{N}-{YEAR}.json
    Format:
      [
        { "date": "2025-08-23", "word": "HAPPY" },
        { "date": "2025-08-24", "word": "DREAM" }
      ]

Usage:
  python scripts/build_puzzles_from_clues.py
  python scripts/build_puzzles_from_clues.py --years 2025 2026 2027 2029 2030 --seed 42
  python scripts/build_puzzles_from_clues.py --only-lengths 6 7

Notes:
- For the current year, the schedule starts at *today*.
- For other years, schedule runs Jan 1 → Dec 31 of that year.
- If there are fewer words than days, the list cycles to cover all days.
- If there are more words than days, extra words are ignored for that year.
"""

import argparse
import json
import random
import re
from datetime import date, timedelta
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parents[1]  # repo root
DATA_DIR = ROOT / "lib" / "data"

DEFAULT_YEARS = [2025, 2026, 2027, 2029, 2030]
CLUE_FILES = ["clues5.json", "clues6.json", "clues7.json"]


def load_clues(fp: Path) -> Dict[str, str]:
    with fp.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError(f"{fp} must contain a JSON object of word->clue")
    # normalize keys to plain alpha and uppercase for output later
    # (keep original map in case you want to use clues elsewhere)
    return data


def days_in_year(year: int) -> int:
    d1 = date(year, 1, 1)
    d2 = date(year + 1, 1, 1)
    return (d2 - d1).days


def daterange(start: date, end_inclusive: date):
    d = start
    one = timedelta(days=1)
    while d <= end_inclusive:
        yield d
        d += one


def first_day_for_year(year: int, today: date) -> date:
    if year == today.year:
        return today
    return date(year, 1, 1)


def last_day_for_year(year: int) -> date:
    return date(year, 12, 31)


def generate_year_schedule(words: List[str], year: int, today: date) -> List[Dict[str, str]]:
    start = first_day_for_year(year, today)
    end = last_day_for_year(year)
    all_days = list(daterange(start, end))
    if not words:
        raise ValueError("No words available to schedule.")

    out: List[Dict[str, str]] = []
    wlen = len(words)
    for i, d in enumerate(all_days):
        w = words[i % wlen]
        out.append({"date": d.isoformat(), "word": w.upper()})
    return out


def write_json(fp: Path, data):
    fp.parent.mkdir(parents=True, exist_ok=True)
    with fp.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def infer_length_from_filename(name: str) -> int:
    m = re.search(r"(\d+)", name)
    if not m:
        raise ValueError(f"Cannot infer word length from filename: {name}")
    return int(m.group(1))


def main():
    parser = argparse.ArgumentParser(description="Build daily puzzles from clues json files.")
    parser.add_argument(
        "--years",
        nargs="+",
        type=int,
        default=DEFAULT_YEARS,
        help=f"Years to generate (default: {DEFAULT_YEARS})",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional RNG seed for reproducible shuffles.",
    )
    parser.add_argument(
        "--only-lengths",
        nargs="+",
        type=int,
        choices=[5, 6, 7],
        help="If provided, only process these word lengths (e.g. --only-lengths 6 7).",
    )
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    today = date.today()

    # discover which clue files to process
    clue_files = []
    for name in CLUE_FILES:
        if args.only_lengths:
            ln = infer_length_from_filename(name)
            if ln not in args.only_lengths:
                continue
        p = DATA_DIR / name
        if p.exists():
            clue_files.append(p)

    if not clue_files:
        raise SystemExit(f"No clue files found in {DATA_DIR} matching {args.only_lengths or '[5,6,7]'}.")

    for clues_fp in clue_files:
        length = infer_length_from_filename(clues_fp.name)
        clues_map = load_clues(clues_fp)

        # Filter to words with exact length, just in case
        words = [w.strip() for w in clues_map.keys() if isinstance(w, str) and len(w.strip()) == length]

        # Deduplicate & sanitize (letters only)
        # Keep original order for stability before shuffle (Python 3.7+ dict preserves insertion order)
        seen = set()
        clean_words = []
        for w in words:
            lw = w.lower()
            if lw in seen:
                continue
            seen.add(lw)
            clean_words.append(lw)

        if not clean_words:
            print(f"⚠️  No valid {length}-letter words in {clues_fp.name}; skipping.")
            continue

        random.shuffle(clean_words)

        for yr in args.years:
            schedule = generate_year_schedule(clean_words, yr, today)
            out_name = f"puzzles{length}-{yr}.json"
            out_fp = DATA_DIR / out_name
            write_json(out_fp, schedule)
            print(f"✅ Wrote {out_fp.relative_to(ROOT)} ({len(schedule)} entries)")

    print("Done.")


if __name__ == "__main__":
    main()