"use client";

import { useEffect, useRef } from "react";
import { useWerewolf, ROLES, PRESET_CONFIGS, RoleName, GamePhase } from "@/lib/useWerewolf";

// 语音提示文本
const VOICE_PROMPTS = {
  night_start: "天黑了，所有玩家请闭眼",
  werewolf_open: "狼人请睁眼，请选择要猎杀的目标",
  werewolf_close: "狼人请闭眼",
  witch_open: () => "女巫请睁眼",
  witch_close: "女巫请闭眼",
  day_start: "天亮了，所有玩家请睁眼",
  assassination_start: "狼人阵营即将失败，但还有最后一次刺杀机会！",
};

// 使用 Web Speech API 播放语音
function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  // 取消之前的语音
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

const ALL_ROLES: RoleName[] = ["狼人", "村民", "预言家", "女巫", "猎人", "守卫"];

export default function WerewolfDealer() {
  const {
    phase,
    playerCount,
    roleConfig,
    players,
    activePlayerId,
    globalUnlocked,
    totalRoles,
    nightKillTarget,
    witchUsedSave,
    nightDeaths,
    dayCount,
    winner,
    allDeaths,
    votedOutPlayerId,
    voiceEnabled,
    lastSpokenPhase,
    assassinationTarget,
    assassinationResult,
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
  } = useWerewolf();

  // 跟踪上一个阶段，用于检测阶段变化
  const prevPhaseRef = useRef<GamePhase | null>(null);

  // 语音播放逻辑
  useEffect(() => {
    if (!voiceEnabled) return;
    if (phase === lastSpokenPhase) return;

    // 当进入夜晚（狼人阶段）时，播放"天黑了"
    if (phase === "night_werewolf" && prevPhaseRef.current !== "night_werewolf") {
      // 如果是从白天或开始游戏进入，则先播放"天黑了"
      if (prevPhaseRef.current === "day" || prevPhaseRef.current === "dealt" || prevPhaseRef.current === null) {
        speak(VOICE_PROMPTS.night_start, true);
        // 延迟播放狼人语音
        setTimeout(() => {
          speak(VOICE_PROMPTS.werewolf_open, true);
        }, 3000);
      } else {
        speak(VOICE_PROMPTS.werewolf_open, true);
      }
      setLastSpokenPhase(phase);
    }
    // 当进入女巫阶段时，先播放"狼人请闭眼"，再播放女巫提示
    else if (phase === "night_witch" && lastSpokenPhase === "night_werewolf") {
      speak(VOICE_PROMPTS.werewolf_close, true);
      setTimeout(() => {
        speak(VOICE_PROMPTS.witch_open(), true);
      }, 2000);
      setLastSpokenPhase(phase);
    }
    // 当进入白天时，播放"女巫请闭眼"和"天亮了"
    else if (phase === "day" && lastSpokenPhase === "night_witch") {
      speak(VOICE_PROMPTS.witch_close, true);
      setTimeout(() => {
        speak(VOICE_PROMPTS.day_start, true);
      }, 2000);
      setLastSpokenPhase(phase);
    }
    // 直接进入白天（比如游戏结束后的重新开始）
    else if (phase === "day" && lastSpokenPhase !== "day") {
      speak(VOICE_PROMPTS.day_start, true);
      setLastSpokenPhase(phase);
    }
    // 进入刺杀环节
    else if (phase === "werewolf_assassination" && lastSpokenPhase !== "werewolf_assassination") {
      speak(VOICE_PROMPTS.assassination_start, true);
      setLastSpokenPhase(phase);
    }

    prevPhaseRef.current = phase;
  }, [phase, voiceEnabled, lastSpokenPhase, nightKillTarget, setLastSpokenPhase]);

  const adjustRole = (role: RoleName, delta: number) => {
    const current = roleConfig[role] ?? 0;
    const next = Math.max(0, current + delta);
    setRoleConfig({ ...roleConfig, [role]: next });
  };

  const isReady = totalRoles === playerCount;

  // ─── Setup Phase ───────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🐺</div>
          <h1 className="text-3xl font-bold text-white">狼人杀发牌工具</h1>
          <p className="text-slate-400 mt-2 text-sm">极简版身份分配，无流程、无发言</p>
        </div>

        {/* Voice toggle button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              voiceEnabled
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {voiceEnabled ? "🔊 语音开启" : "🔇 语音关闭"}
          </button>
        </div>

        {/* Player count */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-4">
          <h2 className="text-base font-semibold text-white mb-4">玩家人数</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPlayerCount(playerCount - 1)}
              className="w-10 h-10 rounded-lg bg-slate-700 text-white text-xl font-bold hover:bg-slate-600 active:bg-slate-500 transition-colors"
            >
              −
            </button>
            <span className="text-4xl font-bold text-white w-14 text-center">
              {playerCount}
            </span>
            <button
              onClick={() => setPlayerCount(playerCount + 1)}
              className="w-10 h-10 rounded-lg bg-slate-700 text-white text-xl font-bold hover:bg-slate-600 active:bg-slate-500 transition-colors"
            >
              +
            </button>
            <span className="text-slate-400 text-sm ml-1">（4 - 18 人）</span>
          </div>
        </div>

        {/* Role config */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">角色配置</h2>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                isReady
                  ? "bg-green-900/50 text-green-300"
                  : "bg-red-900/50 text-red-300"
              }`}
            >
              {totalRoles} / {playerCount} {isReady ? "✓" : "✗"}
            </span>
          </div>

          <div className="space-y-3">
            {ALL_ROLES.map(roleName => {
              const role = ROLES[roleName];
              const count = roleConfig[roleName] ?? 0;
              return (
                <div key={roleName} className="flex items-center gap-3">
                  <span className="text-2xl w-8 text-center">{role.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white font-medium text-sm">{role.name}</span>
                    <span
                      className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                        role.team === "狼人"
                          ? "bg-red-900/50 text-red-300"
                          : "bg-blue-900/50 text-blue-300"
                      }`}
                    >
                      {role.team}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => adjustRole(roleName, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-500 transition-colors text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="text-white font-bold w-5 text-center">{count}</span>
                    <button
                      onClick={() => adjustRole(roleName, 1)}
                      className="w-8 h-8 rounded-lg bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-500 transition-colors text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {PRESET_CONFIGS[playerCount] && (
            <button
              onClick={applyPreset}
              className="mt-5 w-full py-2 rounded-xl bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors"
            >
              恢复预设配置
            </button>
          )}
        </div>

        {!isReady && (
          <p className="text-center text-red-400 text-sm mb-3">
            角色总数须等于玩家人数（差 {Math.abs(totalRoles - playerCount)} 人）
          </p>
        )}

        <button
          onClick={dealRoles}
          disabled={!isReady}
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all ${
            isReady
              ? "bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white shadow-lg shadow-purple-900/30"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          开始发牌
        </button>
      </div>
    );
  }

  // ─── Dealt Phase ───────────────────────────────────────────────────────────
  if (phase === "dealt") {
    const activePlayer = players.find(p => p.id === activePlayerId);
    const allRevealed = players.length > 0 && players.every(p => p.revealed);

    return (
      <div className="max-w-lg mx-auto">
        {/* Voice toggle button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              voiceEnabled
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {voiceEnabled ? "🔊 语音开启" : "🔇 语音关闭"}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🐺</div>
          <h1 className="text-2xl font-bold text-white">狼人杀发牌工具</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {globalUnlocked
              ? "游戏结束 - 上帝视角已开启"
              : allRevealed
                ? "所有玩家已查看身份，可以开始游戏"
                : "点击编号查看自己的身份（每人限看一次）"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6">
          {allRevealed && !globalUnlocked && (
            <button
              onClick={startGame}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 transition-all"
            >
              🌙 开始游戏
            </button>
          )}
          <button
            onClick={toggleGlobalUnlock}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              globalUnlocked
                ? "bg-red-600 hover:bg-red-500 text-white ring-2 ring-red-400/50"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {globalUnlocked ? "🔓 游戏已结束" : "🔒 解锁上帝视角"}
          </button>
          <button
            onClick={resetToSetup}
            className="flex-1 py-3 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
          >
            🔄 重新发牌
          </button>
        </div>

        {/* Player grid */}
        <div className="grid grid-cols-4 gap-3">
          {players.map(player => {
            const role = ROLES[player.role];
            const isRevealed = player.revealed;

            // 已查看但未解锁上帝视角的格子显示锁定状态
            const isLocked = isRevealed && !globalUnlocked;

            return (
              <button
                key={player.id}
                onClick={() => !globalUnlocked && !isLocked && revealPlayer(player.id)}
                disabled={isLocked}
                className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all select-none ${
                  globalUnlocked
                    ? role.team === "狼人"
                      ? "border-red-500/60 bg-red-900/20 cursor-default"
                      : "border-blue-500/40 bg-blue-900/10 cursor-default"
                    : isLocked
                      ? "border-slate-500/30 bg-slate-700/50 cursor-not-allowed opacity-60"
                      : "border-slate-600 bg-slate-800 hover:border-purple-500/60 hover:bg-slate-700 active:bg-slate-600 cursor-pointer"
                }`}
              >
                {isLocked && !globalUnlocked && (
                  <span className="absolute top-1 right-1 text-sm">🔒</span>
                )}
                <span className="text-xl font-bold text-white leading-none">
                  {player.id}
                </span>
                {globalUnlocked && (
                  <>
                    <span className="text-2xl mt-1 leading-none">{role.emoji}</span>
                    <span
                      className={`text-xs mt-0.5 font-medium ${
                        role.team === "狼人" ? "text-red-300" : "text-blue-300"
                      }`}
                    >
                      {role.name}
                    </span>
                  </>
                )}
                {isLocked && !globalUnlocked && (
                  <span className="text-xs text-slate-400 mt-1">已查看</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          共 {players.length} 名玩家 ·{" "}
          {players.filter(p => ROLES[p.role].team === "狼人").length} 只狼人
          {!globalUnlocked && ` · 已查看 ${players.filter(p => p.revealed).length} 人`}
        </p>

        {/* Role reveal overlay */}
        {activePlayer && !globalUnlocked && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
            onClick={hideActive}
          >
            <div
              className="text-center px-8 py-10 rounded-3xl"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-slate-500 text-sm mb-8 tracking-widest uppercase">
                玩家 {activePlayer.id} 的身份
              </p>
              <div className="text-9xl mb-6">{ROLES[activePlayer.role].emoji}</div>
              <div
                className={`text-5xl font-black mb-4 ${
                  ROLES[activePlayer.role].team === "狼人"
                    ? "text-red-400"
                    : "text-sky-300"
                }`}
              >
                {activePlayer.role}
              </div>
              <p className="text-slate-400 text-base mb-6">
                {ROLES[activePlayer.role].description}
              </p>
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                  ROLES[activePlayer.role].team === "狼人"
                    ? "bg-red-900/60 text-red-300"
                    : "bg-sky-900/60 text-sky-300"
                }`}
              >
                {ROLES[activePlayer.role].team}阵营
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-10">点击任意处隐藏</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Night Werewolf Phase ───────────────────────────────────────────────────────
  if (phase === "night_werewolf") {
    const werewolves = players.filter(p => p.role === "狼人" && p.alive);
    const alivePlayers = players.filter(p => p.alive);

    return (
      <div className="max-w-lg mx-auto">
        {/* Voice toggle button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              voiceEnabled
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {voiceEnabled ? "🔊 语音开启" : "🔇 语音关闭"}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌙</div>
          <h1 className="text-2xl font-bold text-white">第 {dayCount} 夜</h1>
          <p className="text-purple-400 mt-2 text-lg font-semibold">狼人请睁眼</p>
          <p className="text-slate-400 mt-1 text-sm">选择要猎杀的玩家</p>
        </div>

        {/* Werewolf list */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-4">
          <p className="text-slate-400 text-sm mb-2">在场狼人（红色边框）：</p>
          <div className="flex gap-2 flex-wrap">
            {werewolves.map(w => (
              <span key={w.id} className="px-3 py-1 bg-red-900/50 text-red-300 rounded-lg text-sm">
                {w.id}号
              </span>
            ))}
          </div>
        </div>

        {/* Player grid - select target */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {players.map(player => {
            const role = ROLES[player.role];
            const isWerewolf = player.role === "狼人";
            const isValidTarget = player.alive;

            return (
              <button
                key={player.id}
                onClick={() => isValidTarget && werewolfKill(player.id)}
                disabled={!isValidTarget}
                className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all select-none ${
                  !player.alive
                    ? "border-slate-700 bg-slate-900/50 opacity-40 cursor-not-allowed"
                    : isWerewolf
                      ? "border-red-500/60 bg-red-900/20 hover:bg-red-800/40 hover:border-red-400 cursor-pointer"
                      : "border-purple-500/40 bg-purple-900/20 hover:bg-purple-800/40 hover:border-purple-400 cursor-pointer"
                }`}
              >
                {!player.alive && <span className="absolute top-1 right-1 text-sm">💀</span>}
                <span className="text-xl font-bold text-white leading-none">{player.id}</span>
                {isWerewolf && <span className="text-2xl mt-1">{role.emoji}</span>}
                {isWerewolf && <span className="text-xs text-red-300 mt-0.5">狼人</span>}
                {!isWerewolf && player.alive && (
                  <span className="text-xs text-purple-300 mt-1">可选择</span>
                )}
                {isWerewolf && player.alive && (
                  <span className="text-xs text-red-300 mt-1">可选择</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => endGameManually()}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
        >
          🏁 结束游戏
        </button>
      </div>
    );
  }

  // ─── Night Witch Phase ───────────────────────────────────────────────────────
  if (phase === "night_witch") {
    const witch = players.find(p => p.role === "女巫" && p.alive);
    const killedPlayer = nightKillTarget ? players.find(p => p.id === nightKillTarget) : null;

    return (
      <div className="max-w-lg mx-auto">
        {/* Voice toggle button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              voiceEnabled
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {voiceEnabled ? "🔊 语音开启" : "🔇 语音关闭"}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌙</div>
          <h1 className="text-2xl font-bold text-white">第 {dayCount} 夜</h1>
          <p className="text-purple-400 mt-2 text-lg font-semibold">女巫请睁眼</p>
          <p className="text-slate-400 mt-1 text-sm">
            {witchUsedSave ? "你的解药已使用" : "今晚有人被杀，要使用解药吗？"}
          </p>
        </div>

        {/* Killed player info */}
        {killedPlayer && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-6 mb-6 text-center">
            <p className="text-red-300 text-sm mb-3">今晚被杀的是</p>
            <div className="text-6xl mb-2">❓</div>
            <div className="text-3xl font-bold text-white">{killedPlayer.id}号玩家</div>
            {witchUsedSave && (
              <p className="text-red-400 text-sm mt-3">你的解药已经用完了</p>
            )}
          </div>
        )}

        {/* Witch actions */}
        {!witchUsedSave && witch && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => witchUseSave(true)}
              className="py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-lg transition-all"
            >
              ✨ 使用解药
            </button>
            <button
              onClick={() => witchUseSave(false)}
              className="py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg transition-all"
            >
              ⏭️ 不使用
            </button>
          </div>
        )}

        {/* If no witch or witch used save, continue */}
        {(!witch || witchUsedSave) && (
          <button
            onClick={() => witchUseSave(false)}
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg transition-all"
          >
            天亮了 →
          </button>
        )}

        <button
          onClick={() => endGameManually()}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all mt-3"
        >
          🏁 结束游戏
        </button>
      </div>
    );
  }

  // ─── Day Phase ───────────────────────────────────────────────────────
  if (phase === "day") {
    const alivePlayers = players.filter(p => p.alive);
    const votedOutPlayer = votedOutPlayerId ? players.find(p => p.id === votedOutPlayerId) : null;

    return (
      <div className="max-w-lg mx-auto">
        {/* Voice toggle button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              voiceEnabled
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {voiceEnabled ? "🔊 语音开启" : "🔇 语音关闭"}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">☀️</div>
          <h1 className="text-2xl font-bold text-white">第 {dayCount} 天</h1>
          <p className="text-yellow-400 mt-2 text-lg font-semibold">
            {votedOutPlayer ? "投票结果" : "天亮了"}
          </p>
        </div>

        {/* 如果已投票，显示结果 */}
        {votedOutPlayer && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-6 mb-6 text-center">
            <p className="text-red-300 text-sm mb-3">被投出局的是</p>
            <div className="text-5xl mb-2">{ROLES[votedOutPlayer.role].emoji}</div>
            <div className="text-3xl font-bold text-white">{votedOutPlayer.id}号玩家</div>
            <div className="text-xl mt-2">{votedOutPlayer.role}</div>
          </div>
        )}

        {/* 如果还没投票，显示死亡公告和投票选项 */}
        {!votedOutPlayer && (
          <>
            {/* Death announcement */}
            <div className={`rounded-2xl p-6 mb-6 text-center border ${
              nightDeaths.length > 0
                ? "bg-red-900/30 border-red-500/40"
                : "bg-green-900/30 border-green-500/40"
            }`}>
              {nightDeaths.length > 0 ? (
                <>
                  <p className="text-red-300 text-sm mb-3">昨晚</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {nightDeaths.map(id => {
                      const player = players.find(p => p.id === id);
                      return player ? (
                        <div key={id} className="text-center">
                          <div className="text-5xl mb-1">💀</div>
                          <div className="text-2xl font-bold text-white">{id}号玩家</div>
                          <div className="text-lg">{ROLES[player.role].emoji} {player.role}</div>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <p className="text-red-300 text-sm mt-4">死亡</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-2">🎉</div>
                  <p className="text-green-300 text-lg font-semibold">昨晚是平安夜</p>
                  <p className="text-green-400 text-sm mt-2">没有人死亡</p>
                </>
              )}
            </div>

            {/* Alive players */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
              <p className="text-slate-400 text-sm mb-3">存活玩家：</p>
              <div className="flex gap-2 flex-wrap">
                {alivePlayers.map(p => (
                  <span key={p.id} className="px-3 py-2 bg-slate-700 text-white rounded-lg">
                    {p.id}号 {ROLES[p.role].emoji}
                  </span>
                ))}
              </div>
            </div>

            {/* 简化投票 - 选择被投出局的玩家 */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-6">
              <p className="text-yellow-400 text-sm mb-3 font-semibold">投票：选择今天被投出局的玩家</p>
              <div className="grid grid-cols-4 gap-3">
                {alivePlayers.map(player => {
                  const role = ROLES[player.role];
                  return (
                    <button
                      key={player.id}
                      onClick={() => voteOutPlayer(player.id)}
                      className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all select-none
                        border-yellow-500/40 bg-yellow-900/20 hover:bg-yellow-800/40 hover:border-yellow-400 cursor-pointer
                      `}
                    >
                      <span className="text-xl font-bold text-white leading-none">{player.id}</span>
                      <span className="text-xs text-yellow-300 mt-0.5">投出局</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 无人出局按钮 */}
            <button
              onClick={() => voteOutPlayer(null)}
              className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-sm transition-all mb-4"
            >
              🙅 无人出局
            </button>
          </>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          {votedOutPlayer && (
            <button
              onClick={nextNight}
              className="py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg transition-all"
            >
              🌙 进入下一夜
            </button>
          )}
          <button
            onClick={() => endGameManually()}
            className={`py-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-lg transition-all ${votedOutPlayer ? '' : 'col-span-2'}`}
          >
            🏁 结束游戏
          </button>
        </div>
      </div>
    );
  }

  // ─── Werewolf Assassination Phase ───────────────────────────────────────────────────────
  if (phase === "werewolf_assassination") {
    const werewolves = players.filter(p => p.role === "狼人");
    const aliveWerewolves = werewolves.filter(p => p.alive);
    const alivePlayers = players.filter(p => p.alive);

    return (
      <div className="max-w-lg mx-auto">
        {/* Voice toggle button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              voiceEnabled
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {voiceEnabled ? "🔊 语音开启" : "🔇 语音关闭"}
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">⚔️</div>
          <h1 className="text-2xl font-bold text-white">最后刺杀机会</h1>
          <p className="text-red-400 mt-2 text-lg font-semibold">狼人阵营即将失败，但还有最后一次机会！</p>
          <p className="text-slate-400 mt-1 text-sm">选择一名存活玩家进行刺杀，如果是女巫则狼人胜利</p>
        </div>

        {/* Werewolf list */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-4">
          <p className="text-slate-400 text-sm mb-2">狼人阵营（红色边框）：</p>
          <div className="flex gap-2 flex-wrap">
            {werewolves.map(w => (
              <span key={w.id} className={`px-3 py-1 rounded-lg text-sm ${
                w.alive
                  ? "bg-red-900/50 text-red-300"
                  : "bg-slate-700/50 text-slate-400 opacity-50"
              }`}>
                {w.id}号 {w.alive ? "" : "💀"}
              </span>
            ))}
          </div>
        </div>

        {/* Player grid - select assassination target */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-4">
          <p className="text-yellow-400 text-sm mb-3 font-semibold">选择刺杀目标（仅存活玩家）：</p>
          <div className="grid grid-cols-4 gap-3">
            {players.map(player => {
              const role = ROLES[player.role];
              const isWerewolf = player.role === "狼人";
              const isValidTarget = player.alive;

              return (
                <button
                  key={player.id}
                  onClick={() => isValidTarget && werewolfAssassinate(player.id)}
                  disabled={!isValidTarget}
                  className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all select-none ${
                    !player.alive
                      ? "border-slate-700 bg-slate-900/50 opacity-40 cursor-not-allowed"
                      : isWerewolf
                        ? "border-red-500/40 bg-red-900/20 hover:bg-red-800/40 hover:border-red-400 cursor-pointer"
                        : "border-yellow-500/40 bg-yellow-900/20 hover:bg-yellow-800/40 hover:border-yellow-400 cursor-pointer"
                  }`}
                >
                  {!player.alive && <span className="absolute top-1 right-1 text-sm">💀</span>}
                  <span className="text-xl font-bold text-white leading-none">{player.id}</span>
                  {isWerewolf && player.alive && <span className="text-2xl mt-1">{role.emoji}</span>}
                  {isWerewolf && player.alive && <span className="text-xs text-red-300 mt-0.5">狼人</span>}
                  {!isWerewolf && player.alive && <span className="text-xs text-yellow-300 mt-1">可刺杀</span>}
                  {!player.alive && <span className="text-xs text-slate-500 mt-1">已死亡</span>}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => endGameManually()}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
        >
          🏁 结束游戏
        </button>
      </div>
    );
  }

  // ─── Game Over Phase ───────────────────────────────────────────────────────
  if (phase === "game_over") {
    const isGoodWin = winner === "好人";
    const deadPlayers = players.filter(p => !p.alive);
    const alivePlayers = players.filter(p => p.alive);

    return (
      <div className="max-w-lg mx-auto">
        {/* Voice toggle button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              voiceEnabled
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {voiceEnabled ? "🔊 语音开启" : "🔇 语音关闭"}
          </button>
        </div>

        {/* Winner Banner */}
        <div className={`text-center mb-6 rounded-2xl p-8 border-2 ${
          isGoodWin
            ? "bg-blue-900/40 border-blue-500/60"
            : "bg-red-900/40 border-red-500/60"
        }`}>
          <div className="text-6xl mb-3">{isGoodWin ? "🏆" : "🐺"}</div>
          <h1 className="text-3xl font-bold text-white mb-2">游戏结束</h1>
          <div className={`text-2xl font-black ${
            isGoodWin ? "text-blue-400" : "text-red-400"
          }`}>
            {winner}阵营胜利！
          </div>
        </div>

        {/* Assassination Result */}
        {assassinationResult && assassinationTarget && (
          <div className={`text-center mb-6 rounded-2xl p-6 border-2 ${
            assassinationResult === "hit_witch"
              ? "bg-red-900/30 border-red-500/40"
              : "bg-blue-900/30 border-blue-500/40"
          }`}>
            <h2 className="text-xl font-bold text-white mb-3">⚔️ 最后刺杀结果</h2>
            {(() => {
              const targetPlayer = players.find(p => p.id === assassinationTarget);
              if (!targetPlayer) return null;
              const targetRole = ROLES[targetPlayer.role];
              return (
                <>
                  <p className="text-slate-300 mb-2">狼人选择刺杀了</p>
                  <div className="text-5xl mb-2">{targetRole.emoji}</div>
                  <div className="text-2xl font-bold text-white">{targetPlayer.id}号玩家</div>
                  <div className="text-lg text-slate-300 mt-1">{targetRole.name}</div>
                  <div className={`text-lg font-bold mt-3 ${
                    assassinationResult === "hit_witch" ? "text-red-400" : "text-blue-400"
                  }`}>
                    {assassinationResult === "hit_witch"
                      ? "🎯 刺杀成功！狼人阵营胜利！"
                      : "❌ 刺杀失败！好人阵营胜利！"
                    }
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Game Stats */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-4">
          <h2 className="text-lg font-semibold text-white mb-4">📊 游戏统计</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400">进行天数</p>
              <p className="text-2xl font-bold text-white">{dayCount} 天</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400">死亡人数</p>
              <p className="text-2xl font-bold text-white">{deadPlayers.length} 人</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400">存活玩家</p>
              <p className="text-2xl font-bold text-white">{alivePlayers.length} 人</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400">总玩家数</p>
              <p className="text-2xl font-bold text-white">{players.length} 人</p>
            </div>
          </div>
        </div>

        {/* All Players Final Status */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-4">
          <h2 className="text-lg font-semibold text-white mb-4">👥 玩家最终状态</h2>
          <div className="grid grid-cols-2 gap-3">
            {players.map(player => {
              const role = ROLES[player.role];
              return (
                <div
                  key={player.id}
                  className={`rounded-xl p-3 border-2 ${
                    !player.alive
                      ? "bg-slate-900/50 border-slate-600 opacity-60"
                      : role.team === "狼人"
                        ? "bg-red-900/20 border-red-500/40"
                        : "bg-blue-900/20 border-blue-500/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-white">{player.id}号</span>
                    {!player.alive && <span className="text-lg">💀</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{role.emoji}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{role.name}</p>
                      <p className={`text-xs ${
                        role.team === "狼人" ? "text-red-400" : "text-blue-400"
                      }`}>
                        {role.team}阵营
                      </p>
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${
                    player.alive ? "text-green-400" : "text-slate-500"
                  }`}>
                    {player.alive ? "存活" : "死亡"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Death Order (if any) */}
        {deadPlayers.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">⚰️ 死亡名单</h2>
            <div className="flex flex-wrap gap-2">
              {allDeaths.map((id, index) => {
                const player = players.find(p => p.id === id);
                if (!player) return null;
                return (
                  <span
                    key={`${id}-${index}`}
                    className="px-3 py-1.5 bg-red-900/30 text-red-300 rounded-lg text-sm border border-red-500/30"
                  >
                    第{index + 1}夜: {id}号 {ROLES[player.role].emoji}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Restart Button */}
        <button
          onClick={resetToSetup}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg transition-all shadow-lg shadow-purple-900/30"
        >
          🔄 重新开始
        </button>
      </div>
    );
  }
}
