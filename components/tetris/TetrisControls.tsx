"use client";

import Button from "@/components/ui/Button";

interface TetrisControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
}

export default function TetrisControls({
  onLeft,
  onRight,
  onDown,
  onRotate,
  onHardDrop,
}: TetrisControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Rotate & hard drop */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={onRotate}
          className="w-12 h-12 text-lg"
          aria-label="Rotate"
        >
          ↺
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={onHardDrop}
          className="w-12 h-12 text-lg"
          aria-label="Hard drop"
        >
          ⬇
        </Button>
      </div>

      {/* Left/Down/Right */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={onLeft}
          className="w-12 h-12 text-xl"
          aria-label="Left"
        >
          ←
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={onDown}
          className="w-12 h-12 text-xl"
          aria-label="Down"
        >
          ↓
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPointerDown={onRight}
          className="w-12 h-12 text-xl"
          aria-label="Right"
        >
          →
        </Button>
      </div>

      <p className="text-xs text-slate-500 mt-1">
        ↑ Rotate · Space Hard Drop
      </p>
    </div>
  );
}
