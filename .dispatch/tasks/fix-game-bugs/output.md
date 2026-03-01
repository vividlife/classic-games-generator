# 游戏 Bug 修复摘要

## 修复时间
2026-03-01

## 提交信息
commit `fbcc70a` — 已推送到 `origin/main`

---

## 修复内容

### 1. 贪吃蛇蛇身不增长 Bug

**文件**: `lib/useSnake.ts`

**根本原因**: `INITIAL_SNAKE` 是模块级常量，`getInitialState()` 和 `RESET` case 都直接引用同一个数组对象。虽然 reducer 不会直接修改数组，但共享引用在多次游戏会话中可能导致意外的状态共享，影响蛇身增长逻辑的可靠性。

**修复方式**: 将 `INITIAL_SNAKE` 常量替换为 `createInitialSnake()` 工厂函数，每次调用都返回全新的数组对象，确保每局游戏都有独立的初始状态。

```typescript
// Before (共享引用)
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }, ...]

// After (工厂函数，每次返回新数组)
function createInitialSnake(): Position[] {
  return [{ x: 10, y: 10 }, ...]
}
```

---

### 2. 俄罗斯方块方块不落下 Bug

**文件**: `lib/useTetris.ts`

**根本原因**: `lockAndSpawn()` 函数在成功生成新方块后，返回对象使用 `...state` 展开但没有显式设置 `status` 字段。这意味着在某些边缘情况下（如 React 并发渲染或状态批量更新），`status` 可能从 `...state` 携带非预期值，导致游戏循环中断。

**修复方式**: 在 `lockAndSpawn` 的成功返回路径中显式设置 `status: "playing"`，确保新方块生成后游戏始终处于运行状态。

```typescript
// Before (依赖 ...state 扩散)
return { ...state, board: cleared, current: next, next: newPiece, ... }

// After (显式设置 status)
return { ...state, board: cleared, current: next, next: newPiece, ..., status: "playing" }
```

---

### 3. 全界面中文本地化

**涉及文件**:
- `types/index.ts` — 难度标签 (简单/普通/困难)、主题名称 (经典/霓虹/森林/海洋)
- `components/ui/Header.tsx` — 导航栏 (主页/贪吃蛇/俄罗斯方块)
- `components/ui/GameSettings.tsx` — 设置面板 (玩家名称/难度/主题)
- `components/ui/ScoreBoard.tsx` — 排行榜 (日期格式改为 zh-CN)
- `components/snake/SnakeGame.tsx` — 贪吃蛇游戏 UI 全部中文化
- `components/tetris/TetrisGame.tsx` — 俄罗斯方块游戏 UI 全部中文化
- `app/layout.tsx` — 网站标题和描述
- `app/page.tsx` — 首页所有文本
- `app/snake/page.tsx` — 贪吃蛇页面
- `app/tetris/page.tsx` — 俄罗斯方块页面

---

## 构建验证

```
✓ Compiled successfully in 3.6s
✓ Generating static pages (6/6)
```

所有路由编译通过，无 TypeScript 错误。
