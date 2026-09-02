import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

const ROUNDS = 10;
const TIME_LIMIT = 3;

export default function ColorMatch() {
  const { t } = useI18n();
  const cName = (n) => t(`relak.g.colors.${n}`);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [wordColor, setWordColor] = useState(null);
  const [textColor, setTextColor] = useState(null);
  const [options, setOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const generateRound = () => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const text = COLORS[Math.floor(Math.random() * COLORS.length)];

    const correctAnswer = text.name;
    const wrongAnswers = COLORS.filter((c) => c.name !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => c.name);

    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    setWordColor(word);
    setTextColor(text);
    setOptions(allOptions);
    setTimeLeft(TIME_LIMIT);
  };

  useEffect(() => {
    if (running && !gameOver && round < ROUNDS) {
      generateRound();
    }
  }, [round, running, gameOver]);

  useEffect(() => {
    if (!running || gameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t2) => {
        if (t2 <= 1) {
          nextRound(false);
          return TIME_LIMIT;
        }
        return t2 - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [running, gameOver, timeLeft]);

  const nextRound = (correct) => {
    if (correct) setScore((s) => s + 1);
    if (round + 1 >= ROUNDS) {
      setGameOver(true);
      setRunning(false);
    } else {
      setRound((r) => r + 1);
    }
  };

  const handleAnswer = (answer) => {
    if (!running || gameOver) return;
    nextRound(answer === textColor.name);
  };

  const startGame = () => {
    setScore(0);
    setRound(0);
    setGameOver(false);
    setRunning(true);
  };

  if (!running && !gameOver) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 rounded-2xl border-2 border-primary/40 bg-primary-soft p-8">
          <h3 className="mb-2 text-lg font-bold text-foreground">{t("relak.g.colorTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("relak.g.colorRule")}</p>
          <div className="mt-4">
            <p className="mb-2 text-xs text-muted-foreground">{t("relak.g.example")}</p>
            <p style={{ color: "#ef4444" }} className="text-2xl font-bold">
              {cName("Blue")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("relak.g.exampleAnswer", { c: cName("Red") })}
            </p>
          </div>
        </div>
        <button
          onClick={startGame}
          className="press w-full rounded-xl bg-sira py-3 text-sm font-bold text-white shadow-accent transition-all hover:brightness-105"
        >
          {t("relak.g.startGame")}
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 rounded-2xl border-2 border-primary/40 bg-primary-soft p-8">
          <h3 className="mb-2 text-xl font-bold text-foreground">{t("relak.g.gameOver")}</h3>
          <p className="text-4xl font-extrabold text-primary tabnums">{score}/{ROUNDS}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {score >= 8 ? t("relak.g.excellent") : score >= 5 ? t("relak.g.goodJob") : t("relak.g.keepPracticing")}
          </p>
        </div>
        <button
          onClick={startGame}
          className="press w-full rounded-xl bg-sira py-3 text-sm font-bold text-white shadow-accent transition-all hover:brightness-105"
        >
          {t("relak.g.playAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {t("relak.g.roundScore", { r: round + 1, total: ROUNDS, n: score })}
        </p>
        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-success transition-all"
            style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
          />
        </div>
      </div>

      {wordColor && textColor && (
        <>
          <div className="mb-6 rounded-2xl border-2 border-primary/40 bg-primary-soft p-8 text-center">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("relak.g.whatColor")}</p>
            <p style={{ color: textColor.value }} className="text-5xl font-extrabold">
              {cName(wordColor.name)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="press rounded-xl border-2 border-primary/40 bg-card py-4 text-sm font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              >
                {cName(option)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
