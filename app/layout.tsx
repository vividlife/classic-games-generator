import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "经典游戏",
  description: "畅玩贪吃蛇和俄罗斯方块，支持多种主题和难度设置",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
