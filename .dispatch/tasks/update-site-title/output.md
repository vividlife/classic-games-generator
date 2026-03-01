# 变更摘要 — 网站标题更新

## 任务
将网站标题从"经典游戏"改为"荣升的游戏小站"

## 修改文件

| 文件 | 变更内容 |
|------|---------|
| `app/layout.tsx` | metadata.title: "经典游戏" → "荣升的游戏小站"；lang="en" → lang="zh-CN" |
| `app/page.tsx` | `<h1>` 标题: "经典游戏" → "荣升的游戏小站" |
| `app/snake/page.tsx` | metadata.title: "贪吃蛇 - 经典游戏" → "贪吃蛇 - 荣升的游戏小站" |
| `app/tetris/page.tsx` | metadata.title: "俄罗斯方块 - 经典游戏" → "俄罗斯方块 - 荣升的游戏小站" |
| `components/ui/Header.tsx` | 导航栏品牌名: "🎮 经典游戏" → "🎮 荣升的游戏小站" |

## 构建结果
- `npm run build` 成功，无错误
- 4 条路由静态生成通过: `/`、`/_not-found`、`/snake`、`/tetris`

## Git
- Commit: `5cbe20f` — feat: rename site to 荣升的游戏小站
- 推送至: https://github.com/vividlife/classic-games-generator (main 分支)
