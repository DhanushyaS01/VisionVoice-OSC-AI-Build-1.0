import config from '../config/index.js'

// Free, vision-capable AI provider via Google Gemini (Google AI Studio).
// Get a FREE API key (no credit card) at: https://aistudio.google.com/app/apikey
// Powers OCR, scene/object, currency, medicine, outfit AND the voice companion.

export function geminiAvailable() {
  return !!config.geminiApiKey
}

function endpoint(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`
}

async function callGemini(body, { timeoutMs = 30000 } = {}) {
  if (!config.geminiApiKey) throw new Error('No GEMINI_API_KEY configured')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(endpoint(config.geminiModel), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`Gemini ${res.status}: ${txt.slice(0, 200)}`)
    }
    const json = await res.json()
    const parts = json.candidates?.[0]?.content?.parts || []
    return parts.map((p) => p.text || '').join('').trim()
  } finally {
    clearTimeout(timer)
  }
}

function safeParseJson(text) {
  if (!text) return {}
  // Strip any markdown fences the model might add, then grab the JSON body.
  let t = text.replace(/```json/gi, '').replace(/```/g, '').trim()
  const first = t.indexOf('{')
  const last = t.lastIndexOf('}')
  if (first !== -1 && last !== -1) t = t.slice(first, last + 1)
  return JSON.parse(t)
}

// Vision → structured JSON. `system` carries the task instructions + schema.
export async function geminiVisionJSON(userText, system, imageBuffer, mimetype = 'image/jpeg') {
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{
      parts: [
        { text: userText },
        { inline_data: { mime_type: mimetype, data: imageBuffer.toString('base64') } },
      ],
    }],
    generationConfig: { temperature: 0, maxOutputTokens: 2048, responseMimeType: 'application/json' },
  }
  const text = await callGemini(body)
  return safeParseJson(text)
}

// Plain text chat (single turn).
export async function geminiChat(system, userText) {
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ parts: [{ text: userText }] }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 300 },
  }
  return callGemini(body)
}

// Multi-turn chat. `turns` = [{ role: 'user'|'model', text }] in chronological order.
export async function geminiChatTurns(system, turns) {
  const contents = (turns || [])
    .filter((t) => t && t.text)
    .map((t) => ({ role: t.role === 'model' ? 'model' : 'user', parts: [{ text: t.text }] }))
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: contents.length ? contents : [{ role: 'user', parts: [{ text: '' }] }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 320 },
  }
  return callGemini(body)
}
