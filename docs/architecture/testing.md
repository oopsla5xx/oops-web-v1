# Testing Conventions

<!-- Each rule: clear name, ❌ (wrong) and ✅ (correct) examples, short rationale -->

---

## File layout

### Rule: Unit/component tests are colocated; e2e tests live in `src/tests/e2e/`

Unit and component tests (Vitest + Testing Library) live next to the file they test, using the
`*.test.ts` / `*.test.tsx` suffix. End-to-end tests (Playwright) live under `src/tests/e2e/` using
the `*.spec.ts` suffix — the two suffixes keep Vitest and Playwright from picking up each other's
files (`vitest.config.mts` only includes `src/**/*.test.{ts,tsx}`).

✅

```
src/lib/env.ts
src/lib/env.test.ts
src/tests/e2e/system-status.spec.ts
```

❌

```
src/lib/env.ts
tests/unit/lib/env.test.ts   # mirrored directory drifts from the source it tests
src/tests/e2e/system-status.test.ts   # wrong suffix, Vitest would try to run it too
```

**Rationale:** Colocated unit tests stay next to the code they verify, so moving/renaming a file
can't silently orphan its test. e2e tests are a different kind of test (full app + real backend)
and get their own directory and runner.

---

## Mocking boundaries

### Rule: Mock the module one layer below the thing under test, not your own internals two layers down

Each unit test mocks only the direct collaborator(s) of the function under test — the actual
external boundary (`fetch`, `env`) or the next module inward — not everything transitively.

✅ (`src/services/health.test.ts` mocks `@/lib/env` and `@/lib/http`, the direct collaborators of `getHealth`)

```ts
vi.mock("@/lib/env", () => ({ getEnv: () => ({ BACKEND_API_BASE_URL: "http://localhost:8080" }) }));
vi.mock("@/lib/http", () => ({ httpGet: (...args) => httpGetMock(...args) }));
```

❌

```ts
vi.mock("@/services/health"); // mocking the thing you're testing
```

**Rationale:** Mocking too high (your own module under test) tests nothing. Mocking too low
(`fetch` inside a service test instead of the `http.ts` wrapper) duplicates `http.test.ts`'s job
and couples the service test to `http.ts`'s implementation details.

### Rule: `fetch` itself is only mocked where nothing else sits between the code and the network

`src/lib/http.ts` is the one place that talks to `fetch` directly, so it's the one place that
stubs `global.fetch` (via `vi.stubGlobal("fetch", ...)`, cleaned up with `vi.unstubAllGlobals()` in
`afterEach`). `RefreshButton.test.tsx` also stubs `fetch` because `httpGet` (which it calls) talks
to `fetch` directly and there's no additional test-owned layer worth mocking in between — this is
the "mock one layer below" rule applied to a component that calls `lib/http.ts` directly rather
than through a `services/` function (there's no per-request business logic to justify one here).

---

## State reset between tests

### Rule: Reset Zustand stores and the DOM between tests, not between files

Zustand stores created with `create()` are module-level singletons, so every test in a file shares
one store instance. Capture `useXStore.getState()` once at module scope, then restore it in
`beforeEach`:

```ts
const initialState = useSystemStatusStore.getState();
beforeEach(() => {
  useSystemStatusStore.setState(initialState, true);
});
```

Testing Library does not auto-clean rendered components between tests under Vitest; `vitest.setup.ts`
registers a global `afterEach(() => cleanup())` so `render()` in one test can't leak DOM nodes
(and duplicate `data-testid`s) into the next.

**Rationale:** Without both resets, test order starts to matter and failures show up as confusing
"multiple elements found" or "wrong initial state" errors in unrelated tests.

---

## Testing components that use `next-intl`

### Rule: Wrap with `NextIntlClientProvider`, using the real `messages/*.json` — not a fake dictionary

```tsx
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/en.json";

render(
  <NextIntlClientProvider locale="en" messages={messages}>
    <SystemStatusView initialData={data} />
  </NextIntlClientProvider>,
);
```

`vitest.config.mts` must set `test.server.deps.inline: ["next-intl"]` — without it, next-intl's
package isn't transformed correctly under Vitest and components using `useTranslations()` fail to
render in tests.

**Rationale:** Using the real message files (not an inline fake dictionary) means a test failure
means either the component or the translation file is wrong — never both, and a typo'd/missing
translation key surfaces as a real test failure instead of being masked by a fake stand-in.

---

## Testing custom hooks

### Rule: Test hooks with `renderHook`, not by rendering a component that uses them

```ts
import { act, renderHook } from "@testing-library/react";

const { result } = renderHook(() => useRefreshHealth());
await act(() => result.current.refresh());
expect(useSystemStatusStore.getState().status).toBe("success");
```

Then the component that _uses_ the hook mocks it (`vi.mock("./useRefreshHealth", ...)`) and only
asserts on rendering/wiring (button text, disabled state, that `refresh()` gets called on click) —
see `RefreshButton.test.tsx`. Don't stub `fetch` in both the hook's test and the component's test
for the same behavior; that's the "mock one layer below" rule duplicated across two files.

**Rationale:** `renderHook` tests the logic directly without needing a component tree, and keeps
component tests fast/focused since they no longer need to simulate network responses.

---

## e2e tests run against the real backend — no mocking

### Rule: Playwright specs hit the actual Go backend, not a mock

`src/tests/e2e/*.spec.ts` assumes `oops-api-v1` is running at `http://localhost:8080` (same
`BACKEND_API_BASE_URL` as `.env.local`) and asserts on the real response (`oops-api-v1`, `1.0.0`).
This is a deliberate choice for this project: the whole point of the System Status feature is
proving the frontend talks to a real backend, so faking that in the one test that's supposed to
prove it would defeat the test's purpose.

**Rationale:** `pnpm test:e2e` will fail (correctly) if the backend isn't running — that is
signal, not flakiness. Do not add a fallback/mock backend to make e2e tests pass without one.
