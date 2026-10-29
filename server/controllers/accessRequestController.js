import AccessRequest from '../models/AccessRequest.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/text.js';

// POST /api/access-requests (public)
export const createRequest = asyncHandler(async (req, res) => {
  const { name, email, employeeId, team, password, reason } = req.body;

  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists. Sign in instead.');
  if (await AccessRequest.exists({ email, status: 'Pending' })) {
    throw new ApiError(409, 'A request for this email is already waiting for approval');
  }

  await AccessRequest.create({ name, email, employeeId, team, password, reason });
  res.status(201).json({ message: 'Request sent. An admin will review it.' });
});

// GET /api/access-requests
export const listRequests = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { employeeId: rx }];
  }

  const grouped = await AccessRequest.aggregate([{ $group: { _id: '$status', total: { $sum: 1 } } }]);
  const counts = Object.fromEntries(grouped.map((g) => [g._id, g.total]));

  if (status) filter.status = status;
  const requests = await AccessRequest.find(filter).populate('reviewedBy', 'name').sort({ createdAt: -1 });
  res.json({ count: requests.length, counts, requests });
});

async function findPending(id) {
  const request = await AccessRequest.findById(id).select('+password');
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'Pending') throw new ApiError(400, `This request was already ${request.status.toLowerCase()}`);
  return request;
}

// PATCH /api/access-requests/:id/approve
export const approveRequest = asyncHandler(async (req, res) => {
  const request = await findPending(req.params.id);
  if (await User.exists({ email: request.email })) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({
    name: request.name,
    email: request.email,
    password: request.password, // already hashed
    role: req.body.role || 'agent',
  });

  request.status = 'Approved';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  res.json({ message: `${user.name} can now sign in as ${user.role}`, request });
});

// PATCH /api/access-requests/:id/reject
export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await findPending(req.params.id);
  request.status = 'Rejected';
  request.rejectReason = req.body.reason;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();
  res.json({ message: `Request from ${request.name} rejected`, request });
});

// DELETE /api/access-requests/:id
export const deleteRequest = asyncHandler(async (req, res) => {
  const request = await AccessRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status === 'Pending') throw new ApiError(409, 'Approve or reject this request before deleting it');
  await request.deleteOne();
  res.json({ message: `Request from ${request.name} deleted` });
});
