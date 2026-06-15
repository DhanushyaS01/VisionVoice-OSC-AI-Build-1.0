import mongoose from 'mongoose';
import config from './index.js';

let connected = false;

export async function connectDB() {
  if (connected) return mongoose.connection;
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
    connected = true;
    console.log(`✅ MongoDB connected: ${config.mongoUri}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   → Make sure MongoDB is running (e.g. open MongoDB Compass / mongod).');
    console.error('   → The API will keep running but DB-backed routes will error until connected.');
  }
  mongoose.connection.on('disconnected', () => { connected = false; });
  return mongoose.connection;
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
