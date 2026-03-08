"use client";

import { useState, useCallback } from "react";

export type RoleName = "狼人" | "村民" | "预言家" | "女巫" | "猎人" | "守卫";

export interface Role {
  name: RoleName;
  emoji: string;
  description: string;
  team: "狼人" | "好人";
}

export const ROLES: Record<RoleName, Role> = {
  狼人: { name: "狼人", emoji: "🐺", description: "夜晚可以猎杀村民", team: "狼人" },
  村民: { name: "村民", emoji: "👨‍🌾", description: "没有特殊能力，靠推理投票", team: "好人" },
  预言家: { name: "预言家", emoji: "🔮", description: "每晚可以查验一名玩家的阵营", team: "好人" },
  女巫: { name: "女巫", emoji: "🧙‍♀️", description: "有一瓶解药和一瓶毒药各用一次", team: "好人" },
  猎人: { name: "猎人", emoji: "🏹", description: "被杀死时可以开枪带走一名玩家", team: "好人" },
  守卫: { name: "守卫", emoji: "🛡️", description: "每晚可以守护一名玩家免受狼杀", team: "好人" },
};

export type RoleConfig = Partial<Record<RoleName, number>>;

export const PRESET_CONFIGS: Record<number, RoleConfig> = {
  4:  { 狼人: 1, 预言家: 1, 村民: 2 },
  5:  { 狼人: 1, 预言家: 1, 女巫: 1, 村民: 2 },
  6:  { 狼人: 2, 预言家: 1, 女巫: 1, 村民: 2 },
  7:  { 狼人: 2, 预言家: 1, 女巫: 1, 猎人: 1, 村民: 2 },
  8:  { 狼人: 2, 预言家: 1, 女巫: 1, 猎人: 1, 村民: 3 },
  9:  { 狼人: 3, 预言家: 1, 女巫: 1, 猎人: 1, 村民: 3 },
  10: { 狼人: 3, 预言家: 1, 女巫: 1, 猎人: 1, 村民: 4 },
  11: { 狼人: 3, 预言家: 1, 女巫: 1, 猎人: 1, 守卫: 1, 村民: 4 },
  12: { 狼人: 4, 预言家: 1, 女巫: 1, 猎人: 1, 守卫: 1, 村民: 4 },
  13: { 狼人: 4, 预言家: 1, 女巫: 1, 猎人: 1, 守卫: 1, 村民: 5 },
  14: { 狼人: 4, 预言家: 1, 女巫: 1, 猎人: 1, 守卫: 1, 村民: 6 },
  15: { 狼人: 5, 预言家: 1, 女巫: 1, 猎人: 1, 守卫: 1, 村民: 6 },
  16: { 狼人: 5, 预言家: 1, 女巫: 1, 猎人: 1, 守卫: 1, 村民: 7 },
  17: { 狼人: 6, 预言家: 1, 女巫: 1, 猎人: 1, 守卫: 1, 村民: 7 },
  18: { 狼人: 6, 预言家: 1, 女巫: 1, 猎人: 1, 守卫: 1, 村民: 8 },
};

export interface Player {
  id: number;
  role: RoleName;
  revealed: boolean; // 是否已经查看过自己的牌
  alive: boolean; // 是否存活
}

export type GamePhase = "setup" | "dealt" | "night_werewolf" | "night_witch" | "day" | "werewolf_assassination" | "game_over";

interface WerewolfState {
  phase: GamePhase;
  playerCount: number;
  roleConfig: RoleConfig;
  players: Player[];
  activePlayerId: number | null;
  globalUnlocked: boolean;
  nightKillTarget: number | null; // 今晚狼人杀的目标
  witchSaved: boolean; // 女巫是否使用了解药
  witchUsedSave: boolean; // 女巫是否已经用过解药
  nightDeaths: number[]; // 今晚死亡的玩家
  dayCount: number; // 第几天
  winner: "狼人" | "好人" | null; // 游戏胜利方
  allDeaths: number[]; // 所有死亡的玩家记录
  votedOutPlayerId: number | null; // 被投票出局的玩家id
  voiceEnabled: boolean; // 是否开启语音
  lastSpokenPhase: GamePhase | null; // 上次播放语音的阶段，防止重复播放
  assassinationTarget: number | null; // 狼人刺杀的目标
  assassinationResult: "hit_witch" | "missed" | null; // 刺杀结果
  pendingAssassination: boolean; // 是否需要进入刺杀环节
}

