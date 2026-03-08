import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Game24Game from "@/components/game24/Game24Game";

export const metadata: Metadata = {
  title: "24点 - 荣升的游戏小站",
  description: "经典24点数学游戏，使用四张牌通过加减乘除运算得到24",
};

export default function Game24Page() {
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
            🃏 24点
          </h1>
        </div>
        <Game24Game />
      </main>
    </>
  );
}
