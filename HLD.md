# High-Level Design (HLD)
## Nexora — Resume Readiness & Skill-Gap Platform

**Version:** 1.0
**Status:** Reflects the current, implemented architecture

---

## 1. Architecture Style

A classic **3-tier web application** with a **polyglot persistence layer** (one relational store for structured/relational data, one document store for AI-derived/semi-structured data) and one external AI service integration.

```
┌─────────────────────┐        HTTPS/JSON        ┌──────────────────────────┐
│   React SPA (Vite)  │ ───────────────────────▶ │  Express REST API        │
│   client/           │ ◀─────────────────────── │  server/                 │
│  - React Router     │                            │  - authRoutes            │
│  - useState/Effect  │                            │  - profileRoutes         │
│  - api.js (fetch)   │                            │  - resumeRoutes          │
└──────────────────────┘                           │  - JWT auth middleware   │
                                                     │  - centralized error    │
                                                     │    handling              │
                                                     └───────┬────────┬────────┘
                                                             │        │
                                     ┌───────────────────────┘        └─────────────────┐
                                     ▼                                                    ▼
                       ┌───────────────────────────┐                      ┌───────────────────────────┐
                       │  PostgreSQL                │                      │  MongoDB (Mongoose)        │
                       │  - users                   │                      │  - ResumeAnalysis           │
                       │  - target_roles            │                      │  - Recommendation           │
                       │  - companies               │                      │  - SkillGap                 │
                       │  - eligibility_criteria     │                      └───────────────────────────┘
                       └───────────────────────────┘

                       External services:
                       ┌───────────────────────────┐    ┌───────────────────────────┐
                       │  Cloudinary                 │    │  Google Gemini API          │
                       │  (resume PDF storage)        │    │  (resume text analysis)     │
                       └───────────────────────────┘    └───────────────────────────┘
```

## 2. Components

### 2.1 Frontend (`client/`)
- **Framework:** React (Vite bundler), React Router (`react-router-dom`) for client-side routing.
- **Pages:** `Login`, `Register`, `Dashboard` (protected).
- **Shared components:** `AuthLayout`, `AuthToggle`, `PasswordInput`, `ProtectedRoute`, `ResumeUpload`.
- **Data layer:** a single `api.js` module wrapping `fetch` — `apiRequest()` for JSON calls (auto-attaches JWT from `localStorage`, throws on non-2xx) and `uploadResume()` for multipart file upload.
- **State:** component-local `useState`; no global state manager (Redux/Context) — appropriate for this scope since state doesn't cross more than one page.
- **Session:** JWT stored in `localStorage`; `ProtectedRoute` gates `/dashboard` by presence of the token (client-side only — no token expiry check on the frontend).

### 2.2 Backend (`server/`)
- **Framework:** Express.js.
- **Layering:** `routes/` → `controllers/` → `models/` (Mongo) or direct `pgPool.query` (Postgres), with `middleware/` cutting across all layers.
- **Middleware stack:** `cors()`, `express.json()`, `requireAuth` (route-scoped), `errorHandler` (global, mounted last).
- **Error model:** a single `AppError(message, status)` class thrown from anywhere in a controller; `asyncHandler()` wraps every async route handler to forward rejected promises to `next(err)`; the global `errorHandler` middleware converts any error to a consistent `{ error: message }` JSON body with the right status.
- **Startup sequence (`server.js`):** load env → attempt Postgres connect → attempt Mongo connect → mount routes → start HTTP listener. Both DB connections are **soft-fail** (logged warning, not a crash), so the API stays up for debugging even if one datastore is down.

### 2.3 Data Stores
- **PostgreSQL** — source of truth for anything relational/structured: `users`, `target_roles`, `companies`, `eligibility_criteria`, linked via foreign keys (`users.target_role_id → target_roles.id`, `eligibility_criteria.company_id → companies.id`).
- **MongoDB (via Mongoose)** — source of truth for AI-derived, semi-structured, append-heavy data: `ResumeAnalysis`, `Recommendation`, `SkillGap`. Each document cross-references the Postgres user by numeric `userId` (no native FK — a deliberate polyglot-persistence tradeoff).

