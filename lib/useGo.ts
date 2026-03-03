"use client";

import { useCallback, useReducer } from "react";

export type BoardSize = 9 | 13 | 19;
export type GoCell = "black" | "white" | null;
export type GoPlayer = "black" | "white";
export type GoStatus = "idle" | "playing" | "gameover";

interface GoSnapshot {
  board: GoCell[][];
  currentPlayer: GoPlayer;
  capturedByBlack: number;
  capturedByWhite: number;
  lastMove: { row: number; col: number } | null;
  koPoint: { row: number; col: number } | null;
  consecutivePasses: number;
}

interface GoState {
  board: GoCell[][];
  boardSize: BoardSize;
  currentPlayer: GoPlayer;
  status: GoStatus;
  winner: GoPlayer | null;
  winReason: "resign" | "pass" | null;
  capturedByBlack: number; // white stones captured by black
  capturedByWhite: number; // black stones captured by white
  lastMove: { row: number; col: number } | null;
  koPoint: { row: number; col: number } | null;
  consecutivePasses: number;
  history: GoSnapshot[];
}

type GoAction =
  | { type: "PLACE_STONE"; row: number; col: number }
  | { type: "PASS" }
  | { type: "RESIGN"; player: GoPlayer }
  | { type: "START"; boardSize: BoardSize }
  | { type: "RESET" }
  | { type: "UNDO" };

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function createBoard(size: number): GoCell[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function findGroup(board: GoCell[][], r: number, c: number, size: number): Set<string> {
  const color = board[r][c];
  if (!color) return new Set();
  const group = new Set<string>();
  const queue: [number, number][] = [[r, c]];
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    const key = `${cr},${cc}`;
    if (group.has(key)) continue;
    if (cr < 0 || cr >= size || cc < 0 || cc >= size) continue;
    if (board[cr][cc] !== color) continue;
    group.add(key);
    for (const [dr, dc] of DIRS) queue.push([cr + dr, cc + dc]);
  }
  return group;
}

function countLiberties(board: GoCell[][], group: Set<string>, size: number): number {
  const liberties = new Set<string>();
  for (const key of group) {
    const [r, c] = key.split(",").map(Number);
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === null) {
        liberties.add(`${nr},${nc}`);
      }
    }
  }
  return liberties.size;
}

function tryMove(
  board: GoCell[][],
  r: number,
  c: number,
  player: GoPlayer,
  koPoint: { row: number; col: number } | null,
  size: number
): { newBoard: GoCell[][]; captured: number; koPoint: { row: number; col: number } | null } | null {
  if (board[r][c] !== null) return null;
  if (koPoint && koPoint.row === r && koPoint.col === c) return null;

  const opponent: GoPlayer = player === "black" ? "white" : "black";
  const newBoard = board.map((row) => [...row]) as GoCell[][];
  newBoard[r][c] = player;

  // Remove captured opponent stones
  let captured = 0;
  let lastSingleCapture: { row: number; col: number } | null = null;
  const checked = new Set<string>();

  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
    if (newBoard[nr][nc] !== opponent) continue;
    const key = `${nr},${nc}`;
    if (checked.has(key)) continue;

    const group = findGroup(newBoard, nr, nc, size);
    group.forEach((k) => checked.add(k));

    if (countLiberties(newBoard, group, size) === 0) {
      captured += group.size;
      if (group.size === 1) {
        const [kr, kc] = [...group][0].split(",").map(Number);
        lastSingleCapture = { row: kr, col: kc };
      }
      for (const k of group) {
        const [kr, kc] = k.split(",").map(Number);
        newBoard[kr][kc] = null;
      }
    }
  }

  // Check for suicide (placed stone's group has no liberties)
  const placedGroup = findGroup(newBoard, r, c, size);
  if (countLiberties(newBoard, placedGroup, size) === 0) return null;

  // Ko point: the recapturable single stone point
  const newKo = captured === 1 ? lastSingleCapture : null;

  return { newBoard, captured, koPoint: newKo };
}

