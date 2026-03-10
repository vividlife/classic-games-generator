import Header from "@/components/ui/Header";
import GoGame from "@/components/go/GoGame";
import Link from "next/link";

export const metadata = {
  title: "围棋 - 荣升的游戏小站",
  description: "经典围棋，支持双人对战和 AI 模式，9x9、13x13、19x19棋盘，含提子、禁入点、打劫规则",
};

export default function GoPage() {
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
            ⚫ 围棋
          </h1>
        </div>

        <div className="flex flex-col items-center gap-5 sm:gap-6 lg:gap-8">
          <GoGame />
        </div>
      </main>
    </>
  );
}
