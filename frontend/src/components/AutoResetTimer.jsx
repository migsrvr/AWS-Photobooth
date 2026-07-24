import { useEffect } from 'react'

export default function AutoResetTimer({ seconds, onReset }) {
  useEffect(() => {
    if (seconds <= 0) {
      onReset?.()
    }
  }, [seconds, onReset])

  if (seconds <= 0) return null

  return (
    <p className="text-[#b9d2df] text-sm">
      Returning to home in{' '}
      <span className="text-[#fafe00] font-mono">{seconds}s</span>
    </p>
  )
}
