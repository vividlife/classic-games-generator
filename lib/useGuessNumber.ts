"use client";

import { useState, useCallback } from "react";

interface GuessResult {
  guess: string;
  a: number;
  b: number;
}

interface GameState {
  secretNumber: string;
  guesses: GuessResult[];
  currentGuess: string;
  isWon: boolean;
  attempts: number;
}

// 生成4位不重复的随机数字
function generateSecretNumber(): string {
  const digits: number[] = [];
  while (digits.length < 4) {
    const d = Math.floor(Math.random() * 10);
    if (!digits.includes(d)) {
      digits.push(d);
    }
  }
  return digits.join("");
}

// 计算A和B
function calculateAB(guess: string, secret: string): { a: number; b: number } {
  let a = 0;
  let b = 0;
  
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      a++;
    } else if (secret.includes(guess[i])) {
      b++;
    }
  }
  
  return { a, b };
}

// 验证输入是否有效
function isValidGuess(input: string): boolean {
  if (input.length !== 4) return false;
  if (!/^\d{4}$/.test(input)) return false;
  // 检查是否有重复数字
  const digits = input.split("");
  return new Set(digits).size === 4;
}

export function useGuessNumber() {
  const [state, setState] = useState<GameState>({
    secretNumber: "",
    guesses: [],
    currentGuess: "",
    isWon: false,
    attempts: 0,
  });

  // 开始新游戏
  const startGame = useCallback(() => {
    setState({
      secretNumber: generateSecretNumber(),
      guesses: [],
      currentGuess: "",
      isWon: false,
      attempts: 0,
    });
  }, []);

  // 输入数字
  const inputDigit = useCallback((digit: string) => {
    setState(prev => {
      if (prev.currentGuess.length >= 4) return prev;
      return { ...prev, currentGuess: prev.currentGuess + digit };
    });
  }, []);

  // 删除最后一位
  const deleteDigit = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentGuess: prev.currentGuess.slice(0, -1),
    }));
  }, []);

  // 清空输入
  const clearInput = useCallback(() => {
    setState(prev => ({ ...prev, currentGuess: "" }));
  }, []);

  // 提交猜测
  const submitGuess = useCallback(() => {
    if (!isValidGuess(state.currentGuess)) return;
    if (state.isWon) return;
    
    const { a, b } = calculateAB(state.currentGuess, state.secretNumber);
    const isWon = a === 4;
    
    setState(prev => ({
      ...prev,
      guesses: [...prev.guesses, { guess: prev.currentGuess, a, b }],
      currentGuess: "",
      isWon,
      attempts: prev.attempts + 1,
    }));
  }, [state.currentGuess, state.secretNumber, state.isWon]);

  // 显示答案（调试用）
  const showAnswer = useCallback(() => {
    return state.secretNumber;
  }, [state.secretNumber]);

  return {
    ...state,
    startGame,
    inputDigit,
    deleteDigit,
    clearInput,
    submitGuess,
    isValidGuess,
    showAnswer,
  };
}