import Link from "next/link";
import Header from "@/components/ui/Header";
import CounterGame from "@/components/counter/CounterGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "拨数读数 - 荣升的游戏小站",
  description: "数感拨拨乐，抽签按要求拨数、读数，训练数感！",
};

export default function CounterPage() {
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
            🔢 数感拨拨乐「拨数读数」
          </h1>
        </div>
        <CounterGame />
      </main>
    </>
  );
}