### 2.4 External Integrations
- **Cloudinary** — resume PDFs are streamed directly to Cloudinary via `multer-storage-cloudinary`; only the resulting URL is persisted in Mongo (the server never stores the file itself).
- **Google Gemini (`@google/generative-ai`)** — `resumeController.js` builds a strict-JSON-only prompt, calls `gemini-flash-latest`, retries transient `503`/overload errors up to 3× with increasing backoff, and validates/parses the JSON before persisting.

## 3. Cross-Cutting Concerns

| Concern | Approach |
|---|---|
| **AuthN** | JWT (HS256, `JWT_SECRET`), 7-day expiry, verified per-request in `requireAuth` middleware |
| **AuthZ** | Single-tier — any valid token grants access to that user's own resources only (enforced by scoping every query to `req.user.id`) |
| **Secrets management** | `.env` + `dotenv`, never committed/hard-coded; consumed via `process.env.*` in `postgres.js`, `mongo.js`, `cloudinary.js`, `gemini.js` |
| **Error handling** | Centralized (`AppError` + `asyncHandler` + `errorHandler`) — no per-route try/catch boilerplate |
| **Resilience** | AI call retry-with-backoff; DB connections are non-fatal on boot |
| **File handling** | Multer with a 5MB limit and PDF-only `allowed_formats`, streamed straight to Cloudinary (no local disk writes) |
| **CORS** | Enabled globally via `cors()` (currently unrestricted origin — fine for dev, should be locked down for prod) |

## 4. Request Flow — Example: "Upload & Analyze Resume"

1. User selects a PDF in `ResumeUpload.jsx` → `uploadResume(file)` → `POST /api/resume/upload` (multipart, JWT header).
2. `requireAuth` verifies JWT → `upload.single("resume")` (Multer/Cloudinary) streams file to Cloudinary → `uploadController` creates a `ResumeAnalysis` Mongo doc with `{ userId, resumeUrl }` → responds `201` with `resumeId`.
3. Frontend immediately calls `POST /api/resume/analyze` with that `resumeId`.
4. `analyzeResume` controller: fetch PDF bytes from Cloudinary URL → extract text (`pdf-parse`) → build prompt → call Gemini with retry → parse JSON → update the same Mongo doc → respond `200` with the full analysis.
5. Frontend sets `analysis` state → Dashboard re-renders the results.

## 5. Deployment Topology (implied by config)

- Frontend: static Vite build (`dist/`) — deployable to any static host.
- Backend: single Node/Express process, port from `process.env.PORT` (defaults to 5000), currently pointed at by the frontend via a hard-coded `http://localhost:5000/api` (would need to become an env-driven `VITE_API_URL` for non-local deployment).
- Databases: externally hosted Postgres + MongoDB (connection strings via env).

## 6. Key Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| Postgres for user/role/company/eligibility data | This data is inherently relational (FKs, joins for eligibility lookups) and benefits from strong schema + integrity constraints |
| MongoDB for resume analysis/recommendations/skill-gap | This data is AI-generated, schema-flexible, and append-oriented (new analysis per upload) — a better fit than rigid relational tables |
| Deterministic readiness score computed server-side, separate from the AI's own score | Keeps the "official" score auditable and reproducible, independent of AI non-determinism; AI score is kept alongside for transparency |
| Soft-fail DB connections on boot | Lets the API start and serve `/api/health` even during partial infra outages, rather than crash-looping |
| Retry-with-backoff only for Gemini `503`/overload | Avoids retrying non-transient errors (e.g., bad API key, malformed prompt) which would waste time and mask real bugs |

## 7. Known Architectural Gaps

- No API gateway/rate limiting layer — a user (or script) can hammer `/api/resume/analyze` with no throttling.
- No refresh-token mechanism — a 7-day JWT is the only session control (no server-side revocation list).
- No caching layer (e.g., Redis) — `target_roles`/`RESOURCE_MAP` are re-queried/rebuilt on every request even though they change rarely.
- Frontend API base URL is hard-coded rather than environment-driven.