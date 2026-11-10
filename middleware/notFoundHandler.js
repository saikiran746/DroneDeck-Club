// 404 Not Found middleware for undefined routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = notFoundHandler;

