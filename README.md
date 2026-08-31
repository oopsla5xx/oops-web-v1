# oops-web-v1

Frontend for **Oops** — an AI-native Software Development Workspace. Next.js App Router UI that
talks to the `oops-api-v1` Go backend; it owns no database and no business logic.

---

## Tech Stack

|                    |                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------- |
| Language/Framework | TypeScript (strict), Next.js 16 (App Router, Turbopack)                               |
| UI                 | Tailwind CSS 4 (CSS-first config), shadcn/ui (`base-nova` preset, on Base UI)         |
| Client state       | Zustand (feature-scoped stores)                                                       |
| Validation         | Zod (env vars, external API response shapes)                                          |
| i18n               | next-intl — locales `en` (default) + `vi`, URL-prefix routing (`/en`, `/vi`)          |
| Testing            | Vitest + Testing Library (unit/component), Playwright (e2e, against the real backend) |
| Package manager    | pnpm                                                                                  |

---

## Development Setup

**Prerequisites:** Node.js 20.9+, pnpm, a running `oops-api-v1` backend (see `../oops-api-v1`)

```bash
# 1. Install dependencies (also installs the Husky pre-push hook: lint + typecheck + test + build)
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local — BACKEND_API_BASE_URL is required, app fails fast at startup if missing/invalid

# 3. Run with hot reload
pnpm dev
```

Server runs at `http://localhost:3000`.

---

## Commands

```bash
# Development
pnpm dev              # dev server with hot reload (Turbopack)
pnpm build            # production build
pnpm start            # run a production build

# Quality
pnpm test             # unit/component tests (Vitest)
pnpm test:watch       # unit/component tests, watch mode
pnpm test:e2e         # e2e tests (Playwright, against a real backend)
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with autofix
pnpm typecheck        # tsc --noEmit
pnpm format           # Prettier, write
pnpm format:check     # Prettier, check only
```

Run a single unit test file:

```bash
pnpm vitest run src/features/system-status/store.test.ts
```

e2e tests require both the frontend (`pnpm dev` or `pnpm build && pnpm start`) and
`oops-api-v1` running locally — they intentionally never run against mocks.

---

## Environment

All variables in `.env.example` are required — the app fails fast at startup if any is missing or
malformed. Copy `.env.example` to `.env.local` and fill in the values. Never commit `.env.*` files
(except `.env.example`).

`BACKEND_API_BASE_URL` is server-only and never exposed to the client — the browser never calls
`oops-api-v1` directly, only through this app's own `/api/*` BFF routes. This avoids CORS entirely
and keeps the backend's address out of client bundles.

---

## Architecture & Conventions

- Architecture, module layout, data flow, error contract → `.ai/context/architecture.md`
- Coding conventions, error handling, env vars → `.ai/context/conventions.md`
- Testing patterns, mocks, coverage → `.ai/context/testing-conventions.md`
- Security checklist → `.ai/context/security-checklist.md`

---

## CI

One job runs on every push to `main` and every pull request:

| Job       | What it does                                             |
| --------- | -------------------------------------------------------- |
| `quality` | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` |

`BACKEND_API_BASE_URL` is not set in CI — the only routes that need it are `force-dynamic`, so
they never execute during `next build`. e2e tests require a live backend and intentionally don't
run in CI.

---

## Docker

Multi-stage production build (`output: "standalone"`):

```bash
docker build -t oops-web-v1 .
docker run -p 3000:3000 --env-file .env.production oops-web-v1
```
