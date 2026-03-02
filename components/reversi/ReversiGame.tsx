"use client";

import { useEffect, useRef, useState } from "react";
import { useReversi, BOARD_SIZE, ReversiPlayer } from "@/lib/useReversi";
import Button from "@/components/ui/Button";

function Piece({
  color,
  isFlipping,
}: {
  color: ReversiPlayer;
  isFlipping: boolean;
}) {
  return (
    <div
      className={`w-full h-full rounded-full shadow-md transition-transform duration-300 ${
        isFlipping ? "reversi-flip" : ""
      } ${
        color === "black"
          ? "bg-gradient-to-br from-gray-600 to-gray-900 border border-gray-700"
          : "bg-gradient-to-br from-white to-gray-200 border border-gray-300"
      }`}
    />
  );
}

function ValidHint({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full flex items-center justify-center group cursor-pointer"
      aria-label="落子"
    >
      <div className="w-1/3 h-1/3 rounded-full bg-slate-400/40 group-hover:bg-slate-400/70 group-hover:scale-125 transition-all duration-150" />
    </button>
  );
}

function ReversiBoard() {
  const game = useReversi();
  const [flippingCells, setFlippingCells] = useState<Set<string>>(new Set());
  const prevFlippedRef = useRef<[number, number][]>([]);

  // Trigger flip animation whenever flippedCells changes
  useEffect(() => {
    if (game.flippedCells.length === 0) return;
    const key = JSON.stringify(game.flippedCells);
    const prevKey = JSON.stringify(prevFlippedRef.current);
    if (key === prevKey) return;
    prevFlippedRef.current = game.flippedCells;

    const ids = new Set(game.flippedCells.map(([r, c]) => `${r}-${c}`));
    setFlippingCells(ids);
    const timer = setTimeout(() => setFlippingCells(new Set()), 350);
    return () => clearTimeout(timer);
  }, [game.flippedCells]);

  const cellSize = 52; // px, fixed desktop size

  if (game.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <div className="text-5xl mb-3">⬛⬜</div>
          <h2 className="text-2xl font-bold text-white mb-1">黑白棋</h2>
          <p className="text-slate-400 text-sm">
            Othello / Reversi · 双人对战
          </p>
        </div>

        <Button size="lg" onClick={game.start}>
          开始游戏
        </Button>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs space-y-1 text-center">
          <p>黑方先手，轮流在棋盘落子</p>
          <p>落子须夹住对方棋子，被夹住的翻转颜色</p>
          <p>无法落子时自动跳过，双方均无法落子时结算</p>
          <p>棋子多者获胜</p>
        </div>
      </div>
    );
  }

  const playerLabel = (p: ReversiPlayer) => (p === "black" ? "黑方" : "白方");
  const winnerEmoji =
    game.winner === "draw" ? "🤝" : game.winner === "black" ? "⬛" : "⬜";
  const winnerLabel =
    game.winner === "draw"
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
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 border border-gray-600 shadow flex-shrink-0" />
          <span className="text-white font-bold text-xl">{game.score.black}</span>
          <span className="text-slate-400 text-xs">黑</span>
        </div>

        <div className="text-slate-500 text-sm font-medium">VS</div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            game.currentPlayer === "white" && game.status === "playing"
              ? "bg-slate-700 ring-2 ring-gray-300"
              : "bg-slate-800"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-gray-200 border border-gray-300 shadow flex-shrink-0" />
          <span className="text-white font-bold text-xl">{game.score.white}</span>
          <span className="text-slate-400 text-xs">白</span>
        </div>
      </div>

      {/* Status message */}
      <div className="h-6 flex items-center">
        {game.status === "playing" && game.skipped && (
          <p className="text-amber-400 text-sm animate-pulse">
            {playerLabel(game.currentPlayer === "black" ? "white" : "black")}无法落子，跳过回合
          </p>
        )}
        {game.status === "playing" && !game.skipped && (
          <p className="text-slate-400 text-sm">
            当前：
            <span className={`font-semibold ${game.currentPlayer === "black" ? "text-gray-200" : "text-white"}`}>
              {playerLabel(game.currentPlayer)}
            </span>
            的回合
          </p>
        )}
      </div>

      {/* Board */}
      <div className="relative">
        <div
          className="grid gap-0.5 bg-emerald-800 p-1.5 rounded-lg shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          }}
        >
          {Array.from({ length: BOARD_SIZE }, (_, r) =>
            Array.from({ length: BOARD_SIZE }, (_, c) => {
              const cell = game.board[r][c];
              const isValid = game.isValidMove(r, c);
              const isLast =
                game.lastMove?.[0] === r && game.lastMove?.[1] === c;
              const isFlipping = flippingCells.has(`${r}-${c}`);

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex items-center justify-center rounded-sm transition-colors ${
                    isLast ? "bg-emerald-600" : "bg-emerald-700 hover:bg-emerald-600/80"
                  }`}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {/* Padding inside cell */}
                  <div className="absolute inset-1">
                    {cell ? (
                      <Piece color={cell} isFlipping={isFlipping} />
                    ) : isValid && game.status === "playing" ? (
                      <ValidHint onClick={() => game.place(r, c)} />
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Game over overlay */}
        {game.status === "gameover" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 rounded-lg">
            <div className="text-4xl mb-2">{winnerEmoji}</div>
            <h2 className="text-white font-bold text-2xl mb-1">{winnerLabel}</h2>
            <p className="text-slate-300 text-sm mb-4">
              黑 {game.score.black} — 白 {game.score.white}
            </p>
            <Button onClick={game.start}>再来一局</Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button variant="danger" size="sm" onClick={game.reset}>
          重新开始
        </Button>
      </div>

      {/* Legend */}
      <div className="bg-slate-800 rounded-xl p-3 text-xs text-slate-400 max-w-xs w-full">
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-400/50" />
            <span>可落子位置</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-600" />
            <span>最后落子</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReversiGame() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-center min-w-fit px-2">
        <ReversiBoard />
      </div>
    </div>
  );
}
