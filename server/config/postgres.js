const { Pool: NeonPool } = require("@neondatabase/serverless");
const { Pool: PgPool } = require("pg");

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes("neon.tech");
const PoolClass = isNeon ? NeonPool : PgPool;

let isPgConnected = false;
let realPool = null;

if (process.env.DATABASE_URL) {
  try {
    realPool = new PoolClass({
      connectionString: process.env.DATABASE_URL,
    });
  } catch (e) {
    console.warn("Could not instantiate PgPool:", e.message);
  }
}

// In-memory relational store fallback (seeded with 4 roles, 15 companies, 15 criteria, and default user)
const memoryDb = {
  target_roles: [
    { id: 1, name: "Frontend Developer", expected_skills: ["React", "JavaScript", "CSS", "Git", "REST APIs", "HTML"] },
    { id: 2, name: "Backend Developer", expected_skills: ["Node.js", "Express", "PostgreSQL", "SQL", "Docker", "REST APIs"] },
    { id: 3, name: "Full Stack Developer", expected_skills: ["React", "Node.js", "Express", "PostgreSQL", "MongoDB", "Git", "Docker", "REST APIs"] },
    { id: 4, name: "Data Analyst", expected_skills: ["Python", "SQL", "PostgreSQL", "Excel", "Data Visualization"] },
  ],
  companies: [
    { id: 1, name: "Google" },
    { id: 2, name: "Microsoft" },
    { id: 3, name: "TCS" },
    { id: 4, name: "Infosys" },
    { id: 5, name: "a Startup" },
    { id: 6, name: "Amazon" },
    { id: 7, name: "Meta" },
    { id: 8, name: "Apple" },
    { id: 9, name: "Wipro" },
    { id: 10, name: "Accenture" },
    { id: 11, name: "Cognizant" },
    { id: 12, name: "Flipkart" },
    { id: 13, name: "Zomato" },
    { id: 14, name: "Razorpay" },
    { id: 15, name: "Freshworks" },
  ],
  eligibility_criteria: [
    { id: 1, company_id: 1, min_cgpa: 8.50, min_grad_year: 2024, required_skills: ["Data Structures", "System Design", "Python", "SQL"] },
    { id: 2, company_id: 2, min_cgpa: 8.00, min_grad_year: 2024, required_skills: ["C#", "Azure", "Data Structures", "SQL"] },
    { id: 3, company_id: 3, min_cgpa: 6.50, min_grad_year: 2023, required_skills: ["Java", "SQL", "Git"] },
    { id: 4, company_id: 4, min_cgpa: 6.50, min_grad_year: 2023, required_skills: ["Java", "Python", "SQL"] },
    { id: 5, company_id: 5, min_cgpa: 7.00, min_grad_year: 2024, required_skills: ["React", "Node.js", "MongoDB", "Git"] },
    { id: 6, company_id: 6, min_cgpa: 8.00, min_grad_year: 2024, required_skills: ["Java", "Data Structures", "System Design", "SQL"] },
    { id: 7, company_id: 7, min_cgpa: 8.50, min_grad_year: 2024, required_skills: ["React", "JavaScript", "System Design", "Data Structures"] },
    { id: 8, company_id: 8, min_cgpa: 8.50, min_grad_year: 2024, required_skills: ["Data Structures", "System Design", "Python", "Git"] },
    { id: 9, company_id: 9, min_cgpa: 6.00, min_grad_year: 2023, required_skills: ["Java", "SQL", "Git"] },
    { id: 10, company_id: 10, min_cgpa: 6.50, min_grad_year: 2023, required_skills: ["Java", "Python", "SQL", "Git"] },
    { id: 11, company_id: 11, min_cgpa: 6.50, min_grad_year: 2023, required_skills: ["Java", "SQL", "REST APIs"] },
    { id: 12, company_id: 12, min_cgpa: 7.50, min_grad_year: 2024, required_skills: ["Java", "Data Structures", "SQL", "System Design"] },
    { id: 13, company_id: 13, min_cgpa: 7.00, min_grad_year: 2024, required_skills: ["Node.js", "React", "PostgreSQL", "Git"] },
    { id: 14, company_id: 14, min_cgpa: 7.50, min_grad_year: 2024, required_skills: ["Node.js", "PostgreSQL", "Docker", "REST APIs", "Git"] },
    { id: 15, company_id: 15, min_cgpa: 7.00, min_grad_year: 2024, required_skills: ["React", "Node.js", "REST APIs", "SQL"] },
  ],
  users: [
    {
      id: 1,
      name: "Demo Student",
      email: "demo@college.edu",
      password_hash: "$2b$10$VzQcHp.elQwmVWakaXqJCOmjJVpKk9JmpjtQZQJmwfUU412HmmGt2",
      cgpa: 8.20,
      grad_year: 2025,
      github_url: "https://github.com/demo",
      linkedin_url: "https://linkedin.com/in/demo",
      portfolio_url: "https://demo.dev",
      target_role_id: 1,
      created_at: new Date(),
    },
  ],
  nextUserId: 2,
};

