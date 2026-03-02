"use client";

import { useReducer, useCallback } from "react";

export const BOARD_SIZE = 8;

export type CellValue = "black" | "white" | null;
export type ReversiPlayer = "black" | "white";
export type ReversiStatus = "idle" | "playing" | "gameover";

export type Board = CellValue[][];

const DIRECTIONS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );
  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = "white";
  board[mid - 1][mid] = "black";
  board[mid][mid - 1] = "black";
  board[mid][mid] = "white";
  return board;
}

function getFlips(
  board: Board,
  row: number,
  col: number,
  player: ReversiPlayer
): [number, number][] {
  if (board[row][col] !== null) return [];
  const opponent: ReversiPlayer = player === "black" ? "white" : "black";
  const flips: [number, number][] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const line: [number, number][] = [];
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      line.push([r, c]);
      r += dr;
      c += dc;
    }
    if (line.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      flips.push(...line);
    }
  }
  return flips;
}

export function getValidMoves(board: Board, player: ReversiPlayer): [number, number][] {
  const moves: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (getFlips(board, r, c, player).length > 0) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

function countPieces(board: Board): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === "black") black++;
      else if (cell === "white") white++;
    }
  }
  return { black, white };
}

export interface ReversiState {
  board: Board;
  currentPlayer: ReversiPlayer;
  status: ReversiStatus;
  validMoves: [number, number][];
  lastMove: [number, number] | null;
  flippedCells: [number, number][];
  skipped: boolean; // whether last turn was skipped
  winner: ReversiPlayer | "draw" | null;
  score: { black: number; white: number };
}

type ReversiAction =
  | { type: "START" }
  | { type: "PLACE"; row: number; col: number }
  | { type: "RESET" };

function getInitialState(): ReversiState {
  const board = createInitialBoard();
  const validMoves = getValidMoves(board, "black");
  return {
    board,
    currentPlayer: "black",
    status: "idle",
    validMoves,
    lastMove: null,
    flippedCells: [],
    skipped: false,
    winner: null,
    score: countPieces(board),
  };
}

function reversiReducer(state: ReversiState, action: ReversiAction): ReversiState {
  switch (action.type) {
    case "START": {
      const board = createInitialBoard();
      const validMoves = getValidMoves(board, "black");
      return {
        board,
        currentPlayer: "black",
        status: "playing",
        validMoves,
        lastMove: null,
        flippedCells: [],
        skipped: false,
        winner: null,
        score: countPieces(board),
      };
    }

    case "PLACE": {
      if (state.status !== "playing") return state;
      const { row, col } = action;

      const flips = getFlips(state.board, row, col, state.currentPlayer);
      if (flips.length === 0) return state;

      // Apply the move
      const newBoard: Board = state.board.map((r) => [...r]);
      newBoard[row][col] = state.currentPlayer;
      for (const [fr, fc] of flips) {
        newBoard[fr][fc] = state.currentPlayer;
      }

      const opponent: ReversiPlayer = state.currentPlayer === "black" ? "white" : "black";
      const opponentMoves = getValidMoves(newBoard, opponent);
      const currentMoves = getValidMoves(newBoard, state.currentPlayer);

      let nextPlayer = opponent;
      let skipped = false;

      if (opponentMoves.length === 0 && currentMoves.length === 0) {
        // Game over
        const score = countPieces(newBoard);
        const winner =
          score.black > score.white ? "black"
          : score.white > score.black ? "white"
          : "draw";
        return {
          board: newBoard,
          currentPlayer: state.currentPlayer,
          status: "gameover",
          validMoves: [],
          lastMove: [row, col],
          flippedCells: flips,
          skipped: false,
          winner,
          score,
        };
      }

      if (opponentMoves.length === 0) {
        // Opponent has no moves, current player goes again
        nextPlayer = state.currentPlayer;
        skipped = true;
      }

      const nextValidMoves = getValidMoves(newBoard, nextPlayer);

      return {
        board: newBoard,
        currentPlayer: nextPlayer,
        status: "playing",
        validMoves: nextValidMoves,
        lastMove: [row, col],
        flippedCells: flips,
        skipped,
        winner: null,
        score: countPieces(newBoard),
      };
    }

    case "RESET": {
      const board = createInitialBoard();
      const validMoves = getValidMoves(board, "black");
      return {
        board,
        currentPlayer: "black",
        status: "idle",
        validMoves,
        lastMove: null,
        flippedCells: [],
        skipped: false,
        winner: null,
        score: countPieces(board),
      };
    }

    default:
      return state;
  }
}

export function useReversi() {
  const [state, dispatch] = useReducer(reversiReducer, undefined, getInitialState);

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const place = useCallback(
    (row: number, col: number) => dispatch({ type: "PLACE", row, col }),
    []
  );

  const isValidMove = useCallback(
    (row: number, col: number) =>
      state.validMoves.some(([r, c]) => r === row && c === col),
    [state.validMoves]
  );

  return {
    ...state,
    start,
    reset,
    place,
    isValidMove,
  };
}
