const mongoose = require("mongoose");
const { ResumeAnalysisMemory } = require("../config/mongoMemory");

const resumeAnalysisSchema = new mongoose.Schema(
  {
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
  },
  { bufferCommands: false }
);

const MongooseResumeAnalysis =
  mongoose.models.ResumeAnalysis || mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

// Resilient wrapper: routes to Mongoose if connected, falls back seamlessly to memory store
const ResilientResumeAnalysis = {
  findOne(filter) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = MongooseResumeAnalysis.findOne(filter);
        return {
          sort(sortObj) {
            query.sort(sortObj);
            return this;
          },
          async exec() {
            try {
              return await query.exec();
            } catch (err) {
              return ResumeAnalysisMemory.findOne(filter).sort(query.options?.sort).exec();
            }
          },
          then(resolve, reject) {
            return query
              .exec()
              .catch(() => ResumeAnalysisMemory.findOne(filter).sort(query.options?.sort).exec())
              .then(resolve, reject);
          },
          catch(reject) {
            return this.then((res) => res, reject);
          },
        };
      } catch (err) {
        return ResumeAnalysisMemory.findOne(filter);
      }
    }
    return ResumeAnalysisMemory.findOne(filter);
  },

  async findById(id) {
    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseResumeAnalysis.findById(id);
        if (doc) return doc;
      } catch (err) {
        // Fallback to memory
      }
    }
    return ResumeAnalysisMemory.findById(id);
  },

  async create(data) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseResumeAnalysis.create(data);
      } catch (err) {
        // Fallback to memory
      }
    }
    return ResumeAnalysisMemory.create(data);
  },
};

module.exports = ResilientResumeAnalysis;