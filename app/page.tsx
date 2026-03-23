import Link from "next/link";
import Header from "@/components/ui/Header";
import GameSettings from "@/components/ui/GameSettings";

export default function Home() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 sm:mb-3">
            荣升的游戏小站
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm lg:text-base">
            畅玩贪吃蛇、俄罗斯方块、五子棋、24点、猜数字、狼人杀、数独、推箱子、黑白棋、围棋、七巧板、汉诺塔、摆圆片、拨数读数和 2048，支持多种主题和难度设置
          </p>
        </div>

        {/* Game cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 mb-6 sm:mb-8 lg:mb-12">
          <Link
            href="/snake"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-green-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🐍</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-green-400 transition-colors">
              贪吃蛇
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              引导蛇吃食物让它变得更长，避免撞到自己！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-green-900/50 text-green-300 px-2 py-0.5 sm:py-1 rounded">
                方向键 / WASD
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                穿墙环绕
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-green-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/tetris"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🟦</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-indigo-400 transition-colors">
              俄罗斯方块
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              堆叠下落的方块消除整行来得分，看你能坚持多久！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-indigo-900/50 text-indigo-300 px-2 py-0.5 sm:py-1 rounded">
                方向键
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                空格键快速下落
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-indigo-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/gomoku"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">⚫</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors">
              五子棋
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              与 AI 或好友对弈，率先连成五子即获胜！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-amber-900/50 text-amber-300 px-2 py-0.5 sm:py-1 rounded">
                人机 / 双人
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                三档难度
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-amber-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/game24"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🃏</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-red-400 transition-colors">
              24点
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              使用四张牌通过加减乘除运算得到24！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-red-900/50 text-red-300 px-2 py-0.5 sm:py-1 rounded">
                计时挑战
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                提示功能
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-red-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/guess-number"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🔢</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-purple-400 transition-colors">
              猜数字
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              经典几A几B游戏，猜出4位不重复的数字！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-purple-900/50 text-purple-300 px-2 py-0.5 sm:py-1 rounded">
                逻辑推理
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                无限尝试
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-purple-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/werewolf"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-purple-700/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🐺</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-purple-300 transition-colors">
              狼人杀发牌
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              极简版身份分配工具，支持自定义玩家数和角色配置！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-purple-900/50 text-purple-300 px-2 py-0.5 sm:py-1 rounded">
                随机发牌
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                私密查看
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-purple-400 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/sudoku"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🧩</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-cyan-400 transition-colors">
              数独
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              经典9×9数独，填入数字让每行每列每宫格不重复！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-cyan-900/50 text-cyan-300 px-2 py-0.5 sm:py-1 rounded">
                四档难度
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                提示功能
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-cyan-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/sokoban"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">📦</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors">
              推箱子
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              经典益智游戏，将所有箱子推到目标位置即可过关！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-amber-900/50 text-amber-300 px-2 py-0.5 sm:py-1 rounded">
                8个关卡
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                撤销功能
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-amber-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>
          <Link
            href="/reversi"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">⬛</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-teal-400 transition-colors">
              黑白棋
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              经典 Othello/Reversi，落子翻转对方棋子，棋子多者获胜！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-teal-900/50 text-teal-300 px-2 py-0.5 sm:py-1 rounded">
                双人对战
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                落子提示
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-teal-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/go"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-stone-400/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">⚫</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-stone-300 transition-colors">
              围棋
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              经典围棋，支持双人对战和 AI 模式，提子、打劫、禁入点！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-stone-900/50 text-stone-300 px-2 py-0.5 sm:py-1 rounded">
                双人对战
              </span>
              <span className="bg-amber-900/50 text-amber-300 px-2 py-0.5 sm:py-1 rounded">
                AI 模式
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                三种棋盘
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-stone-400 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/tangram"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-pink-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🧩</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-pink-400 transition-colors">
              七巧板
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              巧手拼世界，用七块拼板拼出各种图案，锻炼空间想象力！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-pink-900/50 text-pink-300 px-2 py-0.5 sm:py-1 rounded">
                空间思维
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                暗牌模式
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-pink-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/hanoi"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🗼</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-orange-400 transition-colors">
              汉诺塔
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              乾坤大挪移，将圆盘从一根柱子全部移到另一根，限时60秒！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-orange-900/50 text-orange-300 px-2 py-0.5 sm:py-1 rounded">
                4环限时
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                逻辑推理
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-orange-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/circles"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-sky-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">⭕</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-sky-400 transition-colors">
              摆圆片
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              解锁数关系，抽签获取题目，用圆片摆出指定的数量关系！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-sky-900/50 text-sky-300 px-2 py-0.5 sm:py-1 rounded">
                数量关系
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                抽签模式
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-sky-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/2048"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-amber-400/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🔢</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-amber-400 transition-colors">
              2048
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              滑动合并相同数字，达到 2048 即可获胜！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-amber-900/50 text-amber-300 px-2 py-0.5 sm:py-1 rounded">
                方向键 / 滑动
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                分数统计
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-amber-400 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>

          <Link
            href="/counter"
            className="group relative bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-slate-700 hover:border-lime-500/50 hover:bg-slate-800/80 transition-all duration-200 cursor-pointer no-dbl-tap-zoom"
          >
            <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-3 sm:mb-4">🔢</div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-lime-400 transition-colors">
              拨数读数
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
              数感拨拨乐，按要求拨数、读数，支持两位到五位数训练！
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs">
              <span className="bg-lime-900/50 text-lime-300 px-2 py-0.5 sm:py-1 rounded">
                数感训练
              </span>
              <span className="bg-slate-700 text-slate-300 px-2 py-0.5 sm:py-1 rounded">
                多位数
              </span>
            </div>
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-600 group-hover:text-lime-500 transition-colors text-base sm:text-xl">
              →
            </div>
          </Link>
        </div>

        {/* Settings panel */}
        <div className="bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700 max-w-md mx-auto">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            游戏设置
          </h2>
          <GameSettings />
        </div>
      </main>
    </>
  );
}
