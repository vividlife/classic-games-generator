"use client";

import { useState, useCallback } from "react";

export interface NumberCard {
  id: number;
  value: number;
  display: string;
}

export type GameStep = "select1" | "selectOp" | "select2";
export type DifficultyLevel = "easy" | "medium" | "hard";

let cardIdCounter = 0;

function formatDisplay(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return Number(v.toFixed(3)).toString();
}

function makeCard(value: number): NumberCard {
  return { id: cardIdCounter++, value, display: formatDisplay(value) };
}

interface DifficultyConfig {
  minNumber: number;
  maxNumber: number;
  allowDivision: boolean;
  minSolutionSteps: number;
  maxSolutionSteps: number;
}

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    minNumber: 1,
    maxNumber: 6,
    allowDivision: false,
    minSolutionSteps: 2,
    maxSolutionSteps: 2,
  },
  medium: {
    minNumber: 1,
    maxNumber: 9,
    allowDivision: true,
    minSolutionSteps: 2,
    maxSolutionSteps: 3,
  },
  hard: {
    minNumber: 1,
    maxNumber: 13,
    allowDivision: true,
    minSolutionSteps: 3,
    maxSolutionSteps: 3,
  },
};

function generateCards(difficulty: DifficultyLevel): NumberCard[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return Array.from({ length: 4 }, () =>
    makeCard(
      Math.floor(Math.random() * (config.maxNumber - config.minNumber + 1)) +
        config.minNumber
    )
  );
}

function canMake24(values: number[]): boolean {
  if (values.length === 1) return Math.abs(values[0] - 24) < 0.0001;
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length; j++) {
      if (i === j) continue;
      const rest = values.filter((_, k) => k !== i && k !== j);
      const a = values[i];
      const b = values[j];
      const results: number[] = [a + b, a - b, a * b];
      if (b !== 0) results.push(a / b);
      for (const r of results) {
        if (canMake24([r, ...rest])) return true;
      }
    }
  }
  return false;
}

interface SolutionStep {
  a: number;
  b: number;
  op: string;
  result: number;
}

function findSolution(values: number[]): SolutionStep[] | null {
  if (values.length === 1) {
    return Math.abs(values[0] - 24) < 0.0001 ? [] : null;
  }

  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length; j++) {
      if (i === j) continue;
      const rest = values.filter((_, k) => k !== i && k !== j);
      const a = values[i];
      const b = values[j];
      
      const ops = [
        { op: "+", result: a + b },
        { op: "-", result: a - b },
        { op: "×", result: a * b },
        ...(b !== 0 ? [{ op: "÷", result: a / b }] : [])
      ];

      for (const { op, result } of ops) {
        const subSolution = findSolution([result, ...rest]);
        if (subSolution !== null) {
          return [{ a, b, op, result }, ...subSolution];
        }
      }
    }
  }
  return null;
}

function applyOp(a: number, op: string, b: number): number | null {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return b !== 0 ? a / b : null;
    default: return null;
  }
}

export function useGame24() {
  const [cards, setCards] = useState<NumberCard[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  const [step, setStep] = useState<GameStep>("select1");
  const [message, setMessage] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [solution, setSolution] = useState<SolutionStep[] | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");

  const startGame = useCallback(() => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    let newCards = generateCards(difficulty);
    let foundSolution = null;
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (attempts < maxAttempts) {
      foundSolution = findSolution(newCards.map((c) => c.value));
      if (
        foundSolution !== null &&
        foundSolution.length >= config.minSolutionSteps &&
        foundSolution.length <= config.maxSolutionSteps
      ) {
        break;
      }
      newCards = generateCards(difficulty);
      attempts++;
    }
    
    // 如果找不到符合条件的，就用有解的
    if (foundSolution === null) {
      while (true) {
        foundSolution = findSolution(newCards.map((c) => c.value));
        if (foundSolution !== null) break;
        newCards = generateCards(difficulty);
      }
    }
    
    setCards(newCards);
    setSolution(foundSolution);
    setSelectedIndex(null);
    setSelectedOp(null);
    setStep("select1");
    setMessage(null);
    setIsWon(false);
    setIsGameOver(false);
    setHint(null);
    setGamesPlayed((n) => n + 1);
  }, [difficulty]);

  const selectCard = useCallback(
    (idx: number) => {
      if (isGameOver) return;
      if (step === "select1") {
        setSelectedIndex(idx);
        setStep("selectOp");
        setMessage(null);
        return;
      }
      if (step === "select2") {
        if (idx === selectedIndex) return;
        const cardA = cards[selectedIndex!];
        const cardB = cards[idx];
        const result = applyOp(cardA.value, selectedOp!, cardB.value);
        if (result === null) {
          setMessage("除数不能为零，请选择其他数字");
          return;
        }
        const newCards = [
          ...cards.filter((_, i) => i !== selectedIndex && i !== idx),
          makeCard(result),
        ];
        setCards(newCards);
        setSelectedIndex(null);
        setSelectedOp(null);
        setStep("select1");
        if (newCards.length === 1) {
          const won = Math.abs(newCards[0].value - 24) < 0.0001;
          setIsWon(won);
          setIsGameOver(true);
          setMessage(
            won
              ? "恭喜！你算出了 24！"
              : `最终结果是 ${newCards[0].display}，不是 24，再试一次吧`
          );
        } else {
          setMessage(null);
        }
      }
    },
    [cards, isGameOver, selectedIndex, selectedOp, step]
  );

  const selectOp = useCallback(
    (op: string) => {
      if (step !== "selectOp") return;
      setSelectedOp(op);
      setStep("select2");
      setMessage(null);
    },
    [step]
  );

  const cancelSelection = useCallback(() => {
    setSelectedIndex(null);
    setSelectedOp(null);
    setStep("select1");
    setMessage(null);
  }, []);

  const showHint = useCallback(() => {
    if (!solution || solution.length === 0) {
      setHint("暂无提示");
      return;
    }
    const step = solution[0];
    setHint(`提示：试试 ${step.a} ${step.op} ${step.b}`);
  }, [solution]);

  const setDifficulty = useCallback((newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
  }, []);

  return {
    cards,
    selectedIndex,
    selectedOp,
    step,
    message,
    isWon,
    isGameOver,
    gamesPlayed,
    hint,
    solution,
    difficulty,
    startGame,
    selectCard,
    selectOp,
    cancelSelection,
    showHint,
    setDifficulty,
  };
}
