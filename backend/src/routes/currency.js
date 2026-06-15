import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { asyncHandler } from '../middleware/error.js'
import { deviceId } from '../middleware/device.js'
import { preprocessImage, preprocessForOcr } from '../utils/image.js'
import { runOcr } from '../services/ocrService.js'
import { detectDenomination } from '../services/currencyService.js'
import { analyzeImage, llmAvailable } from '../services/visionLLM.js'
import { saveHistory } from '../utils/history.js'
import { resolveLang, t, maybeTranslate } from '../utils/localization.js'

const router = Router()

// POST /api/v1/finance/currency/detect
router.post('/currency/detect', upload.single('file'), asyncHandler(async (req, res) => {
  const lang = resolveLang(req)
  let data

  if (llmAvailable()) {
    try {
      const { buffer } = await preprocessImage(req.file)
      const r = await analyzeImage('currency', buffer, 'image/jpeg', lang)
      if (!r.detected) return res.json({ success: true, data: { detected: false, voice_summary: r.voice_summary || t('no_currency', lang) } })
      data = { detected: true, currency: r.currency || 'Indian Rupee', denomination: r.denomination, value: r.value, words: r.words, confidence: r.confidence ?? 95, voice_summary: r.voice_summary || '', engine: 'gpt-4o' }
    } catch (e) { console.warn('LLM currency failed, using OCR:', e.message) }
  }

  if (!data) {
    const { buffer } = await preprocessForOcr(req.file)
    const ocr = await runOcr(buffer)
    const result = detectDenomination(ocr)
    if (!result.detected) {
      const summary = await maybeTranslate(t('no_currency', lang), lang)
      return res.json({ success: true, data: { detected: false, voice_summary: summary } })
    }
    let summary = `${t('detected_note', lang)} ${result.words}.`
    summary = await maybeTranslate(summary, lang)
    data = { ...result, voice_summary: summary, engine: 'tesseract' }
  }

  data.history_id = await saveHistory({
    deviceId: deviceId(req), type: 'Currency', icon: 'banknote', color: 'green',
    title: 'Indian Rupee', preview: `${data.denomination} - ${data.words}`,
    rawText: data.words, aiSummary: data.voice_summary, data,
  })
  res.json({ success: true, data })
}))

export default router
