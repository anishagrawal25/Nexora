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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SkillGap", skillGapSchema);