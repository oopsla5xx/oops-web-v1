@AGENTS.md

## Where to read

| Need to know                                            | Read this                            |
| ------------------------------------------------------- | ------------------------------------ |
| Commands (build, test, lint…)                           | `README.md`                          |
| Architecture, module layout, wiring, data flow          | `.ai/context/architecture.md`        |
| Coding conventions, error handling, env vars, SQL rules | `.ai/context/conventions.md`         |
| Testing patterns, mocks, factory, coverage              | `.ai/context/testing-conventions.md` |
| Security check list                                     | `.ai/context/security-checklist.md`  |

**When unsure about anything — read the relevant file above first. Do not guess.**

---

## Agent rules

### Before writing code

- Read `.ai/context/architecture.md` before touching any module structure or wiring
- Read `.ai/context/conventions.md` before writing handlers, error handling, or env vars
- Read `.ai/context/testing-conventions.md` before writing any test
- Read `.ai/context/security-checklist.md` before writing authentication, authorization, handling user input, secrets, sensitive data, file uploads, external integrations, or security-sensitive code
