import { VALID_DENOMINATIONS, rupeesToWords } from '../utils/numberToWords.js';

// Detect Indian Rupee denomination from OCR text + word confidences.
// Real notes print the numeric value prominently (e.g. "500", "2000").
export function detectDenomination(ocr) {
  const text = (ocr.text || '').replace(/[,₹\s]/g, ' ');
  const numbers = (text.match(/\d{1,4}/g) || []).map((n) => parseInt(n, 10));

  // Score candidate denominations by frequency on the note.
  const scores = {};
  for (const n of numbers) {
    if (VALID_DENOMINATIONS.includes(n)) scores[n] = (scores[n] || 0) + 1;
  }

  let best = null;
  let bestScore = 0;
  for (const [denom, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = parseInt(denom, 10);
    }
  }

  if (!best) {
    return { detected: false, confidence: ocr.confidence || 0 };
  }

  // Confidence: blend OCR confidence with how dominant the denomination is.
  const confidence = Math.min(99.5, (ocr.confidence || 70) * 0.6 + bestScore * 12);

  return {
    detected: true,
    currency: 'Indian Rupee',
    denomination: `₹${best}`,
    value: best,
    words: rupeesToWords(best),
    confidence: Math.round(confidence * 10) / 10,
  };
}
