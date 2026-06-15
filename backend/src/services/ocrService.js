import config from '../config/index.js'

let workerPromise = null

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      console.log(`🔤 Loading Tesseract OCR (${config.ocrLangs})… first run downloads language data.`)
      const { createWorker, PSM } = await import('tesseract.js')
      const worker = await createWorker(config.ocrLangs)
      // Auto page segmentation works best for signs/labels/documents.
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
        preserve_interword_spaces: '1',
      })
      console.log('🔤 Tesseract ready.')
      return worker
    })()
  }
  return workerPromise
}

const clean = (s) => (s || '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

// Run OCR with auto page segmentation. If little/low-confidence text is found,
// retry in "sparse text" mode, which catches signs, labels and scattered words.
export async function runOcr(buffer) {
  const worker = await getWorker()
  const { PSM } = await import('tesseract.js')

  let { data } = await worker.recognize(buffer)
  let text = clean(data.text)
  let confidence = data.confidence || 0

  if (text.replace(/\s/g, '').length < 3 || confidence < 45) {
    try {
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT })
      const retry = await worker.recognize(buffer)
      const retryText = clean(retry.data.text)
      if (retryText.replace(/\s/g, '').length > text.replace(/\s/g, '').length) {
        data = retry.data; text = retryText; confidence = retry.data.confidence || confidence
      }
    } finally {
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO })
    }
  }

  return {
    text,
    confidence: Math.round(confidence * 10) / 10,
    words: (data.words || []).map((w) => ({ text: w.text, confidence: w.confidence })),
  }
}

export async function shutdownOcr() {
  if (workerPromise) { const w = await workerPromise; await w.terminate(); workerPromise = null }
}
