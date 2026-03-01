# 五子棋Bug修复和AI优化

## 问题
1. "再来一局"按钮无法点击
2. AI对战时AI一直在思考（卡死）

## 解决方案
用标准简单的 Minimax + Alpha-Beta 剪枝算法重写AI

- [x] 修复"再来一局"按钮无法点击的bug
  - 两个根本原因：① 棋盘格子有 zIndex:1，而覆盖层无 z-index，导致格子遮挡覆盖层拦截点击 → 给覆盖层加 z-10；② onClick 调用 handleReset（回到 idle 界面），改为 handleStart（立即开始新局）
- [x] 实现棋盘打分函数（评估棋型：连五、活四、冲四、活三、眠三等）
  - lineScore() + cellScore() + evalBoard()：连五=100000、活四=50000、冲四=5000、活三=1000、眠三=200、活二=50、眠二=5
- [x] 实现 Minimax 算法
  - minimax() 函数，支持最大化/最小化双方
- [x] 添加 Alpha-Beta 剪枝优化
  - 内置在 minimax() 中，分支上限=12，结合落子得分排序提升剪枝效率
- [x] 限制搜索深度为 2～4 层（根据难度调整）
- [x] 简单难度：2层，中等难度：3层，困难难度：4层
- [x] 本地测试构建和运行验证
  - npm run build 通过，无 TypeScript 错误
- [x] 提交并推送到 GitHub
  - commit bdd4674 已推送至 origin/main
- [x] 输出修复摘要
