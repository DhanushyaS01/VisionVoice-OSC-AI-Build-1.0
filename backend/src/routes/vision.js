import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { asyncHandler } from '../middleware/error.js'
import { deviceId } from '../middleware/device.js'
import { preprocessImage } from '../utils/image.js'
import { detectObjects, describeScene } from '../services/visionService.js'
import { analyzeOutfit } from '../services/colorService.js'
import { analyzeImage, llmAvailable } from '../services/visionLLM.js'
import { saveHistory } from '../utils/history.js'
import { resolveLang, t, maybeTranslate } from '../utils/localization.js'

const router = Router()

// POST /api/v1/vision/scene/describe
router.post('/scene/describe', upload.single('file'), asyncHandler(async (req, res) => {
  const lang = resolveLang(req)
  let data

  if (llmAvailable()) {
    try {
      const { buffer } = await preprocessImage(req.file)
      const r = await analyzeImage('scene', buffer, 'image/jpeg', lang)
      const objects = (r.objects || []).map((o) => ({
        name: o.name, color: o.color || '', position: o.position || 'Center',
        distance_estimate_meters: o.distance_estimate_meters ?? null, confidence: o.confidence ?? 90,
      }))
      data = { scene_summary: r.scene_summary || '', voice_summary: r.voice_summary || r.scene_summary || t('no_objects', lang), object_count: objects.length, objects, engine: 'gpt-4o' }
    } catch (e) { console.warn('LLM scene failed, using COCO-SSD:', e.message) }
  }

  if (!data) {
    const { raw } = await preprocessImage(req.file)
    const objects = await detectObjects(raw)
    const sceneText = describeScene(objects)
    let summary = sceneText ? `${t('you_are_in', lang)}, ${sceneText}` : t('no_objects', lang)
    summary = await maybeTranslate(summary, lang)
    data = { scene_summary: sceneText || t('no_objects', lang), voice_summary: summary, object_count: objects.length, objects, engine: 'coco-ssd' }
  }

  if (data.objects.length) {
    data.history_id = await saveHistory({
      deviceId: deviceId(req), type: 'Object', icon: 'eye', color: 'purple',
      title: 'Scene Detection', preview: data.objects.map((o) => o.name).join(', ').slice(0, 60),
      rawText: data.scene_summary, aiSummary: data.voice_summary, data,
    })
  }
  res.json({ success: true, data })
}))

// POST /api/v1/vision/outfit/analyze
router.post('/outfit/analyze', upload.single('file'), asyncHandler(async (req, res) => {
  const lang = resolveLang(req)
  let data

  if (llmAvailable()) {
    try {
      const { buffer } = await preprocessImage(req.file)
      const r = await analyzeImage('outfit', buffer, 'image/jpeg', lang)
      data = {
        primary_color: r.primary_color, primary_hex: r.primary_hex,
        secondary_color: r.secondary_color, secondary_hex: r.secondary_hex,
        clothing_type: r.clothing_type, suggestions: r.suggestions || [],
        swatches: r.swatches || [], voice_summary: r.voice_summary || '', engine: 'gpt-4o',
      }
    } catch (e) { console.warn('LLM outfit failed, using OpenCV palette:', e.message) }
  }

  if (!data) {
    const { buffer } = await preprocessImage(req.file)
    const result = await analyzeOutfit(buffer)
    const colourPhrase = result.secondary_color ? `${result.primary_color} and ${result.secondary_color}` : result.primary_color
    let summary = `${t('you_are_holding', lang)} ${colourPhrase} item. ${(result.suggestions || []).join(' ')}`
    summary = await maybeTranslate(summary, lang)
    data = { ...result, voice_summary: summary, engine: 'node-vibrant' }
  }

  data.history_id = await saveHistory({
    deviceId: deviceId(req), type: 'Color', icon: 'palette', color: 'orange',
    title: 'Outfit Analysis', preview: [data.primary_color, data.secondary_color].filter(Boolean).join(' & '),
    rawText: data.clothing_type || '', aiSummary: data.voice_summary, data,
  })
  res.json({ success: true, data })
}))

export default router
