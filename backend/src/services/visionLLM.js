import config from '../config/index.js'
import { geminiAvailable, geminiVisionJSON } from './geminiService.js'

// Advanced multimodal vision. Provider order: FREE Google Gemini → OpenAI GPT-4o →
// (routes then fall back to local open-source models). Returns structured JSON per task,
// including a localized `voice_summary`.

const LANG_NAME = { en: 'English', ta: 'Tamil' }

// Appended to every task so the model attempts a best-effort detection on poor-quality
// images instead of giving up — critical for blurry / dim / partial real-world photos.
const LOW_CLARITY_NOTE = `IMPORTANT: The image may be blurry, dim, noisy, tilted, far away, or partially cut off. Do NOT refuse. Make your BEST possible identification using shapes, colours, partial text and context, and express how sure you are via the confidence/score field. Only mark something as "not detected"/null when there is genuinely nothing usable.`

const TASK_PROMPTS = {
  ocr: `You are a world-class OCR engine for a blind user. Read EVERY piece of text in the image, exactly as written, preserving line breaks and reading order (top-to-bottom, left-to-right).
The photo may be blurry, low-light, skewed, low-resolution, or partially out of focus. Work hard: use context, word shapes, and surrounding letters to reconstruct the most likely text even when characters are faint or smudged. Read small print, sub-text, numbers, dates, units and symbols. Support English and Tamil (and other scripts if present).
Do NOT translate. Do NOT hallucinate text that is not present — if a region is truly illegible, omit it rather than guessing wildly.
Return JSON:
{"extracted_text": string, "language_detected": "en"|"ta"|other, "confidence_score": number (0-100, your honest legibility estimate), "voice_summary": string}
voice_summary must begin with "I read the following text:" then the text, spoken naturally.`,

  scene: `You are a scene-description assistant for a blind user. Identify the objects and layout. Return JSON:
{"scene_summary": string, "objects": [{"name": string, "color": string, "position": "Left"|"Center"|"Right", "distance_estimate_meters": number, "confidence": number(0-100)}], "voice_summary": string}
Describe where things are relative to the viewer. Keep voice_summary calm, clear, 1-3 sentences.`,

  currency: `You identify currency notes for a blind user (focus on Indian Rupee, but support others). Return JSON:
{"detected": boolean, "currency": string, "denomination": string (e.g. "₹500"), "value": number, "words": string (e.g. "Five Hundred Rupees"), "confidence": number(0-100), "voice_summary": string}
If no note is clearly visible set detected=false and explain in voice_summary. Be certain before stating a value.`,

  medicine: `You read medicine packaging for a blind user. Return JSON:
{"medicine_name": string|null, "strength": string|null, "manufacturer": string|null, "expiry": string|null, "expiry_status": "valid"|"expired"|"unknown", "dosage_instructions": string|null, "safety_alerts": [string], "voice_summary": string}
Base expiry_status on today's date. If something is unreadable use null. Never invent a dosage you cannot see; instead advise checking with a pharmacist.`,

  outfit: `You are a color & outfit assistant for a blind user. Return JSON:
{"primary_color": string, "primary_hex": string, "secondary_color": string|null, "secondary_hex": string|null, "clothing_type": string, "suggestions": [string], "swatches": [{"name": string, "hex": string}], "voice_summary": string}
Give accurate color names and matching style advice.`,
}

export function llmAvailable() {
  return geminiAvailable() || !!config.openaiApiKey
}

export async function analyzeImage(task, imageBuffer, mimetype = 'image/jpeg', lang = 'en') {
  const prompt = TASK_PROMPTS[task]
  if (!prompt) throw new Error(`Unknown vision task: ${task}`)

  const langName = LANG_NAME[lang] || 'English'
  const system = `${prompt}\n${LOW_CLARITY_NOTE}\nWrite the "voice_summary" field in ${langName}. Respond with ONLY valid JSON, no markdown.`
  const userText = `Analyze this image. Today is ${new Date().toISOString().slice(0, 10)}.`

  // 1) FREE Gemini first.
  if (geminiAvailable()) {
    try {
      return await geminiVisionJSON(userText, system, imageBuffer, mimetype)
    } catch (e) {
      if (!config.openaiApiKey) throw e
      console.warn('Gemini vision failed, trying OpenAI:', e.message)
    }
  }

  // 2) OpenAI fallback (if a working key is present).
  if (!config.openaiApiKey) throw new Error('No vision AI provider configured')
  const dataUrl = `data:${mimetype};base64,${imageBuffer.toString('base64')}`
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.openaiApiKey}` },
    body: JSON.stringify({
      model: config.openaiModel?.includes('gpt-4o') ? config.openaiModel : 'gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: [
          { type: 'text', text: userText },
          { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
        ] },
      ],
      max_tokens: 1600,
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`OpenAI vision ${res.status}: ${txt.slice(0, 200)}`)
  }
  const json = await res.json()
  const content = json.choices?.[0]?.message?.content || '{}'
  return JSON.parse(content)
}
