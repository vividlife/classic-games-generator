# REPORT-2026-03-22-werewolf-sheriff-before-first-night-deaths

## 根因定位

`lib/useWerewolf.ts` 中 `witchUseSave` 函数在女巫操作完成后，无论是第几天，均直接将 `phase` 设为 `"day"`。而 `"day"` 阶段的 UI（`WerewolfDealer.tsx` line ~612）会立即渲染首夜死亡公告。

游戏中完全没有"争警长"阶段的 phase 值和对应 UI，导致第一天天亮后直接跳到死亡公告，争警长环节缺失。

## 修改文件

### `lib/useWerewolf.ts`
1. `GamePhase` 类型新增 `"day_sheriff_election"` 值（line 50）。
2. `witchUseSave` 中：第一天（`dayCount === 1`）且游戏未结束时，`newPhase` 改为 `"day_sheriff_election"` 而非 `"day"`（line ~362-370）。
3. 新增 `confirmSheriffElection` callback：将 phase 从 `"day_sheriff_election"` 推进到 `"day"`。
4. hook 返回值中导出 `confirmSheriffElection`。

### `components/werewolf/WerewolfDealer.tsx`
1. 新增语音提示 `sheriff_election_start`。
2. `useEffect` 语音逻辑中增加对 `"day_sheriff_election"` phase 的处理（播放"天亮了，开始争警长"）。
3. `useWerewolf()` 解构中增加 `confirmSheriffElection`。
4. 在 Night Witch Phase 与 Day Phase 之间新增 `"day_sheriff_election"` 阶段 UI：显示"争夺警长"提示，提供"警长已选出，公布昨晚死亡"按钮，点击后调用 `confirmSheriffElection()` 进入 `"day"` 阶段。

## 修复策略

最小化改动：仅在 `witchUseSave` 的相变逻辑中加入一个 `isFirstDay` 判断，插入新 phase；其余白天流程（发言、投票、nextNight 等）完全不动。第二天及之后的天亮仍直接进入 `"day"` phase，不受影响。

## 验证

- `npm run build` 通过，TypeScript 编译无错误，18 个静态页面正常生成，`/werewolf` 页面 8.34kB 正常。
- 逻辑走查：
  - 首夜 `witchUseSave(false/true)` -> `dayCount===1` && `winner===null` && `!needsAssassination` -> `phase = "day_sheriff_election"` ✓
  - 第二夜起 `witchUseSave` -> `dayCount===2+` -> `phase = "day"` ✓
  - `confirmSheriffElection()` -> `phase = "day"` -> 渲染死亡公告 ✓
  - 首夜游戏即结束（assassination/game_over）-> 不经过 `day_sheriff_election` ✓

## 仍存在的风险 / 未覆盖项

- 无自动化端到端测试，验证完全依赖逻辑走查 + build 通过。
- 若未来引入"跳过警长"规则，需要在此 phase 中增加跳过按钮。
- `"day_sheriff_election"` 阶段未在 `nextNight` 函数中做特殊处理，但 `nextNight` 只在 `"day"` 阶段完成投票后才可触发，不存在冲突。
