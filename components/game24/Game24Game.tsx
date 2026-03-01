"use client";

import { useGame24 } from "@/lib/useGame24";
import Button from "@/components/ui/Button";

export default function Game24Game() {
  const game = useGame24();

  // 游戏未开始
  if (game.cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-6">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-2">🃏</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">24点</h2>
          <p className="text-slate-400 text-xs sm:text-sm">使用四张牌通过加减乘除运算得到24</p>
        </div>

        <Button size="lg" onClick={game.startGame}>
          开始游戏
        </Button>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs text-center space-y-1">
          <p>每局随机4张牌（A=1, J=11, Q=12, K=13）</p>
          <p>使用 + - × ÷ 运算使结果等于24</p>
          <p>每张牌只能使用一次</p>
          <p>60秒内完成得分更高</p>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 max-w-xs text-center">
          <p className="text-slate-300 font-medium mb-1">示例</p>
          <p>牌面: 3, 4, 6, 8</p>
          <p>答案: (6 - 3) × (8 + 4) = 24</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-2xl mx-auto px-2 sm:px-4">
      {/* 状态栏 */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-center">
          <div className="text-slate-400 text-xs">得分</div>
          <div className="font-mono font-bold text-white text-lg">{game.score}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs">剩余时间</div>
          <div className={`font-mono font-bold text-lg ${game.timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
            {game.timeLeft}s
          </div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs">局数</div>
          <div className="font-mono font-bold text-white text-lg">{game.gamesPlayed}</div>
        </div>
      </div>

      {/* 牌面 */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {game.cards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => game.addToExpression(String(card.value))}
            className="w-14 h-20 sm:w-16 sm:h-24 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform border-2 border-slate-200"
          >
            <div className="text-red-600 text-lg sm:text-xl font-bold">{card.display}</div>
            <div className="text-red-600 text-xs mt-1">♠</div>
          </button>
        ))}
      </div>

      {/* 表达式输入 */}
      <div className="bg-slate-800 rounded-lg p-3">
        <div className="text-slate-400 text-xs mb-1">你的答案</div>
        <div className="bg-slate-900 rounded p-2 min-h-[40px] font-mono text-white text-lg">
          {game.expression || <span className="text-slate-500">点击牌和运算符构建表达式</span>}
        </div>
        {game.result && (
          <div className={`mt-2 text-sm ${game.isCorrect ? "text-green-400" : "text-red-400"}`}>
            结果: {game.result} {game.isCorrect ? "✓ 正确！" : "✗ 错误"}
          </div>
        )}
      </div>

      {/* 运算符按钮 */}
      <div className="flex justify-center gap-2">
        {["+", "-", "×", "÷", "(", ")"].map((op) => (
          <button
            key={op}
            onClick={() => game.addToExpression(op)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-lg sm:text-xl transition-colors"
          >
            {op}
          </button>
        ))}
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={game.backspace}>
          退格
        </Button>
        <Button variant="secondary" size="sm" onClick={game.clearExpression}>
          清空
        </Button>
        <Button variant="primary" size="sm" onClick={game.checkAnswer}>
          验证
        </Button>
        <Button variant="danger" size="sm" onClick={game.revealHint}>
          提示
        </Button>
      </div>

      {/* 提示 */}
      {game.showHint && game.hint && (
        <div className="bg-slate-800 rounded-lg p-3 text-center">
          <div className="text-slate-400 text-xs mb-1">提示</div>
          <div className="text-green-400 font-mono">{game.hint}</div>
        </div>
      )}

      {/* 游戏结束 */}
      {(game.isCorrect || game.timeLeft === 0) && (
        <div className="flex justify-center">
          <Button size="lg" onClick={game.startGame}>
            {game.isCorrect ? "下一局" : "再来一局"}
          </Button>
        </div>
      )}
    </div>
  );
}
