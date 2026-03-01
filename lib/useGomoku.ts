"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { Difficulty } from "@/types";

export const BOARD_SIZE = 15;
export type Stone = "black" | "white" | null;
export type GomokuGameMode = "pvp" | "pvc";
export type GomokuStatus = "idle" | "playing" | "gameover";

interface MoveRecord {
  row: number;
  col: number;
  stone: "black" | "white";
}

interface GomokuState {
  board: Stone[][];
  currentPlayer: "black" | "white";
  winner: "black" | "white" | null;
  isDraw: boolean;
  status: GomokuStatus;
  mode: GomokuGameMode;
  moveHistory: MoveRecord[];
  lastMove: { row: number; col: number } | null;
  aiThinking: boolean;
}

type GomokuAction =
  | { type: "PLACE_STONE"; row: number; col: number }
  | { type: "UNDO" }
  | { type: "START"; mode: GomokuGameMode }
  | { type: "RESET" }
  | { type: "SET_AI_THINKING"; value: boolean };

function createEmptyBoard(): Stone[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );
}

function rebuildBoard(moveHistory: MoveRecord[]): Stone[][] {
  const board = createEmptyBoard();
  for (const { row, col, stone } of moveHistory) {
    board[row][col] = stone;
  }
  return board;
}

function checkWin(board: Stone[][], row: number, col: number): boolean {
  const stone = board[row][col];
  if (!stone) return false;
  const directions: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dr, dc] of directions) {
    let count = 1;
    for (const sign of [-1, 1]) {
      let r = row + sign * dr;
      let c = col + sign * dc;
      while (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c] === stone
      ) {
        count++;
        r += sign * dr;
        c += sign * dc;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}

function getInitialState(): GomokuState {
  return {
    board: createEmptyBoard(),
    currentPlayer: "black",
    winner: null,
    isDraw: false,
    status: "idle",
    mode: "pvc",
    moveHistory: [],
    lastMove: null,
    aiThinking: false,
  };
}

function gomokuReducer(state: GomokuState, action: GomokuAction): GomokuState {
  switch (action.type) {
    case "PLACE_STONE": {
      if (state.status !== "playing") return state;
      if (state.aiThinking && state.currentPlayer === "black") return state;
      const { row, col } = action;
      if (state.board[row][col] !== null) return state;

      const newBoard = state.board.map((r) => [...r]);
      newBoard[row][col] = state.currentPlayer;
      const newMove: MoveRecord = { row, col, stone: state.currentPlayer };
      const newHistory = [...state.moveHistory, newMove];

      if (checkWin(newBoard, row, col)) {
        return {
          ...state,
          board: newBoard,
          winner: state.currentPlayer,
          status: "gameover",
          moveHistory: newHistory,
          lastMove: { row, col },
        };
      }

      if (newHistory.length >= BOARD_SIZE * BOARD_SIZE) {
        return {
          ...state,
          board: newBoard,
          isDraw: true,
          status: "gameover",
          moveHistory: newHistory,
          lastMove: { row, col },
        };
      }

      return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === "black" ? "white" : "black",
        moveHistory: newHistory,
        lastMove: { row, col },
      };
    }

    case "UNDO": {
      if (state.moveHistory.length === 0) return state;
      const stepsToUndo =
        state.mode === "pvc" && state.moveHistory.length >= 2 ? 2 : 1;
      const newHistory = state.moveHistory.slice(0, -stepsToUndo);
      const newBoard = rebuildBoard(newHistory);
      const lastEntry = newHistory[newHistory.length - 1];
      // Black starts; player count determines whose turn it is
      const nextPlayer: "black" | "white" =
        newHistory.length % 2 === 0 ? "black" : "white";

      return {
        ...state,
        board: newBoard,
        currentPlayer: nextPlayer,
        winner: null,
        isDraw: false,
        status: "playing",
        moveHistory: newHistory,
        lastMove: lastEntry ? { row: lastEntry.row, col: lastEntry.col } : null,
        aiThinking: false,
      };
    }

    case "START": {
      return {
        ...getInitialState(),
        status: "playing",
        mode: action.mode,
      };
    }

    case "RESET": {
      return getInitialState();
    }

    case "SET_AI_THINKING": {
      return { ...state, aiThinking: action.value };
    }

    default:
      return state;
  }
}

// ─── AI Logic ────────────────────────────────────────────────────────────────

function countInDir(
  board: Stone[][],
  row: number,
  col: number,
  dr: number,
  dc: number,
  stone: Stone
): number {
  let count = 0;
  let r = row + dr;
  let c = col + dc;
  while (
    r >= 0 &&
    r < BOARD_SIZE &&
    c >= 0 &&
    c < BOARD_SIZE &&
    board[r][c] === stone
  ) {
    count++;
    r += dr;
    c += dc;
  }
  return count;
}

