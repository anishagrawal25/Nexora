const mongoose = require("mongoose");

let isMongoConnected = false;

// Disable Mongoose command buffering so queries never hang for 10s when Mongo is not connected
mongoose.set("bufferCommands", false);

async function connectMongo() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set; using resilient in-memory storage fallback.");
    isMongoConnected = false;
    return false;
  }

  try {
    console.log("Attempting MongoDB Atlas connection...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    console.log("MongoDB connected to Atlas");
    isMongoConnected = true;
    return true;
  } catch (err) {
    console.warn(
      `MongoDB Atlas connection failed (${err.message}); using resilient local storage fallback.`
    );
    isMongoConnected = false;
    return false;
  }
}

function getIsMongoConnected() {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectMongo, getIsMongoConnected };