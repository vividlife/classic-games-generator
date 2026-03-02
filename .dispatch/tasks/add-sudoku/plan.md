# 数独游戏开发任务

## 功能需求
- 经典9x9数独游戏
- 支持多种难度（简单/普通/困难/专家）
- 尽可能多的局数（使用随机种子生成大量谜题）
- 自动验证答案正确性

## 开发清单

- [x] 创建数独游戏页面 `app/sudoku/page.tsx`
- [x] 实现数独核心逻辑 `lib/useSudoku.ts`
  - 数独生成算法（回溯法生成有效谜题）— `lib/sudokuGenerator.ts`
  - 难度控制（根据挖空数量和位置）
  - 验证答案正确性
  - 提示功能
- [x] 创建数独组件 `components/sudoku/SudokuBoard.tsx`
  - 9x9 网格显示
  - 数字输入面板
  - 高亮冲突数字
  - 计时器
- [x] 更新主导航和主页，添加数独入口
- [x] 本地构建测试 (npm run build) - 构建成功，无错误
- [x] 提交到 GitHub — commit 9916ca7，已推送至 main
- [x] 写变更摘要到 .dispatch/tasks/add-sudoku/output.md
