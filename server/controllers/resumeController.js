const { AppError, asyncHandler } = require("../middleware/errorHandler");
const ResumeAnalysis = require("../models/ResumeAnalysis");

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file was uploaded", 400);
  }

  const resumeUrl = req.file.path;

  const resumeDoc = await ResumeAnalysis.create({
    userId: req.user.id,
    resumeUrl: resumeUrl,
  });

  res.status(201).json({
    message: "Resume uploaded successfully",
    resumeUrl,
    resumeId: resumeDoc._id,
  });
});

module.exports = { uploadResume };