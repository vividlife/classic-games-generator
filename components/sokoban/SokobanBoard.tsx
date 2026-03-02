"use client";

import { memo } from "react";
import { Position } from "@/types";
import { WALL, GOAL } from "@/lib/useSokoban";

interface SokobanBoardProps {
  map: string[];
  player: Position;
  boxes: Position[];
  goals: Position[];
}

const CELL_SIZE = 40;

const SokobanBoard = memo(function SokobanBoard({ map, player, boxes, goals }: SokobanBoardProps) {
  const width = Math.max(...map.map((row) => row.length)) * CELL_SIZE;
  const height = map.length * CELL_SIZE;

  const isGoal = (x: number, y: number) =>
    goals.some((g) => g.x === x && g.y === y);

  const isBox = (x: number, y: number) =>
    boxes.some((b) => b.x === x && b.y === y);

  const isBoxOnGoal = (x: number, y: number) =>
    isGoal(x, y) && isBox(x, y);

  return (
    <div
      className="relative border-2 border-amber-700 rounded-lg overflow-hidden bg-amber-950"
      style={{ width, height }}
    >
      {/* Map cells */}
      {map.map((row, y) =>
        [...row].map((cell, x) => {
          if (cell === WALL) {
            return (
              <div
                key={`${x}-${y}-wall`}
                className="absolute bg-gradient-to-br from-stone-600 to-stone-800 border border-stone-500"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.1), inset -2px -2px 4px rgba(0,0,0,0.3)",
                }}
              />
            );
          }
          return null;
        })
      )}

      {/* Goals */}
      {goals.map((goal, i) => (
        <div
          key={`goal-${i}`}
          className="absolute flex items-center justify-center"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: goal.x * CELL_SIZE,
            top: goal.y * CELL_SIZE,
          }}
        >
          <div
            className="w-5 h-5 rounded-full bg-amber-500/40 border-2 border-amber-400/60"
            style={{ boxShadow: "0 0 10px rgba(251, 191, 36, 0.5)" }}
          />
        </div>
      ))}

      {/* Boxes */}
      {boxes.map((box, i) => (
        <div
          key={`box-${i}`}
          className={`absolute flex items-center justify-center transition-all duration-100 ${
            isGoal(box.x, box.y)
              ? "bg-gradient-to-br from-green-500 to-green-700 border-green-400"
              : "bg-gradient-to-br from-amber-600 to-amber-800 border-amber-500"
          } border-2 rounded-lg`}
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: box.x * CELL_SIZE + 2,
            top: box.y * CELL_SIZE + 2,
            boxShadow: isGoal(box.x, box.y)
              ? "0 0 15px rgba(34, 197, 94, 0.6), inset 2px 2px 4px rgba(255,255,255,0.2)"
              : "inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <span className="text-lg font-bold text-white drop-shadow">
            {isGoal(box.x, box.y) ? "✓" : "📦"}
          </span>
        </div>
      ))}

      {/* Player */}
      <div
        className="absolute flex items-center justify-center transition-all duration-100"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          left: player.x * CELL_SIZE,
          top: player.y * CELL_SIZE,
        }}
      >
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-300 flex items-center justify-center"
          style={{
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.6), inset 2px 2px 4px rgba(255,255,255,0.3)",
          }}
        >
          <span className="text-base">😊</span>
        </div>
      </div>
    </div>
  );
});

export default SokobanBoard;
