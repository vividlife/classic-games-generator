"use client";

import { useState, useCallback } from "react";

export interface NumberCard {
  id: number;
  value: number;
  display: string;
}

export type GameStep = "select1" | "selectOp" | "select2";
export type DifficultyLevel = "easy" | "medium" | "hard" | "expert";
type Operator = "+" | "-" | "×" | "÷";

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
  allowedOperators: Operator[];
  targetScoreRange: [number, number];
  requireDivisionInSolution?: boolean;
  requireFractionalIntermediate?: boolean;
  integerIntermediatesOnly?: boolean;
}

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    minNumber: 1,
    maxNumber: 6,
    allowedOperators: ["+", "-", "×"],
    targetScoreRange: [0, 2],
    integerIntermediatesOnly: true,
  },
  medium: {
    minNumber: 1,
    maxNumber: 9,
    allowedOperators: ["+", "-", "×", "÷"],
    targetScoreRange: [2, 4],
  },
  hard: {
    minNumber: 1,
    maxNumber: 13,
    allowedOperators: ["+", "-", "×", "÷"],
    targetScoreRange: [4, 6],
    requireDivisionInSolution: true,
  },
  expert: {
    minNumber: 2,
    maxNumber: 13,
    allowedOperators: ["+", "-", "×", "÷"],
    targetScoreRange: [6, 8],
    requireDivisionInSolution: true,
    requireFractionalIntermediate: true,
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

interface SolutionStep {
  a: number;
  b: number;
  op: Operator;
  result: number;
}

interface SearchState {
  usedDivision: boolean;
  usedFractionalIntermediate: boolean;
  divisionCount: number;
  fractionalSteps: number;
}

interface PuzzleAnalysis {
  solutionCount: number;
  sampleSolution: SolutionStep[] | null;
  minComplexity: number;
  minFractionalSteps: number;
  score: number;
}

function calcDifficultyScore(
  solutionCount: number,
  minComplexity: number,
  minFractionalSteps: number
): number {
  const rarity =
    solutionCount === 1
      ? 4
      : solutionCount <= 2
      ? 3
      : solutionCount <= 4
      ? 2
      : solutionCount <= 8
      ? 1
      : 0;
  const complexity = Math.min(3, Math.max(0, minComplexity));
  const fractionalBonus = minFractionalSteps > 0 ? 1 : 0;
  return rarity + complexity + fractionalBonus;
}

function analyzePuzzle(values: number[], config: DifficultyConfig): PuzzleAnalysis {
  const maxSolutionsToCount = 24;
  let solutionCount = 0;
  let sampleSolution: SolutionStep[] | null = null;
  let minComplexity = Number.POSITIVE_INFINITY;
  let minFractionalSteps = Number.POSITIVE_INFINITY;
  const path: SolutionStep[] = [];

  const dfs = (nums: number[], state: SearchState): void => {
    if (solutionCount >= maxSolutionsToCount) return;

    if (nums.length === 1) {
      const solved = Math.abs(nums[0] - 24) < 0.0001;
      if (!solved) return;
      if (config.requireDivisionInSolution && !state.usedDivision) return;
      if (
        config.requireFractionalIntermediate &&
        !state.usedFractionalIntermediate
      ) {
        return;
      }
      solutionCount += 1;
      const complexity = state.divisionCount + state.fractionalSteps * 2;
      minComplexity = Math.min(minComplexity, complexity);
      minFractionalSteps = Math.min(minFractionalSteps, state.fractionalSteps);
      if (sampleSolution === null) {
        sampleSolution = [...path];
      }
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const rest = nums.filter((_, k) => k !== i && k !== j);
        const a = nums[i];
        const b = nums[j];
        const candidates: { a: number; b: number; op: Operator; result: number }[] = [];

        if (config.allowedOperators.includes("+")) {
          candidates.push({ a, b, op: "+", result: a + b });
        }
        if (config.allowedOperators.includes("×")) {
          candidates.push({ a, b, op: "×", result: a * b });
        }
        if (config.allowedOperators.includes("-")) {
          candidates.push({ a, b, op: "-", result: a - b });
          candidates.push({ a: b, b: a, op: "-", result: b - a });
        }
        if (config.allowedOperators.includes("÷")) {
          if (b !== 0) candidates.push({ a, b, op: "÷", result: a / b });
          if (a !== 0) candidates.push({ a: b, b: a, op: "÷", result: b / a });
        }

        for (const candidate of candidates) {
          if (
            config.integerIntermediatesOnly &&
            !Number.isInteger(candidate.result)
          ) {
            continue;
          }
          const nextState: SearchState = {
            usedDivision: state.usedDivision || candidate.op === "÷",
            usedFractionalIntermediate:
              state.usedFractionalIntermediate || !Number.isInteger(candidate.result),
            divisionCount: state.divisionCount + (candidate.op === "÷" ? 1 : 0),
            fractionalSteps:
              state.fractionalSteps + (Number.isInteger(candidate.result) ? 0 : 1),
          };
          path.push({
            a: candidate.a,
            b: candidate.b,
            op: candidate.op,
            result: candidate.result,
          });
          dfs([candidate.result, ...rest], nextState);
          path.pop();
          if (solutionCount >= maxSolutionsToCount) return;
        }
      }
    }
  };

  dfs(values, {
    usedDivision: false,
    usedFractionalIntermediate: false,
    divisionCount: 0,
    fractionalSteps: 0,
  });

  const hasSolution = solutionCount > 0;
  const score = hasSolution
    ? calcDifficultyScore(solutionCount, minComplexity, minFractionalSteps)
    : -1;

  return {
    solutionCount,
    sampleSolution,
    minComplexity: hasSolution ? minComplexity : -1,
    minFractionalSteps: hasSolution ? minFractionalSteps : -1,
    score,
  };
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
  const [puzzleScore, setPuzzleScore] = useState<number | null>(null);
  const [solutionCount, setSolutionCount] = useState<number | null>(null);
  const [bucketMatched, setBucketMatched] = useState<boolean | null>(null);

  const startGame = useCallback(() => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    const [minScore, maxScore] = config.targetScoreRange;
    let newCards = generateCards(difficulty);
    let analysis = analyzePuzzle(newCards.map((c) => c.value), config);
    let attempts = 0;
    const maxAttempts = 5000;
    
    while (attempts < maxAttempts) {
      if (
        analysis.sampleSolution !== null &&
        analysis.score >= minScore &&
        analysis.score <= maxScore
      ) {
        break;
      }
      newCards = generateCards(difficulty);
      analysis = analyzePuzzle(newCards.map((c) => c.value), config);
      attempts++;
    }
    
    // 如果在尝试次数内找不到评分命中的题目，就退化为“满足可解 + 难度规则”
    if (
      analysis.sampleSolution === null ||
      analysis.score < minScore ||
      analysis.score > maxScore
    ) {
      const relaxedConfig: DifficultyConfig = {
        ...config,
        targetScoreRange: [0, 8],
        requireDivisionInSolution: false,
        requireFractionalIntermediate: false,
        integerIntermediatesOnly: false,
      };
      while (true) {
        analysis = analyzePuzzle(newCards.map((c) => c.value), relaxedConfig);
        if (analysis.sampleSolution !== null) break;
        newCards = generateCards(difficulty);
      }
    }
    
    setCards(newCards);
    setSolution(analysis.sampleSolution);
    setPuzzleScore(analysis.score);
    setSolutionCount(analysis.solutionCount);
    setBucketMatched(
      analysis.score >= minScore && analysis.score <= maxScore
    );
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
    puzzleScore,
    solutionCount,
    bucketMatched,
    targetScoreRange: DIFFICULTY_CONFIGS[difficulty].targetScoreRange,
    startGame,
    selectCard,
    selectOp,
    cancelSelection,
    showHint,
    setDifficulty,
  };
}
