export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Difficulty = "easy" | "medium" | "hard";
export type GameStatus = "idle" | "playing" | "paused" | "gameover";

export interface Position {
  x: number;
  y: number;
}

export interface ScoreEntry {
  id: string;
  game: "snake" | "tetris";
  score: number;
  difficulty: Difficulty;
  playerName: string;
  date: string;
}

export interface Theme {
  id: string;
  name: string;
  background: string;
  board: string;
  snake: string;
  snakeHead: string;
  food: string;
  tetromino: Record<string, string>;
  text: string;
  accent: string;
  border: string;
}

export interface DifficultyConfig {
  label: string;
  snakeSpeed: number;
  tetrisSpeed: number;
  scoreMultiplier: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    snakeSpeed: 150,
    tetrisSpeed: 800,
    scoreMultiplier: 1,
  },
  medium: {
    label: "Medium",
    snakeSpeed: 100,
    tetrisSpeed: 500,
    scoreMultiplier: 1.5,
  },
  hard: {
    label: "Hard",
    snakeSpeed: 60,
    tetrisSpeed: 250,
    scoreMultiplier: 2,
  },
};

export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Classic",
    background: "bg-gray-900",
    board: "bg-gray-800",
    snake: "bg-green-500",
    snakeHead: "bg-green-300",
    food: "bg-red-500",
    tetromino: {
      I: "bg-cyan-400",
      O: "bg-yellow-400",
      T: "bg-purple-500",
      S: "bg-green-500",
      Z: "bg-red-500",
      J: "bg-blue-500",
      L: "bg-orange-500",
    },
    text: "text-white",
    accent: "text-green-400",
    border: "border-gray-600",
  },
  {
    id: "neon",
    name: "Neon",
    background: "bg-black",
    board: "bg-gray-950",
    snake: "bg-pink-500",
    snakeHead: "bg-pink-200",
    food: "bg-yellow-400",
    tetromino: {
      I: "bg-cyan-300",
      O: "bg-yellow-300",
      T: "bg-fuchsia-400",
      S: "bg-lime-400",
      Z: "bg-rose-400",
      J: "bg-blue-400",
      L: "bg-orange-400",
    },
    text: "text-pink-100",
    accent: "text-pink-400",
    border: "border-pink-800",
  },
  {
    id: "forest",
    name: "Forest",
    background: "bg-green-950",
    board: "bg-green-900",
    snake: "bg-emerald-400",
    snakeHead: "bg-emerald-200",
    food: "bg-amber-500",
    tetromino: {
      I: "bg-teal-400",
      O: "bg-amber-400",
      T: "bg-emerald-400",
      S: "bg-lime-500",
      Z: "bg-red-400",
      J: "bg-sky-400",
      L: "bg-orange-400",
    },
    text: "text-green-100",
    accent: "text-emerald-400",
    border: "border-green-700",
  },
  {
    id: "ocean",
    name: "Ocean",
    background: "bg-blue-950",
    board: "bg-blue-900",
    snake: "bg-sky-400",
    snakeHead: "bg-sky-200",
    food: "bg-coral-400",
    tetromino: {
      I: "bg-sky-300",
      O: "bg-yellow-300",
      T: "bg-indigo-400",
      S: "bg-teal-400",
      Z: "bg-rose-400",
      J: "bg-blue-300",
      L: "bg-amber-400",
    },
    text: "text-blue-100",
    accent: "text-sky-400",
    border: "border-blue-700",
  },
];
