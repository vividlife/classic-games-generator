import Header from "@/components/ui/Header";
import SnakeGame from "@/components/snake/SnakeGame";
import GameSettings from "@/components/ui/GameSettings";
import Link from "next/link";

export const metadata = {
  title: "贪吃蛇 - 荣升的游戏小站",
  description: "畅玩经典贪吃蛇游戏，支持自定义主题和难度",
};

export default function SnakePage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
            ← 主页
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🐍 贪吃蛇
          </h1>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Game */}
          <div className="flex-1">
            <SnakeGame />
          </div>

          {/* Settings sidebar */}
          <div className="w-full xl:w-64 bg-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">游戏设置</h2>
            <GameSettings />
          </div>
        </div>
      </main>
    </>
  );
}
