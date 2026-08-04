class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  console.error(err);
  res.status(status).json({ error: err.message || "Internal server error" });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { AppError, errorHandler, asyncHandler };