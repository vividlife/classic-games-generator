/**
 * Go AI — heuristic-based move selection.
 *
 * Strategy priority:
 * 1. Capture opponent stones (biggest capture first)
 * 2. Save own groups in atari (1 liberty)
 * 3. Avoid self-atari (placing a stone that leaves own group with 1 liberty)
 * 4. Prefer moves near existing stones, toward center, with more liberties
 * 5. Pass when no good moves exist
 */

import type { GoCell, GoPlayer, BoardSize } from "./useGo";

const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function findGroup(board: GoCell[][], r: number, c: number, size: number): Set<string> {
  const color = board[r][c];
  if (!color) return new Set();
  const group = new Set<string>();
  const queue: [number, number][] = [[r, c]];
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    const key = `${cr},${cc}`;
    if (group.has(key)) continue;
    if (cr < 0 || cr >= size || cc < 0 || cc >= size) continue;
    if (board[cr][cc] !== color) continue;
    group.add(key);
    for (const [dr, dc] of DIRS) queue.push([cr + dr, cc + dc]);
  }
  return group;
}

function countLiberties(board: GoCell[][], group: Set<string>, size: number): number {
  const libs = new Set<string>();
  for (const key of group) {
    const [r, c] = key.split(",").map(Number);
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === null) {
        libs.add(`${nr},${nc}`);
      }
    }
  }
  return libs.size;
}

/** Simulate placing a stone; returns null if illegal. */
function simulateMove(
  board: GoCell[][],
  r: number,
  c: number,
  player: GoPlayer,
  koPoint: { row: number; col: number } | null,
  size: number,
): { newBoard: GoCell[][]; captured: number } | null {
  if (board[r][c] !== null) return null;
  if (koPoint && koPoint.row === r && koPoint.col === c) return null;

  const opponent: GoPlayer = player === "black" ? "white" : "black";
  const nb = board.map((row) => [...row]) as GoCell[][];
  nb[r][c] = player;

  let captured = 0;
  const checked = new Set<string>();
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
    if (nb[nr][nc] !== opponent) continue;
    if (checked.has(`${nr},${nc}`)) continue;
    const group = findGroup(nb, nr, nc, size);
    group.forEach((k) => checked.add(k));
    if (countLiberties(nb, group, size) === 0) {
      captured += group.size;
      for (const k of group) {
        const [kr, kc] = k.split(",").map(Number);
        nb[kr][kc] = null;
      }
    }
  }

  // Suicide check
  const placedGroup = findGroup(nb, r, c, size);
  if (countLiberties(nb, placedGroup, size) === 0) return null;

  return { newBoard: nb, captured };
}

/** Count liberties the placed stone's group would have after the move. */
function libertiesAfterMove(
  board: GoCell[][],
  r: number,
  c: number,
  player: GoPlayer,
  koPoint: { row: number; col: number } | null,
  size: number,
): number {
  const result = simulateMove(board, r, c, player, koPoint, size);
  if (!result) return -1;
  const group = findGroup(result.newBoard, r, c, size);
  return countLiberties(result.newBoard, group, size);
}

/** Check if player has any group with exactly 1 liberty and return the saving move. */
function findAtariSaves(
  board: GoCell[][],
  player: GoPlayer,
  koPoint: { row: number; col: number } | null,
  size: number,
): { row: number; col: number }[] {
  const checked = new Set<string>();
  const saves: { row: number; col: number; groupSize: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== player) continue;
      const key = `${r},${c}`;
      if (checked.has(key)) continue;
      const group = findGroup(board, r, c, size);
      group.forEach((k) => checked.add(k));
      if (countLiberties(board, group, size) === 1) {
        // Find the single liberty
        for (const gk of group) {
          const [gr, gc] = gk.split(",").map(Number);
          for (const [dr, dc] of DIRS) {
            const nr = gr + dr, nc = gc + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === null) {
              // Check this liberty actually saves (gives > 1 liberty after move)
              const libsAfter = libertiesAfterMove(board, nr, nc, player, koPoint, size);
              if (libsAfter > 1) {
                saves.push({ row: nr, col: nc, groupSize: group.size });
              }
            }
          }
        }
      }
    }
  }

  // Prioritize saving larger groups
  saves.sort((a, b) => b.groupSize - a.groupSize);
  return saves.map(({ row, col }) => ({ row, col }));
}

/** Distance to center of board. */
function centerDist(r: number, c: number, size: number): number {
  const mid = (size - 1) / 2;
  return Math.abs(r - mid) + Math.abs(c - mid);
}

