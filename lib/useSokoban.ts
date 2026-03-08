"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { Direction, GameStatus, Difficulty } from "@/types";
import { canSolveLevel, solveLevel, generateRandomLevel } from "./sokobanUtils";

// Cell types
export const WALL = "#";
export const FLOOR = " ";
export const GOAL = ".";
export const BOX = "$";
export const PLAYER = "@";
export const BOX_ON_GOAL = "*";
export const PLAYER_ON_GOAL = "+";

export type GameMode = "classic" | "random";

// Level data - classic Sokoban levels
// These are well-known solvable Sokoban levels
export const LEVELS: { name: string; map: string[] }[] = [
  {
    name: "第1关 - 入门",
    map: [
      " ##### ",
      "##   # ",
      "# $ # ",
      "# . # ",
      "# @ # ",
      "##### ",
    ],
  },
  {
    name: "第2关 - 推一推",
    map: [
      "  ##### ",
      "###   # ",
      "# $   # ",
      "#   # # ",
      "# $ . # ",
      "# @ . # ",
      " #####  ",
    ],
  },
  {
    name: "第3关 - 转角",
    map: [
      " #####   ",
      "##  ##   ",
      "#   #    ",
      "# $ #    ",
      "#   ## # ",
      "# $  . # ",
      "# @  . # ",
      " #####   ",
    ],
  },
  {
    name: "第4关 - 迷宫",
    map: [
      "  #####  ",
      "###   #  ",
      "# $ $ #  ",
      "#   # ## ",
      "# .   #  ",
      "# . # #  ",
      "# @   #  ",
      " #####   ",
    ],
  },
  {
    name: "第5关 - 挑战",
    map: [
      "  ###### ",
      "###    # ",
      "# $  $ # ",
      "#   ## # ",
      "#  .   # ",
      "#  .@  # ",
      "###  ### ",
      " ######  ",
    ],
  },
  {
    name: "第6关 - 进阶",
    map: [
      " ######   ",
      "##    #   ",
      "#  $  #   ",
      "# $## ##  ",
      "#   .  #  ",
      "#  .  @#  ",
      "##    ##  ",
      " ######   ",
    ],
  },
  {
    name: "第7关 - 困难",
    map: [
      "  #####   ",
      "###   #   ",
      "# $ $ #   ",
      "#   # ### ",
      "# .   #   ",
      "# . # #   ",
      "#   @ #   ",
      " #####    ",
    ],
  },
  {
    name: "第8关 - 专家",
    map: [
      " #######  ",
      "##     ## ",
      "#  $ $  # ",
      "#  ###  # ",
      "#  . .  # ",
      "#   #   # ",
      "#   @   # ",
      "#######   ",
    ],
  },
];

export interface Position {
  x: number;
  y: number;
}

interface SokobanState {
  mode: GameMode;
  difficulty: Difficulty;
  level: number;
  customLevels: { name: string; map: string[] }[];
  map: string[];
  player: Position;
  boxes: Position[];
  goals: Position[];
  moves: number;
  pushes: number;
  status: GameStatus;
  history: { player: Position; boxes: Position[] }[];
  // Solver related
  solution: string[] | null;
  solutionStep: number;
  isSolving: boolean;
  solveError: string | null;
  showHint: boolean;
}

type SokobanAction =
  | { type: "MOVE"; direction: Direction }
  | { type: "UNDO" }
  | { type: "RESET" }
  | { type: "SET_LEVEL"; level: number }
  | { type: "SET_MODE"; mode: GameMode }
  | { type: "SET_DIFFICULTY"; difficulty: Difficulty }
  | { type: "GENERATE_RANDOM_LEVEL"; levelData: { name: string; map: string[] } }
  | { type: "NEXT_RANDOM_LEVEL"; levelData: { name: string; map: string[] } }
  | { type: "START_SOLVING" }
  | { type: "SET_SOLUTION"; solution: string[] | null }
  | { type: "SET_SOLVE_ERROR"; error: string }
  | { type: "STEP_SOLUTION" }
  | { type: "CLEAR_SOLUTION" }
  | { type: "TOGGLE_HINT" };

