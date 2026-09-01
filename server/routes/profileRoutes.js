const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { pgPool } = require("../config/postgres");
const { AppError, asyncHandler } = require("../middleware/errorHandler");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const SkillGap = require("../models/SkillGap");
const Recommendation = require("../models/Recommendation");
const {
  calculateReadiness,
  findResource,
  getPriorityByIndex,
  normalizeSkill,
} = require("../utils/pureFunctions");

const router = Router();

/**
 * Resilient helper to fetch the latest analyzed resume document for a user.
 * Handles number vs string ID variations and prioritizes resumes with extractedSkills.
 */
async function getLatestAnalyzedResume(userId) {
  const numId = Number(userId);
  const strId = String(userId);
  const userConditions = [{ userId: numId }];
  if (!isNaN(numId)) {
    userConditions.push({ userId: strId });
  }

  // 1. Look for an analyzed resume with non-empty skills
  let analysis = await ResumeAnalysis.findOne({
    $or: userConditions,
    $and: [
      { extractedSkills: { $exists: true } },
      { "extractedSkills.0": { $exists: true } },
    ],
  }).sort({ createdAt: -1 });

  // 2. Fallback to latest resume document if no fully analyzed document exists yet
  if (!analysis) {
    analysis = await ResumeAnalysis.findOne({
      $or: userConditions,
    }).sort({ createdAt: -1 });
  }

  return analysis;
}

// -------------------------------------------------------------
// PROFILE ROUTES
// -------------------------------------------------------------

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
      [
        cgpa !== undefined ? cgpa : null,
        grad_year !== undefined ? grad_year : null,
        github_url || null,
        linkedin_url || null,
        portfolio_url || null,
        target_role_id || null,
        req.user.id,
      ]
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
  "/companies",
  requireAuth,
  asyncHandler(async (req, res) => {
    // Select unique companies
    const result = await pgPool.query(
      "SELECT DISTINCT ON (name) id, name FROM companies ORDER BY name, id"
    );

    res.status(200).json({ companies: result.rows });
  })
);

// -------------------------------------------------------------
// READINESS ENDPOINT
// -------------------------------------------------------------

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

    const latestAnalysis = await getLatestAnalyzedResume(req.user.id);
    let expectedSkills = [];
    let targetRoleName = null;

    if (user.target_role_id) {
      const roleResult = await pgPool.query(
        "SELECT id, name, expected_skills FROM target_roles WHERE id = $1",
        [user.target_role_id]
      );
      if (roleResult.rows[0]) {
        targetRoleName = roleResult.rows[0].name;
        expectedSkills = Array.isArray(roleResult.rows[0].expected_skills)
          ? roleResult.rows[0].expected_skills
          : [];
      }
    }

    const readiness = calculateReadiness(user, latestAnalysis, expectedSkills);

    if (latestAnalysis && typeof latestAnalysis.save === "function") {
      latestAnalysis.deterministicReadinessScore = readiness.score;
      await latestAnalysis.save();
    }

    res.status(200).json({
      readiness,
      profile: {
        ...user,
        target_role_name: targetRoleName,
      },
      latestAnalysis,
    });
  })
);

// -------------------------------------------------------------
// ELIGIBILITY ENDPOINT
// -------------------------------------------------------------

