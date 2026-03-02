"use client";

import { useState, useRef, useCallback } from "react";

// Tangram pieces defined as SVG polygon points (normalized to 100x100 grid)
// 7 pieces: 2 large triangles, 1 medium triangle, 2 small triangles, 1 square, 1 parallelogram

interface Piece {
  id: number;
  points: { x: number; y: number }[];
  color: string;
  name: string;
}

interface PlacedPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  flipped: boolean;
}

// Tangram patterns to solve
const PATTERNS = [
  {
    name: "正方形",
    emoji: "⬛",
    hint: "将七块拼成一个完整的正方形",
  },
  {
    name: "三角形",
    emoji: "🔺",
    hint: "将七块拼成一个大三角形",
  },
  {
    name: "小猫",
    emoji: "🐱",
    hint: "拼出一只小猫的轮廓",
  },
  {
    name: "小船",
    emoji: "⛵",
    hint: "拼出一艘帆船",
  },
  {
    name: "小人",
    emoji: "🏃",
    hint: "拼出一个跑步的小人",
  },
];

const PIECE_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
];

const PIECE_NAMES = [
  "大三角1",
  "大三角2",
  "中三角",
  "小三角1",
  "小三角2",
  "正方形",
  "平行四边形",
];

// Initial piece shapes (as triangles/polygons on a 80x80 grid)
const INITIAL_PIECES: Piece[] = [
  {
    id: 0,
    points: [{ x: 0, y: 0 }, { x: 80, y: 0 }, { x: 40, y: 40 }],
    color: PIECE_COLORS[0],
    name: PIECE_NAMES[0],
  },
  {
    id: 1,
    points: [{ x: 0, y: 0 }, { x: 80, y: 0 }, { x: 0, y: 80 }],
    color: PIECE_COLORS[1],
    name: PIECE_NAMES[1],
  },
  {
    id: 2,
    points: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 20, y: 20 }],
    color: PIECE_COLORS[2],
    name: PIECE_NAMES[2],
  },
  {
    id: 3,
    points: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 0, y: 40 }],
    color: PIECE_COLORS[3],
    name: PIECE_NAMES[3],
  },
  {
    id: 4,
    points: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 40 }],
    color: PIECE_COLORS[4],
    name: PIECE_NAMES[4],
  },
  {
    id: 5,
    points: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 40 }, { x: 0, y: 40 }],
    color: PIECE_COLORS[5],
    name: PIECE_NAMES[5],
  },
  {
    id: 6,
    points: [{ x: 20, y: 0 }, { x: 60, y: 0 }, { x: 40, y: 40 }, { x: 0, y: 40 }],
    color: PIECE_COLORS[6],
    name: PIECE_NAMES[6],
  },
];

