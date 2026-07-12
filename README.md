# Meridian — AI Trip Planner

Describe a trip in plain language and get a **structured, interactive day-by-day itinerary**.
You type "3 days in Lisbon, viewpoints and seafood, day trip to Sintra"; an LLM returns
structured JSON; the app validates it and renders days and stops you can **expand, reorder,
and remove**. It is deliberately **not a chatbot** — the model's raw text is never printed.

Built for the frontend assignment (Trip Planner track). The interesting part isn't calling the
model — it's turning unpredictable model output into a UI that never crashes and never shows a
stale answer.

```bash
npm install && npm start        # → http://localhost:5173
```

Runs with **zero setup**: with no API key it uses a built-in deterministic `mock` provider.
Add a Gemini key (below) to use the real model.

---

## Setup

Requires **Node ≥ 20.12** (uses `process.loadEnvFile`).

```bash
npm install
cp .env.example .env      # optional — leave the key blank to run on the mock provider
npm start
```

`npm start` runs two processes via `concurrently`:

| Process | Port  | Role |
|---------|-------|------|
| web (Vite)      | 5173 | React app; proxies `/api/*` → the server |
| server (Express)| 8787 | Holds the API key, calls the LLM, validates, returns clean JSON |

Open **http://localhost:5173**.

### Using the real model (Gemini)

