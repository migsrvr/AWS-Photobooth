/**
 * Grabs the current frame from a live <video> element as a JPEG data URL.
 * The frame is mirrored horizontally so the saved photo matches what the
 * user saw in the (mirrored) live preview. Returns null when no frame is
 * available (camera off / not ready).
 */
export default function capturePhoto(video, quality = 0.92) {
  if (!video || !video.videoWidth || !video.videoHeight) return null
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0)
  return canvas.toDataURL('image/jpeg', quality)
}
