"use client";

import { memo, useState } from "react";
import { BOARD_SIZE, Stone } from "@/lib/useGomoku";

const CELL_SIZE = 36;
const STONE_SIZE = Math.round(CELL_SIZE * 0.86);
const BOARD_PX = CELL_SIZE * BOARD_SIZE;

// Star points for standard 15×15 board
const STAR_POINTS: [number, number][] = [
  [3, 3], [3, 7], [3, 11],
  [7, 3], [7, 7], [7, 11],
  [11, 3], [11, 7], [11, 11],
];

interface GomokuBoardProps {
  board: Stone[][];
  lastMove: { row: number; col: number } | null;
  currentPlayer: "black" | "white";
  onPlace: (row: number, col: number) => void;
  disabled: boolean;
}

const GomokuBoard = memo(function GomokuBoard({
  board,
  lastMove,
  currentPlayer,
  onPlace,
  disabled,
}: GomokuBoardProps) {
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className="overflow-auto">
      <div
        className="relative rounded-sm shadow-xl border-2 border-amber-600 select-none"
        style={{
          width: BOARD_PX,
          height: BOARD_PX,
          backgroundColor: "#dcb97a",
          backgroundImage:
            "repeating-linear-gradient(rgba(0,0,0,0.06) 0 1px, transparent 1px 100%), " +
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 100%)",
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          backgroundPosition: `${CELL_SIZE / 2}px ${CELL_SIZE / 2}px`,
          flexShrink: 0,
        }}
      >
        {/* Horizontal grid lines */}
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div
            key={`h-${i}`}
            className="absolute"
            style={{
              top: i * CELL_SIZE + CELL_SIZE / 2,
              left: CELL_SIZE / 2,
              right: CELL_SIZE / 2,
              height: 1,
              backgroundColor: "#7a4f1e",
            }}
          />
        ))}

        {/* Vertical grid lines */}
        {Array.from({ length: BOARD_SIZE }, (_, j) => (
          <div
            key={`v-${j}`}
            className="absolute"
            style={{
              left: j * CELL_SIZE + CELL_SIZE / 2,
              top: CELL_SIZE / 2,
              bottom: CELL_SIZE / 2,
              width: 1,
              backgroundColor: "#7a4f1e",
            }}
          />
        ))}

        {/* Star points (天元 + 星位) */}
        {STAR_POINTS.map(([r, c]) =>
          board[r][c] ? null : (
            <div
              key={`star-${r}-${c}`}
              className="absolute rounded-full"
              style={{
                width: 7,
                height: 7,
                top: r * CELL_SIZE + CELL_SIZE / 2 - 3.5,
                left: c * CELL_SIZE + CELL_SIZE / 2 - 3.5,
                backgroundColor: "#7a4f1e",
              }}
            />
          )
        )}

        {/* Intersections: click areas + stones */}
        {board.map((row, rowIdx) =>
          row.map((stone, colIdx) => {
            const isHovered =
              !disabled &&
              !stone &&
              hover?.row === rowIdx &&
              hover?.col === colIdx;
            const isLastMove =
              lastMove?.row === rowIdx && lastMove?.col === colIdx;

            return (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="absolute flex items-center justify-center"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  top: rowIdx * CELL_SIZE,
                  left: colIdx * CELL_SIZE,
                  cursor: !disabled && !stone ? "pointer" : "default",
                  zIndex: 1,
                }}
                onClick={() => {
                  if (!disabled && !stone) onPlace(rowIdx, colIdx);
                }}
                onMouseEnter={() => {
                  if (!disabled && !stone)
                    setHover({ row: rowIdx, col: colIdx });
                }}
                onMouseLeave={() => setHover(null)}
              >
                {/* Placed stone */}
                {stone && (
                  <div
                    className="relative flex items-center justify-center rounded-full shadow-md"
                    style={{
                      width: STONE_SIZE,
                      height: STONE_SIZE,
                      background:
                        stone === "black"
                          ? "radial-gradient(circle at 35% 35%, #666, #111)"
                          : "radial-gradient(circle at 35% 35%, #fff, #ccc)",
                      border:
                        stone === "white" ? "1px solid #aaa" : undefined,
                    }}
                  >
                    {/* Last move marker */}
                    {isLastMove && (
                      <div
                        className="rounded-full"
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor:
                            stone === "black" ? "#fff" : "#c00",
                          opacity: 0.85,
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Hover preview */}
                {isHovered && (
                  <div
                    className="rounded-full"
                    style={{
                      width: STONE_SIZE,
                      height: STONE_SIZE,
                      opacity: 0.38,
                      background:
                        currentPlayer === "black"
                          ? "radial-gradient(circle at 35% 35%, #666, #111)"
                          : "radial-gradient(circle at 35% 35%, #fff, #ccc)",
                      border:
                        currentPlayer === "white"
                          ? "1px solid #aaa"
                          : undefined,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

export default GomokuBoard;
