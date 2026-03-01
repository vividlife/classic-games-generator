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

// ─── AI Logic (Minimax + Alpha-Beta) ─────────────────────────────────────────

const SCORE_FIVE = 100000;
const SCORE_OPEN_FOUR = 50000;
const SCORE_HALF_FOUR = 5000;
const SCORE_OPEN_THREE = 1000;
const SCORE_HALF_THREE = 200;
const SCORE_OPEN_TWO = 50;
const SCORE_HALF_TWO = 5;

const DEPTH_MAP: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

// Count consecutive same-colored stones from (r,c) in one direction (not including origin)
function countDir(
  board: Stone[][],
  r: number,
  c: number,
  dr: number,
  dc: number,
  stone: Stone
): number {
  let n = 0;
  let nr = r + dr;
  let nc = c + dc;
  while (
    nr >= 0 &&
    nr < BOARD_SIZE &&
    nc >= 0 &&
    nc < BOARD_SIZE &&
    board[nr][nc] === stone
  ) {
    n++;
    nr += dr;
    nc += dc;
  }
  return n;
}

// Score the pattern at (r, c) in direction (dr, dc). Stone must already be placed at (r, c).
function lineScore(
  board: Stone[][],
  r: number,
  c: number,
  dr: number,
  dc: number,
  stone: Stone
): number {
  const f = countDir(board, r, c, dr, dc, stone);
  const b = countDir(board, r, c, -dr, -dc, stone);
  const len = f + b + 1;

  const feR = r + (f + 1) * dr;
  const feC = c + (f + 1) * dc;
  const beR = r - (b + 1) * dr;
  const beC = c - (b + 1) * dc;

  const fOpen =
    feR >= 0 &&
    feR < BOARD_SIZE &&
    feC >= 0 &&
    feC < BOARD_SIZE &&
    board[feR][feC] === null;
  const bOpen =
    beR >= 0 &&
    beR < BOARD_SIZE &&
    beC >= 0 &&
    beC < BOARD_SIZE &&
    board[beR][beC] === null;
  const opens = (fOpen ? 1 : 0) + (bOpen ? 1 : 0);

  if (len >= 5) return SCORE_FIVE;
  if (len === 4)
    return opens === 2
      ? SCORE_OPEN_FOUR
      : opens === 1
      ? SCORE_HALF_FOUR
      : 0;
  if (len === 3)
    return opens === 2
      ? SCORE_OPEN_THREE
      : opens === 1
      ? SCORE_HALF_THREE
      : 0;
  if (len === 2)
    return opens === 2 ? SCORE_OPEN_TWO : opens === 1 ? SCORE_HALF_TWO : 0;
  return 0;
}

// Sum scores across all 4 directions for a stone already placed at (r, c)
function cellScore(
  board: Stone[][],
  r: number,
  c: number,
  stone: Stone
): number {
  let s = 0;
  for (const [dr, dc] of DIRS) s += lineScore(board, r, c, dr, dc, stone);
  return s;
}

// Evaluate full board from AI (white/maximizer) perspective
function evalBoard(
  board: Stone[][],
  aiStone: Stone,
  playerStone: Stone
): number {
  let ai = 0;
  let opp = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === aiStone) ai += cellScore(board, r, c, aiStone);
      else if (board[r][c] === playerStone)
        opp += cellScore(board, r, c, playerStone);
    }
  }
  return ai - opp;
}

