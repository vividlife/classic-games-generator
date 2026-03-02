"use client";

import { useCallback, useEffect, useReducer } from "react";
import { Direction, GameStatus } from "@/types";

// Cell types
export const WALL = "#";
export const FLOOR = " ";
export const GOAL = ".";
export const BOX = "$";
export const PLAYER = "@";
export const BOX_ON_GOAL = "*";
export const PLAYER_ON_GOAL = "+";

// Level data - classic Sokoban levels
export const LEVELS: { name: string; map: string[] }[] = [
  {
    name: "第1关 - 入门",
    map: [
      "  ####  ",
      "###  ###",
      "#   $  #",
      "# #  # #",
      "# . .$ #",
      "#  #   #",
      "##  ####",
      " # @ #  ",
      " #####  ",
    ],
  },
  {
    name: "第2关 - 推一推",
    map: [
      "#####   ",
      "#   #   ",
      "# $ # ##",
      "#   # .#",
      "## ## .#",
      " # $  ##",
      " # @  # ",
      " ###### ",
    ],
  },
  {
    name: "第3关 - 转角",
    map: [
      "  ##### ",
      "###   # ",
      "# $ # ##",
      "# #  . #",
      "#   $@ #",
      "####.  #",
      "   #####",
    ],
  },
  {
    name: "第4关 - 迷宫",
    map: [
      "########",
      "#  # . #",
      "#  $   #",
      "#  # . #",
      "## #####",
      "# $  #  ",
      "# @  #  ",
      "######  ",
    ],
  },
  {
    name: "第5关 - 挑战",
    map: [
      "  ###### ",
      "  #    # ",
      "  # ## ##",
      "### $   #",
      "#..$ $@ #",
      "#..# ####",
      "####     ",
    ],
  },
  {
    name: "第6关 - 进阶",
    map: [
      " #######",
      "##  #  #",
      "# $  $ #",
      "#..#   #",
      "#..# $ #",
      "## #  ##",
      " #  @ # ",
      " ###### ",
    ],
  },
  {
    name: "第7关 - 困难",
    map: [
      " ###### ",
      "##    ##",
      "#  ##  #",
      "# $  $ #",
      "#..##  #",
      "#..  $ #",
      "## @  ##",
      " ###### ",
    ],
  },
  {
    name: "第8关 - 专家",
    map: [
      "  ######",
      "###    #",
      "# $  $ #",
      "#.##  ##",
      "#.  $  #",
      "## $  ##",
      " #  @ # ",
      " ###### ",
    ],
  },
];

export interface Position {
  x: number;
  y: number;
}

interface SokobanState {
  level: number;
  map: string[];
  player: Position;
  boxes: Position[];
  goals: Position[];
  moves: number;
  pushes: number;
  status: GameStatus;
  history: { player: Position; boxes: Position[] }[];
}

type SokobanAction =
  | { type: "MOVE"; direction: Direction }
  | { type: "UNDO" }
  | { type: "RESET" }
  | { type: "SET_LEVEL"; level: number };

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

function getInitialState(level: number): SokobanState {
  const levelData = LEVELS[level]?.map || LEVELS[0].map;
  const { map, player, boxes, goals } = parseLevel(levelData);

  return {
    level,
    map,
    player,
    boxes,
    goals,
    moves: 0,
    pushes: 0,
    status: "idle",
    history: [],
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
      return getInitialState(state.level);

    case "SET_LEVEL":
      return getInitialState(action.level);

    default:
      return state;
  }
}

export function useSokoban() {
  const [state, dispatch] = useReducer(sokobanReducer, undefined, () =>
    getInitialState(0)
  );

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

  const start = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    ...state,
    move,
    undo,
    reset,
    setLevel,
    start,
    totalLevels: LEVELS.length,
    levelName: LEVELS[state.level]?.name || `第${state.level + 1}关`,
  };
}