function parseLevel(levelData: string[]): {
  map: string[];
  player: Position;
  boxes: Position[];
  goals: Position[];
} {
  const map: string[] = [];
  const boxes: Position[] = [];
  const goals: Position[] = [];
  let player: Position = { x: 0, y: 0 };

  const maxWidth = Math.max(...levelData.map((row) => row.length));

  levelData.forEach((row, y) => {
    let mapRow = "";
    const paddedRow = row.padEnd(maxWidth, " ");

    for (let x = 0; x < paddedRow.length; x++) {
      const cell = paddedRow[x];

      switch (cell) {
        case WALL:
          mapRow += WALL;
          break;
        case FLOOR:
          mapRow += FLOOR;
          break;
        case GOAL:
          mapRow += GOAL;
          goals.push({ x, y });
          break;
        case BOX:
          mapRow += FLOOR;
          boxes.push({ x, y });
          break;
        case PLAYER:
          mapRow += FLOOR;
          player = { x, y };
          break;
        case BOX_ON_GOAL:
          mapRow += GOAL;
          boxes.push({ x, y });
          goals.push({ x, y });
          break;
        case PLAYER_ON_GOAL:
          mapRow += GOAL;
          player = { x, y };
          goals.push({ x, y });
          break;
        default:
          mapRow += FLOOR;
      }
    }
    map.push(mapRow);
  });

  return { map, player, boxes, goals };
}

function getInitialState(mode: GameMode = "classic", difficulty: Difficulty = "easy", level: number = 0, customLevels: { name: string; map: string[] }[] = []): SokobanState {
  let levelData: string[];
  if (mode === "random" && customLevels.length > 0) {
    levelData = customLevels[level]?.map || customLevels[0]?.map || LEVELS[0].map;
  } else {
    levelData = LEVELS[level]?.map || LEVELS[0].map;
  }
  const { map, player, boxes, goals } = parseLevel(levelData);

  return {
    mode,
    difficulty,
    level,
    customLevels,
    map,
    player,
    boxes,
    goals,
    moves: 0,
    pushes: 0,
    status: "idle",
    history: [],
    solution: null,
    solutionStep: 0,
    isSolving: false,
    solveError: null,
    showHint: false,
  };
}

function isWall(map: string[], x: number, y: number): boolean {
  if (y < 0 || y >= map.length) return true;
  if (x < 0 || x >= map[y].length) return true;
  return map[y][x] === WALL;
}

function getBoxAt(boxes: Position[], x: number, y: number): number {
  return boxes.findIndex((b) => b.x === x && b.y === y);
}

function isLevelComplete(boxes: Position[], goals: Position[]): boolean {
  return goals.every((goal) =>
    boxes.some((box) => box.x === goal.x && box.y === goal.y)
  );
}

