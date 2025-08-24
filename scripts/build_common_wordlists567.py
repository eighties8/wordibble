# build_common_words.py
# Generates common-word JSON lists for specified lengths (default: 5,6,7).
# Minimal version using wordfreq, same behavior as before—just adds 5-letter output.

import argparse, json, re
from pathlib import Path
from wordfreq import top_n_list

ALNUM_RE = re.compile(r"^[a-z]+$")

def is_clean_word(w: str, L: int) -> bool:
    # keep simple: letters only, exact length, all lowercase
    return len(w) == L and ALNUM_RE.match(w) is not None

def build_words(length: int, target_count: int, lang: str = "en") -> list[str]:
    # pull a generous slice and filter down; bump N if you need bigger sets
    N = max(100000, target_count * 20)
    words = top_n_list(lang, N)
    out = []
    seen = set()
    for w in words:
        w = w.lower()
        if w in seen: 
            continue
        if is_clean_word(w, length):
            out.append(w)
            seen.add(w)
            if len(out) >= target_count:
                break
    return out

def main():
    p = argparse.ArgumentParser(description="Build common-word lists by length")
    p.add_argument("--lengths", nargs="+", type=int, default=[5, 6, 7],
                   help="Word lengths to generate (default: 5 6 7)")
    p.add_argument("--count", type=int, default=2500,
                   help="Words per length (default: 2500)")
    p.add_argument("--outdir", type=str, default=".",
                   help="Output directory (default: current dir)")
    p.add_argument("--prefix", type=str, default="words",
                   help='Filename prefix (default: "words")')
    args = p.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    for L in args.lengths:
        lst = build_words(L, args.count)
        fp = outdir / f"dictionary{L}.json"
        with fp.open("w", encoding="utf-8") as f:
            json.dump(lst, f, ensure_ascii=False, indent=2)
        print(f"Wrote {len(lst)} words -> {fp}")

if __name__ == "__main__":
    main()