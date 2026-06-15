import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, enum: ['Family', 'Doctor', 'Friend', 'Other'], default: 'Family' },
  },
  { timestamps: true }
);

export default mongoose.model('EmergencyContact', contactSchema);
