"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Difficulty, Theme, THEMES } from "@/types";

interface GameStore {
  difficulty: Difficulty;
  themeId: string;
  playerName: string;
  setDifficulty: (d: Difficulty) => void;
  setThemeId: (id: string) => void;
  setPlayerName: (name: string) => void;
  getTheme: () => Theme;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      difficulty: "medium",
      themeId: "classic",
      playerName: "Player",
      setDifficulty: (difficulty) => set({ difficulty }),
      setThemeId: (themeId) => set({ themeId }),
      setPlayerName: (playerName) => set({ playerName }),
      getTheme: () => {
        const { themeId } = get();
        return THEMES.find((t) => t.id === themeId) ?? THEMES[0];
      },
    }),
    {
      name: "classic-games-settings",
    }
  )
);
