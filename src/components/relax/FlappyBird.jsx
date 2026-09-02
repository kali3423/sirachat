import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;

export default function FlappyBird() {
  const { t } = useI18n();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);

  const gameStateRef = useRef({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [],
    frameCount: 0,
  });

  const jump = () => {
    if (!running) {
      startGame();
      return;
    }
    if (!gameOver) {
      gameStateRef.current.birdVelocity = JUMP_STRENGTH;
    }
  };

  const startGame = () => {
    gameStateRef.current = {
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [{ x: CANVAS_WIDTH, passed: false }],
      frameCount: 0,
    };
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  useEffect(() => {
    if (!running || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const gameLoop = () => {
      const state = gameStateRef.current;
      state.frameCount++;

      state.birdVelocity += GRAVITY;
      state.birdY += state.birdVelocity;

      if (state.frameCount % 90 === 0) {
        const pipeHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
        state.pipes.push({ x: CANVAS_WIDTH, height: pipeHeight, passed: false });
      }

      state.pipes.forEach((pipe) => {
        pipe.x -= 3;
        if (!pipe.passed && pipe.x + PIPE_WIDTH < CANVAS_WIDTH / 2) {
          pipe.passed = true;
          setScore((s) => s + 1);
        }
      });

      state.pipes = state.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);

      const birdX = CANVAS_WIDTH / 2;
      const birdTop = state.birdY;
      const birdBottom = state.birdY + BIRD_SIZE;

      if (birdTop < 0 || birdBottom > CANVAS_HEIGHT) {
        setGameOver(true);
        setRunning(false);
        return;
      }

      for (const pipe of state.pipes) {
        if (
          birdX + BIRD_SIZE > pipe.x &&
          birdX < pipe.x + PIPE_WIDTH &&
          (birdTop < pipe.height || birdBottom > pipe.height + PIPE_GAP)
        ) {
          setGameOver(true);
          setRunning(false);
          return;
        }
      }

      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#FF4D00";
      ctx.fillRect(birdX, state.birdY, BIRD_SIZE, BIRD_SIZE);
      ctx.fillStyle = "#fff";
      ctx.fillRect(birdX + 5, state.birdY + 8, 8, 8);
      ctx.fillStyle = "#000";
      ctx.fillRect(birdX + 7, state.birdY + 10, 4, 4);

      ctx.fillStyle = "#10b981";
      state.pipes.forEach((pipe) => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.height);
        ctx.fillRect(
          pipe.x,
          pipe.height + PIPE_GAP,
          PIPE_WIDTH,
          CANVAS_HEIGHT - pipe.height - PIPE_GAP
        );
        ctx.fillStyle = "#059669";
        ctx.fillRect(pipe.x - 5, pipe.height - 20, PIPE_WIDTH + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.height + PIPE_GAP, PIPE_WIDTH + 10, 20);
        ctx.fillStyle = "#10b981";
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationId);
  }, [running, gameOver]);

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("relak.g.scoreN", { n: score })}</p>
        {gameOver && <p className="text-sm font-bold text-danger">{t("relak.g.gameOver")}</p>}
      </div>

      <div
        onClick={jump}
        className="mx-auto cursor-pointer overflow-hidden rounded-2xl border-2 border-primary/40 shadow-soft"
      >
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full" />
      </div>

      <button
        onClick={startGame}
        className="press mt-4 w-full rounded-xl bg-sira py-3 text-sm font-bold text-white shadow-accent transition-all hover:brightness-105"
      >
        {gameOver ? t("relak.g.playAgain") : running ? t("relak.g.restart") : t("relak.g.startGame")}
      </button>

      <p className="mt-2 text-center text-xs text-muted-foreground">{t("relak.g.flappyHint")}</p>
    </div>
  );
}
