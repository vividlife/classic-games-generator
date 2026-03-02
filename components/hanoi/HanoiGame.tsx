"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const DISK_COUNT = 4;
const TIME_LIMIT = 60; // seconds
const MIN_MOVES = Math.pow(2, DISK_COUNT) - 1; // 15 moves minimum

type Tower = number[]; // array of disk sizes (larger number = bigger disk)

function initTowers(): [Tower, Tower, Tower] {
  // Start with all disks on first tower, largest at bottom
  const first: Tower = [];
  for (let i = DISK_COUNT; i >= 1; i--) first.push(i);
  return [first, [], []];
}

const DISK_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
];

const DISK_BORDER_COLORS = [
  "border-red-700",
  "border-orange-700",
  "border-yellow-600",
  "border-green-700",
];

export default function HanoiGame() {
  const [towers, setTowers] = useState<[Tower, Tower, Tower]>(initTowers);
  const [selected, setSelected] = useState<number | null>(null); // tower index
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    setTowers(initTowers());
    setSelected(null);
    setMoves(0);
    setTimeLeft(TIME_LIMIT);
    setGameState("playing");
    setMessage("");
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") {
      stopTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          setGameState("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [gameState, stopTimer]);

  // Check win
  useEffect(() => {
    if (gameState !== "playing") return;
    // Win when all disks on tower 2 or tower 3 (index 1 or 2)
    if (towers[2].length === DISK_COUNT) {
      stopTimer();
      setGameState("won");
      setMessage(
        moves === MIN_MOVES
          ? "🏆 完美！最少步数完成！"
          : `🎉 完成！用了 ${moves} 步（最少需 ${MIN_MOVES} 步）`
      );
    }
  }, [towers, gameState, moves, stopTimer]);

  const handleTowerClick = (towerIdx: number) => {
    if (gameState !== "playing") return;

    if (selected === null) {
      // Select source tower (must have disks)
      if (towers[towerIdx].length === 0) {
        setMessage("该柱子上没有圆盘！");
        return;
      }
      setSelected(towerIdx);
      setMessage("");
    } else {
      if (selected === towerIdx) {
        // Deselect
        setSelected(null);
        setMessage("");
        return;
      }
      // Try to move
      const from = towers[selected];
      const to = towers[towerIdx];
      const topDisk = from[from.length - 1];

      if (to.length > 0 && to[to.length - 1] < topDisk) {
        setMessage("❌ 不能把大圆盘放在小圆盘上！");
        setSelected(null);
        return;
      }

      // Valid move
      const newTowers: [Tower, Tower, Tower] = [
        [...towers[0]],
        [...towers[1]],
        [...towers[2]],
      ];
      newTowers[towerIdx].push(newTowers[selected].pop()!);
      setTowers(newTowers);
      setMoves((m) => m + 1);
      setSelected(null);
      setMessage("");
    }
  };

  const diskWidth = (size: number) => 30 + size * 22; // px
  const timePercent = (timeLeft / TIME_LIMIT) * 100;
  const timeColor =
    timeLeft > 30 ? "bg-green-500" : timeLeft > 10 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="flex flex-col gap-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-700 rounded-xl p-3">
          <div className="text-2xl font-bold text-white">{moves}</div>
          <div className="text-slate-400 text-xs">步数</div>
        </div>
        <div className="bg-slate-700 rounded-xl p-3">
          <div
            className={`text-2xl font-bold ${
              timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white"
            }`}
          >
            {timeLeft}s
          </div>
          <div className="text-slate-400 text-xs">剩余时间</div>
        </div>
        <div className="bg-slate-700 rounded-xl p-3">
          <div className="text-2xl font-bold text-amber-400">{MIN_MOVES}</div>
          <div className="text-slate-400 text-xs">最少步数</div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${timeColor}`}
          style={{ width: `${timePercent}%` }}
        />
      </div>

      {/* Rules */}
      <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-400 flex flex-wrap gap-3">
        <span>📋 规则：将所有圆盘从左柱移到右柱</span>
        <span>⚠️ 大盘不能放小盘上</span>
        <span>⏱️ 限时 {TIME_LIMIT} 秒</span>
        <span>✨ 最少 {MIN_MOVES} 步完成</span>
      </div>

      {/* Game board */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
        <div className="flex justify-around items-end" style={{ height: 200 }}>
          {towers.map((tower, tIdx) => {
            const isSelected = selected === tIdx;
            const towerLabels = ["起始柱", "辅助柱", "目标柱"];
            return (
              <div
                key={tIdx}
                className="flex flex-col items-center gap-1 cursor-pointer"
                onClick={() => handleTowerClick(tIdx)}
              >
                <div
                  className={`text-xs mb-1 font-medium transition-colors ${
                    isSelected ? "text-blue-400" : "text-slate-500"
                  }`}
                >
                  {towerLabels[tIdx]}
                </div>
                {/* Tower with disks */}
                <div
                  className={`relative flex flex-col-reverse items-center border-2 rounded-lg transition-all ${
                    isSelected
                      ? "border-blue-400 bg-blue-900/20"
                      : "border-slate-600 hover:border-slate-400 bg-slate-800/50"
                  }`}
                  style={{ width: 130, height: 160, padding: "8px 4px" }}
                >
                  {/* Pole */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 bg-slate-500 rounded-full"
                    style={{ width: 8, height: 140, bottom: 8 }}
                  />
                  {/* Disks */}
                  {tower.map((diskSize, dIdx) => {
                    const isTop = dIdx === tower.length - 1;
                    const colorIdx = diskSize - 1;
                    return (
                      <div
                        key={diskSize}
                        className={`relative z-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          DISK_COLORS[colorIdx]
                        } ${DISK_BORDER_COLORS[colorIdx]} ${
                          isTop && isSelected ? "ring-2 ring-white ring-opacity-70" : ""
                        }`}
                        style={{
                          width: diskWidth(diskSize),
                          height: 22,
                          marginBottom: 2,
                        }}
                      >
                        <span className="text-white text-xs font-bold">{diskSize}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center text-amber-400 text-sm bg-amber-900/20 border border-amber-800/50 rounded-lg p-2">
          {message}
        </div>
      )}

      {/* Game state overlays */}
      {gameState === "idle" && (
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">
            点击柱子选择圆盘，再点击目标柱子移动。将所有 {DISK_COUNT} 个圆盘从左柱移到右柱！
          </p>
          <button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
          >
            开始游戏
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div className="flex justify-center gap-3">
          {selected !== null && (
            <div className="text-blue-400 text-sm bg-blue-900/20 border border-blue-800/50 rounded-lg px-3 py-2">
              已选中第 {selected + 1} 柱顶部圆盘，点击目标柱放置
            </div>
          )}
          <button
            onClick={startGame}
            className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            重新开始
          </button>
        </div>
      )}

      {gameState === "won" && (
        <div className="text-center bg-green-900/30 border border-green-700/50 rounded-xl p-6">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-xl font-bold text-green-400 mb-2">挑战成功！</h3>
          <p className="text-slate-300 mb-4">{message}</p>
          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            再玩一次
          </button>
        </div>
      )}

      {gameState === "lost" && (
        <div className="text-center bg-red-900/30 border border-red-700/50 rounded-xl p-6">
          <div className="text-4xl mb-2">⏰</div>
          <h3 className="text-xl font-bold text-red-400 mb-2">时间到！</h3>
          <p className="text-slate-300 mb-4">
            已移动 {moves} 步，还差 {DISK_COUNT - towers[2].length} 个圆盘。加油！
          </p>
          <button
            onClick={startGame}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            重新挑战
          </button>
        </div>
      )}
    </div>
  );
}
