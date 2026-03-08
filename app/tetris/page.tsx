import Header from "@/components/ui/Header";
import TetrisGame from "@/components/tetris/TetrisGame";
import GameSettings from "@/components/ui/GameSettings";
import Link from "next/link";

export const metadata = {
  title: "俄罗斯方块 - 荣升的游戏小站",
  description: "畅玩经典俄罗斯方块，支持自定义主题和难度",
};

export default function TetrisPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-sm touch-target inline-flex items-center py-2">
            ← 主页
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            🟦 俄罗斯方块
          </h1>
        </div>

        <div className="flex flex-col gap-8 items-start">
          {/* Game */}
          <div className="w-full">
            <TetrisGame />
          </div>

          {/* Settings sidebar */}
          <div className="w-full bg-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">游戏设置</h2>
            <GameSettings />
          </div>
        </div>
      </main>
    </>
  );
}
