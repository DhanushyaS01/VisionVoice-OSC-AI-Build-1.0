import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import EmergencyContact from '../models/EmergencyContact.js';
import History from '../models/History.js';
import User from '../models/User.js';

const DEVICE = process.argv[2] || 'demo-device';

async function seed() {
  await connectDB();
  if (mongoose.connection.readyState !== 1) { console.error('DB not connected. Is MongoDB running?'); process.exit(1); }

  await Promise.all([
    EmergencyContact.deleteMany({ deviceId: DEVICE }),
    History.deleteMany({ deviceId: DEVICE }),
    User.deleteMany({ deviceId: DEVICE }),
  ]);

  await User.create({ deviceId: DEVICE, languagePref: 'en' });

  await EmergencyContact.insertMany([
    { deviceId: DEVICE, name: 'Priya (Sister)', phone: '+91 98765 43210', relation: 'Family' },
    { deviceId: DEVICE, name: 'Dr. Kumar', phone: '+91 87654 32109', relation: 'Doctor' },
    { deviceId: DEVICE, name: 'Ravi (Friend)', phone: '+91 76543 21098', relation: 'Friend' },
  ]);

  await History.insertMany([
    { deviceId: DEVICE, type: 'OCR', icon: 'scan', color: 'blue', title: 'Medicine Label', preview: 'Paracetamol 500mg - Take 1 tablet...', rawText: 'Paracetamol 500mg' },
    { deviceId: DEVICE, type: 'Currency', icon: 'banknote', color: 'green', title: 'Indian Rupee', preview: '₹500 - Five Hundred Rupees' },
    { deviceId: DEVICE, type: 'Object', icon: 'eye', color: 'purple', title: 'Scene Detection', preview: 'Chair, Table, Laptop, Coffee mug...' },
    { deviceId: DEVICE, type: 'Color', icon: 'palette', color: 'orange', title: 'Outfit Analysis', preview: 'Navy blue shirt with beige trousers' },
  ]);

  console.log(`✅ Seeded demo data for deviceId="${DEVICE}"`);
  await mongoose.connection.close();
  process.exit(0);
}
seed();
