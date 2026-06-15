// VisionVoice AI — frontend API client.
// Talks to the Node/Express/MongoDB backend. Every scan screen calls this,
// and falls back to local mock data if the backend is unreachable (demo-safe).

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export function getDeviceId() {
  let id = localStorage.getItem('vv_device_id')
  if (!id) {
    id = 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('vv_device_id', id)
  }
  return id
}

function baseHeaders(extra = {}) {
  const lang = localStorage.getItem('app_language') || 'en'
  return {
    'Accept-Language': lang === 'ta' ? 'ta-IN' : 'en-IN',
    'X-Device-Id': getDeviceId(),
    ...extra,
  }
}

async function handle(res) {
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = json?.error?.message || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return json
}

async function uploadImage(endpoint, blob) {
  if (!blob) { const e = new Error('No image captured'); e.noImage = true; throw e }
  const form = new FormData()
  form.append('file', blob, 'capture.jpg')
  const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'POST', headers: baseHeaders(), body: form })
  return handle(res)
}

async function postJson(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'POST', headers: baseHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) })
  return handle(res)
}

async function getJson(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers: baseHeaders() })
  return handle(res)
}

async function del(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE', headers: baseHeaders() })
  return handle(res)
}

// ---------------- Endpoint wrappers + normalizers ----------------

export async function scanOCR(blob) {
  const { data } = await uploadImage('/ocr/scan', blob)
  return {
    text: data.extracted_text,
    voiceSummary: data.voice_summary,
    confidence: data.confidence_score,
    engine: data.engine,
    ocrSpaceError: data.ocr_space_error || null,
    aiUnavailable: !!data.ai_unavailable,
  }
}

export async function detectScene(blob) {
  const { data } = await uploadImage('/vision/scene/describe', blob)
  return {
    description: data.voice_summary || data.scene_summary,
    objects: (data.objects || []).map((o) => ({
      name: o.name,
      confidence: Math.round(o.confidence ?? 90),
      distance: o.distance_estimate_meters != null ? `${o.distance_estimate_meters}m` : (o.color || ''),
      position: o.position || 'Center',
    })),
  }
}

export async function scanMedicine(blob) {
  const { data } = await uploadImage('/health/medicine/scan', blob)
  const statusMap = { valid: 'valid', expired: 'expired', unknown: 'warning' }
  return {
    name: data.medicine_name || 'Unknown Medicine',
    strength: data.strength || '',
    manufacturer: data.manufacturer || 'Unknown manufacturer',
    dosage: data.dosage_instructions || 'Follow directions on the package.',
    warnings: data.safety_alerts || [],
    expiry: data.expiry_raw || data.expiry_date || 'Not detected',
    expiryStatus: statusMap[data.expiry_status] || 'warning',
    mfgDate: 'Not detected',
    batchNo: 'Not detected',
    voiceSummary: data.voice_summary,
  }
}

export async function detectCurrency(blob) {
  const { data } = await uploadImage('/finance/currency/detect', blob)
  if (!data.detected) {
    const e = new Error(data.voice_summary || 'Could not read the note')
    e.softFail = true
    throw e
  }
  return {
    currency: data.currency,
    denomination: data.denomination,
    value: data.value,
    words: data.words,
    series: 'Recognised by AI',
    color: '—',
    features: [],
    confidence: Math.round(data.confidence ?? 95),
    voiceSummary: data.voice_summary,
  }
}

export async function analyzeOutfit(blob) {
  const { data } = await uploadImage('/vision/outfit/analyze', blob)
  const sw = data.swatches || []
  return {
    primaryColor: data.primary_color,
    primaryHex: data.primary_hex,
    secondaryColor: data.secondary_color || (sw[1]?.name ?? '—'),
    secondaryHex: data.secondary_hex || (sw[1]?.hex ?? '#888'),
    accentColor: sw[2]?.name || '—',
    accentHex: sw[2]?.hex || '#888',
    outfit: data.clothing_type || [data.primary_color, data.secondary_color].filter(Boolean).join(' & ') + ' clothing',
    occasion: [],
    suggestions: data.suggestions || [],
    voiceSummary: data.voice_summary,
  }
}

export async function companionChat(message, context = {}) {
  const { data } = await postJson('/ai/companion/chat', { message, context })
  return data
}

// Emergency
export const getContacts = () => getJson('/emergency/contacts').then((r) => r.data)
export const addContact = (c) => postJson('/emergency/contacts', c).then((r) => r.data)
export const deleteContact = (id) => del(`/emergency/contacts/${id}`).then((r) => r.data)
export const triggerSOS = (location) => postJson('/emergency/trigger', { location }).then((r) => r.data || {})

// History
export const getHistory = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return getJson(`/history${qs ? '?' + qs : ''}`).then((r) => r.data)
}
export const saveHistory = (entry) => postJson('/history', entry).then((r) => r.data)
export const deleteHistory = (id) => del(`/history/${id}`).then((r) => r.data)
export const clearHistory = () => del('/history').then((r) => r.data)

// User settings
export const getUser = () => getJson('/user').then((r) => r.data)
export const saveSettings = (payload) =>
  fetch(`${BASE_URL}/user/settings`, {
    method: 'PUT',
    headers: baseHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }).then(handle).then((r) => r.data)

export { BASE_URL }
