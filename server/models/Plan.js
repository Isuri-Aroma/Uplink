import mongoose from 'mongoose';

export const TECHNOLOGIES = ['Fibre', 'VDSL', '4G LTE', '5G'];

// A broadband package in the product catalogue, e.g. "Fibre 100" at 100/50 Mbps
const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true,
      maxlength: [60, 'Plan name must be 60 characters or less'],
    },
    technology: {
      type: String,
      required: [true, 'Technology is required'],
      enum: { values: TECHNOLOGIES, message: 'Technology must be one of: ' + TECHNOLOGIES.join(', ') },
    },
    downMbps: {
      type: Number,
      required: [true, 'Download speed is required'],
      min: [1, 'Download speed must be at least 1 Mbps'],
      max: [10000, 'Download speed cannot exceed 10,000 Mbps'],
    },
    upMbps: {
      type: Number,
      required: [true, 'Upload speed is required'],
      min: [1, 'Upload speed must be at least 1 Mbps'],
      validate: {
        // Broadband plans are never faster up than down
        validator: function (value) {
          return this.downMbps == null || value <= this.downMbps;
        },
        message: 'Upload speed cannot be higher than download speed',
      },
    },
    dataCapGB: {
      type: Number,
      default: 0, // 0 means unlimited
      min: [0, 'Data cap cannot be negative'],
    },
    monthlyFeeLKR: {
      type: Number,
      required: [true, 'Monthly fee is required'],
      min: [0, 'Monthly fee cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description must be 300 characters or less'],
    },
    isActive: {
      type: Boolean,
      default: true, // inactive plans stay in the catalogue but can't be sold
    },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
