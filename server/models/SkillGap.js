const mongoose = require("mongoose");
const { SkillGapMemory } = require("../config/mongoMemory");

const skillGapSchema = new mongoose.Schema(
  {
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
  },
  { bufferCommands: false }
);

const MongooseSkillGap =
  mongoose.models.SkillGap || mongoose.model("SkillGap", skillGapSchema);

const ResilientSkillGap = {
  findOne(filter) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = MongooseSkillGap.findOne(filter);
        return {
          sort(sortObj) {
            query.sort(sortObj);
            return this;
          },
          async exec() {
            try {
              return await query.exec();
            } catch (err) {
              return SkillGapMemory.findOne(filter).sort(query.options?.sort).exec();
            }
          },
          then(resolve, reject) {
            return query
              .exec()
              .catch(() => SkillGapMemory.findOne(filter).sort(query.options?.sort).exec())
              .then(resolve, reject);
          },
          catch(reject) {
            return this.then((res) => res, reject);
          },
        };
      } catch (err) {
        return SkillGapMemory.findOne(filter);
      }
    }
    return SkillGapMemory.findOne(filter);
  },

  find(filter) {
    if (mongoose.connection.readyState === 1) {
      try {
        return MongooseSkillGap.find(filter);
      } catch (err) {
        return SkillGapMemory.find(filter);
      }
    }
    return SkillGapMemory.find(filter);
  },

  async create(data) {
    if (mongoose.connection.readyState === 1) {
      try {
        return await MongooseSkillGap.create(data);
      } catch (err) {
        // Fallback to memory
      }
    }
    return SkillGapMemory.create(data);
  },
};

module.exports = ResilientSkillGap;