import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visionvoice',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  ocrLangs: process.env.OCR_LANGS || 'eng+tam',
  openaiApiKey: (process.env.OPENAI_API_KEY || '').trim(),
  // Strip any stray inline comment / whitespace so the model id is always clean.
  openaiModel: ((process.env.OPENAI_MODEL || 'gpt-4o').split('#')[0]).trim() || 'gpt-4o',
  // Free cloud OCR (no card). Default is the rate-limited public demo key.
  ocrSpaceKey: (process.env.OCR_SPACE_API_KEY || 'helloworld').trim(),
  // FREE vision + chat AI (no card) via Google Gemini. Powers ALL smart features.
  geminiApiKey: (process.env.GEMINI_API_KEY || '').trim(),
  geminiModel: ((process.env.GEMINI_MODEL || 'gemini-2.0-flash').split('#')[0]).trim() || 'gemini-2.0-flash',
  textbeltKey: (process.env.TEXTBELT_KEY || '').trim(),
  fast2smsKey: (process.env.FAST2SMS_API_KEY || '').trim(),
  twilio: {
    sid: (process.env.TWILIO_ACCOUNT_SID || '').trim(),
    token: (process.env.TWILIO_AUTH_TOKEN || '').trim(),
    from: (process.env.TWILIO_FROM_NUMBER || '').trim(),
  },
  upload: {
    maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB — allow high-res phone photos
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/bmp'],
    maxDimension: 2048, // recognition working size (was 1024)
    ocrMaxDimension: 3000, // larger working size for text recognition
  },
};

export default config;
