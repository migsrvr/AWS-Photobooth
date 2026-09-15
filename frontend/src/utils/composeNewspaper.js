import photoFrame from '../assets/photo-frame.webp'
import photoFrameAlt from '../assets/photo-frame-alt.webp'

// Photo slots per template, as fractions (measured from Figma).
// orgfest = Frame 53:103 ORGFEST (Rectangle 43: x 226, y 282, w 722, h 595 on 1000x1295 canvas)
// alt = Frame 114:157 "ux design" (Rectangle 44: x 47.01, y 480, w 729, h 476 on 1000x1295 canvas)
export const SLOTS = {
  orgfest: { left: 0.226, top: 0.2178, right: 0.948, bottom: 0.6772 },
  alt: { left: 0.047, top: 0.3707, right: 0.776, bottom: 0.7382 },
}

const FRAMES = {
  orgfest: photoFrame,
  alt: photoFrameAlt,
}

// Fit behavior per template.
// 'cover' fills the slot (crops photo overflow) — suits wide slots.
// 'contain' fits the whole photo inside the slot (no cropping; the frame's
// gray placeholder shows as bars) — suits Template 1's squarer slot.
const FIT_MODE = {
  orgfest: 'contain',
  alt: 'cover',
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
 * @param {string} opts.fit - 'cover' | 'contain' override (default per template)
 * Returns JPEG data URL of finished front page (or null).
 */
export default async function composeNewspaper(photoDataUrl, { template = 'orgfest', bw = false, quality = 0.82, fit = null } = {}) {
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
  const src = bw ? photoCanvas : photo
  const fitMode = fit || FIT_MODE[template] || 'cover'
  if (fitMode === 'contain') {
    // Whole photo visible: scale to fit inside slot, center it.
    const s = Math.min(dw / srcW, dh / srcH)
    const w = srcW * s
    const h = srcH * s
    ctx.drawImage(src, 0, 0, srcW, srcH, dx + (dw - w) / 2, dy + (dh - h) / 2, w, h)
  } else {
    // Fill slot: scale to cover, center-crop overflow.
    const scale = Math.max(dw / srcW, dh / srcH)
    const sw = dw / scale
    const sh = dh / scale
    const sx = (srcW - sw) / 2
    const sy = (srcH - sh) / 2
    ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh)
  }

  return canvas.toDataURL('image/jpeg', quality)
}

// Named export for new call sites.
export async function composeTemplate(photoDataUrl, opts) {
  return composeNewspaper(photoDataUrl, opts)
}

// Bakes a whole-image grayscale into a new JPEG data URL. Used when there
// is no raw capture to re-compose (deep link) but B&W was toggled, so the
// downloaded photo still matches the preview.
export async function bakeGrayscaleFilter(photoDataUrl, quality = 0.82) {
  if (!photoDataUrl) return null
  const photo = await loadImage(photoDataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = photo.naturalWidth
  canvas.height = photo.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.filter = 'grayscale(1)'
  ctx.drawImage(photo, 0, 0)
  return canvas.toDataURL('image/jpeg', quality)
}

// For UI thumbnails without re-encoding full quality.
export function availableTemplates() {
  return [
    { id: 'orgfest', label: 'Template 1', frame: photoFrame },
    { id: 'alt', label: 'Template 2', frame: photoFrameAlt },
  ]
}
