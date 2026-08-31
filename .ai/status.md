# Status

## In Progress

(none)

## Recently completed

- **unify-error-contract-i18n** (spec: `.ai/tasks/unify-error-contract-i18n.md`) — 2026-08-30.
  Unified error codes/response envelope/`X-Request-ID` header between `oops-api-v1` (Go, small
  fix: added missing `UNPROCESSABLE_ENTITY` constant + `AppError` sentinels for
  `VALIDATION_ERROR`/`GATEWAY_TIMEOUT`/`TOO_MANY_REQUESTS`) and `oops-web-v1` (`ApiError` +
  `error-codes.ts` + envelope-parsing schema). Full-app i18n via `next-intl` (en default + vi,
  URL-prefix routing, `src/app/[locale]/`). Every error surfaced to the user — backend or
  client-side (network/timeout/unknown) — now goes through the same code→translated-message path.
  Self-check: done, both repos green (frontend: 37 unit + 4 e2e + build; backend: go test/lint/build).
  Not yet shipped (Phase 4) — pending user confirmation on branch name/PR.

- **nextjs-production-setup** (spec: `.ai/tasks/nextjs-production-setup.md`) — 2026-08-29.
  Full production scaffold: TS strict, ESLint/Prettier/Husky/lint-staged, Zod-validated
  fail-fast env, centralized constants, API layer (fetch wrapper + BFF route handler) against
  the real `oops-api-v1` backend, Zustand-backed sample feature (System Status), shadcn/ui,
  Vitest + Testing Library + Playwright (all real, no mocked e2e), GitHub Actions CI, production
  Dockerfile (verified end-to-end in a real container against the real backend).
  Self-check: done (see PR description / review-pr output). Not yet shipped (Phase 4) — pending
  user confirmation on branch name and whether to push/open a PR.
