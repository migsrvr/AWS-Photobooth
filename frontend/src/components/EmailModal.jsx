import { useState } from 'react'

export default function EmailModal({ isOpen, onClose, onSend }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    onSend?.(email)
    setSent(true)
  }

  const handleClose = () => {
    setEmail('')
    setSent(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="glass-panel p-8 w-full max-w-md mx-4
                      shadow-[0_28px_90px_rgba(0,38,87,0.18)]">
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-[border_glow_3s_ease-in-out_infinite]">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl text-white font-medium mb-2">Sent!</h3>
            <p className="text-white/50 mb-6">
              Your photos will arrive at {email}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-xl bg-gradient-to-b from-[#ff8400] to-[#fbb515] text-white font-medium
                         hover:from-[#fbb515] hover:to-[#ff8400] transition-all duration-300 shadow-lg shadow-[#ff6f08]/30"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl text-white font-medium mb-2">Get Digital Copy</h3>
            <p className="text-white/50 text-sm mb-6">
              Enter your email to receive your photos
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20
                           text-white placeholder:text-white/30
                           focus:outline-none focus:border-[#fafe00]/50 mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 rounded-xl bg-transparent border border-white/20
                             text-white hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-b from-[#ff8400] to-[#fbb515] text-white font-medium
                             hover:from-[#fbb515] hover:to-[#ff8400] transition-all duration-300 shadow-lg shadow-[#ff6f08]/30"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
