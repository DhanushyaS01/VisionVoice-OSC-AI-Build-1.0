import { Router } from 'express';
import config from '../config/index.js';
import ocr from './ocr.js';
import vision from './vision.js';
import medicine from './medicine.js';
import currency from './currency.js';
import companion from './companion.js';
import emergency from './emergency.js';
import history from './history.js';
import user from './user.js';

const router = Router();

router.get('/', (req, res) => res.json({ name: 'VisionVoice AI API', version: 'v1', status: 'ok' }));

// Quick config check (no secrets exposed). Open http://localhost:8000/api/v1/status
router.get('/status', (req, res) => {
  const geminiSet = !!config.geminiApiKey;
  const geminiLooksValid = /^AIza[\w-]{30,}$/.test(config.geminiApiKey);
  const smsProvider = (config.twilio.sid && config.twilio.token && config.twilio.from) ? 'twilio'
    : config.fast2smsKey ? 'fast2sms'
    : config.textbeltKey ? 'textbelt'
    : 'none';
  res.json({
    success: true,
    data: {
      gemini: { configured: geminiSet, key_format_valid: geminiLooksValid,
        note: geminiSet && !geminiLooksValid ? 'Key does not look like a Gemini key (should start with "AIza"). Regenerate at https://aistudio.google.com/app/apikey' : 'ok' },
      ocr_space: { configured: !!config.ocrSpaceKey, using_demo_key: config.ocrSpaceKey === 'helloworld' },
      sms: { provider: smsProvider, fast2sms_configured: !!config.fast2smsKey,
        note: smsProvider === 'none' ? 'No SMS gateway — SOS will be simulated.' : `SOS sends via ${smsProvider}` },
    },
  });
});

router.use('/ocr', ocr);
router.use('/vision', vision);
router.use('/health', medicine);     // /health/medicine/scan
router.use('/finance', currency);    // /finance/currency/detect
router.use('/ai', companion);        // /ai/companion/chat
router.use('/emergency', emergency);
router.use('/history', history);
router.use('/user', user);

export default router;
