"use client";

import { useState, useCallback } from "react";

interface Question {
  total: number;
  description: string;
  hint: string;
  check: (groups: number[][]) => boolean;
}

// Pre-defined questions about number relationships
const QUESTIONS: Question[] = [
  {
    total: 10,
    description: "将 10 个圆片分成两组，使得一组是另一组的 2 倍",
    hint: "答案：一组 4 个，另一组 6 个（6 = 2×3，4 = 2×2）。试试 3 和 7？（7 ≠ 2×3）正确是：两组为 4 和 6",
    check: (groups) => {
      const sums = groups.map((g) => g.length).filter((n) => n > 0);
      if (sums.length !== 2) return false;
      const [a, b] = sums.sort((x, y) => x - y);
      return b === 2 * a;
    },
  },
  {
    total: 12,
    description: "将 12 个圆片分成三组，每组数量相等",
    hint: "12 ÷ 3 = 4，每组各 4 个",
    check: (groups) => {
      const sums = groups.map((g) => g.length).filter((n) => n > 0);
      if (sums.length !== 3) return false;
      return sums[0] === sums[1] && sums[1] === sums[2];
    },
  },
  {
    total: 15,
    description: "将 15 个圆片分成三组，使得每组比前一组多 2 个",
    hint: "设最少的一组为 n，则三组为 n, n+2, n+4，共 3n+6=15，所以 n=3",
    check: (groups) => {
      const sums = groups.map((g) => g.length).filter((n) => n > 0);
      if (sums.length !== 3) return false;
      const sorted = [...sums].sort((a, b) => a - b);
      return sorted[1] - sorted[0] === 2 && sorted[2] - sorted[1] === 2;
    },
  },
  {
    total: 9,
    description: "将 9 个圆片分成两组，使得两组的差为 3",
    hint: "设两组为 a 和 b，a+b=9，a-b=3，所以 a=6，b=3",
    check: (groups) => {
      const sums = groups.map((g) => g.length).filter((n) => n > 0);
      if (sums.length !== 2) return false;
      return Math.abs(sums[0] - sums[1]) === 3;
    },
  },
  {
    total: 20,
    description: "将 20 个圆片分成四组，使得每组数量相等",
    hint: "20 ÷ 4 = 5，每组各 5 个",
    check: (groups) => {
      const sums = groups.map((g) => g.length).filter((n) => n > 0);
      if (sums.length !== 4) return false;
      return sums.every((n) => n === sums[0]);
    },
  },
  {
    total: 8,
    description: "将 8 个圆片分成两组，使得两组的乘积最大",
    hint: "两组最接近时乘积最大：4 × 4 = 16",
    check: (groups) => {
      const sums = groups.map((g) => g.length).filter((n) => n > 0);
      if (sums.length !== 2) return false;
      return sums[0] === 4 && sums[1] === 4;
    },
  },
];

const MAX_GROUPS = 5;
const CIRCLE_COLORS = [
  "bg-blue-400 border-blue-600",
  "bg-rose-400 border-rose-600",
  "bg-amber-400 border-amber-600",
  "bg-green-400 border-green-600",
  "bg-purple-400 border-purple-600",
];

