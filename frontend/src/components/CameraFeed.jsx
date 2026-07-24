export default function CameraFeed({ shotIndex }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden
                    bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10">
      <div className="text-white/40 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mx-auto mb-2"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <p className="text-sm">Camera Feed</p>
        <p className="text-xs text-white/20 mt-1">Shot {shotIndex + 1} of 4</p>
      </div>
    </div>
  )
}
