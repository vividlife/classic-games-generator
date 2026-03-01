"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { useGomoku, GomokuGameMode } from "@/lib/useGomoku";
import { Difficulty } from "@/types";
import GomokuBoard from "./GomokuBoard";
import Button from "@/components/ui/Button";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "简单",
  medium: "普通",
  hard: "困难",
};

const MODE_LABELS: Record<GomokuGameMode, string> = {
  pvc: "人机对战",
  pvp: "双人对战",
};

export default function GomokuGame() {
  const { difficulty: globalDifficulty } = useGameStore();
  const [selectedMode, setSelectedMode] = useState<GomokuGameMode>("pvc");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>(globalDifficulty);

  const game = useGomoku(selectedDifficulty, selectedMode);

  const handleStart = () => game.start(selectedMode);

  const handleReset = () => game.reset();

  // Determine if the board should accept clicks
  const boardDisabled =
    game.status !== "playing" ||
    (game.mode === "pvc" && game.currentPlayer === "white") ||
    game.aiThinking;

  const playerLabel =
    game.mode === "pvc"
      ? game.currentPlayer === "black"
        ? "你（黑方）"
        : "AI（白方）"
      : game.currentPlayer === "black"
      ? "黑方"
      : "白方";

  const winnerLabel =
    game.winner === null
      ? "平局"
      : game.mode === "pvc"
      ? game.winner === "black"
        ? "你赢了！"
        : "AI 获胜！"
      : game.winner === "black"
      ? "黑方获胜！"
      : "白方获胜！";

  // ── Idle screen ──────────────────────────────────────────────────────────
  if (game.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <div className="text-5xl mb-3">⚫⚪</div>
          <h2 className="text-2xl font-bold text-white mb-1">五子棋</h2>
          <p className="text-slate-400 text-sm">五子连珠即获胜，先手为黑方</p>
        </div>

        {/* Mode selection */}
        <div className="w-full max-w-xs">
          <p className="text-slate-300 text-sm font-medium mb-2 text-center">
            对战模式
          </p>
          <div className="flex gap-3 justify-center">
            {(["pvc", "pvp"] as GomokuGameMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                  selectedMode === mode
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105"
                    : "bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400"
                }`}
              >
                {MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (only for PvC) */}
        {selectedMode === "pvc" && (
          <div className="w-full max-w-xs">
            <p className="text-slate-300 text-sm font-medium mb-2 text-center">
              AI 难度
            </p>
            <div className="flex gap-2 justify-center">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all border-2 ${
                    selectedDifficulty === d
                      ? "bg-indigo-600 border-indigo-400 text-white shadow-md scale-105"
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button size="lg" onClick={handleStart}>
          开始游戏
        </Button>

        {/* Rules */}
        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs text-center space-y-1">
          <p>黑方先手，双方轮流落子</p>
          <p>率先连成5颗同色棋子者获胜</p>
          <p>横竖斜均可</p>
        </div>
      </div>
    );
  }

  // ── Playing / Game over ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left: board + overlay */}
      <div className="flex flex-col items-center gap-4">
        {/* Status bar */}
        <div className="flex items-center gap-6 text-sm w-full justify-center">
          <div className="text-center">
            <div className="text-slate-400 text-xs mb-0.5">模式</div>
            <div className="font-semibold text-white text-sm">
              {MODE_LABELS[game.mode]}
              {game.mode === "pvc" && (
                <span className="text-slate-400 text-xs ml-1">
                  ({DIFFICULTY_LABELS[selectedDifficulty]})
                </span>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs mb-0.5">步数</div>
            <div className="font-mono font-bold text-white text-xl">
              {game.moveHistory.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-xs mb-0.5">当前</div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full border border-gray-400 shadow"
                style={{
                  background:
                    game.currentPlayer === "black"
                      ? "radial-gradient(circle at 35% 35%, #666, #111)"
                      : "radial-gradient(circle at 35% 35%, #fff, #ccc)",
                }}
              />
              <span className="font-semibold text-white text-sm">
                {playerLabel}
              </span>
              {game.aiThinking && (
                <span className="text-xs text-indigo-400 animate-pulse">
                  思考中…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Board + game-over overlay */}
        <div className="relative">
          <GomokuBoard
            board={game.board}
            lastMove={game.lastMove}
            currentPlayer={game.currentPlayer}
            onPlace={game.placeStone}
            disabled={boardDisabled}
          />

          {game.status === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded">
              <div className="text-4xl mb-3">
                {game.isDraw ? "🤝" : game.winner === "black" ? "🎉" : "😔"}
              </div>
              <h2 className="text-white font-bold text-2xl mb-1">
                {winnerLabel}
              </h2>
              {!game.isDraw && (
                <p className="text-slate-300 text-sm mb-4">
                  共 {game.moveHistory.length} 步
                </p>
              )}
              {game.isDraw && (
                <p className="text-slate-300 text-sm mb-4">棋盘已满</p>
              )}
              <div className="flex gap-3">
                <Button onClick={handleReset}>再来一局</Button>
              </div>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={game.undo}
            disabled={!game.canUndo}
          >
            悔棋
          </Button>
          <Button variant="danger" size="sm" onClick={handleReset}>
            重新开始
          </Button>
        </div>
      </div>

      {/* Right: info sidebar */}
      <div className="w-full lg:w-56 space-y-4 flex-shrink-0">
        {/* Stone legend */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">棋子说明</h3>
          <div className="flex items-center gap-3 text-sm">
            <div
              className="w-5 h-5 rounded-full shadow"
              style={{
                background: "radial-gradient(circle at 35% 35%, #666, #111)",
              }}
            />
            <span className="text-slate-300">
              黑方{game.mode === "pvc" ? "（你）" : "（先手）"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div
              className="w-5 h-5 rounded-full shadow border border-gray-400"
              style={{
                background: "radial-gradient(circle at 35% 35%, #fff, #ccc)",
              }}
            />
            <span className="text-slate-300">
              白方{game.mode === "pvc" ? "（AI）" : "（后手）"}
            </span>
          </div>
        </div>

        {/* How to win */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">规则</h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• 黑方先手落子</li>
            <li>• 双方轮流落子</li>
            <li>• 连成5子即获胜</li>
            <li>• 横、竖、斜均可</li>
            <li>• 支持悔棋一步</li>
          </ul>
        </div>

        {/* Mode / difficulty quick switch */}
        {game.status === "gameover" && (
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
              换个玩法
            </h3>
            <div className="flex gap-2 mb-3">
              {(["pvc", "pvp"] as GomokuGameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selectedMode === mode
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {MODE_LABELS[mode]}
                </button>
              ))}
            </div>
            {selectedMode === "pvc" && (
              <div className="flex gap-1 mb-3">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      selectedDifficulty === d
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {DIFFICULTY_LABELS[d]}
                  </button>
                ))}
              </div>
            )}
            <Button
              size="sm"
              onClick={() => game.start(selectedMode)}
              variant="primary"
            >
              开始新局
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
