"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/gameStore";
import { useTetris } from "@/lib/useTetris";
import { saveScore } from "@/lib/scoreManager";
import TetrisBoard, { NextPiece } from "./TetrisBoard";
import TetrisControls from "./TetrisControls";
import ScoreBoard from "@/components/ui/ScoreBoard";
import Button from "@/components/ui/Button";

export default function TetrisGame() {
  const { difficulty, playerName, getTheme } = useGameStore();
  const theme = getTheme();
  const game = useTetris(difficulty);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (game.status === "gameover" && !saved && game.finalScore > 0) {
      saveScore({
        game: "tetris",
        score: game.finalScore,
        difficulty,
        playerName,
      });
      setSaved(true);
    }
  }, [game.status, game.finalScore, difficulty, playerName, saved]);

  const handleReset = () => {
    setSaved(false);
    game.reset();
  };

  const isPlaying = game.status === "playing";

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      {/* Board */}
      <div className="relative">
        <TetrisBoard
          board={game.board}
          current={game.current}
          theme={theme}
          isPlaying={isPlaying}
        />

        {/* Overlays */}
        {game.status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <div className="text-3xl mb-2">🟦</div>
            <h2 className="text-white font-bold text-xl mb-1">Tetris</h2>
            <p className="text-slate-400 text-sm mb-4">
              Fill rows to clear them
            </p>
            <Button onClick={game.start} size="lg">
              Start Game
            </Button>
          </div>
        )}

        {game.status === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
            <div className="text-3xl mb-2">⏸</div>
            <h2 className="text-white font-bold text-xl mb-4">Paused</h2>
            <Button onClick={game.resume}>Resume</Button>
          </div>
        )}

        {game.status === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <h2 className="text-white font-bold text-xl mb-1">Game Over</h2>
            <p className="text-slate-300 text-sm mb-1">
              Score:{" "}
              <span className="font-bold text-yellow-400">
                {game.finalScore.toLocaleString()}
              </span>
            </p>
            <p className="text-slate-400 text-xs mb-4">
              Level {game.level} · {game.lines} lines
            </p>
            <Button onClick={handleReset}>Play Again</Button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4 w-full lg:w-52">
        {/* Stats */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Score</div>
            <div className="font-mono font-bold text-white text-xl">
              {game.finalScore.toLocaleString()}
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <div className="text-xs text-slate-400">Level</div>
              <div className="font-mono font-bold text-indigo-400 text-lg">
                {game.level}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Lines</div>
              <div className="font-mono font-bold text-white text-lg">
                {game.lines}
              </div>
            </div>
          </div>
        </div>

        {/* Next piece */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Next</div>
          <NextPiece piece={game.next} theme={theme} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {game.status === "playing" && (
            <Button variant="secondary" size="sm" onClick={game.pause}>
              Pause
            </Button>
          )}
          {game.status === "paused" && (
            <Button variant="secondary" size="sm" onClick={game.resume}>
              Resume
            </Button>
          )}
          {(game.status === "playing" || game.status === "paused") && (
            <Button variant="danger" size="sm" onClick={handleReset}>
              Quit
            </Button>
          )}
        </div>

        {/* Mobile touch controls */}
        <div className="lg:hidden">
          <TetrisControls
            onLeft={game.moveLeft}
            onRight={game.moveRight}
            onDown={game.moveDown}
            onRotate={game.rotate}
            onHardDrop={game.hardDrop}
          />
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Top Scores
          </h3>
          <ScoreBoard
            game="tetris"
            currentScore={
              game.status === "gameover" ? game.finalScore : undefined
            }
          />
        </div>

        {/* Controls reference (desktop) */}
        <div className="bg-slate-800 rounded-xl p-4 hidden lg:block">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Controls</div>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between"><span>Move</span><span className="text-slate-300">← →</span></div>
            <div className="flex justify-between"><span>Soft drop</span><span className="text-slate-300">↓</span></div>
            <div className="flex justify-between"><span>Hard drop</span><span className="text-slate-300">Space</span></div>
            <div className="flex justify-between"><span>Rotate</span><span className="text-slate-300">↑ / X</span></div>
            <div className="flex justify-between"><span>Pause</span><span className="text-slate-300">Esc</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
