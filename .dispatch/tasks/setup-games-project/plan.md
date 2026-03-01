# 经典小游戏生成器项目

## 项目概述
创建一个经典小游戏生成器，支持贪吃蛇和俄罗斯方块，可部署到 Vercel，使用 GitHub 进行代码管理。

- [x] 初始化项目结构：Next.js + TypeScript + Tailwind CSS (Next.js 15.5.12, TypeScript 5, Tailwind CSS 3)
- [x] 创建项目基础架构（目录结构、配置文件）(app/, components/, lib/, types/ 目录；tailwind, postcss, next.config 配置)
- [x] 实现贪吃蛇游戏核心逻辑 (useSnake hook, SnakeBoard, SnakeControls, SnakeGame 组件)
- [x] 实现俄罗斯方块游戏核心逻辑 (useTetris hook, tetrominos, TetrisBoard, TetrisControls, TetrisGame 组件)
- [x] 创建游戏选择界面和导航 (主页游戏卡片, Header 导航, /snake /tetris 路由)
- [x] 实现难度选择功能（简单/中等/困难）(GameSettings 组件, DIFFICULTIES config, Zustand store)
- [x] 实现皮肤/主题切换功能 (4 主题: Classic/Neon/Forest/Ocean, THEMES config)
- [x] 添加分数系统和排行榜 (scoreManager.ts, localStorage 持久化, ScoreBoard 组件, 分数倍率)
- [x] 配置 Vercel 部署 (vercel.json 配置文件)
- [x] 初始化 Git 仓库并推送到 GitHub (https://github.com/vividlife/classic-games-generator)
- [x] 编写 README 文档和使用说明 (功能说明、控制方式、技术栈、部署指南)
- [x] 输出变更摘要到 .dispatch/tasks/setup-games-project/output.md
