"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { Direction, Difficulty, GameStatus, Position, DIFFICULTIES } from "@/types";
import { calculateScore } from "@/lib/scoreManager";

export const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

interface SnakeState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  status: GameStatus;
  level: number;
  foodEaten: number;
}

type SnakeAction =
  | { type: "SET_DIRECTION"; direction: Direction }
  | { type: "TICK" }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" };

function randomFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

function snakeReducer(state: SnakeState, action: SnakeAction): SnakeState {
  switch (action.type) {
    case "SET_DIRECTION": {
      const { direction } = action;
      const opposite: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };
      if (opposite[direction] === state.direction) return state;
      return { ...state, nextDirection: direction };
    }

    case "TICK": {
      if (state.status !== "playing") return state;

      const dir = state.nextDirection;
      const head = state.snake[0];
      const delta: Record<Direction, Position> = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
      };

      const newHead = {
        x: (head.x + delta[dir].x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + delta[dir].y + GRID_SIZE) % GRID_SIZE,
      };

      // Self collision
      if (state.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
        return { ...state, status: "gameover" };
      }

      const ateFood =
        newHead.x === state.food.x && newHead.y === state.food.y;
      const newSnake = ateFood
        ? [newHead, ...state.snake]
        : [newHead, ...state.snake.slice(0, -1)];

      const foodEaten = ateFood ? state.foodEaten + 1 : state.foodEaten;
      const level = Math.floor(foodEaten / 5) + 1;

      return {
        ...state,
        snake: newSnake,
        food: ateFood ? randomFood(newSnake) : state.food,
        direction: dir,
        score: ateFood ? state.score + 10 * level : state.score,
        foodEaten,
        level,
      };
    }

    case "START":
      return { ...state, status: "playing" };

    case "PAUSE":
      return { ...state, status: state.status === "playing" ? "paused" : state.status };

    case "RESUME":
      return { ...state, status: state.status === "paused" ? "playing" : state.status };

    case "RESET": {
      const snake = INITIAL_SNAKE;
      return {
        snake,
        food: randomFood(snake),
        direction: "RIGHT",
        nextDirection: "RIGHT",
        score: 0,
        status: "idle",
        level: 1,
        foodEaten: 0,
      };
    }

    default:
      return state;
  }
}

function getInitialState(): SnakeState {
  const snake = INITIAL_SNAKE;
  return {
    snake,
    food: randomFood(snake),
    direction: "RIGHT",
    nextDirection: "RIGHT",
    score: 0,
    status: "idle",
    level: 1,
    foodEaten: 0,
  };
}

export function useSnake(difficulty: Difficulty) {
  const [state, dispatch] = useReducer(snakeReducer, undefined, getInitialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speed = DIFFICULTIES[difficulty].snakeSpeed;

  const tick = useCallback(() => {
    dispatch({ type: "TICK" });
  }, []);

  useEffect(() => {
    if (state.status === "playing") {
      intervalRef.current = setInterval(tick, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.status, speed, tick]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
        W: "UP",
        S: "DOWN",
        A: "LEFT",
        D: "RIGHT",
      };
      if (map[e.key]) {
        e.preventDefault();
        dispatch({ type: "SET_DIRECTION", direction: map[e.key] });
        if (state.status === "idle") dispatch({ type: "START" });
      }
      if (e.key === " " || e.key === "Escape") {
        e.preventDefault();
        if (state.status === "playing") dispatch({ type: "PAUSE" });
        else if (state.status === "paused") dispatch({ type: "RESUME" });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.status]);

  const finalScore = calculateScore(state.score, difficulty, state.level);

  return {
    ...state,
    finalScore,
    start: () => dispatch({ type: "START" }),
    pause: () => dispatch({ type: "PAUSE" }),
    resume: () => dispatch({ type: "RESUME" }),
    reset: () => dispatch({ type: "RESET" }),
    setDirection: (d: Direction) => dispatch({ type: "SET_DIRECTION", direction: d }),
  };
}
