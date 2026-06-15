import History from '../models/History.js';
import { isDbConnected } from '../config/db.js';

// Persist a scan result to MongoDB (no-op if DB is down, so scans never fail).
export async function saveHistory(entry) {
  if (!isDbConnected()) return null;
  try {
    const doc = await History.create(entry);
    return doc._id.toString();
  } catch (e) {
    console.warn('History save failed:', e.message);
    return null;
  }
}
