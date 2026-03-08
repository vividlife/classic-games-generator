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

export type GamePhase = "setup" | "dealt" | "night_werewolf" | "night_witch" | "day";

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
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
    setState(prev => {
      let roleList = shuffleArray(buildRoleList(prev.roleConfig));
      // Pad with 村民 if needed, trim if too many
      while (roleList.length < prev.playerCount) roleList.push("村民");
      roleList = roleList.slice(0, prev.playerCount);

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
    }));
  }, []);

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

      return {
        ...prev,
        witchSaved: useSave,
        witchUsedSave: newWitchUsedSave,
        nightDeaths: newNightDeaths,
        players: prev.players.map(p =>
          newNightDeaths.includes(p.id) ? { ...p, alive: false } : p
        ),
        phase: "day",
      };
    });
  }, []);

  // 进入下一夜
  const nextNight = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: "night_werewolf",
      nightKillTarget: null,
      witchSaved: false,
      nightDeaths: [],
      dayCount: prev.dayCount + 1,
    }));
  }, []);

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
  };
}
