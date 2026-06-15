const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())

let namer
async function nameOf(hex) {
  try {
    if (!namer) namer = (await import('color-namer')).default
    return titleCase(namer(hex).ntc[0].name)
  } catch { return 'Unknown' }
}

function outfitSuggestions(primaryName) {
  const p = primaryName.toLowerCase()
  const tips = []
  const neutral = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'cream', 'tan', 'khaki']
  if (neutral.some((c) => p.includes(c))) tips.push('This is a versatile, neutral colour that pairs well with almost anything.')
  else tips.push(`This ${primaryName} is a bold colour — balance it with a neutral like beige, white, or grey.`)
  if (p.includes('navy') || p.includes('blue')) tips.push('Pair with brown or tan leather shoes for a smart business-casual look.')
  else if (p.includes('black')) tips.push('Works for formal occasions; add a white or light layer for contrast.')
  else tips.push('Keep accessories simple so the main colour stays the focus.')
  return tips
}

export async function analyzeOutfit(buffer) {
  const { default: Vibrant } = await import('node-vibrant')
  const palette = await Vibrant.from(buffer).getPalette()
  const swatches = Object.values(palette).filter(Boolean).sort((a, b) => b.population - a.population)
  if (!swatches.length) return { primary_color: 'Unknown', primary_hex: '#888888', secondary_color: null, swatches: [] }

  const primaryHex = swatches[0].hex
  const secondaryHex = swatches[1] ? swatches[1].hex : null
  const primaryName = await nameOf(primaryHex)
  const secondaryName = secondaryHex ? await nameOf(secondaryHex) : null
  const swatchNames = []
  for (const s of swatches.slice(0, 5)) swatchNames.push({ hex: s.hex, name: await nameOf(s.hex) })

  return {
    primary_color: primaryName,
    primary_hex: primaryHex,
    secondary_color: secondaryName,
    secondary_hex: secondaryHex,
    suggestions: outfitSuggestions(primaryName),
    swatches: swatchNames,
  }
}
