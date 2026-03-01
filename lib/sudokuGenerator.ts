export type Grid = number[][]; // 0 = empty cell

export type Difficulty = "简单" | "普通" | "困难" | "专家";

export const DIFFICULTY_CONFIG: Record<Difficulty, { emptyCells: [number, number] }> = {
  简单: { emptyCells: [30, 35] },
  普通: { emptyCells: [40, 45] },
  困难: { emptyCells: [50, 55] },
  专家: { emptyCells: [55, 60] },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function fillGrid(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSolvedGrid(): Grid {
  const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillGrid(grid);
  return grid;
}

// Returns number of solutions found (stops counting at `limit`)
function countSolutions(grid: Grid, limit = 2): number {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        let count = 0;
        for (let num = 1; num <= 9 && count < limit; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            count += countSolutions(grid, limit - count);
            grid[row][col] = 0;
          }
        }
        return count;
      }
    }
  }
  return 1; // no empty cells = one solution found
}

export interface PuzzleResult {
  puzzle: Grid;
  solution: Grid;
}

export function generatePuzzle(difficulty: Difficulty): PuzzleResult {
  const solution = generateSolvedGrid();
  const puzzle = solution.map((row) => [...row]);

  const [minEmpty, maxEmpty] = DIFFICULTY_CONFIG[difficulty].emptyCells;
  const targetEmpty =
    minEmpty + Math.floor(Math.random() * (maxEmpty - minEmpty + 1));

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );

  let emptied = 0;
  for (const [row, col] of positions) {
    if (emptied >= targetEmpty) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const gridCopy = puzzle.map((r) => [...r]);
    if (countSolutions(gridCopy) === 1) {
      emptied++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}
