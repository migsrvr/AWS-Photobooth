import axios from 'axios'

function apiBaseUrl() {
  // Tolerant parsing: accepts bare domains ("host.up.railway.app"),
  // with or without scheme and /api suffix.
  let base = (import.meta.env.VITE_API_URL || '/api').trim();
  if (base.startsWith('/')) return base;
  if (!/^https?:\/\//i.test(base)) base = 'https://' + base.replace(/^\/+/, '');
  if (!/\/api\/?$/i.test(base)) base = base.replace(/\/+$/, '') + '/api';
  return base;
}

const api = axios.create({
  // Local dev: relative /api via the Vite proxy. Production (Vercel):
  // set VITE_API_URL to the backend host, e.g. https://xxx.up.railway.app/api
  baseURL: apiBaseUrl(),
  timeout: 10000,
})

export async function uploadPhotos(photos) {
  const formData = new FormData()
  photos.forEach((photo, i) => {
    formData.append(`photo_${i}`, photo)
  })
  const { data } = await api.post('/photos/upload', formData)
  return data
}

export async function getPhotos(sessionId) {
  const { data } = await api.get(`/photos/${sessionId}`)
  return data
}

export async function triggerPrint(sessionId) {
  const { data } = await api.post(`/print/${sessionId}`)
  return data
}

export async function sendEmail(sessionId, email) {
  const { data } = await api.post('/email/send', { sessionId, email })
  return data
}

export async function healthCheck() {
  const { data } = await api.get('/health')
  return data
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:(.*);base64/)[1]
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  return new Blob([bytes], { type: mime })
}

/** Uploads one captured photo + optional clip + survey answers.
 *  Returns { session_id, download_url, share_url }.
 *  Throws Error('no-photo') when there is no captured photo to send. */
export async function uploadSession(photoDataUrl, answers, videoBlob = null, opts = {}) {
  if (!photoDataUrl) {
    throw new Error('no-photo')
  }
  const { template = 'orgfest', bw = false } = opts
  const formData = new FormData()
  formData.append('photo', dataUrlToBlob(photoDataUrl), 'photo.jpg')
  if (videoBlob) {
    formData.append('video', videoBlob, 'clip.webm')
  }
  formData.append('answers', JSON.stringify(answers))
  formData.append('template', template)
  formData.append('bw', bw ? 'true' : 'false')
  // Photo+clip uploads can exceed the default 10s on slow venue networks.
  const { data } = await api.post('/photos/upload', formData, { timeout: 30000 })
  return data
}

export default api
