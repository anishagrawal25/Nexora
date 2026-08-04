const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { connectPostgres } = require("./config/postgres");
const { connectMongo } = require("./config/mongo");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  const postgresReady = await connectPostgres();
  const mongoReady = await connectMongo();

  if (!postgresReady) {
    console.warn("Postgres unavailable; continuing without it.");
  }

  if (!mongoReady) {
    console.warn("MongoDB unavailable; continuing without it.");
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();