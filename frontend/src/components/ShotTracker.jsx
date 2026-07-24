export default function ShotTracker({ currentShot, totalShots = 4 }) {
  return (
    <div className="flex gap-3 items-center">
      {Array.from({ length: totalShots }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full transition-all duration-300 ${
            i < currentShot
              ? 'bg-gradient-to-b from-[#fafe00] to-[#ffb700] shadow-[0_0_10px_rgba(255,183,0,0.6)]'
              : i === currentShot
              ? 'bg-gradient-to-b from-[#fafe00] to-[#ffb700] animate-[dot_pulse_1.5s_ease-in-out_infinite]'
              : 'bg-transparent border-2 border-[#b9d2df]/40'
          }`}
        />
      ))}
    </div>
  )
}
