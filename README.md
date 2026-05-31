# Classic Games Generator

A polished web app featuring a growing collection of classic, puzzle, and number-sense games built with Next.js 15, TypeScript, and Tailwind CSS.

**Live Demo:** [Deploy to Vercel](#deploy-to-vercel)
**Repository:** [github.com/vividlife/classic-games-generator](https://github.com/vividlife/classic-games-generator)

---

## Features

### Games
- **Snake** — Guide the snake to eat food and grow. Walls wrap around. Speed increases with level.
- **Tetris** — Stack falling tetrominoes to clear rows. Includes ghost piece, wall kicks, and hard drop.
- **Gomoku** — Play five-in-a-row against another player or the built-in AI.
- **Game 24** — Combine four cards with arithmetic operations to make 24.
- **Guess Number** — Classic "A/B" number deduction game.
- **Werewolf Dealer** — Lightweight Werewolf role assignment and night-flow helper.
- **Sudoku** — 9×9 Sudoku with multiple difficulties and hints.
- **Sokoban** — Push boxes onto target tiles with undo support.
- **Reversi** — Two-player Othello/Reversi board game.
- **Go** — 9×9, 13×13, and 19×19 Go with PvP and AI modes.
- **Tangram** — Arrange seven pieces to match puzzle shapes.
- **Tower of Hanoi** — Move all disks under a time limit.
- **Circle Groups** — Solve quantity relationship puzzles with movable circles.
- **Counter Reading** — Practice dialing and reading multi-digit numbers.
- **2048** — Merge numbered tiles to reach 2048.

### Game Settings
- **Difficulty** — Easy / Medium / Hard, each with different speeds and score multipliers (×1 / ×1.5 / ×2)
- **Themes** — 4 visual themes: Classic (green), Neon (pink), Forest (emerald), Ocean (sky blue)
- **Player Name** — Set your name to personalize leaderboard entries

### Score System
- Score multipliers based on difficulty
- Level progression (Snake: every 5 food; Tetris: every 10 lines)
- Snake and Tetris leaderboards stored in localStorage (top 10 entries)
- Scores visible in-game after game over where supported

### Controls

**Snake:**
| Action | Keys |
|--------|------|
| Move | Arrow Keys or WASD |
| Pause | Space / Esc |

**Tetris:**
| Action | Keys |
|--------|------|
| Move left/right | ← → |
| Soft drop | ↓ |
| Hard drop | Space |
| Rotate | ↑ or X |
| Pause | Esc |

Other games include on-screen controls and page-specific instructions.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.18 | React framework, App Router |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.3 | Styling |
| Zustand | 5 | Persistent settings state |
| React | 18 | UI components |

---

## Project Structure

```
classic-games-generator/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (game selection)
│   ├── globals.css         # Global styles
│   └── <game>/page.tsx     # Individual game pages
├── components/
│   ├── <game>/             # Game-specific React components
│   └── ui/
│       ├── Button.tsx      # Reusable button component
│       ├── Badge.tsx       # Status badge
│       ├── Header.tsx      # Navigation header
│       ├── GameSettings.tsx # Difficulty/theme/name settings
│       └── ScoreBoard.tsx  # Leaderboard display
├── lib/
│   ├── use*.ts             # Game logic hooks
│   ├── tetrominos.ts       # Tetromino shapes & rotations
│   ├── gameStore.ts        # Zustand store for settings
│   └── scoreManager.ts     # localStorage score management
├── types/
│   └── index.ts            # Shared TypeScript types, themes, difficulty configs
├── vercel.json             # Vercel deployment config
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/vividlife/classic-games-generator.git
cd classic-games-generator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Deploy to Vercel

### Option 1: One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vividlife/classic-games-generator)

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 3: GitHub Integration

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import `classic-games-generator` repository
4. Deploy (no environment variables needed)

---

## Architecture Decisions

- **No canvas** — Games rendered with CSS grid/flex for easy theming and DOM event handling
- **useReducer** — Game state managed with pure reducers for predictability and testability
- **Zustand** — Lightweight persistent state for settings (persisted via `localStorage`)
- **App Router** — Next.js 15 App Router with static page generation
- **Tailwind** — Utility-first CSS with dark theme by default

---

## License

MIT
