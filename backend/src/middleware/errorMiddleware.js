const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Catch 404 routes
const notFound = (req, res, next) => {
  return ApiResponse.error(res, `Route not found: ${req.originalUrl}`, 404);
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(`${req.method} ${req.originalUrl} - Error: ${err.message}`, err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return ApiResponse.error(res, message, 404);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `An account or record already exists with that ${field}`;
    return ApiResponse.error(res, message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return ApiResponse.error(res, messages.join(', '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid authentication token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Authentication token has expired', 401);
  }

  return ApiResponse.error(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Server Error',
    err.statusCode || 500
  );
};

module.exports = {
  notFound,
  errorHandler
};
