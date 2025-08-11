"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Position = {
  x: number;
  y: number;
};

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const BOARD_SIZE = 40;
  const CELL_SIZE = 30;

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    generateFood();
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case "UP":
          head.y = (head.y - 1 + BOARD_SIZE) % BOARD_SIZE;
          break;
        case "DOWN":
          head.y = (head.y + 1) % BOARD_SIZE;
          break;
        case "LEFT":
          head.x = (head.x - 1 + BOARD_SIZE) % BOARD_SIZE;
          break;
        case "RIGHT":
          head.x = (head.x + 1) % BOARD_SIZE;
          break;
      }

      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("snakeHighScore", newScore.toString());
          }
          return newScore;
        });
        generateFood();
      } else {
        newSnake.pop();
      }

      newSnake.unshift(head);

      if (
        newSnake
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, generateFood, highScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && e.key !== " ") return;

      if (e.key === " ") {
        setGameStarted(true);
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          setDirection((prev) => (prev !== "DOWN" ? "UP" : prev));
          break;
        case "ArrowDown":
        case "s":
        case "S":
          setDirection((prev) => (prev !== "UP" ? "DOWN" : prev));
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          setDirection((prev) => (prev !== "RIGHT" ? "LEFT" : prev));
          break;
        case "ArrowRight":
        case "d":
        case "D":
          setDirection((prev) => (prev !== "LEFT" ? "RIGHT" : prev));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(moveSnake, 150);
      return () => clearInterval(interval);
    }
  }, [moveSnake, gameStarted, gameOver]);

  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake
      .slice(1)
      .some((segment) => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    if (isSnakeHead) {
      return (
        <div
          key={`${x}-${y}`}
          className="h-5 w-5 rounded-full border-2 border-green-600 bg-green-400"
        />
      );
    }
    if (isSnakeBody) {
      return <div key={`${x}-${y}`} className="h-5 w-5 rounded bg-green-500" />;
    }
    if (isFood) {
      return (
        <div
          key={`${x}-${y}`}
          className="h-5 w-5 animate-pulse rounded-full bg-red-500"
        />
      );
    }
    return <div key={`${x}-${y}`} className="h-5 w-5 border border-gray-700" />;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-1 text-white">
      <div className="mb-2 text-center">
        <h1 className="mb-1 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
          Snake Game
        </h1>
        <div className="flex gap-4 text-sm">
          <div>
            Score: <span className="font-bold text-green-400">{score}</span>
          </div>
          <div>
            High Score:{" "}
            <span className="font-bold text-yellow-400">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="mb-2 rounded-lg border-2 border-gray-600 bg-black p-1">
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
          }}
        >
          {Array.from({ length: BOARD_SIZE }, (_, y) =>
            Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y)),
          )}
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="mb-2 text-center">
          <p className="mb-1 text-base">Press SPACEBAR to start</p>
          <p className="text-xs text-gray-300">
            Use arrow keys or WASD to move
          </p>
        </div>
      )}

      {gameOver && (
        <div className="mb-2 text-center">
          <h2 className="mb-1 text-xl font-bold text-red-400">Game Over!</h2>
          <p className="mb-1 text-base">
            Final Score: <span className="text-green-400">{score}</span>
          </p>
          <button
            onClick={resetGame}
            className="mr-2 rounded-lg bg-green-600 px-3 py-1 font-bold text-white transition-colors hover:bg-green-700"
          >
            Play Again
          </button>
        </div>
      )}

      <Link
        href="/"
        className="rounded-lg bg-gray-600 px-3 py-1 font-bold text-white transition-colors hover:bg-gray-700"
      >
        Back to Home
      </Link>
    </main>
  );
}