/** Count friendly neighbors (adjacent same-color stones). */
function friendlyNeighbors(board: GoCell[][], r: number, c: number, player: GoPlayer, size: number): number {
  let count = 0;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === player) count++;
  }
  return count;
}

/** Check if any adjacent cell has the same-color stone (within distance 2). */
function hasNearbyFriendly(board: GoCell[][], r: number, c: number, player: GoPlayer, size: number): boolean {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      if (Math.abs(dr) + Math.abs(dc) > 2 || (dr === 0 && dc === 0)) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === player) return true;
    }
  }
  return false;
}

/** Count total stones on board for the given player. */
function stoneCount(board: GoCell[][], player: GoPlayer, size: number): number {
  let count = 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (board[r][c] === player) count++;
  return count;
}

export interface GoAIMove {
  type: "place" | "pass";
  row?: number;
  col?: number;
}

/**
 * Compute AI move. Returns { type: "place", row, col } or { type: "pass" }.
 */
export function computeAIMove(
  board: GoCell[][],
  player: GoPlayer,
  koPoint: { row: number; col: number } | null,
  boardSize: BoardSize,
): GoAIMove {
  const size = boardSize as number;
  const opponent: GoPlayer = player === "black" ? "white" : "black";
  const myStones = stoneCount(board, player, size);
  const isOpening = myStones < Math.floor(size * 0.8);

  // Collect all legal moves with scores
  const candidates: { row: number; col: number; score: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const result = simulateMove(board, r, c, player, koPoint, size);
      if (!result) continue;

      let score = 0;

      // 1. Captures are very valuable
      if (result.captured > 0) {
        score += 100 + result.captured * 50;
      }

      // 2. Liberties after move — prefer more liberties
      const group = findGroup(result.newBoard, r, c, size);
      const libs = countLiberties(result.newBoard, group, size);

      // Penalize self-atari heavily (leaving own group with 1 liberty)
      if (libs === 1 && result.captured === 0) {
        score -= 200;
      } else {
        score += libs * 3;
      }

      // 3. Proximity to existing friendly stones (connection/extension)
      const friendly = friendlyNeighbors(board, r, c, player, size);
      const nearFriendly = hasNearbyFriendly(board, r, c, player, size);

      if (isOpening) {
        // In opening, prefer star points / spread out
        if (nearFriendly) score += 5;
        // Avoid edges in opening
        if (r === 0 || r === size - 1 || c === 0 || c === size - 1) score -= 15;
        if (r <= 1 || r >= size - 2 || c <= 1 || c >= size - 2) score -= 5;
        // Prefer 3rd/4th lines
        const lineR = Math.min(r, size - 1 - r);
        const lineC = Math.min(c, size - 1 - c);
        if (lineR >= 2 && lineR <= 4 && lineC >= 2 && lineC <= 4) score += 8;
      } else {
        // Mid/late game: connect and fight
        if (friendly > 0) score += friendly * 8;
        if (nearFriendly) score += 10;
        // Slight penalty for isolated moves far from everything
        if (!nearFriendly && !hasNearbyFriendly(board, r, c, opponent, size)) score -= 10;
      }

      // 4. Proximity to center (slight preference)
      const dist = centerDist(r, c, size);
      score += Math.max(0, (size - dist)) * 0.5;

      // 5. Check if this move threatens opponent groups (puts them in atari)
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (result.newBoard[nr][nc] !== opponent) continue;
        const oppGroup = findGroup(result.newBoard, nr, nc, size);
        const oppLibs = countLiberties(result.newBoard, oppGroup, size);
        if (oppLibs === 1) score += 30 + oppGroup.size * 10; // Threatening atari
        else if (oppLibs === 2) score += 5;
      }

      // Small randomness to avoid predictability
      score += Math.random() * 4;

      candidates.push({ row: r, col: c, score });
    }
  }

  // Check if we need to save our own groups from atari
  const saves = findAtariSaves(board, player, koPoint, size);
  if (saves.length > 0) {
    // Boost save moves
    for (const save of saves) {
      const idx = candidates.findIndex((m) => m.row === save.row && m.col === save.col);
      if (idx >= 0) candidates[idx].score += 80;
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // If best move has a very negative score or no candidates, pass
  if (candidates.length === 0 || candidates[0].score < -50) {
    return { type: "pass" };
  }

  const best = candidates[0];
  return { type: "place", row: best.row, col: best.col };
}
