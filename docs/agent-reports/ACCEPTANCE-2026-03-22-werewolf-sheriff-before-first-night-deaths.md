# ACCEPTANCE-2026-03-22-werewolf-sheriff-before-first-night-deaths

## 验收清单

- [x] **第一天先进入争警长环节**
  `witchUseSave` 在 `dayCount === 1` 且游戏未结束时，将 phase 设为 `"day_sheriff_election"`，渲染"争夺警长"UI，不直接进入死亡公告。

- [x] **争警长结束前不公布首夜死亡信息**
  `"day_sheriff_election"` phase 的 UI 中不渲染 `nightDeaths`，死亡信息在此阶段不可见。

- [x] **争警长结束后才公布首夜死亡信息**
  点击"警长已选出，公布昨晚死亡"按钮调用 `confirmSheriffElection()`，phase 切换为 `"day"`，进入死亡公告和投票流程。

- [x] **后续白天流程仍可继续推进**
  `"day"` phase 的投票、"进入下一夜"、第二天及以后的流程逻辑均未改动，`npm run build` 编译通过。

- [x] **已回填报告与验收单**
  - `docs/agent-reports/REPORT-2026-03-22-werewolf-sheriff-before-first-night-deaths.md` ✓
  - `docs/agent-reports/ACCEPTANCE-2026-03-22-werewolf-sheriff-before-first-night-deaths.md` ✓（本文件）
