import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { asyncHandler } from '../middleware/error.js'
import { deviceId } from '../middleware/device.js'
import { preprocessForOcrApi, preprocessForOcr, preprocessForVisionOcr } from '../utils/image.js'
import { runOcr } from '../services/ocrService.js'
import { runOcrSpace, ocrSpaceAvailable } from '../services/ocrSpaceService.js'
import { analyzeImage, llmAvailable } from '../services/visionLLM.js'
import { saveHistory } from '../utils/history.js'
import { resolveLang, t, maybeTranslate } from '../utils/localization.js'

const router = Router()

// POST /api/v1/ocr/scan
// Free OCR pipeline (no paid keys), most accurate first:
//   1) Gemini vision — best at blurry / tiny / minute-detail text
//   2) OCR.space deep-learning engine — robust to blur / noise / angles
//   3) Tesseract (offline) — always-available fallback
router.post('/scan', upload.single('file'), asyncHandler(async (req, res) => {
  const lang = resolveLang(req)
  let text = ''
  let confidence = 0
  let engine = 'tesseract'
  let ocrSpaceError = null

  // 1) Primary: free Gemini vision — strongest on blur and minute details.
  if (llmAvailable()) {
    try {
      const { buffer } = await preprocessForVisionOcr(req.file)
      const r = await analyzeImage('ocr', buffer, 'image/jpeg', lang)
      text = (r.extracted_text || '').trim()
      confidence = r.confidence_score ?? 90
      engine = 'gemini'
    } catch (e) {
      console.warn('Gemini OCR failed, trying OCR.space:', e.message)
    }
  }

  // 2) Free cloud OCR.space (handles real-world photos well).
  if (text.replace(/\s/g, '').length < 2 && ocrSpaceAvailable()) {
    try {
      const { buffer, mimetype } = await preprocessForOcrApi(req.file)
      const r = await runOcrSpace(buffer, mimetype, lang)
      if (r.text.replace(/\s/g, '').length > text.replace(/\s/g, '').length) {
        text = r.text; confidence = r.confidence; engine = r.engine
      }
    } catch (e) {
      ocrSpaceError = e.message
      console.warn('OCR.space failed, falling back to Tesseract:', e.message)
    }
  }

  // 3) Fallback (or if cloud found nothing): offline Tesseract with deblur preprocessing.
  if (text.replace(/\s/g, '').length < 2) {
    const { buffer } = await preprocessForOcr(req.file)
    const ocr = await runOcr(buffer)
    if (ocr.text.replace(/\s/g, '').length >= text.replace(/\s/g, '').length) {
      text = ocr.text; confidence = ocr.confidence; engine = 'tesseract'
    }
  }

  const hasText = text.replace(/\s/g, '').length > 1
  let summary = hasText ? `${t('i_read_text', lang)} ${text}` : t('no_text', lang)
  summary = await maybeTranslate(summary, lang)
  const data = {
    extracted_text: text,
    confidence_score: confidence,
    language_detected: lang,
    voice_summary: summary,
    engine,
    ...(ocrSpaceError ? { ocr_space_error: ocrSpaceError } : {}),
  }

  if ((data.extracted_text || '').trim().length > 1) {
    data.history_id = await saveHistory({
      deviceId: deviceId(req), type: 'OCR', icon: 'scan', color: 'blue',
      title: 'Text Scan', preview: data.extracted_text.slice(0, 60), rawText: data.extracted_text,
      aiSummary: data.voice_summary, data,
    })
  }
  res.json({ success: true, data })
}))

export default router
