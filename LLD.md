# Low-Level Design (LLD)
## Nexora — Resume Readiness & Skill-Gap Platform

**Version:** 1.0
**Status:** Reflects the current, implemented code

---

## 1. Database Design

### 1.1 PostgreSQL — Relational Schema

```sql
CREATE TABLE target_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  expected_skills TEXT[]
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  cgpa DECIMAL(3,2),
  grad_year INT,
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  target_role_id INT REFERENCES target_roles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE eligibility_criteria (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  min_cgpa DECIMAL(3,2),
  min_grad_year INT,
  required_skills TEXT[]
);
```

**ER relationships:**
```
target_roles (1) ──< (many) users            [users.target_role_id → target_roles.id]
companies    (1) ──< (many) eligibility_criteria  [eligibility_criteria.company_id → companies.id]
```

**Design notes:**
- `password_hash` never stores plaintext; `email` is `UNIQUE NOT NULL` (DB-level constraint backing the app-level duplicate check).
- `expected_skills` / `required_skills` use Postgres `TEXT[]` rather than a join table — a deliberate simplicity tradeoff (fine at this scale; a `role_skills` join table would be the "textbook-normalized" alternative).

### 1.2 MongoDB — Document Schemas (Mongoose)

**`ResumeAnalysis`**
```js
{
  userId: Number,              // FK-by-convention → Postgres users.id
  resumeUrl: String,           // Cloudinary URL
  extractedSkills: [String],
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  readinessScore: Number,              // 0–100, from Gemini
  deterministicReadinessScore: Number, // 0–100, computed server-side
  createdAt: Date (default: now)
}
```

**`Recommendation`**
```js
{
  userId: Number,
  items: [{ skill: String, priority: Enum["High","Medium","Low"], resourceUrl: String }],
  createdAt: Date (default: now)
}
```

**`SkillGap`**
```js
{
  userId: Number,
  targetRole: String,
  missingSkills: [String],
  priority: Map<String, String>,   // e.g. { "Docker": "High" }
  createdAt: Date (default: now)
}
```

## 2. API Contract (Detailed)

### 2.1 `POST /api/auth/register`
- **Body:** `{ name, email, password }`
- **Validation:** all 3 required (400); `password.length >= 6` (400); email not already in `users` (400 — *see PRD gap: should be 409*).
- **Logic:** `bcrypt.hash(password, 10)` → `INSERT INTO users (...) RETURNING id, name, email, created_at` → `jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "7d" })`.
- **Response `201`:** `{ user: {id,name,email,created_at}, token }`

### 2.2 `POST /api/auth/login`
- **Body:** `{ email, password }`
- **Logic:** look up by email → `bcrypt.compare` → same JWT shape as register.
- **Errors:** `400` missing fields; `401` invalid email/password (identical message both cases — anti-enumeration).
- **Response `200`:** `{ user: {id,name,email}, token }`

### 2.3 `GET /api/profile` *(auth required)*
- **Response `200`:** full profile row (`id,name,email,cgpa,grad_year,github_url,linkedin_url,portfolio_url,target_role_id,created_at`).
- **Errors:** `404` if user row missing (edge case — deleted user with valid token).

### 2.4 `PUT /api/profile` *(auth required)*
- **Body:** `{ cgpa, grad_year, github_url, linkedin_url, portfolio_url, target_role_id }`
- **Logic:** unconditional `UPDATE ... WHERE id = $7 RETURNING ...` (no partial-patch merge — all 6 fields are overwritten every call, so the frontend must send the full object).
- **Response `200`:** updated row.

### 2.5 `GET /api/profile/roles` *(auth required)*
- **Response `200`:** `{ roles: [{id, name, expected_skills}] }`

### 2.6 `POST /api/resume/upload` *(auth required, multipart)*
- **Middleware chain:** `requireAuth` → `upload.single("resume")` (Multer + CloudinaryStorage, PDF-only, 5MB cap) → `uploadResume` controller.
- **Logic:** `req.file.path` = Cloudinary URL → `ResumeAnalysis.create({ userId: req.user.id, resumeUrl })`.
- **Response `201`:** `{ message, resumeUrl, resumeId }`
- **Errors:** `400` if no file attached.

### 2.7 `POST /api/resume/analyze` *(auth required)*
- **Body:** `{ resumeId }`
- **Logic (see sequence diagram §3):** fetch Mongo doc → fetch PDF bytes → `pdf-parse` → build prompt → `generateWithRetry(model, prompt, 3)` → parse JSON → write 5 fields back onto the doc → `save()`.
- **Errors:** `400` missing `resumeId`; `404` resume not found; `503` AI temporarily overloaded (after 3 attempts); `502` any other AI failure, or AI returned non-JSON/malformed JSON.
- **Response `200`:** `{ message, analysis: <full ResumeAnalysis doc> }`

