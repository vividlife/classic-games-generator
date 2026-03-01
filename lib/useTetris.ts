"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { Difficulty, GameStatus, DIFFICULTIES } from "@/types";
import {
  Tetromino,
  TetrominoType,
  TETROMINOS,
  getShape,
  randomTetromino,
} from "@/lib/tetrominos";
import { calculateScore } from "@/lib/scoreManager";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type Board = (TetrominoType | null)[][];

function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
}

function isValidPosition(
  board: Board,
  piece: Tetromino,
  dx = 0,
  dy = 0,
  rotation?: number
): boolean {
  const shape = getShape(
    rotation !== undefined ? { ...piece, rotation } : piece
  );
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      const newX = piece.x + col + dx;
      const newY = piece.y + row + dy;
      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;
      if (newY < 0) continue;
      if (board[newY][newX]) return false;
    }
  }
  return true;
}

function placePiece(board: Board, piece: Tetromino): Board {
  const newBoard = board.map((row) => [...row]);
  const shape = getShape(piece);
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (!shape[row][col]) continue;
      const y = piece.y + row;
      const x = piece.x + col;
      if (y >= 0) newBoard[y][x] = piece.type;
    }
  }
  return newBoard;
}

function clearLines(board: Board): { board: Board; linesCleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  const emptyRows = Array.from({ length: linesCleared }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
  return { board: [...emptyRows, ...newBoard], linesCleared };
}

const LINE_SCORES = [0, 100, 300, 500, 800];

interface TetrisState {
  board: Board;
  current: Tetromino;
  next: Tetromino;
  score: number;
  lines: number;
  level: number;
  status: GameStatus;
}

type TetrisAction =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "MOVE_DOWN" }
  | { type: "ROTATE" }
  | { type: "HARD_DROP" }
  | { type: "TICK" }
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" };

function lockAndSpawn(
  state: TetrisState,
  piece: Tetromino
): TetrisState {
  const locked = placePiece(state.board, piece);
  const { board: cleared, linesCleared } = clearLines(locked);
  const lineScore = LINE_SCORES[Math.min(linesCleared, 4)] * state.level;
  const newLines = state.lines + linesCleared;
  const newLevel = Math.floor(newLines / 10) + 1;
  const next = state.next;
  const newPiece = randomTetromino();

  // Check game over
  if (!isValidPosition(cleared, next)) {
    return {
      ...state,
      board: cleared,
      score: state.score + lineScore,
      lines: newLines,
      level: newLevel,
      status: "gameover",
    };
  }

  return {
    ...state,
    board: cleared,
    current: next,
    next: newPiece,
    score: state.score + lineScore,
    lines: newLines,
    level: newLevel,
    status: "playing",
  };
}

function tetrisReducer(state: TetrisState, action: TetrisAction): TetrisState {
  switch (action.type) {
    case "MOVE_LEFT": {
      if (state.status !== "playing") return state;
      if (!isValidPosition(state.board, state.current, -1, 0)) return state;
      return {
        ...state,
        current: { ...state.current, x: state.current.x - 1 },
      };
    }

    case "MOVE_RIGHT": {
      if (state.status !== "playing") return state;
      if (!isValidPosition(state.board, state.current, 1, 0)) return state;
      return {
        ...state,
        current: { ...state.current, x: state.current.x + 1 },
      };
    }

    case "MOVE_DOWN": {
      if (state.status !== "playing") return state;
      if (!isValidPosition(state.board, state.current, 0, 1)) {
        return lockAndSpawn(state, state.current);
      }
      return {
        ...state,
        current: { ...state.current, y: state.current.y + 1 },
        score: state.score + 1,
      };
    }

    case "ROTATE": {
      if (state.status !== "playing") return state;
      const rotations = TETROMINOS[state.current.type].length;
      const newRotation = (state.current.rotation + 1) % rotations;
      // Wall kick: try current, then -1, +1, -2, +2
      for (const kick of [0, -1, 1, -2, 2]) {
        if (isValidPosition(state.board, { ...state.current, x: state.current.x + kick }, 0, 0, newRotation)) {
          return {
            ...state,
            current: { ...state.current, rotation: newRotation, x: state.current.x + kick },
          };
        }
      }
      return state;
    }

    case "HARD_DROP": {
      if (state.status !== "playing") return state;
      let dropped = state.current;
      let dropDistance = 0;
      while (isValidPosition(state.board, dropped, 0, 1)) {
        dropped = { ...dropped, y: dropped.y + 1 };
        dropDistance++;
      }
      return lockAndSpawn(
        { ...state, score: state.score + dropDistance * 2 },
        dropped
      );
    }

    case "TICK": {
      if (state.status !== "playing") return state;
      if (!isValidPosition(state.board, state.current, 0, 1)) {
        return lockAndSpawn(state, state.current);
      }
      return {
        ...state,
        current: { ...state.current, y: state.current.y + 1 },
      };
    }

    case "START":
      return { ...state, status: "playing" };

    case "PAUSE":
      return {
        ...state,
        status: state.status === "playing" ? "paused" : state.status,
      };

    case "RESUME":
      return {
        ...state,
        status: state.status === "paused" ? "playing" : state.status,
      };

    case "RESET":
      return getInitialState();

    default:
      return state;
  }
}

function getInitialState(): TetrisState {
  return {
    board: createBoard(),
    current: randomTetromino(),
    next: randomTetromino(),
    score: 0,
    lines: 0,
    level: 1,
    status: "idle",
  };
}

export function getGhostPosition(board: Board, piece: Tetromino): Tetromino {
  let ghost = { ...piece };
  while (isValidPosition(board, ghost, 0, 1)) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }
  return ghost;
}

export function useTetris(difficulty: Difficulty) {
  const [state, dispatch] = useReducer(tetrisReducer, undefined, getInitialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const baseSpeed = DIFFICULTIES[difficulty].tetrisSpeed;
  // Speed increases with level
  const speed = Math.max(100, baseSpeed - (state.level - 1) * 40);

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
      if (state.status === "gameover") return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          dispatch({ type: "MOVE_LEFT" });
          break;
        case "ArrowRight":
          e.preventDefault();
          dispatch({ type: "MOVE_RIGHT" });
          break;
        case "ArrowDown":
          e.preventDefault();
          dispatch({ type: "MOVE_DOWN" });
          break;
        case "ArrowUp":
        case "x":
        case "X":
          e.preventDefault();
          dispatch({ type: "ROTATE" });
          break;
        case " ":
          e.preventDefault();
          if (state.status === "idle") {
            dispatch({ type: "START" });
          } else if (state.status === "playing") {
            dispatch({ type: "HARD_DROP" });
          } else if (state.status === "paused") {
            dispatch({ type: "RESUME" });
          }
          break;
        case "Escape":
          e.preventDefault();
          if (state.status === "playing") dispatch({ type: "PAUSE" });
          else if (state.status === "paused") dispatch({ type: "RESUME" });
          break;
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
    moveLeft: () => dispatch({ type: "MOVE_LEFT" }),
    moveRight: () => dispatch({ type: "MOVE_RIGHT" }),
    moveDown: () => dispatch({ type: "MOVE_DOWN" }),
    rotate: () => dispatch({ type: "ROTATE" }),
    hardDrop: () => dispatch({ type: "HARD_DROP" }),
  };
}
