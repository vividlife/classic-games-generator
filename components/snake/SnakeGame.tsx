"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { useSnake } from "@/lib/useSnake";
import { saveScore } from "@/lib/scoreManager";
import SnakeBoard from "./SnakeBoard";
import SnakeControls from "./SnakeControls";
import ScoreBoard from "@/components/ui/ScoreBoard";
import Button from "@/components/ui/Button";

export default function SnakeGame() {
  const { difficulty, playerName, getTheme } = useGameStore();
  const theme = getTheme();
  const game = useSnake(difficulty);
  const [saved, setSaved] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Save score on game over
  useEffect(() => {
    if (game.status === "gameover" && !saved && game.finalScore > 0) {
      saveScore({
        game: "snake",
        score: game.finalScore,
        difficulty,
        playerName,
      });
      setSaved(true);
      setShowLeaderboard(true);
    }
  }, [game.status, game.finalScore, difficulty, playerName, saved]);

  const handleReset = () => {
    setSaved(false);
    setShowLeaderboard(false);
    game.reset();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Game Panel */}
      <div className="flex flex-col items-center gap-4">
        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-slate-400 text-xs">得分</div>
            <div className="font-mono font-bold text-white text-xl">
              {game.finalScore.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs">等级</div>
            <div className="font-mono font-bold text-indigo-400 text-xl">
              {game.level}
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs">长度</div>
            <div className="font-mono font-bold text-white text-xl">
              {game.snake.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs">速度</div>
            <div className="font-mono font-bold text-emerald-400 text-xl">
              ×{game.level}
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="relative">
          <SnakeBoard snake={game.snake} food={game.food} theme={theme} />

          {/* Overlays */}
          {game.status === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
              <div className="text-3xl mb-2">🐍</div>
              <h2 className="text-white font-bold text-xl mb-1">贪吃蛇</h2>
              <p className="text-slate-400 text-sm mb-4">
                使用方向键或 WASD 移动
              </p>
              <Button onClick={game.start} size="lg">
                开始游戏
              </Button>
            </div>
          )}

          {game.status === "paused" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
              <div className="text-3xl mb-2">⏸</div>
              <h2 className="text-white font-bold text-xl mb-4">已暂停</h2>
              <Button onClick={game.resume}>继续</Button>
            </div>
          )}

          {game.status === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
              <div className="text-3xl mb-2">💀</div>
              <h2 className="text-white font-bold text-xl mb-1">游戏结束</h2>
              <p className="text-slate-300 text-sm mb-1">
                得分：{" "}
                <span className="font-bold text-yellow-400">
                  {game.finalScore.toLocaleString()}
                </span>
              </p>
              <p className="text-slate-400 text-xs mb-4">
                等级 {game.level} · 长度 {game.snake.length}
              </p>
              <Button onClick={handleReset}>再玩一次</Button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {game.status === "playing" && (
            <Button variant="secondary" size="sm" onClick={game.pause}>
              暂停
            </Button>
          )}
          {game.status === "paused" && (
            <Button variant="secondary" size="sm" onClick={game.resume}>
              继续
            </Button>
          )}
          {(game.status === "playing" || game.status === "paused") && (
            <Button variant="danger" size="sm" onClick={handleReset}>
              退出
            </Button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden">
          <SnakeControls onDirection={game.setDirection} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-64 space-y-4">
        {/* Controls hint */}
        <div className="bg-slate-800 rounded-xl p-4 hidden lg:block">
          <SnakeControls onDirection={game.setDirection} />
          <div className="mt-2 text-xs text-slate-500 text-center">
            空格 / Esc 暂停
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            最高分
          </h3>
          <ScoreBoard
            game="snake"
            currentScore={
              game.status === "gameover" ? game.finalScore : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
