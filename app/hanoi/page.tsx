import Link from "next/link";
import Header from "@/components/ui/Header";
import HanoiGame from "@/components/hanoi/HanoiGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "汉诺塔 - 荣升的游戏小站",
  description: "乾坤大挪移，将圆盘从一根柱子全部移到另一根，限时60秒！",
};

export default function HanoiPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-5 sm:py-6 lg:py-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors text-xs sm:text-sm touch-target inline-flex items-center py-2"
          >
            ← 主页
          </Link>
          <span className="text-slate-700 text-sm">/</span>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-1 sm:gap-2">
            🗼 汉诺塔
          </h1>
        </div>
        <HanoiGame />
      </main>
    </>
  );
}
