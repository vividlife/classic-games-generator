"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { Difficulty } from "@/types";

export const BOARD_SIZE = 8;
export type Cell = "black" | "white" | null;
export type ReversiPlayer = "black" | "white";
export type ReversiGameMode = "pvp" | "pvc";
export type ReversiStatus = "idle" | "playing" | "gameover";

interface ReversiState {
  board: Cell[][];
  currentPlayer: "black" | "white";
  winner: "black" | "white" | null;
  status: ReversiStatus;
  mode: ReversiGameMode;
  lastMove: { row: number; col: number } | null;
  aiThinking: boolean;
  blackCount: number;
  whiteCount: number;
  validMoves: { row: number; col: number }[];
  skippedLastTurn: boolean;
}

type ReversiAction =
  | { type: "PLACE_PIECE"; row: number; col: number }
  | { type: "START"; mode: ReversiGameMode }
  | { type: "RESET" }
  | { type: "SET_AI_THINKING"; value: boolean };

// All 8 directions for checking flips
const DIRECTIONS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function createInitialBoard(): Cell[][] {
  const board: Cell[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );
  // Standard starting position: 4 pieces in center
  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = "white";
  board[mid - 1][mid] = "black";
  board[mid][mid - 1] = "black";
  board[mid][mid] = "white";
  return board;
}

function countPieces(board: Cell[][]): { black: number; white: number } {
  let black = 0;
  let white = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === "black") black++;
      else if (board[r][c] === "white") white++;
    }
  }
  return { black, white };
}

// Check if placing a piece at (row, col) would flip any pieces
function getFlipsInDirection(
  board: Cell[][],
  row: number,
  col: number,
  dr: number,
  dc: number,
  player: "black" | "white"
): { row: number; col: number }[] {
  const opponent = player === "black" ? "white" : "black";
  const flips: { row: number; col: number }[] = [];
  
  let r = row + dr;
  let c = col + dc;
  
  // Collect opponent pieces in this direction
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
    flips.push({ row: r, col: c });
    r += dr;
    c += dc;
  }
  
  // Valid flip if we end on our own piece
  if (flips.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
    return flips;
  }
  
  return [];
}

// Get all flips for a move
function getAllFlips(
  board: Cell[][],
  row: number,
  col: number,
  player: "black" | "white"
): { row: number; col: number }[] {
  if (board[row][col] !== null) return [];
  
  const allFlips: { row: number; col: number }[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    allFlips.push(...getFlipsInDirection(board, row, col, dr, dc, player));
  }
  return allFlips;
}

// Check if a move is valid
function isValidMove(
  board: Cell[][],
  row: number,
  col: number,
  player: "black" | "white"
): boolean {
  return getAllFlips(board, row, col, player).length > 0;
}

