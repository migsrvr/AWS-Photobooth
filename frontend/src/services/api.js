import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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

export default api
