import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SurveyModal from '../components/SurveyModal'
import QrResultModal from '../components/QrResultModal'
import composeNewspaper, { SLOTS as TEMPLATE_SLOTS, availableTemplates } from '../utils/composeNewspaper'
import startBg from '../assets/start-bg.webp'
import awsLogo from '../assets/aws-logo.webp'
import mascotPreview from '../assets/mascot-preview.webp'
import photoFrame from '../assets/photo-frame.webp'
import iconImageBlack from '../assets/icon-image-black.svg'

const glassButton =
  'w-[371px] max-w-full h-[59px] rounded-[5px] border-2 border-[#4a3017] ' +
  'bg-[rgba(237,244,255,0.5)] font-primary font-semibold text-[25px] text-[#4a3017] ' +
  'transition-transform duration-300 hover:scale-105'

const TEMPLATES = [
  { id: 'orgfest', label: 'Template 1', subtitle: 'ORGFEST' },
  { id: 'alt', label: 'Template 2', subtitle: 'CLASSIC' },
]

export default function PreviewPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const rawPhoto = state?.rawPhoto ?? null
  const initialPhoto = state?.photo ?? null
  const videoBlob = state?.videoBlob ?? null

  // template chooser + B&W — this carries to the final output (what you see is what you get)
  const [template, setTemplate] = useState('orgfest')
  const [bw, setBw] = useState(false)
  const [surveyOpen, setSurveyOpen] = useState(false)
  const [qr, setQr] = useState(null)
  const [preview, setPreview] = useState(initialPhoto)
  const [composing, setComposing] = useState(false)

  // Derive preview from rawPhoto when possible so template/bw are live.
  // Falls back to initialPhoto (already composited) when rawPhoto missing (e.g. deep link).
  const source = rawPhoto ?? null
  useEffect(() => {
    let cancelled = false
    if (!source) {
      // No raw to re-compose: use the capture-time composited photo as-is.
      // For B&W without raw, we do CSS grayscale on the <img> instead (see render).
      setPreview(initialPhoto)
      return undefined
    }
    setComposing(true)
    composeNewspaper(source, { template, bw, quality: 0.82 })
      .then((url) => {
        if (!cancelled) setPreview(url)
      })
      .catch(() => {
        if (!cancelled) setPreview(initialPhoto)
      })
      .finally(() => {
        if (!cancelled) setComposing(false)
      })
    return () => { cancelled = true }
  }, [source, template, bw, initialPhoto])

  // For CSS fallback when no rawPhoto but B&W toggled.
  const previewIsRecomposed = !!source
  const cssGrayscale = !previewIsRecomposed && bw ? 'grayscale' : ''

  const canChoose = !!initialPhoto || !!rawPhoto

  const handleSurveyDone = ({ downloadUrl, sessionId, shareUrl }) => {
    setSurveyOpen(false)
    setQr({ downloadUrl, sessionId, shareUrl })
  }

  const handleQrClose = () => {
    setQr(null)
    navigate('/thank-you')
  }

  const selectedLabel = useMemo(() => TEMPLATES.find((t) => t.id === template)?.label ?? 'Template 1', [template])

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f0dfce]">
      <img
        src={startBg}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none"
      />

      <img
        src={mascotPreview}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute right-16 -bottom-10 z-10 w-[320px] object-contain pointer-events-none -scale-x-100"
      />

      <main className="relative z-10 h-full flex items-center justify-center gap-12 px-16">
        {/* Left stack: preview + template chooser + B&W below it (so right texts not disrupted) */}
        <div className="flex flex-col items-center shrink-0 gap-3">
          <div className="h-[min(725px,82vh)] aspect-[585/725] relative rounded-[7px]
                          border-[3px] border-[#4a3017] bg-[rgba(189,148,108,0.6)] p-3">
            <div className="relative w-full h-full rounded-[4px] overflow-hidden bg-[#d9d9d9]">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Your front page"
                    className={`absolute inset-0 w-full h-full object-cover ${cssGrayscale}`}
                    style={!previewIsRecomposed && bw ? { filter: 'grayscale(1)' } : undefined}
                  />
                  {composing && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                      <p className="bg-white/90 text-[#4a3017] text-sm font-medium px-3 py-1.5 rounded-full">Updating…</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <img
                    src={availableTemplates().find((t) => t.id === template)?.frame || photoFrame}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute flex flex-col items-center justify-center gap-2"
                    style={(() => {
                      const s = TEMPLATE_SLOTS[template] || TEMPLATE_SLOTS.orgfest
                      return {
                        left: `${s.left * 100}%`,
                        top: `${s.top * 100}%`,
                        right: `${(1 - s.right) * 100}%`,
                        bottom: `${(1 - s.bottom) * 100}%`,
                      }
                    })()}
                  >
                    <img src={iconImageBlack} alt="" aria-hidden="true" className="w-10 h-10" />
                    <p className="text-[#1e1e1e]/60 text-sm font-medium">No photo yet</p>
                  </div>
                </>
              )}
            </div>
            {preview && (
              <p className="absolute -bottom-6 left-0 right-0 text-center font-primary text-[11px] tracking-[0.8px] text-[#4a3017]/70">
                {selectedLabel} {bw ? '· Black & White' : '· Color'}
              </p>
            )}
          </div>

          {/* Template + B&W controls sit below the image, not in the right text column */}
          <div className="w-[min(585px,44vw)] max-w-[585px]">
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((t) => {
                const active = template === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={!canChoose}
                    onClick={() => setTemplate(t.id)}
                    className={`h-[44px] rounded-[5px] border-2 font-primary font-semibold text-[14px] tracking-[0.6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed
                      ${active ? 'bg-[#4a3017] text-white border-[#4a3017]' : 'bg-white/70 text-[#4a3017] border-[#4a3017]/30 hover:border-[#4a3017]'}`}
                  >
                    {t.label.toUpperCase()} <span className="font-normal opacity-70">· {t.subtitle}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-[7px] border border-[#4a3017]/20 bg-white/60 px-4 py-3">
              <div>
                <p className="font-primary font-semibold text-[#1e1e1e] text-[14px] leading-none">Black & White</p>
                <p className="font-primary text-[#1e1e1e]/70 text-xs mt-1">Grayscale the photo</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={bw}
                aria-label="Black and white"
                disabled={!canChoose}
                onClick={() => setBw((v) => !v)}
                className={`relative inline-flex h-[34px] w-[62px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 disabled:opacity-50
                  ${bw ? 'bg-[#4a3017] border-[#4a3017]' : 'bg-[rgba(189,148,108,0.4)] border-[#4a3017]/30'}`}
              >
                <span className={`inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow transition-transform duration-200 ${bw ? 'translate-x-[30px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-[600px] shrink-0">
          <header className="flex items-center gap-4 mb-6 pointer-events-none">
            <img
              src={awsLogo}
              alt="AWS Student Builder Group - JRU logo"
              loading="lazy"
              decoding="async"
              className="w-16 h-16 object-contain"
            />
            <div className="text-center">
              <p className="font-display text-[#1e1e1e] text-[22px] leading-tight tracking-[1.1px]">
                AWS STUDENT BUILDER GROUP - JRU
              </p>
              <p className="font-display text-[#1e1e1e] text-xl leading-tight tracking-[1px]">
                PHOTOBOOTH
              </p>
            </div>
          </header>

          <h1 className="font-display text-[#1e1e1e] text-[50px] leading-none tracking-[1.5px] text-center whitespace-nowrap">
            THE STORY’S NOT OVER YET!
          </h1>
          <p className="font-primary font-medium italic text-[#1e1e1e] text-xl text-center mt-3 whitespace-nowrap">
            Happy with the shot, or want to make another headline?
          </p>

          <p className="font-primary font-semibold italic text-[#1e1e1e] text-lg mt-8">
            Not your best angle?
          </p>
          <button onClick={() => navigate('/capture')} className={`${glassButton} mt-2`}>
            Retake
          </button>

          <p className="font-primary font-semibold italic text-[#1e1e1e] text-lg mt-6">
            Ready to keep these memories? Scan here.
          </p>
          <button onClick={() => setSurveyOpen(true)} className={`${glassButton} mt-2`} disabled={!preview}>
            QR Code
          </button>

          <div className="mt-8">
            <p className="font-display text-[#1e1e1e] text-lg">FOLLOW US:</p>
            <div className="font-primary text-[#1e1e1e] text-lg mt-1 space-y-0.5">
              <p>fb: @AWSSBG.JRU</p>
              <p>ig: @aws.sbg_jru</p>
              <p>tiktok: @aws.sbg_jru</p>
              <p>linkedin: AWS Student Builder Group - JRU</p>
            </div>
          </div>
        </div>
      </main>

      <SurveyModal
        isOpen={surveyOpen}
        photo={preview}
        videoBlob={videoBlob}
        template={template}
        bw={bw}
        onClose={() => setSurveyOpen(false)}
        onDone={handleSurveyDone}
      />
      <QrResultModal
        isOpen={qr !== null}
        shareUrl={qr?.shareUrl}
        sessionId={qr?.sessionId}
        onClose={handleQrClose}
      />
    </div>
  )
}
