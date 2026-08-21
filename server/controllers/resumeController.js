const { AppError, asyncHandler } = require("../middleware/errorHandler");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { PDFParse } = require("pdf-parse");
const genAI = require("../config/gemini");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(model, prompt, maxAttempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      lastError = err;
      const message = String(err?.message || "");
      const isTemporary503 = message.includes("503") || message.includes("high demand");

      if (!isTemporary503 || attempt === maxAttempts) {
        break;
      }

      // Backoff reduces immediate retries when Gemini is under temporary load.
      await wait(1200 * attempt);
    }
  }

  throw lastError;
}

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

  // Extract plain text from the PDF
  const parser = new PDFParse({ data: pdfBuffer });
  const result = await parser.getText();
  const resumeText = result.text;

  // Build the prompt
  const prompt = `You are a career advisor analyzing a resume for a student preparing for internships or entry-level jobs.

Analyze the following resume text and respond with ONLY a valid JSON object, no other text, matching this exact structure:

{
  "skills": ["array of technical and soft skills found in the resume"],
  "strengths": ["array of 2-4 specific strengths, referencing actual resume content"],
  "weaknesses": ["array of 2-4 specific weaknesses or gaps"],
  "suggestions": ["array of 2-4 specific, actionable improvement suggestions"],
  "readinessScore": <a number from 0 to 100 representing overall resume quality and completeness>
}

Resume text:
"""
${resumeText}
"""`;

  // Call Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  let responseText;
  try {
    const aiResult = await generateWithRetry(model, prompt, 3);
    responseText = aiResult.response.text();
  } catch (err) {
    const message = String(err?.message || "");
    const isTemporary503 = message.includes("503") || message.includes("high demand");

    if (isTemporary503) {
      throw new AppError("AI service is busy right now. Please retry in a few seconds.", 503);
    }

    throw new AppError("AI analysis failed. Please try again.", 502);
  }

  // Parse the JSON response
  let analysisData;
  try {
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    analysisData = JSON.parse(cleanedText);
  } catch (err) {
    throw new AppError("AI returned an invalid response format", 502);
  }

  // Save the analysis to the existing Mongo document
  resumeDoc.extractedSkills = analysisData.skills;
  resumeDoc.strengths = analysisData.strengths;
  resumeDoc.weaknesses = analysisData.weaknesses;
  resumeDoc.suggestions = analysisData.suggestions;
  resumeDoc.readinessScore = analysisData.readinessScore;
  await resumeDoc.save();

  res.status(200).json({
    message: "Resume analyzed successfully",
    analysis: resumeDoc,
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