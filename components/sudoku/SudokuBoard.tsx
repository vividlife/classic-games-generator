"use client";

import { useEffect } from "react";
import { useSudoku, type Difficulty } from "@/lib/useSudoku";

const DIFFICULTIES: Difficulty[] = ["简单", "普通", "困难", "专家"];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function SudokuBoard() {
  const {
    board,
    selectedCell,
    difficulty,
    isComplete,
    timer,
    hintsUsed,
    isStarted,
    newGame,
    selectCell,
    inputNumber,
    clearCell,
    getHint,
    getCellHighlight,
  } = useSudoku();

  // Keyboard input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        inputNumber(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        clearCell();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [inputNumber, clearCell]);

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 px-2 sm:px-4 py-4 sm:py-8">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => newGame(d)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-target ${
              difficulty === d && isStarted
                ? "bg-cyan-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => newGame()}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors touch-target"
        >
          新游戏
        </button>
      </div>

      {/* Stats bar */}
      {isStarted && (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400">
          <span>⏱ {formatTime(timer)}</span>
          <span>难度：{difficulty}</span>
          <span>提示：{hintsUsed} 次</span>
        </div>
      )}

      {/* Win banner */}
      {isComplete && (
        <div className="bg-cyan-900/60 border border-cyan-500/50 rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-cyan-300 font-semibold text-sm sm:text-lg text-center">
          🎉 恭喜完成！用时 {formatTime(timer)}，使用提示 {hintsUsed} 次
        </div>
      )}

      {!isStarted ? (
        <div className="text-slate-400 text-center">
          <p className="mb-4 text-base sm:text-lg">选择难度开始游戏</p>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => newGame(d)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-medium transition-colors touch-target text-sm sm:text-base"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Sudoku grid - 响应式容器 */}
          <div className="game-board-container-sm sm:game-board-container">
            <div
              className="grid gap-0 border-2 border-slate-400 rounded-sm w-full h-full"
              style={{ display: "grid", gridTemplateColumns: "repeat(9,1fr)" }}
            >
              {board.map((row, ri) =>
                row.map((cell, ci) => {
                  const { isSelected, isRelated, isSameNumber } = getCellHighlight(ri, ci);
                  const rightBorder = ci === 2 || ci === 5;
                  const bottomBorder = ri === 2 || ri === 5;

                  let bg = "bg-slate-800";
                  if (isSelected) bg = "bg-cyan-700/80";
                  else if (isSameNumber) bg = "bg-cyan-900/60";
                  else if (isRelated) bg = "bg-slate-700/60";

                  let textColor = "text-white";
                  if (cell.isError) textColor = "text-red-400";
                  else if (!cell.isGiven && cell.value !== 0) textColor = "text-cyan-300";
                  else if (cell.isGiven) textColor = "text-slate-200";

                  return (
                    <div
                      key={`${ri}-${ci}`}
                      onClick={() => selectCell(ri, ci)}
                      className={`
                        relative aspect-square flex items-center justify-center
                        cursor-pointer select-none text-sm sm:text-base md:text-lg font-semibold
                        border border-slate-600/50 transition-colors touch-target
                        ${bg} ${textColor}
                        ${rightBorder ? "border-r-2 border-r-slate-400" : ""}
                        ${bottomBorder ? "border-b-2 border-b-slate-400" : ""}
                      `}
                    >
                      {cell.value !== 0 ? cell.value : ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Number input panel */}
          <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => inputNumber(n)}
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm sm:text-lg transition-colors touch-target"
              >
                {n}
              </button>
            ))}
            <button
              onClick={clearCell}
              className="px-3 sm:px-4 h-9 sm:h-10 md:h-12 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-xs sm:text-sm transition-colors touch-target"
            >
              清除
            </button>
          </div>

          {/* Hint button */}
          <button
            onClick={getHint}
            disabled={isComplete}
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-amber-700/80 hover:bg-amber-600/80 text-white font-medium text-xs sm:text-sm transition-colors disabled:opacity-40 touch-target"
          >
            💡 提示（已用 {hintsUsed} 次）
          </button>
        </>
      )}
    </div>
  );
}
