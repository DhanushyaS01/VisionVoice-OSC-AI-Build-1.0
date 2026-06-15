import { ApiError } from '../utils/errors.js';

// Wrap async route handlers so thrown errors reach the error middleware.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found`, status: 404 } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, status: err.status } });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(422).json({ error: { code: 'FILE_TOO_LARGE', message: 'Image too large. Maximum size is 5 MB.', status: 422 } });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message || 'Internal server error', status: 500 } });
}
