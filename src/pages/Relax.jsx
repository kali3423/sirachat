import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import T from "@/components/T";
import TicTacToe from "@/components/relax/TicTacToe";
import MemoryMatch from "@/components/relax/MemoryMatch";
import SlidingPuzzle from "@/components/relax/SlidingPuzzle";
import WhackAMole from "@/components/relax/WhackAMole";
import SnakeGame from "@/components/relax/SnakeGame";
import ColorMatch from "@/components/relax/ColorMatch";
import FlappyBird from "@/components/relax/FlappyBird";
import { Send, Gamepad2, Grid3x3, Brain, Puzzle, Hammer, Worm, Palette, Bird } from "lucide-react";

const LIMIT = 15 * 60;

export default function Relax() {
  const [me, setMe] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [game, setGame] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [penalized, setPenalized] = useState(false);
  const [notice, setNotice] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
    base44.entities.RelaxMessage.list("created_date", 200).then((msgs) => {
      setMessages(Array.isArray(msgs) ? msgs : []);
    }).catch(() => {});
    const unsub = base44.entities.RelaxMessage.subscribe((event) => {
      setMessages((prev) => (prev.some((m) => m.id === event.id) ? prev : [...prev, event.data].sort((a, b) => new Date(a.created_date) - new Date(b.created_date))));
    });
    return unsub;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!game) { setElapsed(0); setPenalized(false); return; }
    setElapsed(0);
    setPenalized(false);
    setNotice(null);
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [game]);

  useEffect(() => {
    if (!game || penalized) return;
    if (elapsed >= LIMIT) {
      setPenalized(true);
      (async () => {
        const fresh = await base44.auth.me().catch(() => null);
        const cur = fresh?.points ?? 500;
        await base44.auth.updateMe({ points: Math.max(0, cur - 10) }).catch(() => {});
        setMe((m) => (m ? { ...m, points: Math.max(0, (m.points ?? 500) - 10) } : m));
        setNotice("15 minutes reached — 10 points deducted from your balance.");
        setGame(null);
      })();
    }
  }, [elapsed, game, penalized]);

  const send = () => {
    if (!text.trim()) return;
    base44.entities.RelaxMessage.create({ text: text.trim(), sender_name: me?.display_name || me?.full_name || "Me" });
    setText("");
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const remaining = LIMIT - elapsed;
  const mine = (m) => m.sender_name === (me?.display_name || me?.full_name || "Me");

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 to-emerald-50/20 dark:bg-none dark:bg-background lg:flex-row">
      {/* Chat */}
      <div className="flex w-full flex-col border-b border-border lg:w-1/2 lg:border-b-0 lg:border-r">
        <div className="border-b border-border bg-background/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground"><T k="relak.chatTitle" /></h2>
        </div>
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">Chill chat is empty — say hi!</p>
          ) : messages.map((m) => (
            <div key={m.id} className={`flex ${mine(m) ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine(m) ? "bg-emerald-500 text-white" : "border border-border bg-background"}`}>
                {!mine(m) && <p className="mb-0.5 text-[10px] font-medium text-muted-foreground">{m.sender_name}</p>}
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-background px-3 py-3">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }} placeholder="Relax message…" className="flex-1 rounded-full border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-background" />
          <button onClick={send} disabled={!text.trim()} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Games */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Gamepad2 className="h-4 w-4 text-emerald-500" /><T k="relak.games" /></h2>
          {game && <span className={`font-mono text-xs ${remaining <= 60 ? "text-[#FF4D00]" : "text-muted-foreground"}`}>{fmt(Math.max(0, remaining))}</span>}
        </div>

        {notice && <p className="bg-orange-50 px-4 py-2 text-xs text-[#CC3D00]">{notice}</p>}

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {!game ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button onClick={() => setGame("ttt")} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md">
                <Grid3x3 className="h-8 w-8 text-[#FF4D00]" />
                <span className="text-sm font-medium text-foreground">Tic-Tac-Toe</span>
                <span className="text-[11px] text-muted-foreground">2 players</span>
              </button>
              <button onClick={() => setGame("memory")} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md">
                <Brain className="h-8 w-8 text-fuchsia-500" />
                <span className="text-sm font-medium text-foreground">Memory Match</span>
                <span className="text-[11px] text-muted-foreground">Solo</span>
              </button>
              <button onClick={() => setGame("puzzle")} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md">
                <Puzzle className="h-8 w-8 text-[#FF4D00]" />
                <span className="text-sm font-medium text-foreground">Sliding Puzzle</span>
                <span className="text-[11px] text-muted-foreground">Solo</span>
              </button>
              <button onClick={() => setGame("whack")} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md">
                <Hammer className="h-8 w-8 text-[#FF4D00]" />
                <span className="text-sm font-medium text-foreground">Whack-a-Mole</span>
                <span className="text-[11px] text-muted-foreground">30s round</span>
              </button>
              <button onClick={() => setGame("snake")} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md">
                <Worm className="h-8 w-8 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">Snake Game</span>
                <span className="text-[11px] text-muted-foreground">Classic</span>
              </button>
              <button onClick={() => setGame("color")} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md">
                <Palette className="h-8 w-8 text-[#FF4D00]" />
                <span className="text-sm font-medium text-foreground">Color Match</span>
                <span className="text-[11px] text-muted-foreground">Brain teaser</span>
              </button>
              <button onClick={() => setGame("flappy")} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md">
                <Bird className="h-8 w-8 text-sky-500" />
                <span className="text-sm font-medium text-foreground">Flappy Bird</span>
                <span className="text-[11px] text-muted-foreground">Tap to fly</span>
              </button>
              <p className="col-span-full mt-2 text-center text-[11px] text-muted-foreground">Max 15 minutes per game. Exceeding it costs 10 points.</p>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{{ ttt: "Tic-Tac-Toe", memory: "Memory Match", puzzle: "Sliding Puzzle", whack: "Whack-a-Mole", snake: "Snake Game", color: "Color Match", flappy: "Flappy Bird" }[game]}</span>
                <button onClick={() => setGame(null)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">End game</button>
              </div>
              {game === "ttt" && <TicTacToe />}
              {game === "memory" && <MemoryMatch />}
              {game === "puzzle" && <SlidingPuzzle />}
              {game === "whack" && <WhackAMole />}
              {game === "snake" && <SnakeGame />}
              {game === "color" && <ColorMatch />}
              {game === "flappy" && <FlappyBird />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}