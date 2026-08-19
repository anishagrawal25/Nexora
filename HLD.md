# Nexora
**High-Level Design (HLD)**

---

## 1. Architecture Overview

Nexora follows a three-layer architecture: client, API, and data/external services.

```
                    ┌──────────────────────┐
                    │     React Frontend     │
                    │  (Vite, Router, Tailwind) │
                    └───────────┬──────────┘
                                │  REST (JSON + multipart)
                    ┌───────────▼──────────┐
                    │    Express Backend     │
                    │  (Node.js, middleware  │
                    │   chain, JWT auth)     │
                    └───────────┬──────────┘
           ┌─────────────┬──────┼──────┬─────────────┐
           │             │      │      │             │
    ┌──────▼─────┐ ┌─────▼────┐│┌──────▼──────┐┌─────▼──────┐
    │ PostgreSQL │ │ MongoDB  │││ Cloudinary  ││ Gemini API │
    │  (Neon)    │ │ (Atlas)  │││ (PDF store) ││ (analysis) │
    └────────────┘ └──────────┘│└─────────────┘└────────────┘
```

## 2. System Components

### 2.1 Frontend
**Technology:** React (Vite), React Router, Tailwind CSS.
**Responsibilities:** authentication screens (login/register with client-side validation), protected dashboard routing, resume upload UI with two-stage loading states (upload, then AI analysis), rendering structured AI results.

### 2.2 Backend
**Technology:** Node.js, Express.
**Responsibilities:** REST API surface, JWT issuance and verification, request validation, centralized error handling, orchestrating calls to Postgres, Mongo, Cloudinary, and Gemini.

### 2.3 PostgreSQL (Neon)
Stores structured, relational data with enforced foreign-key relationships: `users`, `target_roles`, `companies`, `eligibility_criteria`. Chosen for data where relationships and JOINs are core to the feature (e.g., comparing a user's profile against a company's criteria row).

### 2.4 MongoDB (Atlas)
Stores variable-shaped, AI-generated data: `resumeanalyses`, `skillgaps`, `recommendations`. Chosen because the AI's output shape is naturally document-like and doesn't benefit from a fixed relational schema.

### 2.5 Cloudinary
Stores uploaded resume PDFs outside the application server (which would lose files on redeploy, given ephemeral hosting filesystems). Returns a persistent URL, stored in the corresponding Mongo document.

### 2.6 Gemini API
Receives extracted resume text plus a structured-output prompt; returns a JSON object (skills, strengths, weaknesses, suggestions, readiness score), parsed and persisted by the backend.

**Provider note:** the platform uses Google's Gemini API (`@google/generative-ai`), selected for free-tier accessibility. The model reference used is `gemini-flash-latest` — an alias rather than a dated model name, adopted after two dated models (`gemini-1.5-flash`, `gemini-2.5-flash`) were found deprecated/restricted at build time. Using an alias insulates the integration from future model rotations.

## 3. API Surface

| Category | Endpoint | Status |
|---|---|---|
| Auth | `POST /api/auth/register` | Delivered |
| Auth | `POST /api/auth/login` | Delivered |
| Profile | `GET /api/profile` | Delivered |
| Profile | `PUT /api/profile` | Delivered |
| Resume | `POST /api/resume/upload` | Delivered |
| Resume | `POST /api/resume/analyze` | Delivered |
| Career | `GET /api/skill-gap/:targetRoleId` | In progress |
| Career | `GET /api/companies/:id/eligibility` | In progress |
| Career | `GET /api/recommendations` | In progress |
| System | `GET /api/health` | Delivered |

## 4. Security Design
- Passwords hashed with bcrypt (cost factor 10) before storage; never stored or logged in plain text.
- JWT-protected routes via a `requireAuth` middleware; tokens carry only non-sensitive identifiers (`id`, `email`), never the password hash.
- All secrets (DB URLs, JWT secret, Cloudinary and Gemini credentials) live in environment variables, excluded from version control via `.gitignore`; a `.env.example` documents required keys without values.
- SQL queries are parameterized (`$1, $2, …`) throughout — no string concatenation of user input into queries.
- Frontend route protection (`ProtectedRoute`) is explicitly a UX layer only; actual authorization is enforced server-side on every protected request, independent of what the client claims.

## 5. Error Handling Strategy
A single response contract across the API: `{ "error": "<message>" }` paired with an appropriate HTTP status code, produced by a centralized `errorHandler` middleware. All controller functions are wrapped in an `asyncHandler` utility so thrown errors and rejected promises are automatically routed to this handler rather than crashing the process or hanging the request.

Specific failure modes handled deliberately:
- **Database unreachable:** server logs a warning and continues running (graceful degradation), rather than refusing to start — verified against a real `ETIMEDOUT` outage during development.
- **AI response malformed:** defensive stripping of markdown fences before `JSON.parse`; a parse failure returns 502 rather than propagating a raw exception.
- **Invalid file upload:** rejected by multer (type/size) before reaching Cloudinary.

## 6. Scalability Considerations
The API is stateless (all session state lives in the client-held JWT), making it horizontally scalable behind a load balancer if needed. The Gemini call is the primary latency and cost driver per resume-analysis request; caching or request queuing would be the natural next optimization under sustained load.

## 7. Tech Stack Summary
| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS |
| Backend | Node.js, Express |
| Relational DB | PostgreSQL (Neon), via `pg` |
| Document DB | MongoDB (Atlas), via Mongoose |
| Auth | JWT (`jsonwebtoken`), bcrypt |
| File storage | Cloudinary, `multer`, `multer-storage-cloudinary` |
| PDF parsing | `pdf-parse` (v2 class-based API) |
| AI | Google Gemini API (`@google/generative-ai`) |
| Deployment (planned) | Vercel (frontend), Render/Railway (backend) |

## 8. Future Scaling Notes
Possible future improvements: Redis caching for repeated eligibility lookups, Docker containerization of the backend, a background job queue for AI analysis (to decouple upload from the synchronous AI wait), horizontal scaling behind a load balancer if usage grew significantly.