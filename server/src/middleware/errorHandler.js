import config from '../config/config.js';

export function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Determine status code
  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected internal error occurred';
  let details = err.details || null;

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed for one or more fields';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_RESOURCE';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account or record with that ${field} already exists`;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_IDENTIFIER';
    message = `Invalid identifier format for ${err.path}`;
  }

  // Log error (never log secrets or sensitive payloads)
  if (statusCode >= 500) {
    console.error(`[ERROR 500] ${req.method} ${req.originalUrl}:`, err.message);
  }

  // Safe client response (stack trace hidden in production, secrets never exposed)
  const response = {
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
      ...(config.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {})
    }
  };

  res.status(statusCode).json(response);
}

export default errorHandler;
