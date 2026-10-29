import { ApiError } from '../utils/ApiError.js';

// Runs when no route matched the request.
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Turns every error into the same JSON shape: { message, details? }
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong on the server';
  let details = err.details;

  if (err.name === 'ValidationError') {
    // Mongoose schema rule failed (required, enum, min, ...)
    status = 400;
    message = 'Some fields are invalid';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    // e.g. /api/plans/abc where "abc" is not a valid id
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    // Unique index clash, e.g. two customers with the same NIC
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `A record with this ${field} already exists`;
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && status === 500 && { stack: err.stack }),
  });
}
