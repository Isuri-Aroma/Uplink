import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/text.js';

// Sort options
const SORTS = {
  newest: { createdAt: -1 },
  name: { name: 1 },
  'fee-asc': { monthlyFeeLKR: 1 },
  'fee-desc': { monthlyFeeLKR: -1 },
  'speed-desc': { downMbps: -1 },
};

// GET /api/plans
export const listPlans = asyncHandler(async (req, res) => {
  const { search, technology, status, sort = 'newest' } = req.query;
  const filter = {};

  if (search?.trim()) filter.name = new RegExp(escapeRegex(search.trim()), 'i');
  if (technology) filter.technology = technology;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const plans = await Plan.find(filter).sort(SORTS[sort] || SORTS.newest).lean();

  // Subscriber count per plan
  const counts = await Subscription.aggregate([{ $group: { _id: '$plan', total: { $sum: 1 } } }]);
  const byPlan = Object.fromEntries(counts.map((c) => [String(c._id), c.total]));
  plans.forEach((p) => (p.subscriberCount = byPlan[String(p._id)] || 0));

  res.json({ count: plans.length, plans });
});

// GET /api/plans/:id
export const getPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Plan not found');
  res.json(plan);
});

// POST /api/plans
export const createPlan = asyncHandler(async (req, res) => {
  const plan = await Plan.create(req.body);
  res.status(201).json(plan);
});

// PUT /api/plans/:id
export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Plan not found');

  plan.set(req.body);
  await plan.save(); // runs schema checks
  res.json(plan);
});

// DELETE /api/plans/:id
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Plan not found');

  // Block delete if the plan is in use
  const inUse = await Subscription.countDocuments({ plan: plan._id });
  if (inUse > 0) {
    throw new ApiError(409, `${inUse} subscription(s) use "${plan.name}". Mark the plan inactive instead.`);
  }
  await plan.deleteOne();
  res.json({ message: `Plan "${plan.name}" deleted` });
});
