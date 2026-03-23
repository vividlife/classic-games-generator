export type Grid = number[][];

export function createEmptyGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

export function addRandomTile(grid: Grid): Grid {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = grid.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

export function initGame(): { grid: Grid; score: number } {
  let grid = createEmptyGrid();
  grid = addRandomTile(grid);
  grid = addRandomTile(grid);
  return { grid, score: 0 };
}

// Slide and merge a single row to the left, return [newRow, points]
function slideRow(row: number[]): [number[], number] {
  const filtered = row.filter((v) => v !== 0);
  let points = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      points += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }
  while (filtered.length < 4) filtered.push(0);
  return [filtered, points];
}

export type Direction = "left" | "right" | "up" | "down";

export function move(
  grid: Grid,
  direction: Direction
): { grid: Grid; score: number; moved: boolean } {
  let totalPoints = 0;
  let moved = false;

  // Work on a copy
  let g = grid.map((row) => [...row]);

  // Rotate so we always process as "slide left"
  if (direction === "right") g = g.map((row) => row.slice().reverse());
  if (direction === "up") g = transpose(g);
  if (direction === "down") g = transpose(g).map((row) => row.slice().reverse());

  const next = g.map((row) => {
    const [newRow, pts] = slideRow(row);
    totalPoints += pts;
    if (newRow.some((v, i) => v !== row[i])) moved = true;
    return newRow;
  });

  // Rotate back
  let result = next;
  if (direction === "right") result = next.map((row) => row.slice().reverse());
  if (direction === "up") result = transpose(next);
  if (direction === "down") result = transpose(next.map((row) => row.slice().reverse()));

  return { grid: result, score: totalPoints, moved };
}

function transpose(g: Grid): Grid {
  return g[0].map((_, c) => g.map((row) => row[c]));
}

export function isGameOver(grid: Grid): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

export function hasWon(grid: Grid): boolean {
  return grid.some((row) => row.includes(2048));
}
