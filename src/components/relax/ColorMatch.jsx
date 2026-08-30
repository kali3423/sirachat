import React, { useEffect, useState } from "react";

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
    
    // Create 4 options including correct answer
    const correctAnswer = text.name;
    const wrongAnswers = COLORS.filter(c => c.name !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.name);
    
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
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up - wrong answer
          nextRound(false);
          return TIME_LIMIT;
        }
        return t - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [running, gameOver, timeLeft]);

  const nextRound = (correct) => {
    if (correct) {
      setScore((s) => s + 1);
    }
    
    if (round + 1 >= ROUNDS) {
      setGameOver(true);
      setRunning(false);
    } else {
      setRound((r) => r + 1);
    }
  };

  const handleAnswer = (answer) => {
    if (!running || gameOver) return;
    const correct = answer === textColor.name;
    nextRound(correct);
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
        <div className="mb-6 rounded-2xl border-2 border-[#FF4D00] bg-gradient-to-br from-orange-50 to-orange-100 p-8 dark:from-orange-950/20 dark:to-orange-900/20">
          <h3 className="mb-2 text-lg font-bold text-foreground">Color Match Challenge</h3>
          <p className="text-sm text-muted-foreground">
            Click the color of the TEXT, not the word!
          </p>
          <div className="mt-4">
            <p className="mb-2 text-xs text-muted-foreground">Example:</p>
            <p style={{ color: "#ef4444" }} className="text-2xl font-bold">
              Blue
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Answer: Red (color of the text)
            </p>
          </div>
        </div>
        <button
          onClick={startGame}
          className="w-full rounded-xl bg-gradient-to-r from-[#FF4D00] to-[#FF6B2C] py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 rounded-2xl border-2 border-[#FF4D00] bg-gradient-to-br from-orange-50 to-orange-100 p-8 dark:from-orange-950/20 dark:to-orange-900/20">
          <h3 className="mb-2 text-xl font-bold text-foreground">Game Over!</h3>
          <p className="text-4xl font-bold text-[#FF4D00]">{score}/{ROUNDS}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {score >= 8 ? "Excellent!" : score >= 5 ? "Good job!" : "Keep practicing!"}
          </p>
        </div>
        <button
          onClick={startGame}
          className="w-full rounded-xl bg-gradient-to-r from-[#FF4D00] to-[#FF6B2C] py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Round {round + 1}/{ROUNDS} • Score: {score}
        </p>
        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
            style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
          />
        </div>
      </div>

      {wordColor && textColor && (
        <>
          <div className="mb-6 rounded-2xl border-2 border-[#FF4D00] bg-gradient-to-br from-orange-50 to-orange-100 p-8 text-center dark:from-orange-950/20 dark:to-orange-900/20">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              What color is this text?
            </p>
            <p
              style={{ color: textColor.value }}
              className="text-5xl font-bold"
            >
              {wordColor.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="rounded-xl border-2 border-[#FF4D00] bg-white py-4 text-sm font-bold text-foreground transition-all hover:bg-[#FF4D00] hover:text-white dark:bg-gray-800"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
