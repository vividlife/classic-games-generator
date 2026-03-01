import Link from "next/link";
import Header from "@/components/ui/Header";
import GameSettings from "@/components/ui/GameSettings";

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            荣升的游戏小站
          </h1>
          <p className="text-slate-400 text-lg">
            畅玩贪吃蛇、俄罗斯方块、五子棋、24点、猜数字、狼人杀和数独，支持多种主题和难度设置
          </p>
        </div>

        {/* Game cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link
            href="/snake"
            className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-green-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl mb-4">🐍</div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
              贪吃蛇
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              引导蛇吃食物让它变得更长，避免撞到自己！
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-green-900/50 text-green-300 px-2 py-1 rounded">
                方向键 / WASD
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">
                穿墙环绕
              </span>
            </div>
            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-green-500 transition-colors text-xl">
              →
            </div>
          </Link>

          <Link
            href="/tetris"
            className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl mb-4">🟦</div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
              俄罗斯方块
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              堆叠下落的方块消除整行来得分，看你能坚持多久！
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded">
                方向键
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">
                空格键快速下落
              </span>
            </div>
            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-indigo-500 transition-colors text-xl">
              →
            </div>
          </Link>

          <Link
            href="/gomoku"
            className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl mb-4">⚫</div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
              五子棋
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              与 AI 或好友对弈，率先连成五子即获胜！
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-amber-900/50 text-amber-300 px-2 py-1 rounded">
                人机 / 双人
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">
                三档难度
              </span>
            </div>
            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-amber-500 transition-colors text-xl">
              →
            </div>
          </Link>

          <Link
            href="/game24"
            className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl mb-4">🃏</div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
              24点
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              使用四张牌通过加减乘除运算得到24！
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded">
                计时挑战
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">
                提示功能
              </span>
            </div>
            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-red-500 transition-colors text-xl">
              →
            </div>
          </Link>

          <Link
            href="/guess-number"
            className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl mb-4">🔢</div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              猜数字
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              经典几A几B游戏，猜出4位不重复的数字！
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                逻辑推理
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">
                无限尝试
              </span>
            </div>
            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-purple-500 transition-colors text-xl">
              →
            </div>
          </Link>

          <Link
            href="/werewolf"
            className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-purple-700/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl mb-4">🐺</div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
              狼人杀发牌
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              极简版身份分配工具，支持自定义玩家数和角色配置！
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                随机发牌
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">
                私密查看
              </span>
            </div>
            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-purple-400 transition-colors text-xl">
              →
            </div>
          </Link>

          <Link
            href="/sudoku"
            className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl mb-4">🧩</div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              数独
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              经典9×9数独，填入数字让每行每列每宫格不重复！
            </p>
            <div className="flex gap-2 text-xs">
              <span className="bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded">
                四档难度
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">
                提示功能
              </span>
            </div>
            <div className="absolute top-4 right-4 text-slate-600 group-hover:text-cyan-500 transition-colors text-xl">
              →
            </div>
          </Link>
        </div>

        {/* Settings panel */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-white mb-4">
            游戏设置
          </h2>
          <GameSettings />
        </div>
      </main>
    </>
  );
}