function sokobanReducer(state: SokobanState, action: SokobanAction): SokobanState {
  switch (action.type) {
    case "MOVE": {
      if (state.status !== "playing" && state.status !== "idle") return state;

      const dir = action.direction;
      const delta: Record<Direction, Position> = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
      };

      const dx = delta[dir].x;
      const dy = delta[dir].y;
      const newX = state.player.x + dx;
      const newY = state.player.y + dy;

      // Check wall
      if (isWall(state.map, newX, newY)) return state;

      const boxIndex = getBoxAt(state.boxes, newX, newY);

      if (boxIndex !== -1) {
        // There's a box - try to push it
        const newBoxX = newX + dx;
        const newBoxY = newY + dy;

        // Check if box can be pushed
        if (isWall(state.map, newBoxX, newBoxY)) return state;
        if (getBoxAt(state.boxes, newBoxX, newBoxY) !== -1) return state;

        // Push the box
        const newBoxes = [...state.boxes];
        newBoxes[boxIndex] = { x: newBoxX, y: newBoxY };

        const complete = isLevelComplete(newBoxes, state.goals);

        return {
          ...state,
          player: { x: newX, y: newY },
          boxes: newBoxes,
          moves: state.moves + 1,
          pushes: state.pushes + 1,
          status: complete ? "gameover" : "playing",
          history: [
            ...state.history,
            { player: state.player, boxes: state.boxes },
          ],
        };
      }

      // No box - just move
      return {
        ...state,
        player: { x: newX, y: newY },
        moves: state.moves + 1,
        status: state.status === "idle" ? "playing" : state.status,
        history: [
          ...state.history,
          { player: state.player, boxes: state.boxes },
        ],
      };
    }

    case "UNDO": {
      if (state.history.length === 0) return state;
      const lastState = state.history[state.history.length - 1];
      return {
        ...state,
        player: lastState.player,
        boxes: lastState.boxes,
        moves: Math.max(0, state.moves - 1),
        pushes: Math.max(0, state.pushes - 1),
        status: "playing",
        history: state.history.slice(0, -1),
      };
    }

    case "RESET":
      return getInitialState(state.mode, state.difficulty, state.level, state.customLevels);

    case "SET_LEVEL":
      return getInitialState(state.mode, state.difficulty, action.level, state.customLevels);

    case "SET_MODE": {
      const newMode = action.mode;
      if (newMode === "classic") {
        return getInitialState(newMode, state.difficulty, 0, []);
      } else {
        return {
          ...state,
          mode: newMode,
          status: "idle",
        };
      }
    }

    case "SET_DIFFICULTY":
      return {
        ...state,
        difficulty: action.difficulty,
      };

    case "GENERATE_RANDOM_LEVEL": {
      const newCustomLevels = [action.levelData];
      const newState = getInitialState(state.mode, state.difficulty, 0, newCustomLevels);
      return newState;
    }

    case "NEXT_RANDOM_LEVEL": {
      const newCustomLevels = [...state.customLevels, action.levelData];
      const newLevel = newCustomLevels.length - 1;
      const newState = getInitialState(state.mode, state.difficulty, newLevel, newCustomLevels);
      return newState;
    }

    case "START_SOLVING":
      return {
        ...state,
        isSolving: true,
        solveError: null,
      };

    case "SET_SOLUTION":
      return {
        ...state,
        isSolving: false,
        solution: action.solution,
        solutionStep: 0,
      };

    case "SET_SOLVE_ERROR":
      return {
        ...state,
        isSolving: false,
        solveError: action.error,
      };

    case "STEP_SOLUTION": {
      if (!state.solution || state.solutionStep >= state.solution.length) {
        return state;
      }
      const nextDirection = state.solution[state.solutionStep] as Direction;
      const delta: Record<Direction, Position> = {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
      };

      const dx = delta[nextDirection].x;
      const dy = delta[nextDirection].y;
      const newX = state.player.x + dx;
      const newY = state.player.y + dy;

      if (isWall(state.map, newX, newY)) return state;

      const boxIndex = getBoxAt(state.boxes, newX, newY);

      if (boxIndex !== -1) {
        const newBoxX = newX + dx;
        const newBoxY = newY + dy;

        if (isWall(state.map, newBoxX, newBoxY)) return state;
        if (getBoxAt(state.boxes, newBoxX, newBoxY) !== -1) return state;

        const newBoxes = [...state.boxes];
        newBoxes[boxIndex] = { x: newBoxX, y: newBoxY };
        const complete = isLevelComplete(newBoxes, state.goals);

        return {
          ...state,
          player: { x: newX, y: newY },
          boxes: newBoxes,
          moves: state.moves + 1,
          pushes: state.pushes + 1,
          status: complete ? "gameover" : "playing",
          solutionStep: state.solutionStep + 1,
          history: [
            ...state.history,
            { player: state.player, boxes: state.boxes },
          ],
        };
      }

      return {
        ...state,
        player: { x: newX, y: newY },
        moves: state.moves + 1,
        status: state.status === "idle" ? "playing" : state.status,
        solutionStep: state.solutionStep + 1,
        history: [
          ...state.history,
          { player: state.player, boxes: state.boxes },
        ],
      };
    }

    case "CLEAR_SOLUTION":
      return {
        ...state,
        solution: null,
        solutionStep: 0,
        solveError: null,
        showHint: false,
      };

    case "TOGGLE_HINT":
      return {
        ...state,
        showHint: !state.showHint,
      };

    default:
      return state;
  }
}

