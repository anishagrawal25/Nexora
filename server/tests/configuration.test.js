const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { companies, seedCompanyData } = require("../config/companySeed");
const { getAllowedOrigins, getJwtSecret } = require("../config/security");
const { ResumeAnalysisMemory } = require("../config/mongoMemory");

function createSeedClient() {
  const state = {
    companies: [],
    criteria: [],
    nextCompanyId: 1,
    nextCriteriaId: 1,
  };

  return {
    state,
    async query(sql, params = []) {
      const query = sql.replace(/\s+/g, " ").trim();
      if (["BEGIN", "COMMIT", "ROLLBACK"].includes(query)) return { rows: [] };

      if (query.startsWith("UPDATE companies SET name = 'Stripe'")) {
        for (const company of state.companies) {
          if (company.name.toLowerCase() === "a startup") company.name = "Stripe";
        }
        return { rows: [] };
      }
      if (query === "SELECT id, name FROM companies ORDER BY id") {
        return { rows: state.companies.map(({ id, name }) => ({ id, name })) };
      }
      if (query.includes("SELECT id, company_id FROM eligibility_criteria")) {
        return {
          rows: state.criteria
            .filter(({ company_id }) => params[0].includes(company_id))
            .map(({ id, company_id }) => ({ id, company_id })),
        };
      }
      if (query.startsWith("DELETE FROM eligibility_criteria criteria")) {
        const firstCriteriaIdByCompany = new Map();
        for (const row of state.criteria) {
          const existing = firstCriteriaIdByCompany.get(row.company_id);
          if (existing === undefined || row.id < existing) {
            firstCriteriaIdByCompany.set(row.company_id, row.id);
          }
        }
        state.criteria = state.criteria.filter(
          (row) => firstCriteriaIdByCompany.get(row.company_id) === row.id
        );
        return { rows: [] };
      }
      if (query.startsWith("DELETE FROM eligibility_criteria WHERE company_id = ANY")) {
        state.criteria = state.criteria.filter(
          (row) => !params[0].includes(row.company_id) || (params[1] !== undefined && row.id === params[1])
        );
        return { rows: [] };
      }
      if (query.startsWith("UPDATE eligibility_criteria SET company_id")) {
        const row = state.criteria.find(({ id }) => id === params[1]);
        if (row) row.company_id = params[0];
        return { rows: [] };
      }
      if (query.startsWith("DELETE FROM companies WHERE id = ANY")) {
        state.companies = state.companies.filter(({ id }) => !params[0].includes(id));
        return { rows: [] };
      }
      if (query.startsWith("SELECT id FROM companies WHERE LOWER(name)")) {
        const company = state.companies.find(
          ({ name }) => name.toLowerCase() === String(params[0]).toLowerCase()
        );
        return { rows: company ? [{ id: company.id }] : [] };
      }
      if (query.startsWith("INSERT INTO companies")) {
        const company = { id: state.nextCompanyId++, name: params[0] };
        state.companies.push(company);
        return { rows: [{ id: company.id }] };
      }
      if (query.startsWith("UPDATE companies SET name = $1")) {
        const company = state.companies.find(({ id }) => id === params[1]);
        if (company) company.name = params[0];
        return { rows: [] };
      }
      if (query.startsWith("SELECT id FROM eligibility_criteria WHERE company_id")) {
        const criterion = state.criteria.find(({ company_id }) => company_id === params[0]);
        return { rows: criterion ? [{ id: criterion.id }] : [] };
      }
      if (query.startsWith("INSERT INTO eligibility_criteria")) {
        state.criteria.push({ id: state.nextCriteriaId++, company_id: params[0] });
        return { rows: [] };
      }
      if (query.startsWith("CREATE UNIQUE INDEX")) return { rows: [] };
      throw new Error(`Unhandled test SQL: ${query}`);
    },
  };
}