// 生成更安全的随机数
function secureRandom(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  // 回退到 Math.random，但添加时间戳扰动
  return (Math.random() + Date.now() % 1000 / 10000) % 1;
}

// 使用改进的 Fisher-Yates 洗牌算法
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  const n = a.length;

  // 从后往前洗牌
  for (let i = n - 1; i > 0; i--) {
    // 使用更随机的方式生成 j
    const j = Math.floor(secureRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  // 再从前往后洗牌一次，增强随机性
  for (let i = 0; i < n - 1; i++) {
    const j = i + Math.floor(secureRandom() * (n - i));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

// 多次洗牌以增强随机性
function shuffleArrayMultiple<T>(arr: T[], times: number = 5): T[] {
  let result = [...arr];
  // 每次洗牌前先根据当前时间扰动一下
  const seed = Date.now() % 100;
  for (let s = 0; s < seed % 3; s++) {
    result = shuffleArray(result);
  }
  // 正式洗牌多次
  for (let i = 0; i < times; i++) {
    result = shuffleArray(result);
  }
  return result;
}

function buildRoleList(config: RoleConfig): RoleName[] {
  const roles: RoleName[] = [];
  for (const [roleName, count] of Object.entries(config)) {
    for (let i = 0; i < (count ?? 0); i++) {
      roles.push(roleName as RoleName);
    }
  }
  return roles;
}

export function useWerewolf() {
  const [state, setState] = useState<WerewolfState>(() => ({
    phase: "setup",
    playerCount: 4,
    roleConfig: PRESET_CONFIGS[4],
    players: [],
    activePlayerId: null,
    globalUnlocked: false,
    nightKillTarget: null,
    witchSaved: false,
    witchUsedSave: false,
    nightDeaths: [],
    dayCount: 1,
    winner: null,
    allDeaths: [],
    votedOutPlayerId: null,
    voiceEnabled: true,
    lastSpokenPhase: null,
    assassinationTarget: null,
    assassinationResult: null,
    pendingAssassination: false,
  }));

  const setPlayerCount = useCallback((count: number) => {
    const clamped = Math.min(18, Math.max(4, count));
    setState(prev => ({
      ...prev,
      playerCount: clamped,
      roleConfig: PRESET_CONFIGS[clamped] ?? prev.roleConfig,
    }));
  }, []);

  const setRoleConfig = useCallback((config: RoleConfig) => {
    setState(prev => ({ ...prev, roleConfig: config }));
  }, []);

  const applyPreset = useCallback(() => {
    setState(prev => {
      const preset = PRESET_CONFIGS[prev.playerCount];
      if (!preset) return prev;
      return { ...prev, roleConfig: preset };
    });
  }, []);

  const dealRoles = useCallback(() => {
    // 注意：我们无法在这里直接访问 prev.state，
    // 所以仍需要在 setState 内部进行随机化，但使用多次洗牌确保随机性
    setState(prev => {
      // 构建角色列表
      let roleList = buildRoleList(prev.roleConfig);
      // 补齐或截断到玩家数量
      while (roleList.length < prev.playerCount) roleList.push("村民");
      roleList = roleList.slice(0, prev.playerCount);
      // 多次洗牌确保随机性 - 增加到7次
      roleList = shuffleArrayMultiple(roleList, 7);

      const players: Player[] = roleList.map((role, i) => ({
        id: i + 1,
        role,
        revealed: false,
        alive: true,
      }));

      return {
        ...prev,
        phase: "dealt",
        players,
        activePlayerId: null,
        globalUnlocked: false,
        nightKillTarget: null,
        witchSaved: false,
        witchUsedSave: false,
        nightDeaths: [],
        dayCount: 1,
        winner: null,
        allDeaths: [],
        votedOutPlayerId: null,
        assassinationTarget: null,
        assassinationResult: null,
        pendingAssassination: false,
      };
    });
  }, []);

  const revealPlayer = useCallback((playerId: number) => {
    setState(prev => {
      // 如果该玩家已经查看过，不允许再次查看
      const player = prev.players.find(p => p.id === playerId);
      if (!player || player.revealed) {
        return prev;
      }
      // 标记为已查看并显示
      return {
        ...prev,
        players: prev.players.map(p =>
          p.id === playerId ? { ...p, revealed: true } : p
        ),
        activePlayerId: playerId,
      };
    });
  }, []);

  const hideActive = useCallback(() => {
    setState(prev => ({ ...prev, activePlayerId: null }));
  }, []);

  const toggleGlobalUnlock = useCallback(() => {
    setState(prev => ({
      ...prev,
      globalUnlocked: !prev.globalUnlocked,
      activePlayerId: null,
    }));
  }, []);

  const toggleVoice = useCallback(() => {
    setState(prev => ({
      ...prev,
      voiceEnabled: !prev.voiceEnabled,
    }));
  }, []);

  const setLastSpokenPhase = useCallback((phase: GamePhase | null) => {
    setState(prev => ({
      ...prev,
      lastSpokenPhase: phase,
    }));
  }, []);

  const resetToSetup = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: "setup",
      players: [],
      activePlayerId: null,
      globalUnlocked: false,
      nightKillTarget: null,
      witchSaved: false,
      witchUsedSave: false,
      nightDeaths: [],
      dayCount: 1,
      winner: null,
      allDeaths: [],
      votedOutPlayerId: null,
      lastSpokenPhase: null,
      assassinationTarget: null,
      assassinationResult: null,
      pendingAssassination: false,
    }));
  }, []);

  // 检查游戏是否应该结束，返回胜利方，或 null 表示继续
  const checkGameEnd = useCallback((players: Player[]): "狼人" | "好人" | null => {
    const aliveWerewolves = players.filter(p => p.alive && p.role === "狼人").length;
    const aliveGood = players.filter(p => p.alive && ROLES[p.role].team === "好人").length;

    if (aliveWerewolves === 0) {
      return "好人";
    }
    if (aliveWerewolves >= aliveGood) {
      return "狼人";
    }
    return null;
  }, []);

  // 检查是否需要进入刺杀环节（游戏本应结束但还可以刺杀）
  const shouldEnterAssassination = useCallback((players: Player[], currentWinner: "狼人" | "好人" | null): boolean => {
    // 只有当游戏本应结束时才考虑刺杀环节
    if (!currentWinner) return false;

    // 只有当女巫存活时才能进入刺杀环节
    const witchAlive = players.some(p => p.role === "女巫" && p.alive);
    if (!witchAlive) return false;

    // 无论是狼人本来要赢还是好人本来要赢，都进入刺杀环节
    return true;
  }, []);

  // 手动结束游戏
  const endGameManually = useCallback((winner?: "狼人" | "好人") => {
    setState(prev => {
      const finalWinner = winner ?? checkGameEnd(prev.players) ?? "好人";
      return {
        ...prev,
        phase: "game_over",
        winner: finalWinner,
        globalUnlocked: true,
      };
    });
  }, [checkGameEnd]);

  // 开始游戏流程
  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: "night_werewolf",
    }));
  }, []);

  // 狼人选择杀人目标
  const werewolfKill = useCallback((targetId: number) => {
    setState(prev => ({
      ...prev,
      nightKillTarget: targetId,
      phase: "night_witch",
    }));
  }, []);

  // 女巫使用解药
  const witchUseSave = useCallback((useSave: boolean) => {
    setState(prev => {
      const newNightDeaths: number[] = [];
      let newWitchUsedSave = prev.witchUsedSave;

      if (useSave && prev.nightKillTarget) {
        // 女巫使用了解药，没有人死亡
        newWitchUsedSave = true;
      } else if (prev.nightKillTarget) {
        // 没有使用解药，目标死亡
        newNightDeaths.push(prev.nightKillTarget);
      }

      const newPlayers = prev.players.map(p =>
        newNightDeaths.includes(p.id) ? { ...p, alive: false } : p
      );

      // 更新所有死亡记录
      const newAllDeaths = [...prev.allDeaths, ...newNightDeaths];

      // 检查游戏是否结束
      const winner = checkGameEnd(newPlayers);
      const needsAssassination = !!(winner && shouldEnterAssassination(newPlayers, winner));
      const newPhase = needsAssassination ? "werewolf_assassination" : (winner ? "game_over" : "day");

      return {
        ...prev,
        witchSaved: useSave,
        witchUsedSave: newWitchUsedSave,
        nightDeaths: newNightDeaths,
        players: newPlayers,
        allDeaths: newAllDeaths,
        winner: needsAssassination ? null : winner,
        phase: newPhase,
        globalUnlocked: (winner && !needsAssassination) ? true : prev.globalUnlocked,
        pendingAssassination: needsAssassination,
      };
    });
  }, [checkGameEnd, shouldEnterAssassination]);

  // 进入下一夜，自动检查游戏是否结束
  const nextNight = useCallback(() => {
    setState(prev => {
      // 检查游戏是否结束
      const winner = checkGameEnd(prev.players);
      const needsAssassination = !!(winner && shouldEnterAssassination(prev.players, winner));

      if (winner && !needsAssassination) {
        return {
          ...prev,
          phase: "game_over",
          winner,
          globalUnlocked: true,
        };
      }

      if (needsAssassination) {
        return {
          ...prev,
          phase: "werewolf_assassination",
          pendingAssassination: true,
        };
      }

      return {
        ...prev,
        phase: "night_werewolf",
        nightKillTarget: null,
        witchSaved: false,
        nightDeaths: [],
        dayCount: prev.dayCount + 1,
        votedOutPlayerId: null,
      };
    });
  }, [checkGameEnd, shouldEnterAssassination]);

  // 狼人执行刺杀
  const werewolfAssassinate = useCallback((targetId: number) => {
    setState(prev => {
      const targetPlayer = prev.players.find(p => p.id === targetId);
      const isWitch = targetPlayer?.role === "女巫";

      const assassinationResult: "hit_witch" | "missed" = isWitch ? "hit_witch" : "missed";
      const finalWinner: "狼人" | "好人" = isWitch ? "狼人" : "好人";

      return {
        ...prev,
        assassinationTarget: targetId,
        assassinationResult,
        phase: "game_over",
        winner: finalWinner,
        globalUnlocked: true,
      };
    });
  }, []);

  // 简化投票：直接处决玩家或选择无人出局
  const voteOutPlayer = useCallback((targetId: number | null) => {
    setState(prev => {
      let newPlayers = prev.players;
      let newAllDeaths = prev.allDeaths;

      // 如果有被投出局的玩家
      if (targetId) {
        newPlayers = prev.players.map(p =>
          p.id === targetId ? { ...p, alive: false } : p
        );
        newAllDeaths = [...prev.allDeaths, targetId];
      }

      // 检查游戏是否结束
      const winner = checkGameEnd(newPlayers);
      const needsAssassination = !!(winner && shouldEnterAssassination(newPlayers, winner));
      const newPhase = needsAssassination ? "werewolf_assassination" : (winner ? "game_over" : "day");

      return {
        ...prev,
        players: newPlayers,
        allDeaths: newAllDeaths,
        winner: needsAssassination ? null : winner,
        phase: newPhase,
        globalUnlocked: (winner && !needsAssassination) ? true : prev.globalUnlocked,
        votedOutPlayerId: targetId,
        pendingAssassination: needsAssassination,
      };
    });
  }, [checkGameEnd, shouldEnterAssassination]);

  const totalRoles = Object.values(state.roleConfig).reduce(
    (sum, n) => sum + (n ?? 0),
    0
  );

  return {
    ...state,
    totalRoles,
    setPlayerCount,
    setRoleConfig,
    applyPreset,
    dealRoles,
    revealPlayer,
    hideActive,
    toggleGlobalUnlock,
    resetToSetup,
    startGame,
    werewolfKill,
    witchUseSave,
    nextNight,
    endGameManually,
    voteOutPlayer,
    toggleVoice,
    setLastSpokenPhase,
    werewolfAssassinate,
  };
}
