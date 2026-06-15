import config from '../config/index.js';
import { geminiAvailable, geminiChat, geminiChatTurns } from './geminiService.js';

// Intent routing for the Voice Companion. Maps a user message to an in-app action.
const INTENTS = [
  { action: 'OCR_READER', re: /\b(read|text|sign|label|menu|letter|document|paper)\b/i,
    reply: 'To read text, open the OCR Text Reader from the home screen and point your camera at the text. I will read it aloud.' },
  { action: 'SCENE_DESCRIPTION', re: /\b(what.*(front|around|see)|describe|scene|object|surround|where am i)\b/i,
    reply: 'Open Object Detection and tap scan. I will describe the objects around you and where they are.' },
  { action: 'MEDICINE_READER', re: /\b(medicine|tablet|pill|dose|dosage|expiry|prescription|drug)\b/i,
    reply: 'Use the Medicine Reader to scan the packaging. I will tell you the name, dosage, and expiry date.' },
  { action: 'CURRENCY_READER', re: /\b(money|cash|currency|rupee|note|denomination|how much)\b/i,
    reply: 'Open the Currency Reader and point your camera at the note. I will tell you its value.' },
  { action: 'COLOR_OUTFIT', re: /\b(colou?r|outfit|wear|shirt|dress|clothes|matching)\b/i,
    reply: 'Use the Color & Outfit Assistant. I will identify the colours and suggest matching combinations.' },
  { action: 'EMERGENCY', re: /\b(help|emergency|sos|danger|fall|hurt|ambulance)\b/i,
    reply: 'For emergencies, press the large SOS button. I will alert your saved emergency contacts with your location.' },
  { action: 'SETTINGS', re: /\b(setting|language|tamil|english|voice speed|contrast|font)\b/i,
    reply: 'In Settings you can switch between English and Tamil, change voice speed, and turn on high-contrast mode.' },
  { action: null, re: /\b(hi|hello|hey|vanakkam|good (morning|afternoon|evening))\b/i,
    reply: 'Hello! I am VisionVoice AI. I can read text, describe what is around you, identify currency and medicines, match colours, or call for help. What would you like to do?' },
  { action: null, re: /\b(thank|thanks|nandri)\b/i,
    reply: 'You are very welcome. I am always here to help whenever you need me.' },
  { action: null, re: /\b(who are you|what can you do|help me|how.*work|what.*you do)\b/i,
    reply: 'I am your voice assistant. I can read text aloud, describe objects and scenes, read medicine labels, identify currency notes, match outfit colours, and send an emergency SOS. Just tell me what you need.' },
];

function ruleBasedReply(message) {
  for (const intent of INTENTS) {
    if (intent.re.test(message)) return { response_text: intent.reply, action_triggered: intent.action };
  }
  return {
    response_text:
      "I'm VisionVoice AI, here to help you read text, identify objects and currency, check medicine labels, match outfits, and call for help. What would you like to do?",
    action_triggered: null,
  };
}

async function callOpenAI(message, context) {
  const system =
    'You are VisionVoice AI, a concise, warm voice assistant for blind and low-vision users. ' +
    'Reply in 1-3 short spoken sentences. If the user asks to read/scan/identify something, briefly tell them which feature to use.';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.openaiApiKey}` },
    body: JSON.stringify({
      model: config.openaiModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message },
      ],
      max_tokens: 160,
      temperature: 0.5,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content?.trim();
  const intent = ruleBasedReply(message);
  return { response_text: text || intent.response_text, action_triggered: intent.action_triggered };
}

const COMPANION_SYSTEM =
  'You are VisionVoice AI, a warm, concise voice assistant for blind and low-vision users. ' +
  'Reply in 1-3 short, clear spoken sentences (no markdown, no emoji, no lists). ' +
  'You can help with: reading text (OCR), describing objects/scenes, reading medicine labels, ' +
  'identifying currency, matching colours/outfits, and emergency SOS. If the user wants to scan or ' +
  'identify something, tell them which feature to open. Be encouraging and practical.';

// Build chronological turns from optional context.history = [{ role, content }].
function buildTurns(history, message) {
  const turns = (Array.isArray(history) ? history : [])
    .slice(-8) // keep the last few exchanges for context
    .map((m) => ({ role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user', text: m.content || m.text || '' }))
    .filter((t) => t.text);
  turns.push({ role: 'user', text: message });
  return turns;
}

export async function companionChat(message, context = {}) {
  const intent = ruleBasedReply(message);

  // 1) FREE Gemini conversation (multi-turn, with recent history for context).
  if (geminiAvailable()) {
    try {
      const turns = buildTurns(context.history, message);
      const text = await geminiChatTurns(COMPANION_SYSTEM, turns);
      if (text) return { response_text: text, action_triggered: intent.action_triggered };
    } catch (e) {
      console.warn('Gemini chat failed, trying next provider:', e.message);
    }
  }

  // 2) OpenAI fallback (if a working key is present).
  if (config.openaiApiKey) {
    try {
      return await callOpenAI(message, context);
    } catch (e) {
      console.warn('LLM call failed, using rule-based reply:', e.message);
    }
  }

  // 3) Offline rule-based reply — always works.
  return intent;
}

// Optional Tamil translation via LLM (used by localization.maybeTranslate).
export async function translateToTamil(text) {
  // FREE Gemini first.
  if (geminiAvailable()) {
    try {
      const out = await geminiChat('Translate the user text to natural spoken Tamil. Output ONLY the Tamil translation, nothing else.', text);
      if (out) return out.trim();
    } catch (e) { /* fall through */ }
  }
  if (!config.openaiApiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.openaiApiKey}` },
      body: JSON.stringify({
        model: config.openaiModel,
        messages: [
          { role: 'system', content: 'Translate the user text to natural spoken Tamil. Output only the translation.' },
          { role: 'user', content: text },
        ],
        max_tokens: 200,
        temperature: 0.2,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}
