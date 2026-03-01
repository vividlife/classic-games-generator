"use client";

import { useGameStore } from "@/lib/gameStore";
import { Difficulty, DIFFICULTIES, THEMES } from "@/types";
import Button from "./Button";

export default function GameSettings() {
  const { difficulty, themeId, playerName, setDifficulty, setThemeId, setPlayerName } =
    useGameStore();

  return (
    <div className="space-y-4">
      {/* Player Name */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          Player Name
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value.slice(0, 16))}
          placeholder="Enter your name"
          maxLength={16}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                difficulty === d
                  ? d === "easy"
                    ? "bg-green-700 border-green-500 text-white"
                    : d === "medium"
                    ? "bg-yellow-700 border-yellow-500 text-white"
                    : "bg-red-700 border-red-500 text-white"
                  : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
            >
              {DIFFICULTIES[d].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Score ×{DIFFICULTIES[difficulty].scoreMultiplier} multiplier
        </p>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">
          Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setThemeId(theme.id)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                themeId === theme.id
                  ? "border-indigo-500 bg-indigo-900/50 text-indigo-200"
                  : "bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500"
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
