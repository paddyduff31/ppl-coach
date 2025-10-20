# Repository Guidelines

## Project Structure & Module Organization
- `apps/backend/`: .NET 8 API with Clean Architecture projects under `src/PplCoach.*` and tests in `apps/backend/tests`.
- `apps/web/`: Vite + React 19 client; routes in `src/app`, shared pieces in `src/components`, styles in `src/styles`.
- `apps/mobile/`: Expo app; run pnpm scripts from this directory.
- `shared/`: generated API client, UI kit, and config packages reused by every app; Playwright suites live in `tests/e2e/`.

## Build, Test, and Development Commands
- `npm run setup`: install dependencies and start Postgres; rerun after infra updates.
- `npm run dev:with-api`: boot backend, regenerate the API client, and serve the web UI; use `npm run dev:backend` or `npm run dev:frontend` for single-surface work.
- `pnpm start`, `pnpm ios`, or `pnpm android` in `apps/mobile/` launch the Expo runtime.
- `npm run build`, `npm run build:web`, `npm run build:backend`, and `npm run api:build` cover Turbo builds and contract generation.

## Coding Style & Naming Conventions
- `.editorconfig` enforces LF endings, 2-space JS/TS indents, and 4-space C# indents.
- Run `npm run format:check` and `npm run lint`; Prettier keeps 80-column, single-quote formatting and ESLint blocks unused variables plus 70-line functions.
- Backend code follows .NET casing (`PascalCase` types, `camelCase` locals, `I*` interfaces); keep layer files in their project folders.

## Testing Guidelines
- `npm run test` fans out through Turbo; iterate with `npm run test:web`, `npm run test:backend`, or `pnpm test` inside `apps/mobile/`.
- `npm run test:e2e` runs Playwright suites in `tests/e2e`, auto-starting the API (`5179`) and web (`5173`) servers.
- Use Vitest (`*.test.tsx`) for web, xUnit projects for backend, and Jest beside mobile modules; every change should add an automated check and refresh fixtures after OpenAPI updates.

## Commit & Pull Request Guidelines
- Write imperative, scoped commits (`backend: enforce movement caps`, `web: style session timeline`) and include generated artefacts.
- Before opening a PR, run lint, unit tests, and necessary database steps (`npm run db:migrate`) to keep CI green.
- Summarise behaviour changes, link tickets, and attach UI screenshots or API samples when they affect the user.

## Security & Environment Notes
- Copy `.env.example` to `.env`; never commit environment files or production credentials.
- Manage Postgres with `npm run dev:db`, `npm run db:migration:add <Name>`, and `npm run db:migrate`.
- Regenerate the OpenAPI client via `npm run api:generate` whenever the Swagger contract shifts.
