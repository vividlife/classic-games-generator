"use client";

import { useSokoban, LEVELS, GameMode } from "@/lib/useSokoban";
import { Difficulty } from "@/types";
import SokobanBoard from "./SokobanBoard";
import Button from "@/components/ui/Button";

export default function SokobanGame() {
  const game = useSokoban();

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Game Board */}
      <div className="flex flex-col items-center gap-4">
        {/* Mode Selector */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => game.setMode("classic")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              game.mode === "classic"
                ? "bg-amber-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            经典模式
          </button>
          <button
            onClick={() => {
              game.setMode("random");
              if (game.customLevels.length === 0) {
                game.generateLevel();
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              game.mode === "random"
                ? "bg-amber-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            随机模式
          </button>
        </div>

        <SokobanBoard
          map={game.map}
          player={game.player}
          boxes={game.boxes}
          goals={game.goals}
        />

        {/* Level Complete Overlay */}
        {game.status === "gameover" && (
          <div className="mt-4 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-green-400 mb-2">恭喜过关！</h2>
            <p className="text-slate-400 text-sm mb-4">
              步数: {game.moves} · 推箱: {game.pushes}
            </p>
            <div className="flex gap-2 justify-center">
              {game.mode === "classic" && game.level < game.totalLevels - 1 && (
                <Button onClick={() => game.setLevel(game.level + 1)}>
                  下一关
                </Button>
              )}
              {game.mode === "random" && (
                <Button onClick={game.nextRandomLevel} disabled={game.isGenerating}>
                  {game.isGenerating ? "生成中..." : "下一关"}
                </Button>
              )}
              <Button variant="secondary" onClick={game.reset}>
                重玩本关
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4 w-full lg:w-64">
        {/* Difficulty Selector (for random mode) */}
        {game.mode === "random" && (
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">选择难度</h3>
            <div className="flex flex-col gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => game.setDifficulty(diff)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    game.difficulty === diff
                      ? "bg-amber-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {diff === "easy" ? "简单" : diff === "medium" ? "中等" : "困难"}
                </button>
              ))}
            </div>
            <Button
              className="mt-3 w-full"
              size="sm"
              onClick={game.generateLevel}
              disabled={game.isGenerating}
            >
              {game.isGenerating ? "生成中..." : "生成新关卡"}
            </Button>
            {game.generateError && (
              <p className="text-red-400 text-xs mt-2">{game.generateError}</p>
            )}
          </div>
        )}

        {/* Level Select (for classic mode) */}
        {game.mode === "classic" && (
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">选择关卡</h3>
            <div className="grid grid-cols-4 gap-1">
              {LEVELS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => game.setLevel(idx)}
                  className={`p-2 rounded text-sm font-medium transition-colors ${
                    game.level === idx
                      ? "bg-amber-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">当前关卡</div>
            <div className="font-bold text-white text-lg">{game.levelName}</div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-xs text-slate-400">步数</div>
              <div className="font-mono font-bold text-amber-400 text-lg">
                {game.moves}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">推箱</div>
              <div className="font-mono font-bold text-white text-lg">
                {game.pushes}
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">进度</div>
            <div className="font-mono text-sm text-slate-300">
              {game.boxes.filter((b) =>
                game.goals.some((g) => g.x === b.x && g.y === b.y)
              ).length} / {game.goals.length} 箱子到位
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="sm" onClick={game.undo} disabled={game.history.length === 0}>
            ↩ 撤销 (Ctrl+Z)
          </Button>
          <Button variant="danger" size="sm" onClick={game.reset}>
            🔄 重置 (R)
          </Button>
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-3 text-center">
            触控操作
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-[150px] mx-auto">
            <div></div>
            <Button size="sm" onClick={() => game.move("UP")}>↑</Button>
            <div></div>
            <Button size="sm" onClick={() => game.move("LEFT")}>←</Button>
            <Button size="sm" onClick={() => game.move("DOWN")}>↓</Button>
            <Button size="sm" onClick={() => game.move("RIGHT")}>→</Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-800 rounded-xl p-4 hidden lg:block">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">操作说明</div>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between"><span>移动</span><span className="text-slate-300">方向键 / WASD</span></div>
            <div className="flex justify-between"><span>撤销</span><span className="text-slate-300">Ctrl+Z</span></div>
            <div className="flex justify-between"><span>重置</span><span className="text-slate-300">R</span></div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">图例</div>
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-base">😊</span>
              <span>玩家</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">📦</span>
              <span>箱子</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-500/40 border border-amber-400/60"></span>
              <span>目标位置</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>箱子已到位</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
