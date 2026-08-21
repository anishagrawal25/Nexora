const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: Number, // matches Postgres users.id
    required: true,
  },
  resumeUrl: {
    type: String,
    required: true,
  },
  extractedSkills: [String],
  strengths: [String],
  weaknesses: [String],
  suggestions: [String],
  readinessScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  deterministicReadinessScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);