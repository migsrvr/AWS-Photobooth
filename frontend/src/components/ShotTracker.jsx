export default function ShotTracker({ currentShot, totalShots = 4 }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: totalShots }).map((_, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <div
              className={`w-6 h-[2px] transition-colors duration-300 ${
                i <= currentShot ? 'bg-gradient-to-r from-[#fafe00] to-[#ffb700]' : 'bg-white/10'
              }`}
            />
          )}
          <div
            className={`w-3 h-3 transition-all duration-300 ${
              i < currentShot
                ? 'bg-gradient-to-b from-[#fafe00] to-[#ffb700] rounded-full shadow-[0_0_8px_rgba(255,183,0,0.5)]'
                : i === currentShot
                ? 'bg-gradient-to-b from-[#fafe00] to-[#ffb700] rounded-full animate-pulse-dot shadow-[0_0_12px_rgba(255,183,0,0.4)]'
                : 'rounded-full border-2 border-white/15 bg-transparent'
            }`}
          />
        </div>
      ))}
    </div>
  )
}