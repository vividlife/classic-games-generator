# Repository Guidelines

## Project Structure & Module Organization
This project is a Next.js 15 + TypeScript monorepo-style app (single package).
- `app/`: App Router pages and global layout/styles (`app/<game>/page.tsx`).
- `components/`: UI and game-specific React components (`components/<game>/`, `components/ui/`).
- `lib/`: Core game logic hooks and shared logic (`useSnake.ts`, `useTetris.ts`, `scoreManager.ts`).
- `types/`: Shared TypeScript types and constants.
- `public/`: Static assets.
- Config: `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.json`, `next.config.mjs`.

## Build, Test, and Development Commands
Use npm scripts from `package.json`:
- `npm run dev`: Start local dev server at `http://localhost:3000`.
- `npm run build`: Create production build.
- `npm run start`: Run production server from built output.
- `npm run lint`: Run Next.js ESLint checks (`next/core-web-vitals`).

Example workflow:
```bash
npm install
npm run lint
npm run dev
```

## Coding Style & Naming Conventions
- Language: TypeScript with `strict: true`.
- Indentation: 2 spaces; prefer concise, typed functional components and hooks.
- Components/files: `PascalCase` for React components (e.g., `SnakeGame.tsx`).
- Hooks/utilities: `camelCase` with `use*` for hooks (e.g., `useGomoku.ts`).
- Routes: kebab-case folder names in `app/` (e.g., `guess-number`, `game24`).
- Imports: use `@/*` path alias where practical.

## Testing Guidelines
There is no automated test suite configured yet (`*.test.*` / `*.spec.*` not present).
- Minimum for each change: run `npm run lint` and manually verify affected game page(s).
- For gameplay updates, validate: start/reset flow, scoring, pause/resume, keyboard/touch controls, and game-over behavior.
- If adding tests, prefer colocated `*.test.ts(x)` files and document test command updates in `package.json`.

## Commit & Pull Request Guidelines
Recent history follows mostly Conventional Commit style, often bilingual:
- Examples: `feat: ...`, `fix: ...`, `feat(scope): ...`.
- Prefer format: `<type>(<scope>): <summary>` where applicable.

PRs should include:
- Clear summary of behavior changes.
- Linked issue/task (if available).
- Screenshots or short recordings for UI/gameplay changes.
- Verification notes (lint + manual test coverage by game/page).
