import config from '../config/index.js';

// Normalise a phone number to E.164 digits. Defaults a bare 10-digit number to India (+91).
function normalizePhone(raw) {
  let p = (raw || '').replace(/[^\d+]/g, '');
  if (p.startsWith('+')) return p;
  p = p.replace(/^0+/, '');
  if (p.length === 10) p = '91' + p; // assume India for a bare 10-digit number
  return '+' + p;
}

// Fast2SMS needs a bare 10-digit Indian number (no country code).
function indianTenDigits(raw) {
  let p = (raw || '').replace(/[^\d]/g, '').replace(/^0+/, '');
  if (p.startsWith('91') && p.length === 12) p = p.slice(2);
  return p.slice(-10);
}

// India-focused gateway. Sends a REAL SMS server-side (nothing opens on the user's phone).
async function sendViaFast2SMS(rawPhone, message) {
  const numbers = indianTenDigits(rawPhone);
  if (numbers.length !== 10) return { delivered: false, error: 'Not a valid Indian mobile number for Fast2SMS' };
  const body = new URLSearchParams({ route: 'q', message, language: 'english', numbers });
  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: { authorization: config.fast2smsKey, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));
  return { delivered: res.ok && json.return === true, error: json.message ? JSON.stringify(json.message) : null };
}

async function sendViaTextbelt(phone, message) {
  const res = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message, key: config.textbeltKey }),
  });
  const json = await res.json().catch(() => ({}));
  return { delivered: !!json.success, error: json.error || null, quota: json.quotaRemaining };
}

async function sendViaTwilio(phone, message) {
  const auth = Buffer.from(`${config.twilio.sid}:${config.twilio.token}`).toString('base64');
  const params = new URLSearchParams({ To: phone, From: config.twilio.from, Body: message });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.twilio.sid}/Messages.json`,
    { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params }
  );
  const json = await res.json().catch(() => ({}));
  return { delivered: res.ok, error: json.message || null };
}

// Send emergency SMS alerts directly to each contact's phone, server-side and in real time.
// Provider priority: Twilio → Fast2SMS (India) → TextBelt → simulate. Nothing opens on the
// user's device; the recipient receives a normal text message.
export async function sendEmergencyAlerts(contacts, location, deviceId) {
  // Plain-text coordinates (no clickable link) so the SMS reads as a normal message.
  const locText = location
    ? `${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}`
    : 'location unavailable';
  const mapsLink = locText; // kept for API response compatibility
  const body = `EMERGENCY: A VisionVoice AI user needs help. Last known location: ${locText}`;

  const useTwilio = !!(config.twilio.sid && config.twilio.token && config.twilio.from);
  const useFast2SMS = !useTwilio && !!config.fast2smsKey;
  const useTextbelt = !useTwilio && !useFast2SMS && !!config.textbeltKey;
  const provider = useTwilio ? 'twilio' : useFast2SMS ? 'fast2sms' : useTextbelt ? 'textbelt' : 'simulated';

  const results = [];
  for (const c of contacts) {
    const phone = normalizePhone(c.phone);
    try {
      let r;
      if (useTwilio) r = await sendViaTwilio(phone, body);
      else if (useFast2SMS) r = await sendViaFast2SMS(c.phone, body);
      else if (useTextbelt) r = await sendViaTextbelt(phone, body);
      else { console.log(`📨 [SIMULATED SMS] → ${c.name} (${phone}): ${body}`); r = { delivered: true }; }
      results.push({ name: c.name, phone, delivered: !!r.delivered, error: r.error || null, simulated: provider === 'simulated' });
    } catch (e) {
      results.push({ name: c.name, phone, delivered: false, error: e.message });
    }
  }
  return { mapsLink, body, provider, results };
}
