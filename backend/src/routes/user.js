import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { deviceId } from '../middleware/device.js';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { serverError } from '../utils/errors.js';

const router = Router();
function requireDb() { if (!isDbConnected()) throw serverError('Database not connected. Start MongoDB and retry.'); }

// GET /api/v1/user  — fetch or create the device's profile + settings
router.get('/', asyncHandler(async (req, res) => {
  requireDb();
  const id = deviceId(req);
  let user = await User.findOne({ deviceId: id });
  if (!user) user = await User.create({ deviceId: id });
  res.json({ success: true, data: user });
}));

// PUT /api/v1/user/settings — persist settings + language
router.put('/settings', asyncHandler(async (req, res) => {
  requireDb();
  const id = deviceId(req);
  const { languagePref, settings } = req.body || {};
  const update = {};
  if (languagePref) update.languagePref = languagePref;
  if (settings) for (const [k, v] of Object.entries(settings)) update[`settings.${k}`] = v;
  const user = await User.findOneAndUpdate({ deviceId: id }, { $set: update }, { new: true, upsert: true });
  res.json({ success: true, data: user });
}));

export default router;
