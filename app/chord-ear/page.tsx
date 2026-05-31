import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import ChordEarGame from "@/components/chord-ear/ChordEarGame";

export const metadata: Metadata = {
  title: "和弦听辨 - 荣升的游戏小站",
  description: "网页版音乐听辨小游戏，支持学习模式、练习模式、家庭赛和成绩统计",
};

export default function ChordEarPage() {
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
            🎹 和弦听辨
          </h1>
        </div>
        <ChordEarGame />
      </main>
    </>
  );
}
