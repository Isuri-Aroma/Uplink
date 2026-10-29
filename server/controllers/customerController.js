import Customer from '../models/Customer.js';
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
  res.json({ count: customers.length, customers });
});

// GET /api/customers/:id
export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json(customer);
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

  // TODO when Subscriptions exist: block delete if this customer has any
  await customer.deleteOne();
  res.json({ message: `Customer ${customer.nameWithInitials} deleted` });
});
