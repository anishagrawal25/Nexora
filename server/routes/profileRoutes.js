const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { pgPool } = require("../config/postgres");
const { AppError, asyncHandler } = require("../middleware/errorHandler");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const SkillGap = require("../models/SkillGap");
const Recommendation = require("../models/Recommendation");

// HOISTING NOTE: `router` must be declared with `const` before any
// route (router.get/put/etc.) references it below. Unlike `function`
// declarations — which are fully hoisted and callable before their
// written position — `const`/`let` bindings are hoisted but remain
// in the "temporal dead zone" until this line actually executes.
// I hit this directly: an earlier version of this file called
// router.get(...) before this declaration existed, which threw
// "ReferenceError: Cannot access 'router' before initialization"
// instead of a vaguer failure — a direct, practical illustration
// of how `const` hoisting differs from `var`/function hoisting.
const router = Router();

const RESOURCE_MAP = {
  React: { url: "https://react.dev/learn", priority: "High" },
  "Node.js": { url: "https://nodejs.org/en/learn", priority: "High" },
  Express: { url: "https://expressjs.com/en/guide/routing.html", priority: "High" },
  PostgreSQL: { url: "https://www.postgresql.org/docs/current/tutorial.html", priority: "High" },
  MongoDB: { url: "https://www.mongodb.com/docs/manual/", priority: "High" },
  JavaScript: { url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", priority: "Medium" },
  SQL: { url: "https://www.w3schools.com/sql/", priority: "Medium" },
  Git: { url: "https://git-scm.com/doc", priority: "Medium" },
  Docker: { url: "https://docs.docker.com/get-started/", priority: "Medium" },
  Python: { url: "https://docs.python.org/3/tutorial/", priority: "Medium" },
  REST: { url: "https://restfulapi.net/", priority: "High" },
  "API Integration": { url: "https://developer.mozilla.org/en-US/docs/Web/API", priority: "Medium" },
};

function normalizeSkill(skill) {
  return String(skill || "").trim().toLowerCase();
}

function getPriorityByIndex(index) {
  if (index < 3) return "High";
  if (index < 6) return "Medium";
  return "Low";
}

function calculateProfileCompleteness(profile) {
  if (!profile) return 0;

  const fields = [
    profile.cgpa,
    profile.grad_year,
    profile.github_url,
    profile.linkedin_url,
    profile.portfolio_url,
    profile.target_role_id,
  ];

  const filled = fields.filter((value) => value !== null && value !== undefined && String(value).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function calculateResumeQuality(analysis) {
  if (!analysis) return 0;

  const skills = Array.isArray(analysis.extractedSkills) ? analysis.extractedSkills.length : 0;
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths.length : 0;
  const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses.length : 0;
  const suggestions = Array.isArray(analysis.suggestions) ? analysis.suggestions.length : 0;
  const aiScore = typeof analysis.readinessScore === "number" ? analysis.readinessScore : 0;

  const rawScore = skills * 8 + strengths * 10 + suggestions * 8 + (5 - Math.min(weaknesses, 5)) * 4 + aiScore;
  return Math.min(100, Math.round(rawScore / 4));
}

function calculateSkillMatch(expectedSkills, analysisSkills) {
  if (!Array.isArray(expectedSkills) || expectedSkills.length === 0) return 0;

  const skillSet = new Set((analysisSkills || []).map(normalizeSkill));
  const matched = expectedSkills.filter((skill) => skillSet.has(normalizeSkill(skill))).length;

  return Math.round((matched / expectedSkills.length) * 100);
}

function calculateExperienceBonus(profile, analysis) {
  const hasPortfolio = Boolean(profile?.github_url || profile?.portfolio_url || profile?.linkedin_url);
  const hasExperienceSignal = Array.isArray(analysis?.strengths)
    ? analysis.strengths.some((item) => /experience|project|internship|leadership|work/i.test(String(item)))
    : false;

  return hasPortfolio || hasExperienceSignal ? 10 : 0;
}

function calculateReadiness(profile, analysis, expectedSkills) {
  const profileCompleteness = calculateProfileCompleteness(profile);
  const resumeQuality = calculateResumeQuality(analysis);
  const skillMatch = calculateSkillMatch(expectedSkills, analysis?.extractedSkills || []);
  const experienceBonus = calculateExperienceBonus(profile, analysis);

  const weighted = Math.round(
    profileCompleteness * 0.25 +
      resumeQuality * 0.35 +
      skillMatch * 0.3 +
      experienceBonus * 0.1
  );

  return {
    profileCompleteness,
    resumeQuality,
    skillMatch,
    experienceBonus,
    score: weighted,
  };
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await pgPool.query(
      `SELECT id, name, email, cgpa, grad_year, github_url, linkedin_url, portfolio_url, target_role_id, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json(user);
  })
);

router.put(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { cgpa, grad_year, github_url, linkedin_url, portfolio_url, target_role_id } = req.body;

    const result = await pgPool.query(
      `UPDATE users
       SET cgpa = $1, grad_year = $2, github_url = $3, linkedin_url = $4, portfolio_url = $5, target_role_id = $6
       WHERE id = $7
       RETURNING id, name, email, cgpa, grad_year, github_url, linkedin_url, portfolio_url, target_role_id`,
      [cgpa, grad_year, github_url, linkedin_url, portfolio_url, target_role_id, req.user.id]
    );

    res.status(200).json(result.rows[0]);
  })
);

router.get(
  "/roles",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await pgPool.query(
      "SELECT id, name, expected_skills FROM target_roles ORDER BY id"
    );

    res.status(200).json({ roles: result.rows });
  })
);

router.get(
  "/readiness",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userResult = await pgPool.query(
      `SELECT id, name, email, cgpa, grad_year, github_url, linkedin_url, portfolio_url, target_role_id
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const latestAnalysis = await ResumeAnalysis.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    let expectedSkills = [];

    if (user.target_role_id) {
      const roleResult = await pgPool.query(
        "SELECT expected_skills FROM target_roles WHERE id = $1",
        [user.target_role_id]
      );
      expectedSkills = Array.isArray(roleResult.rows[0]?.expected_skills) ? roleResult.rows[0].expected_skills : [];
    }

    const readiness = calculateReadiness(user, latestAnalysis, expectedSkills);

    if (latestAnalysis) {
      latestAnalysis.deterministicReadinessScore = readiness.score;
      await latestAnalysis.save();
    }

    res.status(200).json({
      readiness,
      profile: user,
      latestAnalysis,
    });
  })
);

router.get(
  "/eligibility",
  requireAuth,
  asyncHandler(async (req, res) => {
    const companyId = req.query.companyId || req.query.company_id;

    if (!companyId) {
      throw new AppError("companyId is required", 400);
    }

    const criteriaResult = await pgPool.query(
      `SELECT c.name AS company_name, e.min_cgpa, e.min_grad_year, e.required_skills
       FROM eligibility_criteria e
       JOIN companies c ON c.id = e.company_id
       WHERE e.company_id = $1`,
      [companyId]
    );

    const criteria = criteriaResult.rows[0];
    if (!criteria) {
      throw new AppError("Company criteria not found", 404);
    }

    const userResult = await pgPool.query(
      `SELECT id, name, cgpa, grad_year FROM users WHERE id = $1`,
      [req.user.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const latestAnalysis = await ResumeAnalysis.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const userSkills = Array.isArray(latestAnalysis?.extractedSkills) ? latestAnalysis.extractedSkills : [];
    const requiredSkills = Array.isArray(criteria.required_skills) ? criteria.required_skills : [];
    const missingSkills = requiredSkills.filter((skill) => !userSkills.some((item) => normalizeSkill(item) === normalizeSkill(skill)));
    const meetsCgpa = user.cgpa !== null && user.cgpa !== undefined ? Number(user.cgpa) >= Number(criteria.min_cgpa || 0) : false;
    const meetsGradYear = user.grad_year !== null && user.grad_year !== undefined ? Number(user.grad_year) >= Number(criteria.min_grad_year || 0) : false;

    const isEligible = meetsCgpa && meetsGradYear && missingSkills.length === 0;

    res.status(200).json({
      company: criteria.company_name,
      eligible: isEligible,
      meetsCgpa,
      meetsGradYear,
      missingSkills,
      requiredSkills,
      minimumCgpa: criteria.min_cgpa,
      minimumGradYear: criteria.min_grad_year,
    });
  })
);

router.get(
  "/recommendations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userResult = await pgPool.query(
      `SELECT id, target_role_id FROM users WHERE id = $1`,
      [req.user.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new AppError("User not found", 404);
    }

    let expectedSkills = [];
    if (user.target_role_id) {
      const roleResult = await pgPool.query(
        "SELECT expected_skills FROM target_roles WHERE id = $1",
        [user.target_role_id]
      );
      expectedSkills = Array.isArray(roleResult.rows[0]?.expected_skills) ? roleResult.rows[0].expected_skills : [];
    }

    const latestAnalysis = await ResumeAnalysis.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const currentSkills = Array.isArray(latestAnalysis?.extractedSkills) ? latestAnalysis.extractedSkills : [];
    const missingSkills = expectedSkills.filter((skill) => !currentSkills.some((item) => normalizeSkill(item) === normalizeSkill(skill)));

    const items = missingSkills.map((skill, index) => {
      const mapping = RESOURCE_MAP[skill] || {
        url: `https://www.google.com/search?q=${encodeURIComponent(skill)}`,
        priority: getPriorityByIndex(index),
      };

      return {
        skill,
        priority: mapping.priority || getPriorityByIndex(index),
        resourceUrl: mapping.url,
      };
    });

    const recommendationDoc = await Recommendation.create({
      userId: req.user.id,
      items,
    });

    res.status(200).json({
      message: "Recommendations generated",
      items: recommendationDoc.items,
    });
  })
);

router.post(
  "/skill-gap",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { targetRoleId } = req.body || {};

    const userResult = await pgPool.query(
      "SELECT id, target_role_id FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const roleId = targetRoleId || user.target_role_id;
    if (!roleId) {
      throw new AppError("No target role selected. Please set target_role_id first.", 400);
    }

    const roleResult = await pgPool.query(
      "SELECT id, name, expected_skills FROM target_roles WHERE id = $1",
      [roleId]
    );

    const role = roleResult.rows[0];
    if (!role) {
      throw new AppError("Target role not found", 404);
    }

    const latestAnalysis = await ResumeAnalysis.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!latestAnalysis || !Array.isArray(latestAnalysis.extractedSkills) || latestAnalysis.extractedSkills.length === 0) {
      throw new AppError("No analyzed resume found. Please upload and analyze a resume first.", 400);
    }

    const resumeSkillSet = new Set(latestAnalysis.extractedSkills.map(normalizeSkill));
    const expectedSkills = Array.isArray(role.expected_skills) ? role.expected_skills : [];

    const missingSkills = expectedSkills.filter((skill) => !resumeSkillSet.has(normalizeSkill(skill)));
    const priority = {};
    missingSkills.forEach((skill, index) => {
      priority[skill] = getPriorityByIndex(index);
    });

    const skillGapDoc = await SkillGap.create({
      userId: req.user.id,
      targetRole: role.name,
      missingSkills,
      priority,
    });

    res.status(200).json({
      message: "Skill gap generated",
      skillGap: skillGapDoc,
    });
  })
);

module.exports = router;