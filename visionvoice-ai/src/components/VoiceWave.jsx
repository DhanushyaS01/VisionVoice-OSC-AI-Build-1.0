export default function VoiceWave({ active, bars = 7 }) {
  return (
    <div
      className="flex items-center gap-1 justify-center"
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${
            active ? 'bg-primary-400' : 'bg-surface-700'
          }`}
          style={{
            height: active ? `${12 + Math.sin(i * 0.8) * 16}px` : '8px',
            animation: active ? `wave ${0.8 + i * 0.1}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  )
}