**`generateWithRetry` — closure & retry logic:**
```js
async function generateWithRetry(model, prompt, maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      lastError = err;
      const isTemporary503 = String(err?.message||"").includes("503") || ...includes("high demand");
      if (!isTemporary503 || attempt === maxAttempts) break;
      await wait(1200 * attempt);   // 1.2s, 2.4s backoff
    }
  }
  throw lastError;
}
```
`wait(ms)` is a closure over `resolve` inside a `Promise` — classic promisified `setTimeout`.

### 2.8 `GET /api/profile/readiness` *(auth required)*
- **Logic:**
  1. Load user row from Postgres.
  2. Load latest `ResumeAnalysis` from Mongo (`sort({ createdAt: -1 })`).
  3. Load `expected_skills` for the user's `target_role_id` (if set).
  4. `calculateReadiness(user, analysis, expectedSkills)`:
     - `profileCompleteness` = filled-fields / 6 fields × 100.
     - `resumeQuality` = `min(100, round((skills*8 + strengths*10 + suggestions*8 + (5-min(weaknesses,5))*4 + aiScore) / 4))`.
     - `skillMatch` = matched-expected-skills / total-expected-skills × 100 (case-insensitive, trimmed match via `normalizeSkill`).
     - `experienceBonus` = 10 if `github_url || portfolio_url || linkedin_url` OR a strength string matches `/experience|project|internship|leadership|work/i`, else 0.
     - `score` = `round(profileCompleteness*0.25 + resumeQuality*0.35 + skillMatch*0.30 + experienceBonus*0.10)`.
  5. Side effect: writes `score` back onto the Mongo doc as `deterministicReadinessScore`.
- **Response `200`:** `{ readiness: {...breakdown, score}, profile: user, latestAnalysis }`

### 2.9 `GET /api/profile/eligibility?companyId=` *(auth required)*
- **Logic:** join `eligibility_criteria` + `companies` on `company_id` → load user → load latest analysis skills → compute `meetsCgpa`, `meetsGradYear`, `missingSkills` (set difference) → `eligible = meetsCgpa && meetsGradYear && missingSkills.length === 0`.
- **Errors:** `400` no `companyId`; `404` no criteria for that company / user not found.
- **Response `200`:** `{ company, eligible, meetsCgpa, meetsGradYear, missingSkills, requiredSkills, minimumCgpa, minimumGradYear }`

### 2.10 `GET /api/profile/recommendations` *(auth required)*
- **Logic:** load user's `target_role_id` → `expected_skills` → latest analysis skills → `missingSkills` (set difference) → map each to `RESOURCE_MAP[skill]` (static lookup table of URL + priority) or fallback to a Google search URL + index-based priority (`getPriorityByIndex`: index<3→High, <6→Medium, else Low) → persist as a new `Recommendation` doc.
- **Response `200`:** `{ message, items: [{skill, priority, resourceUrl}] }`
- *(Note: creates a resource via GET — flagged in PRD/HLD as a design gap; should be POST + 201.)*

