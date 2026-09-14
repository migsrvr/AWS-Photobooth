import { useState } from 'react'
import { uploadSession } from '../services/api'

const YES_NO = ['Yes', 'No']

const QUESTIONS = [
  { text: 'What year are you?', options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  { text: 'Do you know anything about AWS Student Builder Group - JRU?', options: YES_NO },
  { text: 'Are you interested in joining AWS Student Builder Group - JRU?', options: YES_NO },
  { text: 'Did you have fun with the AWS SBG - JRU Photobooth?', options: YES_NO },
  { text: 'Can you follow us on our social media accounts?', options: YES_NO },
  { text: 'Will you recommend AWS SBG - JRU to your friends?', options: YES_NO },
]

function AnswerButtons({ value, onChange, options }) {
  const pill = (selected) =>
    `min-w-[100px] px-5 h-[34px] rounded-[4px] font-primary font-medium text-[15px] transition-all duration-200
     ${selected
        ? 'bg-[#4a3017] text-white border-2 border-[#4a3017]'
        : 'bg-[rgba(189,148,108,0.6)] text-[#1e1e1e] border-2 border-transparent hover:border-[#4a3017]'}`

  return (
    <div className="flex flex-wrap gap-3 mt-1.5">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)} className={pill(value === opt)}>
          {opt}
        </button>
      ))}
    </div>
  )
}

/**
 * Survey gate for the QR download. Matches frame 82:520: dim + blurred
 * overlay, card (#7e6851) with inner panel (#e6d3bf), questions, consent
 * checkbox, Submit. On submit it uploads the photo + answers and hands
 * { download_url, session_id } to onDone (the QR page shows the code).
 */
export default function SurveyModal({ isOpen, photo, videoBlob, onClose, onDone }) {
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null))
  const [consent, setConsent] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  if (!isOpen) return null

  const complete = answers.every((a) => a !== null) && consent

  const reset = () => {
    setAnswers(Array(QUESTIONS.length).fill(null))
    setConsent(false)
    setUploading(false)
    setUploadError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!complete || uploading) return
    setUploading(true)
    setUploadError(null)
    try {
      const payload = Object.fromEntries(
        QUESTIONS.map((q, i) => [`q${i + 1}`, answers[i]]),
      )
      payload.consent = true
      const { download_url, session_id, share_url } = await uploadSession(photo, payload, videoBlob)
      const result = { downloadUrl: download_url, sessionId: session_id, shareUrl: share_url }
      reset()
      onDone(result)
    } catch (err) {
      if (err?.message === 'no-photo') {
        setUploadError('No photo was captured — retake with the camera on, then try again.')
      } else if (err?.code === 'ECONNABORTED') {
        setUploadError('Upload timed out — the connection is slow. Try again.')
      } else {
        setUploadError('Upload failed — check the connection and try again.')
      }
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div
        data-testid="survey-modal"
        className="relative w-full max-w-[960px] max-h-[94vh] overflow-hidden rounded-[10px] bg-[#7e6851] p-9"
      >
        <h3 className="font-display text-white text-[54px] leading-none tracking-[1.35px] mb-4">
          QUICK SURVEY
        </h3>
            <div className="rounded-[7px] bg-[#e6d3bf] px-9 py-6">
              <ol className="list-decimal ms-[24px] space-y-5">
                {QUESTIONS.map((q, i) => (
                  <li key={q.text} className="font-primary font-medium text-[#1e1e1e] text-[19px]">
                    <span>{q.text}</span>
                    <AnswerButtons
                      value={answers[i]}
                      options={q.options}
                      onChange={(v) =>
                        setAnswers((prev) => prev.map((a, j) => (j === i ? v : a)))
                      }
                    />
                  </li>
                ))}
              </ol>

              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-7 h-7 shrink-0 accent-[#4a3017]"
                />
                <span className="font-primary italic text-[#1e1e1e] text-sm">
                  I give my consent to AWS SBG - JRU to use my data for academic purposes.
                </span>
              </label>

              {uploadError && (
                <p data-testid="upload-error" className="text-[#932426] text-base font-medium mt-4">
                  {uploadError}
                </p>
              )}

              <div className="flex justify-center mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!complete || uploading}
                  className="w-[260px] h-[56px] rounded-[5px] bg-[rgba(189,148,108,0.6)]
                             font-primary font-medium text-[#1e1e1e] text-xl
                             disabled:opacity-40 disabled:cursor-not-allowed
                             enabled:hover:bg-[#4a3017] enabled:hover:text-white
                             transition-all duration-300"
                >
                  {uploading ? 'Uploading…' : 'Submit'}
                </button>
              </div>
            </div>
      </div>
    </div>
  )
}
