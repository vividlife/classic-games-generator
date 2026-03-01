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
            🃏 24点
          </h1>
        </div>
        <Game24Game />
      </main>
    </>
  );
}
