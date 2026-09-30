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

-- Seed Target Roles
INSERT INTO target_roles (id, name, expected_skills) VALUES
(1, 'Frontend Developer', ARRAY['React', 'JavaScript', 'CSS', 'Git', 'REST APIs', 'HTML']),
(2, 'Backend Developer', ARRAY['Node.js', 'Express', 'PostgreSQL', 'SQL', 'Docker', 'REST APIs']),
(3, 'Full Stack Developer', ARRAY['React', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Git', 'Docker', 'REST APIs']),
(4, 'Data Analyst', ARRAY['Python', 'SQL', 'PostgreSQL', 'Excel', 'Data Visualization'])
ON CONFLICT (id) DO NOTHING;

-- Seed 15 Companies (5 original + 10 new)
INSERT INTO companies (id, name) VALUES
(1, 'Google'),
(2, 'Microsoft'),
(3, 'TCS'),
(4, 'Infosys'),
(5, 'a Startup'),
(6, 'Amazon'),
(7, 'Meta'),
(8, 'Apple'),
(9, 'Wipro'),
(10, 'Accenture'),
(11, 'Cognizant'),
(12, 'Flipkart'),
(13, 'Zomato'),
(14, 'Razorpay'),
(15, 'Freshworks')
ON CONFLICT (id) DO NOTHING;

-- Seed Eligibility Criteria for all 15 Companies
INSERT INTO eligibility_criteria (id, company_id, min_cgpa, min_grad_year, required_skills) VALUES
(1, 1, 8.50, 2024, ARRAY['Data Structures', 'System Design', 'Python', 'SQL']),
(2, 2, 8.00, 2024, ARRAY['C#', 'Azure', 'Data Structures', 'SQL']),
(3, 3, 6.50, 2023, ARRAY['Java', 'SQL', 'Git']),
(4, 4, 6.50, 2023, ARRAY['Java', 'Python', 'SQL']),
(5, 5, 7.00, 2024, ARRAY['React', 'Node.js', 'MongoDB', 'Git']),
(6, 6, 8.00, 2024, ARRAY['Java', 'Data Structures', 'System Design', 'SQL']),
(7, 7, 8.50, 2024, ARRAY['React', 'JavaScript', 'System Design', 'Data Structures']),
(8, 8, 8.50, 2024, ARRAY['Data Structures', 'System Design', 'Python', 'Git']),
(9, 9, 6.00, 2023, ARRAY['Java', 'SQL', 'Git']),
(10, 10, 6.50, 2023, ARRAY['Java', 'Python', 'SQL', 'Git']),
(11, 11, 6.50, 2023, ARRAY['Java', 'SQL', 'REST APIs']),
(12, 12, 7.50, 2024, ARRAY['Java', 'Data Structures', 'SQL', 'System Design']),
(13, 13, 7.00, 2024, ARRAY['Node.js', 'React', 'PostgreSQL', 'Git']),
(14, 14, 7.50, 2024, ARRAY['Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Git']),
(15, 15, 7.00, 2024, ARRAY['React', 'Node.js', 'REST APIs', 'SQL'])
ON CONFLICT (id) DO NOTHING;