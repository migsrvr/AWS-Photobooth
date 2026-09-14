import axios from 'axios'

const api = axios.create({
  // Local dev: relative /api via the Vite proxy. Production (Vercel):
  // set VITE_API_URL to the backend host, e.g. https://xxx.up.railway.app/api
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
 *  Returns { session_id, download_url, share_url }. */
export async function uploadSession(photoDataUrl, answers, videoBlob = null) {
  const formData = new FormData()
  formData.append('photo', dataUrlToBlob(photoDataUrl), 'photo.jpg')
  if (videoBlob) {
    formData.append('video', videoBlob, 'clip.webm')
  }
  formData.append('answers', JSON.stringify(answers))
  const { data } = await api.post('/photos/upload', formData)
  return data
}

export default api
