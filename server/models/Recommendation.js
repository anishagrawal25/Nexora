const mongoose = require("mongoose");
const { memoryStore } = require("./mongoStore");

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

const MongooseRecommendation =
  mongoose.models.Recommendation || mongoose.model("Recommendation", recommendationSchema);

function wrapDoc(raw) {
  if (!raw) return null;
  const doc = { ...raw };
  doc.save = async function () {
    const idx = memoryStore.recommendations.findIndex(
      (item) => String(item._id) === String(doc._id)
    );
    if (idx >= 0) {
      memoryStore.recommendations[idx] = { ...memoryStore.recommendations[idx], ...doc };
    }
    return doc;
  };
  return doc;
}

class RecommendationProxy {
  static async create(data) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseRecommendation.create(data);
    }
    const newDoc = {
      _id: "rec_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      items: [],
      createdAt: new Date(),
      ...data,
      userId: Number(data.userId),
    };
    memoryStore.recommendations.push(newDoc);
    return wrapDoc(newDoc);
  }

  static findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseRecommendation.findOne(query);
    }

    const runQuery = () => {
      let filtered = [...memoryStore.recommendations];
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
      return MongooseRecommendation.find(query);
    }
    let list = [...memoryStore.recommendations];
    if (query?.userId !== undefined) {
      list = list.filter((doc) => Number(doc.userId) === Number(query.userId));
    }
    return {
      sort: () => list.map(wrapDoc),
      then: (resolve) => resolve(list.map(wrapDoc)),
    };
  }
}

module.exports = RecommendationProxy;