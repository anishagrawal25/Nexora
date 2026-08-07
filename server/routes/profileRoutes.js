const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { pgPool } = require("../config/postgres");
const { AppError, asyncHandler } = require("../middleware/errorHandler");
const router = Router();

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

module.exports = router;