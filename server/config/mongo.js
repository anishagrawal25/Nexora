const mongoose = require("mongoose");

async function connectMongo() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set; skipping MongoDB connection.");
    return false;
  }

  try {
    console.log("Attempting Mongo connection...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    return false;
  }
}

module.exports = { connectMongo };