async function executeMemoryQuery(text, params = []) {
  const q = text.trim();
  const normalized = q.replace(/\s+/g, " ");

  // 1. SELECT id FROM users WHERE email = $1
  if (/^SELECT id FROM users WHERE email = \$1/i.test(normalized)) {
    const email = params[0];
    const user = memoryDb.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    return { rows: user ? [{ id: user.id }] : [] };
  }

  // 2. INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at
  if (/^INSERT INTO users/i.test(normalized)) {
    const [name, email, password_hash] = params;
    const newUser = {
      id: memoryDb.nextUserId++,
      name,
      email,
      password_hash,
      cgpa: null,
      grad_year: null,
      github_url: null,
      linkedin_url: null,
      portfolio_url: null,
      target_role_id: null,
      created_at: new Date(),
    };
    memoryDb.users.push(newUser);
    return {
      rows: [
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          created_at: newUser.created_at,
        },
      ],
    };
  }

  // 3. SELECT id, name, email, password_hash FROM users WHERE email = $1
  if (/^SELECT id, name, email, password_hash FROM users WHERE email = \$1/i.test(normalized)) {
    const email = params[0];
    const user = memoryDb.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    return { rows: user ? [user] : [] };
  }

  // 4. SELECT ... FROM users WHERE id = $1
  if (/^SELECT id, name, email, cgpa, grad_year.*FROM users WHERE id = \$1/i.test(normalized) || /^SELECT id, name, cgpa, grad_year FROM users WHERE id = \$1/i.test(normalized) || /^SELECT id, target_role_id FROM users WHERE id = \$1/i.test(normalized)) {
    const id = Number(params[0]);
    const user = memoryDb.users.find((u) => Number(u.id) === id);
    return { rows: user ? [{ ...user }] : [] };
  }

  // 5. UPDATE users SET cgpa = ... WHERE id = ...
  if (/^UPDATE users/i.test(normalized)) {
    const userId = Number(params[6] !== undefined ? params[6] : params[params.length - 1]);
    const user = memoryDb.users.find((u) => Number(u.id) === userId);
    if (user) {
      if (params[0] !== undefined) user.cgpa = params[0];
      if (params[1] !== undefined) user.grad_year = params[1];
      if (params[2] !== undefined) user.github_url = params[2];
      if (params[3] !== undefined) user.linkedin_url = params[3];
      if (params[4] !== undefined) user.portfolio_url = params[4];
      if (params[5] !== undefined) user.target_role_id = params[5];
      return { rows: [{ ...user }] };
    }
    return { rows: [] };
  }

  // 6. SELECT id, name, expected_skills FROM target_roles ORDER BY id
  if (/^SELECT id, name, expected_skills FROM target_roles ORDER BY id/i.test(normalized)) {
    return { rows: memoryDb.target_roles.map((r) => ({ ...r })) };
  }

  // 7. SELECT ... FROM target_roles WHERE id = $1 or WHERE LOWER(name) = LOWER($1)
  if (/FROM target_roles WHERE id = \$1/i.test(normalized)) {
    const id = Number(params[0]);
    const role = memoryDb.target_roles.find((r) => Number(r.id) === id);
    return { rows: role ? [{ ...role }] : [] };
  }
  if (/FROM target_roles WHERE LOWER\(name\) = LOWER\(\$1\)/i.test(normalized) || /FROM target_roles WHERE name ILIKE \$1/i.test(normalized)) {
    const nameStr = String(params[0]).replace(/%/g, "").trim().toLowerCase();
    const role = memoryDb.target_roles.find((r) => r.name.toLowerCase() === nameStr);
    return { rows: role ? [{ ...role }] : [] };
  }

  // 8. SELECT DISTINCT ON (name) id, name FROM companies
  if (/FROM companies.*ORDER BY/i.test(normalized) && !/eligibility_criteria/i.test(normalized)) {
    return { rows: memoryDb.companies.map((c) => ({ ...c })) };
  }

  // 9. Single company criteria JOIN query: WHERE c.id = $1 or WHERE LOWER(c.name) = LOWER($1)
  if (/FROM companies c LEFT JOIN eligibility_criteria e ON e\.company_id = c\.id/i.test(normalized)) {
    if (/WHERE c\.id = \$1/i.test(normalized)) {
      const companyId = Number(params[0]);
      const comp = memoryDb.companies.find((c) => Number(c.id) === companyId);
      if (!comp) return { rows: [] };
      const crit = memoryDb.eligibility_criteria.find((e) => Number(e.company_id) === Number(comp.id));
      return {
        rows: [
          {
            company_id: comp.id,
            company_name: comp.name,
            min_cgpa: crit ? crit.min_cgpa : null,
            min_grad_year: crit ? crit.min_grad_year : null,
            required_skills: crit ? crit.required_skills : [],
          },
        ],
      };
    }

    if (/WHERE LOWER\(c\.name\) = LOWER\(\$1\)/i.test(normalized) || /WHERE c\.name ILIKE \$1/i.test(normalized)) {
      const compName = String(params[0]).replace(/%/g, "").trim().toLowerCase();
      const comp = memoryDb.companies.find((c) => c.name.toLowerCase() === compName);
      if (!comp) return { rows: [] };
      const crit = memoryDb.eligibility_criteria.find((e) => Number(e.company_id) === Number(comp.id));
      return {
        rows: [
          {
            company_id: comp.id,
            company_name: comp.name,
            min_cgpa: crit ? crit.min_cgpa : null,
            min_grad_year: crit ? crit.min_grad_year : null,
            required_skills: crit ? crit.required_skills : [],
          },
        ],
      };
    }

    // All companies overview
    const rows = memoryDb.companies.map((comp) => {
      const crit = memoryDb.eligibility_criteria.find((e) => Number(e.company_id) === Number(comp.id));
      return {
        company_id: comp.id,
        company_name: comp.name,
        min_cgpa: crit ? crit.min_cgpa : null,
        min_grad_year: crit ? crit.min_grad_year : null,
        required_skills: crit ? crit.required_skills : [],
      };
    });
    return { rows };
  }

  return { rows: [] };
}

