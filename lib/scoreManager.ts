import { ScoreEntry, Difficulty } from "@/types";

const STORAGE_KEY = "classic-games-scores";
const MAX_ENTRIES_PER_GAME = 10;

export function getScores(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveScore(entry: Omit<ScoreEntry, "id" | "date">): ScoreEntry {
  const scores = getScores();
  const newEntry: ScoreEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };

  const gameScores = scores
    .filter((s) => s.game === entry.game)
    .concat(newEntry)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES_PER_GAME);

  const otherScores = scores.filter((s) => s.game !== entry.game);
  const updated = [...otherScores, ...gameScores];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be full
  }

  return newEntry;
}

export function getTopScores(
  game: "snake" | "tetris",
  limit = 10
): ScoreEntry[] {
  return getScores()
    .filter((s) => s.game === game)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function calculateScore(
  basePoints: number,
  difficulty: Difficulty,
  level = 1
): number {
  const multipliers: Record<Difficulty, number> = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  };
  return Math.floor(basePoints * multipliers[difficulty] * level);
}

export function clearScores(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
