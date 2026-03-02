import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import SokobanGame from "@/components/sokoban/SokobanGame";

export const metadata: Metadata = {
  title: "推箱子 - 荣升的游戏小站",
  description: "经典推箱子益智游戏，将所有箱子推到目标位置即可过关",
};

export default function SokobanPage() {
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
            📦 推箱子
          </h1>
        </div>
        <SokobanGame />
      </main>
    </>
  );
}
