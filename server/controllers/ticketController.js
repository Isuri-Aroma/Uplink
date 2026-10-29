import mongoose from 'mongoose';
import Ticket, { TICKET_CHANGES } from '../models/Ticket.js';
import Subscription from '../models/Subscription.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import { nextNumber } from '../models/Counter.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/text.js';

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  priority: { priorityLevel: -1, createdAt: 1 }, // Critical first
};

const withDetails = (query) =>
  query
    .populate('assignedTo', 'name role')
    .populate('activity.by', 'name')
    .populate({
    path: 'subscription',
    select: 'accountNo status installAddress customer plan routerSerial',
    populate: [
      { path: 'customer', select: 'nameWithInitials mobile nic' },
      { path: 'plan', select: 'name technology' },
    ],
  });

const pickEditable = ({ category, priority, subject, description, contactMobile }) =>
  Object.fromEntries(
    Object.entries({ category, priority, subject, description, contactMobile }).filter(([, v]) => v !== undefined)
  );

// Staff id, null to unassign, undefined to keep
async function resolveAssignee(value) {
  if (value === undefined) return undefined;
  if (!value) return null;
  const user = await User.findById(value);
  if (!user || !user.isActive) throw new ApiError(400, 'Tickets can only be assigned to active staff');
  return user._id;
}

// GET /api/tickets
export const listTickets = asyncHandler(async (req, res) => {
  const { search, status, priority, category, assignedTo, sort = 'newest' } = req.query;
  const filter = {};

  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    const customers = await Customer.find(
      { $or: [{ nameWithInitials: rx }, { fullName: rx }, { nic: rx }, { mobile: rx }] },
      '_id'
    );
    const subscriptions = await Subscription.find(
      { $or: [{ accountNo: rx }, { customer: { $in: customers.map((c) => c._id) } }] },
      '_id'
    );
    filter.$or = [{ ticketNo: rx }, { subject: rx }, { subscription: { $in: subscriptions.map((s) => s._id) } }];
  }
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedTo === 'me') filter.assignedTo = req.user._id;
  else if (assignedTo === 'none') filter.assignedTo = null;
  else if (assignedTo && mongoose.isValidObjectId(assignedTo)) filter.assignedTo = new mongoose.Types.ObjectId(assignedTo);

  // Counts for the view tabs
  const grouped = await Ticket.aggregate([{ $match: filter }, { $group: { _id: '$status', total: { $sum: 1 } } }]);
  const counts = Object.fromEntries(grouped.map((g) => [g._id, g.total]));

  // "queue" = tickets still being worked on
  if (status === 'queue') filter.status = { $in: ['Open', 'In Progress'] };
  else if (status) filter.status = status;

  const tickets = await withDetails(Ticket.find(filter)).sort(SORTS[sort] || SORTS.newest);
  res.json({ count: tickets.length, counts, tickets });
});

// GET /api/tickets/:id
export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await withDetails(Ticket.findById(req.params.id));
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  res.json(ticket);
});

// POST /api/tickets
export const createTicket = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.body.subscription).populate('customer', 'mobile');
  if (!subscription) throw new ApiError(404, 'Subscription not found');
  if (subscription.status === 'Terminated') {
    throw new ApiError(400, `${subscription.accountNo} is terminated. Tickets can only be raised on live services.`);
  }

  const fields = pickEditable(req.body);
  const assignee = await resolveAssignee(req.body.assignedTo);
  const ticket = new Ticket({
    ...fields,
    assignedTo: assignee || undefined,
    contactMobile: fields.contactMobile || subscription.customer?.mobile, // call back the customer by default
    subscription: subscription._id,
    status: 'Open',
    activity: [{ status: 'Open', note: 'Ticket logged', by: req.user._id }],
  });
  await ticket.validate({ pathsToSkip: ['ticketNo'] });
  ticket.ticketNo = await nextNumber('ticket', 'TT');
  await ticket.save();

  res.status(201).json(await withDetails(Ticket.findById(ticket._id)));
});

// PUT /api/tickets/:id
export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  if (ticket.status === 'Closed') throw new ApiError(400, 'A closed ticket cannot be edited');

  ticket.set(pickEditable(req.body));
  const assignee = await resolveAssignee(req.body.assignedTo);
  if (assignee !== undefined) ticket.assignedTo = assignee;
  await ticket.save();
  res.json(await withDetails(Ticket.findById(ticket._id)));
});

// PATCH /api/tickets/:id/status
export const changeTicketStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  const allowed = TICKET_CHANGES[ticket.status];
  if (!allowed.includes(status)) {
    throw new ApiError(
      400,
      allowed.length
        ? `${ticket.ticketNo} is ${ticket.status}. It can only be changed to: ${allowed.join(', ')}`
        : 'A closed ticket cannot be changed'
    );
  }
  if (status === 'Resolved' && !note?.trim()) {
    throw new ApiError(400, 'Add a resolution note explaining how the fault was fixed', [
      { field: 'note', message: 'Resolution note is required' },
    ]);
  }

  if (status === 'Resolved') {
    ticket.resolution = note.trim();
    ticket.resolvedAt = new Date();
  }
  if (status === 'In Progress' && ticket.status === 'Resolved') {
    // Reopened: the earlier fix didn't hold
    ticket.resolvedAt = undefined;
    ticket.resolution = undefined;
  }
  if (status === 'Closed') ticket.closedAt = new Date();

  ticket.status = status;
  ticket.activity.push({ status, note, by: req.user._id });
  await ticket.save();

  res.json(await withDetails(Ticket.findById(ticket._id)));
});

// DELETE /api/tickets/:id (closed only)
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');
  if (ticket.status !== 'Closed') {
    throw new ApiError(409, `${ticket.ticketNo} is ${ticket.status}. Only closed tickets can be deleted.`);
  }

  await ticket.deleteOne();
  res.json({ message: `Ticket ${ticket.ticketNo} deleted` });
});
