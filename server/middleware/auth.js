import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

// Lets the request through only with a valid "Authorization: Bearer <token>" header
export const protect = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Please sign in to continue');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Your session is invalid or has expired. Please sign in again.');
  }

  // Check the account still exists and is enabled, in case an admin disabled it
  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw new ApiError(401, 'This account is no longer active');

  req.user = user;
  next();
});

// Use after protect, e.g. router.delete('/:id', requireRole('admin'), ...)
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to do this. Ask an admin.'));
  }
  next();
};
