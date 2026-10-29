import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['admin', 'agent'];

// A staff member who signs in
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email address is not valid'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never sent back in API responses
    },
    role: { type: String, enum: ROLES, default: 'agent' },
    isActive: { type: Boolean, default: true }, // disabled staff cannot sign in
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash the password
const isHash = (v) => /^\$2[aby]\$\d{2}\$.{53}$/.test(v);

userSchema.pre('save', async function (next) {
  // Skip if unchanged or already hashed
  if (!this.isModified('password') || isHash(this.password)) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', userSchema);
