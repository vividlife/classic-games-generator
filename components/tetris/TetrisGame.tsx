"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { useTetris } from "@/lib/useTetris";
import { saveScore } from "@/lib/scoreManager";
import TetrisBoard, { NextPiece } from "./TetrisBoard";
import TetrisControls from "./TetrisControls";
import ScoreBoard from "@/components/ui/ScoreBoard";
import Button from "@/components/ui/Button";

export default function TetrisGame() {
  const { difficulty, playerName, getTheme } = useGameStore();
  const theme = getTheme();
  const game = useTetris(difficulty);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (game.status === "gameover" && !saved && game.finalScore > 0) {
      saveScore({
        game: "tetris",
        score: game.finalScore,
        difficulty,
        playerName,
      });
      setSaved(true);
    }
  }, [game.status, game.finalScore, difficulty, playerName, saved]);

  const handleReset = () => {
    setSaved(false);
    game.reset();
  };

  const isPlaying = game.status === "playing";

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Board */}
      <div className="relative">
        <TetrisBoard
          board={game.board}
          current={game.current}
          theme={theme}
          isPlaying={isPlaying}
        />

        {/* Overlays */}
        {game.status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <div className="text-3xl mb-2">🟦</div>
            <h2 className="text-white font-bold text-xl mb-1">俄罗斯方块</h2>
            <p className="text-slate-400 text-sm mb-4">
              填满一行即可消除
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
            <div className="text-3xl mb-2">🎯</div>
            <h2 className="text-white font-bold text-xl mb-1">游戏结束</h2>
            <p className="text-slate-300 text-sm mb-1">
              得分：{" "}
              <span className="font-bold text-yellow-400">
                {game.finalScore.toLocaleString()}
              </span>
            </p>
            <p className="text-slate-400 text-xs mb-4">
              等级 {game.level} · 消除 {game.lines} 行
            </p>
            <Button onClick={handleReset}>再玩一次</Button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4 w-full lg:w-52">
        {/* Stats */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">得分</div>
            <div className="font-mono font-bold text-white text-xl">
              {game.finalScore.toLocaleString()}
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-xs text-slate-400">等级</div>
              <div className="font-mono font-bold text-indigo-400 text-lg">
                {game.level}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">行数</div>
              <div className="font-mono font-bold text-white text-lg">
                {game.lines}
              </div>
            </div>
          </div>
        </div>

        {/* Next piece */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">下一个</div>
          <NextPiece piece={game.next} theme={theme} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
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

        {/* Mobile touch controls */}
        <div className="lg:hidden">
          <TetrisControls
            onLeft={game.moveLeft}
            onRight={game.moveRight}
            onDown={game.moveDown}
            onRotate={game.rotate}
            onHardDrop={game.hardDrop}
          />
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            最高分
          </h3>
          <ScoreBoard
            game="tetris"
            currentScore={
              game.status === "gameover" ? game.finalScore : undefined
            }
          />
        </div>

        {/* Controls reference (desktop) */}
        <div className="bg-slate-800 rounded-xl p-4 hidden lg:block">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">操作说明</div>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between"><span>移动</span><span className="text-slate-300">← →</span></div>
            <div className="flex justify-between"><span>慢落</span><span className="text-slate-300">↓</span></div>
            <div className="flex justify-between"><span>快落</span><span className="text-slate-300">空格</span></div>
            <div className="flex justify-between"><span>旋转</span><span className="text-slate-300">↑ / X</span></div>
            <div className="flex justify-between"><span>暂停</span><span className="text-slate-300">Esc</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