const pgPool = {
  async query(text, params) {
    if (isPgConnected && realPool) {
      try {
        return await realPool.query(text, params);
      } catch (err) {
        console.warn("Postgres query error, falling back to memory store:", err.message);
      }
    }
    return executeMemoryQuery(text, params);
  },
  async connect() {
    if (isPgConnected && realPool) {
      return realPool.connect();
    }
    return {
      query: (text, params) => executeMemoryQuery(text, params),
      release: () => {},
    };
  },
};

async function connectPostgres() {
  if (!process.env.DATABASE_URL || !realPool) {
    console.warn("DATABASE_URL is not set; running with memory Postgres store.");
    isPgConnected = false;
    return false;
  }

  try {
    const client = await realPool.connect();
    await client.query("SELECT 1");

    // Ensure all 15 companies & criteria are present in the live database
    try {
      const fs = require("fs");
      const path = require("path");
      const schemaPath = path.join(__dirname, "schema.sql");
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, "utf-8");
        await client.query(schemaSql);
      }
    } catch (seedErr) {
      console.warn("Notice: schema auto-seed check:", seedErr.message);
    }

    client.release();
    console.log("Postgres connected and verified");
    isPgConnected = true;
    return true;
  } catch (err) {
    console.warn("Postgres connection failed (using in-memory fallback). Code:", err.code, "Message:", err.message);
    isPgConnected = false;
    return false;
  }
}

module.exports = { pgPool, connectPostgres, memoryDb };