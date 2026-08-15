const { AppError, asyncHandler } = require("../middleware/errorHandler");

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("No file was uploaded", 400);
  }

  const resumeUrl = req.file.path;

  res.status(201).json({
    message: "Resume uploaded successfully",
    resumeUrl,
  });
});

module.exports = { uploadResume };