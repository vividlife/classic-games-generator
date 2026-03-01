import { Metadata } from "next";
import Game24Game from "@/components/game24/Game24Game";

export const metadata: Metadata = {
  title: "24点 - 荣升的游戏小站",
  description: "经典24点数学游戏，使用四张牌通过加减乘除运算得到24",
};

export default function Game24Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-8 px-4">
      <Game24Game />
    </main>
  );
}