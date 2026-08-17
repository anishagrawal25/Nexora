const { AppError, asyncHandler } = require("../middleware/errorHandler");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { PDFParse } = require("pdf-parse");
const genAI = require("../config/gemini");

const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;

  if (!resumeId) {
    throw new AppError("resumeId is required", 400);
  }

  const resumeDoc = await ResumeAnalysis.findById(resumeId);

  if (!resumeDoc) {
    throw new AppError("Resume not found", 404);
  }

  // Fetch the actual PDF file from its Cloudinary URL
  const response = await fetch(resumeDoc.resumeUrl);
  const arrayBuffer = await response.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);

  // Extract plain text from the PDF using the pdf-parse v2 API
  const parser = new PDFParse({ data: pdfBuffer });
  const result = await parser.getText();
  const resumeText = result.text;

  res.status(200).json({
    message: "Text extracted successfully",
    textPreview: resumeText.slice(0, 300),
  });
});

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

module.exports = { uploadResume, analyzeResume };