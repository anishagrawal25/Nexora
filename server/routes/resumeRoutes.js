const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const upload = require("../config/upload");
const { uploadResume, analyzeResume } = require("../controllers/resumeController");

const router = Router();

router.post("/upload", requireAuth, upload.single("resume"), uploadResume);
router.post("/analyze", requireAuth, analyzeResume);

module.exports = router;