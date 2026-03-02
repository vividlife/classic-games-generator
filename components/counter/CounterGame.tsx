"use client";

import { useState, useCallback } from "react";

type Task =
  | { type: "dial"; description: string; target: number[] }
  | { type: "read"; description: string; digits: number[] };

// Place names for multi-digit numbers
const PLACE_NAMES = ["个位", "十位", "百位", "千位", "万位"];

function digitsToNumber(digits: number[]): number {
  // digits[0] is the lowest place (ones), digits[n-1] is highest place
  return digits.reduce((acc, d, i) => acc + d * Math.pow(10, i), 0);
}

function numberToDigits(n: number, places: number): number[] {
  const digits: number[] = [];
  for (let i = 0; i < places; i++) {
    digits.push(Math.floor(n / Math.pow(10, i)) % 10);
  }
  return digits;
}

function generateTasks(places: number): Task[] {
  const tasks: Task[] = [];
  const maxVal = Math.pow(10, places);

  // Generate "dial to number" tasks
  const dialTargets = [
    Math.floor(Math.random() * maxVal),
    Math.floor(Math.random() * maxVal),
    Math.floor(Math.random() * maxVal),
  ];
  for (const t of dialTargets) {
    const digits = numberToDigits(t, places);
    tasks.push({
      type: "dial",
      description: `请将计数器拨到 ${t.toLocaleString()}`,
      target: digits,
    });
  }

  // Generate "read number" tasks
  for (let i = 0; i < 3; i++) {
    const n = Math.floor(Math.random() * maxVal);
    const digits = numberToDigits(n, places);
    tasks.push({
      type: "read",
      description: `读出计数器上显示的数字`,
      digits,
    });
  }

  // Shuffle
  return tasks.sort(() => Math.random() - 0.5);
}

function formatNumber(digits: number[]): string {
  return digitsToNumber(digits).toLocaleString();
}

function readNumber(digits: number[]): string {
  const n = digitsToNumber(digits);
  if (n === 0) return "零";

  const parts: string[] = [];
  const units = ["", "十", "百", "千", "万"];
  const cn = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

  // Simple Chinese number reading
  let str = n.toString();
  const len = str.length;
  let result = "";
  for (let i = 0; i < len; i++) {
    const d = parseInt(str[i]);
    const place = len - i - 1;
    if (d !== 0) {
      result += cn[d] + units[place];
    } else if (result && !result.endsWith("零") && place !== 0) {
      result += "零";
    }
  }
  result = result.replace(/零+$/, "");
  if (n >= 10 && n < 20) result = result.replace(/^一十/, "十");
  return result || "零";
}

