import mongoose from 'mongoose';
import Subscription, { ALLOWED_CHANGES, STATUSES } from '../models/Subscription.js';
import Customer from '../models/Customer.js';
import Plan from '../models/Plan.js';
import Ticket from '../models/Ticket.js';
import { nextNumber } from '../models/Counter.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/text.js';

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  account: { accountNo: 1 },
  installed: { installDate: -1 },
};

// Add customer and plan details
const withDetails = (query) =>
  query
    .populate('customer', 'nameWithInitials fullName nic mobile email address customerType')
    .populate('plan', 'name technology downMbps upMbps dataCapGB monthlyFeeLKR isActive')
    .populate('statusHistory.by', 'name');

async function findActivePlan(id) {
  const plan = await Plan.findById(id);
  if (!plan) throw new ApiError(404, 'Plan not found');
  if (!plan.isActive) throw new ApiError(400, `Plan "${plan.name}" is no longer sold. Choose an active plan.`);
  return plan;
}

// Editable fields (status has its own route)
function pickEditable(body) {
  const fields = {};
  if (body.installAddress !== undefined) fields.installAddress = body.installAddress;
  if (body.routerSerial !== undefined) fields.routerSerial = body.routerSerial;
  if (body.installDate !== undefined) fields.installDate = body.installDate;
  if (body.usedGB !== undefined) fields.usedGB = body.usedGB;
  if (body.notes !== undefined) fields.notes = body.notes;
  return fields;
}

// GET /api/subscriptions
export const listSubscriptions = asyncHandler(async (req, res) => {
  const { search, status, plan, district, sort = 'newest' } = req.query;
  const filter = {};

  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    const customers = await Customer.find(
      { $or: [{ nameWithInitials: rx }, { fullName: rx }, { nic: rx }, { mobile: rx }] },
      '_id'
    );
    filter.$or = [{ accountNo: rx }, { routerSerial: rx }, { customer: { $in: customers.map((c) => c._id) } }];
  }
  if (plan && mongoose.isValidObjectId(plan)) filter.plan = plan;
  if (district) filter['installAddress.district'] = district;

  // Counts for the status tabs
  const counts = {};
  for (const name of STATUSES) {
    counts[name] = await Subscription.countDocuments({ ...filter, status: name });
  }

  if (status) filter.status = status;
  const subscriptions = await withDetails(Subscription.find(filter)).sort(SORTS[sort] || SORTS.newest);
  res.json({ count: subscriptions.length, counts, subscriptions });
});

// GET /api/subscriptions/:id
export const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await withDetails(Subscription.findById(req.params.id));
  if (!subscription) throw new ApiError(404, 'Subscription not found');
  res.json(subscription);
});

// POST /api/subscriptions
export const createSubscription = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.body.customer);
  if (!customer) throw new ApiError(404, 'Customer not found');
  const plan = await findActivePlan(req.body.plan);

  const fields = pickEditable(req.body);
  const subscription = new Subscription({
    ...fields,
    // Default to the customer's address
    installAddress: { ...customer.address.toObject(), ...fields.installAddress },
    customer: customer._id,
    plan: plan._id,
    status: 'Pending',
    statusHistory: [{ status: 'Pending', note: `New connection ordered on ${plan.name}`, by: req.user._id }],
  });
  // Validate before taking a number
  await subscription.validate({ pathsToSkip: ['accountNo'] });
  subscription.accountNo = await nextNumber('subscription', 'SUB');
  await subscription.save();

  res.status(201).json(await withDetails(Subscription.findById(subscription._id)));
});

// PUT /api/subscriptions/:id
export const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id).populate('plan', 'name');
  if (!subscription) throw new ApiError(404, 'Subscription not found');
  if (subscription.status === 'Terminated') throw new ApiError(400, 'A terminated subscription cannot be edited');

  if (req.body.plan && String(req.body.plan) !== String(subscription.plan._id)) {
    const newPlan = await findActivePlan(req.body.plan);
    subscription.statusHistory.push({
      status: subscription.status,
      note: `Plan changed from ${subscription.plan.name} to ${newPlan.name}`,
      by: req.user._id,
    });
    subscription.plan = newPlan._id;
  }

  subscription.set(pickEditable(req.body));
  await subscription.save();
  res.json(await withDetails(Subscription.findById(subscription._id)));
});

// PATCH /api/subscriptions/:id/status
export const changeStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const subscription = await Subscription.findById(req.params.id);
  if (!subscription) throw new ApiError(404, 'Subscription not found');

  const allowed = ALLOWED_CHANGES[subscription.status];
  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      allowed.length
        ? `${subscription.accountNo} is ${subscription.status}. It can only be changed to: ${allowed.join(', ')}`
        : 'A terminated subscription cannot be changed'
    );
  }

  // Suspending or terminating needs a reason
  if (['Suspended', 'Terminated'].includes(status) && !note?.trim()) {
    throw new ApiError(400, 'Add a reason for this change', [{ field: 'note', message: 'Reason is required' }]);
  }

  // Open faults must be finished first
  if (status === 'Terminated') {
    const openTickets = await Ticket.countDocuments({
      subscription: subscription._id,
      status: { $in: ['Open', 'In Progress'] },
    });
    if (openTickets > 0) {
      throw new ApiError(409, `${subscription.accountNo} has ${openTickets} open ticket(s). Resolve them before terminating.`);
    }
  }

  subscription.status = status;
  subscription.statusHistory.push({ status, note, by: req.user._id });
  if (status === 'Active' && !subscription.installDate) subscription.installDate = new Date();
  await subscription.save();

  res.json(await withDetails(Subscription.findById(subscription._id)));
});

// DELETE /api/subscriptions/:id
// Only Pending or Terminated can be deleted
export const deleteSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);
  if (!subscription) throw new ApiError(404, 'Subscription not found');
  if (['Active', 'Suspended'].includes(subscription.status)) {
    throw new ApiError(409, `${subscription.accountNo} is ${subscription.status}. Terminate it before deleting.`);
  }
  const ticketCount = await Ticket.countDocuments({ subscription: subscription._id });
  if (ticketCount > 0) {
    throw new ApiError(409, `${subscription.accountNo} has ${ticketCount} ticket(s) on record. Delete them first.`);
  }

  await subscription.deleteOne();
  res.json({ message: `Subscription ${subscription.accountNo} deleted` });
});
