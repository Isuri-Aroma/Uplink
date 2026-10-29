import Plan from '../models/Plan.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Allowed ?sort= values mapped to MongoDB sort objects
const SORTS = {
  newest: { createdAt: -1 },
  name: { name: 1 },
  'fee-asc': { monthlyFeeLKR: 1 },
  'fee-desc': { monthlyFeeLKR: -1 },
  'speed-desc': { downMbps: -1 },
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/plans?search=&technology=&status=active|inactive&sort=
export const listPlans = asyncHandler(async (req, res) => {
  const { search, technology, status, sort = 'newest' } = req.query;
  const filter = {};

  if (search?.trim()) filter.name = new RegExp(escapeRegex(search.trim()), 'i');
  if (technology) filter.technology = technology;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const plans = await Plan.find(filter).sort(SORTS[sort] || SORTS.newest);
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
  await plan.save(); // save() runs the schema validators, including up <= down
  res.json(plan);
});

// DELETE /api/plans/:id
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) throw new ApiError(404, 'Plan not found');

  // TODO when Subscriptions exist: block delete if any subscription uses this plan
  await plan.deleteOne();
  res.json({ message: `Plan "${plan.name}" deleted` });
});
