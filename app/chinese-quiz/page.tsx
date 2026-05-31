import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/ui/Header";
import ChineseQuizGame from "@/components/chinese-quiz/ChineseQuizGame";

export const metadata: Metadata = {
  title: "文常问答 - 荣升的游戏小站",
  description: "适合家庭口答的语文文学常识问答，支持语音读题、填空题、选择题和显示答案",
};

export default function ChineseQuizPage() {
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
            📚 文常问答
          </h1>
        </div>
        <ChineseQuizGame />
      </main>
    </>
  );
}
