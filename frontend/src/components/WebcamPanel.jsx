import { useEffect, useRef } from 'react'
import useWebcam from '../hooks/useWebcam'
import iconCamera from '../assets/icon-camera.svg'

/**
 * Kiosk viewfinder panel. Shows the live mirrored webcam feed when
 * available, otherwise the Figma placeholder (gray + camera icon).
 * Never blocks: children stay interactive in every state.
 */
export default function WebcamPanel({ className = '', videoRef: externalRef, stream: externalStream, status: externalStatus }) {
  const hasExternal = externalStream !== undefined || externalStatus !== undefined
  const internal = useWebcam(!hasExternal)
  const stream = externalStream ?? internal.stream
  const status = externalStatus ?? internal.status
  const innerRef = useRef(null)
  const videoRef = externalRef ?? innerRef

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream ])

  return (
    <div
      data-testid="webcam-panel"
      data-status={status}
      className={`overflow-hidden rounded-[10px] bg-[#d9d9d9] ${className}`}
    >
      {status === 'live' && (
        <video
          ref={videoRef}
          data-testid="webcam-video"
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
      )}

      {status === 'requesting' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            data-testid="webcam-loading"
            className="w-12 h-12 rounded-full border-4 border-[#1e376c]/20 border-t-[#1e376c] animate-spin"
          />
        </div>
      )}

      {(status === 'idle' || status === 'error') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <img src={iconCamera} alt="" aria-hidden="true" className="w-[106px] h-[103px]" />
          {status === 'error' && (
            <p data-testid="webcam-fallback" className="text-[#1e376c] text-sm font-medium px-6 text-center">
              Camera unavailable — you can still continue.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