export default function CounterGame() {
  const [places, setPlaces] = useState(2); // 2 = tens, ones
  const [tasks, setTasks] = useState<Task[]>(() => generateTasks(2));
  const [currentTask, setCurrentTask] = useState(0);
  const [digits, setDigits] = useState<number[]>(() => Array(2).fill(0));
  const [result, setResult] = useState<"" | "correct" | "wrong">("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [readInput, setReadInput] = useState("");

  const task = tasks[currentTask];

  const changePlaces = (newPlaces: number) => {
    setPlaces(newPlaces);
    setDigits(Array(newPlaces).fill(0));
    setTasks(generateTasks(newPlaces));
    setCurrentTask(0);
    setResult("");
    setShowAnswer(false);
    setReadInput("");
  };

  const dialDigit = (placeIdx: number, delta: 1 | -1) => {
    setDigits((prev) => {
      const next = [...prev];
      next[placeIdx] = (next[placeIdx] + delta + 10) % 10;
      return next;
    });
    setResult("");
    setShowAnswer(false);
  };

  const checkAnswer = () => {
    if (task.type === "dial") {
      const correct = digits.every((d, i) => d === task.target[i]);
      setResult(correct ? "correct" : "wrong");
    } else {
      // Read task: check if input matches the number
      const target = digitsToNumber(task.digits);
      const inputNum = parseInt(readInput.replace(/,/g, "").trim());
      setResult(inputNum === target ? "correct" : "wrong");
    }
  };

  const nextTask = useCallback(() => {
    const next = (currentTask + 1) % tasks.length;
    setCurrentTask(next);
    setDigits(Array(places).fill(0));
    setResult("");
    setShowAnswer(false);
    setReadInput("");
  }, [currentTask, tasks.length, places]);

  const regenerate = () => {
    setTasks(generateTasks(places));
    setCurrentTask(0);
    setDigits(Array(places).fill(0));
    setResult("");
    setShowAnswer(false);
    setReadInput("");
  };

  const displayDigits = task.type === "read" ? task.digits : digits;
  const displayValue = digitsToNumber(displayDigits);

  return (
    <div className="flex flex-col gap-6">
      {/* Place selector */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-slate-400 text-sm self-center">位数：</span>
        {[2, 3, 4, 5].map((p) => (
          <button
            key={p}
            onClick={() => changePlaces(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              places === p
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {p} 位数（{PLACE_NAMES[p - 1]}～{PLACE_NAMES[0]}）
          </button>
        ))}
      </div>

      {/* Task card */}
      <div className="bg-slate-700 rounded-xl p-5 border border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-xs">
            任务 {currentTask + 1} / {tasks.length}
          </span>
          <div className="flex gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                task.type === "dial"
                  ? "bg-blue-900 text-blue-300"
                  : "bg-purple-900 text-purple-300"
              }`}
            >
              {task.type === "dial" ? "拨数" : "读数"}
            </span>
          </div>
        </div>
        <p className="text-white text-lg font-semibold">{task.description}</p>
      </div>

      {/* Counter display */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
        <div className="text-center text-slate-400 text-xs mb-4">计数器</div>
        <div className="flex justify-center gap-3 flex-wrap">
          {Array.from({ length: places })
            .reverse()
            .map((_, reverseIdx) => {
              const placeIdx = places - 1 - reverseIdx;
              const digit = displayDigits[placeIdx];
              const isDialTask = task.type === "dial";
              return (
                <div key={placeIdx} className="flex flex-col items-center gap-2">
                  <div className="text-slate-500 text-xs">{PLACE_NAMES[placeIdx]}</div>
                  <div className="flex flex-col items-center">
                    {isDialTask && (
                      <button
                        onClick={() => dialDigit(placeIdx, 1)}
                        className="w-12 h-8 bg-slate-700 hover:bg-slate-600 rounded-t-lg text-slate-300 hover:text-white flex items-center justify-center transition-colors text-lg"
                      >
                        ▲
                      </button>
                    )}
                    <div
                      className={`w-12 flex items-center justify-center text-3xl font-bold font-mono bg-slate-800 border border-slate-600 ${
                        isDialTask ? "" : "rounded-lg"
                      } ${
                        task.type === "read"
                          ? "text-amber-400"
                          : result === "correct" && digits[placeIdx] === (task.type === "dial" ? task.target[placeIdx] : 0)
                          ? "text-green-400"
                          : "text-white"
                      }`}
                      style={{ height: 56 }}
                    >
                      {digit}
                    </div>
                    {isDialTask && (
                      <button
                        onClick={() => dialDigit(placeIdx, -1)}
                        className="w-12 h-8 bg-slate-700 hover:bg-slate-600 rounded-b-lg text-slate-300 hover:text-white flex items-center justify-center transition-colors text-lg"
                      >
                        ▼
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Current value */}
        <div className="text-center mt-4 text-slate-400 text-sm">
          当前值：
          <span className="text-white font-bold text-lg ml-1">
            {displayValue.toLocaleString()}
          </span>
          {displayValue > 0 && (
            <span className="ml-2 text-slate-500">
              （{readNumber(displayDigits)}）
            </span>
          )}
        </div>
      </div>

      {/* Read task input */}
      {task.type === "read" && (
        <div className="flex gap-3">
          <input
            type="number"
            value={readInput}
            onChange={(e) => {
              setReadInput(e.target.value);
              setResult("");
            }}
            placeholder="输入你读出的数字..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-lg"
          />
        </div>
      )}

      {/* Dial task: target display if showing answer */}
      {task.type === "dial" && showAnswer && (
        <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 text-amber-300 text-sm">
          💡 答案：{task.target.reverse().join(" ")} — 各位数字从高位到低位：
          {[...task.target].reverse().map((d, i) => (
            <span key={i} className="ml-1">
              {PLACE_NAMES[task.target.length - 1 - i]}{d}
            </span>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={checkAnswer}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          验证答案
        </button>
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {showAnswer ? "隐藏答案" : "💡 查看答案"}
        </button>
        <button
          onClick={nextTask}
          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          下一题 →
        </button>
        <button
          onClick={regenerate}
          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          重新抽签
        </button>
      </div>

      {/* Result */}
      {result === "correct" && (
        <div className="text-center bg-green-900/30 border border-green-700/50 rounded-xl p-4">
          <div className="text-3xl mb-1">🎉</div>
          <p className="text-green-400 font-semibold">
            {task.type === "dial" ? "拨数正确！" : "读数正确！"} 数感棒棒的！
          </p>
          <button
            onClick={nextTask}
            className="mt-3 bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg text-sm transition-colors"
          >
            继续下一题
          </button>
        </div>
      )}
      {result === "wrong" && (
        <div className="text-center bg-red-900/30 border border-red-700/50 rounded-xl p-4">
          <div className="text-3xl mb-1">🤔</div>
          <p className="text-red-400 font-semibold">
            {task.type === "dial"
              ? `不对哦！当前是 ${formatNumber(digits)}，目标是 ${formatNumber(task.target)}`
              : `不对哦！正确答案是 ${digitsToNumber(task.digits).toLocaleString()}`}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-400">
        <p className="font-medium text-slate-300 mb-1">玩法说明</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            <span className="text-blue-300">拨数</span>：按▲▼调整各位数字，使计数器显示目标数
          </li>
          <li>
            <span className="text-purple-300">读数</span>：观察计数器上的数，输入你读出的数值
          </li>
          <li>选择不同位数来调整难度</li>
        </ul>
      </div>
    </div>
  );
}
