"use client";

import Link from "next/link";
import { useGuessNumber } from "@/lib/useGuessNumber";
import Button from "@/components/ui/Button";

export default function GuessNumberGame() {
  const game = useGuessNumber();

  // 游戏未开始
  if (!game.secretNumber) {
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        <div className="w-full flex items-center gap-2 mb-2">
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ← 返回
          </Link>
        </div>

        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-2">🔢</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">猜数字</h2>
          <p className="text-slate-400 text-xs sm:text-sm">经典的几A几B猜数字游戏</p>
        </div>

        <Button size="lg" onClick={game.startGame}>
          开始游戏
        </Button>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs text-center space-y-1">
          <p>系统生成一个4位不重复的数字</p>
          <p>你猜测这个数字</p>
          <p>A表示数字和位置都对</p>
          <p>B表示数字对但位置不对</p>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs text-center">
          <p className="text-slate-300 font-medium mb-1">示例</p>
          <p>答案: 1234</p>
          <p>猜测: 1357</p>
          <p>结果: 1A1B（1对，1位置错）</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-md mx-auto px-2 sm:px-4">
      {/* 返回按钮 */}
      <div className="w-full">
        <Link
          href="/"
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
        >
          ← 返回首页
        </Link>
      </div>

      {/* 标题 */}
      <div className="text-center">
        <div className="text-3xl sm:text-4xl mb-1">🔢</div>
        <h2 className="text-lg sm:text-xl font-bold text-white">猜数字</h2>
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-slate-400 text-xs">已猜次数</div>
          <div className="font-mono font-bold text-white text-lg">{game.attempts}</div>
        </div>
      </div>

      {/* 当前输入 */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-xs mb-2 text-center">输入4位不重复数字</div>
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-12 h-14 sm:w-14 sm:h-16 bg-slate-900 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-mono font-bold text-white border-2 border-slate-700"
            >
              {game.currentGuess[i] || ""}
            </div>
          ))}
        </div>
        {game.currentGuess.length === 4 && !game.isValidGuess(game.currentGuess) && (
          <div className="text-red-400 text-xs text-center mt-2">
            数字不能重复！
          </div>
        )}
      </div>

      {/* 数字键盘 */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => {
          const isUsed = game.currentGuess.includes(String(digit));
          return (
            <button
              key={digit}
              onClick={() => !isUsed && game.inputDigit(String(digit))}
              disabled={isUsed || game.currentGuess.length >= 4}
              className={`h-12 sm:h-14 rounded-lg font-bold text-lg transition-all ${
                isUsed
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95"
              }`}
            >
              {digit}
            </button>
          );
        })}
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={game.deleteDigit}>
          退格
        </Button>
        <Button variant="secondary" size="sm" onClick={game.clearInput}>
          清空
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={game.submitGuess}
          disabled={game.currentGuess.length !== 4 || !game.isValidGuess(game.currentGuess)}
        >
          确认
        </Button>
      </div>

      {/* 猜测历史 */}
      {game.guesses.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-2">猜测记录</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {game.guesses.map((g, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-900 rounded px-3 py-1.5"
              >
                <span className="font-mono text-white">{g.guess}</span>
                <span className={`font-bold ${g.a === 4 ? "text-green-400" : "text-yellow-400"}`}>
                  {g.a}A{g.b}B
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 胜利提示 */}
      {game.isWon && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-green-400 font-bold text-lg mb-1">恭喜猜对了！</div>
          <div className="text-slate-300 text-sm mb-3">
            答案是 <span className="font-mono font-bold">{game.secretNumber}</span>，
            共用了 {game.attempts} 次
          </div>
          <Button onClick={game.startGame}>再来一局</Button>
        </div>
      )}
    </div>
  );
}