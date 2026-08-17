# Nexora

**Product Requirements Document (PRD)**

---

# Table of Contents

1. Executive Summary
2. Product Vision
3. Problem Statement
4. Target Audience
5. User Personas
6. Goals
7. Non-Goals
8. Market Gap
9. Product Scope
10. User Journey
11. Functional Requirements
12. Feature Specifications
13. User Stories
14. Acceptance Criteria
15. Non-Functional Requirements
16. Success Metrics
17. Risks
18. Future Roadmap
19. Assumptions
20. Open Questions

---

# 1. Executive Summary

The Career Readiness Platform is an AI-powered web application designed to help college students evaluate how prepared they are for internships and placements.

Instead of visiting multiple websites for resume reviews, skill analysis, company eligibility checks, and career planning, students receive all these insights through one personalized dashboard.

The platform does not attempt to become another learning platform. Instead, it acts as a decision-support system that tells students what to improve next.

---

# 2. Product Vision

Create a single platform where every student can confidently answer:

> "Am I ready for internships or placements, and what should I improve next?"

The product focuses on guidance rather than teaching.

---

# 3. Problem Statement

Students preparing for placements face several challenges.

## Current Problems

Students typically use:

- LinkedIn
- Resume checkers
- ChatGPT
- Coursera
- Job portals
- Personal spreadsheets

This creates several issues:

- Information is scattered.
- Students don't know which skill matters most.
- Resume feedback is inconsistent.
- Company eligibility is checked manually.
- Progress tracking becomes difficult.

## Why Existing Solutions Are Incomplete

| Existing Tool | Limitation |
|--------------|------------|
| LinkedIn | Networking only |
| ChatGPT | No persistent profile |
| Resume Checkers | Only resume feedback |
| Coursera | Teaches content but doesn't prioritize |
| Job Portals | Show jobs but not readiness |

The Career Readiness Platform connects all these steps into one workflow.

---

# 4. Target Audience

## Primary Users

- First-year students
- Second-year students
- Internship seekers
- Placement aspirants
- Fresh graduates

## Secondary Users

- College mentors
- Placement coordinators
- Career counselors

---

# 5. User Personas

## Persona 1 – First-Year Student

Name: Aarav

Goal:

- Build skills for future internships.

Pain Points:

- Doesn't know where to start.
- Unsure which skills matter.

How CRP Helps:

- Suggests learning priorities.
- Shows missing skills.

---

## Persona 2 – Third-Year Placement Student

Name: Priya

Goal:

- Crack placements.

Pain Points:

- Doesn't know whether she's eligible for companies.

How CRP Helps:

- Eligibility checker.
- Resume analysis.
- Career readiness score.

---

## Persona 3 – Final-Year Graduate

Goal:

- Apply confidently.

Pain Points:

- Resume confidence.

How CRP Helps:

- AI feedback.
- Dashboard tracking.

---

# 6. Product Goals

## Business Goals

- Provide a complete career readiness workflow.
- Increase student confidence.
- Reduce preparation confusion.

## User Goals

- Upload resume.
- Get AI feedback.
- Find missing skills.
- Check eligibility.
- Improve readiness.

---

# 7. Non-Goals

The MVP will NOT include:

- Video courses
- Coding challenges
- Live interviews
- Job applications
- Social networking
- Chat system

These features may appear later.

---

# 8. Market Gap

Most platforms solve one problem.

This platform solves an entire workflow.

Current Flow:

Resume

↓

Feedback

↓

Skills

↓

Company Check

↓

Planning

The product combines everything into one experience.

---

# 9. Product Scope

## In Scope

- Authentication
- Student profile
- Resume upload
- AI analysis
- Career score
- Skill gap
- Recommendations
- Company eligibility
- Dashboard

## Out of Scope

- Course hosting
- Recruiter portal
- Payments
- Notifications
- Interview scheduling

---

# 10. End-to-End User Journey

### Step 1

Student registers.

↓

### Step 2

Logs in.

↓

### Step 3

Completes profile.

↓

### Step 4

Uploads resume.

↓

### Step 5

AI analyzes resume.

↓

### Step 6

Skill gap is calculated.

↓

### Step 7

Career readiness score appears.

↓

### Step 8

Learning recommendations are shown.

↓

### Step 9

Student checks company eligibility.

---

# 11. Functional Requirements

## Authentication

### Register

User enters:

- Name
- Email
- Password

System:

- Validates input.
- Hashes password.
- Stores account.
- Returns success.

### Login

User enters:

- Email
- Password

System:

- Verifies credentials.
- Generates JWT.
- Returns token.

---

## Student Profile

User can:

- View profile.
- Edit profile.

Fields:

