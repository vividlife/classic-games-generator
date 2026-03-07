"use client";

import { useGame24, type DifficultyLevel } from "@/lib/useGame24";
import Button from "@/components/ui/Button";

const OPERATORS = ["+", "-", "×", "÷"];

const STEP_HINTS: Record<string, string> = {
  select1: "第一步：选择第一张牌",
  selectOp: "第二步：选择运算符",
  select2: "第三步：选择第二张牌",
};

const DIFFICULTIES: { level: DifficultyLevel; label: string; color: string }[] = [
  { level: "easy", label: "简单", color: "bg-green-600" },
  { level: "medium", label: "中等", color: "bg-yellow-600" },
  { level: "hard", label: "困难", color: "bg-red-600" },
  { level: "expert", label: "极难", color: "bg-fuchsia-700" },
];

const DIFFICULTY_RULES: Record<DifficultyLevel, string> = {
  easy: "数字范围 1-6，仅使用 + - ×，中间结果保持整数",
  medium: "数字范围 1-9，可使用 + - × ÷",
  hard: "数字范围 1-13，解法中至少包含一次除法",
  expert: "数字范围 2-13，解法中包含除法且出现小数中间结果",
};

export default function Game24Game() {
  const game = useGame24();

  if (game.cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-2">🃏</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">24点</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            使用四张牌通过加减乘除运算得到 24
          </p>
        </div>

        {/* 难度选择 */}
        <div className="flex gap-2">
          {DIFFICULTIES.map(({ level, label, color }) => (
            <button
              key={level}
              onClick={() => game.setDifficulty!(level)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                game.difficulty === level
                  ? `${color} text-white`
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Button size="lg" onClick={game.startGame}>
          开始游戏
        </Button>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs text-center space-y-1">
          <p>每局随机 4 张牌（随难度调整范围）</p>
          <p>{DIFFICULTY_RULES[game.difficulty]}</p>
          <p>点击第一张牌 → 选运算符 → 点击第二张牌</p>
          <p>自动计算结果，重复直到只剩一张牌</p>
          <p>最终结果等于 24 即为胜利</p>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs text-center">
          <p className="text-slate-300 font-medium mb-1">示例</p>
          <p>牌面：3, 4, 6, 8</p>
          <p>选 6，选 −，选 3 → 得到 3</p>
          <p>选 3，选 ×，选 8 → 得到 24 ✓</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto px-4 py-4">
      {/* 难度显示和切换 */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">难度：</span>
        {DIFFICULTIES.map(({ level, label, color }) => (
          <button
            key={level}
            onClick={() => {
              game.setDifficulty!(level);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              game.difficulty === level
                ? `${color} text-white`
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 步骤提示 */}
      {!game.isGameOver && (
        <div className="text-slate-300 text-sm font-medium bg-slate-800/60 px-4 py-2 rounded-full">
          {STEP_HINTS[game.step]}
        </div>
      )}

      {/* 牌面 */}
      <div className="flex justify-center gap-3">
        {game.cards.map((card, idx) => {
          const isSelected = idx === game.selectedIndex;
          const isDisabled =
            game.isGameOver ||
            game.step === "selectOp" ||
            (game.step === "select2" && idx === game.selectedIndex);

          return (
            <button
              key={card.id}
              onClick={() => !isDisabled && game.selectCard(idx)}
              disabled={isDisabled}
              className={`w-16 h-24 rounded-xl shadow-lg flex items-center justify-center font-bold text-2xl transition-all border-2
                ${
                  isSelected
                    ? "bg-indigo-500 border-indigo-300 text-white scale-110 shadow-indigo-500/30"
                    : isDisabled
                    ? "bg-white border-slate-300 text-slate-400 cursor-not-allowed opacity-50"
                    : "bg-white border-slate-200 text-slate-800 hover:scale-105 hover:border-indigo-400 cursor-pointer"
                }`}
            >
              {card.display}
            </button>
          );
        })}
      </div>

      {/* 运算符 */}
      <div className="flex gap-3">
        {OPERATORS.map((op) => {
          const isActive = game.selectedOp === op;
          const isDisabled = game.isGameOver || game.step !== "selectOp";

          return (
            <button
              key={op}
              onClick={() => !isDisabled && game.selectOp(op)}
              disabled={isDisabled}
              className={`w-14 h-14 rounded-xl font-bold text-xl transition-all border-2
                ${
                  isActive
                    ? "bg-indigo-500 border-indigo-300 text-white"
                    : isDisabled
                    ? "bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed opacity-50"
                    : "bg-indigo-700 border-indigo-500 text-white hover:bg-indigo-600 cursor-pointer"
                }`}
            >
              {op}
            </button>
          );
        })}
      </div>

      {/* 消息提示 */}
      {game.message && (
        <div
          className={`text-sm font-medium text-center px-4 py-2 rounded-lg ${
            game.isWon
              ? "bg-green-900/40 text-green-400"
              : "bg-red-900/40 text-red-400"
          }`}
        >
          {game.message}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {!game.isGameOver &&
          (game.step === "selectOp" || game.step === "select2") && (
            <Button variant="secondary" size="sm" onClick={game.cancelSelection}>
              取消选择
            </Button>
          )}
        {!game.isGameOver && (
          <Button variant="secondary" size="sm" onClick={game.showHint}>
            💡 提示
          </Button>
        )}
        <Button
          variant={game.isGameOver ? "primary" : "secondary"}
          size="sm"
          onClick={game.startGame}
        >
          重新开始
        </Button>
      </div>

      {/* 提示显示 */}
      {game.hint && (
        <div className="bg-yellow-900/40 text-yellow-400 text-sm font-medium text-center px-4 py-2 rounded-lg">
          {game.hint}
        </div>
      )}

      {/* 进度信息 */}
      {!game.isGameOver && (
        <div className="text-slate-500 text-xs">
          剩余 {game.cards.length} 张牌 · 第 {game.gamesPlayed} 局
        </div>
      )}

      {game.puzzleScore !== null && game.solutionCount !== null && (
        <div className="w-full bg-slate-800/60 rounded-xl px-4 py-3 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">当前局评分</span>
            <span className="text-slate-200 font-semibold">
              {game.puzzleScore} / 8
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">目标分桶</span>
            <span className="text-slate-300">
              {game.targetScoreRange[0]}-{game.targetScoreRange[1]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">解法数（估计）</span>
            <span className="text-slate-300">{game.solutionCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">分桶命中</span>
            <span
              className={
                game.bucketMatched ? "text-green-400 font-medium" : "text-yellow-400 font-medium"
              }
            >
              {game.bucketMatched ? "是" : "否（已降级可解）"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
