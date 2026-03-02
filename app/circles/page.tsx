import Link from "next/link";
import Header from "@/components/ui/Header";
import CirclesGame from "@/components/circles/CirclesGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "摆圆片 - 荣升的游戏小站",
  description: "解锁数关系，抽签获取题目，思考后用圆片摆出数量关系！",
};

export default function CirclesPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            ← 主页
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            ⭕ 解锁数关系「摆圆片」
          </h1>
        </div>
        <CirclesGame />
      </main>
    </>
  );
}
