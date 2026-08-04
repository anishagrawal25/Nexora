const { Pool } = require("pg");

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function connectPostgres() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set; skipping Postgres connection.");
    return false;
  }

  try {
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Postgres connected");
    return true;
  } catch (err) {
    console.error("Postgres connection failed:", err.message);
    return false;
  }
}

module.exports = { pgPool, connectPostgres };