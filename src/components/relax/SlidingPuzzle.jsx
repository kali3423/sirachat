import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SIZE = 3;
const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, null];

function isSolvable(arr) {
  const a = arr.filter((x) => x !== null);
  let inv = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++;
  return inv % 2 === 0;
}

function shuffle() {
  let arr;
  do { arr = [...GOAL].sort(() => Math.random() - 0.5); } while (!isSolvable(arr) || arr.join() === GOAL.join());
  return arr;
}

export default function SlidingPuzzle() {
  const { t } = useI18n();
  const [tiles, setTiles] = useState(shuffle);
  const [moves, setMoves] = useState(0);
  const empty = tiles.indexOf(null);

  const neighbors = (i) => {
    const r = Math.floor(i / SIZE), c = i % SIZE, n = [];
    if (r > 0) n.push(i - SIZE);
    if (r < SIZE - 1) n.push(i + SIZE);
    if (c > 0) n.push(i - 1);
    if (c < SIZE - 1) n.push(i + 1);
    return n;
  };

  const move = (i) => {
    if (!neighbors(empty).includes(i)) return;
    const t2 = [...tiles];
    t2[empty] = t2[i];
    t2[i] = null;
    setTiles(t2);
    setMoves((m) => m + 1);
  };

  const won = tiles.join() === GOAL.join();
  const reset = () => { setTiles(shuffle()); setMoves(0); };

  return (
    <div className="mx-auto max-w-xs">
      <p className="mb-3 text-center text-sm font-semibold text-foreground">
        {won ? t("relak.g.solvedIn", { n: moves }) : t("relak.g.moves", { n: moves })}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((v, i) => (
          <button
            key={i}
            onClick={() => move(i)}
            className={cn(
              "flex h-20 items-center justify-center rounded-2xl border text-2xl font-bold transition active:scale-95",
              v == null ? "border-dashed border-border bg-transparent" : "border-transparent bg-sira text-white hover:brightness-105"
            )}
          >
            {v ?? ""}
          </button>
        ))}
      </div>
      <button onClick={reset} className="press mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong">
        {t("relak.g.shuffle")}
      </button>
    </div>
  );
}
