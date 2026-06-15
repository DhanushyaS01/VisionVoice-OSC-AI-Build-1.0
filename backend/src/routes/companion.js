import { Router } from 'express';
import { asyncHandler } from '../middleware/error.js';
import { deviceId } from '../middleware/device.js';
import { companionChat } from '../services/nlpService.js';
import { saveHistory } from '../utils/history.js';
import { resolveLang, maybeTranslate } from '../utils/localization.js';
import { badRequest } from '../utils/errors.js';

const router = Router();

// POST /api/v1/ai/companion/chat
router.post('/companion/chat', asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const { message, context } = req.body || {};
  if (!message || !message.trim()) throw badRequest('A "message" field is required.');

  const result = await companionChat(message.trim(), context || {});
  result.response_text = await maybeTranslate(result.response_text, lang);

  await saveHistory({
    deviceId: deviceId(req), type: 'Companion', icon: 'bot', color: 'purple',
    title: 'Voice Companion', preview: message.slice(0, 60),
    rawText: message, aiSummary: result.response_text, data: result,
  });

  res.json({ success: true, data: result });
}));

export default router;
