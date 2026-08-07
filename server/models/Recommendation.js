const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  items: [
    {
      skill: String,
      priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
      },
      resourceUrl: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Recommendation", recommendationSchema);