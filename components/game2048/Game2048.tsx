"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addRandomTile,
  Direction,
  Grid,
  hasWon,
  initGame,
  isGameOver,
  move,
} from "@/lib/game2048/logic";

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "bg-slate-700", text: "text-transparent" },
  2: { bg: "bg-amber-100", text: "text-slate-800" },
  4: { bg: "bg-amber-200", text: "text-slate-800" },
  8: { bg: "bg-orange-400", text: "text-white" },
  16: { bg: "bg-orange-500", text: "text-white" },
  32: { bg: "bg-red-400", text: "text-white" },
  64: { bg: "bg-red-500", text: "text-white" },
  128: { bg: "bg-yellow-400", text: "text-white" },
  256: { bg: "bg-yellow-500", text: "text-white" },
  512: { bg: "bg-yellow-600", text: "text-white" },
  1024: { bg: "bg-lime-500", text: "text-white" },
  2048: { bg: "bg-green-500", text: "text-white" },
};

function getTileStyle(value: number) {
  return TILE_COLORS[value] ?? { bg: "bg-green-600", text: "text-white" };
}

function TileGrid({ grid }: { grid: Grid }) {
  return (
    <div className="bg-slate-600 rounded-xl p-2 sm:p-3 grid grid-cols-4 gap-2 sm:gap-3 w-full aspect-square max-w-sm sm:max-w-md mx-auto select-none">
      {grid.flat().map((value, idx) => {
        const { bg, text } = getTileStyle(value);
        const fontSize =
          value >= 1024
            ? "text-lg sm:text-xl"
            : value >= 128
            ? "text-xl sm:text-2xl"
            : "text-2xl sm:text-3xl";
        return (
          <div
            key={idx}
            className={`${bg} ${text} ${fontSize} rounded-lg font-bold flex items-center justify-center aspect-square transition-colors duration-100`}
          >
            {value !== 0 ? value : ""}
          </div>
        );
      })}
    </div>
  );
}

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => initGame().grid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [wonAck, setWonAck] = useState(false);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameOver) return;
      setGrid((prev) => {
        const { grid: next, score: pts, moved } = move(prev, direction);
        if (!moved) return prev;
        const withTile = addRandomTile(next);
        setScore((s) => {
          const newScore = s + pts;
          setBest((b) => Math.max(b, newScore));
          return newScore;
        });
        if (isGameOver(withTile)) setGameOver(true);
        if (!won && hasWon(withTile)) setWon(true);
        return withTile;
      });
    },
    [gameOver, won]
  );

  // Keyboard control
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleMove]);

  // Touch/swipe control
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    const abs = (n: number) => Math.abs(n);
    if (abs(dx) < 20 && abs(dy) < 20) return;
    if (abs(dx) > abs(dy)) {
      handleMove(dx > 0 ? "right" : "left");
    } else {
      handleMove(dy > 0 ? "down" : "up");
    }
  };

  const restart = () => {
    const { grid: g, score: s } = initGame();
    setGrid(g);
    setScore(s);
    setGameOver(false);
    setWon(false);
    setWonAck(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Score bar */}
      <div className="flex gap-3 w-full max-w-sm sm:max-w-md">
        <div className="flex-1 bg-slate-700 rounded-xl px-4 py-2 text-center">
          <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">分数</div>
          <div className="text-xl sm:text-2xl font-bold text-white">{score}</div>
        </div>
        <div className="flex-1 bg-slate-700 rounded-xl px-4 py-2 text-center">
          <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">最高</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-300">{best}</div>
        </div>
        <button
          onClick={restart}
          className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-4 py-2 font-semibold text-sm transition-colors"
        >
          重开
        </button>
      </div>

      {/* Board */}
      <div
        className="w-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <TileGrid grid={grid} />
      </div>

      {/* Win overlay */}
      {won && !wonAck && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-green-500/50 rounded-2xl p-8 text-center max-w-xs mx-4">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">达成 2048！</h2>
            <p className="text-slate-400 text-sm mb-6">你赢了！可以继续挑战更高分数。</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setWonAck(true); }}
                className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-5 py-2 font-semibold transition-colors"
              >
                继续
              </button>
              <button
                onClick={restart}
                className="bg-slate-600 hover:bg-slate-500 text-white rounded-xl px-5 py-2 font-semibold transition-colors"
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-red-500/50 rounded-2xl p-8 text-center max-w-xs mx-4">
            <div className="text-5xl mb-3">😵</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">游戏结束</h2>
            <p className="text-slate-400 text-sm mb-2">最终得分：</p>
            <p className="text-3xl font-bold text-white mb-6">{score}</p>
            <button
              onClick={restart}
              className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-8 py-2.5 font-semibold transition-colors"
            >
              再来一局
            </button>
          </div>
        </div>
      )}

      {/* Direction buttons for mobile */}
      <div className="mt-2 flex flex-col items-center gap-1.5 sm:hidden">
        <button
          onClick={() => handleMove("up")}
          className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl w-14 h-12 text-xl font-bold transition-colors active:bg-slate-500"
        >
          ↑
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => handleMove("left")}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl w-14 h-12 text-xl font-bold transition-colors active:bg-slate-500"
          >
            ←
          </button>
          <button
            onClick={() => handleMove("down")}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl w-14 h-12 text-xl font-bold transition-colors active:bg-slate-500"
          >
            ↓
          </button>
          <button
            onClick={() => handleMove("right")}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl w-14 h-12 text-xl font-bold transition-colors active:bg-slate-500"
          >
            →
          </button>
        </div>
      </div>

      <p className="text-slate-500 text-xs text-center hidden sm:block">
        使用方向键移动方块 · 合并相同数字 · 达到 2048 即可获胜
      </p>
    </div>
  );
}
