import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const TEAMS = ['Customer Care', 'Field Operations', 'Network Operations', 'Billing', 'Sales'];
export const REQUEST_STATUSES = ['Pending', 'Approved', 'Rejected'];

// A new staff member asking for an Uplink account
const accessRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@uplink\.lk$/, 'Use your @uplink.lk work email'],
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      uppercase: true,
      match: [/^UPL-\d{4}$/, 'Employee ID looks like UPL-1043'],
    },
    team: { type: String, enum: TEAMS, required: [true, 'Team is required'] },
    password: { type: String, required: true, select: false }, // bcrypt hash
    reason: { type: String, trim: true, maxlength: 300 },
    status: { type: String, enum: REQUEST_STATUSES, default: 'Pending', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    rejectReason: { type: String, trim: true, maxlength: 200 },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete ret.password; return ret; } }, // never send the hash
  }
);

accessRequestSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

accessRequestSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('AccessRequest', accessRequestSchema);
