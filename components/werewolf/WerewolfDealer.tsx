"use client";

import { useWerewolf, ROLES, PRESET_CONFIGS, RoleName } from "@/lib/useWerewolf";

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
    setPlayerCount,
    setRoleConfig,
    applyPreset,
    dealRoles,
    revealPlayer,
    hideActive,
    toggleGlobalUnlock,
    resetToSetup,
  } = useWerewolf();

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
            <span className="text-slate-400 text-sm ml-1">（6 - 18 人）</span>
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
  const activePlayer = players.find(p => p.id === activePlayerId);

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🐺</div>
        <h1 className="text-2xl font-bold text-white">狼人杀发牌工具</h1>
        <p className="text-slate-400 mt-1 text-sm">
          {globalUnlocked ? "上帝视角已开启" : "点击编号查看自己的身份"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={toggleGlobalUnlock}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            globalUnlocked
              ? "bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400/50"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }`}
        >
          {globalUnlocked ? "🔓 上帝视角" : "🔒 全部解锁"}
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
          return (
            <button
              key={player.id}
              onClick={() => !globalUnlocked && revealPlayer(player.id)}
              className={`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all select-none ${
                globalUnlocked
                  ? role.team === "狼人"
                    ? "border-red-500/60 bg-red-900/20 cursor-default"
                    : "border-blue-500/40 bg-blue-900/10 cursor-default"
                  : "border-slate-600 bg-slate-800 hover:border-purple-500/60 hover:bg-slate-700 active:bg-slate-600 cursor-pointer"
              }`}
            >
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
            </button>
          );
        })}
      </div>

      <p className="text-center text-slate-600 text-xs mt-6">
        共 {players.length} 名玩家 ·{" "}
        {players.filter(p => ROLES[p.role].team === "狼人").length} 只狼人
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
