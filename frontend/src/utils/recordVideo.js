/**
 * Records a MediaStream to a video Blob using MediaRecorder.
 * Returns { stop } — stop() resolves with the Blob (or null when
 * recording never started / produced no data).
 */
export function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return undefined
  // Pure MP4 pipeline: prefer MP4 capture so booth, storage, and download
  // are all MP4 with no conversion. The settle window in
  // startMirroredRecording keeps warm-up frames out of the clip.
  // WebM stays as fallback for browsers without MP4 recording — the
  // server transcodes legacy WebM → MP4 on download (see
  // backend/app/services/transcode.py).
  const candidates = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
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
 * The encoder starts only after a settle window past the first real
 * frame, so camera warm-up frames (upside-down / exposure-ramping on
 * some drivers) never make it into the clip. `onstarted` fires exactly
 * once when setup settles (recording or given up) so callers can gate
 * timed UX (e.g. countdown) on actual capture. Returns { stop } — stop()
 * resolves with the Blob (or null when nothing was recorded).
 */
export function startMirroredRecording(stream, { fps = 24, maxWidth = 960, videoBitsPerSecond = 1000000, settleMs = 2000, onstarted } = {}) {
  if (!stream || typeof MediaRecorder === 'undefined'
      || typeof document === 'undefined' || !document.createElement('canvas').captureStream) {
    return { stop: async () => null }
  }
  const track = stream.getVideoTracks()[0]
  const settings = track?.getSettings() ?? {}
  let width = settings.width || 1280
  let height = settings.height || 720
  // Cap capture resolution so clips stay small enough for Supabase free tier
  // (~0.7MB for a 6s countdown clip). Preserves aspect ratio.
  const scale = Math.min(1, maxWidth / Math.max(width, height))
  if (scale < 1) {
    width = Math.round((width * scale) / 2) * 2
    height = Math.round((height * scale) / 2) * 2
  }

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
  const paintFrame = () => {
    if (video.readyState < 2) return false
    ctx.save()
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, width, height)
    ctx.restore()
    return true
  }
  const draw = () => {
    if (!running) return
    paintFrame()
    raf = requestAnimationFrame(draw)
  }

  const canvasStream = canvas.captureStream(fps)
  // keep audio (if any) on the recording
  stream.getAudioTracks().forEach((t) => canvasStream.addTrack(t))

  const chunks = []
  const mimeType = pickMimeType()
  const recorderOptions = {}
  if (mimeType) recorderOptions.mimeType = mimeType
  // Cap bitrate: 1 Mbps keeps a ~6s clip under ~1MB for Supabase.
  if (videoBitsPerSecond) recorderOptions.videoBitsPerSecond = videoBitsPerSecond
  let recorder
  try {
    recorder = new MediaRecorder(canvasStream, recorderOptions)
  } catch {
    recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : undefined)
  }
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  }
  const done = new Promise((resolve) => {
    recorder.onstop = () => {
      if (chunks.length === 0) return resolve(null)
      resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }))
    }
  })

  // Start the encoder only after the hidden video is serving real frames
  // plus a settle window: otherwise warm-up frames (blank, or upside-down
  // on some drivers) open the clip and playback starts glitched until a
  // later keyframe "fixes" it. Waits are capped so a stuck camera can't
  // hang the countdown. stop() before start resolves null (no hang).
  let started = false
  let encodeStart = 0
  const begin = (async () => {
    try {
      await playing
      const firstDeadline = performance.now() + 1500
      while (running && video.readyState < 2 && performance.now() < firstDeadline) {
        await new Promise((r) => requestAnimationFrame(r))
      }
      if (!running || video.readyState < 2) return
      paintFrame()
      const settleUntil = performance.now() + settleMs
      while (running && performance.now() < settleUntil) {
        await new Promise((r) => setTimeout(r, 100))
      }
      if (!running || video.readyState < 2) return
      paintFrame()
    if (!running || recorder.state !== 'inactive') return
    encodeStart = performance.now()
    recorder.start(250)
    started = true
    draw()
    } finally {
      onstarted?.()
    }
  })()
  // Page may navigate mid-wait; never let that surface as unhandled.
  begin.catch(() => null)

  const stop = async () => {
    running = false
    cancelAnimationFrame(raf)
    await playing
    video.pause()
    video.srcObject = null
    if (!started || recorder.state === 'inactive') return null
    recorder.stop()
    const blob = await done
    // On-device proof of capture span: countdown ticks only run between
    // encoder start and this stop, so span must cover the full 5s.
    console.info(
      `[capture] clip span ${((performance.now() - encodeStart) / 1000).toFixed(2)}s, ` +
      `${chunks.length} chunks, ${blob ? blob.size : 0} bytes`
    )
    return blob
  }

  return { stop }
}
