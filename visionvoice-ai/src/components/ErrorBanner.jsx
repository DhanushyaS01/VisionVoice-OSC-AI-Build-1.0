import { AlertCircle } from 'lucide-react'

// Small non-blocking notice. `variant` = 'error' | 'info'
export default function ErrorBanner({ message, variant = 'error' }) {
  if (!message) return null
  const styles = variant === 'info'
    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
    : 'bg-red-500/10 border-red-500/20 text-red-300'
  return (
    <div className={`flex items-start gap-2 border rounded-2xl px-4 py-3 text-sm ${styles}`} role="alert">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}
