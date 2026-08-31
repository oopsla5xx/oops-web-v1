# Add `@swc/helpers` as an explicit dependency

## Context

Production Docker build (`output: "standalone"`) crashed at runtime with:

```
Error: Cannot find module '/app/node_modules/.pnpm/next@16.3.1_.../node_modules/@swc/helpers/esm/_interop_require_default.js'
```

Next.js's file tracer (used to build `.next/standalone`) does not reliably follow `@swc/helpers`'
ESM entry points through pnpm's symlinked store — a known interaction between Next's static
tracing and pnpm's content-addressable `node_modules/.pnpm` layout. Adding `@swc/helpers` as an
explicit top-level dependency alone did not fix it (Next resolves its own nested copy, not the
hoisted one).

## Decision

1. Added `@swc/helpers` as an explicit `dependencies` entry (was previously only an indirect
   dependency of `next`).
2. Added `outputFileTracingIncludes: { "/*": ["./node_modules/@swc/helpers/**/*"] }` to
   `next.config.ts` — the officially documented escape hatch for cases where the tracer misses
   required files (see `node_modules/next/dist/docs/.../output.md`, "Caveats").

## Verification

- `pnpm build` → inspected `.next/standalone/node_modules/.pnpm/next@16.3.1.../node_modules/@swc/helpers/esm/` — files now present (were missing before the fix).
- Ran `node .next/standalone/server.js` locally against the real backend — served real data correctly.
- Built the production Docker image and ran the container end-to-end against the real backend
  (`oops-api-v1` on the host) — `curl` against `/` and `/api/health` both returned real data,
  process ran as the non-root `nextjs` user.

## Alternative considered and rejected

Switching pnpm to `node-linker=hoisted` (flat `node_modules`, like npm) would also avoid this
class of issue, but changes pnpm's dependency isolation project-wide for local dev too. The
`outputFileTracingIncludes` fix is scoped to exactly the file that's missing.
