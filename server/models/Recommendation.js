const mongoose = require("mongoose");
const { RecommendationMemory } = require("../config/mongoMemory");

const recommendationSchema = new mongoose.Schema(
  {
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
  },
  { bufferCommands: false }
);

const MongooseRecommendation =
  mongoose.models.Recommendation || mongoose.model("Recommendation", recommendationSchema);

const ResilientRecommendation = {
  findOne(filter) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = MongooseRecommendation.findOne(filter);
        return {
          sort(sortObj) {
            query.sort(sortObj);
            return this;
          },
          async exec() {
            try {
              return await query.exec();
            } catch (err) {
              return RecommendationMemory.findOne(filter).sort(query.options?.sort).exec();
            }
          },
          then(resolve, reject) {
            return query
              .exec()
              .catch(() => RecommendationMemory.findOne(filter).sort(query.options?.sort).exec())
              .then(resolve, reject);
          },
          catch(reject) {
            return this.then((res) => res, reject);
          },
        };
      } catch (err) {
        return RecommendationMemory.findOne(filter);
      }
    }
    return RecommendationMemory.findOne(filter);
  },

  find(filter) {
    if (mongoose.connection.readyState === 1) {
      try {
        return MongooseRecommendation.find(filter);
      } catch (err) {
        return RecommendationMemory.find(filter);
      }
    }
    return RecommendationMemory.find(filter);
  },

  async create(data) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseRecommendation.create(data);
      } catch (err) {
        // Fallback to memory
      }
    }
    return RecommendationMemory.create(data);
  },
};

module.exports = ResilientRecommendation;