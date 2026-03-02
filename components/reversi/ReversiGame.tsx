"use client";

import { useState } from "react";
import { useReversi, ReversiGameMode } from "@/lib/useReversi";
import ReversiBoard from "@/components/reversi/ReversiBoard";

export default function ReversiGame() {
  const [difficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [mode, setMode] = useState<ReversiGameMode>("pvp");
  const game = useReversi(difficulty, mode);

  const playerLabel = (p: "black" | "white") => (p === "black" ? "黑方" : "白方");

  if (game.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <div className="text-5xl mb-3">⬛⬜</div>
          <h2 className="text-2xl font-bold text-white mb-1">黑白棋</h2>
          <p className="text-slate-400 text-sm">Othello / Reversi</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setMode("pvp")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "pvp"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            双人对战
          </button>
          <button
            onClick={() => setMode("pvc")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "pvc"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            人机对战
          </button>
        </div>

        <button
          onClick={() => game.start(mode)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
        >
          开始游戏
        </button>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs space-y-1 text-center">
          <p>黑方先手，轮流在棋盘落子</p>
          <p>落子须夹住对方棋子，被夹住的翻转颜色</p>
          <p>无法落子时自动跳过，双方均无法落子时结算</p>
          <p>棋子多者获胜</p>
        </div>
      </div>
    );
  }

  const winnerLabel =
    game.winner == null
      ? "平局！"
      : game.winner === "black"
      ? "黑方获胜！"
      : "白方获胜！";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Score bar */}
      <div className="flex items-center gap-6 w-full max-w-sm justify-center">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            game.currentPlayer === "black" && game.status === "playing"
              ? "bg-slate-700 ring-2 ring-slate-400"
              : "bg-slate-800"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 border border-gray-600 shadow" />
          <span className="text-white font-bold text-xl">{game.blackCount}</span>
          <span className="text-slate-400 text-xs">黑</span>
        </div>

        <span className="text-slate-500 text-sm font-medium">VS</span>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            game.currentPlayer === "white" && game.status === "playing"
              ? "bg-slate-700 ring-2 ring-gray-300"
              : "bg-slate-800"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-gray-200 border border-gray-300 shadow" />
          <span className="text-white font-bold text-xl">{game.whiteCount}</span>
          <span className="text-slate-400 text-xs">白</span>
        </div>
      </div>

      {/* Status */}
      <div className="h-6 flex items-center">
        {game.status === "playing" && game.skippedLastTurn && (
          <p className="text-amber-400 text-sm animate-pulse">
            对方无法落子，继续你的回合
          </p>
        )}
        {game.status === "playing" && !game.skippedLastTurn && (
          <p className="text-slate-400 text-sm">
            当前：
            <span className="font-semibold text-white">
              {playerLabel(game.currentPlayer)}
            </span>
            {game.aiThinking ? " (AI思考中...)" : "的回合"}
          </p>
        )}
      </div>

      {/* Board */}
      <div className="relative overflow-x-auto">
        <ReversiBoard
          board={game.board}
          lastMove={game.lastMove}
          validMoves={game.validMoves}
          currentPlayer={game.currentPlayer}
          onPlace={game.placePiece}
          disabled={
            game.status !== "playing" ||
            game.aiThinking ||
            (mode === "pvc" && game.currentPlayer === "white")
          }
        />

        {game.status === "gameover" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 rounded-lg">
            <div className="text-4xl mb-2">
              {game.winner === "black" ? "⬛" : game.winner === "white" ? "⬜" : "🤝"}
            </div>
            <h2 className="text-white font-bold text-2xl mb-1">{winnerLabel}</h2>
            <p className="text-slate-300 text-sm mb-4">
              黑 {game.blackCount} — 白 {game.whiteCount}
            </p>
            <button
              onClick={() => game.start(mode)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              再来一局
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={game.reset}
          className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          重新开始
        </button>
      </div>
    </div>
  );
}
