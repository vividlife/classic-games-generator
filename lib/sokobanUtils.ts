"use client";

import {
  WALL,
  FLOOR,
  GOAL,
  BOX,
  PLAYER,
  BOX_ON_GOAL,
  PLAYER_ON_GOAL,
  Position,
} from "./useSokoban";

// ==========================================
// 关卡求解器 - 使用 BFS + Deadlock Detection
// ==========================================

interface GameState {
  player: Position;
  boxes: Position[];
}

interface SolverState extends GameState {
  moves: number;
  pushes: number;
  parent: SolverState | null;
  lastMove: string | null;
}

function stateKey(player: Position, boxes: Position[]): string {
  const sortedBoxes = [...boxes].sort((a, b) => a.x - b.x || a.y - b.y);
  return `${player.x},${player.y}|${sortedBoxes.map((b) => `${b.x},${b.y}`).join(";")}`;
}

function posEq(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function posHash(p: Position): string {
  return `${p.x},${p.y}`;
}

// 简单的 BFS 检查玩家是否可以到达某个位置（不推箱子）
function canReachPosition(
  map: string[][],
  start: Position,
  target: Position,
  boxes: Position[]
): boolean {
  const rows = map.length;
  const cols = map[0]?.length || 0;
  const visited = new Set<string>();
  const queue: Position[] = [start];
  visited.add(posHash(start));

  const boxSet = new Set(boxes.map(posHash));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (posEq(current, target)) return true;

    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    for (const { dx, dy } of dirs) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const key = posHash({ x: nx, y: ny });

      if (
        nx >= 0 &&
        nx < cols &&
        ny >= 0 &&
        ny < rows &&
        map[ny][nx] !== WALL &&
        !visited.has(key) &&
        !boxSet.has(key)
      ) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return false;
}

// 检查玩家是否可以到达所有箱子的旁边
function canReachAllBoxes(
  map: string[][],
  player: Position,
  boxes: Position[],
  goals: Position[]
): boolean {
  for (const box of boxes) {
    // 检查箱子的四个方向是否有可达的空位
    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    let canReach = false;
    for (const { dx, dy } of dirs) {
      const besideX = box.x + dx;
      const besideY = box.y + dy;

      // 检查旁边的位置是否是墙
      if (
        besideY < 0 ||
        besideY >= map.length ||
        besideX < 0 ||
        besideX >= map[0]!.length ||
        map[besideY][besideX] === WALL
      ) {
        continue;
      }

      // 检查旁边的位置是否有其他箱子
      const hasOtherBox = boxes.some(
        (b) => !posEq(b, box) && b.x === besideX && b.y === besideY
      );
      if (hasOtherBox) continue;

      // 检查玩家是否可以到达这个位置
      if (canReachPosition(map, player, { x: besideX, y: besideY }, boxes)) {
        canReach = true;
        break;
      }
    }

    if (!canReach) return false;
  }

  return true;
}

function isWall(map: string[], x: number, y: number): boolean {
  if (y < 0 || y >= map.length) return true;
  if (x < 0 || x >= map[y].length) return true;
  return map[y][x] === WALL;
}

function getBoxAt(boxes: Position[], x: number, y: number): number {
  return boxes.findIndex((b) => b.x === x && b.y === y);
}

// 检测简单死锁：箱子被推到角落且不是目标点
function isSimpleDeadlock(map: string[], goals: Position[], box: Position): boolean {
  const isOnGoal = goals.some((g) => posEq(g, box));
  if (isOnGoal) return false;

  const { x, y } = box;
  const wallN = isWall(map, x, y - 1);
  const wallS = isWall(map, x, y + 1);
  const wallW = isWall(map, x - 1, y);
  const wallE = isWall(map, x + 1, y);

  // 角落死锁
  if ((wallN || wallS) && (wallW || wallE)) {
    return true;
  }

  return false;
}

// 提前计算哪些区域是永远无法把箱子推出去的（冻结死锁）
function calculateFrozenAreas(
  map: string[],
  goals: Position[]
): Set<string> {
  const frozen = new Set<string>();
  const rows = map.length;
  const cols = Math.max(...map.map((row) => row.length));

  // 从目标反向 BFS，找出所有可以通过推动箱子到达目标的位置
  const goalSet = new Set(goals.map(posHash));
  const visited = new Set<string>();
  const queue: Position[] = [...goals];

  goals.forEach((g) => visited.add(posHash(g)));

  while (queue.length > 0) {
    const current = queue.shift()!;

    // 对于每个方向，检查是否可以从该方向把箱子推到当前位置
    // 也就是说，箱子在 current - dir，玩家在 current - 2*dir
    // 并且玩家可以到达那里
    const dirs = [
      { dx: 0, dy: -1 }, // UP
      { dx: 0, dy: 1 }, // DOWN
      { dx: -1, dy: 0 }, // LEFT
      { dx: 1, dy: 0 }, // RIGHT
    ];

    for (const { dx, dy } of dirs) {
      const boxPrevX = current.x - dx;
      const boxPrevY = current.y - dy;
      const playerStandX = current.x - 2 * dx;
      const playerStandY = current.y - 2 * dy;

      // 检查箱子之前的位置和玩家站立位置是否有效
      if (
        !isWall(map, boxPrevX, boxPrevY) &&
        !isWall(map, playerStandX, playerStandY)
      ) {
        const key = posHash({ x: boxPrevX, y: boxPrevY });
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ x: boxPrevX, y: boxPrevY });
        }
      }
    }
  }

  // 不在 visited 中的位置就是死区（除非是墙）
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!isWall(map, x, y)) {
        const key = posHash({ x, y });
        if (!visited.has(key) && !goalSet.has(key)) {
          frozen.add(key);
        }
      }
    }
  }

  return frozen;
}

