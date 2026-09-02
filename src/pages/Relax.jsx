import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import TicTacToe from "@/components/relax/TicTacToe";
import MemoryMatch from "@/components/relax/MemoryMatch";
import SlidingPuzzle from "@/components/relax/SlidingPuzzle";
import WhackAMole from "@/components/relax/WhackAMole";
import SnakeGame from "@/components/relax/SnakeGame";
import ColorMatch from "@/components/relax/ColorMatch";
import FlappyBird from "@/components/relax/FlappyBird";
import { Send, Gamepad2, Grid3x3, Brain, Puzzle, Hammer, Worm, Palette, Bird } from "lucide-react";
import { cn } from "@/lib/utils";

const LIMIT = 15 * 60;

const GAMES = [
  { key: "ttt", subKey: "twoPlayers", icon: Grid3x3, tone: "text-primary" },
  { key: "memory", subKey: "solo", icon: Brain, tone: "text-focus" },
  { key: "puzzle", subKey: "solo", icon: Puzzle, tone: "text-scheduled" },
  { key: "whack", subKey: "round30", icon: Hammer, tone: "text-warning" },
  { key: "snake", subKey: "classic", icon: Worm, tone: "text-success" },
  { key: "color", subKey: "brainTeaser", icon: Palette, tone: "text-danger" },
  { key: "flappy", subKey: "tapToFly", icon: Bird, tone: "text-scheduled" },
];

export default function Relax() {
  const { t } = useI18n();
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
        setNotice(t("relak.penalty"));
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
    <div className="flex h-full flex-col bg-background lg:flex-row">
      {/* Chill chat */}
      <div className="flex min-h-0 w-full flex-col border-b border-border lg:w-1/2 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 border-b border-border bg-card/80 px-4 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/12 text-success">💬</span>
          <h2 className="text-sm font-bold text-foreground">{t("relak.chatTitle")}</h2>
        </div>
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4 scrollbar-thin">
          {messages.length === 0 ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">{t("relak.chatEmpty")}</p>
          ) : messages.map((m) => (
            <div key={m.id} className={cn("flex", mine(m) ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                mine(m) ? "rounded-br-md bg-success text-white" : "rounded-bl-md border border-border bg-card text-foreground"
              )}>
                {!mine(m) && <p className="mb-0.5 text-[10px] font-semibold text-muted-foreground">{m.sender_name}</p>}
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-3 pb-safe">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
            placeholder={t("relak.messagePh")}
            className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-success/50"
          />
          <button onClick={send} disabled={!text.trim()} className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white shadow-sm transition hover:brightness-95 disabled:opacity-40 press">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Games */}
      <div className="flex min-h-0 w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Gamepad2 className="h-4 w-4 text-success" /> {t("relak.games")}
          </h2>
          {game && <span className={cn("font-mono text-xs tabnums", remaining <= 60 ? "text-danger" : "text-muted-foreground")}>{fmt(Math.max(0, remaining))}</span>}
        </div>

        {notice && <p className="bg-warning/15 px-4 py-2 text-xs font-medium text-warning">{notice}</p>}

        <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
          {!game ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GAMES.map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.key}
                    onClick={() => setGame(g.key)}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-success/40 hover:shadow-soft press"
                  >
                    <Icon className={cn("h-8 w-8", g.tone)} />
                    <span className="text-sm font-semibold text-foreground">{t(`relak.names.${g.key}`)}</span>
                    <span className="text-[11px] text-muted-foreground">{t(`relak.${g.subKey}`)}</span>
                  </button>
                );
              })}
              <p className="col-span-full mt-2 text-center text-[11px] text-muted-foreground">{t("relak.maxTime")}</p>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{t(`relak.names.${game}`)}</span>
                <button onClick={() => setGame(null)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted press">{t("relak.endGame")}</button>
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
