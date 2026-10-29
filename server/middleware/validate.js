import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// Runs after the express-validator rules and stops the request if any failed
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new ApiError(400, 'Some fields are invalid', details));
}
