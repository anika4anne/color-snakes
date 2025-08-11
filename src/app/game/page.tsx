"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; color: string; life: number }>
  >([]);
  const [rainbowMode] = useState(true);
  const [colorMode, setColorMode] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

  const directionRef = useRef(direction);
  const foodRef = useRef(food);
  const gameOverRef = useRef(gameOver);
  const gameStartedRef = useRef(gameStarted);
  const highScoreRef = useRef(highScore);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const BOARD_SIZE = 60;
  const CELL_SIZE = Math.min(windowSize.width, windowSize.height) / BOARD_SIZE;

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    setFood(newFood);
  }, []);

  const createParticles = useCallback(
    (x: number, y: number) => {
      const colors = [
        "#ff0080",
        "#ff4000",
        "#ff8000",
        "#ffbf00",
        "#ffff00",
        "#bfff00",
        "#80ff00",
        "#40ff00",
        "#00ff00",
        "#00ff40",
        "#00ff80",
        "#00ffbf",
        "#00ffff",
        "#00bfff",
        "#0080ff",
        "#0040ff",
        "#0000ff",
        "#4000ff",
        "#8000ff",
        "#bf00ff",
        "#ff00ff",
        "#ff00bf",
        "#ff0080",
        "#ff0040",
      ];
      const newParticles = Array.from({ length: 16 }, (_, i) => ({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        color: colors[i % colors.length] ?? "#ff0080",
        life: 40,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
    },
    [CELL_SIZE],
  );

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
    setParticles([]);
    generateFood();
  };

  const moveSnake = useCallback(() => {
    if (
      gameOverRef.current ||
      !gameStartedRef.current ||
      !directionRef.current
    ) {
      return;
    }

    setSnake((prevSnake) => {
      if (prevSnake.length === 0) {
        return prevSnake;
      }

      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      if (typeof head.x !== "number" || typeof head.y !== "number") {
        return prevSnake;
      }

      switch (directionRef.current) {
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
        default:
          return prevSnake;
      }

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        createParticles(foodRef.current.x, foodRef.current.y);
        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore > highScoreRef.current) {
            setHighScore(newScore);
            localStorage.setItem("snakeHighScore", newScore.toString());
          }
          return newScore;
        });
        generateFood();
        // Add new head and keep all existing segments (snake grows)
        newSnake.unshift({ x: head.x, y: head.y });
      } else {
        // Remove tail and add new head (snake moves without growing)
        newSnake.pop();
        newSnake.unshift({ x: head.x, y: head.y });
      }

      if (
        newSnake
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
        return prevSnake;
      }

      return newSnake;
    });
  }, [generateFood, createParticles]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStartedRef.current && e.key !== " ") return;

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
  }, [gameStartedRef]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (gameStartedRef.current && !gameOverRef.current) {
      const interval = setInterval(() => {
        moveSnake();
      }, 150);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver, moveSnake]);

  useEffect(() => {
    const particleInterval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({ ...p, life: p.life - 1 })).filter((p) => p.life > 0),
      );
    }, 50);
    return () => clearInterval(particleInterval);
  }, []);

  // Rainbow mode is always on - no more switching!
  // useEffect(() => {
  //   const rainbowInterval = setInterval(() => {
  //     setRainbowMode((prev) => !prev);
  //   }, 1500);
  //   return () => clearInterval(rainbowInterval);
  // }, []);

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setColorMode((prev) => (prev + 1) % 6);
    }, 1000);
    return () => clearInterval(colorInterval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake
      .slice(1)
      .some((segment) => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    if (isSnakeHead) {
      const headGradients = [
        "bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400",
        "bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400",
        "bg-gradient-to-r from-green-400 via-blue-400 to-purple-400",
        "bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400",
        "bg-gradient-to-r from-purple-400 via-pink-400 to-red-400",
        "bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400",
      ];
      const headColor = rainbowMode
        ? headGradients[colorMode]
        : "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400";
      return (
        <div
          key={`${x}-${y}`}
          className={`h-5 w-5 rounded-full border-2 border-yellow-400 ${headColor} animate-pulse shadow-lg shadow-yellow-400/50`}
        />
      );
    }
    if (isSnakeBody) {
      const bodyColorSchemes = [
        [
          "bg-pink-500",
          "bg-purple-500",
          "bg-blue-500",
          "bg-cyan-500",
          "bg-green-500",
          "bg-yellow-500",
          "bg-orange-500",
          "bg-red-500",
        ],
        [
          "bg-red-500",
          "bg-pink-500",
          "bg-purple-500",
          "bg-indigo-500",
          "bg-blue-500",
          "bg-cyan-500",
          "bg-teal-500",
          "bg-green-500",
        ],
        [
          "bg-green-500",
          "bg-emerald-500",
          "bg-teal-500",
          "bg-cyan-500",
          "bg-blue-500",
          "bg-indigo-500",
          "bg-purple-500",
          "bg-pink-500",
        ],
        [
          "bg-yellow-500",
          "bg-orange-500",
          "bg-red-500",
          "bg-pink-500",
          "bg-purple-500",
          "bg-indigo-500",
          "bg-blue-500",
          "bg-cyan-500",
        ],
        [
          "bg-purple-500",
          "bg-pink-500",
          "bg-red-500",
          "bg-orange-500",
          "bg-yellow-500",
          "bg-lime-500",
          "bg-green-500",
          "bg-emerald-500",
        ],
        [
          "bg-blue-500",
          "bg-indigo-500",
          "bg-purple-500",
          "bg-pink-500",
          "bg-red-500",
          "bg-orange-500",
          "bg-yellow-500",
          "bg-green-500",
        ],
      ];
      const colors = rainbowMode
        ? (bodyColorSchemes[colorMode] ?? bodyColorSchemes[0])
        : ["bg-green-500", "bg-emerald-500", "bg-teal-500"];
      const colorIndex = (x + y + colorMode) % (colors?.length ?? 1);
      return (
        <div
          key={`${x}-${y}`}
          className={`h-5 w-5 rounded ${colors?.[colorIndex] ?? "bg-green-500"} shadow-md shadow-black/30`}
        />
      );
    }
    if (isFood) {
      const foodGradients = [
        "bg-gradient-to-r from-red-500 to-pink-500",
        "bg-gradient-to-r from-orange-500 to-yellow-500",
        "bg-gradient-to-r from-green-500 to-emerald-500",
        "bg-gradient-to-r from-blue-500 to-cyan-500",
        "bg-gradient-to-r from-purple-500 to-pink-500",
        "bg-gradient-to-r from-yellow-500 to-orange-500",
      ];
      const gradient = foodGradients[colorMode];
      return (
        <div
          key={`${x}-${y}`}
          className={`h-5 w-5 animate-bounce rounded-full ${gradient} border-2 border-white/30 shadow-lg shadow-white/50`}
        />
      );
    }
    const backgroundGradients = [
      "bg-gradient-to-br from-gray-800 to-gray-900",
      "bg-gradient-to-br from-slate-800 to-slate-900",
      "bg-gradient-to-br from-zinc-800 to-zinc-900",
      "bg-gradient-to-br from-neutral-800 to-neutral-900",
      "bg-gradient-to-br from-stone-800 to-stone-900",
      "bg-gradient-to-br from-gray-700 to-gray-800",
    ];
    const bgGradient = backgroundGradients[colorMode];
    return (
      <div
        key={`${x}-${y}`}
        className={`h-5 w-5 border border-gray-600 ${bgGradient}`}
      />
    );
  };

  return (
    <main className="relative flex h-screen w-screen flex-col overflow-hidden p-0 text-white">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200"></div>
      <div className="animation-delay-1000 absolute inset-0 animate-pulse bg-gradient-to-br from-blue-200 via-cyan-200 to-green-200"></div>
      <div className="animation-delay-2000 absolute inset-0 animate-pulse bg-gradient-to-br from-green-200 via-yellow-200 to-orange-200"></div>
      <div className="animation-delay-3000 absolute inset-0 animate-pulse bg-gradient-to-br from-orange-200 via-red-200 to-pink-200"></div>
      <div className="absolute top-2 left-2 z-10 text-center">
        <div className="rounded-lg bg-black/60 p-4 shadow-lg backdrop-blur-sm">
          <h1 className="mb-0 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-lg font-bold text-transparent">
            Snake Game
          </h1>
          <div className="flex gap-2 text-xs">
            <div>
              Score: <span className="font-bold text-green-400">{score}</span>
            </div>
            <div>
              High Score:{" "}
              <span className="font-bold text-yellow-400">{highScore}</span>
            </div>
            <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text font-bold text-transparent">
              RAINBOW MODE
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-300">
            Status:{" "}
            {gameStarted ? (gameOver ? "GAME OVER" : "PLAYING") : "WAITING"} |
            Direction: {direction} | Snake Length: {snake.length}
          </div>
        </div>
      </div>

      <div className="flex h-full w-full items-center justify-center">
        <div className="relative h-full w-full">
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {Array.from({ length: BOARD_SIZE }, (_, y) =>
              Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y)),
            )}
          </div>

          {particles.map((particle, index) => (
            <div
              key={index}
              className="absolute h-2 w-2 animate-ping rounded-full"
              style={{
                left: particle.x - 4,
                top: particle.y - 4,
                backgroundColor: particle.color,
                opacity: particle.life / 40,
                transform: `scale(${1 + (40 - particle.life) / 40})`,
              }}
            />
          ))}
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transform text-center">
          <div className="rounded-lg bg-black/60 p-6 shadow-lg backdrop-blur-sm">
            <p className="mb-2 text-lg font-bold text-white">
              Press SPACE to start
            </p>
            <p className="text-sm text-gray-300">
              Use arrow keys or WASD to move
            </p>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="mb-1 text-center">
          <h2 className="mb-0 text-lg font-bold text-red-400">Game Over!</h2>
          <p className="mb-0 text-sm">
            Final Score: <span className="text-green-400">{score}</span>
          </p>
          <button
            onClick={resetGame}
            className="mr-1 rounded bg-green-600 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-green-700"
          >
            Play Again
          </button>
        </div>
      )}
    </main>
  );
}
