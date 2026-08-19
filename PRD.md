# Nexora
**Product Requirements Document (PRD)**

---

## Table of Contents
1. Executive Summary
2. Product Vision
3. Problem Statement
4. Target Audience & Personas
5. Goals
6. Non-Goals
7. Product Scope
8. End-to-End User Journey
9. Functional Requirements
10. User Stories
11. Acceptance Criteria
12. Non-Functional Requirements
13. Success Metrics
14. Risks & Mitigations
15. Delivery Roadmap
16. Assumptions
17. Open Questions

---

## 1. Executive Summary
Nexora is an AI-powered career readiness platform that helps college students and recent graduates evaluate how prepared they are for internships and placements. Instead of visiting separate tools for resume review, skill analysis, company eligibility checks, and career planning, students get all of these insights through one personalized dashboard.

Nexora does not attempt to become another learning platform. It acts as a decision-support system that tells a student what to improve next — not how to learn it.

## 2. Product Vision
Create a single platform where every student can confidently answer:

> "Am I ready for internships or placements, and what should I improve next?"

## 3. Problem Statement

### Current Landscape
Students preparing for internships and placements typically stitch together:
- LinkedIn (networking)
- Generic resume checkers (resume feedback only)
- ChatGPT (no persistent profile or structured tracking)
- Coursera/Udemy (teaches content but doesn't prioritize what to learn)
- Job portals (show openings, not personal readiness)
- Personal spreadsheets (manual, unstructured tracking)

### Why This Is Incomplete
| Existing Tool | Limitation |
|---|---|
| LinkedIn | Networking only, no readiness insight |
| ChatGPT | No persistent profile, no structured output |
| Resume checkers | Resume feedback in isolation, no skill-gap or eligibility context |
| Learning platforms | Teach content but don't tell you *what* to prioritize |
| Job portals | List openings but don't assess personal fit |

Nexora connects resume analysis, skill gap identification, and eligibility checking into one continuous workflow, rather than solving one isolated piece.

## 4. Target Audience & Personas

**Primary users:** undergraduate students (all years), final-year placement candidates, recent graduates seeking entry-level roles.

**Persona 1 — Aarav, First-Year Student**
Goal: build the right skills early for future internships.
Pain point: doesn't know where to start or which skills matter most.
How Nexora helps: resume analysis surfaces skill gaps early; suggestions are prioritized, not just listed.

**Persona 2 — Priya, Third-Year Placement Candidate**
Goal: crack campus placements.
Pain point: doesn't know if she's eligible for specific companies, or how strong her resume actually is.
How Nexora helps: AI resume analysis with a readiness score; company eligibility checking.

**Persona 3 — Final-Year Graduate**
Goal: apply to entry-level roles with confidence.
Pain point: uncertain whether their resume communicates their skills effectively.
How Nexora helps: specific, content-grounded AI feedback (not generic advice) and a trackable readiness score.

## 5. Goals

**Business goals:** demonstrate a complete, coherent career-readiness workflow; show depth across full-stack engineering, two database paradigms, and real AI integration.

**User goals:** upload a resume and get AI feedback; see missing skills against a target role; check eligibility against real companies; track improvement over time.

## 6. Non-Goals
Nexora explicitly does **not** include:
- Hosting video courses or coding challenges
- Live interview scheduling
- A job application/tracking system
- Social networking or chat features between users
- Guarantees of interview or hiring outcomes
- Claims of proprietary/authoritative knowledge of any company's actual hiring bar — eligibility checks use platform-seeded, illustrative criteria, presented as indicative only

## 7. Product Scope

**In scope:** authentication, student profile, resume upload, AI resume analysis, career readiness score, skill gap analysis, learning recommendations, company eligibility checker, unified dashboard.

**Out of scope:** course hosting, recruiter-facing portal, payments, push notifications, interview scheduling.

## 8. End-to-End User Journey
Register → Log in → Complete profile → Upload resume → AI analyzes resume → Skill gap calculated against target role → Career readiness score displayed → Learning recommendations shown → Student checks company eligibility → Dashboard aggregates everything

## 9. Functional Requirements

### 9.1 Authentication
**Register:** user submits name, email, password. System validates input, rejects duplicate emails, hashes the password (bcrypt), stores the account, issues a JWT.
**Login:** user submits email, password. System verifies credentials against the stored hash, issues a JWT on success, returns a generic "invalid email or password" error on failure (prevents user enumeration).

### 9.2 Student Profile
User can view and edit: name, email (read-only after registration), CGPA, graduation year, GitHub/LinkedIn/portfolio links, target role.

### 9.3 Resume Upload
PDF only, 5MB maximum, uploaded to Cloudinary (not stored on the app server), with the resulting URL persisted against the user's resume analysis record.

### 9.4 AI Resume Analysis
**Input:** plain text extracted from the uploaded PDF.
**Output (actual response shape):**
```json
{
  "skills": ["React", "Node.js", "MongoDB"],
  "strengths": ["Strong evidence of full-stack project work"],
  "weaknesses": ["No quantified outcomes in project bullet points"],
  "suggestions": ["Add metrics such as test coverage % or performance gains"],
  "readinessScore": 65
}
```
The AI model determines `readinessScore` holistically as part of its structured response, based on resume completeness, specificity, and relevance.

### 9.5 Career Readiness Score
A 0–100 indicator returned as part of the AI analysis response, presented as an internal, platform-specific indicator — not an industry-standard or guaranteed metric.

### 9.6 Skill Gap Analysis
Student selects a target role (Frontend / Backend / Full Stack / Data Analyst). System compares the skills extracted from their resume against that role's `expected_skills` (stored in Postgres), and surfaces the difference with a priority label (High/Medium/Low).

### 9.7 Learning Recommendations
For each missing skill, the platform surfaces a priority and a link to an external resource — it does not host or teach the content itself.

### 9.8 Company Eligibility Checker
Student selects a company. System compares their CGPA, graduation year, and skills against that company's `eligibility_criteria` row (Postgres, via a JOIN) and returns Eligible / Not Eligible with the specific missing requirements listed.

### 9.9 Dashboard
Displays: profile summary, resume upload/analysis panel, readiness score, skills/strengths/weaknesses/suggestions from the latest analysis, skill gap panel, eligibility panel.

## 10. User Stories
- As a student, I want to register so that I can access my dashboard.
- As a student, I want to log in so that my data stays private and secure.
- As a student, I want to upload my resume so that AI can analyze it and tell me what to improve.
- As a student, I want to see my extracted skills and readiness score so I know where I stand today.
- As a student, I want to compare my skills against a target role so I know what to learn next.
- As a student, I want to check a company's eligibility criteria so I can apply with realistic expectations.

## 11. Acceptance Criteria

| Feature | Criteria |
|---|---|
| Register | Valid email accepted; password hashed before storage; duplicate email rejected with 400 |
| Login | Valid credentials return a JWT with 200; invalid credentials return 401 with a generic message |
| Profile | Authenticated user can view and update their own fields only; changes persist in Postgres |
| Resume upload | Only PDFs up to 5MB accepted; a Cloudinary URL is returned and persisted |
| AI analysis | Returns a parsed JSON object matching the defined schema; malformed AI output returns a 502, not a crash |
| Dashboard | Loads without crashing for a logged-in user; redirects to login if unauthenticated |

## 12. Non-Functional Requirements

**Security:** bcrypt password hashing; JWT-based route protection; secrets in environment variables, never committed; parameterized SQL queries (no string concatenation).

**Reliability:** centralized error handling with consistent response shapes; databases fail gracefully (server continues running, logs a warning) rather than crashing the whole app on a single dependency outage.

**Performance:** stateless API design allows horizontal scaling; Postgres used for small, indexable relational lookups; Mongo used for variable-shaped AI output.

**Usability:** responsive layout; clear loading and error states, especially around the AI call, which has real, user-visible latency.

## 13. Success Metrics
Functional correctness — each mandatory Project Score concept demonstrably backed by working, testable code — matters more here than traffic/scale metrics, given the academic context. Practically: successful register/login rate in testing, successful resume upload + analysis completion rate, and readiness score displayed correctly on the dashboard.

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI API downtime or malformed response | Try/catch around JSON parsing; returns 502 with a clear error rather than crashing; frontend shows a retry-friendly error state |
| Upload failure (wrong type/size) | Server-side validation via multer before the file ever reaches Cloudinary |
| Database outage | Graceful degradation — server logs a warning and continues running rather than crashing entirely (tested in practice against a real network outage during development) |
| JWT expiration | User is prompted to log in again; no silent failure |
| LLM model deprecation | Using a model *alias* (`gemini-flash-latest`) rather than a dated model name, after encountering two deprecated dated models during development |

## 15. Delivery Roadmap

**Delivered:** authentication, profile CRUD, PostgreSQL schema with seed data, MongoDB schemas, resume upload via Cloudinary, AI resume analysis via Gemini with structured JSON output, styled and tested frontend for auth + dashboard + resume flow.

**In progress:** skill gap comparison, career-readiness score formula, company eligibility checker, learning recommendations, unified dashboard integrating all panels, deployment.

**Planned (post-MVP):** goal-based onboarding (internship vs. full-time), application tracker, resume version history, mock interview preparation, admin analytics dashboard.

## 16. Assumptions
- Students upload resumes as PDF text (not scanned images requiring OCR).
- A stable internet connection is available for AI/API calls.
- Gemini reliably returns valid or near-valid JSON when explicitly instructed to (defensive parsing handles the edge cases where it doesn't).
- Company eligibility criteria are platform-seeded/illustrative, not sourced from live company data feeds.

## 17. Open Questions
- Should a user be able to upload and compare multiple resume versions over time?
- Should skill-gap recommendations become personalized based on resume history rather than a single static mapping?
- Should college mentors/placement coordinators get a read-only view of aggregate student readiness?

These are intentionally deferred and do not block the core product.