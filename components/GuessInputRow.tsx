import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  wordLength: 5 | 6;
  // locked[i] === true => cell is readOnly (green / revealed)
  locked: boolean[];
  // initial revealed letters; for editable cells use "" initially
  initialCells?: string[];
  // called whenever editable letters change (excluding locked)
  onChange?: (letters: string[]) => void;
};

export default function GuessInputRow({
  wordLength,
  locked,
  initialCells,
  onChange,
}: Props) {
  const [cells, setCells] = useState<string[]>(
    () =>
      (initialCells && initialCells.slice(0, wordLength)) ||
      Array(wordLength).fill("")
  );

  // keep a ref array of inputs
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // ---------- helpers ----------
  const clamp = (i: number) => Math.max(0, Math.min(wordLength - 1, i));

  const firstEditable = useMemo(() => {
    for (let i = 0; i < wordLength; i++) if (!locked[i]) return i;
    return -1;
  }, [locked, wordLength]);

  const lastEditable = useMemo(() => {
    for (let i = wordLength - 1; i >= 0; i--) if (!locked[i]) return i;
    return -1;
  }, [locked, wordLength]);

  const findNextEditable = (from: number) => {
    for (let i = from + 1; i < wordLength; i++) if (!locked[i]) return i;
    return -1;
  };

  const findPrevEditable = (from: number) => {
    for (let i = from - 1; i >= 0; i--) if (!locked[i]) return i;
    return -1;
  };

  const focusIndex = (i: number) => {
    if (i < 0) return;
    const el = inputRefs.current[i];
    if (el && !locked[i]) {
      // schedule focus after DOM paints to avoid race w/ state updates
      requestAnimationFrame(() => {
        try {
          el.focus();
          el.setSelectionRange(0, el.value.length);
        } catch {}
      });
      setActiveIndex(i);
    }
  };

  // ---------- initialize / react to locks ----------
  useEffect(() => {
    // normalize cells so locked cells always hold an uppercase letter
    setCells((prev) =>
      prev.map((ch, i) => (locked[i] ? (ch || "").toUpperCase() : ch || ""))
    );
  }, [locked]);

  // when mounted or when locks change, ensure focus sits on first editable
  useEffect(() => {
    const start = firstEditable;
    console.log('Focus effect triggered - firstEditable:', start, 'locked:', locked);
    if (start >= 0) {
      // Use a small delay to ensure DOM is updated
      setTimeout(() => focusIndex(start), 100);
    }
  }, [firstEditable, locked]);

  // Reset focus when cells change (after submit)
  useEffect(() => {
    const start = firstEditable;
    if (start >= 0) {
      // Always reset focus to first editable cell when cells change
      setTimeout(() => focusIndex(start), 100);
    }
  }, [cells, firstEditable]);

  // bubble editable values (not locked) to parent
  useEffect(() => {
    if (!onChange) return;
    const editable = cells.map((c, i) => (locked[i] ? "" : c));
    onChange(editable);
  }, [cells, locked, onChange]);

  // ---------- input handlers ----------
  const handleChange = (i: number, raw: string) => {
    if (locked[i]) return;
    const val = (raw || "").slice(-1).toUpperCase().replace(/[^A-Z]/g, "");
    setCells((prev) => {
      const next = prev.slice();
      next[i] = val;
      return next;
    });
    // move forward if we typed a letter
    if (val) {
      const to = findNextEditable(i);
      // Use requestAnimationFrame to ensure state update completes before focusing
      requestAnimationFrame(() => focusIndex(to >= 0 ? to : i));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const to = findNextEditable(i);
      focusIndex(to >= 0 ? to : i);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const to = findPrevEditable(i);
      focusIndex(to >= 0 ? to : i);
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      setCells((prev) => {
        const next = prev.slice();
        if (next[i]) {
          // clear current editable cell
          next[i] = "";
          return next;
        }
        // current already empty -> move to previous editable and clear it
        const prevIdx = findPrevEditable(i);
        if (prevIdx >= 0) {
          next[prevIdx] = "";
          // focus after state applies
          requestAnimationFrame(() => focusIndex(prevIdx));
        }
        return next;
      });
      return;
    }
    if (e.key === "Delete") {
      e.preventDefault();
      setCells((prev) => {
        const next = prev.slice();
        if (next[i]) {
          next[i] = "";
          // stay here
          return next;
        }
        const to = findNextEditable(i);
        if (to >= 0) {
          next[to] = "";
          requestAnimationFrame(() => focusIndex(to));
        }
        return next;
      });
      return;
    }
  };

  const handlePaste = (startIndex: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").toUpperCase().replace(/[^A-Z]/g, "");
    if (!text) return;
    setCells((prev) => {
      const next = prev.slice();
      let idx = startIndex;
      for (const ch of text) {
        if (idx >= wordLength) break;
        // advance to next editable slot
        while (idx < wordLength && locked[idx]) idx++;
        if (idx >= wordLength) break;
        next[idx] = ch;
        idx++;
      }
      // focus the next editable after the pasted block
      const to = idx < wordLength ? (locked[idx] ? findNextEditable(idx) : idx) : lastEditable;
      requestAnimationFrame(() => focusIndex(clamp(to ?? lastEditable)));
      return next;
    });
  };

  const handleClick = (i: number) => {
    if (locked[i]) {
      // clicking a locked cell: move to nearest editable neighbor
      const left = findPrevEditable(i);
      const right = findNextEditable(i);
      focusIndex(left >= 0 ? left : right);
    } else {
      focusIndex(i);
    }
  };

  // ---------- render ----------
  return (
    <div className={`grid gap-2 ${wordLength === 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
      {Array.from({ length: wordLength }).map((_, i) => {
        const isLocked = !!locked[i];
        return (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            className={[
              "w-14 h-14 rounded-lg text-center text-xl font-semibold uppercase",
              isLocked
                ? "bg-green-500 text-white cursor-default"
                : "bg-gray-700 text-white border border-gray-500 focus:ring-2 focus:ring-blue-500",
              activeIndex === i ? "ring-1 ring-blue-400" : "",
            ].join(" ")}
            inputMode="latin"
            autoComplete="off"
            maxLength={1}
            value={cells[i]}
            readOnly={isLocked}
            tabIndex={isLocked ? -1 : 0}
            onClick={() => handleClick(i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onChange={(e) => handleChange(i, e.target.value)}
            onPaste={(e) => handlePaste(i, e)}
            aria-label={`Letter ${i + 1}`}
          />
        );
      })}
    </div>
  );
}
