// Parse raw OCR text from a medicine label into structured fields.
const STRENGTH_RE = /(\d+(?:\.\d+)?\s?(?:mg|ml|mcg|g|iu|%))/i;
const EXPIRY_RE = /(?:exp|expiry|use before|best before|use by)[^0-9]*((?:\d{1,2}[/-])?\d{1,2}[/-]\d{2,4}|\d{2}[/-]\d{4})/i;
const MFG_RE = /(?:mfg|mfd|manufactured)[^0-9]*((?:\d{1,2}[/-])?\d{1,2}[/-]\d{2,4})/i;

function parseExpiryDate(str) {
  if (!str) return null;
  const m = str.match(/(\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    let month = parseInt(m[1], 10);
    let year = parseInt(m[2], 10);
    if (year < 100) year += 2000;
    if (month > 12) [month, year] = [year % 100, month]; // tolerate swapped
    return new Date(year, month, 0); // last day of expiry month
  }
  const full = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (full) {
    let year = parseInt(full[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, parseInt(full[2], 10), 0);
  }
  return null;
}

export function parseMedicine(ocrText) {
  const text = (ocrText || '').replace(/\s+\n/g, '\n');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const strengthMatch = text.match(STRENGTH_RE);
  const strength = strengthMatch ? strengthMatch[1].replace(/\s+/g, '') : null;

  // Medicine name: first substantial line (often the brand/drug name in caps).
  let name = lines.find((l) => /[A-Za-z]{4,}/.test(l) && !/exp|mfg|batch|store/i.test(l)) || null;
  if (name && strength) name = name.replace(STRENGTH_RE, '').trim();

  const expRaw = (text.match(EXPIRY_RE) || [])[1] || null;
  const expiryDate = parseExpiryDate(expRaw);
  const now = new Date();
  let expiryStatus = 'unknown';
  if (expiryDate) expiryStatus = expiryDate >= now ? 'valid' : 'expired';

  const manufacturerLine = lines.find((l) => /\b(ltd|pharma|labs|industries|inc|pvt|limited)\b/i.test(l));

  const safety = [];
  if (/children/i.test(text)) safety.push('Keep away from children');
  if (/exceed|do not exceed/i.test(text)) safety.push('Do not exceed the recommended dose');
  if (/store|below|°c/i.test(text)) safety.push('Store as directed on the label');
  if (expiryStatus === 'expired') safety.unshift('This medicine has EXPIRED — do not use it');

  const dosage = (lines.find((l) => /take|tablet|capsule|dose|every|hours|daily/i.test(l))) || null;

  return {
    medicine_name: name,
    strength,
    manufacturer: manufacturerLine || null,
    expiry_raw: expRaw,
    expiry_date: expiryDate ? expiryDate.toISOString().slice(0, 10) : null,
    expiry_status: expiryStatus,
    dosage_instructions: dosage,
    safety_alerts: safety.length ? safety : ['Always follow the directions on the package or from your pharmacist'],
  };
}
