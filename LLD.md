# Nexora
**Low-Level Design (LLD)**

---

## 1. Folder Structure
```
Nexora/
├── PRD.md
├── HLD.md
├── LLD.md
├── README.md
├── client/
│   └── src/
│       ├── components/
│       │   ├── AuthLayout.jsx
│       │   ├── AuthToggle.jsx
│       │   ├── PasswordInput.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── ResumeUpload.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Dashboard.jsx
│       ├── utils/
│       │   └── validatePassword.js
│       ├── api.js
│       └── App.jsx
└── server/
    ├── config/
    │   ├── postgres.js
    │   ├── mongo.js
    │   ├── cloudinary.js
    │   ├── upload.js
    │   ├── gemini.js
    │   └── schema.sql
    ├── controllers/
    │   ├── authController.js
    │   └── resumeController.js
    ├── middleware/
    │   ├── auth.js
    │   └── errorHandler.js
    ├── models/
    │   ├── ResumeAnalysis.js
    │   ├── SkillGap.js
    │   └── Recommendation.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── profileRoutes.js
    │   └── resumeRoutes.js
    └── server.js
```

## 2. PostgreSQL Schema

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

**Relationships:** `users.target_role_id → target_roles.id`; `eligibility_criteria.company_id → companies.id`. Both are enforced foreign keys, not free-text duplication — a company rename or criteria correction happens in one place rather than across many rows.

**Seed data:** 4 target roles (Frontend/Backend/Full Stack Developer, Data Analyst), 5 companies, matching eligibility rows.

**Eligibility JOIN:**
```sql
SELECT u.name, u.cgpa, u.grad_year, ec.min_cgpa, ec.required_skills
FROM users u
JOIN eligibility_criteria ec ON ec.company_id = $1
WHERE u.id = $2;
```

## 3. MongoDB Collections

```js
// resumeanalyses
{
  _id: ObjectId,
  userId: Number,        // Postgres users.id — plain number, not an ObjectId ref,
                          // since Postgres and Mongo cannot natively cross-reference
  resumeUrl: String,      // Cloudinary URL, set at upload time
  extractedSkills: [String],
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  readinessScore: Number, // 0–100
  createdAt: Date
}

// skillgaps
{
  _id: ObjectId,
  userId: Number,
  targetRole: String,
  missingSkills: [String],
  priority: Map<String, String>  // e.g. { "Docker": "High" }
}

// recommendations
{
  _id: ObjectId,
  userId: Number,
  items: [{ skill: String, priority: "High"|"Medium"|"Low", resourceUrl: String }]
}
```
`priority` in `Recommendation.items` uses a Mongoose `enum` constraint (`High`/`Medium`/`Low` only) — schema-level validation enforced in the application layer even though MongoDB itself does not require a fixed schema.

## 4. Backend Modules

### 4.1 Auth Module
**`POST /api/auth/register`**
```
request → validate fields (400 if missing/weak password)
  → check email uniqueness (cheap check before expensive hash)
  → bcrypt.hash(password, 10)
  → INSERT INTO users ... RETURNING id, name, email, created_at
  → jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' })
  → 201 { user, token }
```

**`POST /api/auth/login`**
```
request → SELECT user by email
  → bcrypt.compare(password, password_hash)
  → same generic 401 "Invalid email or password" whether the email
    doesn't exist or the password is wrong (prevents user enumeration)
  → jwt.sign(...) on success
  → 200 { user, token }
```

### 4.2 Profile Module
**`GET /api/profile`** — protected by `requireAuth`; scoped to `req.user.id` from the verified JWT (never a client-supplied ID), so a user can only ever read their own row.
**`PUT /api/profile`** — same scoping; uses `UPDATE ... RETURNING ...` to return the updated row in a single round trip.

### 4.3 Resume Module
```
POST /api/resume/upload  (requireAuth, multer + CloudinaryStorage)
  → multer streams the file directly to Cloudinary (never touches local disk)
  → ResumeAnalysis.create({ userId, resumeUrl })   [Mongo CREATE]
  → 201 { resumeUrl, resumeId }

POST /api/resume/analyze  (requireAuth)
  → ResumeAnalysis.findById(resumeId)               [Mongo READ]
  → fetch(resumeUrl) → arrayBuffer → Buffer
  → new PDFParse({ data: buffer }).getText()         (pdf-parse v2 API)
  → build structured-output prompt (Section 5)
  → genAI.getGenerativeModel({ model: "gemini-flash-latest" }).generateContent(prompt)
  → strip markdown fences, JSON.parse response (502 AppError on failure)
  → resumeDoc.<fields> = analysisData.<fields>; resumeDoc.save()   [Mongo UPDATE]
  → 200 { analysis }
```

