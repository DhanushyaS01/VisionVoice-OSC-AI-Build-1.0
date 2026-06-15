import { Brain } from 'lucide-react'

export default function LoadingState({ message = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12" role="status" aria-live="polite">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-surface-700 rounded-full" />
        <div className="absolute inset-0 w-20 h-20 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-8 h-8 text-primary-400 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-semibold">{message}</p>
        <p className="text-surface-500 text-sm mt-1">AI is analyzing...</p>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
