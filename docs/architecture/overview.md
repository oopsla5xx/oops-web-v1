# Architecture

## What this project is

`oops-web-v1` is the Next.js 16 App Router frontend for the `oops` platform. It renders UI and
talks to the external `oops-api-v1` Go backend (`../oops-api-v1`) — it does not own a database and
does not implement business logic itself; that lives in the backend.

## Stack

- Language/Framework: TypeScript (strict), Next.js 16 (App Router, Turbopack)
- UI: Tailwind CSS 4 (CSS-first config, no `tailwind.config.js`), shadcn/ui (`base-nova` preset, on Base UI)
- Client state: Zustand (feature-scoped stores only — see Module structure)
- Validation: Zod (env vars, external API response shapes)
- Testing: Vitest + Testing Library (unit/component), Playwright (e2e, against the real backend)
- i18n: `next-intl` — locales `en` (default) + `vi`, URL-prefix routing (`/en`, `/vi`) via
  `src/app/[locale]/`. (The original dependency-decision writeup for this lived at
  `.ai/decisions/add-next-intl-dependency.md`, since deleted — no standalone decision record was
  kept; only findable via git history. New decisions go in the `design.md` of the OpenSpec change
  that introduces them — see workspace root `docs/agent-context/authority.md`.)
- Infra: Docker (multi-stage, `output: "standalone"`), no platform-specific deploy config yet
- Key dependencies: `zod`, `zustand`, `next-intl`, `shadcn`/`@base-ui/react`, `@swc/helpers`
  (explicit dependency — same note as above applies to why it's explicit)
- Database: none — this app has no direct data store. All persistent state lives behind `oops-api-v1`.

## Module structure

```
src/
├── app/
│   ├── [locale]/            # all pages (locale-aware) — page/layout/error/loading/not-found
│   └── api/health/route.ts  # BFF proxy — outside [locale], the only thing the browser calls directly
├── i18n/                     # next-intl config: routing.ts, navigation.ts, request.ts
├── features/                # one folder per business feature/use case
│   └── system-status/       # Client Components, Zustand store, custom hook — scoped to this feature
│       └── useRefreshHealth.ts  # reusable logic: fetch + parse + update store; components stay presentation-only
├── services/                 # calls the external Backend API, validates with schemas/
├── lib/                       # infra/utilities: env validation, fetch wrapper — no business logic
├── schemas/                    # Zod schemas — source of truth; src/types re-exports z.infer from these
├── types/                        # shared TS types (mostly re-exports from schemas/)
├── constants/                     # error-codes.ts, BACKEND_API_PATHS, INTERNAL_API_PATHS, timeouts, headers
├── components/ui/                  # shadcn/ui primitives — do not hand-roll what shadcn already provides
├── proxy.ts                         # next-intl locale middleware (Next 16 renamed middleware.ts → proxy.ts)
└── tests/e2e/                       # Playwright specs (*.spec.ts) — unit tests are colocated as *.test.ts

messages/en.json, messages/vi.json   # translations: common, systemStatus, errorPage, notFound, errors
```

## Main data flows

**Initial page load (Server Component → backend, direct):**
`app/[locale]/page.tsx` (Server Component, `dynamic = "force-dynamic"`) → `services/health.ts` →
`lib/http.ts` (fetch wrapper, timeout, no swallowed errors) → `oops-api-v1` at
`BACKEND_API_BASE_URL` → response validated against `schemas/health.schema.ts` → rendered via
`features/system-status/SystemStatusView.tsx`. If the fetch throws, `page.tsx` catches it and
passes `initialErrorCode` instead of letting it bubble to `error.tsx` — every health-related
failure (initial load or refresh) goes through the same error-code path (see Error contract below).

**Manual refresh (Client Component → BFF route → backend):**
`RefreshButton.tsx` (Client Component) → `httpGet("/api/health")` (`lib/http.ts`, same fetch
wrapper as the server path) → `app/api/health/route.ts` (Route Handler, runs server-side) → same
`services/health.ts` path as above → JSON response back to the browser → `store.ts` (Zustand)
updates `status`/`data`/`errorCode`.

The browser never calls `oops-api-v1` directly — `BACKEND_API_BASE_URL` is a server-only env var
and is never exposed to the client. This is deliberate: it avoids CORS entirely and keeps the
backend's address out of client bundles.

## Error contract (BE ↔ FE)

`oops-api-v1` responds to failures with `{success:false, error:{code, message}}` (its
`internal/shared/response`/`errors` packages) — codes are stable UPPER_SNAKE_CASE strings like
`RESOURCE_NOT_FOUND`, `VALIDATION_ERROR`. The frontend never displays the backend's `message`
(English, not localized) — only the `code`.

- `src/constants/error-codes.ts` mirrors the Go backend's codes by hand (`BACKEND_ERROR_CODES`,
  kept in sync manually — no codegen from `docs/swagger.yaml` yet) plus frontend-only codes for
  failures that never reach a backend response (`CLIENT_ERROR_CODES`: `NETWORK_ERROR`, `TIMEOUT`,
  `UNKNOWN_ERROR`).
- `src/schemas/api-response.schema.ts` (`getApiErrorCode`) detects either the backend's full
  envelope or the BFF route's minimal `{error:{code}}` shape and extracts the code.
- `src/lib/http.ts`'s `ApiError` is the one error type used everywhere — it always carries a
  `code` from the set above. `httpGet` classifies every failure (network down → `NETWORK_ERROR`,
  abort/timeout → `TIMEOUT`, non-2xx with a matching envelope → the real backend code, non-2xx
  without one → `UNKNOWN_ERROR`).
- UI components never render an error message directly — they translate the `code` via
  `useTranslations("errors")(code)`. Adding a new backend error code means: add it to
  `error-codes.ts`, add a translation key to both `messages/*.json`, done.
- `X-Request-ID`: the BFF route generates one per request (`crypto.randomUUID()`), forwards it to
  the backend, logs it alongside any error, and returns it in the response header — mirrors the
  backend's own `constants.HeaderRequestID` middleware for cross-system tracing.

## Module boundaries

- `components/ui/` (shadcn primitives) must not import from `services/`, `features/`, or contain
  fetch/business logic — it's presentation only.
- `features/<name>/` may import from `services/`, `schemas/`, `constants/`, `components/ui/`, but
  a feature's Zustand store should not be imported by another feature — if state needs to be
  shared across features, that's a signal to promote it to `stores/` (not yet needed).
- `lib/` must not import from `services/` or `features/` — it's the layer _those_ depend on, not
  the reverse.
- Only `app/api/*/route.ts` and Server Components read `BACKEND_API_BASE_URL` (via
  `services/health.ts` → `lib/env.ts`). Client Components never read backend config directly.

## External dependencies

- **`oops-api-v1`** (Go/Gin, sibling repo `../oops-api-v1`): the only external API this app calls.
  Base URL is configured via `BACKEND_API_BASE_URL` (see `.env.example`). Currently only
  `GET /api/v1/health` is implemented on the backend; as more endpoints ship, add their paths to
  `src/constants/api.ts` (`BACKEND_API_PATHS`) and follow the same service/schema pattern as
  `services/health.ts` / `schemas/health.schema.ts`.