// 解析关卡地图
function parseLevelMap(levelMap: string[]): {
  boxes: Position[];
  goals: Position[];
  player: Position;
  map: string[];
} {
  const boxes: Position[] = [];
  const goals: Position[] = [];
  let player: Position = { x: 0, y: 0 };
  const map: string[] = [];

  const maxWidth = Math.max(...levelMap.map((row) => row.length));

  levelMap.forEach((row, y) => {
    let mapRow = "";
    const paddedRow = row.padEnd(maxWidth, " ");

    for (let x = 0; x < paddedRow.length; x++) {
      const cell = paddedRow[x];

      switch (cell) {
        case WALL:
          mapRow += WALL;
          break;
        case FLOOR:
          mapRow += FLOOR;
          break;
        case GOAL:
          mapRow += GOAL;
          goals.push({ x, y });
          break;
        case BOX:
          mapRow += FLOOR;
          boxes.push({ x, y });
          break;
        case PLAYER:
          mapRow += FLOOR;
          player = { x, y };
          break;
        case BOX_ON_GOAL:
          mapRow += GOAL;
          boxes.push({ x, y });
          goals.push({ x, y });
          break;
        case PLAYER_ON_GOAL:
          mapRow += GOAL;
          player = { x, y };
          goals.push({ x, y });
          break;
        default:
          mapRow += FLOOR;
      }
    }
    map.push(mapRow);
  });

  return { boxes, goals, player, map };
}

// 从求解状态回溯获取移动步骤
function getSolutionSteps(finalState: SolverState): string[] {
  const steps: string[] = [];
  let current: SolverState | null = finalState;

  while (current && current.lastMove) {
    steps.unshift(current.lastMove);
    current = current.parent;
  }

  return steps;
}

