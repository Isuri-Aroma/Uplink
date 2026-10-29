import Subscription from '../models/Subscription.js';
import Ticket from '../models/Ticket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const QUEUE = ['Open', 'In Progress'];

// GET /api/dashboard  (all figures in one request)
export const getDashboard = asyncHandler(async (req, res) => {
  const yearAgo = new Date();
  yearAgo.setMonth(yearAgo.getMonth() - 11, 1);
  yearAgo.setHours(0, 0, 0, 0);

  const [byStatus, revenue, monthly, topPlans, ticketStats, resolved, urgent] = await Promise.all([
    Subscription.aggregate([{ $group: { _id: '$status', total: { $sum: 1 } } }]),

    // Monthly revenue = fees of active lines
    Subscription.aggregate([
      { $match: { status: 'Active' } },
      { $lookup: { from: 'plans', localField: 'plan', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: null, total: { $sum: '$plan.monthlyFeeLKR' } } },
    ]),

    // New orders per month, last 12 months
    Subscription.aggregate([
      { $match: { createdAt: { $gte: yearAgo } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, total: { $sum: 1 } } },
    ]),

    // Plans with the most current subscribers
    Subscription.aggregate([
      { $match: { status: { $ne: 'Terminated' } } },
      { $group: { _id: '$plan', total: { $sum: 1 } } },
      { $sort: { total: -1, _id: 1 } },
      { $limit: 5 },
      { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $project: { _id: 0, name: '$plan.name', technology: '$plan.technology', total: 1 } },
      { $sort: { total: -1, name: 1 } },
    ]),

    Ticket.aggregate([
      { $match: { status: { $in: QUEUE } } },
      {
        $group: {
          _id: null,
          queue: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'Critical'] }, 1, 0] } },
          unassigned: { $sum: { $cond: [{ $ifNull: ['$assignedTo', false] }, 0, 1] } },
        },
      },
    ]),

    // Average hours from open to resolved
    Ticket.aggregate([
      { $match: { resolvedAt: { $exists: true } } },
      { $group: { _id: null, avgMs: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } }, count: { $sum: 1 } } },
    ]),

    Ticket.find({ status: { $in: QUEUE } })
      .sort({ priorityLevel: -1, createdAt: 1 })
      .limit(5)
      .select('ticketNo subject priority status createdAt subscription')
      .populate({ path: 'subscription', select: 'accountNo installAddress customer', populate: { path: 'customer', select: 'nameWithInitials' } }),
  ]);

  const statuses = Object.fromEntries(byStatus.map((s) => [s._id, s.total]));

  // Fill all 12 months, including empty ones
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(yearAgo.getFullYear(), yearAgo.getMonth() + i, 1);
    const hit = monthly.find((m) => m._id.y === d.getFullYear() && m._id.m === d.getMonth() + 1);
    months.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, total: hit?.total || 0 });
  }

  res.json({
    statuses,
    totalSubscriptions: byStatus.reduce((a, s) => a + s.total, 0),
    monthlyRevenue: revenue[0]?.total || 0,
    tickets: ticketStats[0] || { queue: 0, critical: 0, unassigned: 0 },
    avgResolveHours: resolved[0] ? Math.round(resolved[0].avgMs / 36e5) : null,
    resolvedCount: resolved[0]?.count || 0,
    months,
    topPlans,
    urgent,
  });
});
