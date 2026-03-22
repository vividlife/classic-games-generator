# REPORT-2026-03-22-werewolf-night-info-leak-fix

## 根因定位

`components/werewolf/WerewolfDealer.tsx` 中 `night_werewolf` 阶段的渲染代码存在两处信息泄露：

1. **明文狼人列表面板**（最严重）：
   ```jsx
   <div className="bg-slate-800 ...">
     <p className="text-slate-400 text-sm mb-2">在场狼人（红色边框）：</p>
     <div className="flex gap-2 flex-wrap">
       {werewolves.map(w => (
         <span ...>{w.id}号</span>
       ))}
     </div>
   </div>
   ```
   该 block 直接将所有狼人编号以列表形式展示在公共界面。

2. **玩家格子的身份视觉标记**：
   - 狼人格子使用红色边框 (`border-red-500/60 bg-red-900/20`)
   - 狼人格子显示狼人 emoji (`{isWerewolf && <span ...>{role.emoji}</span>}`)
   - 狼人格子显示"狼人"文字标签 (`{isWerewolf && <span ...>狼人</span>}`)

   任何观看屏幕的人都可以通过颜色/图标立即识别出谁是狼人。

## 修改文件

- `components/werewolf/WerewolfDealer.tsx`

## 具体修复策略

**低风险、最小改动**，仅修改 `night_werewolf` 阶段的 UI 渲染：

1. 删除整个"在场狼人（红色边框）："列表面板
2. 删除玩家格子中基于 `isWerewolf` 的差异化视觉（红色边框、狼人 emoji、"狼人"标签）
3. 所有存活玩家统一使用中性的紫色边框样式，显示玩家编号和"可选择"提示
4. 死亡玩家仍保留灰化+💀标记
5. 删除已无用的 `werewolves` 和 `alivePlayers` 变量（原仅用于信息泄露的渲染）

游戏逻辑（`werewolfKill` 回调、按钮禁用状态等）**完全未改动**。

## 运行的验证

- `npx tsc --noEmit`：0 TypeScript 错误
- 代码审查：`night_witch`、`day`、`game_over` 等其他阶段均未受影响
- `phase === "night_werewolf"` 渲染路径确认：不再引用 `player.role`，不再区分狼人/非狼人

## 仍存在的风险 / 未覆盖项

- 无浏览器端 E2E 测试，无法自动验证 UI 渲染；已通过代码审查确认
- `night_witch` 阶段中女巫身份（`witch` 变量）仅在内部逻辑中使用，未在 UI 展示，不存在泄露
- `game_over` 阶段会开启上帝视角展示所有身份，此为设计预期，不属于泄露
