"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGo, BoardSize, GoPlayer, GoMode } from "@/lib/useGo";
import { computeAIMove } from "@/lib/go-ai";
import GoBoard from "@/components/go/GoBoard";

const BOARD_SIZES: BoardSize[] = [9, 13, 19];

export default function GoGame() {
  const [selectedSize, setSelectedSize] = useState<BoardSize>(9);
  const [selectedMode, setSelectedMode] = useState<GoMode>("pvp");
  const [confirmResign, setConfirmResign] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const game = useGo();
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playerLabel = (p: GoPlayer) => (p === "black" ? "黑方" : "白方");

  const isAITurn = game.mode === "ai" && game.status === "playing" && game.currentPlayer === game.aiPlayer;
  const isHumanTurn = game.status === "playing" && !isAITurn;

  // AI auto-play
  useEffect(() => {
    if (!isAITurn || aiThinking) return;

    setAiThinking(true);
    // Small delay so the UI shows "AI thinking" before the move
    aiTimerRef.current = setTimeout(() => {
      const move = computeAIMove(game.board, game.currentPlayer, game.koPoint, game.boardSize);
      if (move.type === "place" && move.row !== undefined && move.col !== undefined) {
        game.placeStone(move.row, move.col);
      } else {
        game.pass();
      }
      setAiThinking(false);
    }, 400);

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [isAITurn, game.board, game.currentPlayer, game.koPoint, game.boardSize, game.placeStone, game.pass, aiThinking]);

  // Reset AI thinking state on game reset/over
  useEffect(() => {
    if (game.status !== "playing") {
      setAiThinking(false);
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    }
  }, [game.status]);

  const handleUndo = useCallback(() => {
    game.undo();
  }, [game]);

  // Idle screen: mode + board size selection
  if (game.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <div className="text-5xl mb-3">⚫⚪</div>
          <h2 className="text-2xl font-bold text-white mb-1">围棋</h2>
          <p className="text-slate-400 text-sm">Go · Baduk · Weiqi</p>
        </div>

        {/* Mode selection */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-400 text-sm">选择模式</p>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedMode("pvp")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMode === "pvp"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              双人对战
            </button>
            <button
              onClick={() => setSelectedMode("ai")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMode === "ai"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              人机对战
            </button>
          </div>
        </div>

        {/* Board size selection */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-slate-400 text-sm">选择棋盘大小</p>
          <div className="flex gap-3">
            {BOARD_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? "bg-amber-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => game.start(selectedSize, selectedMode)}
          className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
        >
          开始对局
        </button>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs space-y-1 text-center">
          <p>黑方先手，双方交替在交叉点落子</p>
          <p>包围对方棋子（断其全部气）将其提走</p>
          <p>不能落在无气之处（除非能提子）</p>
          <p>打劫：不能立即在劫材处落子</p>
          <p>双方连续虚手（Pass）则对局结束</p>
          {selectedMode === "ai" && (
            <p className="text-amber-400 mt-2">人机模式：你执黑，AI 执白</p>
          )}
        </div>
      </div>
    );
  }

  const isPlaying = game.status === "playing";
  const boardDisabled = !isPlaying || isAITurn;

  // Labels with AI indicator
  const blackLabel = game.mode === "ai" && game.aiPlayer === "black" ? "黑方(AI)" : game.mode === "ai" ? "黑方(你)" : "黑方";
  const whiteLabel = game.mode === "ai" && game.aiPlayer === "white" ? "白方(AI)" : game.mode === "ai" ? "白方(你)" : "白方";

  // For AI mode undo: need at least 2 history entries (player + AI round)
  const canUndo = game.mode === "ai" ? game.history.length >= 2 : game.history.length > 0;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Mode badge */}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded ${game.mode === "ai" ? "bg-amber-900/60 text-amber-300" : "bg-slate-700 text-slate-300"}`}>
          {game.mode === "ai" ? "人机对战" : "双人对战"}
        </span>
        <span className="text-xs text-slate-500">{game.boardSize}×{game.boardSize}</span>
      </div>

      {/* Score / Player display */}
      <div className="flex items-center gap-4 justify-center flex-wrap">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            game.currentPlayer === "black" && isPlaying
              ? "bg-slate-700 ring-2 ring-slate-300"
              : "bg-slate-800"
          }`}
        >
          <div
            className="w-5 h-5 rounded-full shadow"
            style={{ background: "radial-gradient(circle at 35% 35%, #666, #111)" }}
          />
          <span className="text-white text-sm font-medium">{blackLabel}</span>
          <span className="text-slate-400 text-xs ml-1">提 {game.capturedByBlack}</span>
        </div>

        <span className="text-slate-500 text-sm font-medium">VS</span>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            game.currentPlayer === "white" && isPlaying
              ? "bg-slate-700 ring-2 ring-gray-200"
              : "bg-slate-800"
          }`}
        >
          <div
            className="w-5 h-5 rounded-full shadow border border-gray-300"
            style={{ background: "radial-gradient(circle at 35% 35%, #fff, #ddd)" }}
          />
          <span className="text-white text-sm font-medium">{whiteLabel}</span>
          <span className="text-slate-400 text-xs ml-1">提 {game.capturedByWhite}</span>
        </div>
      </div>

      {/* Status text */}
      {isPlaying && (
        <p className="text-slate-400 text-sm">
          {aiThinking ? (
            <span className="text-amber-400 animate-pulse">AI 思考中...</span>
          ) : (
            <>
              当前：
              <span className="font-semibold text-white">
                {playerLabel(game.currentPlayer)}
                {game.mode === "ai" && game.currentPlayer !== game.aiPlayer && "（你）"}
              </span>
              的回合
            </>
          )}
          {game.consecutivePasses > 0 && !aiThinking && (
            <span className="text-amber-400"> · 对方已虚手</span>
          )}
        </p>
      )}

      {/* Board */}
      <div className="relative overflow-x-auto">
        <GoBoard
          board={game.board}
          boardSize={game.boardSize}
          lastMove={game.lastMove}
          koPoint={game.koPoint}
          currentPlayer={game.currentPlayer}
          onPlace={game.placeStone}
          disabled={boardDisabled}
        />

        {/* Game over overlay */}
        {game.status === "gameover" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 rounded-lg">
            <div className="text-4xl mb-2">
              {game.winReason === "resign"
                ? game.winner === "black"
                  ? "⚫"
                  : "⚪"
                : "🏁"}
            </div>
            <h2 className="text-white font-bold text-2xl mb-1">
              {game.winReason === "resign" && game.winner
                ? `${playerLabel(game.winner)}获胜！`
                : "对局结束"}
            </h2>
            <p className="text-slate-300 text-sm mb-1">
              {game.winReason === "resign" ? "对方认输" : "双方连续虚手"}
            </p>
            <p className="text-slate-400 text-xs mb-5">
              黑提 {game.capturedByBlack} 子 · 白提 {game.capturedByWhite} 子
            </p>
            <button
              onClick={game.reset}
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg transition-colors"
            >
              返回主菜单
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      {isPlaying && (
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={game.pass}
            disabled={isAITurn}
            className="bg-slate-600 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            虚手（Pass）
          </button>

          <button
            onClick={handleUndo}
            disabled={!canUndo || isAITurn}
            className="bg-slate-600 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            悔棋
          </button>

          {confirmResign ? (
            <>
              <button
                onClick={() => {
                  setConfirmResign(false);
                  // In AI mode, human resigns (non-AI player)
                  const resignPlayer = game.mode === "ai"
                    ? (game.aiPlayer === "black" ? "white" : "black")
                    : game.currentPlayer;
                  game.resign(resignPlayer);
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                确认认输
              </button>
              <button
                onClick={() => setConfirmResign(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmResign(true)}
              disabled={isAITurn}
              className="bg-red-800 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              认输
            </button>
          )}

          <button
            onClick={() => {
              setConfirmResign(false);
              game.reset();
            }}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            重新开始
          </button>
        </div>
      )}
    </div>
  );
}
