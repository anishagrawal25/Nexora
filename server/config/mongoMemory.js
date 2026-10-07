/**
 * Resilient In-Memory Fallback Store for MongoDB models
 * Ensures zero-latency operations when MongoDB Atlas is unreachable or disconnected.
 */

const memoryStore = {
  resume_analyses: [],
  skill_gaps: [],
  recommendations: [],
  nextResumeId: 1,
  nextSkillGapId: 1,
  nextRecId: 1,
};

function matchUserCondition(docUserId, cond) {
  const targetId = cond.userId !== undefined ? cond.userId : cond;
  return Number(docUserId) === Number(targetId) || String(docUserId) === String(targetId);
}

function matchesFilter(doc, filter = {}) {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (filter.$or && Array.isArray(filter.$or)) {
    const matched = filter.$or.some((cond) => {
      if (cond.userId !== undefined) {
        return matchUserCondition(doc.userId, cond);
      }
      return matchesFilter(doc, cond);
    });
    if (!matched) return false;
  }

  if (filter.userId !== undefined) {
    if (!matchUserCondition(doc.userId, filter.userId)) return false;
  }

  if (filter._id !== undefined) {
    if (String(doc._id) !== String(filter._id)) return false;
  }

  if (filter.$and && Array.isArray(filter.$and)) {
    for (const cond of filter.$and) {
      if (cond.extractedSkills?.$exists) {
        if (!Array.isArray(doc.extractedSkills) || doc.extractedSkills.length === 0) {
          return false;
        }
      }
      if (cond["extractedSkills.0"]?.$exists) {
        if (!Array.isArray(doc.extractedSkills) || doc.extractedSkills.length === 0) {
          return false;
        }
      }
    }
  }

  return true;
}

function wrapDoc(doc, collection) {
  if (!doc) return null;
  const wrapped = { ...doc };
  wrapped.save = async function () {
    const index = collection.findIndex((d) => String(d._id) === String(this._id));
    if (index >= 0) {
      collection[index] = { ...this };
    } else {
      collection.push({ ...this });
    }
    return this;
  };
  return wrapped;
}

class MemoryQuery {
  constructor(collection, filter) {
    this.collection = collection;
    this.filter = filter;
    this.sortOrder = null;
    this.isSingle = true;
  }

  sort(sortObj) {
    this.sortOrder = sortObj;
    return this;
  }

  async exec() {
    let matches = this.collection.filter((item) => matchesFilter(item, this.filter));

    if (this.sortOrder?.createdAt === -1) {
      matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (this.sortOrder?.createdAt === 1) {
      matches.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    if (this.isSingle) {
      return matches.length > 0 ? wrapDoc(matches[0], this.collection) : null;
    }
    return matches.map((m) => wrapDoc(m, this.collection));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

const ResumeAnalysisMemory = {
  findOne(filter) {
    const query = new MemoryQuery(memoryStore.resume_analyses, filter);
    query.isSingle = true;
    return query;
  },

  async findById(id) {
    const found = memoryStore.resume_analyses.find(
      (d) => String(d._id) === String(id) || Number(d._id) === Number(id)
    );
    return found ? wrapDoc(found, memoryStore.resume_analyses) : null;
  },

  async create(data) {
    const doc = {
      _id: `mem_res_${memoryStore.nextResumeId++}_${Date.now()}`,
      userId: Number(data.userId),
      resumeUrl: data.resumeUrl,
      extractedSkills: data.extractedSkills || [],
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      suggestions: data.suggestions || [],
      readinessScore: data.readinessScore || null,
      deterministicReadinessScore: data.deterministicReadinessScore || null,
      createdAt: data.createdAt || new Date(),
    };
    memoryStore.resume_analyses.push(doc);
    return wrapDoc(doc, memoryStore.resume_analyses);
  },
};

const SkillGapMemory = {
  findOne(filter) {
    const query = new MemoryQuery(memoryStore.skill_gaps, filter);
    query.isSingle = true;
    return query;
  },

  find(filter) {
    const query = new MemoryQuery(memoryStore.skill_gaps, filter);
    query.isSingle = false;
    return query;
  },

  async create(data) {
    const doc = {
      _id: `mem_sg_${memoryStore.nextSkillGapId++}_${Date.now()}`,
      userId: Number(data.userId),
      targetRole: data.targetRole,
      missingSkills: data.missingSkills || [],
      priority: data.priority || {},
      isEstimate: Boolean(data.isEstimate),
      note: data.note || null,
      createdAt: data.createdAt || new Date(),
    };
    memoryStore.skill_gaps.push(doc);
    return wrapDoc(doc, memoryStore.skill_gaps);
  },
};

const RecommendationMemory = {
  findOne(filter) {
    const query = new MemoryQuery(memoryStore.recommendations, filter);
    query.isSingle = true;
    return query;
  },

  find(filter) {
    const query = new MemoryQuery(memoryStore.recommendations, filter);
    query.isSingle = false;
    return query;
  },

  async create(data) {
    const doc = {
      _id: `mem_rec_${memoryStore.nextRecId++}_${Date.now()}`,
      userId: Number(data.userId),
      items: data.items || [],
      createdAt: data.createdAt || new Date(),
    };
    memoryStore.recommendations.push(doc);
    return wrapDoc(doc, memoryStore.recommendations);
  },
};

module.exports = {
  memoryStore,
  ResumeAnalysisMemory,
  SkillGapMemory,
  RecommendationMemory,
};
