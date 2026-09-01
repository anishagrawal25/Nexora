const mongoose = require("mongoose");

async function connectMongo() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set; using resilient in-memory storage fallback.");
    return false;
  }

  try {
    console.log("Attempting MongoDB Atlas connection...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("MongoDB connected to Atlas");
    return true;
  } catch (err) {
    console.warn("MongoDB Atlas connection failed (" + err.message + "); using resilient local storage fallback.");
    return false;
  }
}

module.exports = { connectMongo };