// 完整求解器，返回解决步骤
export function solveLevel(
  levelMap: string[],
  maxSteps: number = 200000
): string[] | null {
  const { boxes, goals, player, map } = parseLevelMap(levelMap);

  const initialState: SolverState = {
    player,
    boxes,
    moves: 0,
    pushes: 0,
    parent: null,
    lastMove: null,
  };

  const isComplete = (stateBoxes: Position[]): boolean => {
    return goals.every((goal) => stateBoxes.some((box) => posEq(box, goal)));
  };

  if (isComplete(boxes)) return [];

  const frozenAreas = calculateFrozenAreas(map, goals);
  const queue: SolverState[] = [initialState];
  const visited = new Set<string>();
  visited.add(stateKey(player, boxes));

  const dirs = [
    { dir: "UP", dx: 0, dy: -1 },
    { dir: "DOWN", dx: 0, dy: 1 },
    { dir: "LEFT", dx: -1, dy: 0 },
    { dir: "RIGHT", dx: 1, dy: 0 },
  ];

  let steps = 0;

  while (queue.length > 0 && steps < maxSteps) {
    steps++;
    const current = queue.shift()!;

    for (const { dir, dx, dy } of dirs) {
      const newX = current.player.x + dx;
      const newY = current.player.y + dy;

      if (isWall(map, newX, newY)) continue;

      const boxIndex = getBoxAt(current.boxes, newX, newY);

      if (boxIndex !== -1) {
        const newBoxX = newX + dx;
        const newBoxY = newY + dy;

        if (isWall(map, newBoxX, newBoxY)) continue;
        if (getBoxAt(current.boxes, newBoxX, newBoxY) !== -1) continue;

        const newBoxes = [...current.boxes];
        newBoxes[boxIndex] = { x: newBoxX, y: newBoxY };

        if (isSimpleDeadlock(map, goals, newBoxes[boxIndex])) continue;
        if (frozenAreas.has(posHash(newBoxes[boxIndex]))) continue;

        const key = stateKey({ x: newX, y: newY }, newBoxes);
        if (visited.has(key)) continue;
        visited.add(key);

        if (isComplete(newBoxes)) {
          return getSolutionSteps({
            player: { x: newX, y: newY },
            boxes: newBoxes,
            moves: current.moves + 1,
            pushes: current.pushes + 1,
            parent: current,
            lastMove: dir,
          });
        }

        queue.push({
          player: { x: newX, y: newY },
          boxes: newBoxes,
          moves: current.moves + 1,
          pushes: current.pushes + 1,
          parent: current,
          lastMove: dir,
        });
      } else {
        const key = stateKey({ x: newX, y: newY }, current.boxes);
        if (visited.has(key)) continue;
        visited.add(key);

        queue.push({
          player: { x: newX, y: newY },
          boxes: current.boxes,
          moves: current.moves + 1,
          pushes: current.pushes,
          parent: current,
          lastMove: dir,
        });
      }
    }
  }

  return null;
}

// 简化版求解器，只判断是否有解
export function canSolveLevel(
  levelMap: string[],
  maxSteps: number = 100000
): boolean {
  const solution = solveLevel(levelMap, maxSteps);
  return solution !== null;
}

// ==========================================
// 随机关卡生成器
// ==========================================

export type Difficulty = "easy" | "medium" | "hard";

interface GenerationConfig {
  width: number;
  height: number;
  boxCount: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, GenerationConfig> = {
  easy: { width: 6, height: 6, boxCount: 2 },
  medium: { width: 8, height: 8, boxCount: 3 },
  hard: { width: 10, height: 10, boxCount: 5 },
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 检查箱子是否都不在目标位置上
export function hasBoxOnGoal(boxes: Position[], goals: Position[]): boolean {
  return boxes.some((box) => goals.some((goal) => posEq(box, goal)));
}

// 解析关卡地图，返回箱子、目标和玩家位置
export function parseLevelForValidation(levelMap: string[]): {
  boxes: Position[];
  goals: Position[];
  player: Position;
} {
  const boxes: Position[] = [];
  const goals: Position[] = [];
  let player: Position = { x: 0, y: 0 };

  const maxWidth = Math.max(...levelMap.map((row) => row.length));

  levelMap.forEach((row, y) => {
    const paddedRow = row.padEnd(maxWidth, " ");
    for (let x = 0; x < paddedRow.length; x++) {
      const cell = paddedRow[x];
      switch (cell) {
        case GOAL:
          goals.push({ x, y });
          break;
        case BOX:
          boxes.push({ x, y });
          break;
        case PLAYER:
          player = { x, y };
          break;
        case BOX_ON_GOAL:
          boxes.push({ x, y });
          goals.push({ x, y });
          break;
        case PLAYER_ON_GOAL:
          player = { x, y };
          goals.push({ x, y });
          break;
      }
    }
  });

  return { boxes, goals, player };
}

// 使用反向生成法：从完成状态开始，反向移动玩家和箱子
function generateLevelByReverse(config: GenerationConfig): string[] | null {
  const { width, height, boxCount } = config;

  // 1. 创建带边框的空地图
  const map: string[][] = [];
  for (let y = 0; y < height; y++) {
    map[y] = [];
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        map[y][x] = WALL;
      } else {
        map[y][x] = FLOOR;
      }
    }
  }

