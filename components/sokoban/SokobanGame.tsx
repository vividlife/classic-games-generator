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

        {/* Solver Section */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">自动求解</div>
          <div className="flex flex-col gap-2">
            {!game.solution ? (
              <Button
                size="sm"
                onClick={game.findSolution}
                disabled={game.isSolving}
              >
                {game.isSolving ? "求解中..." : "🧩 求解关卡"}
              </Button>
            ) : (
              <>
                <div className="text-sm text-slate-300 mb-2">
                  找到解法！共 {game.solution.length} 步
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={game.stepSolution}
                    disabled={game.solutionStep >= game.solution.length || game.status === "gameover"}
                  >
                    下一步
                  </Button>
                  {game.isAutoPlaying ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={game.stopAutoPlay}
                    >
                      暂停
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={game.startAutoPlay}
                      disabled={game.solutionStep >= game.solution.length || game.status === "gameover"}
                    >
                      ▶ 自动演示
                    </Button>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    game.stopAutoPlay();
                    game.clearSolution();
                  }}
                >
                  清除解法
                </Button>
              </>
            )}
            {game.solveError && (
              <p className="text-red-400 text-xs mt-2">{game.solveError}</p>
            )}
          </div>

          {/* Direction Color Legend */}
          {game.solution && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2">方向颜色</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-red-500 flex items-center justify-center text-white font-bold">↑</span>
                  <span className="text-slate-300">上 (红)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-white font-bold">↓</span>
                  <span className="text-slate-300">下 (蓝)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-green-500 flex items-center justify-center text-white font-bold">←</span>
                  <span className="text-slate-300">左 (绿)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-yellow-500 flex items-center justify-center text-white font-bold">→</span>
                  <span className="text-slate-300">右 (黄)</span>
                </div>
              </div>
            </div>
          )}

          {/* Hint Button */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <Button
              size="sm"
              variant={game.showHint && game.solution ? "primary" : "secondary"}
              onClick={() => {
                if (!game.solution && !game.isSolving) {
                  game.findSolution();
                }
                game.toggleHint();
              }}
            >
              💡 {game.showHint ? "隐藏提示" : "显示提示"}
            </Button>
            {game.showHint && game.solution && game.solutionStep < game.solution.length && (
              <div className="mt-2 p-2 bg-slate-700 rounded text-center">
                <div className="text-xs text-slate-400">下一步</div>
                <div className={`text-2xl font-bold ${
                  game.solution[game.solutionStep] === 'UP' ? 'text-red-400' :
                  game.solution[game.solutionStep] === 'DOWN' ? 'text-blue-400' :
                  game.solution[game.solutionStep] === 'LEFT' ? 'text-green-400' :
                  'text-yellow-400'
                }`}>
                  {game.directionNames[game.solution[game.solutionStep]]}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  进度: {game.solutionStep + 1} / {game.solution.length}
                </div>
              </div>
            )}
          </div>

          {/* Solution Steps Display */}
          {game.solution && game.solution.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2">求解步骤</div>
              <div className="bg-slate-900 rounded p-2 max-h-24 overflow-y-auto">
                <div className="font-mono text-xs flex flex-wrap gap-1">
                  {game.solution.map((step, idx) => (
                    <span
                      key={idx}
                      className={`w-6 h-6 rounded flex items-center justify-center font-bold ${
                        idx < game.solutionStep
                          ? "bg-green-600 text-white"
                          : idx === game.solutionStep
                          ? "bg-amber-500 text-white animate-pulse"
                          : step === 'UP'
                          ? "bg-red-500 text-white"
                          : step === 'DOWN'
                          ? "bg-blue-500 text-white"
                          : step === 'LEFT'
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {game.directionNames[step]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
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
