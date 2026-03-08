# 添加围棋游戏

## 需求
在经典游戏项目中添加围棋游戏，双人双人对战模式（不需要AI）。

## 任务清单

- [x] 研究现有游戏结构（如 gomoku 五子棋、reversi 黑白棋）了解代码风格
- [x] 创建 `app/go/` 目录（与其他游戏保持一致，不用 games 子目录）
- [x] 实现围棋核心逻辑（lib/useGo.ts）：
  - 支持 9x9、13x13、19x19 棋盘
  - 黑白双方轮流落子
  - 气的计算（BFS/DFS findGroup + countLiberties）和提子规则
  - 禁入点判断（suicide 规则）
  - 打劫规则（ko point 跟踪，1子劫禁止立即回提）
- [x] 创建围棋 UI 组件（components/go/）：
  - GoBoard.tsx：棋盘+交叉点渲染、星位、落子交互、悬停预览、劫材标记
  - GoGame.tsx：开始界面选棋盘大小、提子数、虚手/认输（带确认）/重开按钮
- [x] 添加游戏页面路由（app/go/page.tsx）
- [x] 在首页添加围棋入口（在黑白棋之后插入围棋卡片）
- [x] 运行 `npm run build` 验证编译通过（18条路由全部 ✓）
- [x] 将修改摘要写入 `.dispatch/tasks/add-go-game/output.md`
