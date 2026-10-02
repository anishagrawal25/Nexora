const mongoose = require("mongoose");

const skillGapSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  missingSkills: [String],
  priority: {
    type: Map,
    of: String, // e.g. { "Docker": "High", "Redis": "Medium" }
  },
  isEstimate: {
    type: Boolean,
    default: false,
  },
  note: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.SkillGap || mongoose.model("SkillGap", skillGapSchema);