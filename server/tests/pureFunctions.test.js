const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateProfileCompleteness,
  calculateResumeQuality,
  calculateSkillMatch,
  calculateExperienceBonus,
  calculateReadiness,
  findResource,
  validateEmail,
  validatePassword,
} = require("../utils/pureFunctions");

describe("Nexora Pure Functions & Calculations", () => {
  describe("calculateProfileCompleteness", () => {
    test("returns 0 for null/undefined profile", () => {
      assert.equal(calculateProfileCompleteness(null), 0);
      assert.equal(calculateProfileCompleteness(undefined), 0);
    });

    test("returns 100 when all 6 fields are filled", () => {
      const profile = {
        cgpa: 8.5,
        grad_year: 2026,
        github_url: "https://github.com/test",
        linkedin_url: "https://linkedin.com/in/test",
        portfolio_url: "https://portfolio.dev",
        target_role_id: 1,
      };
      assert.equal(calculateProfileCompleteness(profile), 100);
    });

    test("calculates proportional completeness for partially filled profile", () => {
      const profile = {
        cgpa: 7.9,
        grad_year: 2025,
        github_url: "https://github.com/test",
        linkedin_url: null,
        portfolio_url: "",
        target_role_id: null,
      };
      // 3 of 6 fields = 50%
      assert.equal(calculateProfileCompleteness(profile), 50);
    });
  });

  describe("calculateSkillMatch", () => {
    test("returns 0 for empty expected skills", () => {
      assert.equal(calculateSkillMatch([], ["React"]), 0);
      assert.equal(calculateSkillMatch(null, ["React"]), 0);
    });

    test("matches case-insensitively and returns 100% on full match", () => {
      const expected = ["React", "Node.js", "PostgreSQL", "Docker"];
      const actual = ["react", "node.js", "postgresql", "docker", "git"];
      assert.equal(calculateSkillMatch(expected, actual), 100);
    });

    test("calculates partial skill match percentage accurately", () => {
      const expected = ["React", "TypeScript", "Node.js", "Docker"];
      const actual = ["React", "Node.js"];
      // 2 of 4 = 50%
      assert.equal(calculateSkillMatch(expected, actual), 50);
    });
  });

  describe("calculateExperienceBonus", () => {
    test("gives bonus for portfolio / github / linkedin presence", () => {
      const profile = { github_url: "https://github.com/user" };
      assert.equal(calculateExperienceBonus(profile, null), 100);
    });

    test("gives bonus for resume strengths mentioning internship or projects", () => {
      const profile = {};
      const analysis = { strengths: ["Built full-stack production app", "Internship experience at Acme"] };
      assert.equal(calculateExperienceBonus(profile, analysis), 100);
    });

    test("returns 0 when neither portfolio nor experience signals exist", () => {
      const profile = { github_url: null };
      const analysis = { strengths: ["Quick learner", "Good communicator"] };
      assert.equal(calculateExperienceBonus(profile, analysis), 0);
    });
  });

  describe("calculateReadiness (Deterministic Formula)", () => {
    test("calculates combined weighted readiness score correctly", () => {
      const profile = {
        cgpa: 8.5,
        grad_year: 2026,
        github_url: "https://github.com/test",
        linkedin_url: "https://linkedin.com/in/test",
        portfolio_url: "https://portfolio.dev",
        target_role_id: 2,
      }; // completeness = 100 (25 pts)

      const analysis = {
        extractedSkills: ["Node.js", "SQL", "REST APIs", "Docker", "Git"],
        strengths: ["Strong backend knowledge", "Built high-scale APIs", "Experience with DB optimization"],
        weaknesses: ["None"],
        suggestions: ["Add automated testing"],
        readinessScore: 85,
      };

      const expectedSkills = ["Node.js", "SQL", "REST APIs", "Docker", "Git"]; // skillMatch = 100 (30 pts)
      // experienceBonus = 100 (10 pts)

      const result = calculateReadiness(profile, analysis, expectedSkills);
      assert.equal(result.profileCompleteness, 100);
      assert.equal(result.skillMatch, 100);
      assert.equal(result.experienceBonus, 100);
      assert.ok(result.score >= 80 && result.score <= 100);
    });

    test("handles null profile and analysis gracefully without throwing", () => {
      const result = calculateReadiness(null, null, []);
      assert.equal(result.profileCompleteness, 0);
      assert.equal(result.resumeQuality, 0);
      assert.equal(result.skillMatch, 0);
      assert.equal(result.experienceBonus, 0);
      assert.equal(result.score, 0);
    });
  });

  describe("findResource", () => {
    test("finds direct documentation for standard skills", () => {
      const reactRes = findResource("React");
      assert.ok(reactRes.url.includes("react.dev"));
      assert.equal(reactRes.priority, "High");

      const nodeRes = findResource("Node.js");
      assert.ok(nodeRes.url.includes("nodejs.org"));
    });

    test("handles aliases like 'psql' and 'container'", () => {
      const psqlRes = findResource("psql");
      assert.ok(psqlRes.url.includes("postgresql.org"));

      const containerRes = findResource("container");
      assert.ok(containerRes.url.includes("docker.com"));
    });

    test("provides search fallback for custom skills", () => {
      const customRes = findResource("Solidity Smart Contracts");
      assert.ok(customRes.url.includes("google.com/search"));
    });
  });

  describe("Validation Utilities", () => {
    test("validateEmail accepts valid formats and rejects invalid ones", () => {
      assert.equal(validateEmail("user@example.com"), true);
      assert.equal(validateEmail("test.user+tag@domain.co.in"), true);
      assert.equal(validateEmail("invalid-email"), false);
      assert.equal(validateEmail("user@"), false);
      assert.equal(validateEmail(""), false);
      assert.equal(validateEmail(null), false);
    });

    test("validatePassword validates minimum length requirements", () => {
      assert.equal(validatePassword("secret123"), true);
      assert.equal(validatePassword("123456"), true);
      assert.equal(validatePassword("12345"), false);
      assert.equal(validatePassword(""), false);
      assert.equal(validatePassword(null), false);
    });
  });
});
