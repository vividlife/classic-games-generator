import { Metadata } from "next";
import GuessNumberGame from "@/components/guess-number/GuessNumberGame";

export const metadata: Metadata = {
  title: "猜数字 - 荣升的游戏小站",
  description: "经典几A几B猜数字游戏，猜出4位不重复的数字",
};

export default function GuessNumberPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-8 px-4">
      <GuessNumberGame />
    </main>
  );
}