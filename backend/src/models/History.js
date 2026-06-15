import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['OCR', 'Object', 'Medicine', 'Currency', 'Color', 'Companion'],
      required: true,
    },
    icon: { type: String, default: 'scan' },
    color: { type: String, default: 'blue' },
    title: { type: String, required: true },
    preview: { type: String, default: '' },
    rawText: { type: String, default: '' },
    aiSummary: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed }, // full structured result
  },
  { timestamps: true }
);

historySchema.index({ deviceId: 1, createdAt: -1 });
historySchema.index({ title: 'text', rawText: 'text', preview: 'text' });

export default mongoose.model('History', historySchema);
