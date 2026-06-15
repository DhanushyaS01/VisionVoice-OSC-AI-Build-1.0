import config from '../config/index.js'

// Free cloud OCR via OCR.space. No credit card required. Engine 2 is a deep-learning
// model that handles real-world photos (blur, noise, angles) far better than plain
// Tesseract; engine 1 supports Tamil ('tam'). Get a free key at:
//   https://ocr.space/ocrapi/freekey   (default 'helloworld' = rate-limited demo)
export function ocrSpaceAvailable() {
  return !!config.ocrSpaceKey
}

// buffer: a (size-capped) JPEG/PNG buffer. lang: 'en' | 'ta'.
export async function runOcrSpace(buffer, mimetype = 'image/jpeg', lang = 'en') {
  if (!config.ocrSpaceKey) throw new Error('No OCR.space API key configured')

  // Engine 2 = best for Latin scripts/photos but no Tamil; engine 1 supports Tamil.
  const isTamil = lang === 'ta'
  const engine = isTamil ? '1' : '2'
  const language = isTamil ? 'tam' : 'eng'

  const form = new URLSearchParams()
  form.append('apikey', config.ocrSpaceKey)
  form.append('base64Image', `data:${mimetype};base64,${buffer.toString('base64')}`)
  form.append('OCREngine', engine)
  form.append('language', language)
  form.append('scale', 'true')            // upscale internally → better on small/blurry text
  form.append('detectOrientation', 'true')
  form.append('isOverlayRequired', 'true') // word boxes → lets us compute a confidence

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25000)
  let json
  try {
    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: ctrl.signal,
    })
    json = await res.json().catch(() => null)
    if (!res.ok) throw new Error(`OCR.space HTTP ${res.status}`)
  } finally {
    clearTimeout(timer)
  }

  if (!json) throw new Error('OCR.space returned no data')
  if (json.IsErroredOnProcessing) {
    const m = Array.isArray(json.ErrorMessage) ? json.ErrorMessage.join('; ') : json.ErrorMessage
    throw new Error(m || 'OCR.space processing error')
  }

  const result = json.ParsedResults?.[0]
  const text = (result?.ParsedText || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // Word-level mean confidence from the overlay (when available).
  let confidence = 0
  const lines = result?.TextOverlay?.Lines || []
  const words = lines.flatMap((l) => l.Words || [])
  if (words.length) {
    const vals = words.map((w) => Number(w.WordConf ?? w.Confidence ?? NaN)).filter((n) => !Number.isNaN(n))
    if (vals.length) confidence = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }
  if (!confidence) confidence = text.length > 1 ? 80 : 0

  return { text, confidence, engine: `ocr.space-e${engine}` }
}
