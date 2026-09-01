const { Pool: NeonPool } = require("@neondatabase/serverless");
const { Pool: PgPool } = require("pg");

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes("neon.tech");
const PoolClass = isNeon ? NeonPool : PgPool;

const pgPool = new PoolClass({
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
    console.error("Postgres connection failed. Code:", err.code, "Message:", err.message);
    return false;
  }
}

module.exports = { pgPool, connectPostgres };