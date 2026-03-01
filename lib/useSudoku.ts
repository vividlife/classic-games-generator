"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { generatePuzzle, type Difficulty, type Grid } from "./sudokuGenerator";

export type { Difficulty };

export interface CellState {
  value: number;
  isGiven: boolean;
  isError: boolean;
}

export interface SudokuGameState {
  board: CellState[][];
  solution: Grid;
  selectedCell: [number, number] | null;
  difficulty: Difficulty;
  isComplete: boolean;
  timer: number;
  hintsUsed: number;
}

function buildBoard(puzzle: Grid): CellState[][] {
  return puzzle.map((row) =>
    row.map((val) => ({
      value: val,
      isGiven: val !== 0,
      isError: false,
    }))
  );
}

function checkErrors(board: CellState[][]): CellState[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell, isError: false })));
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const val = next[row][col].value;
      if (val === 0) continue;
      // Check row
      for (let c = 0; c < 9; c++) {
        if (c !== col && next[row][c].value === val) {
          next[row][col].isError = true;
          next[row][c].isError = true;
        }
      }
      // Check col
      for (let r = 0; r < 9; r++) {
        if (r !== row && next[r][col].value === val) {
          next[row][col].isError = true;
          next[r][col].isError = true;
        }
      }
      // Check box
      const br = Math.floor(row / 3) * 3;
      const bc = Math.floor(col / 3) * 3;
      for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
          if ((r !== row || c !== col) && next[r][c].value === val) {
            next[row][col].isError = true;
            next[r][c].isError = true;
          }
        }
      }
    }
  }
  return next;
}

function isBoardComplete(board: CellState[][], solution: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col].value !== solution[row][col]) return false;
    }
  }
  return true;
}

export function useSudoku() {
  const [difficulty, setDifficulty] = useState<Difficulty>("普通");
  const [board, setBoard] = useState<CellState[][]>(() =>
    Array.from({ length: 9 }, () =>
      Array(9).fill({ value: 0, isGiven: false, isError: false })
    )
  );
  const [solution, setSolution] = useState<Grid>(() =>
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const newGame = useCallback(
    (diff?: Difficulty) => {
      const d = diff ?? difficulty;
      setDifficulty(d);
      const { puzzle, solution: sol } = generatePuzzle(d);
      const newBoard = checkErrors(buildBoard(puzzle));
      setBoard(newBoard);
      setSolution(sol);
      setSelectedCell(null);
      setIsComplete(false);
      setHintsUsed(0);
      setTimer(0);
      setIsStarted(true);
      stopTimer();
      // Start timer after state settles
      setTimeout(startTimer, 0);
    },
    [difficulty, startTimer, stopTimer]
  );

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell([row, col]);
  }, []);

  const inputNumber = useCallback(
    (num: number) => {
      if (!selectedCell) return;
      const [row, col] = selectedCell;
      setBoard((prev) => {
        if (prev[row][col].isGiven) return prev;
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        next[row][col].value = num;
        const withErrors = checkErrors(next);
        return withErrors;
      });
      // Check completion after update
      setBoard((prev) => {
        if (isBoardComplete(prev, solution)) {
          setIsComplete(true);
          stopTimer();
        }
        return prev;
      });
    },
    [selectedCell, solution, stopTimer]
  );

  const clearCell = useCallback(() => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    setBoard((prev) => {
      if (prev[row][col].isGiven) return prev;
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      next[row][col].value = 0;
      return checkErrors(next);
    });
  }, [selectedCell]);

  const getHint = useCallback(() => {
    // Find an empty or incorrect cell and fill it
    const candidates: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!board[r][c].isGiven && board[r][c].value !== solution[r][c]) {
          candidates.push([r, c]);
        }
      }
    }
    if (candidates.length === 0) return;
    // Prefer selected cell if it's a candidate
    let target: [number, number] | null = null;
    if (selectedCell) {
      const [sr, sc] = selectedCell;
      if (!board[sr][sc].isGiven && board[sr][sc].value !== solution[sr][sc]) {
        target = [sr, sc];
      }
    }
    if (!target) {
      target = candidates[Math.floor(Math.random() * candidates.length)];
    }
    const [hr, hc] = target;
    setBoard((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      next[hr][hc].value = solution[hr][hc];
      next[hr][hc].isGiven = true; // treat hint as given so it can't be cleared
      return checkErrors(next);
    });
    setHintsUsed((h) => h + 1);
    setSelectedCell(target);
    setBoard((prev) => {
      if (isBoardComplete(prev, solution)) {
        setIsComplete(true);
        stopTimer();
      }
      return prev;
    });
  }, [board, solution, selectedCell, stopTimer]);

  // Highlight helpers
  const getCellHighlight = useCallback(
    (row: number, col: number) => {
      const cell = board[row][col];
      if (!selectedCell) {
        return { isSelected: false, isRelated: false, isSameNumber: false };
      }
      const [sr, sc] = selectedCell;
      const isSelected = sr === row && sc === col;
      const selVal = board[sr][sc].value;
      const isSameNumber = selVal !== 0 && cell.value === selVal;
      const sameRow = sr === row;
      const sameCol = sc === col;
      const sameBox =
        Math.floor(sr / 3) === Math.floor(row / 3) &&
        Math.floor(sc / 3) === Math.floor(col / 3);
      const isRelated = sameRow || sameCol || sameBox;
      return { isSelected, isRelated, isSameNumber };
    },
    [board, selectedCell]
  );

  return {
    board,
    solution,
    selectedCell,
    difficulty,
    isComplete,
    timer,
    hintsUsed,
    isStarted,
    newGame,
    selectCell,
    inputNumber,
    clearCell,
    getHint,
    getCellHighlight,
  };
}
