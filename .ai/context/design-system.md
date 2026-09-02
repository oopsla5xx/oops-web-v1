# Design System

Implementation-ready UI style guidance for `oops-web-v1` (authenticated dashboard web app).
Read this before writing or editing any UI/component code.

Token **values** live in `src/app/globals.css` (single source of truth) — this file references
them by **name** only. If a value here ever looks wrong, trust `globals.css`, not this doc, and
fix this doc's wording instead.

---

## Foundations

### Typography

- Font: `Geist` (sans, body/UI) and `Geist Mono` (mono) via `next/font/google`, wired to
  `--font-sans` / `--font-mono` in `src/app/[locale]/layout.tsx`. Never import a different font or
  hardcode a `font-family`.
- Type scale: Tailwind's default `text-xs` → `text-4xl` utilities. No custom font-size scale is
  defined — don't invent one-off sizes (`text-[13px]`), pick the nearest Tailwind step.

### Color

Brand tone is Anthropic/Claude-inspired, calibrated against claude.ai's real CSS (`--cds-clay:
#d97757` = `oklch(0.672 0.131 38.8)`, `--cds-gray-*` scale = chroma 0-0.015, hue ~90-100) — an
intentional identity decision, not an unfinished shadcn default. Don't "fix" it back to pure gray.
Two distinct warmths exist, don't merge them:

- **Neutrals** (`background`, `foreground`, `muted`, `border`, ...): hue ~90-100, chroma barely
  above 0 — a near-neutral "paper" warmth, matching Claude's actual UI (not the clay hue).
- **Primary/accent** (`primary`, `ring`, `chart-*`): clay hue ~39, chroma ~0.13. Lightness is
  **darkened from the real 0.672 to 0.5** — the real value only reaches 3.0-3.1:1 against white
  (fails WCAG AA; Anthropic uses it as a brand/logo accent and on dark surfaces, not as a solid
  light-mode button fill). This darkened version keeps hue/chroma faithful but reaches ~6:1 so it
  works as a solid button fill here. Don't lighten `--primary` back toward the literal brand hex —
  re-verify contrast (WCAG formula, not eyeballing) before changing its lightness.

All color is expressed through the semantic CSS variables in `globals.css`'s `:root` / `.dark`
blocks, consumed via Tailwind utilities (`bg-primary`, `text-muted-foreground`, `border-border`,
...). Never write a raw hex/oklch/rgb value in component code — every color must resolve to one of:

`background`, `foreground`, `card` (+ `-foreground`), `popover` (+ `-foreground`), `primary`
(+ `-foreground`), `secondary` (+ `-foreground`), `muted` (+ `-foreground`), `accent`
(+ `-foreground`), `destructive`, `border`, `input`, `ring`, `sidebar*`, `chart-1..5`.

Both a light (`:root`) and a dark (`.dark`) value exist for every token — a component is done only
when it looks correct in both.

### Spacing

No custom spacing scale — use Tailwind's default spacing utilities (`p-2`, `gap-4`, `space-y-6`,
...) directly. Don't hardcode pixel spacing.

### Radius

Use the `--radius-*` scale (`radius-sm` → `radius-4xl`, all derived from the single `--radius`
var). Don't hardcode a `rounded-[Npx]` value outside of the documented exception already used by
`Button`'s `xs`/`sm` sizes (`rounded-[min(var(--radius-md),10px)]`) for optically balancing small
controls — that pattern (clamp a radius token, don't invent a raw px) is the template if another
small control needs the same treatment.

### Shadow & motion

Not tokenized yet — no custom `--shadow-*` or `--motion-*` variables exist in `globals.css`. Use
Tailwind's default `shadow-*` utilities and `transition-*`/`duration-*` utilities. Do not introduce
project-specific shadow or motion tokens speculatively; add them to `globals.css` first (with a
reason) if a real need shows up, then reference them here.

---

## Accessibility

- Target: WCAG 2.2 AA.
- Keyboard-first: every interactive element must be reachable and operable via keyboard alone.
- Focus-visible is mandatory and already baked into shadcn/Base UI primitives
  (`focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`) — never remove or
  override it away.
- Respect the `aria-invalid` styling contract already used by form primitives (see `Button`) when
  building new form controls — invalid state must be visibly distinct, not color-only.
- Every interactive component needs an explicit state design for: default, hover, focus-visible,
  active, disabled, loading, and error — before it's considered done.

---

## Writing tone

Concise, confident, implementation-focused. UI copy (labels, empty states, errors) states what
happened and what to do next — no filler, no exclamation marks, no ambiguous verbs ("Something
went wrong" without saying what or what to do is not acceptable copy).

---

## Rules: Do

- Use semantic tokens (`bg-primary`, `text-muted-foreground`, ...), never raw color/spacing/radius
  values.
- Reuse `src/components/ui/*` (shadcn/ui primitives) before building a new component from scratch.
- Define default/hover/focus-visible/active/disabled/loading/error states for every interactive
  component.
- Specify keyboard, pointer, and touch behavior for interactive components.
- Handle long-content, overflow, and empty states explicitly — don't assume happy-path content
  length.

## Rules: Don't

- Don't hardcode hex/oklch/px values that duplicate an existing token.
- Don't ship a component with a missing state (e.g. no visible loading or disabled treatment).
- Don't remove or weaken `focus-visible` styling.
- Don't rely on color alone to convey state (error, disabled, selected) — pair it with an icon,
  label, or border change for contrast/color-blind users.
- Don't introduce a new design token (color, spacing, radius, shadow, motion) without adding it to
  `globals.css` first — this doc must never define a token value that doesn't exist in code.

---

## Quality gates

- Every "must" above is a merge blocker; every "should"-level judgment call is left to the
  implementer but should favor system consistency over a local visual exception.
- Any new CSS variable added to `globals.css` gets one line added to this doc's Foundations
  section describing what it's for — keep this doc and `globals.css` in the same PR.
