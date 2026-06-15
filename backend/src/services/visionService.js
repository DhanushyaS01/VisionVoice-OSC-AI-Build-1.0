let tf, cocoSsd, modelPromise = null

async function getModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      console.log('👁️  Loading COCO-SSD object detection model… first run downloads weights.')
      tf = await import('@tensorflow/tfjs')
      cocoSsd = await import('@tensorflow-models/coco-ssd')
      await tf.ready()
      const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
      console.log('👁️  COCO-SSD ready.')
      return model
    })()
  }
  return modelPromise
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function positionFromBox(bbox, imgWidth) {
  const centerX = bbox[0] + bbox[2] / 2
  const ratio = centerX / imgWidth
  if (ratio < 0.38) return 'Left'
  if (ratio > 0.62) return 'Right'
  return 'Center'
}
function distanceFromBox(bbox, imgHeight) {
  const heightRatio = bbox[3] / imgHeight
  const meters = Math.max(0.5, Math.min(8, 1.2 / Math.max(heightRatio, 0.05)))
  return Math.round(meters * 10) / 10
}

export async function detectObjects(raw) {
  const model = await getModel()
  const { data, width, height } = raw
  const input = tf.tensor3d(new Uint8Array(data), [height, width, 3], 'int32')
  let predictions
  try { predictions = await model.detect(input, 20, 0.5) } finally { input.dispose() }
  return predictions.map((p) => ({
    name: cap(p.class),
    confidence: Math.round(p.score * 1000) / 10,
    position: positionFromBox(p.bbox, width),
    distance_estimate_meters: distanceFromBox(p.bbox, height),
    bbox: p.bbox.map((n) => Math.round(n)),
  }))
}

export function describeScene(objects) {
  if (!objects.length) return null
  const counts = {}
  for (const o of objects) counts[o.name] = (counts[o.name] || 0) + 1
  const parts = Object.entries(counts).map(([name, n]) => {
    const obj = objects.find((o) => o.name === name)
    const pos = obj.position.toLowerCase()
    const where = pos === 'center' ? 'in front of you' : `on the ${pos}`
    return n > 1 ? `${n} ${name.toLowerCase()}s ${where}` : `a ${name.toLowerCase()} ${where}`
  })
  let list
  if (parts.length === 1) list = parts[0]
  else if (parts.length === 2) list = `${parts[0]} and ${parts[1]}`
  else list = `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
  return `I can see ${list}.`
}
