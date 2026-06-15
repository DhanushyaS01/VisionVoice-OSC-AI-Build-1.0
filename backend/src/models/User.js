import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    languagePref: { type: String, enum: ['en', 'ta'], default: 'en' },
    settings: {
      theme: { type: String, default: 'dark' },
      voiceEnabled: { type: Boolean, default: true },
      speechRate: { type: Number, default: 1.0 },
      fontSize: { type: String, default: 'normal' },
      highContrast: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
