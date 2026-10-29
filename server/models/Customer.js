import mongoose from 'mongoose';
import { DISTRICTS } from '../utils/districts.js';
import { parseNic } from '../utils/nic.js';

export const CUSTOMER_TYPES = ['Residential', 'Business'];

// A broadband subscriber (CRM record). Customers do not log in to Uplink.
const customerSchema = new mongoose.Schema(
  {
    nameWithInitials: {
      type: String,
      required: [true, 'Name with initials is required'],
      trim: true,
      maxlength: 60,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 120,
    },
    nic: {
      type: String,
      required: [true, 'NIC number is required'],
      uppercase: true,
      trim: true,
    },
    // 12-digit form of the NIC, so 901234567V and 199012304567 count as the same person
    nicNormalized: { type: String, unique: true },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^07\d{8}$/, 'Mobile number must look like 07XXXXXXXX'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email address is not valid'],
    },
    address: {
      line1: { type: String, required: [true, 'Address is required'], trim: true, maxlength: 120 },
      city: { type: String, required: [true, 'City is required'], trim: true, maxlength: 60 },
      district: { type: String, required: [true, 'District is required'], enum: DISTRICTS },
    },
    customerType: { type: String, enum: CUSTOMER_TYPES, default: 'Residential' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Keep nicNormalized in sync whenever the NIC changes
customerSchema.pre('validate', function (next) {
  if (this.isModified('nic')) {
    const parsed = parseNic(this.nic);
    if (!parsed) this.invalidate('nic', 'NIC number is not valid');
    else this.nicNormalized = parsed.normalized;
  }
  next();
});

// Birth date and gender are worked out from the NIC, not stored separately
customerSchema.virtual('dateOfBirth').get(function () {
  return parseNic(this.nic)?.dateOfBirth;
});
customerSchema.virtual('gender').get(function () {
  return parseNic(this.nic)?.gender;
});

customerSchema.index({ 'address.district': 1 });

export default mongoose.model('Customer', customerSchema);
