# 五子棋游戏开发任务

## 功能需求
- 新增五子棋（Gomoku）对战游戏
- 支持难度设置（简单/普通/困难）
- 经典模式（15x15 棋盘）
- 人机对战模式（AI 对手）
- 双人对战模式（本地双人）

## 开发清单

- [ ] 创建五子棋游戏页面 `app/gomoku/page.tsx`
- [ ] 实现五子棋游戏核心逻辑 `lib/useGomoku.ts`
  - 15x15 棋盘
  - 胜负判定（横/竖/斜五子连珠）
  - 回合制逻辑
- [ ] 实现 AI 对手 `lib/gomokuAI.ts`
  - 简单：随机落子
  - 普通：基础评估函数
  - 困难：Minimax 算法 + Alpha-Beta 剪枝
- [ ] 创建五子棋组件 `components/gomoku/GomokuGame.tsx`
  - 棋盘渲染
  - 棋子动画
  - 游戏状态显示
- [ ] 添加游戏模式选择（人机/双人）
- [ ] 更新主导航和主页，添加五子棋入口
- [ ] 添加分数记录功能
- [ ] 本地构建测试 (npm run build)
- [ ] 写变更摘要到 .dispatch/tasks/add-gomoku/output.md
