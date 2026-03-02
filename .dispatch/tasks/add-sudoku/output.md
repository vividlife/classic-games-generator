# 数独游戏 - 变更摘要

## 完成时间
2026-03-02

## 新增文件
- `lib/sudokuGenerator.ts` — 回溯法生成有效数独谜题，支持唯一解验证
- `lib/useSudoku.ts` — 游戏逻辑 React Hook（状态管理、冲突检测、计时器、提示）
- `components/sudoku/SudokuBoard.tsx` — 游戏主界面（9×9棋盘、数字输入面板、控制按钮）
- `app/sudoku/page.tsx` — 数独页面（含 Header 导航）

## 修改文件
- `app/page.tsx` — 新增数独游戏卡片入口
- `components/ui/Header.tsx` — 导航栏添加"数独"链接

## 功能实现
- 四档难度：简单（30-35空格）、普通（40-45空格）、困难（50-55空格）、专家（55-60空格）
- 回溯算法生成已解决网格，随机挖空并验证唯一解
- 冲突高亮（同行/列/宫格相同数字标红）
- 同数字高亮（选中格的相同数字全盘高亮）
- 关联格高亮（同行/列/宫格背景变暗）
- 计时器（秒级，完成后停止）
- 提示功能（填入选中格或随机一格的正确答案）
- 键盘输入支持（1-9 输入，Backspace/Delete 清除）

## 构建状态
`npm run build` 成功，无 TypeScript 错误

## Git 提交
`9916ca7` 新增数独游戏 → 已推送至 GitHub main 分支
