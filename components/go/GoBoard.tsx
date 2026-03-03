"use client";

import { memo } from "react";
import { BoardSize, GoCell, GoPlayer } from "@/lib/useGo";

const CELL_SIZES: Record<BoardSize, number> = { 9: 52, 13: 42, 19: 32 };

const STAR_POINTS: Record<BoardSize, [number, number][]> = {
  9: [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]],
  13: [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]],
  19: [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15],
  ],
};

interface GoBoardProps {
  board: GoCell[][];
  boardSize: BoardSize;
  lastMove: { row: number; col: number } | null;
  koPoint: { row: number; col: number } | null;
  currentPlayer: GoPlayer;
  onPlace: (row: number, col: number) => void;
  disabled: boolean;
}

const GoBoard = memo(function GoBoard({
  board,
  boardSize,
  lastMove,
  koPoint,
  currentPlayer,
  onPlace,
  disabled,
}: GoBoardProps) {
  const cellSize = CELL_SIZES[boardSize];
  const BOARD_PX = cellSize * boardSize;
  const STONE_SIZE = Math.round(cellSize * 0.88);
  const STAR_SIZE = Math.max(4, Math.round(cellSize * 0.14));
  const starsForSize = STAR_POINTS[boardSize];

  // Center of intersection (row, col) in px
  const ix = (col: number) => (col + 0.5) * cellSize;
  const iy = (row: number) => (row + 0.5) * cellSize;

  // Grid line extents: from center of first to center of last intersection
  const gridStart = cellSize * 0.5;
  const gridEnd = cellSize * (boardSize - 0.5);
  const gridLength = (boardSize - 1) * cellSize;

  return (
    <div
      className="relative rounded shadow-xl select-none"
      style={{
        width: BOARD_PX,
        height: BOARD_PX,
        backgroundColor: "#dcb463",
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent calc(100% - 1px), rgba(138,98,37,0.15) 100%), repeating-linear-gradient(90deg, transparent, transparent calc(100% - 1px), rgba(138,98,37,0.15) 100%)",
      }}
    >
      {/* Grid lines */}
      {Array.from({ length: boardSize }, (_, i) => (
        <div key={`grid-${i}`}>
          {/* Horizontal */}
          <div
            className="absolute"
            style={{
              top: iy(i) - 0.5,
              left: gridStart,
              width: gridLength,
              height: 1,
              backgroundColor: "#8a6225",
            }}
          />
          {/* Vertical */}
          <div
            className="absolute"
            style={{
              left: ix(i) - 0.5,
              top: gridStart,
              width: 1,
              height: gridLength,
              backgroundColor: "#8a6225",
            }}
          />
        </div>
      ))}

      {/* Star points (hoshi) */}
      {starsForSize.map(([r, c]) => (
        <div
          key={`star-${r}-${c}`}
          className="absolute rounded-full"
          style={{
            width: STAR_SIZE,
            height: STAR_SIZE,
            top: iy(r) - STAR_SIZE / 2,
            left: ix(c) - STAR_SIZE / 2,
            backgroundColor: "#8a6225",
          }}
        />
      ))}

      {/* Intersection hit areas, stones, hover previews */}
      {board.map((rowArr, rowIdx) =>
        rowArr.map((cell, colIdx) => {
          const isLastMove = lastMove?.row === rowIdx && lastMove?.col === colIdx;
          const isKo = koPoint?.row === rowIdx && koPoint?.col === colIdx;
          const canPlace = !disabled && !cell && !isKo;

          return (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className={`absolute flex items-center justify-center group ${canPlace ? "cursor-pointer" : "cursor-default"}`}
              style={{
                width: cellSize,
                height: cellSize,
                top: rowIdx * cellSize,
                left: colIdx * cellSize,
                zIndex: 1,
              }}
              onClick={() => {
                if (canPlace) onPlace(rowIdx, colIdx);
              }}
            >
              {/* Stone */}
              {cell && (
                <div
                  className="relative rounded-full shadow-md flex items-center justify-center"
                  style={{
                    width: STONE_SIZE,
                    height: STONE_SIZE,
                    background:
                      cell === "black"
                        ? "radial-gradient(circle at 35% 35%, #666, #111)"
                        : "radial-gradient(circle at 35% 35%, #fff, #ddd)",
                    border: cell === "white" ? "1px solid #bbb" : undefined,
                    flexShrink: 0,
                  }}
                >
                  {/* Last move indicator dot */}
                  {isLastMove && (
                    <div
                      className="rounded-full"
                      style={{
                        width: Math.max(5, Math.round(STONE_SIZE * 0.28)),
                        height: Math.max(5, Math.round(STONE_SIZE * 0.28)),
                        backgroundColor: cell === "black" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)",
                      }}
                    />
                  )}
                </div>
              )}

              {/* Ko point indicator */}
              {isKo && !cell && (
                <div
                  className="rounded border-2 border-red-500 opacity-70"
                  style={{
                    width: Math.max(8, Math.round(cellSize * 0.38)),
                    height: Math.max(8, Math.round(cellSize * 0.38)),
                  }}
                />
              )}

              {/* Hover preview (empty, not ko, not disabled) */}
              {canPlace && (
                <div
                  className="rounded-full opacity-0 group-hover:opacity-25 transition-opacity pointer-events-none"
                  style={{
                    width: STONE_SIZE,
                    height: STONE_SIZE,
                    backgroundColor: currentPlayer === "black" ? "#111" : "#eee",
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

export default GoBoard;
