# ACCEPTANCE-2026-03-22-werewolf-night-info-leak-fix

## 验收 Checklist

- [x] **"狼人请睁眼"阶段不再泄露狼人身份**
  - 删除了"在场狼人（红色边框）："列表面板，不再列出狼人编号
  - 删除了玩家格子中狼人专属的红色边框、🐺 emoji 和"狼人"文字标签
  - 所有存活玩家格子在此阶段外观一致，无法从 UI 辨别谁是狼人

- [x] **游戏仍可继续推进**
  - 玩家格子仍可点击，`werewolfKill(player.id)` 回调完整保留
  - 死亡玩家仍正确禁用并显示 💀
  - `night_witch` → `day` → 投票 → `game_over` 流程代码均未改动

- [x] **未发现与本修复直接相关的新报错**
  - `npx tsc --noEmit` 通过，0 TypeScript 错误
  - 删除了不再使用的 `werewolves` 和 `alivePlayers` 变量，消除潜在 lint 警告

- [x] **已回填报告与验收单**
  - `docs/agent-reports/REPORT-2026-03-22-werewolf-night-info-leak-fix.md` ✓
  - `docs/agent-reports/ACCEPTANCE-2026-03-22-werewolf-night-info-leak-fix.md` ✓
