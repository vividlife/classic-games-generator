"use client";

import { Direction } from "@/types";
import Button from "@/components/ui/Button";

interface SnakeControlsProps {
  onDirection: (d: Direction) => void;
}

export default function SnakeControls({ onDirection }: SnakeControlsProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="grid grid-cols-3 gap-1">
        <div />
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={() => onDirection("UP")}
          className="w-12 h-12 text-xl"
          aria-label="Up"
        >
          ↑
        </Button>
        <div />
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={() => onDirection("LEFT")}
          className="w-12 h-12 text-xl"
          aria-label="Left"
        >
          ←
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={() => onDirection("DOWN")}
          className="w-12 h-12 text-xl"
          aria-label="Down"
        >
          ↓
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={() => onDirection("RIGHT")}
          className="w-12 h-12 text-xl"
          aria-label="Right"
        >
          →
        </Button>
      </div>
      <p className="text-xs text-slate-500 mt-1">Arrow keys / WASD</p>
    </div>
  );
}
