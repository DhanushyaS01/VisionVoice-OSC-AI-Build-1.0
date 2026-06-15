import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Mic } from 'lucide-react'

export default function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding')
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="screen-container items-center justify-center bg-gradient-to-b from-surface-950 via-primary-950 to-surface-950 animate-fade-in">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl scale-150 animate-ping-slow" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-primary-400 to-primary-700 rounded-[2rem] flex items-center justify-center shadow-glow animate-float">
            <div className="relative">
              <Eye className="w-12 h-12 text-white" strokeWidth={1.5} />
              <Mic className="w-5 h-5 text-accent-300 absolute -bottom-1 -right-2" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-gradient">VisionVoice</span>
            <span className="text-white"> AI</span>
          </h1>
          <p className="text-surface-400 text-lg mt-2 font-medium">See the World Through AI</p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-12 text-center">
        <p className="text-surface-600 text-xs">Powered by AI for Accessibility</p>
      </div>
    </div>
  )
}
