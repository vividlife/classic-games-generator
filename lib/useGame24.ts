"use client";

import { useState, useCallback, useEffect } from "react";

// 扑克牌面显示
const CARD_DISPLAY: Record<number, string> = {
  1: "A",
  11: "J",
  12: "Q",
  13: "K",
};

export interface Card {
  value: number;
  display: string;
}

interface GameState {
  cards: Card[];
  expression: string;
  result: string | null;
  isCorrect: boolean | null;
  showHint: boolean;
  hint: string | null;
  timeLeft: number;
  isRunning: boolean;
  score: number;
  gamesPlayed: number;
}

// 生成随机牌组
function generateCards(): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < 4; i++) {
    const value = Math.floor(Math.random() * 13) + 1;
    cards.push({
      value,
      display: CARD_DISPLAY[value] || String(value),
    });
  }
  return cards;
}

// 计算24点的所有可能解法
function findSolutions(cards: number[]): string[] {
  const ops = ["+", "-", "×", "÷"];
  const solutions: string[] = [];
  
  // 数组的所有排列
  function permute(arr: number[]): number[][] {
    if (arr.length <= 1) return [arr];
    const result: number[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const perms = permute(rest);
      for (const perm of perms) {
        result.push([arr[i], ...perm]);
      }
    }
    return result;
  }
  
  // 计算表达式
  function calc(a: number, op: string, b: number): number | null {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : null;
      default: return null;
    }
  }
  
  const perms = permute(cards);
  
  for (const [a, b, c, d] of perms) {
    for (const op1 of ops) {
      for (const op2 of ops) {
        for (const op3 of ops) {
          // ((a op1 b) op2 c) op3 d
          const r1 = calc(a, op1, b);
          if (r1 !== null) {
            const r2 = calc(r1, op2, c);
            if (r2 !== null) {
              const r3 = calc(r2, op3, d);
              if (r3 !== null && Math.abs(r3 - 24) < 0.0001) {
                solutions.push(`((${a} ${op1} ${b}) ${op2} ${c}) ${op3} ${d}`);
              }
            }
          }
          
          // (a op1 (b op2 c)) op3 d
          const r4 = calc(b, op2, c);
          if (r4 !== null) {
            const r5 = calc(a, op1, r4);
            if (r5 !== null) {
              const r6 = calc(r5, op3, d);
              if (r6 !== null && Math.abs(r6 - 24) < 0.0001) {
                solutions.push(`(${a} ${op1} (${b} ${op2} ${c})) ${op3} ${d}`);
              }
            }
          }
          
          // (a op1 b) op2 (c op3 d)
          const r7 = calc(a, op1, b);
          const r8 = calc(c, op3, d);
          if (r7 !== null && r8 !== null) {
            const r9 = calc(r7, op2, r8);
            if (r9 !== null && Math.abs(r9 - 24) < 0.0001) {
              solutions.push(`(${a} ${op1} ${b}) ${op2} (${c} ${op3} ${d})`);
            }
          }
          
          // a op1 ((b op2 c) op3 d)
          const r10 = calc(b, op2, c);
          if (r10 !== null) {
            const r11 = calc(r10, op3, d);
            if (r11 !== null) {
              const r12 = calc(a, op1, r11);
              if (r12 !== null && Math.abs(r12 - 24) < 0.0001) {
                solutions.push(`${a} ${op1} ((${b} ${op2} ${c}) ${op3} ${d})`);
              }
            }
          }
          
          // a op1 (b op2 (c op3 d))
          const r13 = calc(c, op3, d);
          if (r13 !== null) {
            const r14 = calc(b, op2, r13);
            if (r14 !== null) {
              const r15 = calc(a, op1, r14);
              if (r15 !== null && Math.abs(r15 - 24) < 0.0001) {
                solutions.push(`${a} ${op1} (${b} ${op2} (${c} ${op3} ${d}))`);
              }
            }
          }
        }
      }
    }
  }
  
  // 去重
  return [...new Set(solutions)];
}

export function useGame24() {
  const [state, setState] = useState<GameState>({
    cards: [],
    expression: "",
    result: null,
    isCorrect: null,
    showHint: false,
    hint: null,
    timeLeft: 60,
    isRunning: false,
    score: 0,
    gamesPlayed: 0,
  });

  // 初始化游戏
  const startGame = useCallback(() => {
    let newCards = generateCards();
    // 确保有解
    while (findSolutions(newCards.map(c => c.value)).length === 0) {
      newCards = generateCards();
    }
    setState(prev => ({
      ...prev,
      cards: newCards,
      expression: "",
      result: null,
      isCorrect: null,
      showHint: false,
      hint: null,
      timeLeft: 60,
      isRunning: true,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  }, []);

  // 计时器
  useEffect(() => {
    if (!state.isRunning || state.timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, isRunning: false, isCorrect: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [state.isRunning, state.timeLeft]);

  // 添加到表达式
  const addToExpression = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      expression: prev.expression + value,
      result: null,
      isCorrect: null,
    }));
  }, []);

  // 清除表达式
  const clearExpression = useCallback(() => {
    setState(prev => ({
      ...prev,
      expression: "",
      result: null,
      isCorrect: null,
    }));
  }, []);

  // 退格
  const backspace = useCallback(() => {
    setState(prev => ({
      ...prev,
      expression: prev.expression.slice(0, -1),
      result: null,
      isCorrect: null,
    }));
  }, []);

  // 验证答案
  const checkAnswer = useCallback(() => {
    if (!state.isRunning) return;
    
    try {
      // 将表达式中的 × ÷ 替换为 * /
      let expr = state.expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/");
      
      // 计算结果
      const result = eval(expr);
      const isCorrect = Math.abs(result - 24) < 0.0001;
      
      setState(prev => ({
        ...prev,
        result: `${result}`,
        isCorrect,
        isRunning: isCorrect ? false : prev.isRunning,
        score: isCorrect ? prev.score + Math.ceil(prev.timeLeft / 10) : prev.score,
      }));
    } catch {
      setState(prev => ({
        ...prev,
        result: "表达式错误",
        isCorrect: false,
      }));
    }
  }, [state.expression, state.isRunning]);

  // 显示提示（函数重命名为 revealHint）
  const revealHint = useCallback(() => {
    const solutions = findSolutions(state.cards.map(c => c.value));
    setState(prev => ({
      ...prev,
      showHint: true,
      hint: solutions[0] || "无解",
    }));
  }, [state.cards]);

  return {
    ...state,
    startGame,
    addToExpression,
    clearExpression,
    backspace,
    checkAnswer,
    revealHint,
  };
}
