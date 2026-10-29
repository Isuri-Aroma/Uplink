import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/text.js';

const SORTS = { newest: { createdAt: -1 }, name: { name: 1 }, 'last-login': { lastLoginAt: -1 } };

// The system must always keep at least one active admin
async function ensureAnotherAdmin(user) {
  const others = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: user._id } });
  if (others === 0) throw new ApiError(409, 'Uplink needs at least one active admin. Add another admin first.');
}

// GET /api/users?search=&role=&status=active|disabled&sort=
export const listUsers = asyncHandler(async (req, res) => {
  const { search, role, status, sort = 'name' } = req.query;
  const filter = {};

  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'disabled') filter.isActive = false;

  const users = await User.find(filter).sort(SORTS[sort] || SORTS.name);
  res.json({ count: users.length, users });
});

// GET /api/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Staff member not found');
  res.json(user);
});

// POST /api/users
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, isActive } = req.body;
  const user = await User.create({ name, email, password, role, isActive });
  res.status(201).json(await User.findById(user._id));
});

// PUT /api/users/:id  (a new password here works as a reset)
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Staff member not found');

  const { name, email, password, role, isActive } = req.body;
  const isSelf = user._id.equals(req.user._id);
  const losingAdmin = user.role === 'admin' && ((role && role !== 'admin') || isActive === false);

  if (isSelf && losingAdmin) throw new ApiError(400, 'You cannot remove your own admin access or disable yourself');
  if (losingAdmin) await ensureAnotherAdmin(user);

  Object.entries({ name, email, password, role, isActive }).forEach(([key, value]) => {
    if (value !== undefined) user[key] = value;
  });
  await user.save();
  res.json(await User.findById(user._id));
});

// DELETE /api/users/:id  (their open tickets become unassigned)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Staff member not found');
  if (user._id.equals(req.user._id)) throw new ApiError(400, 'You cannot delete your own account');
  if (user.role === 'admin') await ensureAnotherAdmin(user);

  await Ticket.updateMany({ assignedTo: user._id }, { $unset: { assignedTo: 1 } });
  await user.deleteOne();
  res.json({ message: `${user.name} removed from Uplink` });
});
