const store = new Map()

const PHOTO_TTL_MS = 10 * 60 * 1000

function startExpiryTimer(id) {
  setTimeout(() => {
    store.delete(id)
  }, PHOTO_TTL_MS)
}

export const setPhotos = (id, photos) => {
  store.set(id, photos)
  startExpiryTimer(id)
}

export const getPhotos = (id) => store.get(id) || null

export const generateId = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase()
