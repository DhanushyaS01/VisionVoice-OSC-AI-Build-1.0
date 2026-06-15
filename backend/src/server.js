import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/index.js';
import { connectDB, isDbConnected } from './config/db.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { shutdownOcr } from './services/ocrService.js';

const app = express();

app.use(cors({ origin: config.clientOrigin === '*' ? true : config.clientOrigin.split(','), exposedHeaders: ['Content-Language'] }));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== 'test') app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', db: isDbConnected() ? 'connected' : 'disconnected', time: new Date().toISOString() }));

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDB();
  const server = app.listen(config.port, () => {
    console.log(`\n🚀 VisionVoice AI API running at http://localhost:${config.port}`);
    console.log(`   Base path: http://localhost:${config.port}/api/v1`);
    console.log(`   CORS origin: ${config.clientOrigin}`);

    // ---- Configuration diagnostics (no secrets printed) ----
    const geminiSet = !!config.geminiApiKey;
    const geminiLooksValid = /^AIza[\w-]{30,}$/.test(config.geminiApiKey);
    const smsProvider = (config.twilio.sid && config.twilio.token && config.twilio.from) ? 'Twilio'
      : config.fast2smsKey ? 'Fast2SMS'
      : (config.textbeltKey && config.textbeltKey !== 'textbelt') ? 'TextBelt'
      : (config.textbeltKey === 'textbelt') ? 'TextBelt (demo: 1 SMS/day)'
      : 'NONE (alerts simulated)';
    console.log('\n   🔑 Keys:');
    console.log(`      Gemini AI : ${geminiSet ? (geminiLooksValid ? 'set ✅' : 'set ⚠️  KEY FORMAT LOOKS WRONG — Gemini keys start with "AIza". Regenerate at https://aistudio.google.com/app/apikey') : 'NOT set (vision/chat will use fallbacks)'}`);
    console.log(`      OCR.space : ${config.ocrSpaceKey && config.ocrSpaceKey !== 'helloworld' ? 'set ✅' : 'demo key (rate-limited)'}`);
    console.log(`      SMS (SOS) : ${smsProvider}`);
    console.log(`      Fast2SMS  : ${config.fast2smsKey ? 'set ✅' : 'not set'}\n`);
  });

  const shutdown = async () => {
    console.log('\nShutting down…');
    await shutdownOcr().catch(() => {});
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();

export default app;
