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
            经典游戏
          </h1>
          <p className="text-slate-400 text-lg">
            畅玩贪吃蛇和俄罗斯方块，支持多种主题和难度设置
          </p>
        </div>

        {/* Game cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
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
