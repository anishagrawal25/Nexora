const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { connectPostgres } = require("./config/postgres");
const { connectMongo } = require("./config/mongo");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
app.use(errorHandler);
// EVENT LOOP NOTE: `await connectPostgres()` and `await connectMongo()`
// below do NOT block Node's single thread while waiting for the network.
// Node hands the actual TCP/DB connection work off to the OS/libuv thread
// pool, and the JS call stack is freed up immediately. The event loop
// keeps checking whether that pending work has completed, and only then
// pushes the "continue running this function" callback back onto the
// call stack. This is why a slow or hanging DB connection here doesn't
// freeze the whole Node process — it just delays THIS function's
// continuation, while the event loop remains free to process other
// things in the meantime.

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