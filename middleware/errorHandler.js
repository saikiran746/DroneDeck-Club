// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;

