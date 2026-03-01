import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import WerewolfDealer from "@/components/werewolf/WerewolfDealer";

export const metadata: Metadata = {
  title: "狼人杀发牌 - 荣升的游戏小站",
  description: "极简版狼人杀身份分配工具，支持自定义玩家人数和角色配置",
};

export default function WerewolfPage() {
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
            🐺 狼人杀发牌
          </h1>
        </div>
        <WerewolfDealer />
      </main>
    </>
  );
}
