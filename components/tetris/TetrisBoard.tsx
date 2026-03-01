"use client";

import { memo } from "react";
import { Theme } from "@/types";
import { Board, BOARD_WIDTH, BOARD_HEIGHT, getGhostPosition } from "@/lib/useTetris";
import { Tetromino, getShape, TetrominoType } from "@/lib/tetrominos";

interface TetrisBoardProps {
  board: Board;
  current: Tetromino;
  theme: Theme;
  isPlaying: boolean;
}

const CELL_SIZE = 26;

function getCellColor(
  type: TetrominoType | null,
  theme: Theme,
  isGhost = false
): string {
  if (!type) return "";
  const base = theme.tetromino[type] ?? "bg-slate-600";
  return isGhost ? `${base} opacity-20` : base;
}

const TetrisBoard = memo(function TetrisBoard({
  board,
  current,
  theme,
  isPlaying,
}: TetrisBoardProps) {
  // Build render grid
  const renderGrid: (TetrominoType | "ghost" | null)[][] = board.map((row) => [
    ...row,
  ]) as (TetrominoType | "ghost" | null)[][];

  // Ghost piece
  if (isPlaying) {
    const ghost = getGhostPosition(board, current);
    const ghostShape = getShape(ghost);
    for (let row = 0; row < ghostShape.length; row++) {
      for (let col = 0; col < ghostShape[row].length; col++) {
        if (!ghostShape[row][col]) continue;
        const y = ghost.y + row;
        const x = ghost.x + col;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          if (!renderGrid[y][x]) renderGrid[y][x] = "ghost";
        }
      }
    }
  }

  // Active piece
  if (isPlaying) {
    const shape = getShape(current);
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue;
        const y = current.y + row;
        const x = current.x + col;
        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          renderGrid[y][x] = current.type;
        }
      }
    }
  }

  return (
    <div
      className={`border-2 ${theme.border} ${theme.board} rounded-lg overflow-hidden`}
      style={{ width: BOARD_WIDTH * CELL_SIZE, height: BOARD_HEIGHT * CELL_SIZE }}
    >
      {renderGrid.map((row, ri) => (
        <div key={ri} className="flex">
          {row.map((cell, ci) => (
            <div
              key={ci}
              className={`border border-white/5 ${
                cell && cell !== "ghost"
                  ? `${getCellColor(cell as TetrominoType, theme)} shadow-sm`
                  : cell === "ghost"
                  ? `${theme.tetromino[current.type] ?? "bg-slate-600"} opacity-20 border-dashed`
                  : ""
              }`}
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

export default TetrisBoard;

// Mini preview for next piece
interface NextPieceProps {
  piece: Tetromino;
  theme: Theme;
}

export function NextPiece({ piece, theme }: NextPieceProps) {
  const shape = getShape(piece);
  const MINI = 18;

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-900 rounded-lg min-h-[72px] min-w-[72px]">
      {shape.map((row, ri) => (
        <div key={ri} className="flex">
          {row.map((cell, ci) => (
            <div
              key={ci}
              className={`${cell ? theme.tetromino[piece.type] ?? "bg-slate-600" : ""} rounded-sm`}
              style={{ width: MINI, height: MINI, margin: 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
