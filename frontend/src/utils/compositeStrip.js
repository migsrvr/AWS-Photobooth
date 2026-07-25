export function compositeStrip(photos, layout = 'vertical') {
  return new Promise((resolve) => {
    if (!photos || photos.length === 0) return resolve(null)

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const padding = 10
    const gap = 6

    const cellW = layout === 'vertical' ? 360 : 340
    const cellH = layout === 'vertical' ? 260 : 460
    const cols = layout === 'vertical' ? 1 : 2
    const rows = layout === 'vertical' ? 4 : 2
    canvas.width = cellW * cols + gap * (cols - 1) + padding * 2
    canvas.height = cellH * rows + gap * (rows - 1) + padding * 2

    ctx.fillStyle = '#1c3466'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.arcTo(x + w, y, x + w, y + r, r)
      ctx.lineTo(x + w, y + h - r)
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx.lineTo(x + r, y + h)
      ctx.arcTo(x, y + h, x, y + h - r, r)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
    }

    let loaded = 0
    const valid = photos.filter(Boolean)
    const total = valid.length
    if (total === 0) return resolve(null)

    const positions = photos.map((src, i) => {
      const col = layout === 'vertical' ? 0 : i % cols
      const row = layout === 'vertical' ? i : Math.floor(i / cols)
      return { x: padding + col * (cellW + gap), y: padding + row * (cellH + gap), src }
    })

    positions.forEach((pos, i) => {
      if (!pos.src) { loaded++; return }
      const img = new Image()
      img.onload = () => {
        ctx.save()
        roundRect(ctx, pos.x, pos.y, cellW, cellH, 8)
        ctx.clip()
        const scale = Math.max(cellW / img.width, cellH / img.height)
        const sw = img.width * scale
        const sh = img.height * scale
        ctx.drawImage(img, pos.x + (cellW - sw) / 2, pos.y + (cellH - sh) / 2, sw, sh)
        ctx.restore()
        loaded++
        if (loaded === total) resolve(canvas.toDataURL('image/jpeg', 0.92))
      }
      img.onerror = () => { loaded++; if (loaded === total) resolve(canvas.toDataURL('image/jpeg', 0.92)) }
      img.src = pos.src
    })
  })
}

export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
