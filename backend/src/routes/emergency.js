import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { deviceId } from '../middleware/device.js';
import EmergencyContact from '../models/EmergencyContact.js';
import { sendEmergencyAlerts } from '../services/notificationService.js';
import { isDbConnected } from '../config/db.js';
import { badRequest, serverError } from '../utils/errors.js';

const router = Router();

function requireDb() {
  if (!isDbConnected()) throw serverError('Database not connected. Start MongoDB and retry.');
}

// GET /api/v1/emergency/contacts
router.get('/contacts', asyncHandler(async (req, res) => {
  requireDb();
  const contacts = await EmergencyContact.find({ deviceId: deviceId(req) }).sort({ createdAt: 1 });
  res.json({ success: true, data: contacts });
}));

// POST /api/v1/emergency/contacts
router.post('/contacts', asyncHandler(async (req, res) => {
  requireDb();
  const { name, phone, relation } = req.body || {};
  if (!name || !phone) throw badRequest('Both "name" and "phone" are required.');
  const contact = await EmergencyContact.create({ deviceId: deviceId(req), name, phone, relation });
  res.status(201).json({ success: true, data: contact });
}));

// DELETE /api/v1/emergency/contacts/:id
router.delete('/contacts/:id', asyncHandler(async (req, res) => {
  requireDb();
  await EmergencyContact.deleteOne({ _id: req.params.id, deviceId: deviceId(req) });
  res.json({ success: true, data: { id: req.params.id, status: 'deleted' } });
}));

// POST /api/v1/emergency/trigger
router.post('/trigger', asyncHandler(async (req, res) => {
  const id = deviceId(req);
  const { location } = req.body || {};
  let contacts = [];
  if (isDbConnected()) contacts = await EmergencyContact.find({ deviceId: id });
  if (!contacts.length) {
    return res.json({ success: true, message: 'No emergency contacts saved. Please add contacts first.', data: { contacts_notified: [] } });
  }

  const { mapsLink, results, provider } = await sendEmergencyAlerts(contacts, location, id);
  const notified = results.filter((r) => r.delivered).map((r) => r.name);
  const realDelivery = provider !== 'simulated' && notified.length > 0;

  res.json({
    success: true,
    message: `Emergency alerts sent to ${notified.length} contact${notified.length === 1 ? '' : 's'}.`,
    data: {
      contacts_notified: notified,
      location_link: mapsLink,
      provider,
      sent: realDelivery,           // true = a real SMS actually went out server-side
      simulated: provider === 'simulated',
      results,
    },
  });
}));

export default router;
