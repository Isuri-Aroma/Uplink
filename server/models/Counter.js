import mongoose from 'mongoose';

// Stores the last number used for each kind of reference (SUB-000001, TT-000001, ...)
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

// Atomically takes the next number, so two requests can never get the same one
export async function nextNumber(name, prefix) {
  const counter = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `${prefix}-${String(counter.seq).padStart(6, '0')}`;
}

export default Counter;
