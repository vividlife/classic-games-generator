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
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            ← 主页
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ⚫ 五子棋
          </h1>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          {/* Game */}
          <div className="flex-1 min-w-0">
            <GomokuGame />
          </div>
        </div>
      </main>
    </>
  );
}
