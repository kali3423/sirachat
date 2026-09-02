import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

const HOLES = 9;
const ROUND = 30;

export default function WhackAMole() {
  const { t } = useI18n();
  const [mole, setMole] = useState(-1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const moleTimer = useRef(null);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => setTime((t2) => t2 + 1), 1000);
    return () => clearInterval(tick);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const pop = () => {
      setMole(Math.floor(Math.random() * HOLES));
      moleTimer.current = setTimeout(pop, 600 + Math.random() * 500);
    };
    pop();
    return () => clearTimeout(moleTimer.current);
  }, [running]);

  useEffect(() => {
    if (running && time >= ROUND) setRunning(false);
  }, [time, running]);

  const start = () => { setScore(0); setTime(0); setMole(-1); setRunning(true); };
  const whack = (i) => { if (running && i === mole) { setScore((s) => s + 1); setMole(-1); } };
  const over = !running && time >= ROUND;
  const label = over ? t("relak.g.whacked", { n: score }) : running ? t("relak.g.playState", { n: ROUND - time, s: score }) : t("relak.g.ready");

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-3 text-center text-sm font-semibold text-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: HOLES }, (_, i) => (
          <button
            key={i}
            onClick={() => whack(i)}
            className="relative flex h-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/40 bg-primary-soft transition-all hover:shadow-soft active:scale-95"
          >
            {running && mole === i ? (
              <img
                src="https://i.postimg.cc/QdZ0XJM2/Chat-GPT-Image-30-aout-2026-01-09-21.png"
                alt="Target"
                className="h-16 w-16 animate-bounce rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/80">
                <div className="h-6 w-6 rounded-full bg-foreground"></div>
              </div>
            )}
          </button>
        ))}
      </div>
      <button onClick={start} className="press mt-4 w-full rounded-xl bg-sira py-3 text-sm font-bold text-white shadow-accent transition-all hover:brightness-105">
        {over ? t("relak.g.playAgain") : t("relak.g.start")}
      </button>
    </div>
  );
}