- Name
- College
- Degree
- CGPA
- Graduation Year
- Skills
- Target Role
- GitHub
- LinkedIn
- Portfolio

---

## Resume Upload

Requirements:

- PDF only
- Maximum file size limit
- Upload to Cloudinary
- Store secure URL

---

## AI Resume Analysis

Input:

Resume text

Output:

- Summary
- Skills
- Strengths
- Weaknesses
- Suggestions

Example Output

```json
{
  "summary":"Backend-focused student",
  "skills":["Node.js","SQL"],
  "strengths":["Good projects"],
  "weaknesses":["No Docker"],
  "suggestions":["Learn Docker"]
}
```

---

## Career Readiness Score

Purpose

Provide an easy-to-understand readiness indicator.

Range

0–100

### Scoring Formula

| Component | Weight |
|-----------|---------|
| Profile Completion | 25% |
| Resume Quality | 35% |
| Skill Match | 30% |
| Experience Bonus | 10% |

Example

| Component | Score |
|-----------|---------|
| Profile | 20 |
| Resume | 30 |
| Skills | 24 |
| Experience | 8 |

Final Score

82/100

---

## Skill Gap Analysis

User selects:

- Frontend
- Backend
- Full Stack
- Data Analyst

System compares:

Current skills

vs

Expected skills.

Example

| Current | Missing |
|----------|----------|
| HTML | Docker |
| CSS | Redis |
| JavaScript | Testing |

Priority:

- High
- Medium
- Low

---

## Learning Recommendations

Instead of teaching,

recommend:

- Skill
- Priority
- External resource

Example

| Skill | Priority |
|---------|-----------|
| Docker | High |
| Redis | Medium |
| CI/CD | Low |

---

## Company Eligibility Checker

Student selects a company.

System compares:

- CGPA
- Skills
- Graduation Year

Output

Eligible

or

Not Eligible

Example

Google

Missing:

- Docker
- DSA

TCS

Eligible

---

## Dashboard

Displays:

- Welcome section
- Career score
- Resume status
- Missing skills
- AI insights
- Company eligibility
- Recommendations

---

# 12. Feature Specifications

## Dashboard Cards

### Card 1

Career Readiness Score

### Card 2

Resume Status

### Card 3

Profile Completion

### Card 4

Missing Skills

### Card 5

Recommendations

### Card 6

Recent AI Analysis

---

# 13. User Stories

## Authentication

As a student,

I want to register

so that I can access my dashboard.

---

As a student,

I want to log in

so that my data remains secure.

---

## Resume

As a student,

I want to upload my resume

so that AI can analyze it.

---

## Skill Gap

As a student,

I want to compare my skills

so that I know what to learn next.

---

## Eligibility

As a student,

I want to check company requirements

so that I apply confidently.

---

# 14. Acceptance Criteria

## Register

- Valid email accepted
- Password hashed
- Duplicate email rejected

## Login

- Valid credentials return JWT
- Invalid credentials return 401

## Profile

- User can edit fields
- Changes persist

## Resume Upload

- PDF uploads successfully
- Cloudinary URL stored

## AI Analysis

- Structured response displayed

## Dashboard

- Loads without crashing
- Shows latest analysis

---

# 15. Non-Functional Requirements

## Security

- bcrypt password hashing
- JWT authentication
- Protected routes
- Environment variables
- Input validation

## Performance

- Fast API responses
- Responsive interface
- Efficient database queries

## Reliability

- Proper error handling
- Consistent API responses
- Safe file uploads

## Usability

- Mobile responsive
- Simple navigation
- Clear feedback messages

---

# 16. Success Metrics

| Metric | Target |
|---------|---------|
| Registration Success | High |
| Login Success | High |
| Resume Upload Success | High |
| AI Analysis Completion | High |
| Dashboard Load Time | Low latency |
| Company Check Completion | High |

---

# 17. Risks

| Risk | Mitigation |
|------|------------|
| AI API downtime | Retry + error message |
| Upload failure | Validation + retry |
| Invalid resume | AI fallback |
| JWT expiration | Re-login |
| Database failure | Error handling |

---

# 18. Future Roadmap

Phase 2

- Application tracker
- Resume history
- Notifications
- Admin dashboard

Phase 3

- Mock interviews
- Analytics
- Recruiter portal
- AI career roadmap

---

# 19. Assumptions

- Students upload PDF resumes.
- Internet connection is available.
- AI returns valid JSON.
- Companies have predefined eligibility criteria.

---

# 20. Open Questions

Future decisions:

- Should multiple resumes be supported?
- Should AI remember previous analyses?
- Should mentors receive dashboards?
- Should recommendations become personalized over time?

These questions are intentionally left for future iterations and do not block the MVP.