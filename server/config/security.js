function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

function getAllowedOrigins() {
  const configuredOrigins = String(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    if (configuredOrigins.length === 0) {
      throw new Error("CLIENT_ORIGIN must include the deployed frontend origin in production.");
    }
    return configuredOrigins;
  }

  return [...new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...configuredOrigins,
  ])];
}

function assertSecurityConfiguration() {
  getJwtSecret();
  getAllowedOrigins();
}

module.exports = { getJwtSecret, getAllowedOrigins, assertSecurityConfiguration };