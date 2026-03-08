import Link from "next/link";
import Header from "@/components/ui/Header";
import TangramGame from "@/components/tangram/TangramGame";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "七巧板 - 荣升的游戏小站",
  description: "巧手拼世界，用七块拼板拼出各种图案，锻炼空间想象力！",
};

export default function TangramPage() {
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
            🧩 七巧板
          </h1>
        </div>
        <TangramGame />
      </main>
    </>
  );
}
