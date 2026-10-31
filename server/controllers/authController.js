import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/auth/login  { email, password }
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Same message for wrong email or password
  if (!user || !(await user.checkPassword(password))) {
    throw new ApiError(401, 'Email or password is incorrect');
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been disabled. Contact an admin.');

  user.lastLoginAt = new Date();
  await user.save();

  const { password: _, ...profile } = user.toObject();
  res.json({ token: signToken(user), user: profile });
});

// GET /api/auth/me  (who is signed in)
export const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// GET /api/auth/staff
export const staffList = asyncHandler(async (req, res) => {
  const staff = await User.find({ isActive: true }, 'name role').sort({ name: 1 });
  res.json(staff);
});
