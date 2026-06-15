// Indian Rupee denomination → words (English).
const RUPEE_WORDS = {
  1: 'One Rupee',
  2: 'Two Rupees',
  5: 'Five Rupees',
  10: 'Ten Rupees',
  20: 'Twenty Rupees',
  50: 'Fifty Rupees',
  100: 'One Hundred Rupees',
  200: 'Two Hundred Rupees',
  500: 'Five Hundred Rupees',
  2000: 'Two Thousand Rupees',
};

export function rupeesToWords(value) {
  return RUPEE_WORDS[value] || `${value} Rupees`;
}

export const VALID_DENOMINATIONS = Object.keys(RUPEE_WORDS).map(Number);
