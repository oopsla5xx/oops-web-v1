# Security notes — oops-web-v1

For the generic pre-ship checklist, see `../../../docs/security-checklist.md` (workspace root). This file adds only what's specific to this stack — it does not repeat the root checklist.

## Next.js / this repo specifics

- **No direct backend access from the browser**: `BACKEND_API_BASE_URL` is a server-only env var, read only in Server Components and `app/api/*/route.ts` (see `docs/architecture/overview.md`) — never exposed to client bundles. This is also what keeps CORS out of the picture entirely.
- **Error exposure**: Route Handlers never forward a raw thrown error to the client — they log full detail server-side and return only a stable `code` (see `docs/architecture/conventions.md` → "Route Handlers translate service errors"). The `data-access`/`error-exposure` root checklist items map directly onto this pattern.
- **External response validation**: every response from `oops-api-v1` is parsed through a Zod schema in `schemas/` before use — nothing from the network is trusted blindly (see `docs/architecture/overview.md` → Main data flows).
- **Env vars**: validated once via Zod in `lib/env.ts`, never read via `process.env` elsewhere and never given a silent fallback for a required value (see `docs/architecture/conventions.md`).
