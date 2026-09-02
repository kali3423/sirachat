import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

function calcWinner(b) {
  for (const [a, b2, c] of LINES) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
  }
  return null;
}

function emptyIndices(b) {
  return b.reduce((acc, v, i) => (v == null ? [...acc, i] : acc), []);
}

// Minimax: 'O' (robot) maximizes, 'X' (you) minimizes
function minimax(b, player) {
  const w = calcWinner(b);
  if (w === "O") return { score: 10 };
  if (w === "X") return { score: -10 };
  if (emptyIndices(b).length === 0) return { score: 0 };
  let best = player === "O" ? { score: -Infinity } : { score: Infinity };
  for (const i of emptyIndices(b)) {
    b[i] = player;
    const res = minimax(b, player === "O" ? "X" : "O");
    b[i] = null;
    res.index = i;
    if (player === "O" ? res.score > best.score : res.score < best.score) best = res;
  }
  return best;
}

export default function TicTacToe() {
  const { t } = useI18n();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xNext, setXNext] = useState(true); // you = X, robot = O
  const w = calcWinner(board);
  const draw = !w && board.every(Boolean);

  useEffect(() => {
    if (w || draw || xNext) return;
    const id = setTimeout(() => {
      const move = minimax(board, "O").index;
      if (move != null) {
        const nb = [...board];
        nb[move] = "O";
        setBoard(nb);
        setXNext(true);
      }
    }, 450);
    return () => clearTimeout(id);
  }, [board, xNext, w, draw]);

  const click = (i) => {
    if (board[i] || w || !xNext) return;
    const nb = [...board];
    nb[i] = "X";
    setBoard(nb);
    setXNext(false);
  };

  const reset = () => { setBoard(Array(9).fill(null)); setXNext(true); };
  const status = w === "O" ? t("relak.g.robotWins") : w === "X" ? t("relak.g.youWin") : draw ? t("relak.g.draw") : xNext ? t("relak.g.yourTurn") : t("relak.g.thinking");

  return (
    <div className="mx-auto max-w-xs">
      <p className="mb-3 text-center text-sm font-semibold text-foreground">{status}</p>
      <div className="grid grid-cols-3 gap-2">
        {board.map((v, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            className={cn(
              "flex h-20 items-center justify-center rounded-2xl border border-border bg-background text-3xl font-bold transition hover:bg-muted active:scale-95",
              v === "X" ? "text-primary" : v === "O" ? "text-focus" : "text-transparent"
            )}
          >
            {v || "·"}
          </button>
        ))}
      </div>
      <button onClick={reset} className="press mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-accent transition hover:bg-primary-strong">
        {t("relak.g.newRound")}
      </button>
    </div>
  );
}
