import mongoose from 'mongoose';

export const CATEGORIES = [
  'No Connection', 'Slow Speed', 'Intermittent Drops', 'Router Issue', 'Billing Query', 'Relocation Request',
];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TICKET_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

// Allowed status changes
export const TICKET_CHANGES = {
  Open: ['In Progress', 'Resolved'],
  'In Progress': ['Resolved'],
  Resolved: ['Closed', 'In Progress'],
  Closed: [],
};

const activitySchema = new mongoose.Schema(
  {
    status: { type: String, enum: TICKET_STATUSES, required: true },
    note: { type: String, trim: true, maxlength: 500 },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // staff member who made the change
  },
  { _id: false }
);

// A fault on a subscription
const ticketSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, required: true, unique: true }, // TT-000045
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: [true, 'Subscription is required'],
      index: true,
    },
    category: { type: String, enum: CATEGORIES, required: [true, 'Category is required'] },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    priorityLevel: Number, // 1-4, for sorting
    subject: { type: String, required: [true, 'Subject is required'], trim: true, maxlength: 100 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 1000 },
    contactMobile: { type: String, match: [/^07\d{8}$/, 'Contact number must look like 07XXXXXXXX'] },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: TICKET_STATUSES, default: 'Open', index: true },
    activity: [activitySchema],
    resolution: { type: String, trim: true, maxlength: 500 },
    resolvedAt: Date,
    closedAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ticketSchema.pre('save', function (next) {
  this.priorityLevel = PRIORITIES.indexOf(this.priority) + 1;
  next();
});

// Hours from open to resolved
ticketSchema.virtual('hoursToResolve').get(function () {
  if (!this.resolvedAt || !this.createdAt) return null;
  return Math.round(((this.resolvedAt - this.createdAt) / 36e5) * 10) / 10;
});

export default mongoose.model('Ticket', ticketSchema);