describe("Production configuration and seeded examples", () => {
  test("company examples contain 15 unique names with criteria", () => {
    assert.equal(companies.length, 15);
    assert.equal(new Set(companies.map(({ name }) => name.toLowerCase())).size, 15);
    assert.ok(companies.every((company) =>
      Number.isFinite(company.cgpa) &&
      Number.isInteger(company.year) &&
      Array.isArray(company.skills) &&
      company.skills.length > 0
    ));
    assert.ok(companies.some(({ name }) => name === "Amazon"));
    assert.ok(companies.some(({ name }) => name === "Meta"));
    assert.ok(companies.some(({ name }) => name === "Apple"));
    assert.ok(companies.some(({ name }) => name === "Wipro"));
    assert.ok(companies.some(({ name }) => name === "Accenture"));
    assert.ok(companies.some(({ name }) => name === "Stripe"));
    assert.ok(companies.every(({ name }) => name !== "Startup Example"));
  });

  test("company seeding merges duplicate names and remains idempotent", async () => {
    const client = createSeedClient();
    client.state.companies.push(
      { id: 1, name: "Google" },
      { id: 2, name: "google" },
      { id: 3, name: "a Startup" }
    );
    client.state.nextCompanyId = 4;
    client.state.criteria.push(
      { id: 1, company_id: 1 },
      { id: 2, company_id: 2 }
    );
    client.state.nextCriteriaId = 3;

    await seedCompanyData(client);
    await seedCompanyData(client);

    assert.equal(client.state.companies.length, 15);
    assert.equal(client.state.criteria.length, 15);
    assert.equal(new Set(client.state.companies.map(({ name }) => name.toLowerCase())).size, 15);
    assert.equal(new Set(client.state.criteria.map(({ company_id }) => company_id)).size, 15);
    assert.ok(client.state.companies.some(({ name }) => name === "Stripe"));
  });

  test("production JWT configuration requires a sufficiently long secret", () => {
    const previousEnvironment = process.env.NODE_ENV;
    const previousSecret = process.env.JWT_SECRET;
    process.env.NODE_ENV = "production";

    try {
      delete process.env.JWT_SECRET;
      assert.throws(() => getJwtSecret(), /at least 32 characters/);
      process.env.JWT_SECRET = "short";
      assert.throws(() => getJwtSecret(), /at least 32 characters/);
      process.env.JWT_SECRET = "a".repeat(32);
      assert.equal(getJwtSecret(), "a".repeat(32));
    } finally {
      if (previousEnvironment === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousEnvironment;
      if (previousSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = previousSecret;
    }
  });

  test("production CORS requires explicit client origins", () => {
    const previousEnvironment = process.env.NODE_ENV;
    const previousOrigin = process.env.CLIENT_ORIGIN;
    process.env.NODE_ENV = "production";

    try {
      delete process.env.CLIENT_ORIGIN;
      assert.throws(() => getAllowedOrigins(), /CLIENT_ORIGIN/);
      process.env.CLIENT_ORIGIN = "https://nexora.example, https://preview.example";
      assert.deepEqual(getAllowedOrigins(), [
        "https://nexora.example",
        "https://preview.example",
      ]);
    } finally {
      if (previousEnvironment === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousEnvironment;
      if (previousOrigin === undefined) delete process.env.CLIENT_ORIGIN;
      else process.env.CLIENT_ORIGIN = previousOrigin;
    }
  });

  test("failed uploads are not returned as completed resume analyses", async () => {
    const userId = Date.now();
    await ResumeAnalysisMemory.create({
      userId,
      resumeUrl: "https://example.test/failed.pdf",
      readinessScore: null,
    });
    const completed = await ResumeAnalysisMemory.create({
      userId,
      resumeUrl: "https://example.test/completed.pdf",
      readinessScore: 0,
    });

    const analysis = await ResumeAnalysisMemory.findOne({
      $or: [{ userId }],
      readinessScore: { $ne: null },
    }).sort({ createdAt: -1 });

    assert.equal(String(analysis._id), String(completed._id));
  });
});
