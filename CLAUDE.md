@AGENTS.md

## Where to read

| Need to know                                                                  | Read this                            |
| ----------------------------------------------------------------------------- | ------------------------------------ |
| Commands (build, test, lint…)                                                 | `README.md`                          |
| Architecture, module layout, data flow                                        | `docs/architecture/overview.md`      |
| Coding conventions, error handling, env vars                                  | `docs/architecture/conventions.md`   |
| Testing conventions, mocking boundaries                                       | `docs/architecture/testing.md`       |
| Design tokens, style rules, accessibility, tone                               | `docs/architecture/design-system.md` |
| Security notes for this stack                                                 | `docs/architecture/security.md`      |
| Business/domain terms, cross-repo architecture, which source wins on conflict | `../CLAUDE.md` (workspace root)      |

**When unsure about anything — read the relevant file above first. Do not guess.**

---

## Agent rules

### Before writing code

- Read `docs/architecture/overview.md` before touching module structure, data flow, or the BE↔FE error contract
- Read `docs/architecture/conventions.md` before writing handlers, error handling, or env var access
- Read `docs/architecture/testing.md` before writing any test
- Read `docs/architecture/security.md` before touching auth, env vars, or anything that talks to `oops-api-v1`
- Read `docs/architecture/design-system.md` before writing any UI/component code

### Hard constraints

- Never call `fetch` directly outside `lib/http.ts` — go through a `services/` function
- Never let the browser read `BACKEND_API_BASE_URL` or otherwise talk to `oops-api-v1` directly — only Server Components and `app/api/*/route.ts` may
- Never render a raw error message in the UI — translate a stable `code` via `useTranslations("errors")`
- Never write a raw hex/oklch/rgb color, or any spacing/radius value, that duplicates an existing design token
- Never add a new dependency without recording the decision in the `design.md` of the OpenSpec change introducing it (there is no standalone ADR folder in this workspace — see `../docs/agent-context/authority.md`)
