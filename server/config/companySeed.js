const companies = [
  { id: 1, name: "Google", cgpa: 8.5, year: 2024, skills: ["Data Structures", "System Design", "Python", "SQL"] },
  { id: 2, name: "Microsoft", cgpa: 8.0, year: 2024, skills: ["C#", "Azure", "Data Structures", "SQL"] },
  { id: 3, name: "TCS", cgpa: 6.5, year: 2023, skills: ["Java", "SQL", "Git"] },
  { id: 4, name: "Infosys", cgpa: 6.5, year: 2023, skills: ["Java", "Python", "SQL"] },
  { id: 5, name: "Stripe", cgpa: 8.0, year: 2024, skills: ["Node.js", "System Design", "PostgreSQL"] },
  { id: 6, name: "Amazon", cgpa: 8.0, year: 2024, skills: ["Java", "Data Structures", "System Design", "SQL"] },
  { id: 7, name: "Meta", cgpa: 8.5, year: 2024, skills: ["React", "JavaScript", "System Design", "Data Structures"] },
  { id: 8, name: "Apple", cgpa: 8.5, year: 2024, skills: ["Data Structures", "System Design", "Python", "Git"] },
  { id: 9, name: "Wipro", cgpa: 6.0, year: 2023, skills: ["Java", "SQL", "Git"] },
  { id: 10, name: "Accenture", cgpa: 6.5, year: 2023, skills: ["Java", "Python", "SQL", "Git"] },
  { id: 11, name: "Cognizant", cgpa: 6.5, year: 2023, skills: ["Java", "SQL", "REST APIs"] },
  { id: 12, name: "Flipkart", cgpa: 7.5, year: 2024, skills: ["Java", "Data Structures", "SQL", "System Design"] },
  { id: 13, name: "Zomato", cgpa: 7.0, year: 2024, skills: ["Node.js", "React", "PostgreSQL", "Git"] },
  { id: 14, name: "Razorpay", cgpa: 7.5, year: 2024, skills: ["Node.js", "PostgreSQL", "Docker", "REST APIs", "Git"] },
  { id: 15, name: "Freshworks", cgpa: 7.0, year: 2024, skills: ["React", "Node.js", "REST APIs", "SQL"] },
];

async function seedCompanyData(client) {
  await client.query("BEGIN");

  try {
    await client.query("UPDATE companies SET name = 'Stripe' WHERE LOWER(name) = 'a startup'");
    const result = await client.query("SELECT id, name FROM companies ORDER BY id");
    const groups = new Map();

    for (const company of result.rows) {
      const key = company.name.trim().toLowerCase();
      const group = groups.get(key) || [];
      group.push(company);
      groups.set(key, group);
    }

    for (const group of groups.values()) {
      const [canonical, ...duplicates] = group;
      if (duplicates.length === 0) continue;

      const ids = [canonical, ...duplicates].map(({ id }) => id);
      const criteria = await client.query(
        "SELECT id, company_id FROM eligibility_criteria WHERE company_id = ANY($1::int[]) ORDER BY id",
        [ids]
      );
      const canonicalCriteria = criteria.rows.find((row) => row.company_id === canonical.id);
      const keepCriteria = canonicalCriteria || criteria.rows[0];

      if (keepCriteria) {
        await client.query("DELETE FROM eligibility_criteria WHERE company_id = ANY($1::int[]) AND id <> $2", [ids, keepCriteria.id]);
        await client.query("UPDATE eligibility_criteria SET company_id = $1 WHERE id = $2", [canonical.id, keepCriteria.id]);
      } else {
        await client.query("DELETE FROM eligibility_criteria WHERE company_id = ANY($1::int[])", [ids]);
      }

      await client.query("DELETE FROM companies WHERE id = ANY($1::int[])", [duplicates.map(({ id }) => id)]);
    }

    await client.query(
      `DELETE FROM eligibility_criteria criteria
       USING eligibility_criteria duplicate
       WHERE criteria.company_id = duplicate.company_id
         AND criteria.id > duplicate.id`
    );

    for (const company of companies) {
      let existing = await client.query(
        "SELECT id FROM companies WHERE LOWER(name) = LOWER($1) ORDER BY id LIMIT 1",
        [company.name]
      );
      let companyId = existing.rows[0]?.id;

      if (companyId === undefined) {
        const inserted = await client.query(
          "INSERT INTO companies (name) VALUES ($1) RETURNING id",
          [company.name]
        );
        companyId = inserted.rows[0].id;
      } else {
        await client.query("UPDATE companies SET name = $1 WHERE id = $2", [company.name, companyId]);
      }

      const existingCriteria = await client.query(
        "SELECT id FROM eligibility_criteria WHERE company_id = $1 ORDER BY id LIMIT 1",
        [companyId]
      );

      if (existingCriteria.rows.length === 0) {
        await client.query(
          "INSERT INTO eligibility_criteria (company_id, min_cgpa, min_grad_year, required_skills) VALUES ($1, $2, $3, $4)",
          [companyId, company.cgpa, company.year, company.skills]
        );
      }
    }

    await client.query("CREATE UNIQUE INDEX IF NOT EXISTS companies_name_lower_unique ON companies (LOWER(name))");
    await client.query("CREATE UNIQUE INDEX IF NOT EXISTS eligibility_criteria_company_unique ON eligibility_criteria (company_id)");

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

module.exports = { companies, seedCompanyData };