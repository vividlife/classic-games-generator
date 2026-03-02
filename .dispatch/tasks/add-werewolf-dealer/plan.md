# 狼人杀发牌工具开发任务

## 项目定位
极简版狼人杀身份分配工具，无游戏流程、无发言、无投票

## 核心功能
1. 自定义玩家数字编号（可设置玩家数量和编号方式）
2. 随机分配身份（狼人、村民、预言家、女巫等经典角色）
3. 玩家依次查看自身身份（点击编号查看，点击其他地方隐藏）
4. 全局解锁查看所有身份（主持人/上帝视角）

## 开发清单

- [x] 创建狼人杀发牌页面 `app/werewolf/page.tsx`
- [x] 实现核心逻辑 `lib/useWerewolf.ts`
  - 玩家管理（添加/删除/编号）
  - 角色配置（选择角色种类和数量）
  - 随机分配算法
  - 身份查看状态管理
- [x] 创建游戏组件 `components/werewolf/WerewolfDealer.tsx`
  - 玩家编号网格显示
  - 点击查看身份（遮罩层）
  - 全局解锁按钮
  - 重新发牌按钮
- [x] 更新主导航和主页，添加入口
- [x] 本地构建测试 (npm run build) - 必须成功 ✓ 10/10 pages generated
- [x] 提交到 GitHub - commit 38ff188 推送至 origin/main
- [x] 写变更摘要到 .dispatch/tasks/add-werewolf-dealer/output.md
