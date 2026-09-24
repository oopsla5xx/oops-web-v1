# Conventions

<!-- Each rule: clear name, ❌ (wrong) and ✅ (correct) examples, short rationale -->

---

## Error Handling

### Rule: Do not silently swallow errors

❌

```typescript
try {
  await doSomething();
} catch (e) {
  // ignore
}
```

✅

```typescript
try {
  await doSomething()
} catch (e) {
  logger.error('doSomething failed', { error: e, context: ... })
  throw e // or handle specifically
}
```

**Rationale:** Swallowed errors lose the trace, making debugging very difficult later.

---

## Naming

### Rule: Components PascalCase, everything else camelCase; one component per file named after it

❌

```
src/features/system-status/refresh_button.tsx   // snake_case file
export default function refreshButton() { ... }  // component not PascalCase
```

✅

```
src/features/system-status/RefreshButton.tsx
export function RefreshButton() { ... }
```

**Rationale:** Matches Next.js/React community convention and keeps file-to-export name mapping obvious.

---

## Environment variables & config

### Rule: Env vars are validated once with Zod, never read via `process.env` directly outside `lib/env.ts`

❌

```typescript
const url = process.env.BACKEND_API_BASE_URL; // no validation, could be undefined
fetch(url + "/x");
```

✅

```typescript
import { getEnv } from "@/lib/env";
const { BACKEND_API_BASE_URL } = getEnv(); // throws clearly if missing/invalid
```

### Rule: No `||`/`??` fallback for required config

❌

```typescript
const url = process.env.BACKEND_API_BASE_URL || "http://localhost:8080";
```

✅ Let `lib/env.ts`'s Zod schema fail fast instead — see `getEnv()`.

**Rationale:** A silent fallback in one environment becomes a very confusing bug in a different
one (e.g. staging silently talking to `localhost`). Fail loudly at first use instead.

---

## Data access (external Backend API)

### Rule: Never call `fetch` directly outside `lib/http.ts`; go through a `services/` function

❌

```typescript
// inside a component or route handler
const res = await fetch("http://localhost:8080/api/v1/health");
```

✅

```typescript
// src/services/health.ts
export async function getHealth(): Promise<Health> {
  const { BACKEND_API_BASE_URL } = getEnv();
  const json = await httpGet(`${BACKEND_API_BASE_URL}${BACKEND_API_PATHS.health}`);
  return healthResponseSchema.parse(json); // validated, not trusted blindly
}
```

**Rationale:** Centralizes timeout handling, error context, and response validation in one place
(`lib/http.ts` + `schemas/`). A component that calls `fetch` directly bypasses all of that.

### Rule: The browser never talks to the Backend API directly — always through an internal Route Handler

See `docs/architecture/overview.md` → Main data flows. Client Components fetch `/api/health` (this
app's own Route Handler), never `BACKEND_API_BASE_URL` directly — that env var is server-only.

---

## API / Interface (Route Handlers)

### Rule: Route Handlers translate service errors into a clear JSON error response, they don't leak internals

❌

```typescript
export async function GET() {
  const health = await getHealth(); // if this throws, Next returns a generic HTML 500 page
  return NextResponse.json(health);
}
```

✅

```typescript
export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const health = await getHealth(requestId);
    return NextResponse.json(health, { status: 200, headers: { [HEADER_REQUEST_ID]: requestId } });
  } catch (error) {
    const code = error instanceof ApiError ? error.code : CLIENT_ERROR_CODES.UNKNOWN_ERROR;
    console.error("GET /api/health failed", { requestId, error }); // full detail server-side only
    return NextResponse.json(
      { error: { code } },
      { status, headers: { [HEADER_REQUEST_ID]: requestId } },
    );
  }
}
```

**Rationale:** Callers of this route (our own Client Components) expect JSON, not an HTML error
page. Logging the real error server-side while returning only a **code** (never the raw message)
to the client follows the security checklist's `error-exposure` rule and lets the client translate
it — see Error Codes & i18n below.

---

## Error Codes & i18n

### Rule: UI never renders a raw error message — only translate a `code` via `useTranslations("errors")`

❌

```tsx
<AlertDescription>{error.message}</AlertDescription>
```

✅

```tsx
const tErrors = useTranslations("errors");
<AlertDescription>{errorCode ? tErrors(errorCode) : null}</AlertDescription>;
```

**Rationale:** The backend never sends a localized message (see `docs/architecture/overview.md` →
Error contract) — codes are the only thing that's stable across languages. Every code (backend or
client-only, see `src/constants/error-codes.ts`) must have a matching key in **both**
`messages/en.json` and `messages/vi.json` under `errors.*`.

### Rule: `initialErrorCode`/`initialData` props are read at render time, never written into a Zustand store on mount

❌

```tsx
useEffect(() => {
  if (initialErrorCode) setError(initialErrorCode); // writes request-specific state into a module-level store
}, []);
```

✅

```tsx
const status = storeStatus !== "idle" ? storeStatus : initialData ? "success" : "error";
```

**Rationale:** Zustand stores created with `create()` are module-level singletons — writing
per-request SSR data into one during render/effect would leak between concurrent requests on the
server. Deriving the displayed state at render time from `(store state, props)` keeps SSR safe and
avoids a hydration-mismatch flash.

---

## Reusable client logic

### Rule: Extract fetch/state logic into a feature-scoped custom hook — components stay presentation-only

❌

```tsx
// component does fetch + parse + store updates inline
export function RefreshButton() {
  async function handleRefresh() {
    setLoading();
    try {
      const json = await httpGet(INTERNAL_API_PATHS.health);
      setSuccess(healthResponseSchema.parse(json));
    } catch (error) {
      /* ... */
    }
  }
  return <Button onClick={handleRefresh}>...</Button>;
}
```

✅

```tsx
// src/features/system-status/useRefreshHealth.ts — the reusable logic
export function useRefreshHealth() {
  const status = useSystemStatusStore((s) => s.status);
  const refresh = useCallback(async () => { /* fetch + parse + store updates */ }, [...]);
  return { status, refresh };
}

// RefreshButton.tsx — presentation only
export function RefreshButton() {
  const { status, refresh } = useRefreshHealth();
  return <Button onClick={refresh} disabled={status === "loading"}>...</Button>;
}
```

**Rationale:** Keeps the component trivially testable by rendering (mock the hook, assert on
props/clicks) and the logic trivially testable without rendering (`renderHook`, assert on
store/fetch behavior) — see `docs/architecture/testing.md`. Don't create a hook this way
until there's real logic to extract (a component that's just JSX + one store read doesn't need one).

---

## Testing

See `docs/architecture/testing.md` for the full rules (file layout, mocking boundaries,
store/DOM reset between tests, why e2e tests run against the real backend).

---

<!-- Add new rule groups using the same format -->
