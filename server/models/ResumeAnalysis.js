const mongoose = require("mongoose");
const { memoryStore } = require("./mongoStore");

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

const MongooseResumeAnalysis =
  mongoose.models.ResumeAnalysis || mongoose.model("ResumeAnalysis", resumeAnalysisSchema);

function wrapDoc(raw) {
  if (!raw) return null;
  const doc = { ...raw };
  doc.save = async function () {
    const idx = memoryStore.resumeAnalyses.findIndex(
      (item) => String(item._id) === String(doc._id)
    );
    if (idx >= 0) {
      memoryStore.resumeAnalyses[idx] = { ...memoryStore.resumeAnalyses[idx], ...doc };
    }
    return doc;
  };
  return doc;
}

class ResumeAnalysisProxy {
  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseResumeAnalysis.create(data);
    }
    const newDoc = {
      _id: "res_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      extractedSkills: [],
      strengths: [],
      weaknesses: [],
      suggestions: [],
      createdAt: new Date(),
      ...data,
      userId: Number(data.userId),
    };
    memoryStore.resumeAnalyses.push(newDoc);
    return wrapDoc(newDoc);
  }

  static async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseResumeAnalysis.findById(id);
    }
    const found = memoryStore.resumeAnalyses.find((doc) => String(doc._id) === String(id));
    return wrapDoc(found);
  }

  static findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseResumeAnalysis.findOne(query);
    }

    const runQuery = () => {
      let filtered = [...memoryStore.resumeAnalyses];

      if (query) {
        if (query.$or) {
          filtered = filtered.filter((doc) =>
            query.$or.some((cond) => {
              if (cond.userId !== undefined) {
                return Number(doc.userId) === Number(cond.userId);
              }
              return true;
            })
          );
        } else if (query.userId !== undefined) {
          filtered = filtered.filter((doc) => Number(doc.userId) === Number(query.userId));
        }

        if (query["extractedSkills.0"] || query.$and) {
          filtered = filtered.filter(
            (doc) => Array.isArray(doc.extractedSkills) && doc.extractedSkills.length > 0
          );
        }
      }

      return filtered;
    };

    const builder = {
      sort: (sortObj) => ({
        then: (resolve, reject) => {
          try {
            const list = runQuery();
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            resolve(wrapDoc(list[0] || null));
          } catch (e) {
            reject(e);
          }
        },
      }),
      then: (resolve, reject) => {
        try {
          const list = runQuery();
          resolve(wrapDoc(list[0] || null));
        } catch (e) {
          reject(e);
        }
      },
    };

    return builder;
  }

  static find(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseResumeAnalysis.find(query);
    }
    let list = [...memoryStore.resumeAnalyses];
    if (query?.userId !== undefined) {
      list = list.filter((doc) => Number(doc.userId) === Number(query.userId));
    }
    return {
      sort: () => list.map(wrapDoc),
      then: (resolve) => resolve(list.map(wrapDoc)),
    };
  }
}

module.exports = ResumeAnalysisProxy;