router.get(
  "/eligibility",
  requireAuth,
  asyncHandler(async (req, res) => {
    const companyId = req.query.companyId || req.query.company_id;

    const userResult = await pgPool.query(
      `SELECT id, name, cgpa, grad_year FROM users WHERE id = $1`,
      [req.user.id]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const latestAnalysis = await getLatestAnalyzedResume(req.user.id);
    const userSkills = Array.isArray(latestAnalysis?.extractedSkills)
      ? latestAnalysis.extractedSkills
      : [];

    if (companyId) {
      const criteriaResult = await pgPool.query(
        `SELECT c.id AS company_id, c.name AS company_name, e.min_cgpa, e.min_grad_year, e.required_skills
         FROM companies c
         LEFT JOIN eligibility_criteria e ON e.company_id = c.id
         WHERE c.id = $1`,
        [companyId]
      );

      const criteria = criteriaResult.rows[0];
      if (!criteria) {
        throw new AppError("Company not found", 404);
      }

      const requiredSkills = Array.isArray(criteria.required_skills) ? criteria.required_skills : [];
      const missingSkills = requiredSkills.filter(
        (skill) => !userSkills.some((item) => normalizeSkill(item) === normalizeSkill(skill))
      );

      const meetsCgpa =
        user.cgpa !== null && user.cgpa !== undefined && criteria.min_cgpa
          ? Number(user.cgpa) >= Number(criteria.min_cgpa)
          : false;

      const meetsGradYear =
        user.grad_year !== null && user.grad_year !== undefined && criteria.min_grad_year
          ? Number(user.grad_year) >= Number(criteria.min_grad_year)
          : false;

      const isEligible = meetsCgpa && meetsGradYear && missingSkills.length === 0;

      return res.status(200).json({
        company: criteria.company_name,
        companyId: Number(companyId),
        eligible: isEligible,
        meetsCgpa,
        meetsGradYear,
        missingSkills,
        requiredSkills,
        minimumCgpa: criteria.min_cgpa,
        minimumGradYear: criteria.min_grad_year,
      });
    }

    // If no companyId specified, return eligibility overview for all companies
    const allCriteriaResult = await pgPool.query(
      `SELECT DISTINCT ON (c.name) c.id AS company_id, c.name AS company_name, e.min_cgpa, e.min_grad_year, e.required_skills
       FROM companies c
       LEFT JOIN eligibility_criteria e ON e.company_id = c.id
       ORDER BY c.name, c.id`
    );

    const companies = allCriteriaResult.rows.map((row) => {
      const requiredSkills = Array.isArray(row.required_skills) ? row.required_skills : [];
      const missingSkills = requiredSkills.filter(
        (skill) => !userSkills.some((item) => normalizeSkill(item) === normalizeSkill(skill))
      );
      const meetsCgpa =
        user.cgpa !== null && user.cgpa !== undefined && row.min_cgpa
          ? Number(user.cgpa) >= Number(row.min_cgpa)
          : false;
      const meetsGradYear =
        user.grad_year !== null && user.grad_year !== undefined && row.min_grad_year
          ? Number(user.grad_year) >= Number(row.min_grad_year)
          : false;
      const isEligible = meetsCgpa && meetsGradYear && missingSkills.length === 0;

      return {
        companyId: row.company_id,
        company: row.company_name,
        eligible: isEligible,
        meetsCgpa,
        meetsGradYear,
        missingSkills,
        requiredSkills,
        minimumCgpa: row.min_cgpa,
        minimumGradYear: row.min_grad_year,
      };
    });

    res.status(200).json({ companies });
  })
);

// -------------------------------------------------------------
// RECOMMENDATIONS ENDPOINT
// -------------------------------------------------------------

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
      expectedSkills = Array.isArray(roleResult.rows[0]?.expected_skills)
        ? roleResult.rows[0].expected_skills
        : [];
    }

    const latestAnalysis = await getLatestAnalyzedResume(req.user.id);
    const currentSkills = Array.isArray(latestAnalysis?.extractedSkills)
      ? latestAnalysis.extractedSkills
      : [];

    // If no target role selected, provide recommendations based on general high-demand skills
    let targetSkills = expectedSkills;
    if (targetSkills.length === 0) {
      targetSkills = ["React", "Node.js", "PostgreSQL", "Docker", "Git", "REST APIs"];
    }

    const missingSkills = targetSkills.filter(
      (skill) => !currentSkills.some((item) => normalizeSkill(item) === normalizeSkill(skill))
    );

    const items = missingSkills.map((skill, index) => {
      const resource = findResource(skill);
      return {
        skill,
        priority: resource.priority || getPriorityByIndex(index),
        resourceUrl: resource.url,
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

// -------------------------------------------------------------
// SKILL-GAP ENDPOINTS (POST & GET)
// -------------------------------------------------------------

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
      throw new AppError("No target role selected. Please select a target role first.", 400);
    }

    const roleResult = await pgPool.query(
      "SELECT id, name, expected_skills FROM target_roles WHERE id = $1",
      [roleId]
    );

    const role = roleResult.rows[0];
    if (!role) {
      throw new AppError("Target role not found", 404);
    }

    // Retrieve analyzed resume using resilient helper
    const latestAnalysis = await getLatestAnalyzedResume(req.user.id);
    if (
      !latestAnalysis ||
      !Array.isArray(latestAnalysis.extractedSkills) ||
      latestAnalysis.extractedSkills.length === 0
    ) {
      throw new AppError(
        "No analyzed resume found. Please upload and analyze a resume first.",
        400
      );
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

    // Ensure priority map is serialized cleanly as a plain object
    const rawPriority =
      skillGapDoc.priority instanceof Map
        ? Object.fromEntries(skillGapDoc.priority)
        : skillGapDoc.priority || priority;

    res.status(200).json({
      message: "Skill gap generated",
      skillGap: {
        _id: skillGapDoc._id,
        userId: skillGapDoc.userId,
        targetRole: skillGapDoc.targetRole,
        missingSkills: skillGapDoc.missingSkills,
        priority: rawPriority,
        createdAt: skillGapDoc.createdAt,
      },
    });
  })
);

router.get(
  "/skill-gap",
  requireAuth,
  asyncHandler(async (req, res) => {
    // Find latest computed skill gap
    let latestGap = await SkillGap.findOne({
      $or: [{ userId: Number(req.user.id) }, { userId: String(req.user.id) }],
    }).sort({ createdAt: -1 });

    if (latestGap) {
      const rawPriority =
        latestGap.priority instanceof Map
          ? Object.fromEntries(latestGap.priority)
          : latestGap.priority || {};

      return res.status(200).json({
        skillGap: {
          _id: latestGap._id,
          userId: latestGap.userId,
          targetRole: latestGap.targetRole,
          missingSkills: latestGap.missingSkills,
          priority: rawPriority,
          createdAt: latestGap.createdAt,
        },
      });
    }

    res.status(200).json({ skillGap: null });
  })
);

module.exports = router;