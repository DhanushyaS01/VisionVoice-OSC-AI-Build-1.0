// Lightweight localization for voice summaries (English + Tamil).
// Resolves Accept-Language header → 'en' | 'ta'.
export function resolveLang(req) {
  const header = (req.headers['accept-language'] || '').toLowerCase();
  if (header.startsWith('ta')) return 'ta';
  return 'en';
}

// A small phrase dictionary used to localise generated voice summaries.
const PHRASES = {
  i_read_text: { en: 'I read the following text:', ta: 'நான் படித்த உரை:' },
  no_text: {
    en: "I couldn't find any readable text. Please hold the camera steady and try again.",
    ta: 'படிக்கக்கூடிய உரை எதுவும் கிடைக்கவில்லை. கேமராவை நிலையாக பிடித்து மீண்டும் முயற்சிக்கவும்.',
  },
  you_are_in: { en: 'In front of you', ta: 'உங்களுக்கு முன்னால்' },
  i_can_see: { en: 'I can see', ta: 'நான் பார்க்கிறேன்' },
  no_objects: {
    en: 'I could not clearly identify any objects. Try moving closer.',
    ta: 'எந்த பொருளையும் தெளிவாக அடையாளம் காண முடியவில்லை. கொஞ்சம் அருகில் வாருங்கள்.',
  },
  detected_note: { en: 'I detected an Indian currency note. This is', ta: 'இந்திய ரூபாய் நோட்டு கண்டறியப்பட்டது. இது' },
  no_currency: {
    en: 'I could not read the denomination. Please flatten the note and try again.',
    ta: 'நோட்டின் மதிப்பை படிக்க முடியவில்லை. நோட்டை நேராக்கி மீண்டும் முயற்சிக்கவும்.',
  },
  this_is: { en: 'This is', ta: 'இது' },
  expires: { en: 'It expires', ta: 'காலாவதி தேதி' },
  you_are_holding: { en: 'You are holding a', ta: 'நீங்கள் பிடித்திருப்பது' },
  expired_warning: { en: 'Warning: this medicine has expired. Do not use it.', ta: 'எச்சரிக்கை: இந்த மருந்து காலாவதியாகிவிட்டது. பயன்படுத்த வேண்டாம்.' },
};

export function t(key, lang = 'en') {
  return (PHRASES[key] && PHRASES[key][lang]) || (PHRASES[key] && PHRASES[key].en) || key;
}

// Optional: translate an arbitrary English summary to Tamil via LLM if available;
// otherwise return as-is (frontend SpeechSynthesis still reads it with ta-IN voice).
export async function maybeTranslate(text, lang) {
  if (lang !== 'ta' || !text) return text;
  try {
    const { translateToTamil } = await import('../services/nlpService.js');
    const out = await translateToTamil(text);
    return out || text;
  } catch {
    return text;
  }
}
