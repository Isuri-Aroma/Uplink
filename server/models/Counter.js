import mongoose from 'mongoose';

// Last number used for SUB- and TT- references
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

// Next number, safe for parallel requests
export async function nextNumber(name, prefix) {
  const counter = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `${prefix}-${String(counter.seq).padStart(6, '0')}`;
}

export default Counter;
