import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/text.js';
import { parseNic } from '../utils/nic.js';

// Old and new NIC formats of the same person count as a duplicate
async function ensureNicIsFree(nic, ignoreId) {
  const parsed = parseNic(nic);
  if (!parsed) return;
  const existing = await Customer.findOne({ nicNormalized: parsed.normalized, _id: { $ne: ignoreId } });
  if (existing) {
    throw new ApiError(409, `This NIC is already registered to ${existing.nameWithInitials}`);
  }
}

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name: { nameWithInitials: 1 },
};

// GET /api/customers?search=&district=&type=&sort=
// search matches name, NIC or mobile number
export const listCustomers = asyncHandler(async (req, res) => {
  const { search, district, type, sort = 'newest' } = req.query;
  const filter = {};

  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ nameWithInitials: rx }, { fullName: rx }, { nic: rx }, { mobile: rx }];
  }
  if (district) filter['address.district'] = district;
  if (type) filter.customerType = type;

  const customers = await Customer.find(filter).sort(SORTS[sort] || SORTS.newest);

  // Account numbers per customer
  const subs = await Subscription.aggregate([
    { $sort: { createdAt: 1 } },
    { $group: { _id: '$customer', accounts: { $push: { accountNo: '$accountNo', status: '$status' } } } },
  ]);
  const byCustomer = Object.fromEntries(subs.map((s) => [String(s._id), s.accounts]));
  const rows = customers.map((c) => {
    const accounts = byCustomer[String(c._id)] || [];
    return { ...c.toJSON(), accounts, subscriptionCount: accounts.length };
  });

  res.json({ count: rows.length, customers: rows });
});

// GET /api/customers/:id
export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');

  const subscriptions = await Subscription.find({ customer: customer._id })
    .populate('plan', 'name technology downMbps upMbps monthlyFeeLKR')
    .sort({ createdAt: -1 });
  res.json({ ...customer.toJSON(), subscriptions });
});

// POST /api/customers
export const createCustomer = asyncHandler(async (req, res) => {
  await ensureNicIsFree(req.body.nic);
  const customer = await Customer.create(req.body);
  res.status(201).json(customer);
});

// PUT /api/customers/:id
export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');

  if (req.body.nic) await ensureNicIsFree(req.body.nic, customer._id);
  customer.set(req.body);
  await customer.save();
  res.json(customer);
});

// DELETE /api/customers/:id
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');

  // Safe delete: a customer with subscriptions keeps their record
  const count = await Subscription.countDocuments({ customer: customer._id });
  if (count > 0) {
    throw new ApiError(409, `${customer.nameWithInitials} has ${count} subscription(s). Delete or reassign them first.`);
  }
  await customer.deleteOne();
  res.json({ message: `Customer ${customer.nameWithInitials} deleted` });
});
