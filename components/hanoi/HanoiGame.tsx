"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Tower = number[];

const MIN_DISKS = 3;
const MAX_DISKS = 7;

const ALL_DISK_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-purple-500",
];

const ALL_DISK_BORDER_COLORS = [
  "border-red-700",
  "border-orange-700",
  "border-yellow-600",
  "border-green-700",
  "border-teal-700",
  "border-blue-700",
  "border-purple-700",
];

function initTowers(diskCount: number): [Tower, Tower, Tower] {
  const first: Tower = [];
  for (let i = diskCount; i >= 1; i--) first.push(i);
  return [first, [], []];
}

function getMinMoves(n: number) {
  return Math.pow(2, n) - 1;
}

function getTimeLimit(n: number) {
  // Scale time with difficulty: 3→45s, 4→60s, 5→120s, 6→240s, 7→480s
  const timeLimits: Record<number, number> = {
    3: 45,
    4: 60,
    5: 120,
    6: 240,
    7: 480,
  };
  return timeLimits[n] ?? 60;
}

function canPlace(tower: Tower, diskSize: number): boolean {
  return tower.length === 0 || tower[tower.length - 1] > diskSize;
}

export default function HanoiGame() {
  const [diskCount, setDiskCount] = useState(4);
  const [towers, setTowers] = useState<[Tower, Tower, Tower]>(() =>
    initTowers(4)
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(getTimeLimit(4));
  const [gameState, setGameState] = useState<
    "idle" | "playing" | "won" | "lost"
  >("idle");
  const [message, setMessage] = useState("");
  const [lastMoved, setLastMoved] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const minMoves = getMinMoves(diskCount);
  const timeLimit = getTimeLimit(diskCount);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    setTowers(initTowers(diskCount));
    setSelected(null);
    setMoves(0);
    setTimeLeft(getTimeLimit(diskCount));
    setGameState("playing");
    setMessage("");
    setLastMoved(null);
  }, [diskCount]);

  const changeDiskCount = (n: number) => {
    setDiskCount(n);
    setTowers(initTowers(n));
    setSelected(null);
    setMoves(0);
    setTimeLeft(getTimeLimit(n));
    setGameState("idle");
    setMessage("");
    setLastMoved(null);
    stopTimer();
  };

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
    if (towers[2].length === diskCount) {
      stopTimer();
      setGameState("won");
      setMessage(
        moves === minMoves
          ? "🏆 完美！最少步数完成！"
          : `🎉 完成！用了 ${moves} 步（最少需 ${minMoves} 步）`
      );
    }
  }, [towers, gameState, moves, stopTimer, diskCount, minMoves]);

  // Smart click: supports both "click source then target" and "direct click target"
  // When nothing selected: clicking a tower with disks selects it.
  // When selected: clicking valid target moves the disk.
  // Smart shortcut: if clicking an empty tower or a tower whose top is larger,
  // and there's exactly ONE valid source, auto-move from that source.
  const handleTowerClick = (towerIdx: number) => {
    if (gameState !== "playing") return;

    if (selected !== null) {
      // Already have a source selected
      if (selected === towerIdx) {
        setSelected(null);
        setMessage("");
        return;
      }

      const from = towers[selected];
      const to = towers[towerIdx];
      const topDisk = from[from.length - 1];

      if (!canPlace(to, topDisk)) {
        setMessage("❌ 不能把大圆盘放在小圆盘上！");
        setSelected(null);
        return;
      }

      // Valid move
      doMove(selected, towerIdx);
      return;
    }

    // Nothing selected yet
    const tower = towers[towerIdx];

    if (tower.length > 0) {
      // Select this tower as source
      setSelected(towerIdx);
      setMessage("");
      return;
    }

    // Clicked an empty tower - try smart auto-move:
    // find all towers that can legally move their top disk here
    const validSources: number[] = [];
    for (let i = 0; i < 3; i++) {
      if (i === towerIdx || towers[i].length === 0) continue;
      const topDisk = towers[i][towers[i].length - 1];
      if (canPlace(tower, topDisk)) {
        validSources.push(i);
      }
    }

    if (validSources.length === 1) {
      doMove(validSources[0], towerIdx);
    } else if (validSources.length > 1) {
      setMessage("点击要移动的源柱子");
    }
  };

  const doMove = (fromIdx: number, toIdx: number) => {
    const newTowers: [Tower, Tower, Tower] = [
      [...towers[0]],
      [...towers[1]],
      [...towers[2]],
    ];
    newTowers[toIdx].push(newTowers[fromIdx].pop()!);
    setTowers(newTowers);
    setMoves((m) => m + 1);
    setSelected(null);
    setMessage("");
    setLastMoved({ from: fromIdx, to: toIdx });
  };

  // Disk width scales based on diskCount so they all fit nicely
  const maxDiskWidth = 110; // max width in px for the largest disk
  const minDiskWidth = 28;
  const diskWidth = (size: number) => {
    if (diskCount === 1) return maxDiskWidth;
    return (
      minDiskWidth +
      ((size - 1) / (diskCount - 1)) * (maxDiskWidth - minDiskWidth)
    );
  };

  const timePercent = (timeLeft / timeLimit) * 100;
  const timeColor =
    timeLeft > timeLimit * 0.5
      ? "bg-green-500"
      : timeLeft > timeLimit * 0.17
        ? "bg-yellow-500"
        : "bg-red-500";

  // Determine which towers are valid drop targets when a disk is selected
  const validTargets = new Set<number>();
  if (selected !== null && towers[selected].length > 0) {
    const topDisk = towers[selected][towers[selected].length - 1];
    for (let i = 0; i < 3; i++) {
      if (i !== selected && canPlace(towers[i], topDisk)) {
        validTargets.add(i);
      }
    }
  }

  // Tower height scales with disk count
  const towerHeight = Math.max(160, diskCount * 28 + 40);
  const towerLabels = ["起始柱", "辅助柱", "目标柱"];

  return (
    <div className="flex flex-col gap-4">
      {/* Disk count selector - always visible */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="text-slate-400 text-sm">圆盘数量：</span>
        {Array.from({ length: MAX_DISKS - MIN_DISKS + 1 }, (_, i) => {
          const n = MIN_DISKS + i;
          const isActive = n === diskCount;
          return (
            <button
              key={n}
              onClick={() => changeDiskCount(n)}
              disabled={gameState === "playing"}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                isActive
                  ? "bg-blue-600 text-white ring-2 ring-blue-400"
                  : gameState === "playing"
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 active:bg-slate-500"
              }`}
            >
              {n}
            </button>
          );
        })}
        {gameState === "playing" && (
          <span className="text-slate-500 text-xs ml-1">（游戏中不可切换）</span>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-700 rounded-xl p-3">
          <div className="text-2xl font-bold text-white">{moves}</div>
          <div className="text-slate-400 text-xs">步数</div>
        </div>
        <div className="bg-slate-700 rounded-xl p-3">
          <div
            className={`text-2xl font-bold ${
              timeLeft <= timeLimit * 0.17
                ? "text-red-400 animate-pulse"
                : "text-white"
            }`}
          >
            {timeLeft}s
          </div>
          <div className="text-slate-400 text-xs">剩余时间</div>
        </div>
        <div className="bg-slate-700 rounded-xl p-3">
          <div className="text-2xl font-bold text-amber-400">{minMoves}</div>
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
      <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
        <span>📋 将所有圆盘从左柱移到右柱</span>
        <span>⚠️ 大盘不能放小盘上</span>
        <span>⏱️ 限时 {timeLimit} 秒</span>
        <span>💡 点击圆盘拿起，点目标柱放下</span>
      </div>

      {/* Game board */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-3 sm:p-4">
        <div
          className="flex justify-around items-end"
          style={{ minHeight: towerHeight + 40 }}
        >
          {towers.map((tower, tIdx) => {
            const isSelected = selected === tIdx;
            const isValidTarget = validTargets.has(tIdx);
            const hasDisks = tower.length > 0;
            const topDiskMovable =
              gameState === "playing" && hasDisks && selected === null;

            return (
              <div
                key={tIdx}
                className="flex flex-col items-center gap-0.5 select-none"
                style={{ minWidth: 40, flex: "1 1 0" }}
                onClick={() => handleTowerClick(tIdx)}
              >
                {/* Tower label */}
                <div
                  className={`text-xs mb-1 font-medium transition-colors ${
                    isSelected
                      ? "text-blue-400"
                      : isValidTarget
                        ? "text-green-400"
                        : "text-slate-500"
                  }`}
                >
                  {towerLabels[tIdx]}
                </div>

                {/* Tower container */}
                <div
                  className={`relative flex flex-col-reverse items-center rounded-lg transition-all cursor-pointer border-2 ${
                    isSelected
                      ? "border-blue-400 bg-blue-900/20"
                      : isValidTarget
                        ? "border-green-500/60 bg-green-900/10"
                        : "border-slate-600/50 hover:border-slate-400 bg-slate-800/30"
                  }`}
                  style={{
                    width: "100%",
                    maxWidth: 140,
                    height: towerHeight,
                    padding: "8px 4px",
                  }}
                >
                  {/* Pole */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 bg-slate-500/70 rounded-full"
                    style={{
                      width: 6,
                      height: towerHeight - 20,
                      bottom: 8,
                    }}
                  />

                  {/* Valid target indicator */}
                  {isValidTarget && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-green-400 text-lg animate-bounce z-20">
                      ↓
                    </div>
                  )}

                  {/* Disks */}
                  {tower.map((diskSize, dIdx) => {
                    const isTop = dIdx === tower.length - 1;
                    // Map disk size to a color index spread across available colors
                    const colorIdx = diskSize - 1;
                    const color =
                      ALL_DISK_COLORS[colorIdx % ALL_DISK_COLORS.length];
                    const borderColor =
                      ALL_DISK_BORDER_COLORS[
                        colorIdx % ALL_DISK_BORDER_COLORS.length
                      ];

                    return (
                      <div
                        key={diskSize}
                        className={`relative z-10 rounded-full border-2 flex items-center justify-center transition-all ${color} ${borderColor} ${
                          isTop && isSelected
                            ? "ring-2 ring-white/80 -translate-y-2 scale-105"
                            : ""
                        } ${
                          isTop && topDiskMovable
                            ? "ring-1 ring-white/30 hover:ring-2 hover:ring-white/60"
                            : ""
                        }`}
                        style={{
                          width: diskWidth(diskSize),
                          height: 22,
                          marginBottom: 2,
                        }}
                      >
                        <span className="text-white text-xs font-bold drop-shadow">
                          {diskSize}
                        </span>
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
      {message && gameState === "playing" && (
        <div className="text-center text-amber-400 text-sm bg-amber-900/20 border border-amber-800/50 rounded-lg p-2">
          {message}
        </div>
      )}

      {/* Game state overlays */}
      {gameState === "idle" && (
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">
            点击柱子选择顶部圆盘，再点击目标柱子移动。将所有 {diskCount}{" "}
            个圆盘从左柱移到右柱！
          </p>
          <button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
          >
            开始游戏
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {selected !== null && (
            <div className="text-blue-400 text-sm bg-blue-900/20 border border-blue-800/50 rounded-lg px-3 py-2">
              已选中第 {selected + 1} 柱顶部圆盘 → 点击绿色目标柱放置
            </div>
          )}
          <button
            onClick={startGame}
            className="bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
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
            className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
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
            已移动 {moves} 步，还差 {diskCount - towers[2].length}{" "}
            个圆盘。加油！
          </p>
          <button
            onClick={startGame}
            className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            重新挑战
          </button>
        </div>
      )}
    </div>
  );
}
