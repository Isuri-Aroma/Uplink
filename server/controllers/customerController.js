import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/text.js';
import { parseNic } from '../utils/nic.js';

// Old and new NIC count as the same person
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

// GET /api/customers
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
  const subscriptions = await Subscription.find({}, 'customer accountNo status').sort({ createdAt: 1 });
  const accountsByCustomer = {};
  for (const sub of subscriptions) {
    const customerId = String(sub.customer);
    if (!accountsByCustomer[customerId]) accountsByCustomer[customerId] = [];
    accountsByCustomer[customerId].push({ accountNo: sub.accountNo, status: sub.status });
  }

  const rows = [];
  for (const customer of customers) {
    const accounts = accountsByCustomer[String(customer._id)] || [];
    rows.push({ ...customer.toJSON(), accounts, subscriptionCount: accounts.length });
  }

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
  // nicNormalized always comes from the NIC
  const { nicNormalized, ...fields } = req.body;
  customer.set(fields);
  await customer.save();
  res.json(customer);
});

// DELETE /api/customers/:id
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');

  // Block delete if they have subscriptions
  const count = await Subscription.countDocuments({ customer: customer._id });
  if (count > 0) {
    throw new ApiError(409, `${customer.nameWithInitials} has ${count} subscription(s). Delete them first.`);
  }
  await customer.deleteOne();
  res.json({ message: `Customer ${customer.nameWithInitials} deleted` });
});
