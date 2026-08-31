# Add `next-intl` for full-app i18n

## Context

User asked to unify error codes/response/headers between `oops-api-v1` and `oops-web-v1`, and
(after clarifying "đa ngôn ngữ") to have the frontend translate backend error codes into the
user's chosen language — and to translate the whole UI, not just error messages.

## Decision

Added `next-intl` (v4.14.1) — the standard i18n library for Next.js App Router. Locales: `en`
(default), `vi`. Routing: URL prefix (`/en`, `/vi`) via `src/app/[locale]/`.

## Notable Next.js 16 interaction

Next 16 deprecated `middleware.ts` in favor of `proxy.ts` (same behavior, new name/location
rules). Confirmed via `node_modules/next/dist/docs/.../file-conventions/proxy.md` — the proxy file
must live at the same level as `app/`, so with a `src/` layout it's `src/proxy.ts`, not a
project-root `proxy.ts` (the latter silently doesn't intercept requests — `/` returned a bare 404
instead of redirecting to the default locale until this was fixed).

## Known, deliberate deprecation warning left as-is

`getRequestConfig`'s `requestLocale` param and `setRequestLocale` are marked `@deprecated` in
next-intl 4.14.1's own types, pointing at migrating to `next/root-params` (a real, documented
Next 16 API — `node_modules/next/dist/docs/.../next-root-params.md`). Not migrated now: this is
next-intl's own currently-documented "with i18n routing" setup (still fully functional, not
removed), and `next/root-params` is a broader architectural change to how the locale segment is
read app-wide that next-intl's own docs haven't fully converged on yet (inconsistent samples seen
during research). Revisit if next-intl ships a stable root-params-based routing guide.

## Alternative considered and rejected

A hand-rolled `errors/{locale}.ts` dictionary with no routing/library, translating only error
messages — rejected once the user confirmed they want the whole UI translated (labels, buttons),
which needs proper App Router i18n routing, not just a lookup table.