export function useSokoban() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [state, dispatch] = useReducer(sokobanReducer, undefined, () =>
    getInitialState("classic", "easy", 0, [])
  );

  // Get current level map for solving
  const getCurrentLevelMap = useCallback(() => {
    const levelData = state.mode === "random" && state.customLevels.length > 0
      ? state.customLevels[state.level]
      : LEVELS[state.level];
    return levelData?.map || LEVELS[0].map;
  }, [state.mode, state.level, state.customLevels]);

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
        dispatch({ type: "MOVE", direction: map[e.key] });
      }

      if (e.key === "z" || e.key === "Z") {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          dispatch({ type: "UNDO" });
        }
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        dispatch({ type: "RESET" });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const move = useCallback((direction: Direction) => {
    dispatch({ type: "MOVE", direction });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const setLevel = useCallback((level: number) => {
    dispatch({ type: "SET_LEVEL", level });
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: "SET_DIFFICULTY", difficulty });
  }, []);

  const generateLevel = useCallback(async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const levelData = generateRandomLevel(state.difficulty);
      if (levelData) {
        dispatch({ type: "GENERATE_RANDOM_LEVEL", levelData });
      } else {
        setGenerateError("生成关卡失败，请重试");
      }
    } catch (e) {
      setGenerateError("生成关卡时出错");
    } finally {
      setIsGenerating(false);
    }
  }, [state.difficulty]);

  const nextRandomLevel = useCallback(async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const levelData = generateRandomLevel(state.difficulty);
      if (levelData) {
        dispatch({ type: "NEXT_RANDOM_LEVEL", levelData });
      } else {
        setGenerateError("生成关卡失败，请重试");
      }
    } catch (e) {
      setGenerateError("生成关卡时出错");
    } finally {
      setIsGenerating(false);
    }
  }, [state.difficulty]);

  const start = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Solver functions
  const findSolution = useCallback(async () => {
    dispatch({ type: "START_SOLVING" });
    try {
      const levelMap = getCurrentLevelMap();
      const solution = solveLevel(levelMap, 200000);
      dispatch({ type: "SET_SOLUTION", solution });
    } catch (e) {
      dispatch({ type: "SET_SOLVE_ERROR", error: "求解失败" });
    }
  }, [getCurrentLevelMap]);

  const stepSolution = useCallback(() => {
    dispatch({ type: "STEP_SOLUTION" });
  }, []);

  const clearSolution = useCallback(() => {
    dispatch({ type: "CLEAR_SOLUTION" });
  }, []);

  const toggleHint = useCallback(() => {
    dispatch({ type: "TOGGLE_HINT" });
  }, []);

  // Auto-play solution
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const startAutoPlay = useCallback(() => {
    if (!state.solution || state.solutionStep >= state.solution.length) return;

    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }

    const interval = setInterval(() => {
      dispatch({ type: "STEP_SOLUTION" });
    }, 300);

    setAutoPlayInterval(interval);
    setIsAutoPlaying(true);
  }, [state.solution, state.solutionStep, autoPlayInterval]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
      setIsAutoPlaying(false);
    }
  }, [autoPlayInterval]);

  useEffect(() => {
    if (state.status === "gameover" || (state.solution && state.solutionStep >= state.solution.length)) {
      stopAutoPlay();
    }
  }, [state.status, state.solution, state.solutionStep, stopAutoPlay]);

  useEffect(() => {
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [autoPlayInterval]);

  const currentLevelData = state.mode === "random" && state.customLevels.length > 0
    ? state.customLevels[state.level]
    : LEVELS[state.level];

  // Direction display names
  const directionNames: Record<string, string> = {
    UP: "↑",
    DOWN: "↓",
    LEFT: "←",
    RIGHT: "→",
  };

  return {
    ...state,
    move,
    undo,
    reset,
    setLevel,
    start,
    setMode,
    setDifficulty,
    generateLevel,
    nextRandomLevel,
    isGenerating,
    generateError,
    totalLevels: state.mode === "random" ? state.customLevels.length : LEVELS.length,
    levelName: currentLevelData?.name || `第${state.level + 1}关`,
    // Solver related
    findSolution,
    stepSolution,
    clearSolution,
    toggleHint,
    startAutoPlay,
    stopAutoPlay,
    isAutoPlaying,
    directionNames,
  };
}
