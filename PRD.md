# Product Requirements Document (PRD)
## Nexora — Resume Readiness & Skill-Gap Platform

**Version:** 1.0
**Status:** Reflects the current, implemented state of the codebase (`client/` + `server/`)

---

## 1. Purpose & Problem Statement

Students preparing for internships and entry-level jobs don't have a single place that tells them:
1. How complete/strong their resume actually is,
2. Whether they're eligible for a specific company's hiring bar, and
3. Exactly which skills to learn next, with links to learn them.

Nexora solves this by combining a structured student profile (Postgres), an AI-analyzed resume (Gemini), and role/company eligibility rules into one **readiness score** and a **prioritized learning plan**.

## 2. Target User

College students / early-career job seekers applying to internships or entry-level roles, tracked as a single `users` record with academic + profile fields (CGPA, grad year, GitHub/LinkedIn/portfolio links, target role).

## 3. Goals

| Goal | Success signal |
|---|---|
| Let a user register/login securely | JWT-based session, bcrypt-hashed passwords |
| Let a user upload a resume and get an AI-generated breakdown | `extractedSkills`, `strengths`, `weaknesses`, `suggestions`, `readinessScore` populated |
| Give the user one composite readiness score | `/api/profile/readiness` returns a weighted score |
| Tell the user if they qualify for a specific company | `/api/profile/eligibility` returns pass/fail + missing skills |
| Tell the user what to learn next | `/api/profile/recommendations` and `/api/profile/skill-gap` return prioritized, linked skill gaps |

## 4. Non-Goals (explicitly out of scope in current build)

- No admin/recruiter-facing portal (only the student-facing flow exists).
- No password reset / email verification flow.
- No payment, subscription, or multi-tenant org support.
- No mobile app — web only (React + Vite).
- No role-based access control beyond "authenticated user" (every logged-in user has identical permissions).

## 5. User Stories & Acceptance Criteria

### 5.1 Authentication
- **As a new user**, I can register with name/email/password so that I get an account.
  - Password must satisfy: ≥8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (`validatePassword.js`, enforced client-side; server enforces a looser ≥6 char minimum).
  - Duplicate email is rejected.
  - On success I receive a JWT (7-day expiry) and land on `/dashboard`.
- **As a returning user**, I can log in with email/password and receive a JWT.
- **As a logged-in user**, my session persists via a token stored in `localStorage` and attached as `Authorization: Bearer <token>` on every API call.
- **As a logged-out user**, visiting `/dashboard` redirects me to `/login` (`ProtectedRoute`).

### 5.2 Profile Management
- **As a user**, I can view my profile (`GET /api/profile`): name, email, CGPA, grad year, GitHub/LinkedIn/portfolio URLs, target role.
- **As a user**, I can update my profile fields (`PUT /api/profile`).
- **As a user**, I can view the list of available target roles and their expected skills (`GET /api/profile/roles`).

### 5.3 Resume Upload & AI Analysis
- **As a user**, I can upload a PDF resume (≤5MB) which is stored on Cloudinary and referenced in Mongo (`POST /api/resume/upload`).
- **As a user**, I can trigger AI analysis of my uploaded resume (`POST /api/resume/analyze`), which:
  1. Downloads the PDF from its Cloudinary URL,
  2. Extracts text via `pdf-parse`,
  3. Sends a structured prompt to Gemini (`gemini-flash-latest`) requesting a strict JSON schema,
  4. Retries up to 3× with backoff on transient `503`/overload errors,
  5. Parses and persists `skills`, `strengths`, `weaknesses`, `suggestions`, `readinessScore` onto the Mongo document.
- **As a user**, if the AI service is overloaded, I see a clear "busy, retry shortly" message (`503`) rather than a generic failure.

### 5.4 Readiness Scoring
- **As a user**, I can see a composite readiness score (`GET /api/profile/readiness`) computed from:
  - Profile completeness (25%) — how many of 6 profile fields are filled.
  - Resume quality (35%) — derived from AI-extracted skills/strengths/suggestions counts and the AI's own readiness score.
  - Skill match (30%) — overlap between my resume skills and my target role's expected skills.
  - Experience bonus (10%) — flat bonus if I have a portfolio link or experience-signaling language in my strengths.
  - The computed score is written back to Mongo as `deterministicReadinessScore` for auditability against the AI's own score.

### 5.5 Company Eligibility
- **As a user**, I can check if I meet a specific company's bar (`GET /api/profile/eligibility?companyId=`): CGPA ≥ minimum, grad year ≥ minimum, and no missing required skills.

### 5.6 Recommendations & Skill Gap
- **As a user**, I can get a prioritized, linked list of skills I'm missing for my target role (`GET /api/profile/recommendations`), each with a learning resource URL and a High/Medium/Low priority.
- **As a user**, I can generate a persisted skill-gap report against a specific target role (`POST /api/profile/skill-gap`).

## 6. Functional Requirements Summary

| ID | Requirement | Endpoint |
|---|---|---|
| FR-1 | Register with validated credentials | `POST /api/auth/register` |
| FR-2 | Login and receive JWT | `POST /api/auth/login` |
| FR-3 | Read/update profile | `GET/PUT /api/profile` |
| FR-4 | List target roles | `GET /api/profile/roles` |
| FR-5 | Upload resume PDF to cloud storage | `POST /api/resume/upload` |
| FR-6 | AI-analyze resume | `POST /api/resume/analyze` |
| FR-7 | Compute weighted readiness score | `GET /api/profile/readiness` |
| FR-8 | Check company eligibility | `GET /api/profile/eligibility` |
| FR-9 | Generate resource-linked recommendations | `GET /api/profile/recommendations` |
| FR-10 | Generate persisted skill-gap report | `POST /api/profile/skill-gap` |
| FR-11 | Health check | `GET /api/health` |

## 7. Non-Functional Requirements

- **Security:** passwords hashed with bcrypt (10 salt rounds); JWT signed with server-only secret; all profile/resume routes gated behind `requireAuth` middleware; secrets isolated in `.env` (never hard-coded).
- **Reliability:** AI calls retry transient failures with exponential-ish backoff (3 attempts); server continues booting even if Postgres or Mongo is temporarily unreachable (logs a warning instead of crashing).
- **Usability:** inline password-strength checklist on registration; loading/disabled states on all async buttons (upload, analyze, login, register).
- **Data integrity:** file uploads restricted to PDF, 5MB max, via Multer + Cloudinary storage engine.

## 8. System Actors

- **Student (end user)** — the only human actor in the current build.
- **Gemini (Google Generative AI)** — external AI service for resume analysis.
- **Cloudinary** — external file storage for resume PDFs.
- **Postgres** — system of record for structured, relational data (users, roles, companies, eligibility).
- **MongoDB** — system of record for semi-structured, AI-derived data (resume analyses, recommendations, skill gaps).

## 9. Open Gaps / Recommended Next Iteration

1. Password-reset / email verification.
2. Server-side password policy should match the client's (currently client enforces 8+/mixed-case/number/special, server only enforces 6+).
3. Duplicate-email registration should return `409 Conflict` (currently `400`).
4. `GET /api/profile/recommendations` mutates state (creates a Mongo doc) — should be a `POST`, and should return `201`.
5. No pagination/history view for past resume analyses or recommendations (only "latest" is fetched).
6. No admin/company-management UI — companies and eligibility criteria must be seeded directly into Postgres.