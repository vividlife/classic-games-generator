"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { path: "/", label: "主页" },
  { path: "/snake", label: "贪吃蛇" },
  { path: "/tetris", label: "俄罗斯方块" },
  { path: "/gomoku", label: "五子棋" },
  { path: "/game24", label: "24点" },
  { path: "/guess-number", label: "猜数字" },
  { path: "/werewolf", label: "狼人杀" },
  { path: "/sudoku", label: "数独" },
  { path: "/reversi", label: "黑白棋" },
  { path: "/go", label: "围棋" },
  { path: "/sokoban", label: "推箱子" },
  { path: "/tangram", label: "七巧板" },
  { path: "/hanoi", label: "汉诺塔" },
  { path: "/circles", label: "摆圆片" },
  { path: "/counter", label: "拨数读数" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // 根据屏幕尺寸决定移动端菜单的列数
  const getMenuGridCols = () => {
    if (isTablet) return "grid-cols-3 md:grid-cols-4";
    return "grid-cols-2 sm:grid-cols-3";
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-12 sm:h-14 md:h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-base sm:text-lg md:text-xl text-white tracking-tight hover:text-indigo-400 transition-colors touch-target flex items-center py-1"
        >
          <span className="text-xl sm:text-2xl md:text-3xl mr-2">🎮</span>
          <span className="hidden sm:inline">荣升的游戏小站</span>
          <span className="sm:hidden text-sm">游戏小站</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors touch-target whitespace-nowrap ${
                pathname === item.path
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Tablet Navigation - 简化版 */}
        <nav className="hidden md:flex lg:hidden items-center gap-1 overflow-x-auto py-1">
          {navItems.slice(0, 8).map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors touch-target whitespace-nowrap ${
                pathname === item.path
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        {(isMobile || isTablet) && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors touch-target-lg"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Mobile Navigation Dropdown */}
      {(isMobile || isTablet) && isMenuOpen && (
        <nav className="lg:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur max-h-[55vh] sm:max-h-[60vh] overflow-y-auto mobile-menu-animate">
          <div className={`max-w-6xl mx-auto px-3 sm:px-4 py-3 grid ${getMenuGridCols()} gap-2`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-target text-center flex items-center justify-center ${
                  pathname === item.path
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
