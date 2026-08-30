import React, { useState } from "react";

const CHOICES = [
  { key: "rock", emoji: "✊", label: "Rock" },
  { key: "paper", emoji: "✋", label: "Paper" },
  { key: "scissors", emoji: "✌️", label: "Scissors" },
];

function judge(p, r) {
  if (p === r) return "draw";
  if ((p === "rock" && r === "scissors") || (p === "paper" && r === "rock") || (p === "scissors" && r === "paper")) return "win";
  return "lose";
}

export default function RockPaperScissors() {
  const [you, setYou] = useState(null);
  const [bot, setBot] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 });
  const [busy, setBusy] = useState(false);

  const play = (choice) => {
    if (busy) return;
    setBusy(true);
    setYou(choice);
    setBot(null);
    setResult(null);
    setTimeout(() => {
      const b = CHOICES[Math.floor(Math.random() * 3)].key;
      const res = judge(choice, b);
      setBot(b);
      setResult(res);
      setScore((s) => ({ w: s.w + (res === "win" ? 1 : 0), l: s.l + (res === "lose" ? 1 : 0), d: s.d + (res === "draw" ? 1 : 0) }));
      setBusy(false);
    }, 500);
  };

  const emoji = (k) => CHOICES.find((c) => c.key === k)?.emoji || "❓";
  const msg = result === "win" ? "You win!" : result === "lose" ? "Robot wins!" : result === "draw" ? "Draw!" : "Pick your move";

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-4 flex items-center justify-around">
        <div className="text-center">
          <p className="text-4xl">{you ? emoji(you) : "❔"}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">You</p>
        </div>
        <span className="text-xl font-bold text-muted-foreground">VS</span>
        <div className="text-center">
          <p className={`text-4xl ${busy ? "animate-pulse" : ""}`}>{busy ? "…" : bot ? emoji(bot) : "❔"}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Robot</p>
        </div>
      </div>
      <p className="mb-3 text-center text-sm font-medium text-foreground">{msg}</p>
      <div className="mb-4 flex justify-center gap-3">
        {CHOICES.map((c) => (
          <button key={c.key} onClick={() => play(c.key)} disabled={busy} className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background text-3xl transition hover:bg-muted disabled:opacity-50">
            {c.emoji}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Wins {score.w} · Losses {score.l} · Draws {score.d}</p>
    </div>
  );
}