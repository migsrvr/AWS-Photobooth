import photoFrame from '../assets/photo-frame.webp'
import photoFrameAlt from '../assets/photo-frame-alt.webp'

// Photo slots per template, as fractions (measured from Figma).
// orgfest = Frame 53:103 ORGFEST (gray rect 226,282 722x595 on 1000x1295 canvas)
// alt = Frame 114:157 — MCP limit prevented exact measure; reuse orgfest slot
// with slight inset so preview difference is visible until exact asset replaces it.
// When alt asset is updated, re-measure its slot and adjust here.
const SLOTS = {
  orgfest: { left: 0.228, top: 0.22, right: 0.947, bottom: 0.6757 },
  alt: { left: 0.22, top: 0.21, right: 0.955, bottom: 0.685 },
}

const FRAMES = {
  orgfest: photoFrame,
  alt: photoFrameAlt,
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Composites a captured photo into a newspaper template.
 * @param {string|null} photoDataUrl - raw captured data URL
 * @param {object} opts
 * @param {string} opts.template - 'orgfest' | 'alt'
 * @param {boolean} opts.bw - grayscale the USER photo only (keeps masthead color)
 * @param {number} opts.quality - jpeg quality
 * Returns JPEG data URL of finished front page (or null).
 */
export default async function composeNewspaper(photoDataUrl, { template = 'orgfest', bw = false, quality = 0.82 } = {}) {
  // Back-compat: composeNewspaper(raw, 0.82) still works
  if (typeof template === 'number') {
    quality = template
    template = 'orgfest'
    bw = false
  }
  if (quality == null) quality = 0.82
  if (!photoDataUrl) return null
  const frameSrc = FRAMES[template] || FRAMES.orgfest
  const slot = SLOTS[template] || SLOTS.orgfest
  const [frame, photo] = await Promise.all([loadImage(frameSrc), loadImage(photoDataUrl)])

  // Prepare photo onto temp canvas so we can grayscale it before compositing.
  // This keeps newspaper chrome in color while user photo is B&W when toggled.
  let photoCanvas = null
  if (bw) {
    photoCanvas = document.createElement('canvas')
    photoCanvas.width = photo.naturalWidth
    photoCanvas.height = photo.naturalHeight
    const pctx = photoCanvas.getContext('2d')
    pctx.filter = 'grayscale(1)'
    pctx.drawImage(photo, 0, 0)
  }

  const canvas = document.createElement('canvas')
  canvas.width = frame.naturalWidth
  canvas.height = frame.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(frame, 0, 0)

  const dx = slot.left * canvas.width
  const dy = slot.top * canvas.height
  const dw = (slot.right - slot.left) * canvas.width
  const dh = (slot.bottom - slot.top) * canvas.height
  const srcW = bw ? photoCanvas.width : photo.naturalWidth
  const srcH = bw ? photoCanvas.height : photo.naturalHeight
  const scale = Math.max(dw / srcW, dh / srcH)
  const sw = dw / scale
  const sh = dh / scale
  const sx = (srcW - sw) / 2
  const sy = (srcH - sh) / 2
  const src = bw ? photoCanvas : photo
  ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh)

  return canvas.toDataURL('image/jpeg', quality)
}

// Named export for new call sites.
export async function composeTemplate(photoDataUrl, opts) {
  return composeNewspaper(photoDataUrl, opts)
}

// For UI thumbnails without re-encoding full quality.
export function availableTemplates() {
  return [
    { id: 'orgfest', label: 'Template 1', frame: photoFrame },
    { id: 'alt', label: 'Template 2', frame: photoFrameAlt },
  ]
}
