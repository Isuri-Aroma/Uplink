import Subscription from '../models/Subscription.js';
import Ticket from '../models/Ticket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const QUEUE = ['Open', 'In Progress'];

// Month label like 2026-11
function monthKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

// GET /api/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find().populate('plan', 'name technology monthlyFeeLKR');
  const tickets = await Ticket.find();

  // Subscription totals
  const statuses = {};
  let monthlyRevenue = 0;
  for (const sub of subscriptions) {
    statuses[sub.status] = (statuses[sub.status] || 0) + 1;
    if (sub.status === 'Active') monthlyRevenue += sub.plan.monthlyFeeLKR;
  }

  // Start with the last 12 months at zero
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: monthKey(date), total: 0 });
  }

  // Count new orders in each month
  for (const sub of subscriptions) {
    const key = monthKey(sub.createdAt);
    const row = months.find((m) => m.month === key);
    if (row) row.total += 1;
  }

  // Count current subscribers per plan
  const planRows = {};
  for (const sub of subscriptions) {
    if (sub.status === 'Terminated') continue;
    const id = String(sub.plan._id);
    if (!planRows[id]) {
      planRows[id] = { name: sub.plan.name, technology: sub.plan.technology, total: 0 };
    }
    planRows[id].total += 1;
  }

  // Top 5 plans, ties by name
  const topPlans = Object.values(planRows);
  topPlans.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  topPlans.splice(5);

  // Ticket totals
  const ticketStats = { queue: 0, critical: 0, unassigned: 0 };
  let resolvedCount = 0;
  let totalResolveMs = 0;
  for (const ticket of tickets) {
    if (QUEUE.includes(ticket.status)) {
      ticketStats.queue += 1;
      if (ticket.priority === 'Critical') ticketStats.critical += 1;
      if (!ticket.assignedTo) ticketStats.unassigned += 1;
    }
    if (ticket.resolvedAt) {
      resolvedCount += 1;
      totalResolveMs += ticket.resolvedAt - ticket.createdAt;
    }
  }

  // Average hours from open to resolved
  let avgResolveHours = null;
  if (resolvedCount > 0) {
    const HOUR_MS = 60 * 60 * 1000;
    avgResolveHours = Math.round(totalResolveMs / resolvedCount / HOUR_MS);
  }

  // Five most urgent open faults
  const urgent = await Ticket.find({ status: { $in: QUEUE } })
    .sort({ priorityLevel: -1, createdAt: 1 })
    .limit(5)
    .select('ticketNo subject priority status createdAt subscription')
    .populate({
      path: 'subscription',
      select: 'accountNo installAddress customer',
      populate: { path: 'customer', select: 'nameWithInitials' },
    });

  res.json({
    statuses,
    totalSubscriptions: subscriptions.length,
    monthlyRevenue,
    tickets: ticketStats,
    avgResolveHours,
    resolvedCount,
    months,
    topPlans,
    urgent,
  });
});