### 2.11 `POST /api/profile/skill-gap` *(auth required)*
- **Body:** `{ targetRoleId? }` (optional — falls back to user's stored `target_role_id`)
- **Logic:** resolve role → require a non-empty latest analysis (`400` if none) → compute `missingSkills` + per-skill `priority` map → `SkillGap.create(...)`.
- **Response `200`:** `{ message, skillGap }`

### 2.12 `GET /api/health`
- **Response `200`:** `{ status: "ok" }` — no auth, used for uptime checks.

## 3. Sequence Diagram — Resume Upload → Analysis → Readiness

```
User          Frontend             Backend                Cloudinary   Mongo    Postgres   Gemini
 |  select PDF   |                     |                        |         |         |          |
 |──────────────▶|                     |                        |         |         |          |
 |               | POST /resume/upload |                        |         |         |          |
 |               |────────────────────▶|                        |         |         |          |
 |               |                     | stream file             |         |         |          |
 |               |                     |───────────────────────▶|         |         |          |
 |               |                     |◀── url ────────────────|         |         |          |
 |               |                     | create ResumeAnalysis  |         |         |          |
 |               |                     |────────────────────────────────▶|         |          |
 |               |◀── 201 {resumeId} ──|                        |         |         |          |
 |               | POST /resume/analyze|                        |         |         |          |
 |               |────────────────────▶|                        |         |         |          |
 |               |                     | fetch PDF bytes        |         |         |          |
 |               |                     |───────────────────────▶|         |         |          |
 |               |                     | pdf-parse → text        |         |         |          |
 |               |                     | build prompt            |         |         |          |
 |               |                     | generateContent (retry×3)|        |         |          |
 |               |                     |──────────────────────────────────────────────────────▶|
 |               |                     |◀───────────────────────────── JSON text ───────────────|
 |               |                     | parse + save doc        |         |         |          |
 |               |                     |────────────────────────────────▶|         |          |
 |               |◀── 200 {analysis} ──|                        |         |         |          |
 |◀── render ────|                     |                        |         |         |          |
 |               | GET /profile/readiness                       |         |         |          |
 |               |────────────────────▶|  read user              |         |         |          |
 |               |                     |──────────────────────────────────────────▶|          |
 |               |                     |  read latest analysis   |         |         |          |
 |               |                     |────────────────────────────────▶|         |          |
 |               |                     |  compute weighted score |         |         |          |
 |               |◀── 200 {readiness}──|                        |         |         |          |
```

## 4. Middleware Chain (per protected request)

```
Incoming request
   │
   ▼
cors()                     — allow cross-origin (dev-open policy)
   │
   ▼
express.json()             — parse JSON body
   │
   ▼
requireAuth                — verify Bearer JWT → req.user = { id, email } | 401
   │
   ▼
(route-specific middleware) — e.g. upload.single("resume") for resume routes
   │
   ▼
asyncHandler(controller)   — run controller, forward rejected promises
   │
   ▼
[on error] errorHandler    — catch-all, format {error: message}, correct status
```

## 5. Frontend Component Design

```
main.jsx
 └─ BrowserRouter
     └─ App.jsx (Routes)
         ├─ /            → redirect → /login
         ├─ /login       → Login.jsx
         │                  ├─ AuthLayout (branding shell)
         │                  ├─ AuthToggle (login/register tab links)
         │                  └─ PasswordInput (show/hide toggle, local useState)
         ├─ /register    → Register.jsx
         │                  ├─ validatePassword.js (pure fn: 5 boolean checks)
         │                  └─ live checklist UI driven by that pure fn
         └─ /dashboard   → ProtectedRoute → Dashboard.jsx
                             ├─ useEffect(() => fetchProfile(), [])   — load on mount
                             ├─ useState: profile, analysis, error, loading
                             └─ ResumeUpload.jsx
                                  ├─ useState: file, uploading, analyzing, error
                                  └─ handleSubmit(): uploadResume() → apiRequest('/resume/analyze') → onAnalysisComplete(analysis) [lifts state to Dashboard]
```

**Key LLD-level patterns:**
- **Controlled inputs** everywhere (`value` + `onChange` on every field).
- **Prop-drilling via callback**, not context: `ResumeUpload` receives `onAnalysisComplete` from `Dashboard` and calls it to lift the analysis result up — a deliberate, appropriately-scoped choice (no need for Context/Redux at this size).
- **`apiRequest` closure-based auth injection:** every call re-reads `localStorage.getItem("token")` at call time (not cached in a variable), so a token added *after* module load (e.g., right after login) is picked up correctly on the very next call.

## 6. Error Handling Matrix

| Layer | Mechanism | Example |
|---|---|---|
| Client form validation | Local `useState` + pure functions | `validatePassword.js` |
| Client API errors | `apiRequest` throws `Error(data.error)` on `!res.ok`; caught in each page's `try/catch`, shown via `error` state | Login/Register/ResumeUpload |
| Server validation errors | `throw new AppError(msg, 400)` | missing fields, no file |
| Server auth errors | `AppError(msg, 401)` from `requireAuth` | bad/missing/expired JWT |
| Server not-found errors | `AppError(msg, 404)` | user/resume/company not found |
| Server upstream errors | `AppError(msg, 502/503)` | Gemini failure/overload |
| Uncaught/unexpected errors | Global `errorHandler` → `500` + logged via `console.error` | any unthrown exception |

## 7. Security Details

- **Password storage:** `bcrypt` with `SALT_ROUNDS = 10`.
- **Token:** `jsonwebtoken`, `HS256` default, payload `{ id, email }`, `expiresIn: "7d"`, secret from `process.env.JWT_SECRET`.
- **Authorization boundary:** every Postgres/Mongo query in protected routes is scoped by `req.user.id` extracted from the verified JWT — a user cannot read/write another user's profile, resume, or recommendations by ID manipulation (no user-suppliable `userId` params exist on any protected route).
- **File upload constraints:** MIME/extension restricted to PDF, 5MB hard cap, streamed directly to Cloudinary (never written to local disk, so no local-path traversal surface).

## 8. Known LLD-Level Improvement Backlog

1. `PUT /api/profile` does a full overwrite, not a `COALESCE`/partial-patch — a frontend bug that omits a field will null it out.
2. `POST /api/profile/skill-gap` and `GET /api/profile/recommendations` should return `201` (resource creation), and the latter should be a `POST`.
3. No index explicitly defined on `ResumeAnalysis.userId` / `createdAt` for the `sort({createdAt:-1})` queries — fine at current scale, worth adding as data grows.
4. `RESOURCE_MAP` in `profileRoutes.js` is a static in-file object — should move to Postgres/Mongo config table if it needs to grow past a handful of skills.