import mongoose from 'mongoose';
import { DISTRICTS } from '../utils/districts.js';

export const STATUSES = ['Pending', 'Active', 'Suspended', 'Terminated'];

// Allowed status changes
export const ALLOWED_CHANGES = {
  Pending: ['Active', 'Terminated'],
  Active: ['Suspended', 'Terminated'],
  Suspended: ['Active', 'Terminated'],
  Terminated: [],
};

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, trim: true, maxlength: 200 },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // staff member who made the change
  },
  { _id: false }
);

// A customer's broadband service
const subscriptionSchema = new mongoose.Schema(
  {
    accountNo: { type: String, required: true, unique: true }, // SUB-000123
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: [true, 'Customer is required'], index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: [true, 'Plan is required'], index: true },
    installAddress: {
      line1: { type: String, required: [true, 'Installation address is required'], trim: true, maxlength: 120 },
      city: { type: String, required: [true, 'City is required'], trim: true, maxlength: 60 },
      district: { type: String, required: [true, 'District is required'], enum: DISTRICTS },
    },
    status: { type: String, enum: STATUSES, default: 'Pending', index: true },
    statusHistory: [historySchema],
    installDate: Date,
    routerSerial: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true, // many subscriptions can have no router yet
      set: (value) => value || undefined, // blank means no router
      match: [/^[A-Z0-9-]{6,30}$/, 'Router serial must be 6-30 letters, numbers or dashes'],
    },
    usedGB: { type: Number, default: 0, min: [0, 'Data used cannot be negative'] },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);
