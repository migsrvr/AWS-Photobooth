import photoFrame from '../assets/photo-frame.webp'

// Photo slot inside the newspaper template, as fractions (measured).
const SLOT = { left: 0.228, top: 0.22, right: 0.947, bottom: 0.6757 }

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Composites a captured photo into the newspaper front-page template.
 * Returns a JPEG data URL of the finished front page (or null when there
 * is no photo). The saved result is exactly what /preview displays.
 */
export default async function composeNewspaper(photoDataUrl, quality = 0.82) {
  if (!photoDataUrl) return null
  const [frame, photo] = await Promise.all([loadImage(photoFrame), loadImage(photoDataUrl)])
  const canvas = document.createElement('canvas')
  canvas.width = frame.naturalWidth
  canvas.height = frame.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(frame, 0, 0)

  const dx = SLOT.left * canvas.width
  const dy = SLOT.top * canvas.height
  const dw = (SLOT.right - SLOT.left) * canvas.width
  const dh = (SLOT.bottom - SLOT.top) * canvas.height
  // cover-fit the photo into the slot (center crop)
  const scale = Math.max(dw / photo.naturalWidth, dh / photo.naturalHeight)
  const sw = dw / scale
  const sh = dh / scale
  const sx = (photo.naturalWidth - sw) / 2
  const sy = (photo.naturalHeight - sh) / 2
  ctx.drawImage(photo, sx, sy, sw, sh, dx, dy, dw, dh)

  return canvas.toDataURL('image/jpeg', quality)
}
