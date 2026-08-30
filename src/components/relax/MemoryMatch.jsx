import React, { useState } from "react";

const EMOJIS = ["🍎", "🍌", "🍇", "🍒", "🥝", "🍉", "🍓", "🍑"];

const buildDeck = () =>
  [...EMOJIS, ...EMOJIS]
    .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);

export default function MemoryMatch() {
  const [cards, setCards] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);
  const [busy, setBusy] = useState(false);
  const [moves, setMoves] = useState(0);

  const flip = (idx) => {
    if (busy || cards[idx].flipped || cards[idx].matched) return;
    const next = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    setCards(next);
    const nf = [...flipped, idx];
    setFlipped(nf);
    if (nf.length === 2) {
      setMoves((m) => m + 1);
      setBusy(true);
      const [a, b] = nf;
      if (next[a].emoji === next[b].emoji) {
        setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setFlipped([]);
          setBusy(false);
        }, 450);
      } else {
        setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setFlipped([]);
          setBusy(false);
        }, 800);
      }
    }
  };

  const won = cards.every((c) => c.matched);
  const reset = () => { setCards(buildDeck()); setFlipped([]); setMoves(0); setBusy(false); };

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-3 text-center text-sm font-medium text-foreground">
        {won ? `Solved in ${moves} moves!` : `Moves: ${moves}`}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => flip(i)}
            className={`flex h-16 items-center justify-center rounded-2xl border text-2xl transition ${c.flipped || c.matched ? "border-transparent bg-orange-50" : "border-border bg-background hover:bg-muted"}`}
          >
            {c.flipped || c.matched ? c.emoji : "❓"}
          </button>
        ))}
      </div>
      <button onClick={reset} className="mt-4 w-full rounded-xl bg-fuchsia-600 py-2.5 text-sm font-medium text-white transition hover:bg-fuchsia-700">New game</button>
    </div>
  );
}