-- Run this once against your Postgres database to create the tables.

CREATE TABLE IF NOT EXISTS target_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  expected_skills TEXT[]
);

CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS eligibility_criteria (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  min_cgpa DECIMAL(3,2),
  min_grad_year INT,
  required_skills TEXT[]
);