Get a free key at [aistudio.google.com](https://aistudio.google.com), then in `.env`:

```
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

The key is read only by the server (`server/env.ts`). It is **never** a `VITE_` variable, never
sent to the browser, and never logged. `grep`-ing the production bundle for it returns nothing.

---

## What it does

- **Free-form input** → the model returns JSON matching a strict schema → the app renders it.
- **Optional date range**: pick travel dates in a dual-month calendar (with trip presets like "long
  weekend" / "1 week"). The plan then spans exactly those dates and each day is stamped with its
  real calendar date (Fri, Jul 17…).
- **Rendered as a chat reply**: your request appears as a message and the plan as the assistant's
  structured reply — interactive components, never raw model text.
- **Every place links to Google Maps**: a pin on each stop (and an "Open in Google Maps" action when
  expanded) opens the location in a new tab.
- **Interactive itinerary**: expand a stop for its description, insider tip, location, and cost;
  **drag to reorder** stops within a day (pointer, touch, **and keyboard**); remove stops or whole days.
- **Four explicit states** everywhere data is shown: idle, loading (shaped skeleton), error (with
  Retry), empty, success.
- **Save / restore**: your plan, dates, and edits persist to `localStorage` and are restored on
  reload — no second model call.
- **Light / dark themes**, mobile-first responsive layout, keyboard-operable, reduced-motion aware.
- **Failure demo**: a "Demo a failure" menu triggers each bad-output case on demand (see below).

---

## Handling bad AI output (the point of the exercise)

The LLM is treated as an **untrusted input boundary**. Everything the model returns is validated
before it can reach the screen. The pipeline lives in `server/llm/generate-itinerary.ts`:

1. **Constrain generation.** Gemini is called in JSON mode with a `responseSchema`, so most output
   is well-formed to begin with.
2. **Cheap repair, then parse.** `server/llm/json-repair.ts` strips code fences, slices out the
   JSON object, and removes trailing commas before `JSON.parse` (wrapped in `try/catch`).
3. **Validate with Zod.** One schema (`src/shared/schemas/itinerary.ts`) is the single source of
   truth. Structural fields (destination, a stop's name) are strict; soft fields (category, time,
   cost) use `.catch()` so one odd value degrades gracefully instead of nuking a good 3-day plan.
   On a `safeParse` failure the server returns a typed error, never partial data.
4. **Assign ids server-side.** The model is never asked for ids; the server assigns stable UUIDs
   after validation, so React keys and drag-reordering are reliable.

Each failure becomes a **typed error** with a stable code and a `retryable` flag:

| Failure | Code | Behavior |
|---|---|---|
| Unparseable JSON | `invalid_json` | Error state + Retry |
| Valid JSON, wrong shape | `invalid_shape` | Error state + Retry |
| Valid, but zero stops | (200) | Distinct **empty** state |
| Provider 5xx / network | `upstream_error` | **Auto-retried** (backoff + jitter), then Retry |
| Rate limited (429) | `rate_limited` | Auto-retried, honoring the limit |
| Hung provider | `timeout` | 30s `AbortController` timeout, then Retry |

**Retry policy:** only *transient transport* errors are retried automatically (exponential backoff
with full jitter, on both the server and the client). Deterministic errors (bad JSON, wrong shape)
are **not** auto-retried — they're surfaced for a user-initiated Retry, since re-prompting a
stochastic model is what actually helps there.

**No stale response overwrites a newer one** — the headline requirement, enforced two ways in
`src/features/planner/hooks/use-itinerary.ts`:

- Every new request **aborts the previous one** via `AbortController` (the fetch is cancelled, and
  the server aborts its upstream LLM call too on client disconnect).
- A **monotonic request id**: when a response resolves, it's applied only if its id is still the
  latest. A slow earlier response that somehow resolves after a newer one is dropped.

Try it: open the failure menu, fire **Slow response**, then immediately submit a normal trip — the
fast result wins and the slow one is discarded.

### Fault-injection demo

The "Demo a failure" menu sends an `x-fault` header the server honors (only when `FAULT_DEMO` is
on, which is the default in dev). Each mode runs through the *real* parse/validate pipeline, so the
demo exercises the actual code path, not a special case. Modes: malformed JSON, wrong shape, empty,
slow, server 500, rate-limited.

---

## Architecture

Feature-first structure with a one-way import rule (`shared → features → app`) and a public
`index.ts` per feature.

```
server/                     # Express key-proxy (Node only, never bundled to the client)
  env.ts                    # zod-validated env + provider auto-selection (gemini | mock)
  providers/                # gemini.ts · mock.ts — one interface
  llm/                      # prompt · json-repair · validation/retry/timeout orchestration · faults
  routes/  middleware/      # /api/generate, /api/health · error handler, fault injection
src/
  shared/                   # @shared kernel: the ONE itinerary schema, imported by server + client
  features/
    planner/                # input form + generate lifecycle (stale-guard) + session persistence
    itinerary/              # rendering + expand/remove/reorder + loading/error/empty states
  components/ui/            # owned primitives (Button, Card, Textarea, …) — cva + design tokens
  app/                      # composition root: providers, top bar, page, error boundary, theme
```

The **one sanctioned server↔client link** is the itinerary Zod schema in `src/shared/schemas`,
imported by the server (primary validation gate) and the client (defensive re-validation + types).
One schema, one truth.

### Tech and why

- **React 18 + hooks + TypeScript (strict).** Functional components, discriminated-union state,
  no `any`; `unknown` at every external boundary, narrowed by Zod.
- **Vite + a small Express server.** The server exists solely to keep the key off the client. In
  production it maps cleanly to a serverless function.
- **TanStack Query** runs the generate mutation (retry/backoff); the stale-guard is layered on top.
- **Zod** for one shared schema used for generation, validation, and types.
- **@dnd-kit** for reordering — accessible pointer/touch/keyboard sensors out of the box.
- **Motion** (framer-motion) for the staggered day reveal and expand/collapse, gated on
  `prefers-reduced-motion`.
- **Design:** an image-forward, light-first dashboard — a sticky photographic hero that fades into
  the page, a left icon rail, glass search bar, and popular-destination cards. Self-hosted type
  system (Bricolage Grotesque / Hanken Grotesk / DM Mono), a single locked marigold accent, and full
  light/dark parity via CSS tokens. (Hero and card imagery are Lorem Picsum placeholders; swap for
  licensed photography in production.)

---

## AI-usage note

This project was built with heavy use of an AI coding assistant (Claude Code). I used it to
scaffold the Vite + Express setup, generate component and server boilerplate, and iterate quickly
on the failure-handling pipeline and the design system. I directed the architecture and the
product decisions myself — the itinerary data contract, the untrusted-boundary validation
strategy, the stale-response guard, the fault-injection demo, and the visual language — and I
reviewed every file. The structure is documented (feature-first, one shared schema, typed errors)
specifically so it's straightforward to explain and extend.

---

## Known limitations

- **No streaming.** The itinerary appears all at once after validation. Streaming structured JSON
  reliably means parsing partial JSON, which fights the "validate before render" guarantee; I chose
  correctness over a progress trickle.
- **Reorder is within a day**, not across days, and there's no undo for a removed stop.
- **Client bundle is ~170 KB gzip** (Motion + dnd-kit + Query). Fine here; I'd code-split the
  itinerary view behind the primary path if it grew.
- **Server retry state isn't shared** if you run multiple instances — retries/timeouts are
  per-request, which is correct for this single-process setup.
- **The mock provider** uses light heuristics to guess destination/day-count; it's for zero-setup
  runs and deterministic demos, not realistic content.
- **No tests yet.** With more time I'd add unit tests for `json-repair` and the schema's `.catch`
  behavior, and a Playwright flow (I verified those paths manually, including a scripted Playwright
  run of generate → expand → keyboard-reorder → remove → theme → reload → fault).

## What I'd do next

Streaming with a partial-JSON parser; a refinement loop ("make day 2 more relaxed") that edits the
existing plan instead of regenerating; drag stops between days with undo; and a one-shot
server-side self-correction that feeds Zod issues back to the model before surfacing an error.

## Time spent

~8 hours: ~1h planning + data contract, ~2h server pipeline (providers, validation, retry/timeout,
faults), ~1h stale-guard + session/state, ~2.5h itinerary UI (reorder/expand/remove + states),
~1h design system + polish, ~0.5h verification + README.
