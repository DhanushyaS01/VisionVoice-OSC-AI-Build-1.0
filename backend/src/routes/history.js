import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { deviceId } from '../middleware/device.js';
import History from '../models/History.js';
import { isDbConnected } from '../config/db.js';
import { badRequest, serverError } from '../utils/errors.js';

const router = Router();
function requireDb() { if (!isDbConnected()) throw serverError('Database not connected. Start MongoDB and retry.'); }

// GET /api/v1/history?search=&type=&limit=
router.get('/', asyncHandler(async (req, res) => {
  requireDb();
  const { search, type, limit = 50 } = req.query;
  const query = { deviceId: deviceId(req) };
  if (type) query.type = type;
  if (search) query.$or = [
    { title: new RegExp(search, 'i') },
    { preview: new RegExp(search, 'i') },
    { rawText: new RegExp(search, 'i') },
  ];
  const items = await History.find(query).sort({ createdAt: -1 }).limit(Math.min(parseInt(limit, 10) || 50, 200));
  res.json({ success: true, data: items });
}));

// POST /api/v1/history
router.post('/', asyncHandler(async (req, res) => {
  requireDb();
  const { type, title, raw_text, ai_summary, icon, color, preview, data } = req.body || {};
  if (!type || !title) throw badRequest('Both "type" and "title" are required.');
  const doc = await History.create({
    deviceId: deviceId(req), type, title, icon, color,
    preview: preview || (raw_text || '').slice(0, 60),
    rawText: raw_text || '', aiSummary: ai_summary || '', data,
  });
  res.status(201).json({ success: true, data: { id: doc._id.toString(), status: 'saved' } });
}));

// DELETE /api/v1/history/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  requireDb();
  await History.deleteOne({ _id: req.params.id, deviceId: deviceId(req) });
  res.json({ success: true, data: { id: req.params.id, status: 'deleted' } });
}));

// DELETE /api/v1/history  (clear all for device)
router.delete('/', asyncHandler(async (req, res) => {
  requireDb();
  const r = await History.deleteMany({ deviceId: deviceId(req) });
  res.json({ success: true, data: { deleted: r.deletedCount } });
}));

export default router;
