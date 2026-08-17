# Career Readiness Platform – High Level Design (HLD)

## Architecture

The project follows a three-layer architecture.

Frontend

↓

Backend API

↓

Databases & External Services

- PostgreSQL
- MongoDB
- Cloudinary
- AI API

---

## System Components

### Frontend

Technology

- React
- Vite
- Tailwind CSS

Responsibilities

- Authentication
- Profile forms
- Dashboard
- Resume upload
- Display AI results

---

### Backend

Technology

- Node.js
- Express.js

Responsibilities

- Authentication
- JWT validation
- Profile APIs
- Resume upload
- AI integration
- Database communication

---

### PostgreSQL

Stores structured data.

Tables

- users
- target_roles
- companies
- eligibility_criteria

Best for relational data.

---

### MongoDB

Stores flexible AI-generated data.

Collections

- resumeAnalysis
- skillGap
- recommendations

Best for variable AI responses.

---

### Cloudinary

Stores uploaded resume PDFs.

Returns:

- Secure URL
- Public ID

---

### AI Service

Receives:

- Resume text

Returns structured JSON.

Example

- skills
- strengths
- weaknesses
- suggestions

---

# Architecture Diagram

Student

↓

React Frontend

↓

Express Backend

↓

Authentication Middleware

↓

PostgreSQL

↓

MongoDB

↓

Cloudinary

↓

AI Service

---

# API Categories

## Auth

- POST /register
- POST /login

## Profile

- GET /profile
- PUT /profile

## Resume

- POST /upload
- GET /analysis

## Career

- GET /score
- GET /skill-gap
- GET /eligibility

---

# Security Design

Passwords

↓

bcrypt hashing

↓

Database

JWT protects private routes.

Environment variables store:

- database URLs
- JWT secret
- API keys

---

# Future Scaling

Possible improvements

- Redis caching
- Docker containers
- Load balancer
- Microservices
- Background AI jobs