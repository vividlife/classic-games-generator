import Header from "@/components/ui/Header";
import ReversiGame from "@/components/reversi/ReversiGame";
import Link from "next/link";

export const metadata = {
  title: "黑白棋 - 荣升的游戏小站",
  description: "经典黑白棋（Othello/Reversi），双人对战翻转棋子",
};

export default function ReversiPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-6 lg:py-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors text-xs sm:text-sm touch-target inline-flex items-center py-2"
          >
            ← 主页
          </Link>
          <span className="text-slate-700 text-sm">/</span>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2">
            ⬛ 黑白棋
          </h1>
        </div>

        <div className="flex flex-col items-center gap-5 sm:gap-6 lg:gap-8">
          <ReversiGame />
        </div>
      </main>
    </>
  );
}
