import multer from 'multer';
import config from '../config/index.js';

// In-memory storage — buffers go straight to sharp/ML, never touch disk.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxFileSizeBytes },
});