// Candidate moves: empty cells within range=2 of any existing stone
function getCandidateCells(board: Stone[][]): { row: number; col: number }[] {
  const hasStones = board.some((row) => row.some((c) => c !== null));
  if (!hasStones) {
    const mid = Math.floor(BOARD_SIZE / 2);
    return [{ row: mid, col: mid }];
  }

  const seen = new Set<string>();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
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

// Minimax with Alpha-Beta pruning (operates on a mutable board copy)
function minimax(
  board: Stone[][],
  depth: number,
  alpha: number,
  beta: number,
  isMax: boolean,
  aiStone: Stone,
  playerStone: Stone
): number {
  const candidates = getCandidateCells(board);
  if (depth === 0 || candidates.length === 0)
    return evalBoard(board, aiStone, playerStone);

  const stone = isMax ? aiStone : playerStone;

  // Order moves by quick score (best first for better pruning), limit branching to 12
  const ordered = candidates
    .map((m) => {
      board[m.row][m.col] = stone;
      const s = cellScore(board, m.row, m.col, stone);
      board[m.row][m.col] = null;
      return { row: m.row, col: m.col, s };
    })
    .sort((a, b) => (isMax ? b.s - a.s : a.s - b.s))
    .slice(0, 12);

  if (isMax) {
    let best = -Infinity;
    for (const { row, col } of ordered) {
      board[row][col] = stone;
      if (checkWin(board, row, col)) {
        board[row][col] = null;
        return SCORE_FIVE * 10;
      }
      const s = minimax(board, depth - 1, alpha, beta, false, aiStone, playerStone);
      board[row][col] = null;
      best = Math.max(best, s);
      alpha = Math.max(alpha, s);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const { row, col } of ordered) {
      board[row][col] = stone;
      if (checkWin(board, row, col)) {
        board[row][col] = null;
        return -SCORE_FIVE * 10;
      }
      const s = minimax(board, depth - 1, alpha, beta, true, aiStone, playerStone);
      board[row][col] = null;
      best = Math.min(best, s);
      beta = Math.min(beta, s);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getAIMove(
  boardState: Stone[][],
  difficulty: Difficulty
): { row: number; col: number } {
  const board = boardState.map((r) => [...r]); // mutable copy; never mutate React state
  const aiStone: Stone = "white";
  const playerStone: Stone = "black";
  const depth = DEPTH_MAP[difficulty];

  const candidates = getCandidateCells(board);
  if (candidates.length === 0) return { row: 7, col: 7 };
  if (candidates.length === 1) return candidates[0];

  // Immediately win if possible
  for (const { row, col } of candidates) {
    board[row][col] = aiStone;
    if (checkWin(board, row, col)) {
      board[row][col] = null;
      return { row, col };
    }
    board[row][col] = null;
  }

  // Block opponent's immediate win
  for (const { row, col } of candidates) {
    board[row][col] = playerStone;
    if (checkWin(board, row, col)) {
      board[row][col] = null;
      return { row, col };
    }
    board[row][col] = null;
  }

  // Score candidates, keep top 15 for root search
  const scored = candidates
    .map((m) => {
      board[m.row][m.col] = aiStone;
      const a = cellScore(board, m.row, m.col, aiStone);
      board[m.row][m.col] = null;
      board[m.row][m.col] = playerStone;
      const p = cellScore(board, m.row, m.col, playerStone);
      board[m.row][m.col] = null;
      return { row: m.row, col: m.col, score: a + p };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  let bestScore = -Infinity;
  let bestRow = scored[0].row;
  let bestCol = scored[0].col;

  for (const { row, col } of scored) {
    board[row][col] = aiStone;
    const s = minimax(board, depth - 1, -Infinity, Infinity, false, aiStone, playerStone);
    board[row][col] = null;
    if (s > bestScore) {
      bestScore = s;
      bestRow = row;
      bestCol = col;
    }
  }

  return { row: bestRow, col: bestCol };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGomoku(difficulty: Difficulty, initialMode: GomokuGameMode = "pvc") {
  const [state, dispatch] = useReducer(gomokuReducer, undefined, getInitialState);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef(state.board);
  boardRef.current = state.board;

  // Trigger AI move when it becomes white's turn in PvC mode.
  // NOTE: state.aiThinking is intentionally excluded from deps — including it
  // causes the effect cleanup to cancel the scheduled timeout the moment
  // aiThinking becomes true, leaving the AI stuck in a thinking state forever.
  useEffect(() => {
    if (
      state.status === "playing" &&
      state.mode === "pvc" &&
      state.currentPlayer === "white"
    ) {
      dispatch({ type: "SET_AI_THINKING", value: true });
      const timer = setTimeout(() => {
        const move = getAIMove(boardRef.current, difficulty);
        dispatch({ type: "PLACE_STONE", row: move.row, col: move.col });
        dispatch({ type: "SET_AI_THINKING", value: false });
      }, 300);
      aiTimeoutRef.current = timer;
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.mode, state.currentPlayer, difficulty]);

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
