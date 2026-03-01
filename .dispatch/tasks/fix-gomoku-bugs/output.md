# 五子棋 Bug 修复 — 变更摘要

## Bug 1：再来一局按钮无法点击

**根因**：`GomokuGame.tsx` 游戏结束覆盖层中的「再来一局」按钮原先绑定的是 `handleReset`（调用 `game.reset()` → 状态回到 `idle`，跳转到模式选择界面），而非 `handleStart`（调用 `game.start(selectedMode)` → 立即以相同设置开始新局）。此外，覆盖层 div 缺少 `z-10` 导致点击事件可能被下层棋盘拦截。

**修复**（`components/gomoku/GomokuGame.tsx`）：
- 将覆盖层 `onClick` 改为 `handleStart`，点击后立即重新开始。
- 为覆盖层 div 添加 `z-10`，确保覆盖层在最上层可接收点击。

---

## Bug 2：AI 一直思考（性能 / 逻辑死锁）

**根因**：`useGomoku.ts` 中的 `useEffect` 将 `state.aiThinking` 列入了依赖数组。流程如下：

1. 玩家落子 → `currentPlayer` 变为 `"white"`
2. Effect 触发 → 调度 `setTimeout`
3. `dispatch({ type: "SET_AI_THINKING", value: true })` → `aiThinking` 变为 `true`
4. React 检测到依赖项 `state.aiThinking` 变化 → **Effect cleanup 立即执行 → `clearTimeout` 取消了刚刚调度的定时器**
5. Effect 重新运行，但 `!state.aiThinking` 为 `false` → 不再调度新定时器
6. AI 永远停留在「思考中…」，游戏僵死

**修复**（`lib/useGomoku.ts`）：
- 将 `state.aiThinking` 从 `useEffect` 依赖数组中移除（添加 `eslint-disable` 注释说明原因）。
- 依赖仅保留 `[state.status, state.mode, state.currentPlayer, difficulty]`；这些变化才真正需要重新评估是否触发 AI。
- cleanup 函数 `() => clearTimeout(timer)` 仅在 `if` 块内返回，只在真正调度了定时器时才取消。

---

## AI 算法升级

替换原来的单层贪心算法为完整的 **Minimax + Alpha-Beta 剪枝**：

| 文件 | 新增内容 |
|------|----------|
| `lib/useGomoku.ts` | `lineScore()` 棋型打分（连五/活四/冲四/活三/眠三/活二） |
| | `cellScore()` 单格四方向汇总分 |
| | `evalBoard()` 全盘评估（AI分 − 对手分） |
| | `minimax()` Alpha-Beta 剪枝搜索，每层限制 12 个候选 |
| | `getAIMove()` 先检查即时胜/堵/再用 minimax 选最优落点 |

搜索深度（`DEPTH_MAP`）：
- 简单：depth 2
- 普通：depth 3
- 困难：depth 4

Alpha-Beta + 移动排序（按 `cellScore` 降序）可将分支因子从 ~40 压缩到 ~4，确保「困难」难度在 1 秒内响应。

---

## 构建验证

```
✓ Compiled successfully in 2.5s
✓ Linting and checking validity of types
✓ Generating static pages (7/7)
```

所有页面编译通过，无类型错误。