function evaluatePosition(
  board: Stone[][],
  row: number,
  col: number,
  stone: Stone
): number {
  const tmp = board.map((r) => [...r]);
  tmp[row][col] = stone;

  const directions: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  let total = 0;

  for (const [dr, dc] of directions) {
    const fwd = countInDir(tmp, row, col, dr, dc, stone);
    const bwd = countInDir(tmp, row, col, -dr, -dc, stone);
    const count = fwd + bwd + 1;

    const fr = row + (fwd + 1) * dr;
    const fc = col + (fwd + 1) * dc;
    const br = row - (bwd + 1) * dr;
    const bc = col - (bwd + 1) * dc;

    const fOpen =
      fr >= 0 &&
      fr < BOARD_SIZE &&
      fc >= 0 &&
      fc < BOARD_SIZE &&
      tmp[fr][fc] === null;
    const bOpen =
      br >= 0 &&
      br < BOARD_SIZE &&
      bc >= 0 &&
      bc < BOARD_SIZE &&
      tmp[br][bc] === null;
    const open = (fOpen ? 1 : 0) + (bOpen ? 1 : 0);

    let lineScore = 0;
    if (count >= 5) lineScore = 100000;
    else if (count === 4)
      lineScore = open >= 2 ? 10000 : open === 1 ? 1000 : 100;
    else if (count === 3)
      lineScore = open >= 2 ? 1000 : open === 1 ? 100 : 10;
    else if (count === 2)
      lineScore = open >= 2 ? 100 : open === 1 ? 10 : 1;
    else if (count === 1) lineScore = open >= 1 ? 1 : 0;

    total += lineScore;
  }
  return total;
}

function getCandidateCells(
  board: Stone[][]
): { row: number; col: number }[] {
  const hasStones = board.some((row) => row.some((c) => c !== null));
  if (!hasStones) {
    const mid = Math.floor(BOARD_SIZE / 2);
    return [{ row: mid, col: mid }];
  }

  const seen = new Set<string>();
  const range = 2;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        for (let dr = -range; dr <= range; dr++) {
          for (let dc = -range; dc <= range; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < BOARD_SIZE &&
              nc >= 0 &&
              nc < BOARD_SIZE &&
              board[nr][nc] === null
            ) {
              seen.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }
  return Array.from(seen).map((k) => {
    const [row, col] = k.split(",").map(Number);
    return { row, col };
  });
}

function getAIMove(
  board: Stone[][],
  difficulty: Difficulty
): { row: number; col: number } {
  const aiStone: Stone = "white";
  const playerStone: Stone = "black";

  const candidates = getCandidateCells(board);
  if (candidates.length === 0) return { row: 7, col: 7 };

  if (difficulty === "easy") {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  let bestScore = -1;
  let bestMoves: { row: number; col: number }[] = [];

  for (const { row, col } of candidates) {
    const attack = evaluatePosition(board, row, col, aiStone);
    const defense = evaluatePosition(board, row, col, playerStone);
    const noise = difficulty === "medium" ? Math.random() * 60 : 0;
    const score = attack + defense * 0.9 + noise;

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [{ row, col }];
    } else if (score === bestScore) {
      bestMoves.push({ row, col });
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? candidates[0];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGomoku(difficulty: Difficulty, initialMode: GomokuGameMode = "pvc") {
  const [state, dispatch] = useReducer(gomokuReducer, undefined, getInitialState);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef(state.board);
  boardRef.current = state.board;

  // Trigger AI move when it becomes white's turn in PvC mode
  useEffect(() => {
    if (
      state.status === "playing" &&
      state.mode === "pvc" &&
      state.currentPlayer === "white" &&
      !state.aiThinking
    ) {
      dispatch({ type: "SET_AI_THINKING", value: true });
      aiTimeoutRef.current = setTimeout(() => {
        const move = getAIMove(boardRef.current, difficulty);
        dispatch({ type: "PLACE_STONE", row: move.row, col: move.col });
        dispatch({ type: "SET_AI_THINKING", value: false });
      }, 350);
    }
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.mode, state.currentPlayer, state.aiThinking, difficulty]);

  const placeStone = useCallback((row: number, col: number) => {
    dispatch({ type: "PLACE_STONE", row, col });
  }, []);

  const undo = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    dispatch({ type: "UNDO" });
  }, []);

  const start = useCallback(
    (mode: GomokuGameMode = initialMode) => {
      dispatch({ type: "START", mode });
    },
    [initialMode]
  );

  const reset = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    dispatch({ type: "RESET" });
  }, []);

  const canUndo =
    state.moveHistory.length > 0 &&
    state.status === "playing" &&
    !state.aiThinking;

  return {
    ...state,
    canUndo,
    placeStone,
    undo,
    start,
    reset,
  };
}
