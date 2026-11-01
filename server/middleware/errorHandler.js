import { ApiError } from '../utils/ApiError.js';

// Names for duplicate errors
const FIELD_LABELS = { nicNormalized: 'NIC', routerSerial: 'router serial', accountNo: 'account number' };

// Runs when no route matched the request.
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Every error as { message, details }
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong on the server';
  let details = err.details;

  if (err.name === 'ValidationError') {
    // Schema rule failed
    status = 400;
    message = 'Some fields are invalid';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    // Bad id
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    // Duplicate value
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `A record with this ${FIELD_LABELS[field] || field} already exists`;
  }

  if (status === 500) console.error(err);

  const body = { message };
  if (details) body.details = details;
  if (process.env.NODE_ENV === 'development' && status === 500) body.stack = err.stack;
  res.status(status).json(body);
}
