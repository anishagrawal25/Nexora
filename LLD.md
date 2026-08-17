# Career Readiness Platform – Low Level Design (LLD)

## Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| AI Data | MongoDB |
| Upload | Cloudinary |
| Authentication | JWT + bcrypt |

---

# Folder Structure

career-readiness-platform/

client/

server/

routes/

controllers/

middleware/

config/

models/

PRD.md

HLD.md

LLD.md

---

# Backend Modules

## Auth Module

Endpoints

POST /api/auth/register

Flow

Request

↓

Validate

↓

Hash Password

↓

Save User

↓

Response

POST /api/auth/login

Flow

Request

↓

Verify Password

↓

Generate JWT

↓

Return Token

---

## Profile Module

Endpoints

GET /api/profile

PUT /api/profile

Protected using JWT.

---

## Resume Module

Flow

Upload PDF

↓

Cloudinary

↓

Store URL

↓

Extract Text

↓

Send to AI

↓

Save Mongo Document

---

# PostgreSQL Schema

## users

Fields

- id
- name
- email
- password_hash
- created_at

## target_roles

Fields

- id
- role_name
- expected_skills

## companies

Fields

- id
- company_name

## eligibility_criteria

Fields

- company_id
- minimum_cgpa
- required_skills
- graduation_year

Relationships

users

↓

target_roles

↓

companies

↓

eligibility_criteria

---

# Mongo Collections

## resumeAnalysis

Stores

- userId
- summary
- skills
- strengths
- weaknesses

## skillGap

Stores

- userId
- targetRole
- missingSkills

## recommendations

Stores

- userId
- recommendations

---

# Career Readiness Formula

The MVP uses a weighted scoring model.

| Factor | Weight |
|----------|----------|
| Profile Completion | 25% |
| Resume Quality | 35% |
| Skill Match | 30% |
| Experience Bonus | 10% |

Example

Profile = 20

Resume = 30

Skill Match = 24

Experience = 8

Final Score = 82

This formula is intentionally simple and explainable.

---

# Skill Gap Algorithm

Input

Current Skills

Target Role

Process

Convert both into arrays.

Compare skills.

Find missing skills.

Assign priorities.

Output

Missing Skills

Priority

Recommended Resources

---

# Eligibility Algorithm

Input

Student Profile

↓

SQL JOIN

↓

Company Criteria

↓

Comparison

↓

Eligible or Not Eligible

---

# Error Handling

Standard response format

Success

{
"success": true,
"data": {}
}

Failure

{
"success": false,
"message": "Invalid credentials"
}

---

# Environment Variables

JWT_SECRET

POSTGRES_URL

MONGO_URI

CLOUDINARY_NAME

CLOUDINARY_KEY

CLOUDINARY_SECRET

AI_API_KEY

These are never committed to Git.