export default function CameraFeed({ setVideoEl, isReady, shotIndex }) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden
                    bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10">
      <video
        ref={setVideoEl}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 scale-x-[-1] ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />
      {!isReady && (
        <div className="text-white/30 text-center z-10">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-2"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <p className="font-ui text-xs font-semibold tracking-widest uppercase">Camera Feed</p>
          <p className="font-ui text-[10px] text-white/15 mt-1 tracking-wider">Frame {shotIndex + 1} of 4</p>
        </div>
      )}
    </div>
  )
}
