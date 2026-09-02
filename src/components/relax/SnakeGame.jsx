import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [[10, 10]];
const INITIAL_DIRECTION = { x: 1, y: 0 };

export default function SnakeGame() {
  const { t } = useI18n();
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const directionRef = useRef(INITIAL_DIRECTION);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (!running || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = [
          head[0] + directionRef.current.x,
          head[1] + directionRef.current.y,
        ];

        if (
          newHead[0] < 0 ||
          newHead[0] >= GRID_SIZE ||
          newHead[1] < 0 ||
          newHead[1] >= GRID_SIZE
        ) {
          setGameOver(true);
          setRunning(false);
          return prevSnake;
        }

        if (prevSnake.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
          setGameOver(true);
          setRunning(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((s) => s + 10);
          setFood([
            Math.floor(Math.random() * GRID_SIZE),
            Math.floor(Math.random() * GRID_SIZE),
          ]);
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [running, gameOver, food]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!running) return;

      const { x, y } = directionRef.current;

      if (e.key === "ArrowUp" && y === 0) {
        setDirection({ x: 0, y: -1 });
      } else if (e.key === "ArrowDown" && y === 0) {
        setDirection({ x: 0, y: 1 });
      } else if (e.key === "ArrowLeft" && x === 0) {
        setDirection({ x: -1, y: 0 });
      } else if (e.key === "ArrowRight" && x === 0) {
        setDirection({ x: 1, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [running]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood([15, 15]);
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("relak.g.scoreN", { n: score })}</p>
        {gameOver && <p className="text-sm font-bold text-danger">{t("relak.g.gameOver")}</p>}
      </div>

      <div
        className="mx-auto rounded-2xl border-2 border-primary/40 bg-primary-soft p-2 shadow-soft"
        style={{
          width: GRID_SIZE * CELL_SIZE + 16,
          height: GRID_SIZE * CELL_SIZE + 16,
        }}
      >
        <div className="relative" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
          {snake.map(([x, y], i) => (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)",
              }}
            />
          ))}

          <div
            className="absolute animate-pulse rounded-full"
            style={{
              left: food[0] * CELL_SIZE,
              top: food[1] * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: "hsl(var(--success))",
            }}
          />
        </div>
      </div>

      <button
        onClick={startGame}
        className="press mt-4 w-full rounded-xl bg-sira py-3 text-sm font-bold text-white shadow-accent transition-all hover:brightness-105"
      >
        {gameOver ? t("relak.g.playAgain") : running ? t("relak.g.restart") : t("relak.g.startGame")}
      </button>

      {!running && (
        <p className="mt-2 text-center text-xs text-muted-foreground">{t("relak.g.snakeHint")}</p>
      )}
    </div>
  );
}
