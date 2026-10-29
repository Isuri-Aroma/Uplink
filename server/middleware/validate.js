import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

// Stop the request if any rule failed
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
  next(new ApiError(400, 'Some fields are invalid', details));
}
