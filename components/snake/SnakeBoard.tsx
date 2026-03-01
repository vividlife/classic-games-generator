"use client";

import { memo } from "react";
import { Position, Theme } from "@/types";
import { GRID_SIZE } from "@/lib/useSnake";

interface SnakeBoardProps {
  snake: Position[];
  food: Position;
  theme: Theme;
}

const CELL_SIZE = 20;

const SnakeBoard = memo(function SnakeBoard({ snake, food, theme }: SnakeBoardProps) {
  const head = snake[0];

  return (
    <div
      className={`relative border-2 ${theme.border} rounded-lg overflow-hidden`}
      style={{
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE,
      }}
    >
      {/* Background grid */}
      <div
        className={`absolute inset-0 ${theme.board}`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
        }}
      />

      {/* Food */}
      <div
        className={`absolute ${theme.food} rounded-full`}
        style={{
          width: CELL_SIZE - 2,
          height: CELL_SIZE - 2,
          left: food.x * CELL_SIZE + 1,
          top: food.y * CELL_SIZE + 1,
          boxShadow: "0 0 8px currentColor",
        }}
      />

      {/* Snake body */}
      {snake.map((segment, i) => (
        <div
          key={`${segment.x}-${segment.y}-${i}`}
          className={`absolute rounded-sm ${i === 0 ? theme.snakeHead : theme.snake}`}
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: segment.x * CELL_SIZE + 1,
            top: segment.y * CELL_SIZE + 1,
            opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.02),
          }}
        />
      ))}

      {/* Eyes on head */}
      {head && (
        <>
          <div
            className="absolute bg-black rounded-full"
            style={{
              width: 4,
              height: 4,
              left: head.x * CELL_SIZE + 5,
              top: head.y * CELL_SIZE + 4,
            }}
          />
          <div
            className="absolute bg-black rounded-full"
            style={{
              width: 4,
              height: 4,
              left: head.x * CELL_SIZE + 11,
              top: head.y * CELL_SIZE + 4,
            }}
          />
        </>
      )}
    </div>
  );
});

export default SnakeBoard;
