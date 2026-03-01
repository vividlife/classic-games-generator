"use client";

import { useState, useCallback } from "react";

export interface NumberCard {
  id: number;
  value: number;
  display: string;
}

export type GameStep = "select1" | "selectOp" | "select2";

let cardIdCounter = 0;

function formatDisplay(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return Number(v.toFixed(3)).toString();
}

function makeCard(value: number): NumberCard {
  return { id: cardIdCounter++, value, display: formatDisplay(value) };
}

function generateCards(): NumberCard[] {
  return Array.from({ length: 4 }, () =>
    makeCard(Math.floor(Math.random() * 9) + 1)
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

  const startGame = useCallback(() => {
    let newCards = generateCards();
    while (!canMake24(newCards.map((c) => c.value))) {
      newCards = generateCards();
    }
    setCards(newCards);
    setSelectedIndex(null);
    setSelectedOp(null);
    setStep("select1");
    setMessage(null);
    setIsWon(false);
    setIsGameOver(false);
    setGamesPlayed((n) => n + 1);
  }, []);

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

  return {
    cards,
    selectedIndex,
    selectedOp,
    step,
    message,
    isWon,
    isGameOver,
    gamesPlayed,
    startGame,
    selectCard,
    selectOp,
    cancelSelection,
  };
}