function pointsToSvgString(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export default function TangramGame() {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>(
    INITIAL_PIECES.map((p) => ({
      id: p.id,
      x: 20 + (p.id % 4) * 90,
      y: 20 + Math.floor(p.id / 4) * 100,
      rotation: 0,
      flipped: false,
    }))
  );
  const [dragging, setDragging] = useState<{
    id: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const boardRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.preventDefault();
      const piece = placedPieces.find((p) => p.id === id);
      if (!piece) return;
      setSelectedPiece(id);
      setDragging({
        id,
        startX: e.clientX,
        startY: e.clientY,
        origX: piece.x,
        origY: piece.y,
      });
    },
    [placedPieces]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !boardRef.current) return;
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      setPlacedPieces((prev) =>
        prev.map((p) =>
          p.id === dragging.id
            ? { ...p, x: dragging.origX + dx, y: dragging.origY + dy }
            : p
        )
      );
    },
    [dragging]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const rotatePiece = (id: number) => {
    setPlacedPieces((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + 45) % 360 } : p
      )
    );
  };

  const flipPiece = (id: number) => {
    setPlacedPieces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, flipped: !p.flipped } : p))
    );
  };

  const resetPieces = () => {
    setPlacedPieces(
      INITIAL_PIECES.map((p) => ({
        id: p.id,
        x: 20 + (p.id % 4) * 90,
        y: 20 + Math.floor(p.id / 4) * 100,
        rotation: 0,
        flipped: false,
      }))
    );
    setSelectedPiece(null);
  };

  const changePattern = (dir: 1 | -1) => {
    setCurrentPattern((p) => (p + dir + PATTERNS.length) % PATTERNS.length);
    setRevealed(false);
    setShowAnswer(false);
    resetPieces();
  };

  const pattern = PATTERNS[currentPattern];

  return (
    <div className="flex flex-col gap-6">
      {/* Pattern card */}
      <div className="bg-slate-700 rounded-xl p-5 border border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => changePattern(-1)}
            className="text-slate-400 hover:text-white px-3 py-1 rounded transition-colors"
          >
            ‹ 上一题
          </button>
          <span className="text-slate-400 text-sm">
            {currentPattern + 1} / {PATTERNS.length}
          </span>
          <button
            onClick={() => changePattern(1)}
            className="text-slate-400 hover:text-white px-3 py-1 rounded transition-colors"
          >
            下一题 ›
          </button>
        </div>
        <div className="text-center">
          {!revealed ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-8xl blur-sm select-none">{pattern.emoji}</div>
              <p className="text-slate-400 text-sm">图案已隐藏，点击查看</p>
              <button
                onClick={() => setRevealed(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                翻开图案
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="text-7xl">{pattern.emoji}</div>
              <h3 className="text-xl font-bold text-white">{pattern.name}</h3>
              <p className="text-slate-400 text-sm">{pattern.hint}</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-700/50 rounded-lg p-3 text-xs text-slate-400 flex flex-wrap gap-3">
        <span>🖱️ 拖拽移动棋子</span>
        <span>🔄 选中后点击&ldquo;旋转&rdquo;</span>
        <span>↔️ 选中后点击&ldquo;翻转&rdquo;</span>
        <span>✨ 拼出图案即完成</span>
      </div>

      {/* Game board */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <svg
          ref={boardRef}
          width="100%"
          viewBox="0 0 400 320"
          className="cursor-default select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="400" height="320" fill="url(#grid)" />

          {/* Pieces */}
          {INITIAL_PIECES.map((piece) => {
            const placed = placedPieces.find((p) => p.id === piece.id)!;
            const cx = piece.points.reduce((s, p) => s + p.x, 0) / piece.points.length;
            const cy = piece.points.reduce((s, p) => s + p.y, 0) / piece.points.length;
            const isSelected = selectedPiece === piece.id;
            const transform = `translate(${placed.x},${placed.y}) rotate(${placed.rotation},${cx},${cy}) ${placed.flipped ? `scale(-1,1) translate(-${cx * 2},0)` : ""}`;

            return (
              <g key={piece.id} transform={transform}>
                <polygon
                  points={pointsToSvgString(piece.points)}
                  fill={piece.color}
                  fillOpacity={0.85}
                  stroke={isSelected ? "white" : "#1e293b"}
                  strokeWidth={isSelected ? 2.5 : 1}
                  className="cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => handleMouseDown(e, piece.id)}
                  onClick={() => setSelectedPiece(piece.id === selectedPiece ? null : piece.id)}
                  style={{ filter: isSelected ? "drop-shadow(0 0 8px rgba(255,255,255,0.6))" : undefined }}
                />
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fillOpacity={0.7}
                  pointerEvents="none"
                >
                  {piece.id + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          disabled={selectedPiece === null}
          onClick={() => selectedPiece !== null && rotatePiece(selectedPiece)}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          🔄 旋转 45°
        </button>
        <button
          disabled={selectedPiece === null}
          onClick={() => selectedPiece !== null && flipPiece(selectedPiece)}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          ↔️ 翻转
        </button>
        <button
          onClick={resetPieces}
          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          ♻️ 重置
        </button>
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {showAnswer ? "🙈 隐藏答案" : "💡 查看提示"}
        </button>
      </div>

      {showAnswer && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 text-center">
          <p className="text-amber-300 text-sm">
            💡 提示：将7块拼图全部拼合，不留空隙，不重叠，拼出&ldquo;
            {pattern.name}&rdquo;的形状。每块都必须用到！
          </p>
        </div>
      )}

      {/* Piece legend */}
      <div className="grid grid-cols-4 gap-2">
        {INITIAL_PIECES.map((piece) => (
          <div
            key={piece.id}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
              selectedPiece === piece.id
                ? "border-white bg-slate-700"
                : "border-slate-700 bg-slate-800 hover:border-slate-500"
            }`}
            onClick={() =>
              setSelectedPiece(piece.id === selectedPiece ? null : piece.id)
            }
          >
            <div
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: piece.color }}
            />
            <span className="text-slate-300 text-xs truncate">{piece.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