  // 2. 随机添加一些内部墙壁，形成迷宫感
  const wallDensity = 0.15;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (Math.random() < wallDensity) {
        map[y][x] = WALL;
      }
    }
  }

  // 3. 选择内部空地位置
  const floorPositions: Position[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (map[y][x] === FLOOR) {
        floorPositions.push({ x, y });
      }
    }
  }

  if (floorPositions.length < boxCount * 3 + 2) {
    return null; // 空间不够
  }

  const shuffled = shuffle(floorPositions);

  // 4. 放置目标点和初始箱子（在目标点上）
  const goals: Position[] = [];
  const boxes: Position[] = [];

  for (let i = 0; i < boxCount && i < shuffled.length; i++) {
    const pos = shuffled[i];
    goals.push(pos);
    boxes.push({ ...pos });
    map[pos.y][pos.x] = FLOOR; // 目标点在逻辑层标记，地图层保持地板
  }

  // 5. 放置玩家
  let playerIdx = boxCount;
  while (
    playerIdx < shuffled.length &&
    goals.some((g) => posEq(g, shuffled[playerIdx]))
  ) {
    playerIdx++;
  }
  if (playerIdx >= shuffled.length) return null;
  const player = shuffled[playerIdx];

  // 6. 反向打乱：通过随机移动来打乱关卡
  // 增加打乱次数确保箱子离开目标位置
  const moves = 400 + boxCount * 100;
  let currentPlayer = { ...player };
  let currentBoxes = boxes.map((b) => ({ ...b }));

  const directions = [
    { dx: 0, dy: -1 }, // UP
    { dx: 0, dy: 1 }, // DOWN
    { dx: -1, dy: 0 }, // LEFT
    { dx: 1, dy: 0 }, // RIGHT
  ];

  for (let i = 0; i < moves; i++) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const oppositeDir = { dx: -dir.dx, dy: -dir.dy };

    // 玩家想要移动到的位置（反向游戏中，玩家移动方向与正向相反）
    const fromX = currentPlayer.x + dir.dx;
    const fromY = currentPlayer.y + dir.dy;

    // 检查是否在边界内且不是墙
    if (
      fromY < 1 ||
      fromY >= height - 1 ||
      fromX < 1 ||
      fromX >= width - 1 ||
      map[fromY][fromX] === WALL
    ) {
      continue;
    }

    // 检查那个位置有没有箱子
    const boxIdx = currentBoxes.findIndex((b) => b.x === fromX && b.y === fromY);

    if (boxIdx !== -1) {
      // 反向拉箱子：箱子从 (fromX, fromY) 拉到 (playerX, playerY)
      // 玩家从 (playerX, playerY) 移动到 (fromX, fromY)
      currentBoxes[boxIdx] = { x: currentPlayer.x, y: currentPlayer.y };
      currentPlayer = { x: fromX, y: fromY };
    } else {
      // 单纯移动玩家
      currentPlayer = { x: fromX, y: fromY };
    }
  }

  // 7. 验证箱子是否都不在目标位置上
  if (hasBoxOnGoal(currentBoxes, goals)) {
    return null; // 还有箱子在目标位置上，重新生成
  }

  // 8. 验证玩家是否可以到达所有箱子旁边
  if (!canReachAllBoxes(map, currentPlayer, currentBoxes, goals)) {
    return null;
  }

  // 9. 构建最终地图字符串
  const result: string[] = [];
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const cell = map[y][x];
      if (cell === WALL) {
        row += WALL;
      } else {
        const isGoal = goals.some((g) => g.x === x && g.y === y);
        const hasBox = currentBoxes.some((b) => b.x === x && b.y === y);
        const isPlayer = currentPlayer.x === x && currentPlayer.y === y;

        if (isPlayer) {
          row += isGoal ? PLAYER_ON_GOAL : PLAYER;
        } else if (hasBox) {
          row += isGoal ? BOX_ON_GOAL : BOX;
        } else if (isGoal) {
          row += GOAL;
        } else {
          row += FLOOR;
        }
      }
    }
    result.push(row);
  }

  return result;
}

// 生成一个有解的随机关卡
export function generateRandomLevel(
  difficulty: Difficulty,
  maxAttempts: number = 100
): { name: string; map: string[] } | null {
  const config = DIFFICULTY_CONFIG[difficulty];
  const difficultyNames: Record<Difficulty, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const level = generateLevelByReverse(config);
    if (!level) continue;

    // 验证关卡有解
    if (!canSolveLevel(level, 50000)) continue;

    // 最终验证：确保箱子不在目标位置上
    const { boxes, goals } = parseLevelForValidation(level);
    if (hasBoxOnGoal(boxes, goals)) continue;

    return {
      name: `随机 - ${difficultyNames[difficulty]} #${Date.now().toString(36).toUpperCase()}`,
      map: level,
    };
  }

  return null;
}