## 5. Gemini Prompt Design

```
You are a career advisor analyzing a resume for a student preparing for
internships or entry-level jobs.

Analyze the following resume text and respond with ONLY a valid JSON object,
no other text, matching this exact structure:

{
  "skills": ["array of technical and soft skills found in the resume"],
  "strengths": ["array of 2-4 specific strengths, referencing actual resume content"],
  "weaknesses": ["array of 2-4 specific weaknesses or gaps"],
  "suggestions": ["array of 2-4 specific, actionable improvement suggestions"],
  "readinessScore": <a number from 0 to 100>
}

Resume text:
"""
{resumeText}
"""
```

**Design rationale:**
- A role/persona instruction ("You are a career advisor...") narrows the model toward relevant, focused output.
- "Respond with ONLY a valid JSON object, no other text" is the single most load-bearing line — without it, conversational wrapper text (e.g. "Sure, here's the analysis:") breaks `JSON.parse` on the response.
- An explicit field-by-field schema removes ambiguity about key names, so the backend can reliably access `result.skills`, `result.readinessScore`, etc.
- "Referencing actual resume content" pushes the model toward grounded, specific feedback rather than generic advice — verified in testing (e.g., the model correctly cited missing dates and missing metrics from an actual test resume, not boilerplate advice).

**Response parsing (defensive):**
```js
const cleanedText = responseText.replace(/```json|```/g, "").trim();
analysisData = JSON.parse(cleanedText); // wrapped in try/catch → 502 AppError on failure
```

## 6. Career Readiness Score — Current vs. Planned

**Currently:** `readinessScore` is returned directly by Gemini as part of its structured response, based on the model's holistic judgment of the resume text — not computed by a separate deterministic formula in application code.

**Planned enhancement, documented here for design continuity:** a deterministic, explainable weighted formula as a secondary/complementary score:

| Component | Weight |
|---|---|
| Profile completeness | 25% |
| Resume quality (from AI analysis) | 35% |
| Skill match (vs. target role) | 30% |
| Experience/project bonus | 10% |

This is included as the intended design; it is not yet implemented in `resumeController.js` and should not be presented as complete until built.

## 7. Skill Gap & Eligibility Algorithms (design, in progress)

**Skill gap:** convert the user's `extractedSkills` (from Mongo) and the target role's `expected_skills` (from Postgres) into comparable sets; the difference (`expected − extracted`) is the missing-skills list; priority assigned per skill via a static lookup table.

**Eligibility:** a Postgres JOIN between `users` and `eligibility_criteria` for the selected company; compares `cgpa`/`grad_year`/skills against `min_cgpa`/`min_grad_year`/`required_skills`; returns eligible/not-eligible plus the specific unmet criteria.

## 8. Error Handling Middleware

```js
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
}
```
`errorHandler` is registered last, after every route — Express only invokes error-handling middleware (4-argument functions) when `next(err)` is called, so placement matters. Every controller function is wrapped in `asyncHandler`, ensuring thrown errors inside `async` functions reach this handler instead of becoming unhandled promise rejections.

**Response contract:** `{ "error": "<message>" }` on failure, paired with the correct HTTP status (400/401/404/502/500 as appropriate) — consistent across every endpoint.

## 9. Environment Variables
```
PORT=5000
DATABASE_URL=              # Postgres connection string (Neon)
MONGO_URI=                 # MongoDB connection string (Atlas)
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GEMINI_API_KEY=
```
`.env` is git-ignored; `.env.example` documents required keys with no values, committed to the repo.

## 10. Known Engineering Decisions Worth Noting
- **Graceful degradation over fail-fast** for database connections — a deliberate tradeoff, tested against a real outage during development, not merely theoretical.
- **`pdf-parse` v2 API** (`PDFParse` class + `.getText()`) used instead of the older `pdf(buffer)` function-call pattern found in older tutorials — confirmed by inspecting the actually-installed package version rather than assuming stale documentation applied.
- **Gemini model alias (`gemini-flash-latest`)** used instead of a dated model name, specifically to avoid repeat breakage from model deprecation — informed directly by hitting two dated-model 404s during development.