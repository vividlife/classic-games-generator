"use client";

import { useEffect, useState } from "react";
import { ScoreEntry } from "@/types";
import { getTopScores } from "@/lib/scoreManager";

interface ScoreBoardProps {
  game: "snake" | "tetris";
  currentScore?: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

export default function ScoreBoard({ game, currentScore }: ScoreBoardProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    setScores(getTopScores(game));
  }, [game, currentScore]);

  if (scores.length === 0) {
    return (
      <div className="text-center text-slate-500 py-4 text-sm">
        暂无记录，快来创造第一个吧！
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {scores.map((entry, index) => (
        <div
          key={entry.id}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
            currentScore === entry.score
              ? "bg-indigo-900/50 border border-indigo-700"
              : "bg-slate-800/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-5 text-center font-bold ${
                index === 0
                  ? "text-yellow-400"
                  : index === 1
                  ? "text-slate-300"
                  : index === 2
                  ? "text-amber-600"
                  : "text-slate-500"
              }`}
            >
              {index + 1}
            </span>
            <span className="text-slate-300 truncate max-w-[80px]">
              {entry.playerName}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                entry.difficulty === "hard"
                  ? "bg-red-900 text-red-300"
                  : entry.difficulty === "medium"
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-green-900 text-green-300"
              }`}
            >
              {entry.difficulty[0].toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white">
              {entry.score.toLocaleString()}
            </span>
            <span className="text-slate-500 text-xs">
              {formatDate(entry.date)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
