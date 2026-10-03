const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// EVENT LOOP DEMONSTRATION (safe to leave in — runs once on startup, no side effects)
// This proves synchronous code always runs before queued async callbacks,
// regardless of the order they're written in.
console.log("1. Synchronous code runs first");
setTimeout(() => console.log("4. setTimeout (macrotask) runs last"), 0);
Promise.resolve().then(() => console.log("3. Promise .then (microtask) runs before setTimeout"));
console.log("2. Synchronous code again — still before either async callback");

dotenv.config();

const { connectPostgres } = require("./config/postgres");
const { connectMongo } = require("./config/mongo");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { errorHandler } = require("./middleware/errorHandler");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// Support both /api/* and non-prefixed routes for deployment flexibility
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/profile", profileRoutes);
app.use("/profile", profileRoutes);

app.use("/api/resume", resumeRoutes);
app.use("/resume", resumeRoutes);

// If client build exists (fullstack deployment), serve static files
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.get("/", (req, res, next) => {
  if (fs.existsSync(clientDistPath)) {
    return res.sendFile(path.join(clientDistPath, "index.html"));
  }
  res.status(200).json({
    name: "Nexora Career Readiness API",
    status: "online",
    message: "Nexora backend server is running successfully.",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      profile: "/api/profile",
      resume: "/api/resume",
    },
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    status: "online",
    message: "Nexora API root",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// SPA fallback for frontend client routing when deployed together
if (fs.existsSync(clientDistPath)) {
  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/auth") ||
      req.path.startsWith("/profile") ||
      req.path.startsWith("/resume") ||
      req.path.startsWith("/health")
    ) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

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