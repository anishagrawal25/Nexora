# Nexora — AI Career Readiness & Placement Platform

> **One score. Every gap. What to learn next.**  
> An AI-powered full-stack career readiness platform that evaluates resumes, computes deterministic readiness scores, pinpoints role-specific skill gaps, matches company hiring criteria, and delivers curated learning roadmaps.

---

## 🌟 Overview & Architecture

Nexora bridges the gap between academic preparation and industry placement by pairing large language model analysis (Google Gemini) with deterministic mathematical readiness scoring and automated recruiter eligibility evaluation.

### Tech Stack
- **Backend**: Node.js, Express.js (CommonJS), JWT authentication with bcrypt
- **Databases**:
  - **PostgreSQL** (via Neon / `@neondatabase/serverless` & `pg`): User accounts, target roles benchmarks, company directories, eligibility criteria.
  - **MongoDB** (via Atlas & Mongoose): Semi-structured AI resume analyses, skill gap documents, and learning recommendations.
- **AI Engine**: Google Gemini API (`gemini-flash-latest`) for structured resume extraction (technical skills, strengths, weaknesses, actionable suggestions, and quality scores).
- **File Storage**: Cloudinary (via `multer` + `multer-storage-cloudinary`).
- **PDF Extraction**: `pdf-parse` v2 stream buffer parser.
- **Frontend**: React 19 (Vite), React Router v7, Tailwind CSS v4, Lucide Icons.
- **Design System**: Warm editorial theme (`#FBFAF6` canvas, Fraunces serif headlines, IBM Plex Mono tracked labels, `#1F6F5C` forest green accents, `#12181B` ink text).

---

## 🚀 Key Features

1. **Public Landing Page (`/`)**:
   - Hero section with Fraunces serif headlines and IBM Plex Mono badges.
   - Interactive 4-step workflow explaining the evaluation pipeline.
   - Core capability matrix with feature cards.

2. **Secure Authentication & Profile Management (`/login`, `/register`, `/dashboard`)**:
   - JWT-based auth with salted bcrypt password hashing.
   - Real-time profile management: CGPA, graduation batch, target role selection, GitHub, LinkedIn, and portfolio links.

3. **AI Resume Analysis**:
   - PDF upload directly to Cloudinary storage.
   - Gemini Flash extraction returning verified skills, strengths, growth areas, and actionable advice.

4. **Deterministic Readiness Scoring**:
   - Mathematical formula:  
     $$\text{Readiness} = \text{Completeness} \times 0.25 + \text{Quality} \times 0.35 + \text{SkillMatch} \times 0.30 + \text{ExperienceBonus} \times 0.10$$
   - Visual breakdown progress bars with transparent weights.

5. **Role-Specific Skill Gap Detection**:
   - Compares candidate skills against target role benchmarks (Frontend, Backend, Full Stack, Data Analyst).
   - Classifies missing requirements by recruitment priority (`High`, `Medium`, `Low`).

6. **Company Eligibility Checker**:
   - Evaluates academic cutoffs (minimum CGPA, graduation year) and mandatory skill filters for top tech companies (Google, Microsoft, TCS, Infosys, Startups).
   - Instant visual feedback: `ELIGIBLE TO APPLY` vs `NOT CURRENTLY ELIGIBLE` with granular criteria status.

7. **Curated Learning Roadmap**:
   - Direct, vetted documentation and tutorial links for every missing skill to accelerate placement readiness.

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` — Register a new student account (`{ name, email, password }`).
- `POST /api/auth/login` — Authenticate and receive JWT token (`{ email, password }`).

### Profile & Roles
- `GET /api/profile` — Fetch current user's profile details.
- `PUT /api/profile` — Update candidate profile fields (CGPA, grad year, links, target role).
- `GET /api/profile/roles` — Retrieve all supported target roles and benchmark skills.
- `GET /api/profile/companies` — Retrieve available hiring companies.

### Readiness & Assessment
- `GET /api/profile/readiness` — Calculate deterministic readiness score breakdown.
- `POST /api/profile/skill-gap` — Compute role-specific missing skills and priority map.
- `GET /api/profile/skill-gap` — Retrieve latest computed skill gap document.
- `GET /api/profile/eligibility?companyId=:id` — Check candidate eligibility for a company.
- `GET /api/profile/recommendations` — Generate curated learning links for missing skills.

### Resume
- `POST /api/resume/upload` — Upload PDF resume (Multipart form-data).
- `POST /api/resume/analyze` — Trigger AI extraction via Gemini (`{ resumeId }`).

---

## 🛠️ Local Development & Testing

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
```bash
cd server
npm install
npm test          # Run automated unit tests for pure scoring & validation functions
npm run dev       # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run build     # Verify production bundle build
npm run dev       # Starts Vite dev server on http://localhost:5173
```

---

## 🚢 Deployment Guide

### Backend Deployment (Render / Railway)
1. Link your GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Set root directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Configure Environment Variables:
   - `DATABASE_URL` (Neon PostgreSQL connection string)
   - `MONGO_URI` (MongoDB Atlas URI)
   - `JWT_SECRET` (Secure 256-bit secret)
   - `GEMINI_API_KEY` (Google Generative AI key)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Frontend Deployment (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Set Framework Preset to `Vite`.
4. Environment Variable:
   - `VITE_API_URL` = `https://<your-backend-render-url>/api`
5. Deploy. `client/vercel.json` ensures client-side routes (`/login`, `/register`, `/dashboard`) resolve correctly.
