# 猜数字游戏（AB游戏）开发任务

## 功能需求
- 经典的 Bulls and Cows 游戏
- 系统随机生成4位不重复的数字
- 玩家输入猜测的4位数字
- 系统反馈几A几B：
  - A = 数字和位置都正确
  - B = 数字正确但位置不对
- 支持历史记录显示
- 支持提示功能

## 开发清单

- [ ] 创建猜数字游戏页面 `app/guess-number/page.tsx`
- [ ] 实现游戏核心逻辑 `lib/useGuessNumber.ts`
  - 生成4位不重复随机数
  - 验证玩家输入
  - 计算 A/B 结果
- [ ] 创建游戏组件 `components/guess-number/GuessNumberGame.tsx`
  - 数字输入界面
  - 历史记录显示
  - 结果提示
- [ ] 更新主导航和主页，添加猜数字入口
- [ ] 本地构建测试 (npm run build) - 必须成功
- [ ] 提交到 GitHub
- [ ] 写变更摘要到 .dispatch/tasks/add-abgame/output.md
