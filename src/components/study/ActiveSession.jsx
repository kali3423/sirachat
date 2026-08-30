import React, { useEffect, useState } from "react";
import { Coffee, LogOut, Timer as TimerIcon } from "lucide-react";

export default function ActiveSession({ meet, onBreak, onQuit, busy }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!meet?.started_at) return;
    const tick = () => setElapsed(Date.now() - new Date(meet.started_at).getTime());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [meet?.started_at]);

  const fmt = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${h ? h + ":" : ""}${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  if (!meet) return null;
  const plannedEnd = meet.date && meet.end_time ? new Date(`${meet.date}T${meet.end_time}`) : null;
  const remainingMs = plannedEnd ? plannedEnd.getTime() - Date.now() : 0;
  const overtime = remainingMs < 0;

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950 to-amber-950 p-6 text-white shadow-xl shadow-[#FF4D00]/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur">
            <TimerIcon className="h-3 w-3" /> Live study session
          </span>
          <h2 className="mt-2 truncate text-xl font-bold tracking-tight">{meet.subject}</h2>
          <p className="text-xs text-amber-200">{meet.date} · {meet.start_time} – {meet.end_time}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-amber-300">Elapsed</p>
          <p className="font-mono text-4xl font-bold tabular-nums">{fmt(elapsed)}</p>
          {plannedEnd && (
            <p className={`mt-0.5 text-[11px] ${overtime ? "text-amber-300" : "text-amber-300"}`}>
              {overtime ? `+${fmt(-remainingMs)} over` : `${fmt(remainingMs)} left`}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button onClick={onBreak} disabled={busy} className="flex flex-col items-center gap-0.5 rounded-2xl bg-orange-500/90 py-3 text-sm font-semibold transition hover:bg-amber-400 disabled:opacity-60">
          <Coffee className="h-4 w-4" /> Break
          <span className="text-[10px] font-normal opacity-90">−10 / 10 min</span>
        </button>
        <button onClick={onQuit} disabled={busy} className="flex flex-col items-center gap-0.5 rounded-2xl bg-orange-500/90 py-3 text-sm font-semibold transition hover:bg-amber-400 disabled:opacity-60">
          <LogOut className="h-4 w-4" /> Quit
          <span className="text-[10px] font-normal opacity-90">−100 pts</span>
        </button>
      </div>
    </div>
  );
}