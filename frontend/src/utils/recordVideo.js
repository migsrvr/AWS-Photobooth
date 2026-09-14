/**
 * Records a MediaStream to a video Blob using MediaRecorder.
 * Returns { stop } — stop() resolves with the Blob (or null when
 * recording never started / produced no data).
 */
export function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return undefined
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
  return candidates.find((t) => MediaRecorder.isTypeSupported(t))
}

export function startRecording(stream) {
  if (!stream || typeof MediaRecorder === 'undefined') {
    return { stop: async () => null }
  }
  const chunks = []
  const mimeType = pickMimeType()
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }
  const done = new Promise((resolve) => {
    recorder.onstop = () => {
      if (chunks.length === 0) return resolve(null)
      resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }))
    }
  })
  recorder.start(250)
  return { stop: () => (recorder.state !== 'inactive' ? (recorder.stop(), done) : done) }
}
