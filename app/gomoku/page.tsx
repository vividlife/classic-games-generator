import Header from "@/components/ui/Header";
import GomokuGame from "@/components/gomoku/GomokuGame";
import Link from "next/link";

export const metadata = {
  title: "五子棋 - 荣升的游戏小站",
  description: "畅玩经典五子棋，支持人机对战和双人对战模式",
};

export default function GomokuPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-6 lg:py-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors text-xs sm:text-sm touch-target inline-flex items-center py-2"
          >
            ← 主页
          </Link>
          <span className="text-slate-700 text-sm">/</span>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2">
            ⚫ 五子棋
          </h1>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8 items-start">
          {/* Game */}
          <div className="w-full min-w-0">
            <GomokuGame />
          </div>
        </div>
      </main>
    </>
  );
}
