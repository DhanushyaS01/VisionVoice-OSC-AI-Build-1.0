import config from '../config/index.js'
import { badRequest } from './errors.js'

function validate(file) {
  if (!file) throw badRequest('No image file provided. Field name must be "file".')
  if (!config.upload.allowedMime.includes(file.mimetype)) {
    throw badRequest(`Invalid image format "${file.mimetype}". Allowed: JPEG, PNG, WEBP, HEIC, BMP.`)
  }
  if (file.size > config.upload.maxFileSizeBytes) {
    const mb = Math.round(config.upload.maxFileSizeBytes / (1024 * 1024))
    throw badRequest(`Image too large. Maximum size is ${mb} MB.`)
  }
}

// General preprocessing for object-detection / colour (RGB raw + jpeg).
export async function preprocessImage(file) {
  validate(file)
  const { default: sharp } = await import('sharp')
  const base = sharp(file.buffer, { failOn: 'none' }).rotate()
  const meta = await base.metadata()
  const resized = base.resize({
    width: config.upload.maxDimension,
    height: config.upload.maxDimension,
    fit: 'inside',
    withoutEnlargement: true,
  })
  const buffer = await resized.clone().jpeg({ quality: 95 }).toBuffer()
  const { data, info } = await resized.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return { buffer, meta, raw: { data, width: info.width, height: info.height, channels: info.channels } }
}

// Text-optimized preprocessing for OCR. Larger working size + grayscale + contrast
// normalisation + sharpening dramatically improves Tesseract accuracy on photos.
export async function preprocessForOcr(file) {
  validate(file)
  const { default: sharp } = await import('sharp')
  let img = sharp(file.buffer, { failOn: 'none' }).rotate()
  const meta = await img.metadata()

  // Upscale small captures so small text is legible; keep large ones high-res for
  // accurate character recognition (capped to ocrMaxDimension).
  const cap = config.upload.ocrMaxDimension || 3000
  const targetW = Math.min(cap, Math.max(1600, meta.width || 1600))

  const buffer = await img
    .resize({ width: targetW, withoutEnlargement: false })
    .grayscale()
    .normalize()                 // stretch contrast across full range
    .linear(1.3, -25)            // boost contrast a touch
    .sharpen({ sigma: 1.2 })     // crisp edges for character recognition
    .median(1)                   // remove speckle noise
    .toFormat('png')             // lossless → better for OCR than jpeg
    .toBuffer()

  return { buffer, meta }
}

// Preprocessing for the OCR.space free API (≈1 MB upload limit). Cleans the image
// (deblur + denoise + contrast) and compresses so it stays under the size cap while
// the API's internal upscaler ("scale=true") recovers small/blurry text.
export async function preprocessForOcrApi(file) {
  validate(file)
  const { default: sharp } = await import('sharp')
  const img = sharp(file.buffer, { failOn: 'none' }).rotate()
  const meta = await img.metadata()

  const targetW = Math.min(1600, Math.max(1000, meta.width || 1280))

  // Try descending quality until the JPEG is comfortably under ~1 MB.
  let buffer
  for (const q of [80, 70, 60, 50]) {
    buffer = await img
      .resize({ width: targetW, withoutEnlargement: false, kernel: 'lanczos3' })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.4 })   // counteract blur
      .median(1)                 // denoise
      .jpeg({ quality: q })
      .toBuffer()
    if (buffer.length < 1000 * 1024) break
  }
  return { buffer, mimetype: 'image/jpeg', meta }
}

// High-quality preprocessing for the GPT-4o VISION OCR path. Keeps colour (the model
// reads colour context well) but UPSCALES blurry / small / low-res captures and applies
// an unsharp mask + gentle denoise so faint and tiny text becomes legible to the model.
export async function preprocessForVisionOcr(file) {
  validate(file)
  const { default: sharp } = await import('sharp')
  const img = sharp(file.buffer, { failOn: 'none' }).rotate()
  const meta = await img.metadata()

  // Upscale anything under ~1600px wide (typical of blurry/cropped shots) up to a
  // high working width; cap large images so requests stay fast.
  const cap = config.upload.ocrMaxDimension || 3000
  const targetW = Math.min(cap, Math.max(1800, meta.width || 1800))

  const buffer = await img
    .resize({ width: targetW, withoutEnlargement: false, kernel: 'lanczos3' })
    .normalize()                              // stretch contrast / fix dim photos
    .sharpen({ sigma: 1.5, m1: 1, m2: 2 })    // unsharp mask → counteract blur
    .median(1)                                // denoise without killing edges
    .jpeg({ quality: 95 })
    .toBuffer()

  return { buffer, meta }
}
