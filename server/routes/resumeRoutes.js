const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const upload = require("../config/upload");
const { uploadResume } = require("../controllers/resumeController");

const router = Router();

router.post("/upload", requireAuth, upload.single("resume"), uploadResume);

module.exports = router;