function getInitialState(): GoState {
  const boardSize: BoardSize = 19;
  return {
    board: createBoard(boardSize),
    boardSize,
    currentPlayer: "black",
    status: "idle",
    winner: null,
    winReason: null,
    capturedByBlack: 0,
    capturedByWhite: 0,
    lastMove: null,
    koPoint: null,
    consecutivePasses: 0,
    history: [],
  };
}

function takeSnapshot(state: GoState): GoSnapshot {
  return {
    board: state.board.map((row) => [...row]) as GoCell[][],
    currentPlayer: state.currentPlayer,
    capturedByBlack: state.capturedByBlack,
    capturedByWhite: state.capturedByWhite,
    lastMove: state.lastMove,
    koPoint: state.koPoint,
    consecutivePasses: state.consecutivePasses,
  };
}

function goReducer(state: GoState, action: GoAction): GoState {
  switch (action.type) {
    case "START": {
      const size = action.boardSize;
      return {
        ...getInitialState(),
        boardSize: size,
        board: createBoard(size),
        status: "playing",
      };
    }

    case "RESET":
      return getInitialState();

    case "UNDO": {
      if (state.status !== "playing" || state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        board: prev.board,
        currentPlayer: prev.currentPlayer,
        capturedByBlack: prev.capturedByBlack,
        capturedByWhite: prev.capturedByWhite,
        lastMove: prev.lastMove,
        koPoint: prev.koPoint,
        consecutivePasses: prev.consecutivePasses,
        history: state.history.slice(0, -1),
      };
    }

    case "PLACE_STONE": {
      if (state.status !== "playing") return state;
      const { row, col } = action;
      const result = tryMove(state.board, row, col, state.currentPlayer, state.koPoint, state.boardSize);
      if (!result) return state;

      const { newBoard, captured, koPoint: newKo } = result;
      const opponent: GoPlayer = state.currentPlayer === "black" ? "white" : "black";

      return {
        ...state,
        board: newBoard,
        currentPlayer: opponent,
        lastMove: { row, col },
        koPoint: newKo,
        consecutivePasses: 0,
        capturedByBlack: state.capturedByBlack + (state.currentPlayer === "black" ? captured : 0),
        capturedByWhite: state.capturedByWhite + (state.currentPlayer === "white" ? captured : 0),
        history: [...state.history, takeSnapshot(state)],
      };
    }

    case "PASS": {
      if (state.status !== "playing") return state;
      const newPasses = state.consecutivePasses + 1;
      const opponent: GoPlayer = state.currentPlayer === "black" ? "white" : "black";

      if (newPasses >= 2) {
        return {
          ...state,
          status: "gameover",
          winner: null,
          winReason: "pass",
          consecutivePasses: newPasses,
          currentPlayer: opponent,
          lastMove: null,
          koPoint: null,
        };
      }

      return {
        ...state,
        currentPlayer: opponent,
        lastMove: null,
        koPoint: null,
        consecutivePasses: newPasses,
        history: [...state.history, takeSnapshot(state)],
      };
    }

    case "RESIGN": {
      if (state.status !== "playing") return state;
      const winner: GoPlayer = action.player === "black" ? "white" : "black";
      return {
        ...state,
        status: "gameover",
        winner,
        winReason: "resign",
      };
    }

    default:
      return state;
  }
}

export function useGo() {
  const [state, dispatch] = useReducer(goReducer, undefined, getInitialState);

  const placeStone = useCallback((row: number, col: number) => {
    dispatch({ type: "PLACE_STONE", row, col });
  }, []);

  const pass = useCallback(() => {
    dispatch({ type: "PASS" });
  }, []);

  const resign = useCallback((player: GoPlayer) => {
    dispatch({ type: "RESIGN", player });
  }, []);

  const start = useCallback((boardSize: BoardSize) => {
    dispatch({ type: "START", boardSize });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  return { ...state, placeStone, pass, resign, start, reset, undo };
}
