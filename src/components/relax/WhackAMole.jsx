import React, { useEffect, useRef, useState } from "react";

const HOLES = 9;
const ROUND = 30;

export default function WhackAMole() {
  const [mole, setMole] = useState(-1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const moleTimer = useRef(null);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => setTime((t) => t + 1), 1000);
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
  const label = over ? `Time! You whacked ${score}` : running ? `${ROUND - time}s · Score ${score}` : `Ready? 30-second round`;

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-3 text-center text-sm font-medium text-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: HOLES }, (_, i) => (
          <button 
            key={i} 
            onClick={() => whack(i)} 
            className="relative flex h-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#FF4D00] bg-gradient-to-br from-orange-50 to-orange-100 transition-all hover:shadow-lg active:scale-95 dark:from-orange-950/20 dark:to-orange-900/20"
          >
            {running && mole === i ? (
              <img 
                src="https://i.postimg.cc/QdZ0XJM2/Chat-GPT-Image-30-aout-2026-01-09-21.png" 
                alt="Target" 
                className="h-16 w-16 animate-bounce rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 dark:bg-gray-700">
                <div className="h-6 w-6 rounded-full bg-gray-900 dark:bg-gray-600"></div>
              </div>
            )}
          </button>
        ))}
      </div>
      <button onClick={start} className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#FF4D00] to-[#FF6B2C] py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl">
        {over ? "Play again" : "Start"}
      </button>
    </div>
  );
}