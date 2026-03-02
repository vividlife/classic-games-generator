# 推箱子游戏开发任务

## 功能需求
- 经典推箱子（Sokoban）游戏
- 支持多种难度（简单/普通/困难/专家）
- 大量关卡（预设经典关卡）
- 撤销功能（回退操作）

## 开发清单

- [ ] 创建推箱子游戏页面 `app/sokoban/page.tsx`
- [ ] 实现推箱子核心逻辑 `lib/useSokoban.ts`
  - 地图解析和渲染
  - 移动逻辑（玩家和箱子）
  - 碰撞检测
  - 胜利判断
- [ ] 创建关卡数据 `lib/sokobanLevels.ts`
  - 经典关卡集合（至少50关）
  - 按难度分类
- [ ] 创建推箱子组件 `components/sokoban/SokobanGame.tsx`
  - 游戏地图显示
  - 方向键控制
  - 撤销/重置按钮
  - 关卡选择
- [ ] 更新主导航和主页，添加推箱子入口
- [ ] 本地构建测试 (npm run build) - 必须成功
- [ ] 提交到 GitHub
- [ ] 写变更摘要到 .dispatch/tasks/add-sokoban/output.md
