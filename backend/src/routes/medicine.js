import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { asyncHandler } from '../middleware/error.js'
import { deviceId } from '../middleware/device.js'
import { preprocessImage, preprocessForOcr } from '../utils/image.js'
import { runOcr } from '../services/ocrService.js'
import { parseMedicine } from '../services/medicineService.js'
import { analyzeImage, llmAvailable } from '../services/visionLLM.js'
import { saveHistory } from '../utils/history.js'
import { resolveLang, t, maybeTranslate } from '../utils/localization.js'

const router = Router()

// POST /api/v1/health/medicine/scan
router.post('/medicine/scan', upload.single('file'), asyncHandler(async (req, res) => {
  const lang = resolveLang(req)
  let data

  if (llmAvailable()) {
    try {
      const { buffer } = await preprocessImage(req.file)
      const r = await analyzeImage('medicine', buffer, 'image/jpeg', lang)
      data = {
        medicine_name: r.medicine_name, strength: r.strength, manufacturer: r.manufacturer,
        expiry_raw: r.expiry, expiry_date: null, expiry_status: r.expiry_status || 'unknown',
        dosage_instructions: r.dosage_instructions, safety_alerts: r.safety_alerts || [],
        voice_summary: r.voice_summary || '', engine: 'gpt-4o',
      }
    } catch (e) { console.warn('LLM medicine failed, using OCR parse:', e.message) }
  }

  if (!data) {
    const { buffer } = await preprocessForOcr(req.file)
    const ocr = await runOcr(buffer)
    const med = parseMedicine(ocr.text)
    let parts = []
    if (med.medicine_name) parts.push(`${t('this_is', lang)} ${med.medicine_name}${med.strength ? ' ' + med.strength : ''}.`)
    if (med.dosage_instructions) parts.push(med.dosage_instructions + '.')
    if (med.expiry_date) parts.push(`${t('expires', lang)}: ${med.expiry_raw || med.expiry_date}, ${med.expiry_status}.`)
    if (med.expiry_status === 'expired') parts.unshift(t('expired_warning', lang))
    let summary = parts.join(' ') || t('no_text', lang)
    summary = await maybeTranslate(summary, lang)
    data = { ...med, raw_ocr: ocr.text, confidence_score: ocr.confidence, voice_summary: summary, engine: 'tesseract' }
  }

  data.history_id = await saveHistory({
    deviceId: deviceId(req), type: 'Medicine', icon: 'pill', color: 'blue',
    title: data.medicine_name || 'Medicine Label', preview: `${data.medicine_name || 'Medicine'} ${data.strength || ''}`.trim(),
    rawText: data.raw_ocr || '', aiSummary: data.voice_summary, data,
  })
  res.json({ success: true, data })
}))

export default router
