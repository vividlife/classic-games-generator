# 五子棋 Bug 修复任务

## 问题描述
1. "再来一局"按钮无法点击
2. AI 对战时 AI 一直在思考（性能问题）

## AI 算法改进方案（标准入门五子棋 AI）
1. 棋盘打分函数 - 评估棋型分数
2. Minimax + Alpha-Beta 剪枝算法
3. 搜索深度限制 2-4 层

## 修复清单

- [x] 检查并修复"再来一局"按钮点击问题
  - `GomokuGame.tsx`: onClick 改为 `handleStart`（原为 `handleReset`）；覆盖层添加 `z-10`
- [x] 重写 AI 算法 `lib/useGomoku.ts`
  - 实现棋盘打分函数（lineScore/cellScore/evalBoard）
  - 实现 Minimax 算法（minimax 函数）
  - 实现 Alpha-Beta 剪枝优化（alpha/beta 参数 + 移动排序）
  - 限制搜索深度 2-4 层（DEPTH_MAP: easy=2, medium=3, hard=4）
  - 关键修复：将 `state.aiThinking` 从 useEffect 依赖数组中移除，避免 cleanup 取消定时器
- [x] 测试 AI 对战响应时间（应该在 1-2 秒内）
  - Alpha-Beta + 移动排序将困难模式响应时间控制在 1 秒内
- [x] 本地构建测试 (npm run build)
  - ✓ Compiled successfully; ✓ Types valid; ✓ 7 static pages generated
- [x] 写变更摘要到 .dispatch/tasks/fix-gomoku-bugs/output.md
