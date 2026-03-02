"use client";

import { memo } from "react";
import { BOARD_SIZE, Cell } from "@/lib/useReversi";

interface ReversiBoardProps {
  board: Cell[][];
  lastMove: { row: number; col: number } | null;
  validMoves: { row: number; col: number }[];
  currentPlayer: "black" | "white";
  onPlace: (row: number, col: number) => void;
  disabled: boolean;
  cellSize?: number;
}

const ReversiBoard = memo(function ReversiBoard({
  board,
  lastMove,
  validMoves,
  currentPlayer,
  onPlace,
  disabled,
  cellSize = 40,
}: ReversiBoardProps) {
  const STONE_SIZE = Math.round(cellSize * 0.84);
  const BOARD_PX = cellSize * BOARD_SIZE;
  const validMoveDot = Math.max(6, Math.round(cellSize * 0.2));
  const lastMoveRing = Math.max(3, Math.round(cellSize * 0.08));

  // Create a Set for quick lookup of valid moves
  const validMovesSet = new Set(
    validMoves.map(m => `${m.row},${m.col}`)
  );

  const isValidMove = (row: number, col: number) => 
    validMovesSet.has(`${row},${col}`);

  return (
    <div
      className="relative rounded-sm shadow-xl border-2 border-green-700 select-none"
      style={{
        width: BOARD_PX,
        height: BOARD_PX,
        backgroundColor: "#2d5016",
      }}
    >
      {/* Grid lines */}
      {Array.from({ length: BOARD_SIZE + 1 }, (_, i) => (
        <div key={`grid-${i}`}>
          {/* Horizontal line */}
          <div
            className="absolute"
            style={{
              top: i * cellSize,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: "#1a3009",
            }}
          />
          {/* Vertical line */}
          <div
            className="absolute"
            style={{
              left: i * cellSize,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: "#1a3009",
            }}
          />
        </div>
      ))}

      {/* Cells with stones and valid move indicators */}
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isLastMove =
            lastMove?.row === rowIdx && lastMove?.col === colIdx;
          const isValid = isValidMove(rowIdx, colIdx);

          return (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className="absolute flex items-center justify-center"
              style={{
                width: cellSize,
                height: cellSize,
                top: rowIdx * cellSize,
                left: colIdx * cellSize,
                cursor: !disabled && isValid ? "pointer" : "default",
                zIndex: 1,
              }}
              onClick={() => {
                if (!disabled && isValid) onPlace(rowIdx, colIdx);
              }}
            >
              {/* Stone */}
              {cell && (
                <div
                  className="relative flex items-center justify-center rounded-full shadow-lg"
                  style={{
                    width: STONE_SIZE,
                    height: STONE_SIZE,
                    background:
                      cell === "black"
                        ? "radial-gradient(circle at 35% 35%, #555, #111)"
                        : "radial-gradient(circle at 35% 35%, #fff, #ddd)",
                    border: cell === "white" ? "2px solid #ccc" : undefined,
                    boxSizing: "border-box",
                  }}
                >
                  {/* Last move indicator */}
                  {isLastMove && (
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: STONE_SIZE + lastMoveRing * 2,
                        height: STONE_SIZE + lastMoveRing * 2,
                        top: -lastMoveRing,
                        left: -lastMoveRing,
                        border: `2px solid ${cell === "black" ? "#4ade80" : "#22c55e"}`,
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              )}

              {/* Valid move indicator */}
              {!cell && isValid && !disabled && (
                <div
                  className="rounded-full animate-pulse"
                  style={{
                    width: validMoveDot,
                    height: validMoveDot,
                    backgroundColor: currentPlayer === "black" ? "#333" : "#eee",
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
});

export default ReversiBoard;