// Get all valid moves for a player
function getValidMoves(board: Cell[][], player: "black" | "white"): { row: number; col: number }[] {
  const moves: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(board, r, c, player)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

// Apply a move to the board
function applyMove(
  board: Cell[][],
  row: number,
  col: number,
  player: "black" | "white"
): Cell[][] {
  const newBoard = board.map(r => [...r]);
  const flips = getAllFlips(board, row, col, player);
  
  newBoard[row][col] = player;
  for (const { row: fr, col: fc } of flips) {
    newBoard[fr][fc] = player;
  }
  
  return newBoard;
}

function getInitialState(): ReversiState {
  const board = createInitialBoard();
  const { black, white } = countPieces(board);
  return {
    board,
    currentPlayer: "black",
    winner: null,
    status: "idle",
    mode: "pvc",
    lastMove: null,
    aiThinking: false,
    blackCount: black,
    whiteCount: white,
    validMoves: getValidMoves(board, "black"),
    skippedLastTurn: false,
  };
}

function reversiReducer(state: ReversiState, action: ReversiAction): ReversiState {
  switch (action.type) {
    case "PLACE_PIECE": {
      if (state.status !== "playing") return state;
      if (state.aiThinking) return state;
      
      const { row, col } = action;
      if (!isValidMove(state.board, row, col, state.currentPlayer)) return state;
      
      const newBoard = applyMove(state.board, row, col, state.currentPlayer);
      const { black, white } = countPieces(newBoard);
      const nextPlayer = state.currentPlayer === "black" ? "white" : "black";
      const nextValidMoves = getValidMoves(newBoard, nextPlayer);
      
      // Check if game should end
      const currentPlayerMovesAfter = getValidMoves(newBoard, state.currentPlayer);

      // Game ends if both players have no valid moves, or board is full
      const boardFull = black + white >= BOARD_SIZE * BOARD_SIZE;

      if (nextValidMoves.length === 0 && (currentPlayerMovesAfter.length === 0 || boardFull)) {
        const winner = black > white ? "black" : white > black ? "white" : null;
        return {
          ...state,
          board: newBoard,
          winner,
          status: "gameover",
          lastMove: { row, col },
          blackCount: black,
          whiteCount: white,
          validMoves: [],
        };
      }
      
      // If opponent has no moves, they skip, current player continues
      if (nextValidMoves.length === 0) {
        const currentPlayerAgainValidMoves = getValidMoves(newBoard, state.currentPlayer);
        return {
          ...state,
          board: newBoard,
          currentPlayer: state.currentPlayer, // Same player continues
          lastMove: { row, col },
          blackCount: black,
          whiteCount: white,
          validMoves: currentPlayerAgainValidMoves,
          skippedLastTurn: true,
        };
      }
      
      return {
        ...state,
        board: newBoard,
        currentPlayer: nextPlayer,
        lastMove: { row, col },
        blackCount: black,
        whiteCount: white,
        validMoves: nextValidMoves,
        skippedLastTurn: false,
      };
    }

    case "START": {
      const board = createInitialBoard();
      const { black, white } = countPieces(board);
      return {
        ...getInitialState(),
        status: "playing",
        mode: action.mode,
        board,
        blackCount: black,
        whiteCount: white,
        validMoves: getValidMoves(board, "black"),
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

// ─── AI Logic ─────────────────────────────────────────────────────────────────

// Position weights for static evaluation
const POSITION_WEIGHTS: number[][] = [
  [100, -20, 10,  5,  5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [ 10,  -2,  1,  1,  1,  1,  -2,  10],
  [  5,  -2,  1,  0,  0,  1,  -2,   5],
  [  5,  -2,  1,  0,  0,  1,  -2,   5],
  [ 10,  -2,  1,  1,  1,  1,  -2,  10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10,  5,  5, 10, -20, 100],
];

function evaluateBoard(board: Cell[][], aiPlayer: "black" | "white"): number {
  const { black, white } = countPieces(board);
  const opponent = aiPlayer === "black" ? "white" : "black";
  
  // Piece count difference
  const pieceDiff = aiPlayer === "black" ? black - white : white - black;
  
  // Position score
  let positionScore = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === aiPlayer) {
        positionScore += POSITION_WEIGHTS[r][c];
      } else if (board[r][c] === opponent) {
        positionScore -= POSITION_WEIGHTS[r][c];
      }
    }
  }
  
  // Mobility score (number of valid moves)
  const aiMoves = getValidMoves(board, aiPlayer).length;
  const oppMoves = getValidMoves(board, opponent).length;
  const mobilityScore = (aiMoves - oppMoves) * 5;
  
  // Combine scores with weights based on game phase
  const totalPieces = black + white;
  const gamePhase = totalPieces / (BOARD_SIZE * BOARD_SIZE);
  
  // Early game: prioritize position and mobility
  // Late game: prioritize piece count
  return positionScore * (1 - gamePhase) + pieceDiff * 10 * gamePhase + mobilityScore;
}

function minimax(
  board: Cell[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: "black" | "white",
  currentPlayer: "black" | "white"
): number {
  const validMoves = getValidMoves(board, currentPlayer);
  const opponent = currentPlayer === "black" ? "white" : "black";
  const opponentValidMoves = getValidMoves(board, opponent);
  
  // Terminal conditions
  if (depth === 0 || (validMoves.length === 0 && opponentValidMoves.length === 0)) {
    return evaluateBoard(board, aiPlayer);
  }
  
  // If current player has no moves, switch to opponent
  if (validMoves.length === 0) {
    return minimax(board, depth, alpha, beta, !isMaximizing, aiPlayer, opponent);
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const { row, col } of validMoves) {
      const newBoard = applyMove(board, row, col, currentPlayer);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer, opponent);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const { row, col } of validMoves) {
      const newBoard = applyMove(board, row, col, currentPlayer);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer, opponent);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getAIMove(
  board: Cell[][],
  difficulty: Difficulty,
  aiPlayer: "black" | "white"
): { row: number; col: number } | null {
  const validMoves = getValidMoves(board, aiPlayer);
  if (validMoves.length === 0) return null;
  if (validMoves.length === 1) return validMoves[0];
  
  const depthMap: Record<Difficulty, number> = {
    easy: 1,
    medium: 3,
    hard: 5,
  };
  
  const depth = depthMap[difficulty];
  const opponent = aiPlayer === "black" ? "white" : "black";
  
  // Easy mode: sometimes make random moves
  if (difficulty === "easy" && Math.random() < 0.3) {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  let bestMove = validMoves[0];
  let bestScore = -Infinity;
  
  for (const { row, col } of validMoves) {
    const newBoard = applyMove(board, row, col, aiPlayer);
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, aiPlayer, opponent);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = { row, col };
    }
  }
  
  return bestMove;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReversi(difficulty: Difficulty, initialMode: ReversiGameMode = "pvc") {
  const [state, dispatch] = useReducer(reversiReducer, undefined, getInitialState);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef(state.board);
  boardRef.current = state.board;

  // AI move effect
  useEffect(() => {
    if (
      state.status === "playing" &&
      state.mode === "pvc" &&
      state.currentPlayer === "white" &&
      state.validMoves.length > 0
    ) {
      dispatch({ type: "SET_AI_THINKING", value: true });
      const timer = setTimeout(() => {
        const move = getAIMove(boardRef.current, difficulty, "white");
        // Must clear aiThinking BEFORE placing piece, otherwise React 18
        // batching causes PLACE_PIECE to be rejected by the aiThinking guard.
        dispatch({ type: "SET_AI_THINKING", value: false });
        if (move) {
          dispatch({ type: "PLACE_PIECE", row: move.row, col: move.col });
        }
      }, 400);
      aiTimeoutRef.current = timer;
      return () => clearTimeout(timer);
    }
  }, [state.status, state.mode, state.currentPlayer, state.validMoves, difficulty]);

  const placePiece = useCallback((row: number, col: number) => {
    dispatch({ type: "PLACE_PIECE", row, col });
  }, []);

  const start = useCallback(
    (mode: ReversiGameMode = initialMode) => {
      dispatch({ type: "START", mode });
    },
    [initialMode]
  );

  const reset = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    dispatch({ type: "RESET" });
  }, []);

  return {
    ...state,
    placePiece,
    start,
    reset,
  };
}
