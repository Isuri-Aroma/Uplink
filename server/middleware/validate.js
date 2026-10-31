import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// Search and filter values must be plain text
export function plainQuery(req, res, next) {
  const allText = Object.values(req.query).every((value) => typeof value === 'string');
  if (!allText) return next(new ApiError(400, 'Invalid search or filter value'));
  next();
}

// Stop the request if any rule failed
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new ApiError(400, 'Some fields are invalid', details));
}