export default function CirclesGame() {
  const [currentQ, setCurrentQ] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [groups, setGroups] = useState<number[][]>([[]]);
  const [result, setResult] = useState<"" | "correct" | "wrong">("");
  const [showHint, setShowHint] = useState(false);

  const question = QUESTIONS[currentQ];

  // Total circles placed
  const placed = groups.reduce((s, g) => s + g.length, 0);
  const remaining = question.total - placed;

  const addCircle = (groupIdx: number) => {
    if (remaining <= 0) return;
    setGroups((prev) => {
      const next = prev.map((g, i) =>
        i === groupIdx ? [...g, groupIdx] : g
      );
      return next;
    });
    setResult("");
  };

  const removeCircle = (groupIdx: number) => {
    setGroups((prev) => {
      const next = prev.map((g, i) =>
        i === groupIdx && g.length > 0 ? g.slice(0, -1) : g
      );
      return next;
    });
    setResult("");
  };

  const addGroup = () => {
    if (groups.length >= MAX_GROUPS) return;
    setGroups((prev) => [...prev, []]);
    setResult("");
  };

  const removeGroup = () => {
    if (groups.length <= 1) return;
    setGroups((prev) => prev.slice(0, -1));
    setResult("");
  };

  const checkAnswer = () => {
    const correct = question.check(groups);
    if (placed !== question.total) {
      setResult("wrong");
      return;
    }
    setResult(correct ? "correct" : "wrong");
  };

  const nextQuestion = useCallback(() => {
    setCurrentQ((q) => (q + 1) % QUESTIONS.length);
    setGroups([[]]);
    setResult("");
    setRevealed(false);
    setShowHint(false);
  }, []);

  const prevQuestion = useCallback(() => {
    setCurrentQ((q) => (q - 1 + QUESTIONS.length) % QUESTIONS.length);
    setGroups([[]]);
    setResult("");
    setRevealed(false);
    setShowHint(false);
  }, []);

  const reset = () => {
    setGroups(groups.map(() => []));
    setResult("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Question card */}
      <div className="bg-slate-700 rounded-xl p-5 border border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevQuestion}
            className="text-slate-400 hover:text-white px-3 py-1 rounded transition-colors"
          >
            ‹ 上一题
          </button>
          <span className="text-slate-400 text-sm">
            {currentQ + 1} / {QUESTIONS.length}
          </span>
          <button
            onClick={nextQuestion}
            className="text-slate-400 hover:text-white px-3 py-1 rounded transition-colors"
          >
            下一题 ›
          </button>
        </div>

        {!revealed ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🎫</div>
            <p className="text-slate-400 text-sm mb-3">题目已隐藏，模拟从签中抽取</p>
            <button
              onClick={() => setRevealed(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm transition-colors"
            >
              抽签查看题目
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                共 {question.total} 个圆片
              </span>
            </div>
            <p className="text-white text-lg font-medium">{question.description}</p>
          </div>
        )}
      </div>

      {revealed && (
        <>
          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              已摆放：<span className="text-white font-bold">{placed}</span> /{" "}
              {question.total}
            </span>
            <span className="text-slate-400">
              剩余：<span className={remaining > 0 ? "text-amber-400 font-bold" : "text-green-400 font-bold"}>{remaining}</span>
            </span>
            <span className="text-slate-400">
              组数：<span className="text-white font-bold">{groups.filter(g => g.length > 0).length}</span>
            </span>
          </div>

          {/* Remaining circles pool */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 text-xs mb-2">待摆放圆片（{remaining} 个）</div>
            <div className="flex flex-wrap gap-2 min-h-8">
              {Array.from({ length: remaining }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-slate-500 border-2 border-slate-400"
                />
              ))}
            </div>
          </div>

          {/* Groups */}
          <div className="flex flex-col gap-3">
            {groups.map((group, gIdx) => (
              <div
                key={gIdx}
                className="bg-slate-800 rounded-xl p-4 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm font-medium">
                    第 {gIdx + 1} 组
                    <span className="ml-2 bg-slate-700 text-white text-xs px-2 py-0.5 rounded-full">
                      {group.length} 个
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeCircle(gIdx)}
                      disabled={group.length === 0}
                      className="w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <button
                      onClick={() => addCircle(gIdx)}
                      disabled={remaining <= 0}
                      className="w-7 h-7 rounded-full bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 min-h-8">
                  {group.map((_, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-8 h-8 rounded-full border-2 ${CIRCLE_COLORS[gIdx % CIRCLE_COLORS.length]}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Group controls */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={addGroup}
              disabled={groups.length >= MAX_GROUPS}
              className="bg-slate-600 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + 增加分组
            </button>
            <button
              onClick={removeGroup}
              disabled={groups.length <= 1}
              className="bg-slate-600 hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              − 减少分组
            </button>
            <button
              onClick={reset}
              className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              清空
            </button>
          </div>

          {/* Check answer */}
          <button
            onClick={checkAnswer}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            验证答案
          </button>

          {/* Result */}
          {result === "correct" && (
            <div className="text-center bg-green-900/30 border border-green-700/50 rounded-xl p-4">
              <div className="text-3xl mb-1">🎉</div>
              <p className="text-green-400 font-semibold">正确！数量关系理解得很好！</p>
              <button
                onClick={nextQuestion}
                className="mt-3 bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg text-sm transition-colors"
              >
                下一题
              </button>
            </div>
          )}
          {result === "wrong" && (
            <div className="text-center bg-red-900/30 border border-red-700/50 rounded-xl p-4">
              <div className="text-3xl mb-1">🤔</div>
              <p className="text-red-400 font-semibold">
                {placed !== question.total
                  ? `需要摆放全部 ${question.total} 个圆片！`
                  : "不对哦，再想想数量关系！"}
              </p>
            </div>
          )}

          {/* Hint */}
          <div className="text-center">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              {showHint ? "隐藏提示" : "💡 查看提示"}
            </button>
            {showHint && (
              <div className="mt-2 bg-amber-900/20 border border-amber-800/40 rounded-lg p-3 text-amber-300 text-sm text-left">
                {question.hint}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
