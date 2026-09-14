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

/**
 * Records a MIRRORED clip: draws the stream flipped onto a canvas and
 * records the canvas. The saved file matches what the user saw in the
 * (mirrored) live preview. Tracks stay owned by the caller.
 * Returns { stop } — stop() resolves with the Blob (or null).
 */
export function startMirroredRecording(stream, { fps = 30 } = {}) {
  if (!stream || typeof MediaRecorder === 'undefined'
      || typeof document === 'undefined' || !document.createElement('canvas').captureStream) {
    return { stop: async () => null }
  }
  const track = stream.getVideoTracks()[0]
  const settings = track?.getSettings() ?? {}
  const width = settings.width || 1280
  const height = settings.height || 720

  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.srcObject = stream
  const playing = video.play().catch(() => null)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  let raf = 0
  let running = true
  const draw = () => {
    if (!running) return
    if (video.readyState >= 2) {
      ctx.save()
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, width, height)
      ctx.restore()
    }
    raf = requestAnimationFrame(draw)
  }

  const canvasStream = canvas.captureStream(fps)
  // keep audio (if any) on the recording
  stream.getAudioTracks().forEach((t) => canvasStream.addTrack(t))

  const chunks = []
  const mimeType = pickMimeType()
  const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : undefined)
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }
  const done = new Promise((resolve) => {
    recorder.onstop = () => {
      if (chunks.length === 0) return resolve(null)
      resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }))
    }
  })

  const stop = async () => {
    running = false
    cancelAnimationFrame(raf)
    await playing
    video.pause()
    video.srcObject = null
    if (recorder.state !== 'inactive') recorder.stop()
    return done
  }

  recorder.start(250)
  draw()
  return { stop }
}
