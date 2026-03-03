import Header from "@/components/ui/Header";
import GoGame from "@/components/go/GoGame";
import Link from "next/link";

export const metadata = {
  title: "围棋 - 荣升的游戏小站",
  description: "经典围棋双人对战，支持9x9、13x13、19x19棋盘，含提子、禁入点、打劫规则",
};

export default function GoPage() {
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
            ⚫ 围棋
          </h1>
        </div>

        <div className="flex flex-col items-center gap-8">
          <GoGame />
        </div>
      </main>
    </>
  );
}
