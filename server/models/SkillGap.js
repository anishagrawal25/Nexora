const mongoose = require("mongoose");
const { memoryStore } = require("./mongoStore");

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

const MongooseSkillGap = mongoose.models.SkillGap || mongoose.model("SkillGap", skillGapSchema);

function wrapDoc(raw) {
  if (!raw) return null;
  const doc = { ...raw };
  doc.save = async function () {
    const idx = memoryStore.skillGaps.findIndex((item) => String(item._id) === String(doc._id));
    if (idx >= 0) {
      memoryStore.skillGaps[idx] = { ...memoryStore.skillGaps[idx], ...doc };
    }
    return doc;
  };
  return doc;
}

class SkillGapProxy {
  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseSkillGap.create(data);
    }
    const newDoc = {
      _id: "sg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      missingSkills: [],
      priority: {},
      createdAt: new Date(),
      ...data,
      userId: Number(data.userId),
    };
    memoryStore.skillGaps.push(newDoc);
    return wrapDoc(newDoc);
  }

  static findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseSkillGap.findOne(query);
    }

    const runQuery = () => {
      let filtered = [...memoryStore.skillGaps];
      if (query?.userId !== undefined) {
        filtered = filtered.filter((doc) => Number(doc.userId) === Number(query.userId));
      }
      return filtered;
    };

    return {
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
  }

  static find(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseSkillGap.find(query);
    }
    let list = [...memoryStore.skillGaps];
    if (query?.userId !== undefined) {
      list = list.filter((doc) => Number(doc.userId) === Number(query.userId));
    }
    return {
      sort: () => list.map(wrapDoc),
      then: (resolve) => resolve(list.map(wrapDoc)),
    };
  }
}

module.exports = SkillGapProxy;